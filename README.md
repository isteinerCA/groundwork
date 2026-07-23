# Groundwork — Summer Programs Explorer

Freemium web app for discovering and tracking elite summer programs (grades 6–12).

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS v4
- **NextAuth** (Google) + **Stripe** seasonal pass ($49)
- **Vercel** for hosting (custom domain optional later)

## Getting started

```bash
cd ~/Projects/groundwork
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Auth & early bird (launch mode)

Copy `.env.example` → `.env.local`:

```bash
EARLY_BIRD_FREE=true
NEXT_PUBLIC_EARLY_BIRD=true
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Early bird:** workspace is **free** for sign-in users; UI shows regular price **$49/season** with a limited-time free offer. Stripe stays off until you set `NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED=true`.

Save flow: **Sign in with Google** → free early bird pass → save programs.

## Data model (Sprint 1)

The final CSV will include:

- **12 primary categories** (see `src/lib/constants/categories.ts`)
- **Format column** — Residential / Online / Both
- **Gotcha flags** — JSON in `Flags` column (or separate sheet; TBD)
- **Price** — may include `"Contact program"` for unknown pricing

Admission types are normalized to three values at import:

| Normalized | CSV examples |
|---|---|
| `first_come` | First-come, Rolling, open enrollment |
| `application` | Application, Selective, rolling application |
| `highly_competitive` | Highly competitive, Highly selective, "4% acceptance" |

### Price filter behavior

When a user applies a price filter, programs with **unknown price** (`Contact program`) **still appear by default** so selective programs without listed tuition are not hidden. Cards show the raw price string. Users can opt into strict mode (`excludeUnknownPrice: true`) to hide them.

See [docs/DATA.md](./docs/DATA.md) for full details.

# After updating CSV:
#   python3 scripts/generate_seed.py
#   — or, with Node installed:
#   npm run import:programs

## Project structure

```
src/
  app/              # Next.js routes
  lib/
    constants/      # 12 categories, admission types, filter enums
    data/           # Normalization & filter helpers
    types/          # Program, SearchFilters, CSV row types
scripts/
  import-programs.ts
docs/
  DATA.md           # Data decisions & CSV schema
data/
  source/           # Place CSV here (gitignored if large)
  seed/             # Generated JSON
```

## Deploy to Vercel

1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy — no env vars required for Sprint 1

## Roadmap

See [TASKLIST.md](./TASKLIST.md) for the full execution plan.
