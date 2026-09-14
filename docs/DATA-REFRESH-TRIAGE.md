# Annual refresh — triage tracker

Last updated: September 2026

Spreadsheet workflow for **prioritizing research and ingestion** during Groundwork’s annual summer-program refresh. Use this starting with the **2028 season** (or any future cycle once the [DATA-2027 schema](./DATA-2027.md) is live).

**Related docs:** [DATA-2027.md](./DATA-2027.md) (CSV schema, Review Status, row-split rules), [DATA.md](./DATA.md) (flags and day-to-day overlays)

> **2027 note:** The 2027 refresh established the schema and intake backlog mid-cycle. A triage tracker was piloted partway through that cycle but is **not required** for 2027 completion. Treat this document as the standard editorial workflow from **2028 onward**.

---

## What it is

A **triage tracker** is a spreadsheet (Excel, Google Sheets, etc.) that sits between “programs we might add or update” and the publishable season CSV. It answers, per program group:

1. **When** should we ingest? (Is target-season info live? When is it expected?)
2. **How hard** is ingestion? (One row vs many — campuses, courses, format tiers)
3. **What fine print** should we surface later? (flags, day-to-day candidates)
4. **What happens to last year’s catalog?** (net-new, expand existing, skip duplicate, update group ID)

The working copy typically lives **outside the repo** (e.g. `Groundwork 2028 Refresh — Triage Tracker.xlsx`). Export or paste rows when a program group is ready to promote.

---

## Where it sits in the pipeline

| Phase | Source of truth | Published? |
|---|---|---|
| Candidate list | Intake backlog or prior season catalog | No |
| **Research & prioritization** | **Triage tracker spreadsheet** | No |
| Structured catalog | `data/source/summer-programs-{YEAR}.csv` | Yes, after import |
| Curated overlays | `data/seed/flags.json`, `data/seed/day-to-day.json` | Yes, merged at import |

**No ongoing sync** is required between an intake markdown file and the triage tracker. Once research starts, the tracker supersedes intake notes for facts discovered in the field. When details are confirmed, feed ready rows from the tracker (or a research deliverable from Claude or similar) for CSV authoring.

This supports **category-by-category refresh** — e.g. verify Cultural Exchange / global trips as soon as hosts publish, while pre-college rows stay `Not Yet Posted` until later. See [Rolling refresh & review status](./DATA-2027.md#rolling-refresh--review-status) in DATA-2027.

---

## Recommended columns

### Core (timing & research status)

| Column | Purpose |
|---|---|
| **Intake #** | Optional link to intake backlog row number |
| **Program Group** | Human-readable program family name |
| **Draft Program Group ID** | Stable slug for CSV + flags + day-to-day (e.g. `hotchkiss-summer-portals`) |
| **Primary Category** | Groundwork category — drives refresh priority by theme |
| **Intake Batch / Theme** | Research batch label for context (e.g. Robotics, Global trips) |
| **Page Currently Shows** | What the program site displays today (target season live, prior season dates, interest list only, etc.) |
| **Status** | Editorial queue state — see [Status values](#status-values) below |
| **Expected Open ({season})** | When applications or target-season details are expected (date or window) |
| **Recheck after** | Optional — date to revisit rows that are `Not Yet Posted` or `Needs Direct Recheck` |
| **Confidence** | `Confirmed` · `Confirmed (partial)` · `Estimated (moderate)` · `Estimated (low)` · `Unverified` |
| **Source** | URL(s) checked — official pages only when possible |
| **Reviewed Date** | Last research pass (ISO date) |

### Ingestion planning

| Column | Purpose |
|---|---|
| **Catalog action** | `net-new` · `expand existing` · `duplicate-skip` · `update group ID` · `needs decision` |
| **Est. CSV rows** | Rough row count after DATA-2027 splits (one campus, one course, one format tier, etc.) |
| **Target Review Status** | First published CSV status: `verified` · `provisional` · `awaiting_source` · `needs_review` |
| **Structural notes** | Row-split plan, vendor umbrellas, format tiers, eligibility constraints |

### Future surfacing (capture now, publish later)

| Column | Purpose |
|---|---|
| **Notes** | Free-form research recap |
| **Flags candidates** | Bullets for `flags.json` — deposits, residency, selectivity, safety, etc. |
| **Day-to-day candidates** | Bullets for `day-to-day.json` — curfew, independence, supervision, daily structure |

At promote time, structural notes become CSV fields; flag and day-to-day candidates become curated JSON entries keyed by **Draft Program Group ID**. See [Day-to-day experience](./DATA-2027.md#day-to-day-experience-curated-layer) and [Gotcha flags](./DATA.md#gotcha-flags-curated-layer).

---

## Status values

Suggested **Status** dropdown values (align with when to ingest):

| Status | Meaning | Typical next step |
|---|---|---|
| **Open (confirmed)** | Target-season details live on official source | Ingest soon as `verified` |
| **Open (confirmed, partial)** | Some tracks/sessions confirmed, not all | Ingest confirmed offerings; note gaps |
| **Not Yet Posted** | Host has not published target-season info | Wait; set **Recheck after** from **Expected Open** |
| **Not Yet Posted (interest list open)** | Waitlist / notify-me only | Optional `awaiting_source` placeholder row |
| **Needs Direct Recheck** | Ambiguous, conflicting, or stale page | Human re-read before any CSV row |
| **On hold** | Team decision pending (keep, split, exclude) | Resolve **Catalog action** first |

### Mapping to CSV Review Status

When promoting to `summer-programs-{YEAR}.csv`:

| Tracker signal | CSV **Review Status** |
|---|---|
| **Open (confirmed)** + **Confidence: Confirmed** | `verified` |
| Prior-season data carried forward with known gaps | `provisional` |
| Program expected but not announced | `awaiting_source` (optional publish) |
| Not ready for parents | `needs_review` (excluded at import) |

Full definitions: [Review Status values](./DATA-2027.md#review-status-values) in DATA-2027.

---

## Ingest priority (suggested)

When filtering the tracker for work:

1. **Open (confirmed)** — ingest first, especially early-publish categories (global trips, outdoor)
2. **Not Yet Posted** with a known **Expected Open** window — schedule recheck; do not ingest yet unless publishing `awaiting_source` placeholders
3. **Needs Direct Recheck** + high **Est. CSV rows** — research pass before CSV (vendor umbrellas, catalog overlap)
4. **Not Yet Posted (low confidence)** — backlog

Filter by **Primary Category** to refresh one theme at a time without blocking families in categories that are already live.

---

## Handoff to publish

When a row (or program group) is ready:

1. Confirm **Draft Program Group ID**, **Est. CSV rows**, and **Catalog action**
2. Export tracker row(s) or research output → provide for CSV authoring (e.g. paste in Cursor chat)
3. Write row(s) to `data/source/summer-programs-{YEAR}.csv` with **Review Status** = **Target Review Status**
4. Add **Flags candidates** / **Day-to-day candidates** to JSON overlays as curated entries
5. Run import + validation; deploy when ready (full season flip not required — rolling publish)

**Roles (suggested):**

| Task | Owner |
|---|---|
| Web research, timing checks | Research tool or human |
| Triage tracker maintenance | Editorial team |
| CSV row authoring + validation | Cursor / import pipeline |
| flags.json / day-to-day.json | Editorial review |

---

## Starting a new season (2028 checklist)

1. **Copy** last season’s triage tracker or start fresh from the current catalog export
2. **Set season column** labels (`Expected Open (2028)`, etc.)
3. **Reset** Status / Confidence for every row — re-verify; do not assume prior season carries forward
4. **Add** net-new candidates from intake or research
5. **Mark** catalog action for each group (`net-new`, `expand existing`, …)
6. **Work** Open (confirmed) rows first by category priority
7. **Promote** to CSV incrementally; archive tracker snapshot at season flip

---

## Open items (template & tooling)

- [ ] Spreadsheet template with dropdown validation for **Status**, **Confidence**, **Catalog action**, **Target Review Status**
- [ ] Optional: check template into repo under `docs/templates/` or link from this doc
- [ ] Validation report after import: counts by **Review Status** and **Program Group ID** by category
