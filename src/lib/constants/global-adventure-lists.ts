export type GlobalAdventureGroupId = "where" | "what" | "dream-bigger";

export type GlobalAdventureGroup = {
  id: GlobalAdventureGroupId;
  title: string;
};

export type GlobalAdventureListDef = {
  slug: string;
  linkLabel: string;
  dataQuery: string;
  group: GlobalAdventureGroupId;
  titleLabel?: string;
};

export const GLOBAL_ADVENTURE_GROUPS: GlobalAdventureGroup[] = [
  { id: "where", title: "Where do you want to go?" },
  { id: "what", title: "What do you want to do?" },
  { id: "dream-bigger", title: "Dream bigger" },
];

export const GLOBAL_ADVENTURE_LIST_DEFS: GlobalAdventureListDef[] = [
  { slug: "japan-programs", linkLabel: "Japan", dataQuery: "japan", group: "where" },
  {
    slug: "costa-rica-programs",
    linkLabel: "Costa Rica",
    dataQuery: "costa rica",
    group: "where",
  },
  { slug: "france-programs", linkLabel: "France", dataQuery: "france", group: "where" },
  { slug: "china-programs", linkLabel: "China", dataQuery: "china", group: "where" },
  {
    slug: "galapagos-programs",
    linkLabel: "Galápagos",
    dataQuery: "galapagos",
    group: "where",
  },
  { slug: "greece-programs", linkLabel: "Greece", dataQuery: "greece", group: "where" },
  { slug: "africa-programs", linkLabel: "Africa", dataQuery: "africa", group: "where" },
  { slug: "spain-programs", linkLabel: "Spain", dataQuery: "spain", group: "where" },
  { slug: "italy-programs", linkLabel: "Italy", dataQuery: "italy", group: "where" },
  {
    slug: "sea-turtle-programs",
    linkLabel: "Sea turtles",
    dataQuery: "sea turtle",
    group: "what",
    titleLabel: "Sea turtle programs",
  },
  { slug: "scuba-programs", linkLabel: "Scuba", dataQuery: "scuba", group: "what" },
  {
    slug: "conservation-programs",
    linkLabel: "Conservation",
    dataQuery: "conservation",
    group: "what",
  },
  {
    slug: "entrepreneurship-programs",
    linkLabel: "Entrepreneurship",
    dataQuery: "entrepreneurship",
    group: "what",
  },
  {
    slug: "language-immersion-programs",
    linkLabel: "Language immersion",
    dataQuery: "language immersion",
    group: "what",
  },
  {
    slug: "backpacking-programs",
    linkLabel: "Backpacking",
    dataQuery: "backpacking",
    group: "what",
  },
  {
    slug: "kilimanjaro-programs",
    linkLabel: "Kilimanjaro",
    dataQuery: "kilimanjaro",
    group: "dream-bigger",
  },
  { slug: "safari-programs", linkLabel: "Safari", dataQuery: "safari", group: "dream-bigger" },
  { slug: "sailing-programs", linkLabel: "Sailing", dataQuery: "sailing", group: "dream-bigger" },
];
