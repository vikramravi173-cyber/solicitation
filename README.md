# Solicitations Matcher

A Next.js website that interviews a company, matches them against federal solicitations from the **Gov Events & Opportunities** PDF catalog, researches each opportunity, scores likelihood of acceptance, and produces a one-page recommendation report.

**No API keys required** — matching, summaries, and scoring run locally on your machine.

## Data source

- **PDF:** `data/Gov_Events_Opportunities.pdf`
- **JSON catalog:** `data/solicitations.json` (generated via `npm run parse-pdf`)

When the PDF is updated, re-run `npm run parse-pdf` to refresh the database.

## Quick start

```bash
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start company analysis**.

## How analysis works (no external AI)

| Step | Engine |
|---|---|
| Matching | Keyword overlap, department fit, solicitation type, company flags |
| Summaries | Built from catalog fields + scraped solicitation pages |
| Acceptance score | Rule-based scoring from profile fit and risk flags |
| Report | Ranked assembly of matches and scores |

For deeper AI-assisted review, use **Cursor chat** on the generated report or export data.

## User flow

1. **Home** — overview + live catalog stats
2. **`/analyze`** — company questionnaire
3. **Analysis** — local matching, link scraping, scoring
4. **`/report`** — executive summary and recommendations

## Refresh the database

```bash
npm run parse-pdf
```

Verify: `GET http://localhost:3000/api/database`

## API

- `POST /api/analyze` — run full analysis pipeline
- `GET /api/database` — catalog metadata

## Project structure

```
data/                    # PDF source + parsed JSON
scripts/parse-pdf.cjs    # PDF parser
src/lib/
  matching/              # Local match scoring
  research/              # Scrape + template summaries
  scoring/               # Rule-based acceptance
  reporting/             # Final report builder
  pipeline/analyze.ts    # Orchestrator
```

## Deployment (Vercel)

Auto-deploy uses GitHub Actions with the [Vercel CLI prebuilt workflow](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel):

| Event | Workflow | Result |
|---|---|---|
| Pull request | `.github/workflows/vercel-preview.yml` | Preview deployment |
| Push to `main` or `cursor/initial-project-setup` | `.github/workflows/vercel-production.yml` | Production deployment |

### One-time setup

1. **Create a Vercel project** — import `vikramravi173-cyber/google-sheet-searcher-agent` in the [Vercel dashboard](https://vercel.com/new), or link locally:
   ```bash
   npx vercel link
   ```
2. **Create a Vercel access token** — [Account → Tokens](https://vercel.com/account/tokens).
3. **Read project IDs** from `.vercel/project.json` after linking (`orgId`, `projectId`).
4. **Add GitHub repository secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |---|---|
   | `VERCEL_TOKEN` | Vercel access token |
   | `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

   Do not commit tokens or `.vercel/` to git.

5. **Push to deploy** — production deploys on pushes to `main` or `cursor/initial-project-setup`. PRs from other branches get preview URLs.

### Manual deploy

```bash
npm run vercel:preview   # preview URL
npm run vercel:deploy    # production
```

Requires `npx vercel login` and `npx vercel link` once locally.

### Alternative: Vercel Git integration

You can skip GitHub Actions and connect the repo in the Vercel dashboard instead — Vercel will deploy on every push automatically. Disable the workflows above if you use that path to avoid duplicate deployments.
