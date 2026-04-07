"use client";
import React, { useState, useMemo } from "react";
import { Seo } from "@/components/Seo";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Info, TrendingUp, Target, Clock, CreditCard } from "lucide-react";
import { RpSlider, WhatIfHero } from "@/components/what-if/WhatIfComponents";

export default function WhatIfSimulator() {
  const [step, setStep] = useState(1);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [incomeMonthly, setIncomeMonthly] = useState(5000);
  const [savingsRate, setSavingsRate] = useState(25);
  const [expensesMonthly, setExpensesMonthly] = useState(3000);
  const [totalDebt, setTotalDebt] = useState(20000);
  const [investmentReturn, setInvestmentReturn] = useState(6);
  const [raiseSalary, setRaiseSalary] = useState(25);
  const [retireEarlier, setRetireEarlier] = useState(5);
  const [payOffDebtFaster, setPayOffDebtFaster] = useState(20);
  const [increaseSavingsRate, setIncreaseSavingsRate] = useState(20);
  const [reduceExpenses, setReduceExpenses] = useState(20);
  const [annualReturns, setAnnualReturns] = useState(7.5);

  const chartData = useMemo(() => {
    const data = [];
    let currentNW = 0;
    let improvedNW = 0;
    const rCurrent = investmentReturn / 100;
    const rImproved = annualReturns / 100;
    const annualSavingsCurrent = (incomeMonthly * 12) * (savingsRate / 100);
    const annualSavingsImproved = ((incomeMonthly * 12) * (1 + raiseSalary / 100)) * ((savingsRate + increaseSavingsRate) / 100);
    for (let age = currentAge; age <= 70; age++) {
      currentNW = currentNW * (1 + rCurrent) + annualSavingsCurrent;
      improvedNW = improvedNW * (1 + rImproved) + annualSavingsImproved;
      const avgNW = (currentNW + improvedNW) / 2 * 0.8;
      data.push({ age, current: Math.round(currentNW), improved: Math.round(improvedNW), average: Math.round(avgNW) });
    }
    return data;
  }, [currentAge, incomeMonthly, savingsRate, investmentReturn, raiseSalary, increaseSavingsRate, annualReturns]);

  const projectedAt65 = chartData.find(d => d.age === retirementAge)?.current || 0;
  const improvedAt65 = chartData.find(d => d.age === Math.max(retirementAge - retireEarlier, currentAge + 1))?.improved || 0;
  const currentNW = incomeMonthly * savingsRate / 100 * 12;
  const whatIfScore = Math.min(Math.round((savingsRate * 1.2 + increaseSavingsRate * 0.8 + (100 - reduceExpenses) * 0.3 + raiseSalary * 0.5 + annualReturns * 2) * 0.7), 100);
  const debtFreeYears = totalDebt > 0 ? Math.max(1, Math.round(totalDebt / (incomeMonthly * 0.1 * 12 * (1 + payOffDebtFaster / 100)))) : 0;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-0">
      <Seo title="What If Simulator" description="Explore how different financial choices impact your long-term wealth." keywords="financial simulator, what if calculator, wealth projection, financial planning tool" path="/what-if" />
      <WhatIfHero onStart={() => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })} />

      <section id="wizard-section" className="py-12 md:py-16 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-base mb-1">Your Financial Journey -- All in One Glance</h3>
              <p className="text-xs text-gray-500 mb-6">Plan smarter, play with possibilities, and see where your future can go.</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-gray-500">Assessment Progress</span>
                <span className="text-xs font-bold text-gray-900">{step}/3</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-[#1a2e2e] rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
              </div>
              <div className="space-y-5">
                {[{ num: 1, title: "Your Finances" }, { num: 2, title: "What-If Scenarios" }, { num: 3, title: "Your Future" }].map((s) => (
                  <div key={s.num} className="flex gap-3 cursor-pointer items-center" onClick={() => setStep(s.num)}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step >= s.num ? "bg-[#f5c542] text-gray-900" : "bg-gray-100 text-gray-400"}`}>{s.num}</div>
                    <span className={`text-sm font-medium ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              {step === 1 && (
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Set Your Financial Basics</h2>
                  <p className="text-gray-500 text-sm mb-8">Tell us about your current financial life.</p>
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4"><Info className="w-4 h-4 text-gray-400" /><span className="font-bold text-sm text-gray-700">Personal Information</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs text-gray-500 mb-1.5">Current Age</label><div className="flex items-center border border-gray-200 rounded-lg overflow-hidden"><span className="bg-gray-50 px-3 py-2.5 text-xs text-gray-400 border-r border-gray-200">Yrs</span><input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="w-full px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none" /></div></div>
                      <div><label className="block text-xs text-gray-500 mb-1.5">Retirement Age</label><div className="flex items-center border border-gray-200 rounded-lg overflow-hidden"><span className="bg-gray-50 px-3 py-2.5 text-xs text-gray-400 border-r border-gray-200">Yrs</span><input type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} className="w-full px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none" /></div></div>
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-5"><Info className="w-4 h-4 text-gray-400" /><span className="font-bold text-sm text-gray-700">Current Financial Status</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <RpSlider label="Income (Monthly)" value={incomeMonthly} onChange={setIncomeMonthly} min={1000} max={25000} step={500} color="#0d9488" unit="$" infoIcon />
                      <RpSlider label="Savings Rate" value={savingsRate} onChange={setSavingsRate} min={0} max={75} step={1} color="#06b6d4" unit="%" infoIcon />
                      <RpSlider label="Expenses (Monthly)" value={expensesMonthly} onChange={setExpensesMonthly} min={200} max={15000} step={100} color="#3b82f6" unit="$" infoIcon />
                      <RpSlider label="Debt Payoff (Monthly)" value={totalDebt} onChange={setTotalDebt} min={0} max={50000} step={1000} color="#f97316" unit="$" infoIcon />
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-5"><Info className="w-4 h-4 text-gray-400" /><span className="font-bold text-sm text-gray-700">Investment Preferences</span></div>
                    <div className="max-w-md"><RpSlider label="Investment Return Rate (Yearly)" value={investmentReturn} onChange={setInvestmentReturn} min={0} max={15} step={0.5} color="#8b5cf6" unit="%" infoIcon /></div>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-xl px-8 py-4 font-bold text-base transition-colors" data-testid="step1-next">Next</button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Try &quot;What-If&quot; Scenarios</h2>
                  <p className="text-gray-500 text-sm mb-8">Experiment with choices that shape your future.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <RpSlider label="Raise Salary (Yearly)" value={raiseSalary} onChange={setRaiseSalary} min={1} max={50} step={1} color="#f97316" unit="%" infoIcon />
                    <RpSlider label="Retire Earlier (By Years)" value={retireEarlier} onChange={setRetireEarlier} min={0} max={10} step={1} color="#22c55e" unit="" infoIcon />
                    <RpSlider label="Pay Off Debt Faster (Monthly)" value={payOffDebtFaster} onChange={setPayOffDebtFaster} min={0} max={50} step={5} color="#f97316" unit="%" infoIcon />
                    <RpSlider label="Increase Savings Rate (Monthly)" value={increaseSavingsRate} onChange={setIncreaseSavingsRate} min={0} max={50} step={1} color="#22c55e" unit="%" infoIcon />
                    <RpSlider label="Reduce Monthly Expenses (Monthly)" value={reduceExpenses} onChange={setReduceExpenses} min={0} max={40} step={5} color="#3b82f6" unit="%" infoIcon />
                    <RpSlider label="Annual Returns (Yearly)" value={annualReturns} onChange={setAnnualReturns} min={0} max={12} step={0.5} color="#0d9488" unit="%" infoIcon />
                  </div>
                  <div className="mt-10 flex gap-4">
                    <button onClick={() => setStep(1)} className="px-6 py-4 font-bold text-gray-500 hover:text-gray-900 transition-colors text-sm">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-xl px-8 py-4 font-bold text-base transition-colors" data-testid="run-scenario-btn">Run My Scenario</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                    <div><h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Your Financial Future</h2><p className="text-gray-500 text-sm">See your financial future unfold.</p></div>
                    <div className="mt-4 md:mt-0"><div className="w-20 h-20 rounded-full border-4 border-teal-500 flex items-center justify-center"><span className="text-3xl font-bold text-teal-600">{whatIfScore > 50 ? whatIfScore : 35}</span></div></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { icon: <TrendingUp className="w-3.5 h-3.5 text-gray-400" />, label: "Current Net Worth", value: `$${(currentNW / 1000).toFixed(1)}K` },
                      { icon: <Target className="w-3.5 h-3.5 text-gray-400" />, label: `Projected at ${retirementAge}`, value: projectedAt65 >= 1000000 ? `$${(projectedAt65 / 1000000).toFixed(1)}M` : `$${Math.round(projectedAt65 / 1000)}K` },
                      { icon: <Clock className="w-3.5 h-3.5 text-gray-400" />, label: "Target Age", value: `${retirementAge}` },
                      { icon: <CreditCard className="w-3.5 h-3.5 text-gray-400" />, label: "Debt Freedom", value: `${debtFreeYears}.0` },
                    ].map((s) => (
                      <div key={s.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-2">{s.icon}<span className="text-[10px] text-gray-500 font-medium">{s.label}</span></div>
                        <div className="text-xl font-bold text-gray-900">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-sm text-gray-700 flex items-center gap-1.5">Your Net Worth Over Time <Info className="w-3.5 h-3.5 text-gray-400" /></div>
                      <div className="flex items-center gap-4 text-[10px]">
                        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div> Current Path</div>
                        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> People Like Me</div>
                        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Improved Plan</div>
                      </div>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradImproved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/><stop offset="95%" stopColor="#e11d48" stopOpacity={0}/></linearGradient>
                            <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                            <linearGradient id="gradAverage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="age" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v} Yrs`} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${Math.round(v/1000)}K`} />
                          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} labelFormatter={(label: string) => `Age ${label}`} />
                          <Area type="monotone" dataKey="current" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradCurrent)" />
                          <Area type="monotone" dataKey="average" stroke="#f59e0b" strokeWidth={2} fill="url(#gradAverage)" strokeDasharray="5 5" />
                          <Area type="monotone" dataKey="improved" stroke="#e11d48" strokeWidth={2.5} fill="url(#gradImproved)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-[#f5c542] rounded-r-lg p-4 mb-8">
                    <div className="flex items-start gap-2"><Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-700">Increasing your savings rate by {increaseSavingsRate}% could accelerate your retirement timeline by {retireEarlier} years. This could compound to an additional ${Math.round((improvedAt65 - projectedAt65) / 1000)}K by age {retirementAge}.</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                    <div><div className="text-xs text-gray-500 mb-1">What-If Score</div><div className="text-3xl font-bold text-gray-900">{whatIfScore}</div><div className="text-[10px] text-gray-400">Out of 100</div></div>
                    <div><div className="text-xs text-gray-500 mb-1">Ranks</div><div className="text-3xl font-bold text-gray-900">3/3</div><div className="text-[10px] text-gray-400">Above Average</div></div>
                    <div><div className="text-xs text-gray-500 mb-1">Percentile Ranking</div><div className="text-3xl font-bold text-gray-900">90%</div></div>
                  </div>
                  <ProgressCards savingsRate={savingsRate} increaseSavingsRate={increaseSavingsRate} incomeMonthly={incomeMonthly} totalDebt={totalDebt} payOffDebtFaster={payOffDebtFaster} debtFreeYears={debtFreeYears} retirementAge={retirementAge} retireEarlier={retireEarlier} investmentReturn={investmentReturn} annualReturns={annualReturns} />
                  <div className="bg-amber-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#f5c542] flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-gray-900" /></div><span className="text-sm font-bold text-gray-900">Amazing Progress! Your What-If score improved.</span></div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap" data-testid="try-another-btn">Try Another Scenario</button>
                      <button className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap">Share Your Result</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgressCards({ savingsRate, increaseSavingsRate, incomeMonthly, totalDebt, payOffDebtFaster, debtFreeYears, retirementAge, retireEarlier, investmentReturn, annualReturns }: {
  savingsRate: number; increaseSavingsRate: number; incomeMonthly: number; totalDebt: number; payOffDebtFaster: number; debtFreeYears: number; retirementAge: number; retireEarlier: number; investmentReturn: number; annualReturns: number;
}) {
  const cards = [
    { color: "green", label: "Savings Rate", val: `${Math.min(savingsRate + increaseSavingsRate - Math.round(increaseSavingsRate * 0.6), 100)}%`, old: `${savingsRate}%`, pct: Math.min(savingsRate + increaseSavingsRate - Math.round(increaseSavingsRate * 0.6), 100), desc: `Currently saving $${Math.round(incomeMonthly * savingsRate / 100)}/mo.` },
    { color: "orange", label: "Debt Burden", val: `$${Math.round(totalDebt * (1 - payOffDebtFaster / 100) / 1000)}K`, old: `$${Math.round(totalDebt / 1000)}K`, pct: 100 - payOffDebtFaster, desc: `Debt takes ~${debtFreeYears} years to pay off.` },
    { color: "blue", label: "Retirement Timeline", val: `${retirementAge - retireEarlier}`, old: `${retirementAge}`, pct: ((retirementAge - retireEarlier) / retirementAge) * 100, desc: `Retire ${retireEarlier} years earlier.` },
    { color: "purple", label: "Investment Growth", val: `${annualReturns}%`, old: `${investmentReturn}%`, pct: (annualReturns / 12) * 100, desc: `${annualReturns}% vs baseline ${investmentReturn}%.` },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-3"><div className={`w-2 h-2 rounded-full bg-${c.color}-500`}></div><span className="text-[10px] text-gray-500 font-medium">{c.label}</span></div>
          <div className="flex items-end gap-3 mb-2"><span className={`text-2xl font-bold text-${c.color}-600`}>{c.val}</span><span className="text-sm text-gray-400 mb-0.5">{c.old}</span></div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-${c.color}-500 rounded-full`} style={{ width: `${c.pct}%` }}></div></div>
          <p className="text-[9px] text-gray-400 mt-2">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}
