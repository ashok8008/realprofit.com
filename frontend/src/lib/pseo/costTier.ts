// ─── COST TIER CLASSIFICATION ENGINE ────────────────────────
// Deterministic classification of cities by cost profile.
// Used across all location-salary pSEO pages.

export type CostTier = "low" | "moderate" | "high" | "very-high";
export type TaxProfile = "no-state-tax" | "state-tax";
export type PurchasingPowerBand = "stretched" | "balanced" | "comfortable" | "strong";

// ─── A. COST TIER ───────────────────────────────────────────

export function getCostTier(profile: {
  costOfLivingIndex: number;
  averageMonthlyRent: number;
}): CostTier {
  const { costOfLivingIndex, averageMonthlyRent } = profile;

  if (costOfLivingIndex >= 145 || averageMonthlyRent >= 3200) return "very-high";
  if (costOfLivingIndex >= 115 || averageMonthlyRent >= 2200) return "high";
  if (costOfLivingIndex >= 95 || averageMonthlyRent >= 1400) return "moderate";
  return "low";
}

// ─── B. TAX PROFILE ─────────────────────────────────────────

export function getTaxProfile(hasStateTax: boolean): TaxProfile {
  return hasStateTax ? "state-tax" : "no-state-tax";
}

// ─── C. COST TIER LABELS ────────────────────────────────────

const tierLabels: Record<CostTier, string[]> = {
  low: [
    "more affordable than many major U.S. cities",
    "one of the more budget-friendly metros in the country",
    "well below the national average in living costs",
  ],
  moderate: [
    "close to the national average in living costs",
    "roughly in line with typical U.S. metro costs",
    "neither cheap nor expensive by national standards",
  ],
  high: [
    "more expensive than average",
    "above the national average in cost of living",
    "pricier than most mid-size U.S. cities",
  ],
  "very-high": [
    "one of the most expensive places to live in the country",
    "among the costliest metros in the United States",
    "significantly more expensive than the vast majority of U.S. cities",
  ],
};

export function getCostTierLabel(tier: CostTier, seed?: number): string {
  const variants = tierLabels[tier];
  const idx = seed !== undefined ? Math.abs(seed) % variants.length : 0;
  return variants[idx];
}

// Short adjective form
const tierAdjectives: Record<CostTier, string> = {
  low: "affordable",
  moderate: "moderately priced",
  high: "above-average cost",
  "very-high": "very expensive",
};

export function getCostTierAdjective(tier: CostTier): string {
  return tierAdjectives[tier];
}

// ─── D. PURCHASING POWER BAND ───────────────────────────────

export function getPurchasingPowerBand(adjustedIncomeRatio: number): PurchasingPowerBand {
  if (adjustedIncomeRatio < 0.80) return "stretched";
  if (adjustedIncomeRatio < 0.95) return "balanced";
  if (adjustedIncomeRatio < 1.10) return "comfortable";
  return "strong";
}

const ppLabels: Record<PurchasingPowerBand, string[]> = {
  stretched: [
    "This salary may feel tight once rent and essential costs are factored in.",
    "The high local costs mean this income doesn't stretch as far as the number suggests.",
    "Purchasing power is meaningfully reduced — careful budgeting is essential.",
  ],
  balanced: [
    "This salary can support a balanced lifestyle, though housing choices will matter.",
    "Your purchasing power is close to what the nominal salary implies — neither a windfall nor a squeeze.",
    "The local cost of living takes a moderate bite, leaving a workable but not spacious budget.",
  ],
  comfortable: [
    "This income should support a fairly comfortable lifestyle if spending stays reasonable.",
    "Your purchasing power closely matches the raw salary figure, providing solid room for saving.",
    "Living costs here are manageable enough that this salary supports both lifestyle and savings goals.",
  ],
  strong: [
    "This salary goes further here than it would in many higher-cost metros.",
    "Your purchasing power is amplified by below-average local costs — a genuine financial advantage.",
    "The combination of this salary and local affordability creates excellent conditions for wealth building.",
  ],
};

export function getPurchasingPowerLabel(band: PurchasingPowerBand, seed?: number): string {
  const variants = ppLabels[band];
  const idx = seed !== undefined ? Math.abs(seed) % variants.length : 0;
  return variants[idx];
}

// ─── E. CONTRASTING CITY LOOKUP ─────────────────────────────
// Used in comparison paragraphs to reference a contrasting city.

interface ContrastCity {
  name: string;
  col: number;
  tier: CostTier;
}

const contrastCities: Record<CostTier, ContrastCity[]> = {
  "very-high": [
    { name: "Houston", col: 96, tier: "moderate" },
    { name: "Detroit", col: 89, tier: "low" },
    { name: "Kansas City", col: 90, tier: "low" },
  ],
  high: [
    { name: "San Antonio", col: 88, tier: "low" },
    { name: "Columbus", col: 91, tier: "low" },
    { name: "Pittsburgh", col: 93, tier: "low" },
  ],
  moderate: [
    { name: "New York City", col: 187, tier: "very-high" },
    { name: "San Francisco", col: 179, tier: "very-high" },
    { name: "Detroit", col: 89, tier: "low" },
  ],
  low: [
    { name: "San Francisco", col: 179, tier: "very-high" },
    { name: "New York City", col: 187, tier: "very-high" },
    { name: "Boston", col: 152, tier: "very-high" },
  ],
};

export function getContrastCity(tier: CostTier, seed?: number): ContrastCity {
  const options = contrastCities[tier];
  const idx = seed !== undefined ? Math.abs(seed) % options.length : 0;
  return options[idx];
}

// ─── F. RENT BURDEN CLASSIFICATION ──────────────────────────

export type RentBurdenLevel = "healthy" | "stretched" | "burdened";

export function getRentBurdenLevel(rentPercent: number): RentBurdenLevel {
  if (rentPercent <= 30) return "healthy";
  if (rentPercent <= 40) return "stretched";
  return "burdened";
}

export function getRentBurdenLabel(level: RentBurdenLevel): string {
  const labels: Record<RentBurdenLevel, string> = {
    healthy: "within the recommended 30% threshold",
    stretched: "above the 30% guideline, which limits savings capacity",
    burdened: "significantly rent-burdened, requiring trade-offs in other categories",
  };
  return labels[level];
}
