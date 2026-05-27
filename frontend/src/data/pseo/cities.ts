// Top 10 priority US cities (per pSEO plan §3) — sorted by population/search volume.
export interface City {
  slug: string;
  name: string;
  state: string;
  stateAbbr: string;
  stateSlug: string;
  /** BLS MSA (Metropolitan Statistical Area) code */
  msaCode: string;
  population: number;
  /** Cost-of-living index relative to US average (100 = average) */
  colIndex: number;
  /** Brief paragraph describing the city's job market */
  marketSummary: string;
}

export const CITIES: City[] = [
  {
    slug: "new-york-ny", name: "New York", state: "New York", stateAbbr: "NY", stateSlug: "new-york",
    msaCode: "35620", population: 8336817, colIndex: 187,
    marketSummary: "New York hosts the country's largest concentration of finance, media, advertising and tech jobs. Salaries trend 25–40% above the national average but cost of living offsets much of the premium.",
  },
  {
    slug: "los-angeles-ca", name: "Los Angeles", state: "California", stateAbbr: "CA", stateSlug: "california",
    msaCode: "31080", population: 3979576, colIndex: 173,
    marketSummary: "LA is the entertainment and aerospace capital of the US, with strong tech and healthcare sectors. Salaries run 15–30% above national average; California state taxes are among the highest.",
  },
  {
    slug: "chicago-il", name: "Chicago", state: "Illinois", stateAbbr: "IL", stateSlug: "illinois",
    msaCode: "16980", population: 2693976, colIndex: 107,
    marketSummary: "Chicago's economy is anchored by finance, manufacturing, and a growing tech scene. Salaries are competitive without the coastal cost of living.",
  },
  {
    slug: "houston-tx", name: "Houston", state: "Texas", stateAbbr: "TX", stateSlug: "texas",
    msaCode: "26420", population: 2320268, colIndex: 96,
    marketSummary: "Houston is dominated by energy, healthcare and aerospace. Texas has no state income tax, which boosts effective take-home pay vs coastal cities.",
  },
  {
    slug: "phoenix-az", name: "Phoenix", state: "Arizona", stateAbbr: "AZ", stateSlug: "arizona",
    msaCode: "38060", population: 1680992, colIndex: 105,
    marketSummary: "Phoenix has seen rapid growth in tech, healthcare and finance services. Cost of living is moderate; state income tax is 2.5–4.5%.",
  },
  {
    slug: "san-francisco-ca", name: "San Francisco", state: "California", stateAbbr: "CA", stateSlug: "california",
    msaCode: "41860", population: 873965, colIndex: 244,
    marketSummary: "San Francisco offers the highest tech salaries in the country but cost of living is brutal — particularly housing. Many roles offer remote/hybrid flexibility.",
  },
  {
    slug: "austin-tx", name: "Austin", state: "Texas", stateAbbr: "TX", stateSlug: "texas",
    msaCode: "12420", population: 974447, colIndex: 119,
    marketSummary: "Austin has become a major tech hub with offices for Apple, Google, Tesla and many startups. No state income tax; housing has gotten expensive.",
  },
  {
    slug: "seattle-wa", name: "Seattle", state: "Washington", stateAbbr: "WA", stateSlug: "washington",
    msaCode: "42660", population: 753675, colIndex: 158,
    marketSummary: "Seattle is home to Amazon, Microsoft, Boeing and a thriving startup scene. Washington has no state income tax, which boosts net pay vs California.",
  },
  {
    slug: "denver-co", name: "Denver", state: "Colorado", stateAbbr: "CO", stateSlug: "colorado",
    msaCode: "19740", population: 715522, colIndex: 121,
    marketSummary: "Denver is a fast-growing tech and aerospace hub. Cost of living has risen but remains below coastal cities; Colorado state tax is a flat 4.4%.",
  },
  {
    slug: "miami-fl", name: "Miami", state: "Florida", stateAbbr: "FL", stateSlug: "florida",
    msaCode: "33100", population: 467963, colIndex: 123,
    marketSummary: "Miami has gained traction as a fintech and crypto hub. Florida has no state income tax. Cost of living is moderate but housing is climbing.",
  },
];

export const getCity = (slug: string) => CITIES.find((c) => c.slug === slug);
