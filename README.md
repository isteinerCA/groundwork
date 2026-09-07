# Explore Summer — Summer Programs Explorer

Freemium web app for discovering and tracking elite summer programs (grades 6–12).

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS v4
- **Stripe** seasonal pass ($49) — auth via Clerk
- **Vercel** for hosting — production domain `explore-summer.com` (DNS in AWS Route 53)

## Getting started

```bash
cd ~/Projects/groundwork
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Workspace (no auth required)

Workspace features (save, notes, compare, export) work immediately via **localStorage** on this device. No sign-in required until Clerk is added.

Optional early bird / Stripe env vars:

```bash
EARLY_BIRD_FREE=true
NEXT_PUBLIC_EARLY_BIRD=true
NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED=true
STRIPE_SECRET_KEY=...
STRIPE_PRICE_ID=...
```

**Early bird:** workspace is free; UI may show regular price **$49/season** with a limited-time free offer.

Save flow: **Tap ♡ on search results** → open workspace.

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
3. Set `NEXT_PUBLIC_APP_URL=https://explore-summer.com` (and the rest of `.env.example`)
4. Add the custom domain in Vercel, then point AWS Route 53 at Vercel (see below)

### Point explore-summer.com at the site

The app stays on Vercel. The domain being in AWS only means DNS lives in Route 53.

1. In Vercel: Project → Settings → Domains → add `explore-summer.com` and `www.explore-summer.com`.
2. In AWS Route 53, in the `explore-summer.com` hosted zone, add the exact records from the Vercel domain card (do not guess the IP — newer projects get a project-specific address). Typical shape:
   - Apex `A` record, name left **blank** (Route 53 does not use `@`) → the IPv4 Vercel shows, often `76.76.21.21`
   - `www` `CNAME` → the CNAME target Vercel shows (for example `cname.vercel-dns.com`)
3. Keep Route 53 as the nameservers at the registrar. Do not switch the domain to Vercel nameservers unless you want to move DNS off AWS.
4. After DNS propagates, set the same production URL in Clerk (allowed origins / redirect URLs), Stripe (webhook endpoint), Plausible (site domain), and Resend if you send mail from `@explore-summer.com`.

## Roadmap

See [TASKLIST.md](./TASKLIST.md) for the full execution plan.
