#!/usr/bin/env node
/**
 * Syncs the Skill taxonomy in this brain from live Skill Deck production data.
 *
 * Source of truth is the Skill Deck MCP server's `list_attributes` tool, which
 * reads the database. Seeder files in the application repo are NOT authoritative:
 * Skills can be disabled through the Filament admin panel without touching them.
 *
 *   SKILLDECK_MCP_TOKEN=... node scripts/sync-skills.mjs
 *   SKILLDECK_MCP_TOKEN=... node scripts/sync-skills.mjs --check
 *
 * `--check` writes nothing and exits non-zero when the committed docs no longer
 * match production, so it can run in CI.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = join(ROOT, 'data', 'skill-taxonomy.json');
const PAGE_PATH = join(ROOT, 'product', 'skills-and-levels.mdx');

const BEGIN = '{/* BEGIN GENERATED: skill-taxonomy */}';
const END = '{/* END GENERATED: skill-taxonomy */}';
const SCALE_BEGIN = '{/* BEGIN GENERATED: example-scale */}';
const SCALE_END = '{/* END GENERATED: example-scale */}';

const MCP_URL = process.env.SKILLDECK_MCP_URL ?? 'https://skilldeck.ai/mcp/skilldeck';
const TOKEN = process.env.SKILLDECK_MCP_TOKEN;
const CHECK_ONLY = process.argv.includes('--check');

/** The Skill whose scale is quoted on the page, and the levels shown. */
const EXAMPLE_SKILL = process.env.SKILLDECK_EXAMPLE_SKILL ?? 'Storytelling';
const EXAMPLE_LEVELS = [0, 8, 9, 15, 20];
const SCALE_JSON_PATH = (skill) =>
  join(ROOT, 'data', `skill-scale-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);

const CATEGORY_ICONS = {
  'Communication': 'message-circle',
  'Creativity': 'lightbulb',
  'Critical Thinking': 'brain',
  'Emotional Intelligence': 'heart',
  'Flexibility': 'shield',
  'Interpersonal Relations': 'users',
  'Leadership': 'compass',
  'Productivity': 'zap',
};
const FALLBACK_ICON = 'layers';

function die(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/** Minimal MCP streamable-HTTP client. Enough for read-only tool calls. */
async function callMcp(toolName, args = {}) {
  if (!TOKEN) {
    die(
      'SKILLDECK_MCP_TOKEN is not set.\n' +
        '  Generate a token at Settings -> API tokens in Skill Deck, then:\n' +
        '    export SKILLDECK_MCP_TOKEN="<token>"\n' +
        '  Never commit the token.'
    );
  }

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };

  const post = async (body) => {
    const response = await fetch(MCP_URL, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!response.ok) {
      die(`MCP request failed: ${response.status} ${response.statusText}`);
    }
    const sessionId = response.headers.get('mcp-session-id');
    if (sessionId) {
      headers['Mcp-Session-Id'] = sessionId;
    }
    const raw = await response.text();
    if (!raw.trim()) return null;
    // The server may answer as JSON or as a single server-sent event.
    const payload = raw.trimStart().startsWith('event:') || raw.trimStart().startsWith('data:')
      ? raw.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n')
      : raw;
    return JSON.parse(payload);
  };

  await post({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'skilldeck-brain-sync', version: '1.0.0' },
    },
  });
  await post({ jsonrpc: '2.0', method: 'notifications/initialized' });

  const result = await post({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  });

  if (result?.error) die(`MCP error: ${result.error.message ?? JSON.stringify(result.error)}`);
  if (result?.result?.isError) die(`Tool "${toolName}" returned an error.`);

  const text = (result?.result?.content ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n');

  if (!text.trim()) die(`Tool "${toolName}" returned no text content.`);
  return text;
}

/** Parses the markdown `list_attributes` returns into structured categories. */
function parseTaxonomy(markdown) {
  const categories = [];
  let current = null;
  let expectDescription = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      current = { name: trimmed.slice(3).trim(), description: '', skills: [] };
      categories.push(current);
      expectDescription = true;
      continue;
    }
    if (!current) continue;

    if (trimmed.startsWith('- ')) {
      const entry = trimmed.slice(2);
      const separator = entry.indexOf(':');
      const rawName = (separator === -1 ? entry : entry.slice(0, separator)).trim();
      const description = separator === -1 ? '' : entry.slice(separator + 1).trim();

      // Names arrive as "English (translation)" when the account language is not English.
      const translated = rawName.match(/^(.*?)\s*\(([^()]+)\)$/);
      current.skills.push({
        name: translated ? translated[1].trim() : rawName,
        translation: translated ? translated[2].trim() : null,
        description,
      });
      expectDescription = false;
      continue;
    }

    if (expectDescription && trimmed && trimmed !== 'Skills:') {
      current.description = trimmed;
      expectDescription = false;
    }
  }

  if (categories.length === 0) {
    die('Could not parse any categories. The `list_attributes` output format may have changed.');
  }
  return categories;
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Parses `get_attribute_scale` output. Each level arrives as
 * `**N/20**:` followed by `Title: behaviour. Example: Persona — "quote"`.
 * Levels are not returned in order.
 */
function parseScale(markdown) {
  const levels = [];
  for (const chunk of decodeEntities(markdown).split(/\n-{3,}\n/)) {
    const match = chunk.match(/\*\*(\d+)\/20\*\*:\s*\n([\s\S]+)/);
    if (!match) continue;
    const score = Number(match[1]);
    const body = match[2].trim().replace(/\s*\n\s*/g, ' ');
    const separator = body.indexOf(': ');
    levels.push({
      score,
      title: separator === -1 ? null : body.slice(0, separator).trim(),
      body: separator === -1 ? body : body.slice(separator + 2).trim(),
    });
  }
  return levels.sort((a, b) => a.score - b.score);
}

function renderScaleBlock(skill, levels, syncedAt) {
  const chosen = EXAMPLE_LEVELS.map((score) => levels.find((l) => l.score === score)).filter(Boolean);
  const rendered = chosen
    .map((level) => {
      const heading = level.title ? `${level.score}/20 — ${level.title}` : `${level.score}/20`;
      return [`  <Accordion title="${heading.replace(/"/g, '&quot;')}">`, `    ${level.body}`, '  </Accordion>'].join('\n');
    })
    .join('\n');

  return [
    SCALE_BEGIN,
    '',
    '{/* Generated from live production by scripts/sync-skills.mjs. Do not edit by hand. */}',
    '',
    `Selected levels from the **${skill}** scale, read from production on ${syncedAt}.`,
    '',
    '<AccordionGroup>',
    rendered,
    '</AccordionGroup>',
    '',
    SCALE_END,
  ].join('\n');
}

function summarise(categories) {
  const unique = new Map();
  for (const category of categories) {
    for (const skill of category.skills) {
      if (!unique.has(skill.name)) unique.set(skill.name, { ...skill, categories: [] });
      unique.get(skill.name).categories.push(category.name);
    }
  }
  const skills = [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  return {
    categoryCount: categories.length,
    skillCount: skills.length,
    listingCount: categories.reduce((n, c) => n + c.skills.length, 0),
    multiCategorySkills: skills.filter((s) => s.categories.length > 1).map((s) => s.name),
    skills,
  };
}

function renderBlock(categories, summary, syncedAt) {
  const cards = categories
    .map((category) => {
      const icon = CATEGORY_ICONS[category.name] ?? FALLBACK_ICON;
      const names = category.skills.map((s) => s.name).join(' · ');
      const count = category.skills.length;
      return [
        `  <Card title="${category.name}" icon="${icon}">`,
        `    **${count} Skills.** ${category.description}`,
        '',
        `    ${names}`,
        '  </Card>',
      ].join('\n');
    })
    .join('\n');

  return [
    BEGIN,
    '',
    `{/* Generated from live production by scripts/sync-skills.mjs. Do not edit by hand. */}`,
    '',
    `**${summary.skillCount} Skills** across **${summary.categoryCount} categories**, read from production on ${syncedAt}.`,
    '',
    '<Columns cols={2}>',
    cards,
    '</Columns>',
    '',
    END,
  ].join('\n');
}

function diff(previous, next) {
  if (!previous) return null;
  const before = new Map(previous.skills.map((s) => [s.name, s.categories.join(', ')]));
  const after = new Map(next.skills.map((s) => [s.name, s.categories.join(', ')]));

  const added = [...after.keys()].filter((n) => !before.has(n));
  const removed = [...before.keys()].filter((n) => !after.has(n));
  const recategorised = [...after.keys()]
    .filter((n) => before.has(n) && before.get(n) !== after.get(n))
    .map((n) => `${n}: ${before.get(n)} -> ${after.get(n)}`);

  return added.length || removed.length || recategorised.length
    ? { added, removed, recategorised }
    : null;
}

const markdown = await callMcp('list_attributes');
const categories = parseTaxonomy(markdown);
const summary = summarise(categories);
const syncedAt = new Date().toISOString().slice(0, 10);

const scaleMarkdown = await callMcp('get_attribute_scale', { attribute: EXAMPLE_SKILL });
const scaleLevels = parseScale(scaleMarkdown);
if (scaleLevels.length === 0) {
  die(`Could not parse the ${EXAMPLE_SKILL} scale. The \`get_attribute_scale\` output format may have changed.`);
}

let previous = null;
try {
  previous = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
} catch {
  // First run.
}

const payload = {
  source: 'Skill Deck MCP `list_attributes`',
  syncedAt,
  categoryCount: summary.categoryCount,
  skillCount: summary.skillCount,
  listingCount: summary.listingCount,
  categories,
  skills: summary.skills,
};

function replaceBlock(source, beginMarker, endMarker, replacement) {
  const start = source.indexOf(beginMarker);
  const end = source.indexOf(endMarker);
  if (start === -1 || end === -1) {
    die(`Could not find the generated markers in ${PAGE_PATH}.\n  Expected ${beginMarker} ... ${endMarker}`);
  }
  return source.slice(0, start) + replacement + source.slice(end + endMarker.length);
}

const page = readFileSync(PAGE_PATH, 'utf8');
let nextPage = replaceBlock(page, BEGIN, END, renderBlock(categories, summary, syncedAt));
nextPage = replaceBlock(nextPage, SCALE_BEGIN, SCALE_END, renderScaleBlock(EXAMPLE_SKILL, scaleLevels, syncedAt));

console.log(`\n  ${summary.skillCount} Skills across ${summary.categoryCount} categories`);
console.log(`  ${summary.listingCount} category listings — ${summary.multiCategorySkills.length} Skills sit in more than one category`);
console.log(`  ${scaleLevels.length} levels on the ${EXAMPLE_SKILL} scale`);

const changes = diff(previous, summary);
if (changes) {
  console.log('\n  Changed since the last sync:');
  changes.added.forEach((n) => console.log(`    + ${n}`));
  changes.removed.forEach((n) => console.log(`    - ${n}`));
  changes.recategorised.forEach((n) => console.log(`    ~ ${n}`));
  console.log('\n  Check whether overview/canonical-facts.mdx still states the right counts.');
} else if (previous) {
  console.log('\n  No change since the last sync.');
}

if (CHECK_ONLY) {
  const pageStale = nextPage.replace(/read from production on \d{4}-\d{2}-\d{2}/, '') !==
    page.replace(/read from production on \d{4}-\d{2}-\d{2}/, '');
  const jsonStale = !previous || previous.skillCount !== summary.skillCount || Boolean(changes);
  if (pageStale || jsonStale) {
    die('The committed taxonomy is out of date. Run: npm run sync:skills');
  }
  console.log('\n  Up to date with production.\n');
  process.exit(0);
}

mkdirSync(dirname(JSON_PATH), { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`);
writeFileSync(
  SCALE_JSON_PATH(EXAMPLE_SKILL),
  `${JSON.stringify({ skill: EXAMPLE_SKILL, syncedAt, source: 'Skill Deck MCP `get_attribute_scale`', levels: scaleLevels }, null, 2)}\n`
);
writeFileSync(PAGE_PATH, nextPage);

console.log(`\n  Wrote data/skill-taxonomy.json`);
console.log(`  Wrote ${SCALE_JSON_PATH(EXAMPLE_SKILL).replace(`${ROOT}/`, '')}`);
console.log(`  Updated product/skills-and-levels.mdx\n`);
