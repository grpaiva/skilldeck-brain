# Skill Deck Brain

The shared source of truth about what Skill Deck is, how it works, and how we talk about it.

This repository is Skill Deck's "second brain": a Mintlify documentation site backed by Markdown in Git. It exists so any teammate, contractor, or AI agent can get an accurate picture of the company and the product in a few minutes, without asking a founder.

- **Humans** edit pages in the [Mintlify dashboard](https://dashboard.mintlify.com), which commits back here.
- **Engineers** edit MDX in an IDE and open a pull request.
- **Agents** read and edit over the GitHub MCP server or the Mintlify MCP server.

## Read this first

If you are an AI agent, load [`AGENTS.md`](./AGENTS.md) before doing anything else. It is the routing file: the rules, the vocabulary, and the map of which page answers which question.

If you are a person, start at `index.mdx` and then read `overview/how-to-use-this-brain.mdx`.

## Structure

```
skilldeck-brain/
├── AGENTS.md          # Routing file and rules for AI agents
├── docs.json          # Site configuration and navigation
├── index.mdx          # Start here
├── overview/          # How to use this brain, canonical facts, glossary
├── company/           # Positioning, ICP, business model, fundraising, team
├── product/           # How the product works, from a user's point of view
└── playbooks/         # Repeatable procedures
    └── manager-coaching/   # Synced from the Manager Coaching Playbook PDF
```

Engineering documentation is **not** here. It lives in the `grpaiva/skilldeck` application repository under `docs/`.

## Local development

```bash
npm i -g mint
mint dev
```

The preview runs at `http://localhost:3000`.

Before opening a pull request:

```bash
mint broken-links
mint validate
```

## Content rules

The full set is in [`AGENTS.md`](./AGENTS.md). The short version:

1. English only.
2. The product term is **Skill**, never "competency". `Attribute` is the internal database name and stays in code.
3. Every page carries `updated` and `status` frontmatter. `status` is one of `verified`, `draft`, or `stale`.
4. Numbers and external claims live on `overview/canonical-facts.mdx`. Link to it rather than restating a number.
5. Never invent a fact to fill a gap. Mark the gap with a `{/* TODO */}` comment instead.
6. New pages must be registered in the `navigation` block of `docs.json` or they stay hidden.
7. `playbooks/manager-coaching/` is synced from a PDF. Correct the PDF first, then re-sync those pages.
