export type GlobalAdventureGroupId = "where" | "what";

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
  { slug: "germany-programs", linkLabel: "Germany", dataQuery: "germany", group: "where" },
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
    slug: "south-korea-programs",
    linkLabel: "South Korea",
    dataQuery: "south korea",
    group: "where",
  },
  { slug: "iceland-programs", linkLabel: "Iceland", dataQuery: "iceland", group: "where" },
  { slug: "ireland-programs", linkLabel: "Ireland", dataQuery: "ireland", group: "where" },
  {
    slug: "caribbean-programs",
    linkLabel: "Caribbean",
    dataQuery: "caribbean",
    group: "where",
  },
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
    group: "what",
  },
  { slug: "safari-programs", linkLabel: "Safari", dataQuery: "safari", group: "what" },
  { slug: "sailing-programs", linkLabel: "Sailing", dataQuery: "sailing", group: "what" },
  { slug: "fashion-programs", linkLabel: "Fashion", dataQuery: "fashion", group: "what" },
  {
    slug: "photography-programs",
    linkLabel: "Photography",
    dataQuery: "photography",
    group: "what",
  },
  {
    slug: "architecture-programs",
    linkLabel: "Architecture",
    dataQuery: "architecture",
    group: "what",
  },
  {
    slug: "veterinary-studies-programs",
    linkLabel: "Veterinary studies",
    dataQuery: "veterinary",
    group: "what",
    titleLabel: "Veterinary studies programs",
  },
  {
    slug: "marine-biology-programs",
    linkLabel: "Marine biology",
    dataQuery: "marine biology",
    group: "what",
    titleLabel: "Marine biology programs",
  },
];
