# Solicitations Search

Next.js 14 app (App Router, TypeScript, Tailwind CSS) for AI-powered search across federal solicitations stored in Google Sheets.

## Data source

- **Sheet ID:** `1JOqnwfQAYf33qiXPfMA-DrfBO-n3TRoRUt3Gtqn5j5Q`
- **Tab:** `Solicitations`

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in env vars (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account credentials JSON (stringified). Share the sheet with the SA email. |
| `ANTHROPIC_API_KEY` | Claude API key for AI search |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (calendar — upcoming) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (calendar — upcoming) |
| `NEXTAUTH_SECRET` | NextAuth session secret (calendar — upcoming) |
| `NEXTAUTH_URL` | App URL, e.g. `http://localhost:3000` |

## API

### `POST /api/search`

AI search with optional filters.

```json
{
  "query": "solar energy SBIR",
  "filters": {
    "department": "Air Force",
    "solicitationType": "SBIR",
    "company": "Swift Solar"
  }
}
```

Returns:

```json
{
  "results": [
    {
      "title": "...",
      "department": "...",
      "dueDate": "...",
      "org": "...",
      "type": "...",
      "descriptionSnippet": "...",
      "link": "...",
      "companyFlags": { "Swift Solar": true }
    }
  ]
}
```

### `GET /api/search?q=...`

Simple query-string search (no filters).

## Project structure

```
src/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts      # AI search endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
└── lib/
    ├── ai/
    │   └── search.ts         # Anthropic integration
    ├── google/
    │   └── sheets.ts         # Google Sheets API client
    └── solicitations/
        ├── constants.ts      # Sheet ID, columns, filter options
        ├── filters.ts        # Department / type / company filters
        └── types.ts
```

## Auth strategy

- **Sheets read:** service account (`GOOGLE_SERVICE_ACCOUNT_JSON`) — no user login
- **Calendar write:** Google OAuth via NextAuth.js (upcoming)

## Roadmap

- [x] Folder structure + `/api/search`
- [ ] Filter UI on the homepage
- [ ] `/api/add-to-calendar` + NextAuth Google OAuth
