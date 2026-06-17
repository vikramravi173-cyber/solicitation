# Solicitations Matcher

A static web app that matches a company against federal solicitations from the
**Gov Events & Opportunities** catalog, scores fit, and produces a printable
pursuit dossier. Matching, scoring, and reporting run entirely in the browser —
**no API keys, no backend.**

**Live:** https://vikramravi173-cyber.github.io/solicitation/

## Stack

- **Vite + React + TypeScript** (static SPA)
- **Tailwind CSS** — "Capture Deck" design system (dark command-deck chrome, paper dossier)
- **react-router-dom** — `/` catalog, `/match` questionnaire, `/report` dossier

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # static output in dist/
npm run preview    # preview the production build
```

## Data

- `data/Gov_Events_Opportunities.pdf` — source catalog
- `data/solicitations.json` — parsed catalog, bundled into the app
- Re-parse after updating the PDF: `npm run parse-pdf`

## How it works

| Step | Engine |
|---|---|
| Matching | Keyword overlap, agency fit, solicitation type, company flags |
| Profiles | Synthesized from catalog fields |
| Estimated fit | Rule-based scoring from profile fit and risk flags |
| Dossier | Ranked assembly of matches, scores, and tailored guidance |

Scoring is a transparent prioritization signal — it surfaces and ranks
opportunities, it does not predict award decisions.

## Project structure

```
src/
  pages/        # Home (catalog), Analyze (match), Report (dossier)
  components/   # Registry, OpportunityDrawer, QuestionnaireForm, Seal, ...
  lib/          # matching / scoring / reporting (pure, client-side)
  data/         # bundled catalog
  state/        # sessionStorage-backed analysis result
```

## Deployment (GitHub Pages)

Pushing to `main` or `cursor/initial-project-setup` runs
`.github/workflows/deploy-pages.yml`, which builds the SPA and publishes `dist/`
to GitHub Pages. No secrets required.

**One-time (repo admin):** Settings → Pages → **Source: GitHub Actions**.

Routing notes:

- `vite.config.ts` sets `base` to `/solicitation/` for production builds; the
  router uses that as its `basename`.
- The workflow copies `index.html` → `404.html` and adds `.nojekyll` so deep
  links (`/match`, `/report`) resolve on direct load.

> Renaming the repo? Update `REPO_BASE` in `vite.config.ts` to match.
