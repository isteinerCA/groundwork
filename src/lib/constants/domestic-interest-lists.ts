export type DomesticInterestGroupId = "where" | "what";

export type DomesticInterestGroup = {
  id: DomesticInterestGroupId;
  title: string;
};

export type DomesticInterestListDef = {
  slug: string;
  linkLabel: string;
  /** Used when includeLocations is empty. */
  dataQuery: string;
  group: DomesticInterestGroupId;
  titleLabel?: string;
  /** Metro-area lists match any of these location terms (OR logic). */
  includeLocations?: string[];
};

export const DOMESTIC_INTEREST_GROUPS: DomesticInterestGroup[] = [
  { id: "where", title: "Where do you want to go?" },
  { id: "what", title: "What do you want to do?" },
];

export const DOMESTIC_INTEREST_LIST_DEFS: DomesticInterestListDef[] = [
  {
    slug: "hawaii-us-programs",
    linkLabel: "Hawaii",
    dataQuery: "hawaii",
    group: "where",
  },
  {
    slug: "alaska-us-programs",
    linkLabel: "Alaska",
    dataQuery: "alaska",
    group: "where",
  },
  {
    slug: "wyoming-us-programs",
    linkLabel: "Wyoming",
    dataQuery: "wyoming",
    group: "where",
  },
  {
    slug: "yosemite-us-programs",
    linkLabel: "Yosemite",
    dataQuery: "yosemite",
    group: "where",
    titleLabel: "Yosemite programs",
  },
  {
    slug: "vermont-us-programs",
    linkLabel: "Vermont",
    dataQuery: "vermont",
    group: "where",
  },
  {
    slug: "colorado-us-programs",
    linkLabel: "Colorado",
    dataQuery: "colorado",
    group: "where",
  },
  {
    slug: "new-york-us-programs",
    linkLabel: "New York",
    dataQuery: "new york",
    group: "where",
  },
  {
    slug: "boston-us-programs",
    linkLabel: "Boston & surroundings",
    dataQuery: "boston",
    group: "where",
    titleLabel: "Boston & surroundings programs",
  },
  {
    slug: "san-francisco-bay-area-us-programs",
    linkLabel: "San Francisco Bay Area",
    dataQuery: "",
    group: "where",
    titleLabel: "San Francisco Bay Area programs",
    includeLocations: [
      "san francisco",
      "berkeley",
      "oakland",
      "palo alto",
      "stanford",
      "marin",
      "san jose",
      "cupertino",
      "menlo park",
      "sausalito",
      "fremont",
      "mountain view",
      "sunnyvale",
      "san mateo",
      "redwood city",
    ],
  },
  {
    slug: "los-angeles-us-programs",
    linkLabel: "Los Angeles",
    dataQuery: "los angeles",
    group: "where",
  },
  {
    slug: "fashion-us-programs",
    linkLabel: "Fashion",
    dataQuery: "fashion",
    group: "what",
  },
  {
    slug: "photography-us-programs",
    linkLabel: "Photography",
    dataQuery: "photography",
    group: "what",
  },
  {
    slug: "architecture-us-programs",
    linkLabel: "Architecture",
    dataQuery: "architecture",
    group: "what",
  },
  {
    slug: "veterinary-studies-us-programs",
    linkLabel: "Veterinary studies",
    dataQuery: "veterinary",
    group: "what",
    titleLabel: "Veterinary studies programs",
  },
  {
    slug: "marine-biology-us-programs",
    linkLabel: "Marine biology",
    dataQuery: "marine biology",
    group: "what",
    titleLabel: "Marine biology programs",
  },
  {
    slug: "ai-us-programs",
    linkLabel: "AI",
    dataQuery: "artificial intelligence",
    group: "what",
    titleLabel: "AI programs",
  },
  {
    slug: "entrepreneurship-us-programs",
    linkLabel: "Entrepreneurship",
    dataQuery: "entrepreneurship",
    group: "what",
  },
  {
    slug: "ecology-us-programs",
    linkLabel: "Ecology",
    dataQuery: "ecology",
    group: "what",
  },
  {
    slug: "business-us-programs",
    linkLabel: "Business",
    dataQuery: "business",
    group: "what",
  },
  {
    slug: "marketing-us-programs",
    linkLabel: "Marketing",
    dataQuery: "marketing",
    group: "what",
  },
  {
    slug: "robotics-us-programs",
    linkLabel: "Robotics",
    dataQuery: "robotics",
    group: "what",
  },
  {
    slug: "engineering-us-programs",
    linkLabel: "Engineering",
    dataQuery: "engineering",
    group: "what",
  },
  {
    slug: "writing-us-programs",
    linkLabel: "Writing",
    dataQuery: "writing",
    group: "what",
  },
  {
    slug: "theater-us-programs",
    linkLabel: "Theater",
    dataQuery: "theater",
    group: "what",
    titleLabel: "Theater programs",
  },
  {
    slug: "music-us-programs",
    linkLabel: "Music",
    dataQuery: "music",
    group: "what",
  },
];
