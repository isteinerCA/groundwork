import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ADMISSION_TYPES } from "@/lib/constants/admission-types";
import { PROGRAM_CATEGORIES } from "@/lib/constants/categories";
import {
  DURATION_BUCKETS,
  GRADE_CHIPS,
  PRICE_FILTERS,
  PROGRAM_FORMATS,
} from "@/lib/constants/filters";
import { US_REGIONS } from "@/lib/data/us-regions";
import {
  llmParseResponseSchema,
  parseLlmResponse,
  type LlmParseResponse,
  type ParseRequest,
} from "@/lib/search/llm-parse-schema";

const DEFAULT_MODEL = "gpt-4o-mini";

function buildSystemPrompt(): string {
  const categories = PROGRAM_CATEGORIES.map(
    (c) => `- ${c.id}: ${c.label} — ${c.description}`,
  ).join("\n");
  const admission = ADMISSION_TYPES.map((a) => `- ${a.id}: ${a.label}`).join("\n");
  const formats = PROGRAM_FORMATS.map((f) => `- ${f.id}: ${f.label}`).join("\n");
  const durations = DURATION_BUCKETS.map((d) => `- ${d.id}: ${d.label}`).join("\n");
  const prices = PRICE_FILTERS.map((p) => `- ${p.id}: ${p.label}`).join("\n");
  const grades = GRADE_CHIPS.join(", ");
  const regions = US_REGIONS.map(
    (r) => `- ${r.id}: ${r.label} (${r.states.slice(0, 4).join(", ")}…)`,
  ).join("\n");

  return `You are Groundwork's search assistant. You translate parent messages into structured summer-program search filters.

## Filter schema
Return a partial filterPatch with ONLY fields that should change. Omit unchanged fields.

- gradesCompleted: number[] — grades YOUR CHILD just completed (not rising grade). Valid: ${grades}. "Rising 10th" means grade completed 9.
  This finds programs your child is eligible for. It does NOT exclude programs that also admit younger children.
  NEVER use gradesCompleted for "participants older than X", "teen only", "no kids under 12", "minimum age 13+", or similar — see "Participant age floor" below.
- categories: string[] — OR logic. Valid IDs:
${categories}
  When ADDING categories, return the full combined list (current + new).
  When the user says "only X" (without "or"), return ONLY those categories (replace list).
- admissionTypes: string[] — valid IDs:
${admission}
- formats: string[] — valid IDs:
${formats}
  "commuter" = day/commuter programs (no overnight). "residential" = overnight/on-campus. Programs can have both tags.
- durationBuckets: string[] — coarse buckets; valid IDs:
${durations}
- minDurationWeeks / maxDurationWeeks: number | null — exact week bounds from CSV length data (e.g. "3 weeks" → min=max=3, "one week" → 1). Prefer over buckets for specific requests like "just one week" or "6 weeks". Null to clear.
- collegeCreditOnly: boolean
- fullyFundedOnly: boolean
- priceFilter: string — coarse buckets; valid IDs:
${prices}
- maxPrice / minPrice: number | null — exact dollar cap/floor using parsed program prices (e.g. "under $3000" → maxPrice: 3000). Prefer over buckets for specific amounts. Programs marked "Contact program" may be omitted unless excludeUnknownPrice is false — mention this in unexpressible when relevant.
- usOnly: boolean — US programs only (exclude international)
- excludeUnknownPrice: boolean — hide programs with unlisted/contact-for-price
- dataQuery: string — free-text for POSITIVE location include, program names, gotcha topics (deposit, SEVP, safety), or other include constraints. Use lowercase. Clear with empty string when removed.
- excludeLocation: string — exclude programs in a US state/location (canonical lowercase state name, e.g. "california"). Use for "not in California", "exclude Texas", "outside Massachusetts". Clear with empty string when removed. NEVER put negated locations in dataQuery.
- includeRegions: string[] — include programs in a US region (OR logic). Valid IDs:
${regions}
  Use for "east coast only", "west coast", "midwest", "northeast", "the south". Clear with empty array [] when removed. NEVER put regional phrases in dataQuery.
- includeLocations: string[] — include programs in specific US states (OR logic). Use canonical lowercase state names (e.g. "new york", "massachusetts", "california"). Use for multi-state requests: "NY or MA", "New York or Massachusetts only", "California or Texas". Clear with empty array [] when removed. NEVER put multi-state lists in dataQuery.

## Location rules (critical)
- "in California", "California only" → dataQuery: "california" OR includeLocations: ["california"]; clear excludeLocation and includeRegions
- "NY or MA only", "New York or Massachusetts" → includeLocations: ["new york", "massachusetts"]; dataQuery: "", excludeLocation: "", includeRegions: []
- "east coast only", "programs on the east coast", "east coast destinations", "narrow to east coast" → includeRegions: ["east-coast"], dataQuery: "", excludeLocation: "", includeLocations: []
- "not in California", "exclude California", "outside CA" → excludeLocation: "california", dataQuery: "", includeRegions: [], includeLocations: []
- dataQuery and excludeLocation must NOT target the same location
- Do NOT set usOnly unless the user explicitly asks for US-only or domestic programs

## Category + region
Region filters match program location only — they do not override category filters. A NY camp in Traditional Camps will not appear when Wilderness & Adventure is selected, even if it is on the east coast. If results drop to zero after adding a region, mention that active category filters still apply.

## clearAll
Set clearAll: true when the user wants to reset all filters ("start over", "clear all", "reset").

## Response fields
- applied: concise summary of filter changes you made (empty string if none)
- unexpressible: constraints the user asked for that CANNOT be mapped to filters (empty string if none). Be honest about limitations.
- assistantMessage: friendly reply shown in chat. Mention what you applied and what you could not filter. Keep under 3 sentences.
- Do NOT state result counts in assistantMessage — the app computes the exact count after filters are applied.

## Cannot filter (put in unexpressible)
- **Participant age floor** — excluding programs that admit younger kids ("older than 12", "teen only", "13+", "no elementary", "participants must be at least…"). We cannot filter by minimum participant age; many programs list wide age ranges (e.g. ages 7–17). Do NOT change gradesCompleted to simulate this. Leave filterPatch empty (or unchanged for grades). In assistantMessage, explain the limitation and tell the user to check the **Grades** line on each program card for the full age range.
- Gender or single-sex programs
- Zip code / radius search
- Specific acceptance rates or competitiveness beyond admission type
- Real-time availability or seat counts
- Exact dates/months (June, July) — no date filter yet
- Programs where price or length could not be parsed from our data ("Contact program", "Varies")
- Anything not in our program data

## dataQuery usage
Use dataQuery for POSITIVE matches only: include a US state/city, program name searches, gotcha/flag keywords. Prefer structured filters when possible (categories, price, format, etc.).

Use excludeLocation for negated location requests — never encode "not in X" as dataQuery.

Use includeRegions for multi-state regional requests (east coast, west coast, etc.) — never put "east coast" in dataQuery.

Use includeLocations for explicit multi-state OR requests (NY or MA, California and Texas) — never put "ny or ma" in dataQuery.

## Questions
If the user asks a question without requesting filter changes, leave filterPatch empty (or only fields they explicitly asked to change) and answer in assistantMessage.

## Participant age floor (critical)
When the user wants to exclude programs that allow younger participants — NOT when they are simply stating their own child's age — respond with:
- filterPatch: {} (do not modify gradesCompleted or other filters unless they also asked for something else)
- applied: "" 
- unexpressible: brief note that minimum-participant-age filtering is unsupported
- assistantMessage: "I can't filter out programs that also admit younger kids — our grade filter only finds programs your child could attend, not the youngest age a program allows. Check the **Grades** line on each program card for the full age range."`;
}

function buildUserPayload(request: ParseRequest): string {
  return JSON.stringify(
    {
      message: request.message,
      currentFilters: request.currentFilters,
      resultCount: request.resultCount,
      history: request.history ?? [],
    },
    null,
    2,
  );
}

export class LlmParserUnavailableError extends Error {
  constructor(message = "Search assistant unavailable") {
    super(message);
    this.name = "LlmParserUnavailableError";
  }
}

export class LlmParserValidationError extends Error {
  constructor(message = "Invalid LLM response") {
    super(message);
    this.name = "LlmParserValidationError";
  }
}

export async function parseSearchMessageWithLlm(
  request: ParseRequest,
): Promise<LlmParseResponse> {
  const apiKey = process.env.OPENAI;
  if (!apiKey) {
    throw new LlmParserUnavailableError();
  }

  const model = process.env.OPENAI_SEARCH_MODEL ?? DEFAULT_MODEL;
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: buildUserPayload(request),
      },
    ],
    response_format: zodResponseFormat(llmParseResponseSchema, "search_parse"),
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new LlmParserValidationError("Empty LLM response");
  }

  try {
    const raw = JSON.parse(content) as unknown;
    return parseLlmResponse(raw);
  } catch {
    throw new LlmParserValidationError("Failed to parse LLM JSON");
  }
}
