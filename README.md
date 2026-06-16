# Solicitations Matcher

A Next.js website that interviews a company, matches them against federal solicitations from the **Gov Events & Opportunities** PDF catalog, researches each opportunity, scores likelihood of acceptance, and produces a one-page recommendation report.

## Data source

Solicitations are loaded from a parsed local database:

- **PDF:** `data/Gov_Events_Opportunities.pdf`
- **JSON catalog:** `data/solicitations.json` (generated via `npm run parse-pdf`)

When the PDF is updated, re-run `npm run parse-pdf` to refresh the database.

## Quick start

```bash
npm run setup
# Edit .env.local — set ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start company analysis**.

## Environment variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API for matching, summaries, scoring, and reports |

## User flow

1. **Home** — overview of the 4-step process
2. **`/analyze`** — multi-step company questionnaire
3. **Analysis pipeline** — matches top solicitations, scrapes links, generates summaries + acceptance scores
4. **`/report`** — executive summary, ranked recommendations, deep dives

## Refresh the solicitations database

Replace or update `data/Gov_Events_Opportunities.pdf`, then:

```bash
npm run parse-pdf
```

Verify: `GET http://localhost:3000/api/database`

## API

### `POST /api/analyze`

Body: `CompanyProfile` (see `src/lib/company/questionnaire.ts`)

Returns: `AnalysisResult` with matched opportunities, summaries, acceptance scores, and final report.

### `GET /api/database`

Returns catalog metadata (source PDF, row count, last parsed time).

## Project structure

```
data/
├── Gov_Events_Opportunities.pdf   # Source catalog
└── solicitations.json             # Parsed database (committed)
scripts/
└── parse-pdf.cjs                  # PDF → JSON parser
src/
├── app/
│   ├── page.tsx                   # Landing
│   ├── analyze/page.tsx           # Company questionnaire
│   ├── report/page.tsx            # Results report
│   └── api/
│       ├── analyze/route.ts
│       └── database/route.ts
├── lib/
│   ├── data/solicitations-store.ts  # Loads JSON catalog
│   ├── pipeline/analyze.ts          # Orchestrator
│   ├── matching/
│   ├── research/
│   ├── scoring/
│   └── reporting/
```

## Roadmap

- [x] PDF-based solicitations database
- [x] Company intake + AI matching pipeline
- [ ] Improve PDF column parsing (descriptions, full URLs)
- [ ] Web search API for supplemental research
- [ ] PDF export of final report
