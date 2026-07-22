# Data model & CSV schema

Last updated: Sprint 1 (July 2026)

## Final CSV columns (expected)

| Column | Notes |
|---|---|
| Program Name | Required |
| Primary Category | One of 12 values — see `src/lib/constants/categories.ts` |
| Secondary Tags | Comma-separated |
| Any additional details about specific track | Optional; used in slug for duplicate program names |
| Grades | Normalized to grade-completed range at import (PRD §4.4) |
| Admission Type | Free text → normalized to 3 enums |
| Length | Display + duration bucket |
| Dates 2026 | Display string |
| Location | Display + international detection |
| **Format** | `Residential`, `Online`, or `Both` |
| Credit | Display + boolean |
| Price | May be numeric, range, `Free`, or **`Contact program`** |
| URL | Program website |
| **Flags** | JSON array of gotcha flags (schema below) |

## Twelve categories

Categories are used **directly from the CSV** — no mapping to the PRD's nine-bucket taxonomy. UI groups may still visually cluster related categories on the landing page.

1. Artificial Intelligence  
2. STEM/Engineering  
3. College-Credit Pre-College  
4. Marine Science  
5. Writing/Humanities  
6. Traditional Camp  
7. Outdoor/Wilderness  
8. Cultural Exchange  
9. Leadership/Gifted  
10. Mathematics  
11. Biomedical  
12. Arts  

## Admission type normalization

All raw strings map to:

- `first_come` — First-Come  
- `application` — Application  
- `highly_competitive` — Highly Competitive  

Implementation: `src/lib/data/normalize-admission.ts`

## Price: "Contact program" and search behavior

### Parsing

| Raw value | priceUnknown | priceMin / priceMax | fullyFunded |
|---|---|---|---|
| `Contact program` | `true` | `null` | `false` |
| `Free`, `Fully funded` | `false` | `0` | `true` |
| `$3,150.00` | `false` | 3150 / 3150 | `false` |
| `$3748 … $10858` | `false` | 3748 / 10858 | `false` |

### Filter behavior (decision)

**Default: include unknown-price programs in price-filtered results.**

Rationale: many selective pre-college programs list "Contact program" on our sheet. Excluding them when a parent filters "Under $5k" would silently drop Harvard, BU, Georgetown, etc. — damaging trust.

When included:

- Card shows `Contact program` (or "Price not listed") prominently
- Optional badge: "Verify cost on program site"
- Sort by price puts unknown-price programs last

**Strict mode** (`excludeUnknownPrice: true`):

- When any specific price filter is active (not "Any"), unknown-price programs are excluded
- Can be exposed as an advanced toggle in Sprint 2: "Hide programs without listed price"

Implementation: `src/lib/data/matches-price-filter.ts`

## Gotcha flags (curated layer)

PRD §4.2 / §7.3 flags are maintained in `data/seed/flags.json` and merged onto programs at import by program name match. Each flag requires `sourceCitation` and `sourceDate`.

| Program match | Flags |
|---|---|
| All **COSMOS** rows (6 campuses) | CA residents only; $200 non-refundable deposit |
| **MIT Research Science Institute (RSI)** | ~4% acceptance; PSAT Math 740+ floor; fully funded |
| **Harvard Secondary School Program (SSP)** | SEVP certification terminated May 2025; 55% campus crime increase 2022–2023 |
| **Interlochen Arts Camp** | Abuse allegations; external investigation; Epstein donor 1990–2003 |
| **Outward Bound** | Mandatory 24–72 hr solo wilderness camping |
| **Overland Summers** | Staff pay $2,000–3,000/summer; turnover risk |

Additional flags (e.g. Wake Forest deposit) may be added as research warrants. CSV `Flags` column JSON merges with and can override curated flags by `id`.

Each flag object:

```json
{
  "id": "cosmos-ca-residency",
  "type": "residency",
  "title": "California residents only",
  "body": "COSMOS accepts entering grades 9–12 who are California residents.",
  "sourceCitation": "COSMOS program eligibility page",
  "sourceDate": "2026-01-15",
  "severity": "warning"
}
```

Flag types: `safety`, `deposit`, `selectivity`, `residency`, `physical`, `turnover`, `other`

All flags must include `sourceCitation` (PRD §7.3).

## Open items (finalize with CSV)

- [ ] Exact `Flags` column format (JSON string vs. separate flags CSV keyed by slug)
- [ ] Institution column — add to CSV or infer from name?
- [ ] Grade normalization test cases against final grade strings
