# AGENTS.md — Skill Deck Brain

You are working in **Skill Deck's second brain**: the shared, versioned source of truth about what Skill Deck is, how the product works, and how we are allowed to talk about it.

Two kinds of work happen here, and they have different rules:

- **Reading** — you are loading context to answer a question, write copy, brief a person, or build a feature elsewhere.
- **Writing** — you are adding or correcting a page in this repository.

Read the section that matches your task. Read [Hard rules](#hard-rules) either way.

---

## What Skill Deck is

Skill Deck is a Skill tracking and development tool for company teams. It analyzes 58 Skills from real work evidence — mostly the meetings people already have — and builds an individual behavioral profile based on what someone does, not on what they say or on third-party perceptions. Each person works a Track on one Skill at a time; their manager gets the data to put development back on the agenda.

The canonical positioning statement, which all copy must support:

> Skill Deck creates an individual behavioral profile for each employee based on what they do, not on what they say or on third-party perceptions.

---

## Hard rules

1. **Never invent a fact.** Not a number, not a feature, not a customer, not a date. If the brain does not contain it, say so. A plausible invention here becomes a product claim in front of a customer, and it is worse than an admitted gap.
2. **Numbers come from `overview/canonical-facts.mdx`.** Every price, count, threshold, and target. If a figure is not on that page, you do not have it. Do not estimate, do not round, do not derive.
3. **Never edit a generated block.** Blocks fenced with `{/* BEGIN GENERATED: ... */}` are synced from live production. Run the sync instead — see `overview/syncing-from-production.mdx`.
4. **Check `status` before you trust a page.** `verified` is safe to state externally. `draft` is internal only. `stale` must be re-verified first.
5. **Distinguish shipped from planned.** Product pages label features that are not live. Never describe a planned capability in the present tense.
6. **English only.** Source material is often in Portuguese. Translate it; never paste it.
7. **Privacy answers come from `product/privacy-and-data.mdx`.** Never from inference, and never from what seems reasonable. Getting this wrong damages trust in a way that is hard to repair.
8. **Use glossary terms exactly.** See `overview/glossary.mdx`. Do not invent synonyms for concepts that already have a name.
9. **This repo is not the engineering docs.** Application architecture, schemas, and runbooks live in `grpaiva/skilldeck` under `docs/`. Do not copy them here.
10. **Never commit a credential.** The Skill Deck MCP token is a live production secret and belongs in an environment variable only.
11. **Open a pull request. Do not push to `main`.**

---

## Where to find things

Start with the shortest path to an answer. Most questions are answered by one page.

### Route by question

| The question | The page |
| --- | --- |
| What does Skill Deck do? What problem does it solve? | `company/what-is-skill-deck.mdx` |
| What is our unique value proposition? | `company/what-is-skill-deck.mdx` |
| Who do we sell to? Which markets? | `company/icp-and-market.mdx` |
| Why not companies above 250 people? | `company/icp-and-market.mdx` |
| What does it cost? What are the plans? | `company/business-model.mdx` |
| What stage are we at? What are we raising and why? | `company/stage-and-fundraising.mdx` |
| Who are the founders? Why them? | `company/team-and-history.mdx` |
| How does the product work end to end? | `product/how-it-works.mdx` |
| What are the Skills, categories, and levels? | `product/skills-and-levels.mdx` |
| What counts as evidence? How does an evaluation happen? | `product/evidence-and-evaluation.mdx` |
| What is a confidence score? How is a level calculated? | `product/confidence-and-scoring.mdx` |
| What is a Track? What is a Cycle? | `product/cycles-and-tracks.mdx` |
| What emails does a user get, and when? | `product/track-dispatches.mdx` |
| How do organizations, teams, and roles work? | `product/organizations-and-teams.mdx` |
| What does a manager see and do? | `product/manager-role.mdx` |
| What can a manager see about an employee? Is this surveillance? | `product/privacy-and-data.mdx` |
| How should a manager actually use Skill Deck? | `playbooks/manager-coaching/overview.mdx` |
| How often should a manager meet their team? | `playbooks/manager-coaching/overview.mdx` |
| A member is stuck. What do I do? | `playbooks/manager-coaching/red-flags.mdx` |
| How do I write about Skill Deck? What can I not claim? | `playbooks/messaging-and-claims.mdx` |
| What is the exact number for X? | `overview/canonical-facts.mdx` |
| What brand colors do we use? | `overview/canonical-facts.mdx` |
| What does this word mean? | `overview/glossary.mdx` |
| How do I refresh Skills and categories from production? | `overview/syncing-from-production.mdx` |

### Route by task

- **Writing customer-facing copy** → `playbooks/messaging-and-claims.mdx` first, then `overview/canonical-facts.mdx` for every number. Nothing else is optional reading.
- **Answering a prospect or customer question** → the relevant Product page, plus `product/privacy-and-data.mdx` if the question touches data at all.
- **Advising a manager on how to use Skill Deck** → `playbooks/manager-coaching/`. That playbook is the source of truth for manager guidance; do not improvise a cadence or an agenda.
- **Briefing a new teammate** → `index.mdx`, then `company/what-is-skill-deck.mdx`, then `product/how-it-works.mdx`.
- **Building a feature in the app repo** → `product/` for user-facing intent and vocabulary; the app repo's own `docs/` for implementation.
- **Preparing investor material** → `company/stage-and-fundraising.mdx`, and stop. A founder reviews anything that leaves the building.

---

## Vocabulary

Use these words exactly. `overview/glossary.mdx` holds the full list; this is the subset that gets confused most often.

The single most common mistake is writing "competency" where the product says "Skill".

| Term | What it means | Do not say |
| --- | --- | --- |
| **Skill** | One of the 58 behaviors Skill Deck measures. The product term, everywhere a customer can see. | "Competency", "attribute", "trait", "metric" |
| **Attribute** | The internal database name for a Skill. Code and engineering docs only. | Anything customer-facing |
| **Category** | The grouping that Skills belong to. There are 8. | "Pillar", "domain", "bucket" |
| **Level** | The graded position within a Skill. **21 levels**, scored 0 to 20. | "Rating", "grade", "20 levels", "out of 20 levels" |
| **Evidence** | A piece of real work the product analyzes — usually a meeting. | "Recording", "data point", "sample" |
| **Evaluation** | The scored assessment produced from evidence. | "Test", "assessment result", "review" |
| **Confidence** | How much evidence stands behind a score. | "Accuracy", "certainty", "reliability" |
| **Track** | A development cycle on one Skill. Needs about two weeks minimum. | "Course", "program", "module", "sprint" |
| **Goal** | The score a Track aims at. | "Objective", "KPI" |
| **Cycle** | A quarter. Tracks live inside one. | — |
| **Deck** | A person's full Skill profile. | "Dashboard", "scorecard" |
| **Dispatch** | A scheduled communication sent during a Track. Kickoff, Prep, Review, Wrap-Up, Evidence Evaluated. | "Notification", "alert", "digest" |
| **Activity** | A leftover practice session from the initial version. Unused. | "AI interview", or describing activities as available |

**Capitalize the product nouns** — Skill, Track, Goal, Cycle, Deck — as the Manager Coaching Playbook does.

Two words are banned about our own product, including in denials: **surveillance** and **monitoring**. Repeating the frame reinforces it. Describe what the product actually does instead.

---

## Writing in this repository

This is a [Mintlify](https://mintlify.com) site. Pages are MDX with YAML frontmatter; configuration is `docs.json`.

### Frontmatter — required on every page

```yaml
---
title: "Sentence case title"
description: "One sentence. Used in search results and navigation."
icon: "lucide-icon-name"
updated: "YYYY-MM-DD"
status: "verified"
---
```

`status` is `verified`, `draft`, or `stale`. Set it honestly. Update `updated` whenever you change the substance of a page.

### Style

- Second person, active voice, present tense. One idea per sentence.
- Sentence case for headings.
- No marketing adjectives — "powerful", "seamless", "robust", "cutting-edge". State the mechanism; it persuades better.
- No filler ("it's important to note", "in order to") and no editorializing ("simply", "obviously", "just").
- Bold for UI elements: click **Settings**. Code formatting for file names, commands, and paths.
- Do not end a page with a summary of the page.
- **Escape dollar signs before a digit: `\$9.90`.** Two unescaped `$` on one line are parsed as inline LaTeX, and the prices silently render as italic maths. Check any page you add a price to.

### Components

Favor Mintlify's built-in components over custom ones, and do not decorate. Reach for `<Card>` and `<Columns>` for navigation, `<Steps>` for sequences, `<Tabs>` for one-of-several choices, `<Accordion>` for detail most readers will skip, and callouts (`<Note>`, `<Info>`, `<Tip>`, `<Warning>`, `<Check>`) by severity. A plain Markdown table usually beats a component.

### Handling uncertainty

When you cannot verify something, do not guess and do not silently omit it. Write what you know and mark the gap:

```mdx
{/* TODO: Verify whether the manager whitelist is enforced at evaluation time or only in the UI. */}
```

Then set the page `status: draft`. A marked gap tells the next reader exactly what to check; an invented fact tells them nothing is wrong.

### Checklist before you finish

- [ ] Frontmatter complete, including `updated` and `status`.
- [ ] Every number traced to `overview/canonical-facts.mdx`, or added there.
- [ ] Every new term added to `overview/glossary.mdx`.
- [ ] New pages registered in the `navigation` block of `docs.json`, or they will not appear.
- [ ] Internal links are root-relative and extensionless: `/product/how-it-works`.
- [ ] All code blocks have a language tag; all images have alt text.
- [ ] `mint broken-links` and `mint validate` both pass.

```bash
mint dev            # preview at http://localhost:3000
mint broken-links
mint validate
```

---

## Sources of truth outside this repo

| What | Where | Note |
| --- | --- | --- |
| Live Skills and categories | Skill Deck MCP, `https://skilldeck.ai/mcp/skilldeck` | The only source of truth for the taxonomy and level rubrics. Synced by `npm run sync:skills`. |
| Manager guidance | Manager Coaching Playbook (PDF) | Synced into `playbooks/manager-coaching/`. The PDF wins if they diverge. |
| The application | `grpaiva/skilldeck` | Private. Laravel, Livewire, Filament. |
| Engineering docs | `grpaiva/skilldeck` → `docs/` | Deep and partly outdated. Prefer code and config over prose. |
| Pricing and plans | A founder | Confirmed 2026-09-01 and recorded on `overview/canonical-facts.mdx`. Nowhere else. |
| Brand accent | skilldeck.ai `theme-color` and Tailwind `purple` | `purple-600` `#9333EA`. Docs `colors` in `docs.json` use 600 / 500 / 700. |
| Any seeder file | `grpaiva/skilldeck` → `database/seeders/**` | **Stale. Do not use as a source of truth.** Seeders are development fixtures. They have already been wrong about the Skill list, Skill level text, and plan prices. |
| Product behavior constants | `grpaiva/skilldeck` → `config/` | `tracks.php`, `scoring.php`, `quotas.php` and neighbors are the most reliable statement of how the product actually behaves. |
| Mintlify product knowledge | `https://www.mintlify.com/docs/mcp` | For questions about Mintlify itself. |
| This site over MCP | `https://mcp.mintlify.com` | For reading and editing this content. |

When the brain and the application disagree, **the application is right and this repository has a bug**. Fix the page.

---

## Content boundaries

**Belongs here:** positioning and approved claims; how the product works from a user's point of view; company stage, business model, and ICP; playbooks we want executed the same way every time.

**Never goes here:** customer names, deal terms, or anything under NDA; personal data about employees or customers; credentials, API keys, or environment values; valuation, cap table, or investor identities; unreleased plans a founder has not agreed to publish internally.
