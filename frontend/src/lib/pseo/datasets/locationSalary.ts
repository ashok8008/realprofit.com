export interface LocationSalaryEntry {
  value: number;
  slug: string;
  title: string;
  type: "location-salary";
  cityName: string;
  citySlug: string;
  state: string;
  costOfLivingIndex: number;
  adjustedSalary: number;
  avgRent1br: number;
  avgRent2br: number;
  stateTaxRate: number;
  monthlyGross: number;
  estimatedFedTax: number;
  estimatedStateTax: number;
  estimatedFICA: number;
  monthlyNet: number;
  rentBurden1br: number;
  rentBurden2br: number;
}

interface CityData {
  name: string;
  slug: string;
  state: string;
  col: number; // cost-of-living index, national avg = 100
  rent1br: number;
  rent2br: number;
  stateTax: number;
}

const cities: CityData[] = [
  { name: "New York City", slug: "new-york", state: "NY", col: 187, rent1br: 3500, rent2br: 4800, stateTax: 0.0685 },
  { name: "San Francisco", slug: "san-francisco", state: "CA", col: 179, rent1br: 3200, rent2br: 4300, stateTax: 0.0725 },
  { name: "Los Angeles", slug: "los-angeles", state: "CA", col: 166, rent1br: 2400, rent2br: 3200, stateTax: 0.0725 },
  { name: "San Jose", slug: "san-jose", state: "CA", col: 177, rent1br: 2900, rent2br: 3600, stateTax: 0.0725 },
  { name: "Seattle", slug: "seattle", state: "WA", col: 156, rent1br: 2200, rent2br: 2900, stateTax: 0 },
  { name: "Boston", slug: "boston", state: "MA", col: 152, rent1br: 2800, rent2br: 3500, stateTax: 0.05 },
  { name: "Washington DC", slug: "washington-dc", state: "DC", col: 152, rent1br: 2400, rent2br: 3200, stateTax: 0.0575 },
  { name: "Chicago", slug: "chicago", state: "IL", col: 107, rent1br: 1800, rent2br: 2300, stateTax: 0.0495 },
  { name: "Miami", slug: "miami", state: "FL", col: 127, rent1br: 2200, rent2br: 2900, stateTax: 0 },
  { name: "Denver", slug: "denver", state: "CO", col: 128, rent1br: 1800, rent2br: 2300, stateTax: 0.044 },
  { name: "Austin", slug: "austin", state: "TX", col: 103, rent1br: 1500, rent2br: 1950, stateTax: 0 },
  { name: "Dallas", slug: "dallas", state: "TX", col: 101, rent1br: 1400, rent2br: 1800, stateTax: 0 },
  { name: "Houston", slug: "houston", state: "TX", col: 96, rent1br: 1250, rent2br: 1600, stateTax: 0 },
  { name: "San Antonio", slug: "san-antonio", state: "TX", col: 88, rent1br: 1100, rent2br: 1400, stateTax: 0 },
  { name: "Nashville", slug: "nashville", state: "TN", col: 103, rent1br: 1600, rent2br: 2000, stateTax: 0 },
  { name: "Atlanta", slug: "atlanta", state: "GA", col: 107, rent1br: 1700, rent2br: 2100, stateTax: 0.055 },
  { name: "Phoenix", slug: "phoenix", state: "AZ", col: 103, rent1br: 1300, rent2br: 1700, stateTax: 0.025 },
  { name: "Portland", slug: "portland", state: "OR", col: 130, rent1br: 1700, rent2br: 2100, stateTax: 0.09 },
  { name: "Minneapolis", slug: "minneapolis", state: "MN", col: 106, rent1br: 1400, rent2br: 1800, stateTax: 0.0535 },
  { name: "Philadelphia", slug: "philadelphia", state: "PA", col: 102, rent1br: 1700, rent2br: 2100, stateTax: 0.0307 },
  { name: "Charlotte", slug: "charlotte", state: "NC", col: 97, rent1br: 1400, rent2br: 1700, stateTax: 0.0475 },
  { name: "Raleigh", slug: "raleigh", state: "NC", col: 102, rent1br: 1500, rent2br: 1800, stateTax: 0.0475 },
  { name: "Salt Lake City", slug: "salt-lake-city", state: "UT", col: 104, rent1br: 1400, rent2br: 1750, stateTax: 0.0465 },
  { name: "Pittsburgh", slug: "pittsburgh", state: "PA", col: 93, rent1br: 1200, rent2br: 1500, stateTax: 0.0307 },
  { name: "Tampa", slug: "tampa", state: "FL", col: 102, rent1br: 1600, rent2br: 2000, stateTax: 0 },
  { name: "Detroit", slug: "detroit", state: "MI", col: 89, rent1br: 1000, rent2br: 1300, stateTax: 0.0425 },
  { name: "Kansas City", slug: "kansas-city", state: "MO", col: 90, rent1br: 1100, rent2br: 1350, stateTax: 0.048 },
  { name: "Columbus", slug: "columbus", state: "OH", col: 91, rent1br: 1100, rent2br: 1400, stateTax: 0.04 },
  { name: "San Diego", slug: "san-diego", state: "CA", col: 160, rent1br: 2400, rent2br: 3100, stateTax: 0.0725 },
  { name: "Las Vegas", slug: "las-vegas", state: "NV", col: 103, rent1br: 1300, rent2br: 1650, stateTax: 0 },
];

const salaryAmounts = [
  30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
  120000, 150000, 175000, 200000, 250000, 300000,
];

function buildEntry(amount: number, city: CityData): LocationSalaryEntry {
  const adjustedSalary = Math.round(amount * (100 / city.col));
  const monthlyGross = Math.round(amount / 12);

  let fedRate: number;
  if (amount <= 11600) fedRate = 0.10;
  else if (amount <= 47150) fedRate = 0.12;
  else if (amount <= 100525) fedRate = 0.22;
  else if (amount <= 191950) fedRate = 0.24;
  else if (amount <= 243725) fedRate = 0.32;
  else if (amount <= 609350) fedRate = 0.35;
  else fedRate = 0.37;

  const estimatedFedTax = Math.round(amount * fedRate * 0.7);
  const estimatedStateTax = Math.round(amount * city.stateTax);
  const estimatedFICA = Math.round(amount * 0.0765);
  const annualNet = amount - estimatedFedTax - estimatedStateTax - estimatedFICA;
  const monthlyNet = Math.round(annualNet / 12);

  const rentBurden1br = Math.round((city.rent1br / monthlyNet) * 100);
  const rentBurden2br = Math.round((city.rent2br / monthlyNet) * 100);

  const fmtAmt = `$${amount.toLocaleString()}`;

  return {
    value: amount,
    slug: `${amount}-salary-in-${city.slug}`,
    title: `${fmtAmt} Salary in ${city.name}: What It's Really Worth`,
    type: "location-salary",
    cityName: city.name,
    citySlug: city.slug,
    state: city.state,
    costOfLivingIndex: city.col,
    adjustedSalary,
    avgRent1br: city.rent1br,
    avgRent2br: city.rent2br,
    stateTaxRate: city.stateTax,
    monthlyGross,
    estimatedFedTax,
    estimatedStateTax,
    estimatedFICA,
    monthlyNet,
    rentBurden1br,
    rentBurden2br,
  };
}

const entries: LocationSalaryEntry[] = [];
for (const amount of salaryAmounts) {
  for (const city of cities) {
    entries.push(buildEntry(amount, city));
  }
}

export const locationSalaryEntries: LocationSalaryEntry[] = entries;
export const allCities = cities;
export const allLocationSalaryAmounts = salaryAmounts;
