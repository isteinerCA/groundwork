# Groundwork — Technical Execution Plan

**Product:** Summer Programs Explorer (Groundwork)  
**PRD:** v1.2 (July 2026)  
**Source data:** `/Users/isabellesteiner/Downloads/Summer programs 2026 - Sheet1.csv` (138 program rows)  
**Status:** Sprint 1 complete — scaffold + data model (July 2026)

### Sprint 1 updates (post-PRD review)
- **12 categories** used directly from CSV (no PRD 9-bucket mapping)
- **Format column** + **gotcha flags** in final CSV schema
- **Admission types** normalized to 3 enums at import
- **"Contact program"** pricing: included in price-filtered results by default (see `docs/DATA.md`)
- **Hosting:** Vercel default URL for now; custom domain deferred

---

## 0. Executive Summary

Groundwork is a freemium web app that helps families filter ~140 elite summer programs in under 90 seconds, surface curated "gotcha" flags, and (with a $49 seasonal pass) manage shortlists through application season.

This plan sequences work from **data foundation → search MVP → workspace → monetization → launch hardening**, aligned to PRD sections 4–14 and the attached design assets.

### MVP success criteria (from PRD §11)
- 100 paying users within 90 days of launch
- Save rate ≥ 20% of searches
- All QA scenarios in PRD §14 pass before public launch

### Recommended stack (from PRD §12–13)
| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind | Responsive web MVP; Vercel deployment |
| Database | Supabase (Postgres) | Auth-adjacent, RLS, editable program data |
| Auth | NextAuth.js + Google OAuth | Sole MVP auth method per PRD |
| Payments | Stripe Checkout + webhooks | $49 seasonal pass; no card storage |
| Analytics | Plausible | Privacy-first; no Google Analytics |
| Email | Resend or Postmark | Contact form routing, account emails |
| Hosting | Vercel | Matches PRD cost estimates |

---

## 1. Inputs Reviewed

### 1.1 PRD (Google Doc v1.2)
Core requirements captured in this plan:
- Guided chip-based search with grade-completed normalization (§4.4, §7.1)
- Results list + sort + gotcha flags (§7.2–7.3)
- Client-side rule-based chat parser synced to chips (§7.4–7.5)
- Shortlist workspace with status pipeline, notes, compare, export, share (§7.6)
- Program contact form (§7.7)
- Freemium: free search; $49 seasonal pass at first save (§7.8, §13)
- Security, privacy, and QA scenarios (§12–14)

### 1.2 Design assets (attached mockups)
| Asset | Maps to |
|---|---|
| Dashboard ("Good morning, Isabelle") | `/dashboard` — stats cards, programs table, deadlines sidebar, notes sidebar |
| Search flow (pile → filtered list) | `/search` — filter bar + result cards + save heart |
| Program card with magnifying glass | Program detail / expanded card — "Hidden Details" gotcha layer |
| Category grid (9 pathways) | Landing page `/` — "Explore Program Categories" section |
| Hero desk scene | Landing hero — warm, academic tone; compass/notebook motif |

### 1.3 CSV data profile
**File:** `Summer programs 2026 - Sheet1.csv`  
**Rows:** 138 (includes duplicate program names with different tracks, e.g. CMU Pre-College × 6, Stony Brook × 9)

**Columns:**
```
Program Name | Primary Category | Secondary Tags | Any additional details about specific track |
Grades | Admission Type | Length | Dates 2026 | Location | Credit | Price | URL
```

**Primary Category distribution (12 values — must map to PRD's 9 taxonomy buckets):**
| CSV category | Count | Target PRD bucket |
|---|---:|---|
| College-Credit Pre-College | 25 | Elite Credit-Bearing Pre-College Academic Programs |
| Marine Science | 19 | Marine, Oceanographic & Environmental Sciences |
| STEM/Engineering | 17 | Specialized STEM, Applied Engineering & AI Academies |
| Cultural Exchange | 14 | Global Leadership, Cultural Exchange & Gap Explorations |
| Leadership/Gifted | 12 | Split across relevant buckets (often secondary tag) |
| Artificial Intelligence | 9 | Specialized STEM… (Tech & AI sub-focus) |
| Mathematics | 9 | Advanced Mathematics & Olympiad Competition Prep |
| Outdoor/Wilderness | 9 | Wilderness Adventures & Outdoor Leadership |
| Writing/Humanities | 8 | Humanities, Creative Writing & Social Sciences |
| Biomedical | 8 | Pre-Med, Healthcare & Life Sciences |
| Traditional Camp | 5 | Traditional Sleepaway & Performing Arts Camps |
| Arts | 3 | Traditional Sleepaway & Performing Arts Camps |

**Data quality issues to resolve in ingestion:**
- **Admission Type:** 20+ free-text variants → normalize to `First-Come | Application | Highly Competitive`
- **Grades:** Mixed `Current`, `Rising`, `Entering`, `Ages X–Y`, `Grades X–Y` → grade-completed ranges per PRD §4.4
- **Price:** Non-numeric strings (`Free`, `Contact program`, `$3748 (1-wk res) to $10858…`) → `priceMin`, `priceMax`, `fullyFunded` boolean
- **Format:** No explicit column → infer `Residential | Online | Both` from Location strings
- **Length:** Free text (`1-2 weeks`, `7-30 days`, `13 days`) → duration bucket enum
- **Credit:** 15+ variants → `hasCollegeCredit: boolean` + display label
- **Institution:** Not a separate column → parse from program name or add manually for top programs
- **Gotcha flags:** Not in CSV → separate curated JSON/DB table keyed by program slug
- **Data vintage:** All dates say 2026; UI must show "Last verified" date

---

## 2. Phase 0 — Project Setup & Decisions

### Step 0.1 — Repository & environment
- [ ] Confirm project root: `/Users/isabellesteiner/Projects/groundwork`
- [ ] Initialize Next.js app (TypeScript, Tailwind, ESLint, App Router, `src/` directory)
- [ ] Add `.env.example` with placeholders: `DATABASE_URL`, `NEXTAUTH_*`, `GOOGLE_CLIENT_*`, `STRIPE_*`, `PLAUSIBLE_DOMAIN`
- [ ] Configure Prettier + import aliases (`@/`)
- [ ] Set up GitHub repo + branch protection + Dependabot (PRD §12.5)

### Step 0.2 — Design system (from PRD §16.4 + mockups)
- [ ] Define CSS tokens:
  - Navy primary: `#1A365D`
  - Parchment background: `#F9F8F6`
  - Amber accent (CTAs, gotcha highlights): warm gold
- [ ] Typography: serif for headings (e.g. Playfair Display / Lora), sans for UI (e.g. Inter / Source Sans 3)
- [ ] Component primitives: Button, Chip, Badge, Card, Table, Sidebar, Modal, Tooltip
- [ ] Category icon set: 9 line illustrations (navy stroke, consistent weight) — can start with Lucide placeholders, swap for custom SVGs later
- [ ] Document responsive breakpoints (mobile-first; no native app for MVP)

### Step 0.3 — Architecture decision record (ADR)
- [ ] Document: programs stored in Postgres (editable) vs. static JSON at build time  
  **Recommendation:** Postgres as source of truth; seed from CSV; admin import script for annual refresh
- [ ] Document: search runs client-side on fetched dataset vs. server-side API  
  **Recommendation:** Server API with indexed filters for MVP (~140 rows); client-side fine for v0 prototype
- [ ] Document: chat parser scope for MVP (rule-based, no LLM) per PRD §7.4
- [ ] Resolve PRD pricing inconsistency: §7.8 mentions "$20 per saved list" but §13 finalizes **$49 seasonal pass, unlimited lists** — implement §13

---

## 3. Phase 1 — Data Layer

### Step 1.1 — Define canonical schema

**`programs` table**
```
id, slug, name, institution, description, trackDetail,
category (enum: 9 PRD buckets), secondaryTags (text[]),
gradeCompletedMin, gradeCompletedMax, gradeSource (grade|age|mixed),
admissionType (first_come|application|highly_competitive),
format (residential|online|both),
durationBucket (under_2_weeks|two_to_four|four_plus),
lengthDisplay, datesDisplay, locationDisplay,
city, state, country, isInternational,
hasCollegeCredit, creditDisplay,
priceMin, priceMax, priceDisplay, fullyFunded, financialAidAvailable,
websiteUrl, dataVerifiedAt, createdAt, updatedAt
```

**`program_flags` table** (gotcha layer, separate from CSV)
```
id, programId, flagType (safety|deposit|selectivity|residency|physical|turnover),
title, body, sourceCitation, sourceDate, severity (info|warning)
```

**`users` table**
```
id, email, googleId, name, seasonPassActive, seasonPassExpires, createdAt
```

**`shortlists` table**
```
id, userId, name, shareToken, shareTokenExpires, createdAt
```

**`shortlist_items` table**
```
id, shortlistId, programId, status (researching|deadline_noted|applied|waitlisted|accepted|declined),
deadline (user-entered date|null), notes (encrypted text), sortOrder, savedAt
```

**`contact_submissions` table**
```
id, name, email, programName, inquiryType, message, websiteUrl, createdAt, status
```

### Step 1.2 — Build CSV ingestion pipeline
- [ ] Create `scripts/import-programs.ts` (or Python one-off) reading the local CSV
- [ ] Implement grade normalization engine per PRD §4.4.1–4.4.3:
  - Parse "Current Junior" → grade completed 11
  - Parse "Rising Junior" → grade completed 10
  - Parse "Ages 14–18" → grades 8–12 with ±1 tolerance flag
  - Emit `gradeSource: age` when age-based; UI chip: "Eligibility is age-based — verify with program"
- [ ] Implement admission type classifier (regex/rules map 20+ CSV values → 3 enums)
- [ ] Implement price parser:
  - Detect fully funded: `Free`, `Fully funded`, `$0`, `Free (sponsored)`, etc.
  - Extract numeric min/max from ranges and complex strings
  - Flag `priceUnknown: true` for "Contact program" (exclude from price filters or treat as null)
- [ ] Implement format detector from Location (`Online`, `& Online`, country ≠ US → international)
- [ ] Implement duration bucket classifier from Length field
- [ ] Map 12 CSV Primary Categories → 9 PRD taxonomy buckets (use Secondary Tags as tiebreaker)
- [ ] Generate unique `slug` per row (name + track detail for duplicates)
- [ ] Write validation report: rows that fail parsing, ambiguous grades, missing URLs

### Step 1.3 — Seed gotcha flags (curated, not from CSV)
Per PRD §4.2 and §7.3, manually create flags for known programs:
- [ ] Harvard SSP — SEVP certification terminated (source: DHS May 2025)
- [ ] Interlochen Arts Camp — historical abuse allegations / investigation
- [ ] COSMOS — CA residents only; $200 non-refundable deposit
- [ ] MIT RSI — 4% acceptance; PSAT Math 740+ floor
- [ ] Outward Bound — mandatory solo wilderness camping
- [ ] Overland Summers — staff pay / turnover risk
- [ ] Wake Forest — $550 non-refundable deposit (from CSV)

Each flag must include `sourceCitation` + `sourceDate` (PRD §7.3, QA §14.4).

### Step 1.4 — Copy CSV into repo
- [ ] Add `data/source/summer-programs-2026.csv` (copy from Downloads)
- [ ] Add `data/seed/programs.json` (generated output) for review before DB insert
- [ ] Add `data/seed/flags.json`
- [ ] Document annual refresh process (PRD §15): re-import before September, update `dataVerifiedAt`

---

## 4. Phase 2 — Public Search Experience (Free Tier)

### Step 2.1 — Landing page `/` (Asset: category grid + hero)
- [ ] Hero: headline "The summer that changes everything starts here." (PRD §16.2)
- [ ] Subcopy per PRD §16.3 (discovery pain + fine print beat)
- [ ] Primary CTA → `/search`
- [ ] "Explore Program Categories" 3×3 grid with 9 PRD categories + icons + descriptions
- [ ] Category cards link to `/search?category=...` with chip pre-selected
- [ ] Footer: disclaimer block (PRD §16.6) — incomplete list, details change, verify before apply
- [ ] "Last verified: [date]" badge from `dataVerifiedAt`
- [ ] About-this-list section with report-an-issue link

### Step 2.2 — Search page `/search` (Asset: filter bar + result list)
- [ ] **Filter chips** (no form fields, all toggle/chip based per PRD §7.1):
  - Grade just completed (required, multi-select 6th–12th)
  - Category (multi-select, 9 buckets, OR logic)
  - Admission type (First-Come / Application / Highly Competitive)
  - Format (Residential / Online / Both)
  - Duration (Under 2 weeks / 2–4 weeks / 4+ weeks)
  - College credit (Yes only / Any)
  - Fully funded only (toggle)
  - Max price (Under $2k / $2k–5k / $5k–10k / $10k+ / Any)
  - Location: US Only vs. International OK toggle (no zip/radius)
- [ ] **Active filter bar** above results — persistent, clear-all action
- [ ] **Results count** displayed; drives chat opening prompt (PRD §9)
- [ ] Block search until at least one grade chip selected

### Step 2.3 — Program result cards (Asset: list rows + expanded card)
Each card shows (PRD §7.2):
- [ ] Name, institution, category chip
- [ ] Grade range (normalized display)
- [ ] Admission type chip (green / amber / red)
- [ ] Duration, dates, location
- [ ] Credit pill, price + Fully Funded badge, financial aid indicator
- [ ] Learn More → external URL (new tab)
- [ ] Save/bookmark heart (triggers auth + payment gate — see Phase 4)
- [ ] Report an issue link → contact form
- [ ] Expandable **"Hidden Details"** panel (Asset: magnifying glass mockup) showing gotcha flags with citations
- [ ] Sort controls: selectivity, price, duration, name

### Step 2.4 — Zero-results state (PRD §9)
- [ ] Friendly message + suggested broadening actions
- [ ] Chat prompt offers to relax filters
- [ ] No broken UI state

### Step 2.5 — Search API
- [ ] `GET /api/programs/search?filters...` — returns filtered, sorted programs
- [ ] `GET /api/programs/[slug]` — single program with flags
- [ ] Rate limiting on search endpoint (PRD §12.5)
- [ ] Response includes `dataVerifiedAt` for disclaimer

---

## 5. Phase 3 — Conversational Search (Client-Side Parser)

Per PRD §7.4–7.5: rule-based, no cross-origin API, browser memory only.

### Step 3.1 — Chat UI component
- [ ] Always-visible chat panel on `/search` (collapsible on mobile)
- [ ] Context-aware opening prompts based on result count:
  - Many results: "Try narrowing by budget or format"
  - Few results: "Want to broaden categories?"
  - Zero results: "Let's adjust your filters"
- [ ] Message history in React state (session only)

### Step 3.2 — Intent parser (`lib/chat-parser.ts`)
Implement phrase → filter mappings; pass all PRD §14.2 scenarios:

| Input | Expected filter change |
|---|---|
| "only fully funded programs" | fullyFunded toggle ON |
| "my son just finished 11th grade" | grade chip: 11th |
| "something in science or math" | STEM + Math category chips |
| "residential only, not online" | format: Residential |
| "highly competitive only" | admission: Highly Competitive |
| "under 5000 dollars" | max price: Under $5k |
| "start over" | clear all filters |
| "why is Harvard SSP still showing?" | no filter change; helpful response |

- [ ] Question guard: detect interrogatives / "why" / "what" → respond without mutating filters
- [ ] Emit filter state patch → sync to chip UI (PRD §7.5)
- [ ] Log anonymized chat events for product research (PRD §4.5) — store filter state + raw text, not user ID for anonymous sessions

### Step 3.3 — Filter state management
- [ ] Single source of truth: URL search params + React context (or Zustand)
- [ ] Chip click and chat parser both write to same store
- [ ] Bidirectional sync verified by tests

---

## 6. Phase 4 — Auth, Payments & Shortlist Workspace (Paid Tier)

### Step 4.1 — Authentication
- [ ] NextAuth Google OAuth as sole sign-in (PRD §12.2)
- [ ] Session tokens; 30-day inactivity expiry
- [ ] Auth triggered on first "Save" click (PRD §7.8, QA §14.3)

### Step 4.2 — Stripe seasonal pass ($49)
- [ ] Stripe Checkout session for `season_pass` product
- [ ] Webhook: `checkout.session.completed` → set `seasonPassActive=true`, `seasonPassExpires=next June 30` (Aug–Jun cycle per PRD §13)
- [ ] No auto-renewal
- [ ] Entitlement check middleware before any write to shortlist
- [ ] Payment replay protection / webhook idempotency (QA §14.5)
- [ ] Pricing page copy per PRD §16.5

### Step 4.3 — Shortlist CRUD
- [ ] Save program to default shortlist (or prompt to create named list)
- [ ] Multiple named lists per account (unlimited with one pass)
- [ ] Remove from shortlist
- [ ] Status pipeline: Researching → Deadline Noted → Applied → Waitlisted → Accepted → Declined
- [ ] User-entered deadline field per program
- [ ] Free-text notes per program
- [ ] Privacy notice at first note entry (PRD §12.4)
- [ ] Notes encrypted at rest (PRD §12.3)
- [ ] Strict account scoping — no cross-account access (QA §14.3)

### Step 4.4 — Dashboard `/dashboard` (Asset: Isabelle dashboard mockup)
- [ ] Sidebar nav: Dashboard, Search Programs, My Shortlist, Compare, Calendar, Notes
- [ ] Filter presets section (STEM Focus, Fully Funded, Residential, International) — links to saved search URLs
- [ ] Stats cards: Saved Programs, Upcoming Deadlines, Applications Started, Offers Received
- [ ] "My Programs" table: Program, Category, Location, Dates, Cost, Status, Notes, actions menu
- [ ] "View as Board" toggle (Kanban by status) — can ship as Phase 4 stretch
- [ ] Upcoming Deadlines sidebar (from user-entered deadlines)
- [ ] Recent Notes sidebar
- [ ] Bottom feature banner: Compare / Deadlines / Notes value props

### Step 4.5 — Compare view `/compare`
- [ ] Select 2–4 programs from shortlist
- [ ] Side-by-side table: price, selectivity, dates, credit, flags, notes
- [ ] Print-friendly layout

### Step 4.6 — Shareable read-only links
- [ ] Generate signed, expiring token per shortlist (PRD §12.2)
- [ ] Incognito view: list visible, no edit controls (QA §14.3)
- [ ] 403 / expired message after 30 days (QA §14.5)

### Step 4.7 — Export
- [ ] Export shortlist to CSV
- [ ] Export shortlist to PDF (program names, notes, status, deadlines)
- [ ] Verify all fields present (QA §14.3)

### Step 4.8 — Account management
- [ ] Delete account → cascade delete notes/shortlists within 30 days (QA §14.3)

---

## 7. Phase 5 — Program Contact Form

Per PRD §7.7:
- [ ] Accessible from every program card + dedicated `/contact` page ("Add or Update a Program")
- [ ] Fields: name, email, program name, inquiry type (Update / Dispute flag / Add new / Other), message, website URL
- [ ] Server-side validation + XSS sanitization
- [ ] Rate limit: 429 after threshold (QA §14.5 — 20 submits / 60s)
- [ ] Route to internal team via email (Resend/Postmark)
- [ ] Store submission in `contact_submissions` table
- [ ] User-facing confirmation with response SLA (5 business days disputes, 30 days new programs)

---

## 8. Phase 6 — Analytics & Observability

Per PRD §4.5 and §11 (Plausible + custom events):
- [ ] Pageviews + referrer tracking
- [ ] Custom events:
  - `search_run` (with filter state summary, result count)
  - `chat_sent`
  - `program_saved`
  - `flag_clicked`
  - `contact_form_submitted`
  - `payment_completed`
  - `status_changed`
- [ ] No PII in behavioral events; anonymize at capture
- [ ] Chat logs retained 12 months for internal review (PRD §4.5.4)
- [ ] Error monitoring (Sentry optional)

---

## 9. Phase 7 — Testing & QA

### Step 7.1 — Unit tests
- [ ] Grade normalization (PRD §14.1 — current vs. rising, age-based)
- [ ] Price parser (fully funded detection, range extraction)
- [ ] Admission type classifier
- [ ] Chat parser (all PRD §14.2 cases)
- [ ] Filter OR logic for categories

### Step 7.2 — Integration tests
- [ ] Search API with combined filters
- [ ] Auth-gated shortlist writes return 401 without session
- [ ] Stripe webhook → entitlement update
- [ ] Share link read-only enforcement

### Step 7.3 — E2E tests (Playwright)
- [ ] Happy path: land → search with grade → filter → view flags → save → pay → add note
- [ ] Zero-results graceful exit
- [ ] XSS in notes does not execute (QA §14.5)
- [ ] COSMOS shows CA residents flag regardless of user location

### Step 7.4 — Manual QA checklist
Run all scenarios in PRD §14.1–14.5 before launch.

---

## 10. Phase 8 — Security & Launch Prep

Per PRD §12:
- [ ] HTTPS + HSTS
- [ ] CSP headers
- [ ] Input sanitization on notes and contact form
- [ ] RLS policies on Supabase tables
- [ ] Dependency scanning in CI (Dependabot)
- [ ] Rate limiting on search + contact endpoints
- [ ] Privacy policy page (behavioral data, note privacy, no ad tracking)
- [ ] Terms of service + disclaimer
- [ ] Responsible disclosure policy + security contact email
- [ ] Pre-launch penetration test scope: auth, workspace access, payments

---

## 11. Phase 9 — Deployment & Operations

- [ ] Vercel production + preview environments
- [ ] Supabase production project with backups
- [ ] Stripe live mode keys (after test mode QA)
- [ ] Domain + DNS (e.g. `groundwork.app` or TBD)
- [ ] `dataVerifiedAt` displayed site-wide; calendar reminder for annual September refresh
- [ ] Runbook: CSV re-import, flag review, deploy steps
- [ ] Estimated MVP ops cost: $180–280/month (PRD §13.4)

---

## 12. Build Order (Suggested Sprints)

| Sprint | Focus | Deliverable |
|---|---|---|
| **S1** | Setup + data | Repo, design tokens, CSV import script, seeded DB, 138 programs queryable |
| **S2** | Search MVP | Landing page, `/search` with chips + cards + flags + sort + zero state |
| **S3** | Chat + polish | Rule-based chat parser, filter sync, active filter bar, disclaimer UI |
| **S4** | Workspace UX | Dashboard, shortlists, notes, status, deadlines (localStorage until auth) |
| **S5** | Compare + share + export | Compare view, share links, CSV/PDF export |
| **S6** | Contact + analytics | Contact form, Plausible events |
| **S7** | Auth + pay | Google sign-in, Stripe $49 pass, migrate workspace to account |
| **S8** | QA + security + launch | Full PRD §14 pass, pen test, production deploy |

**Note:** S4 (auth/pay) was originally sprint 4 but is deferred until workspace UX (old S5–S6) is validated. Shortlist data uses browser `localStorage` until S7 wires Supabase + entitlements.

---

## 13. Open Questions for Product Owner

These do not block planning but should be confirmed before Sprint 2:

1. **Domain / branding assets:** Final domain name? Logo SVG? Custom category illustrations ready or use placeholders for MVP?
2. **Institution field:** CSV lacks sponsoring institution as a separate column — OK to infer from name (e.g. "MIT RSI" → MIT) or manual curation pass?
3. **Duplicate rows:** CMU/Stony Brook have multiple tracks as separate rows — treat as distinct programs or group under one parent?
4. **Dashboard for anonymous users:** Show marketing landing only, or a demo dashboard with sample data?
5. **Calendar / Notes nav items:** Full feature in MVP or stub pages linking to dashboard sections?
6. **Admin UI for program edits:** Script-only import for MVP, or lightweight admin panel for annual refresh?
7. **Share link expiry:** PRD says 30 days — confirm default TTL.
8. **Season pass expiry date:** PRD says Aug–Jun cycle — confirm exact `seasonPassExpires` logic (June 30 vs. August 1 start).

---

## 14. Definition of Done (MVP Launch)

- [ ] 138 programs imported with ≥95% successful grade/price/admission normalization (remainder flagged for manual review)
- [ ] All 6+ curated gotcha flags live with source citations
- [ ] Search returns results in <500ms for typical filter combinations
- [ ] Chat parser passes all PRD §14.2 test phrases
- [ ] First-save flow: auth → Stripe → shortlist save works end-to-end
- [ ] Dashboard matches core mockup: stats, table, deadlines sidebar
- [ ] Contact form live with rate limiting
- [ ] Plausible tracking key PRD §11 metrics
- [ ] Privacy policy + disclaimer visible
- [ ] QA scenarios §14.1–14.5 signed off

---

*Last updated: July 21, 2026 — Planning document only. No application code created yet.*
