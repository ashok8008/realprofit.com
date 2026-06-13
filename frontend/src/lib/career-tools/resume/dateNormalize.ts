// Single source of truth for cleaning up dates that the import parser pulls
// from resumes. Applied on import AND whenever experience/education entries are
// saved through the wizard editor.

const MONTH_FULL_TO_SHORT: Record<string, string> = {
  january: "Jan", february: "Feb", march: "Mar", april: "Apr",
  may: "May", june: "Jun", july: "Jul", august: "Aug",
  september: "Sep", october: "Oct", november: "Nov", december: "Dec",
  // common abbreviations / typos
  sept: "Sep", "sep.": "Sep", "jan.": "Jan", "feb.": "Feb", "mar.": "Mar",
  "apr.": "Apr", "jun.": "Jun", "jul.": "Jul", "aug.": "Aug",
  "oct.": "Oct", "nov.": "Nov", "dec.": "Dec",
};

const PRESENT_TOKENS = [
  "till date", "till now", "to date", "to present", "current",
  "currently", "now", "present", "ongoing", "till today",
];

/** Returns true if the raw text means "still here" / "current". */
export function isPresentDate(raw: string): boolean {
  if (!raw) return false;
  const t = raw.trim().toLowerCase();
  return PRESENT_TOKENS.some((p) => t === p || t.endsWith(p) || t.includes(p));
}

/**
 * Normalize a single date token to either "Mon YYYY" (e.g. "Sep 2014") or
 * "Present". Tolerates inputs like "Sept2014", "Sept 2014", "since Sept 2014",
 * "till date", "2014", "9/2014", "09-2014".
 */
export function normalizeDate(raw: string | undefined | null): string {
  if (!raw) return "";
  const cleaned = String(raw)
    .replace(/^\s*(?:since|from|in|on|joined|started|until|to)\s+/i, "")
    .trim();
  if (!cleaned) return "";
  if (isPresentDate(cleaned)) return "Present";

  // "Sept2014" → "Sept 2014" (no-space split)
  let s = cleaned.replace(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)(\d{4})\b/i,
    "$1 $2",
  );

  // Numeric: "9/2014", "09-2014", "2014/09"
  const numeric = s.match(/^(\d{1,2})[\/\-.](\d{4})$/);
  if (numeric) {
    const m = parseInt(numeric[1], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (m >= 1 && m <= 12) return `${months[m - 1]} ${numeric[2]}`;
  }
  const numericRev = s.match(/^(\d{4})[\/\-.](\d{1,2})$/);
  if (numericRev) {
    const m = parseInt(numericRev[2], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (m >= 1 && m <= 12) return `${months[m - 1]} ${numericRev[1]}`;
  }

  // Year-only is fine ("2014")
  if (/^\d{4}$/.test(s)) return s;

  // Find "Month YYYY"
  const monthYear = s.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\.?\s+(\d{4})\b/i,
  );
  if (monthYear) {
    const month = MONTH_FULL_TO_SHORT[monthYear[1].toLowerCase()] || monthYear[1].slice(0, 3);
    return `${month.charAt(0).toUpperCase()}${month.slice(1).toLowerCase()} ${monthYear[2]}`;
  }
  return s;
}

/**
 * Render a normalized date range for display.
 *   normalizeDateRange("Sept2014", "till date") → "Sep 2014 – Present"
 */
export function normalizeDateRange(start: string, end: string, current?: boolean): string {
  const s = normalizeDate(start);
  const e = current ? "Present" : normalizeDate(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}
