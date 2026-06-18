# Solicitations Matcher

A static web app that matches a company against federal solicitations, scores fit,
and produces a printable pursuit dossier. Matching, scoring, and reporting run
entirely in the browser — **no API keys, no backend.**

**Live (GitHub Pages):** https://vikramravi173-cyber.github.io/solicitation/

> Do not use old Vercel preview URLs — this project deploys via GitHub Actions only.

## Stack

- **Vite + React + TypeScript** (static SPA)
- **Tailwind CSS** — "Capture Deck" design system
- **react-router-dom** — `/` catalog, `/match` questionnaire, `/report` dossier

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

After changing `data/solicitations.json`, restart dev or rebuild:

```bash
npm run build
npm run preview    # http://localhost:4173/solicitation/
```

## Data

| File | Purpose |
|---|---|
| `data/Gov_Events_Opportunities.pdf` | Original DoD catalog source |
| `data/grants-search.csv` | Grants.gov export |
| `data/sbir-topics.csv` | SBIR.gov topics export |
| `data/solicitations.json` | Bundled catalog (imported at build time) |

Refresh the catalog:

```bash
npm run parse-pdf              # PDF → solicitations.json (replaces PDF rows)
npm run import-grants          # merge grants.gov CSV
npm run import-sbir-topics     # merge SBIR topics CSV
npm run build                  # rebuild so the SPA picks up new rows
```

## How it works

| Step | Engine |
|---|---|
| Matching | Fuzzy text match, agency fit, solicitation type |
| Profiles | Synthesized from catalog fields |
| Estimated fit | Rule-based scoring from profile fit and risk flags |
| Dossier | Ranked assembly of matches, scores, and tailored guidance |

## Deployment (GitHub Pages only)

Pushing to `main` or `cursor/initial-project-setup` runs
`.github/workflows/deploy-pages.yml`, which builds fresh from source and publishes
`dist/` to GitHub Pages. The committed `dist/` folder is not used.

**One-time (repo admin):** Settings → Pages → **Source: GitHub Actions**.

- `vite.config.ts` sets `base` to `/solicitation/` for production builds.
- The workflow copies `index.html` → `404.html` for client-side routing.

> Renaming the repo? Update `REPO_BASE` in `vite.config.ts` to match.
