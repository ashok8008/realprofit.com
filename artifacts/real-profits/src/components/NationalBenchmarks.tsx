import React from "react";

type BenchmarkCategory = "savings" | "debt" | "tax" | "income" | "budget" | "investment" | "loan" | "general";

const benchmarks: Record<BenchmarkCategory, { title: string; rows: { ageGroup: string; value: string; source: string }[] }> = {
  savings: {
    title: "Average Savings by Age Group (U.S.)",
    rows: [
      { ageGroup: "Under 35", value: "$11,250", source: "Federal Reserve SCF" },
      { ageGroup: "35 - 44", value: "$27,910", source: "Federal Reserve SCF" },
      { ageGroup: "45 - 54", value: "$48,200", source: "Federal Reserve SCF" },
      { ageGroup: "55 - 64", value: "$57,670", source: "Federal Reserve SCF" },
      { ageGroup: "65 - 74", value: "$60,410", source: "Federal Reserve SCF" },
      { ageGroup: "75+", value: "$55,320", source: "Federal Reserve SCF" },
    ],
  },
  debt: {
    title: "Average Household Debt by Age Group (U.S.)",
    rows: [
      { ageGroup: "Under 35", value: "$67,400", source: "Federal Reserve SCF" },
      { ageGroup: "35 - 44", value: "$133,100", source: "Federal Reserve SCF" },
      { ageGroup: "45 - 54", value: "$134,600", source: "Federal Reserve SCF" },
      { ageGroup: "55 - 64", value: "$108,300", source: "Federal Reserve SCF" },
      { ageGroup: "65 - 74", value: "$66,000", source: "Federal Reserve SCF" },
      { ageGroup: "75+", value: "$34,500", source: "Federal Reserve SCF" },
    ],
  },
  tax: {
    title: "Average Effective Federal Tax Rate by Income",
    rows: [
      { ageGroup: "Under $25K", value: "3.1%", source: "IRS SOI Data" },
      { ageGroup: "$25K - $50K", value: "6.8%", source: "IRS SOI Data" },
      { ageGroup: "$50K - $75K", value: "10.2%", source: "IRS SOI Data" },
      { ageGroup: "$75K - $100K", value: "12.4%", source: "IRS SOI Data" },
      { ageGroup: "$100K - $200K", value: "15.6%", source: "IRS SOI Data" },
      { ageGroup: "$200K+", value: "24.1%", source: "IRS SOI Data" },
    ],
  },
  income: {
    title: "Median Household Income by Age (U.S.)",
    rows: [
      { ageGroup: "Under 25", value: "$35,700", source: "Census Bureau" },
      { ageGroup: "25 - 34", value: "$65,190", source: "Census Bureau" },
      { ageGroup: "35 - 44", value: "$80,900", source: "Census Bureau" },
      { ageGroup: "45 - 54", value: "$84,460", source: "Census Bureau" },
      { ageGroup: "55 - 64", value: "$75,400", source: "Census Bureau" },
      { ageGroup: "65+", value: "$50,290", source: "Census Bureau" },
    ],
  },
  budget: {
    title: "Average Monthly Spending by Category (U.S.)",
    rows: [
      { ageGroup: "Housing", value: "$2,025", source: "BLS Consumer Expenditures" },
      { ageGroup: "Transportation", value: "$1,052", source: "BLS Consumer Expenditures" },
      { ageGroup: "Food", value: "$886", source: "BLS Consumer Expenditures" },
      { ageGroup: "Insurance/Pension", value: "$768", source: "BLS Consumer Expenditures" },
      { ageGroup: "Healthcare", value: "$488", source: "BLS Consumer Expenditures" },
      { ageGroup: "Entertainment", value: "$288", source: "BLS Consumer Expenditures" },
    ],
  },
  investment: {
    title: "Median Retirement Savings by Age (U.S.)",
    rows: [
      { ageGroup: "Under 35", value: "$18,880", source: "Federal Reserve SCF" },
      { ageGroup: "35 - 44", value: "$45,000", source: "Federal Reserve SCF" },
      { ageGroup: "45 - 54", value: "$115,000", source: "Federal Reserve SCF" },
      { ageGroup: "55 - 64", value: "$185,000", source: "Federal Reserve SCF" },
      { ageGroup: "65 - 74", value: "$200,000", source: "Federal Reserve SCF" },
      { ageGroup: "75+", value: "$130,000", source: "Federal Reserve SCF" },
    ],
  },
  loan: {
    title: "Average Loan Balances by Type (U.S.)",
    rows: [
      { ageGroup: "Mortgage", value: "$236,443", source: "Experian Data" },
      { ageGroup: "Student Loans", value: "$37,574", source: "Federal Reserve" },
      { ageGroup: "Auto Loan", value: "$23,792", source: "Experian Data" },
      { ageGroup: "Credit Cards", value: "$6,501", source: "Experian Data" },
      { ageGroup: "Personal Loans", value: "$11,692", source: "TransUnion" },
      { ageGroup: "HELOC", value: "$42,139", source: "Experian Data" },
    ],
  },
  general: {
    title: "Key Financial Benchmarks (U.S. Average)",
    rows: [
      { ageGroup: "Median Income", value: "$74,580", source: "Census Bureau" },
      { ageGroup: "Avg. Savings Rate", value: "4.6%", source: "BEA" },
      { ageGroup: "Avg. Credit Score", value: "715", source: "Experian" },
      { ageGroup: "Avg. Household Debt", value: "$104,215", source: "Federal Reserve" },
      { ageGroup: "Avg. Net Worth", value: "$192,700", source: "Federal Reserve SCF" },
      { ageGroup: "Avg. Retirement Savings", value: "$87,000", source: "Federal Reserve SCF" },
    ],
  },
};

const categoryCalcMap: Record<string, BenchmarkCategory> = {
  "savings-budget": "savings",
  "debt-credit-calc": "debt",
  "taxes-calc": "tax",
  "income-freelance": "income",
  "investing-calc": "investment",
  "life-decisions-calc": "budget",
  "loans-calc": "loan",
};

export function NationalBenchmarks({ calculatorCategory }: { calculatorCategory: string }) {
  const cat = categoryCalcMap[calculatorCategory] || "general";
  const data = benchmarks[cat];

  return (
    <div className="mt-12 bg-white border rounded-xl overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h3 className="font-serif text-xl font-bold">{data.title}</h3>
        <p className="text-sm text-gray-500 mt-1">National data for comparison. See how your numbers stack up.</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-bold text-gray-700">{cat === "budget" || cat === "loan" ? "Category" : "Age Group / Range"}</th>
            <th className="text-right p-4 font-bold text-gray-700">Value</th>
            <th className="text-right p-4 font-bold text-gray-500 text-xs hidden sm:table-cell">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">{row.ageGroup}</td>
              <td className="text-right p-4 font-semibold">{row.value}</td>
              <td className="text-right p-4 text-xs text-gray-400 hidden sm:table-cell">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
