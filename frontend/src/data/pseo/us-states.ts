// US-state catalog used by the /tax-tools/[state]/[tool] programmatic surface.
// Tax-rate fields are state-flat-rate approximations sufficient for SEO/schema
// purposes — the live tax calculator UI itself uses the existing bracket data
// in /app/backend (server-authoritative).

export interface USState {
  slug: string;     // url-safe lowercase ("california")
  abbrev: string;   // 2-letter ("CA")
  name: string;     // full name ("California")
}

export const US_STATES: USState[] = [
  { slug: "alabama", abbrev: "AL", name: "Alabama" },
  { slug: "alaska", abbrev: "AK", name: "Alaska" },
  { slug: "arizona", abbrev: "AZ", name: "Arizona" },
  { slug: "arkansas", abbrev: "AR", name: "Arkansas" },
  { slug: "california", abbrev: "CA", name: "California" },
  { slug: "colorado", abbrev: "CO", name: "Colorado" },
  { slug: "connecticut", abbrev: "CT", name: "Connecticut" },
  { slug: "delaware", abbrev: "DE", name: "Delaware" },
  { slug: "florida", abbrev: "FL", name: "Florida" },
  { slug: "georgia", abbrev: "GA", name: "Georgia" },
  { slug: "hawaii", abbrev: "HI", name: "Hawaii" },
  { slug: "idaho", abbrev: "ID", name: "Idaho" },
  { slug: "illinois", abbrev: "IL", name: "Illinois" },
  { slug: "indiana", abbrev: "IN", name: "Indiana" },
  { slug: "iowa", abbrev: "IA", name: "Iowa" },
  { slug: "kansas", abbrev: "KS", name: "Kansas" },
  { slug: "kentucky", abbrev: "KY", name: "Kentucky" },
  { slug: "louisiana", abbrev: "LA", name: "Louisiana" },
  { slug: "maine", abbrev: "ME", name: "Maine" },
  { slug: "maryland", abbrev: "MD", name: "Maryland" },
  { slug: "massachusetts", abbrev: "MA", name: "Massachusetts" },
  { slug: "michigan", abbrev: "MI", name: "Michigan" },
  { slug: "minnesota", abbrev: "MN", name: "Minnesota" },
  { slug: "mississippi", abbrev: "MS", name: "Mississippi" },
  { slug: "missouri", abbrev: "MO", name: "Missouri" },
  { slug: "montana", abbrev: "MT", name: "Montana" },
  { slug: "nebraska", abbrev: "NE", name: "Nebraska" },
  { slug: "nevada", abbrev: "NV", name: "Nevada" },
  { slug: "new-hampshire", abbrev: "NH", name: "New Hampshire" },
  { slug: "new-jersey", abbrev: "NJ", name: "New Jersey" },
  { slug: "new-mexico", abbrev: "NM", name: "New Mexico" },
  { slug: "new-york", abbrev: "NY", name: "New York" },
  { slug: "north-carolina", abbrev: "NC", name: "North Carolina" },
  { slug: "north-dakota", abbrev: "ND", name: "North Dakota" },
  { slug: "ohio", abbrev: "OH", name: "Ohio" },
  { slug: "oklahoma", abbrev: "OK", name: "Oklahoma" },
  { slug: "oregon", abbrev: "OR", name: "Oregon" },
  { slug: "pennsylvania", abbrev: "PA", name: "Pennsylvania" },
  { slug: "rhode-island", abbrev: "RI", name: "Rhode Island" },
  { slug: "south-carolina", abbrev: "SC", name: "South Carolina" },
  { slug: "south-dakota", abbrev: "SD", name: "South Dakota" },
  { slug: "tennessee", abbrev: "TN", name: "Tennessee" },
  { slug: "texas", abbrev: "TX", name: "Texas" },
  { slug: "utah", abbrev: "UT", name: "Utah" },
  { slug: "vermont", abbrev: "VT", name: "Vermont" },
  { slug: "virginia", abbrev: "VA", name: "Virginia" },
  { slug: "washington", abbrev: "WA", name: "Washington" },
  { slug: "west-virginia", abbrev: "WV", name: "West Virginia" },
  { slug: "wisconsin", abbrev: "WI", name: "Wisconsin" },
  { slug: "wyoming", abbrev: "WY", name: "Wyoming" },
  { slug: "district-of-columbia", abbrev: "DC", name: "District of Columbia" },
];
