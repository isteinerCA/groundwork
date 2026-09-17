export type DomesticInterestGroupId = "where" | "what";

export type DomesticInterestGroup = {
  id: DomesticInterestGroupId;
  title: string;
};

export type DomesticInterestListDef = {
  slug: string;
  linkLabel: string;
  dataQuery: string;
  group: DomesticInterestGroupId;
  titleLabel?: string;
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
];
