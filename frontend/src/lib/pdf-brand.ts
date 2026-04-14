import { jsPDF } from "jspdf";

// ═══════════════════════════════════════════════════════════════
// RealProfits PDF Branding Utilities
// Shared across all tool PDF exports for consistent premium look
// ═══════════════════════════════════════════════════════════════

const BRAND = {
  dark: [15, 23, 42] as [number, number, number],       // slate-900
  accent: [13, 148, 136] as [number, number, number],    // teal-600
  gold: [245, 197, 66] as [number, number, number],      // gold
  muted: [100, 116, 139] as [number, number, number],    // slate-500
  light: [241, 245, 249] as [number, number, number],    // slate-100
  white: [255, 255, 255] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
};

const LM = 15; // left margin
const PW = 180; // printable width
const PAGE_W = 210;
const PAGE_H = 297;

/** Draw the branded header bar at the top of every page */
export function drawHeader(doc: jsPDF, title: string, subtitle?: string): number {
  // Dark header bar
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, PAGE_W, 28, "F");

  // Accent stripe
  doc.setFillColor(...BRAND.accent);
  doc.rect(0, 28, PAGE_W, 2, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.white);
  doc.text(title, LM, 15);

  // Subtitle / date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 220);
  doc.text(subtitle || `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, LM, 23);

  // Brand name right-aligned
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.gold);
  doc.text("RealProfits", PAGE_W - LM - doc.getTextWidth("RealProfits"), 15);

  doc.setTextColor(0, 0, 0);
  return 38; // y position after header
}

/** Draw branded footer on every page */
export function drawFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Thin rule
    doc.setDrawColor(200, 210, 220);
    doc.line(LM, PAGE_H - 15, PAGE_W - LM, PAGE_H - 15);
    // Footer text
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.muted);
    doc.text("RealProfits.com  \u2022  Financial tools for real people", LM, PAGE_H - 10);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - LM - doc.getTextWidth(`Page ${i} of ${pageCount}`), PAGE_H - 10);
  }
}

/** Draw a section heading with an accent left border */
export function drawSectionHeading(doc: jsPDF, text: string, y: number): number {
  // Accent bar
  doc.setFillColor(...BRAND.accent);
  doc.rect(LM, y - 4, 3, 7, "F");
  // Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.dark);
  doc.text(text, LM + 7, y);
  return y + 10;
}

/** Draw a key-value row with label on left, value on right */
export function drawKVRow(doc: jsPDF, label: string, value: string, y: number, opts?: { bold?: boolean; color?: [number, number, number]; size?: number }): number {
  const size = opts?.size || 10;
  doc.setFontSize(size);
  doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  doc.setTextColor(...(opts?.color || BRAND.dark));
  doc.text(label, LM + 4, y);
  const valWidth = doc.getTextWidth(value);
  doc.text(value, PAGE_W - LM - valWidth, y);
  doc.setTextColor(0, 0, 0);
  return y + (size * 0.55 + 2);
}

/** Draw a styled data table with header row and alternating backgrounds */
export function drawTable(doc: jsPDF, headers: string[], rows: string[][], colWidths: number[], y: number): number {
  const rowH = 8;
  const headerH = 9;

  // Header row background
  doc.setFillColor(...BRAND.dark);
  doc.roundedRect(LM, y, PW, headerH, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.white);

  let x = LM + 4;
  headers.forEach((h, i) => {
    doc.text(h, x, y + 6);
    x += colWidths[i];
  });

  y += headerH + 1;

  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rows.forEach((row, ri) => {
    if (y > PAGE_H - 25) { doc.addPage(); y = drawHeader(doc, "", ""); y = 15; }

    // Alternating row background
    if (ri % 2 === 0) {
      doc.setFillColor(...BRAND.light);
      doc.rect(LM, y - 1, PW, rowH, "F");
    }

    doc.setTextColor(...BRAND.dark);
    let rx = LM + 4;
    row.forEach((cell, ci) => {
      const truncated = cell.length > 30 ? cell.substring(0, 28) + "..." : cell;
      doc.text(truncated, rx, y + 5);
      rx += colWidths[ci];
    });
    y += rowH;
  });

  return y + 4;
}

/** Draw a colored stat card (rounded rectangle with big number) */
export function drawStatCard(doc: jsPDF, label: string, value: string, x: number, y: number, w: number, h: number, color: [number, number, number]): void {
  // Card background
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, w, h, 3, 3, "F");

  // Value
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.white);
  doc.text(value, x + w / 2 - doc.getTextWidth(value) / 2, y + h / 2 - 1);

  // Label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255, 0.8);
  doc.text(label, x + w / 2 - doc.getTextWidth(label) / 2, y + h / 2 + 8);
}

/** Draw a horizontal bar chart */
export function drawBarChart(doc: jsPDF, items: { label: string; value: number; color?: [number, number, number] }[], y: number, maxWidth?: number): number {
  const barMaxW = maxWidth || 100;
  const maxVal = Math.max(...items.map(i => i.value), 1);

  items.forEach((item, i) => {
    if (y > PAGE_H - 25) { doc.addPage(); y = 15; }

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.dark);
    doc.text(item.label, LM + 4, y + 4);

    // Bar background
    const barX = LM + 55;
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(barX, y, barMaxW, 6, 2, 2, "F");

    // Bar fill
    const fillW = Math.max(2, (item.value / maxVal) * barMaxW);
    const color = item.color || BRAND.accent;
    doc.setFillColor(...color);
    doc.roundedRect(barX, y, fillW, 6, 2, 2, "F");

    // Value
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    const valStr = `$${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    doc.text(valStr, barX + barMaxW + 5, y + 4);

    y += 10;
  });

  return y;
}

/** Draw a thin horizontal rule */
export function drawRule(doc: jsPDF, y: number): number {
  doc.setDrawColor(220, 225, 230);
  doc.line(LM, y, PAGE_W - LM, y);
  return y + 6;
}

/** Check if we need a new page, add one if so */
export function checkPage(doc: jsPDF, y: number, needed: number = 30): number {
  if (y > PAGE_H - needed) {
    doc.addPage();
    return 15;
  }
  return y;
}

export { BRAND, LM, PW, PAGE_W, PAGE_H };
