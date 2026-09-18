/**
 * Quick sanity check for admission + price normalization.
 * Run: npx tsx scripts/verify-normalization.ts
 */
import { normalizeAdmissionType } from "../src/lib/data/normalize-admission";
import { normalizeFormat } from "../src/lib/data/normalize-format";
import { normalizeGrade, gradeMatchesFilter } from "../src/lib/data/normalize-grade";
import { programContainedInDateWindow } from "../src/lib/data/matches-date-window-filter";
import { matchesDataQuery } from "../src/lib/data/matches-data-query";
import { parseDateWindowQuery } from "../src/lib/search/parse-date-window-query";
import {
  promoteDateWindowFromMessage,
  sanitizeFilterPatch,
} from "../src/lib/search/llm-parse-schema";
import {
  matchesLocationQuery,
  resolveLocationQuery,
} from "../src/lib/data/matches-location";
import {
  formatGradeEligibilityDisplay,
  gradeEligibilityLabel,
} from "../src/lib/data/format-grade-display";
import {
  parseDatesFromCsv,
  parseGradesFromCsv,
  parsePriceFromCsv,
} from "../src/lib/data/parse-csv-program-fields";
import { filterPrograms, sortPrograms } from "../src/lib/data/filter-programs";
import { participantGenderMatchesFilter } from "../src/lib/data/matches-participant-gender";
import {
  buildSearchResultItems,
  countSearchResultItems,
  formatGroupDateRange,
  formatGroupPriceRange,
  groupProgramsByTrack,
  trackGroupLabel,
  variantOfferingLabel,
} from "../src/lib/data/group-search-results";
import {
  programMatchesMonthFilter,
  programOverlapsMonth,
} from "../src/lib/data/matches-month-filter";
import { roundMarketingCount } from "../src/lib/programs/marketing-count-label";
import {
  catalogOfferingCount,
  catalogProgramFamilyCount,
  MARKETING_OFFERING_COUNT_LABEL,
  MARKETING_PROGRAM_COUNT_LABEL,
} from "../src/lib/programs/catalog-counts";
import { formatCompareLength } from "../src/lib/data/format-compare-length";
import { inclusiveDaySpanFromIso } from "../src/lib/data/parse-dates-display";
import { parsePrice } from "../src/lib/data/parse-price";
import { matchesPriceFilter } from "../src/lib/data/matches-price-filter";
import type { Program } from "../src/lib/types/program";

const admissionCases: [string, string][] = [
  ["First-come", "first_come"],
  ["Rolling", "first_come"],
  ["Highly competitive (4% acceptance)", "highly_competitive"],
  ["Selective (deadline Feb 28)", "application"],
  ["Rolling/selective", "application"],
];

let failed = 0;

for (const [raw, expected] of admissionCases) {
  const { admissionType } = normalizeAdmissionType(raw);
  if (admissionType !== expected) {
    console.error(`FAIL admission: "${raw}" → ${admissionType}, expected ${expected}`);
    failed++;
  }
}

const contact = parsePrice("Contact program");
if (!contact.priceUnknown) {
  console.error("FAIL: Contact program should be priceUnknown");
  failed++;
}

const included = matchesPriceFilter(contact, "under_2k", false);
const excluded = matchesPriceFilter(contact, "under_2k", true);
if (!included || excluded) {
  console.error("FAIL: Contact program price filter behavior");
  failed++;
}

const free = parsePrice("Free");
if (!free.fullyFunded || free.priceMin !== 0) {
  console.error("FAIL: Free price parsing");
  failed++;
}

const cosmosPrice = parsePrice("$5,518 + $46 application fee (need-based aid available)");
if (cosmosPrice.priceMin !== 5518 || cosmosPrice.priceMax !== 5518) {
  console.error(
    `FAIL: COSMOS price should ignore application fee, got min=${cosmosPrice.priceMin} max=${cosmosPrice.priceMax}`,
  );
  failed++;
}
const cosmosProgram = {
  priceMin: cosmosPrice.priceMin,
  priceMax: cosmosPrice.priceMax,
  priceUnknown: cosmosPrice.priceUnknown,
  fullyFunded: cosmosPrice.fullyFunded,
};
if (matchesPriceFilter(cosmosProgram, "under_2k", true)) {
  console.error("FAIL: COSMOS should not match under $2k after application fee is excluded");
  failed++;
}

const formatCases: [string, string[]][] = [
  ["Commuter", ["commuter"]],
  ["Day", ["commuter"]],
  ["Residential", ["residential"]],
  ["Residential/Commuter", ["residential", "commuter"]],
  ["Residential/Commuter/Online", ["commuter", "online", "residential"]],
];

for (const [raw, expected] of formatCases) {
  const { formatTags } = normalizeFormat(raw);
  const sorted = [...formatTags].sort();
  const expectedSorted = [...expected].sort();
  if (sorted.join(",") !== expectedSorted.join(",")) {
    console.error(`FAIL format: "${raw}" → [${sorted.join(", ")}], expected [${expectedSorted.join(", ")}]`);
    failed++;
  }
}

const risingTenth = normalizeGrade("Rising 10th grade");
if (
  risingTenth.gradeCompletedMin !== 9 ||
  risingTenth.gradeCompletedMax !== 9 ||
  gradeMatchesFilter(risingTenth, [12])
) {
  console.error("FAIL: Rising 10th grade should map to completed 9 and not match grade 12");
  failed++;
}

const risingRange = normalizeGrade("Rising 10-12");
if (risingRange.gradeCompletedMin !== 9 || risingRange.gradeCompletedMax !== 11) {
  console.error("FAIL: Rising 10-12 should map to completed grades 9-11");
  failed++;
}

const currentGrades = normalizeGrade("Grades 9-12");
if (currentGrades.gradeCompletedMin !== 9 || currentGrades.gradeCompletedMax !== 12) {
  console.error("FAIL: Grades 9-12 (current) should map to completed grades 9-12");
  failed++;
}

const stubProgram = (overrides: Partial<Program> & Pick<Program, "name" | "locationDisplay">): Program =>
  ({
    id: "stub",
    slug: "stub",
    category: "stem-engineering",
    secondaryTags: [],
    gradeDisplay: "9-12",
    gradeCompletedMin: 9,
    gradeCompletedMax: 12,
    admissionType: "application",
    admissionDisplay: "Application",
    formatDisplay: "Residential",
    formatTags: ["residential"],
    durationBucket: "two_to_four_weeks",
    lengthDisplay: "4 weeks",
    datesDisplay: "",
    isInternational: false,
    hasCollegeCredit: false,
    creditDisplay: "No",
    priceDisplay: "$0",
    priceMin: 0,
    priceMax: 0,
    priceUnknown: false,
    fullyFunded: false,
    financialAidAvailable: false,
    websiteUrl: "https://example.com",
    flags: [],
    participantGender: "coed",
    seasonYear: 2026,
    reviewStatus: "provisional",
    dataVerifiedAt: "2026-01-01",
    ...overrides,
  }) as Program;

const cosmos = stubProgram({
  name: "COSMOS UC Davis",
  locationDisplay: "UC Davis, CA",
  stateRestriction: "CA",
});

const stanford = stubProgram({
  name: "Stanford AI4ALL",
  locationDisplay: "Stanford CA",
});

if (resolveLocationQuery("stanford") !== undefined) {
  console.error('FAIL: "stanford" should not resolve to a state');
  failed++;
}

if (resolveLocationQuery("california") !== "california") {
  console.error('FAIL: "california" should still resolve to california');
  failed++;
}

if (resolveLocationQuery("san francisco") !== undefined) {
  console.error('FAIL: "san francisco" should not resolve to all of california');
  failed++;
}

if (resolveLocationQuery("los angeles") !== undefined) {
  console.error('FAIL: "los angeles" should not resolve to all of california');
  failed++;
}

if (resolveLocationQuery("marin") !== undefined) {
  console.error('FAIL: "marin" should not fuzzy-resolve to Maine');
  failed++;
}

const laProgram = stubProgram({
  name: "UCLA Pre-College",
  locationDisplay: "Los Angeles, CA",
  trackDetail: "Session 1",
});

const yosemiteProgram = stubProgram({
  name: "Lasting Adventures - Yosemite",
  locationDisplay: "Yosemite National Park, CA",
  trackDetail: "Departure 1",
});

if (!matchesLocationQuery(laProgram, "los angeles")) {
  console.error('FAIL: Los Angeles program should match location query "los angeles"');
  failed++;
}

if (matchesLocationQuery(yosemiteProgram, "los angeles")) {
  console.error('FAIL: Yosemite program should not match location query "los angeles"');
  failed++;
}

const maineProgram = stubProgram({
  name: "Apogee Adventures - Maine Coast Junior",
  locationDisplay: "Maine",
  trackDetail: "Session 1",
});

if (matchesLocationQuery(maineProgram, "marin")) {
  console.error('FAIL: Maine program should not match location query "marin"');
  failed++;
}

if (resolveLocationQuery("IDTech") !== undefined) {
  console.error('FAIL: "IDTech" should not resolve to a state');
  failed++;
}

if (resolveLocationQuery("ID Tech") !== undefined) {
  console.error('FAIL: "ID Tech" should not resolve to Idaho');
  failed++;
}

if (resolveLocationQuery("id") !== "idaho") {
  console.error('FAIL: standalone "id" should still resolve to idaho');
  failed++;
}

if (resolveLocationQuery("in ID") !== "idaho") {
  console.error('FAIL: "in ID" should resolve to idaho');
  failed++;
}

if (resolveLocationQuery("Cambridge, MA") !== "massachusetts") {
  console.error('FAIL: "Cambridge, MA" should resolve to massachusetts');
  failed++;
}

if (matchesDataQuery(cosmos, "stanford")) {
  console.error("FAIL: COSMOS should not match dataQuery stanford");
  failed++;
}

if (!matchesDataQuery(stanford, "stanford")) {
  console.error("FAIL: Stanford program should match dataQuery stanford");
  failed++;
}

const marist = stubProgram({
  name: "Marist Pre-College",
  locationDisplay: "Poughkeepsie, NY",
  gradeDisplay: "High school",
});

if (!matchesDataQuery(marist, "marist")) {
  console.error("FAIL: Marist Pre-College should match dataQuery marist");
  failed++;
}

if (matchesDataQuery(marist, "marist university")) {
  console.error("FAIL: strict match should require university in program text");
  failed++;
}

if (!matchesDataQuery(marist, "marist university", { relaxInstitutionSuffixes: true })) {
  console.error("FAIL: relaxed match should ignore trailing university");
  failed++;
}

if (matchesDataQuery(marist, "stanford university", { relaxInstitutionSuffixes: true })) {
  console.error("FAIL: relaxed Marist match should still require marist");
  failed++;
}

if (!matchesDataQuery(stanford, "stanford university", { relaxInstitutionSuffixes: true })) {
  console.error("FAIL: Stanford program should match stanford university when relaxed");
  failed++;
}

const costaRicaProgram = stubProgram({
  name: "AMIGOS de las Americas",
  locationDisplay: "Costa Rica",
  trackDetail: "La Brunca (Explore) - Session 1",
});

const panamaProgramWithCostaRicaFlag = stubProgram({
  name: "AMIGOS de las Americas",
  locationDisplay: "Panama",
  trackDetail: "El Valle (Explore) - Session 1",
  flags: [
    {
      id: "flag-1",
      type: "selectivity",
      title: "No Immerse tier offered in Panama",
      body: "Unlike Costa Rica, Dominican Republic, and Paraguay, Panama does not offer an Immerse-tier program.",
      sourceCitation: "AMIGOS Programs page",
      severity: "info",
    },
  ],
});

if (!matchesDataQuery(costaRicaProgram, "costa rica")) {
  console.error('FAIL: Costa Rica program should match dataQuery "costa rica"');
  failed++;
}

if (matchesDataQuery(panamaProgramWithCostaRicaFlag, "costa rica")) {
  console.error(
    'FAIL: Panama program should not match dataQuery "costa rica" via incidental flag mention',
  );
  failed++;
}

const yosemiteBackpacking = stubProgram({
  name: "Lasting Adventures - Yosemite",
  locationDisplay: "Yosemite National Park, CA",
  trackDetail: "6-Day Young Adventurer's Program - Jun 13-18 Departure",
  description: "Introductory 6-day wilderness backpacking camp in Yosemite for ages 11-13.",
});

const alpsTrekking = stubProgram({
  name: "Overland - Pyrenees Expedition",
  locationDisplay: "Pyrenees",
  trackDetail: "Departure 1",
  description: "Extended Pyrenees trekking trip.",
});

if (!matchesDataQuery(yosemiteBackpacking, "backpacking")) {
  console.error(
    'FAIL: backpacking should match description on schedule-style track labels',
  );
  failed++;
}

if (!matchesDataQuery(alpsTrekking, "backpacking")) {
  console.error('FAIL: backpacking should match trekking/mountain travel descriptions');
  failed++;
}

const diplomacyProgram = stubProgram({
  name: "CIEE - Diplomacy & Government (Brussels)",
  locationDisplay: "Brussels, Belgium",
  trackDetail: "Summer Session I",
});

const georgetownCatalog = stubProgram({
  name: "Summer Discovery - Georgetown University",
  locationDisplay: "Washington, D.C. (Georgetown University campus)",
  trackDetail: "Individual Courses - 2-Week Residential (Session 1)",
  description:
    "Session 1 topics: Governing America, International Relations, Mock Trial, Psychology.",
});

if (!matchesDataQuery(diplomacyProgram, "international relations")) {
  console.error('FAIL: international relations should match diplomacy program names');
  failed++;
}

if (!matchesDataQuery(georgetownCatalog, "international relations")) {
  console.error(
    'FAIL: international relations should match catalog course lists on Individual Courses tracks',
  );
  failed++;
}

const icelandProgram = stubProgram({
  name: "Overland - Iceland Explorer",
  locationDisplay: "Iceland",
  trackDetail: "Departure 1",
});

const irelandProgram = stubProgram({
  name: "TFT - Scotland & Ireland Adventure",
  locationDisplay: "Scotland and Ireland",
  trackDetail: "Session 1",
});

if (!matchesDataQuery(icelandProgram, "iceland")) {
  console.error('FAIL: Iceland program should match dataQuery "iceland"');
  failed++;
}

if (matchesDataQuery(icelandProgram, "ireland")) {
  console.error('FAIL: Iceland program should not match dataQuery "ireland"');
  failed++;
}

if (!matchesDataQuery(irelandProgram, "ireland")) {
  console.error('FAIL: Ireland program should match dataQuery "ireland"');
  failed++;
}

if (matchesDataQuery(irelandProgram, "iceland")) {
  console.error('FAIL: Ireland program should not match dataQuery "iceland"');
  failed++;
}

const moroccoProgram = stubProgram({
  name: "CIEE - Arabic Language & Moroccan Culture (Rabat)",
  locationDisplay: "Rabat, Morocco",
  trackDetail: "Summer Session I",
});

const ghanaProgram = stubProgram({
  name: "CIEE - Leadership & Service in Children's Education (Legon)",
  locationDisplay: "Legon, Ghana",
  trackDetail: "Summer Session I",
});

if (!matchesDataQuery(moroccoProgram, "africa")) {
  console.error('FAIL: Morocco program should match dataQuery "africa"');
  failed++;
}

if (!matchesDataQuery(ghanaProgram, "africa")) {
  console.error('FAIL: Ghana program should match dataQuery "africa"');
  failed++;
}

const greeceProgram = stubProgram({
  name: "CIEE - Architecture & Greek Culture (Athens)",
  locationDisplay: "Athens, Greece",
  trackDetail: "Summer Session I",
  description:
    "Visits to the Stavros Niarchos Foundation Cultural Center and an urban scavenger hunt through Anafiotika/Plaka.",
});

if (matchesDataQuery(greeceProgram, "africa")) {
  console.error('FAIL: Greece program should not match dataQuery "africa"');
  failed++;
}

const peruProgram = stubProgram({
  name: "Rustic Pathways - Sacred Valley Service (Peru)",
  locationDisplay: "Sacred Valley, Peru",
  trackDetail: "Session 1",
});

const mexicoProgram = stubProgram({
  name: "CIEE - Spanish Language & Mexican Culture (Merida)",
  locationDisplay: "Merida, Mexico",
  trackDetail: "Summer Session I",
});

const dominicanProgram = stubProgram({
  name: "AMIGOS de las Americas",
  locationDisplay: "Dominican Republic",
  trackDetail: "Session 1",
});

const australiaProgram = stubProgram({
  name: "Moondance Adventures - Australia",
  locationDisplay: "Australia",
  trackDetail: "Departure 1",
});

if (!matchesDataQuery(peruProgram, "south america")) {
  console.error('FAIL: Peru program should match dataQuery "south america"');
  failed++;
}

if (matchesDataQuery(mexicoProgram, "south america")) {
  console.error('FAIL: Mexico program should not match dataQuery "south america"');
  failed++;
}

if (!matchesDataQuery(dominicanProgram, "caribbean")) {
  console.error('FAIL: Dominican Republic program should match dataQuery "caribbean"');
  failed++;
}

if (!matchesDataQuery(australiaProgram, "australia")) {
  console.error('FAIL: Australia program should match dataQuery "australia"');
  failed++;
}

const australiaNonCaribbean = stubProgram({
  name: "ActionQuest - Reef to Rainforest (Australia)",
  locationDisplay: "Sydney, Whitsunday Islands, Daintree, Gold Coast",
  trackDetail: "21-Day Session (Jul 7-27)",
  description:
    "AQ's only non-Caribbean program and only one with a mandatory group flight (LAX to Sydney).",
});

const costaRicaCaribbeanCoast = stubProgram({
  name: "AMIGOS de las Americas",
  locationDisplay: "Costa Rica",
  trackDetail: "Olas y Cerros (Explore) - Session 1",
  description:
    "Three-week host-family homestay program on Costa Rica's Caribbean coast focused on sea turtle conservation.",
});

if (matchesDataQuery(australiaNonCaribbean, "caribbean")) {
  console.error(
    'FAIL: Australia program mentioning "non-Caribbean" in description should not match dataQuery "caribbean"',
  );
  failed++;
}

if (matchesDataQuery(costaRicaCaribbeanCoast, "caribbean")) {
  console.error(
    'FAIL: Costa Rica program on the Caribbean coast should stay on Costa Rica, not dataQuery "caribbean"',
  );
  failed++;
}

const caribbeanMarineBiology = stubProgram({
  name: "Broadreach - Caribbean Marine Biology Voyage",
  locationDisplay: "St. Martin + the Leewards, Caribbean",
  trackDetail: "Departure 1",
  description: "Introductory marine biology voyage in the Caribbean.",
});

const marineEcology = stubProgram({
  name: "CIEE - Marine Ecology & Sustainability (Nice)",
  locationDisplay: "Nice, France",
  trackDetail: "Summer Session I",
});

if (!matchesDataQuery(caribbeanMarineBiology, "marine biology")) {
  console.error('FAIL: marine biology should match Caribbean Marine Biology program');
  failed++;
}

if (!matchesDataQuery(marineEcology, "marine biology")) {
  console.error('FAIL: marine biology should match Marine Ecology program name');
  failed++;
}

const filmWithSharedDayToDay = stubProgram({
  name: "SOCAPA - New York City",
  locationDisplay: "New York, NY",
  trackDetail: "Film/Screenwriting - Session 1 (Day)",
  description: "Two-week screenwriting and filmmaking intensive; day format.",
  dayToDay: {
    notes:
      "Evening trips include Broadway shows and Coney Island; master class with actors and directors.",
    sourceType: "official_policy",
    sourceCitation: "SOCAPA NYC campus page (socapa.org)",
    verifiedAt: "2026-09-15",
  },
});

if (matchesDataQuery(filmWithSharedDayToDay, "broadway")) {
  console.error("FAIL: film offering should not match query via shared day-to-day notes");
  failed++;
}

if (matchesDataQuery(filmWithSharedDayToDay, "acting program")) {
  console.error("FAIL: film offering should not match acting query via shared day-to-day notes");
  failed++;
}

const actingOffering = stubProgram({
  name: "SOCAPA - New York City",
  locationDisplay: "New York, NY",
  trackDetail: "Core Acting - Session 1 2WK (Day)",
  description: "Two-week acting intensive; day format.",
});

if (!matchesDataQuery(actingOffering, "acting program")) {
  console.error('FAIL: acting offering should match dataQuery "acting program"');
  failed++;
}

const photoCrossTrackMention = stubProgram({
  name: "SOCAPA - New York City",
  locationDisplay: "New York, NY",
  trackDetail: "Core Photography (Digital) - Session 1 3WK (Residential)",
  description:
    "Three-week digital photography intensive including a movie-poster collaboration with filmmaking/acting students.",
});

if (matchesDataQuery(photoCrossTrackMention, "acting program")) {
  console.error(
    "FAIL: photography offering should not match acting query via cross-track description mention",
  );
  failed++;
}

const catalogIntensives = stubProgram({
  name: "Interlochen Arts Camp - High School",
  locationDisplay: "Interlochen, MI",
  trackDetail: "Instrumental & Vocal Intensives - 1-Week",
  catalogOffering: true,
  description:
    "One-week intensive; offerings include violin, viola, cello, and piano among 20+ instrument tracks.",
});

if (!matchesDataQuery(catalogIntensives, "violin program")) {
  console.error('FAIL: catalog offering should match "violin program" via description');
  failed++;
}

if (!matchesDataQuery(catalogIntensives, "cello")) {
  console.error('FAIL: catalog offering should match single-term "cello" via description');
  failed++;
}

const nonCatalogWithInstrumentMention = stubProgram({
  name: "Example Camp",
  locationDisplay: "Boston, MA",
  trackDetail: "General Photography",
  description: "Includes a field trip to hear violin students at a partner school.",
});

if (matchesDataQuery(nonCatalogWithInstrumentMention, "violin")) {
  console.error("FAIL: non-catalog row should not match violin via incidental description mention");
  failed++;
}

const julyWindow = parseDateWindowQuery("include only programs that run from July 15-31");
if (!julyWindow || julyWindow.dateWindowStart !== "2027-07-15" || julyWindow.dateWindowEnd !== "2027-07-31") {
  console.error("FAIL: should parse July 15-31 date window for 2027");
  failed++;
}

const julyBetween = parseDateWindowQuery("find programs that run between july 15 and 31");
if (
  !julyBetween ||
  julyBetween.dateWindowStart !== "2027-07-15" ||
  julyBetween.dateWindowEnd !== "2027-07-31"
) {
  console.error('FAIL: should parse "between july 15 and 31" date window for 2027');
  failed++;
}

const promoted = promoteDateWindowFromMessage("programs from July 15-31", { includeMonths: [7] });
if (promoted.includeMonths?.length || promoted.dateWindowStart !== "2027-07-15") {
  console.error("FAIL: date window promotion should replace includeMonths");
  failed++;
}

const promotedBetween = promoteDateWindowFromMessage(
  "find programs that run between july 15 and 31",
  { dateWindowStart: "2023-07-15", dateWindowEnd: "2023-07-31", includeMonths: [7] },
);
if (
  promotedBetween.dateWindowStart !== "2027-07-15" ||
  promotedBetween.dateWindowEnd !== "2027-07-31" ||
  promotedBetween.includeMonths?.length
) {
  console.error("FAIL: between-query promotion should override wrong-year LLM window");
  failed++;
}

const wrongYearSanitized = sanitizeFilterPatch({
  dateWindowStart: "2023-07-15",
  dateWindowEnd: "2023-07-31",
});
if (
  wrongYearSanitized.dateWindowStart !== "2027-07-15" ||
  wrongYearSanitized.dateWindowEnd !== "2027-07-31"
) {
  console.error("FAIL: sanitizeFilterPatch should normalize date window year to target season");
  failed++;
}

const weekInside = stubProgram({
  name: "One Week Camp",
  locationDisplay: "Boston, MA",
  dateStart: "2027-07-20",
  dateEnd: "2027-07-26",
  lengthMinDays: 7,
});
const seasonLong = stubProgram({
  name: "Season Camp",
  locationDisplay: "Yosemite, CA",
  dateStart: "2027-06-06",
  dateEnd: "2027-08-13",
});
if (!programContainedInDateWindow(weekInside, "2027-07-15", "2027-07-31")) {
  console.error("FAIL: one-week program inside July 15-31 should match contained window");
  failed++;
}
if (programContainedInDateWindow(seasonLong, "2027-07-15", "2027-07-31")) {
  console.error("FAIL: season-long program should not match contained July 15-31 window");
  failed++;
}

const laDepartures = Array.from({ length: 5 }, (_, index) =>
  stubProgram({
    name: "Lasting Adventures Yosemite",
    locationDisplay: "Yosemite, CA",
    dateStart: `2027-07-${String(6 + index * 7).padStart(2, "0")}`,
    dateEnd: `2027-07-${String(11 + index * 7).padStart(2, "0")}`,
    datesDisplay: "Jul 6–11, 2027",
    lengthDisplay: "6 days",
    lengthMinDays: 6,
    seasonYear: 2027,
    reviewStatus: "verified",
  }),
);
const laGroupDates = formatGroupDateRange(laDepartures);
if (!laGroupDates.includes("5 sessions") || !laGroupDates.includes("6 days options")) {
  console.error(`FAIL: grouped card should summarize multi-session dates, got "${laGroupDates}"`);
  failed++;
}

const mathPathAge = normalizeGrade("Ages 11-14");
if (mathPathAge.gradeCompletedMax !== 8) {
  console.error(
    `FAIL: Ages 11-14 should map to max grade 8, got ${mathPathAge.gradeCompletedMax}`,
  );
  failed++;
}

const mathPathGrade = {
  gradeCompletedMin: mathPathAge.gradeCompletedMin,
  gradeCompletedMax: mathPathAge.gradeCompletedMax,
  gradeSource: mathPathAge.gradeSource,
};
if (gradeMatchesFilter(mathPathGrade, [12])) {
  console.error("FAIL: Ages 11-14 program should not match completed grade 12");
  failed++;
}

const risingJrSrAge = normalizeGrade("Rising Jr/Sr (ages 15-17)");
const risingJrSrGrade = {
  gradeCompletedMin: risingJrSrAge.gradeCompletedMin,
  gradeCompletedMax: risingJrSrAge.gradeCompletedMax,
  gradeSource: risingJrSrAge.gradeSource,
};
if (gradeMatchesFilter(risingJrSrGrade, [12])) {
  console.error("FAIL: Rising Jr/Sr (ages 15-17) should not match completed grade 12");
  failed++;
}
if (!gradeMatchesFilter(risingJrSrGrade, [11])) {
  console.error("FAIL: Rising Jr/Sr (ages 15-17) should match completed grade 11");
  failed++;
}

const hsJuniors = normalizeGrade("HS Juniors");
if (hsJuniors.gradeCompletedMin !== 11 || hsJuniors.gradeCompletedMax !== 11) {
  console.error(
    `FAIL: HS Juniors should map to grade 11, got ${hsJuniors.gradeCompletedMin}-${hsJuniors.gradeCompletedMax}`,
  );
  failed++;
}
const princetonGrade = {
  gradeCompletedMin: hsJuniors.gradeCompletedMin,
  gradeCompletedMax: hsJuniors.gradeCompletedMax,
  gradeSource: hsJuniors.gradeSource,
};
if (gradeMatchesFilter(princetonGrade, [10])) {
  console.error("FAIL: HS Juniors program should not match grade 10");
  failed++;
}

const ageGrades = parseGradesFromCsv({
  "Grades Display": "Ages 13-18 (grouped 13-15 & 15-18)",
  "Grade Completed Min": "7",
  "Grade Completed Max": "12",
});
if (ageGrades.gradeSource !== "age" || ageGrades.gradeCompletedMin !== 7) {
  console.error("FAIL: 2027 grade columns should honor explicit min/max with age display");
  failed++;
}
if (gradeMatchesFilter(ageGrades, [6])) {
  console.error("FAIL: Ages 13-18 (grades 7-12) should not match completed grade 6");
  failed++;
}
if (!gradeMatchesFilter(ageGrades, [7])) {
  console.error("FAIL: Ages 13-18 (grades 7-12) should match completed grade 7");
  failed++;
}

const youngAdventurersGrades = parseGradesFromCsv({
  "Grades Display": "Ages 11-13 (completed grades 5-7, per program site)",
  "Grade Completed Min": "5",
  "Grade Completed Max": "7",
});
if (!gradeMatchesFilter(youngAdventurersGrades, [6])) {
  console.error("FAIL: Ages 11-13 (grades 5-7) should match completed grade 6");
  failed++;
}
if (gradeEligibilityLabel(ageGrades) !== "Ages") {
  console.error("FAIL: age-based programs should use Ages label");
  failed++;
}
const youngAdventurersDisplay = formatGradeEligibilityDisplay({
  gradeSource: "age",
  gradeDisplay: "Ages 11-13 (completed grades 5-7, per program site)",
  gradeCompletedMin: 5,
  gradeCompletedMax: 7,
});
if (
  youngAdventurersDisplay !==
  "Ages 11-13 per program site (matches completed grades 5–7 in search filters)"
) {
  console.error(`FAIL: age eligibility display format, got "${youngAdventurersDisplay}"`);
  failed++;
}

const broadreachMsGrades = parseGradesFromCsv({
  "Grades Display":
    "Completing grades 6-8 (must be 12 years old by program start)",
  "Grade Completed Min": "6",
  "Grade Completed Max": "8",
});
if (broadreachMsGrades.gradeSource !== "grade") {
  console.error("FAIL: Broadreach MS should use grade gradeSource");
  failed++;
}
if (broadreachMsGrades.gradeCompletedMin !== 6 || broadreachMsGrades.gradeCompletedMax !== 8) {
  console.error("FAIL: Broadreach MS should map to completed grades 6-8");
  failed++;
}
if (gradeEligibilityLabel(broadreachMsGrades) !== "Grades") {
  console.error("FAIL: Broadreach MS should use Grades label");
  failed++;
}
const broadreachMsDisplay = formatGradeEligibilityDisplay(broadreachMsGrades);
if (
  broadreachMsDisplay !==
  "Completing grades 6-8 (must be 12 years old by program start)"
) {
  console.error(`FAIL: Broadreach MS display format, got "${broadreachMsDisplay}"`);
  failed++;
}
if (!gradeMatchesFilter(broadreachMsGrades, [6, 7, 8])) {
  console.error("FAIL: Broadreach MS should match completed grades 6-8");
  failed++;
}
if (gradeMatchesFilter(broadreachMsGrades, [5])) {
  console.error("FAIL: Broadreach MS should not match completed grade 5");
  failed++;
}

const isoDates = parseDatesFromCsv(
  {
    "Date Start": "2027-06-06",
    "Date End": "2027-08-13",
    "Dates Display": "10 weekly departures, Sun-Fri, Jun 6 - Aug 13 2027",
    "Dates Parse Quality": "approximate",
  },
  2027,
);
if (isoDates.dateStart !== "2027-06-06" || isoDates.datesParseQuality !== "approximate") {
  console.error("FAIL: 2027 ISO date columns should import directly");
  failed++;
}

const structuredPrice = parsePriceFromCsv({
  "Price Display": "$1990",
  "Price Min": "1990",
  "Price Max": "1990",
  "Fully Funded": "No",
  "Financial Aid Available": "No",
});
if (structuredPrice.priceMin !== 1990 || structuredPrice.priceUnknown) {
  console.error("FAIL: 2027 structured price columns");
  failed++;
}

const verifiedProgram = stubProgram({
  name: "Alpha Camp",
  locationDisplay: "Boston, MA",
  admissionType: "first_come",
  seasonYear: 2027,
  reviewStatus: "verified",
});
const pendingProgram = stubProgram({
  name: "Beta Camp",
  locationDisplay: "Boston, MA",
  admissionType: "first_come",
  seasonYear: 2026,
  reviewStatus: "provisional",
});
const sortedBySelectivity = sortPrograms([pendingProgram, verifiedProgram], "selectivity");
if (sortedBySelectivity[0]?.id !== verifiedProgram.id) {
  console.error("FAIL: verified 2027 programs should tiebreak above pending when selectivity matches");
  failed++;
}

const shortProgram = stubProgram({
  name: "Short Camp",
  locationDisplay: "Boston, MA",
  lengthMinDays: 6,
  lengthMaxDays: 6,
  lengthDisplay: "6 days",
});
const longProgram = stubProgram({
  name: "Long Camp",
  locationDisplay: "Boston, MA",
  lengthMinDays: 28,
  lengthMaxDays: 28,
  lengthDisplay: "4 weeks",
});
const sortedByDuration = sortPrograms([longProgram, shortProgram], "duration");
if (sortedByDuration[0]?.id !== shortProgram.id) {
  console.error("FAIL: duration sort should order by lengthMinDays shortest first");
  failed++;
}

const catalinaJulySession = stubProgram({
  name: "Catalina Sea Camp",
  locationDisplay: "Toyon Bay, Catalina Island, CA",
  dateStart: "2027-07-05",
  dateEnd: "2027-07-22",
  seasonYear: 2027,
});
const catalinaJulyAugustSession = stubProgram({
  name: "Catalina Sea Camp",
  locationDisplay: "Toyon Bay, Catalina Island, CA",
  dateStart: "2027-07-24",
  dateEnd: "2027-08-10",
  seasonYear: 2027,
});
if (!programOverlapsMonth(catalinaJulySession, 7)) {
  console.error("FAIL: 2027 July session should overlap July filter");
  failed++;
}
if (!programMatchesMonthFilter(catalinaJulyAugustSession, [7])) {
  console.error("FAIL: 2027 session starting in July should match July filter");
  failed++;
}
if (!programMatchesMonthFilter(catalinaJulyAugustSession, [8])) {
  console.error("FAIL: 2027 session ending in August should match August filter");
  failed++;
}

const socapaActingDay = stubProgram({
  id: "socapa-acting-day",
  name: "SOCAPA - New York City",
  locationDisplay: "New York, NY",
  programGroupId: "socapa-nyc",
  trackDetail: "Core Acting - Session 1 2WK (Day)",
  priceMin: 2500,
  priceMax: 2500,
  priceDisplay: "$2,500",
});
const socapaActingRes = stubProgram({
  id: "socapa-acting-res",
  name: "SOCAPA - New York City",
  locationDisplay: "New York, NY",
  programGroupId: "socapa-nyc",
  trackDetail: "Core Acting - Session 1 2WK (Residential)",
  priceMin: 4500,
  priceMax: 4500,
  priceDisplay: "$4,500",
});
const socapaFilm = stubProgram({
  id: "socapa-film",
  name: "SOCAPA - New York City",
  locationDisplay: "New York, NY",
  programGroupId: "socapa-nyc",
  trackDetail: "Filmmaking - Session 1 2WK (Day)",
  priceMin: 2500,
  priceMax: 2500,
  priceDisplay: "$2,500",
});
const loneProgram = stubProgram({
  id: "lone-camp",
  name: "Lone Camp",
  locationDisplay: "Boston, MA",
  programGroupId: "lone-camp",
});

const interlochenHarp = stubProgram({
  id: "interlochen-harp",
  name: "Interlochen Arts Camp - High School",
  locationDisplay: "Interlochen, MI",
  programGroupId: "interlochen-high-school",
  trackDetail: "Harp - 6-Week",
});

const groupedItems = buildSearchResultItems([
  socapaActingDay,
  socapaActingRes,
  socapaFilm,
  loneProgram,
]);
if (groupedItems.length !== 2) {
  console.error(`FAIL: expected 2 search result items (1 group + 1 single), got ${groupedItems.length}`);
  failed++;
}
const socapaGroup = groupedItems.find((item) => item.kind === "group");
if (!socapaGroup || socapaGroup.kind !== "group" || socapaGroup.programs.length !== 3) {
  console.error("FAIL: SOCAPA NYC should collapse into one grouped item with 3 offerings");
  failed++;
}
const singleItem = groupedItems.find((item) => item.kind === "single");
if (!singleItem || singleItem.kind !== "single" || singleItem.program.id !== "lone-camp") {
  console.error("FAIL: standalone row without trackDetail should render as a single card");
  failed++;
}

const loneTrackMatch = buildSearchResultItems([interlochenHarp]);
if (
  loneTrackMatch.length !== 1 ||
  loneTrackMatch[0]?.kind !== "group" ||
  loneTrackMatch[0].kind !== "group" ||
  loneTrackMatch[0].programs.length !== 1
) {
  console.error("FAIL: one matching track at a grouped campus should use grouped card");
  failed++;
}
if (countSearchResultItems([socapaActingDay, socapaActingRes, socapaFilm]) !== 1) {
  console.error("FAIL: grouped result count should be 1 for three SOCAPA NYC matches");
  failed++;
}

if (trackGroupLabel("Core Acting - Session 1 2WK (Day)") !== "Core Acting") {
  console.error("FAIL: trackGroupLabel should strip session suffix");
  failed++;
}
if (
  variantOfferingLabel("Core Acting - Session 1 2WK (Day)", "Core Acting") !==
  "Session 1 2WK (Day)"
) {
  console.error("FAIL: variantOfferingLabel should return session/format suffix");
  failed++;
}

const trackGroups = groupProgramsByTrack([socapaActingDay, socapaActingRes, socapaFilm]);
if (trackGroups.length !== 2) {
  console.error(`FAIL: expected 2 track groups, got ${trackGroups.length}`);
  failed++;
}
if (formatGroupPriceRange([socapaActingDay, socapaActingRes]) !== "$2,500–$4,500") {
  console.error(`FAIL: group price range, got "${formatGroupPriceRange([socapaActingDay, socapaActingRes])}"`);
  failed++;
}

if (roundMarketingCount(168) !== "160+") {
  console.error("FAIL: roundMarketingCount under 200 should floor to nearest 10");
  failed++;
}
if (roundMarketingCount(413) !== "400+") {
  console.error("FAIL: roundMarketingCount at 200+ should floor to nearest 50");
  failed++;
}
if (roundMarketingCount(199) !== "190+") {
  console.error("FAIL: roundMarketingCount 199 should be 190+");
  failed++;
}
if (roundMarketingCount(200) !== "200+") {
  console.error("FAIL: roundMarketingCount 200 should be 200+");
  failed++;
}
if (MARKETING_OFFERING_COUNT_LABEL !== roundMarketingCount(catalogOfferingCount)) {
  console.error("FAIL: offering marketing label should match rounded catalog count");
  failed++;
}
if (MARKETING_PROGRAM_COUNT_LABEL !== roundMarketingCount(catalogProgramFamilyCount)) {
  console.error("FAIL: program marketing label should match rounded family count");
  failed++;
}

if (inclusiveDaySpanFromIso("2027-07-11", "2027-07-24") !== 14) {
  console.error("FAIL: inclusiveDaySpanFromIso Jul 11–24 should be 14 days");
  failed++;
}
if (
  formatCompareLength({
    dateStart: "2027-07-11",
    dateEnd: "2027-07-24",
    lengthDisplay: "2 weeks",
    lengthMinDays: 14,
    lengthMaxDays: 14,
  }) !== "14 days"
) {
  console.error("FAIL: formatCompareLength should prefer calendar days from dates");
  failed++;
}
if (
  formatCompareLength({
    dateStart: null,
    dateEnd: null,
    lengthDisplay: "2 weeks",
    lengthMinDays: 14,
    lengthMaxDays: 14,
  }) !== "14 days"
) {
  console.error("FAIL: formatCompareLength should fall back to lengthMinDays without dates");
  failed++;
}

const girlsProgram = stubProgram({
  name: "Chimney Corners Camp",
  locationDisplay: "Becket, MA",
  participantGender: "girls-inclusive",
});
const boysProgram = stubProgram({
  name: "Camp Becket",
  locationDisplay: "Becket, MA",
  participantGender: "boys",
});
const coedProgram = stubProgram({
  name: "Generic Coed Camp",
  locationDisplay: "Boston, MA",
  participantGender: "coed",
});

if (!participantGenderMatchesFilter(girlsProgram, ["girls", "girls-inclusive"])) {
  console.error("FAIL: girls-inclusive program should match girls-only filter");
  failed++;
}
if (participantGenderMatchesFilter(coedProgram, ["girls", "girls-inclusive"])) {
  console.error("FAIL: coed program should not match girls-only filter");
  failed++;
}
if (!participantGenderMatchesFilter(boysProgram, ["boys"])) {
  console.error("FAIL: boys program should match boys-only filter");
  failed++;
}

const genderFilterResults = filterPrograms(
  [girlsProgram, boysProgram, coedProgram],
  {
    gradesCompleted: [9],
    categories: [],
    admissionTypes: [],
    formats: [],
    durationBuckets: [],
    collegeCreditOnly: false,
    fullyFundedOnly: false,
    priceFilter: "any",
    maxPrice: null,
    minPrice: null,
    usOnly: false,
    internationalOnly: false,
    excludeUnknownPrice: false,
    includePendingSeasonRefresh: true,
    dataQuery: "",
    excludeLocation: "",
    includeRegions: [],
    includeLocations: [],
    includeMonths: [],
    excludeMonths: [],
    minDurationWeeks: null,
    maxDurationWeeks: null,
    dateWindowStart: null,
    dateWindowEnd: null,
    participantGenders: ["girls", "girls-inclusive"],
  },
);
if (genderFilterResults.length !== 1 || genderFilterResults[0]?.name !== "Chimney Corners Camp") {
  console.error("FAIL: girls-only filter should return only girls-inclusive program");
  failed++;
}

if (failed === 0) {
  console.log("All normalization checks passed.");
} else {
  process.exit(1);
}
