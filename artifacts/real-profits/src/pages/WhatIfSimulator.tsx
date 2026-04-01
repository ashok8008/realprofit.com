import React, { useState, useMemo } from "react";
import { Seo } from "@/components/Seo";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { PlayCircle, Info, TrendingUp, Target, Clock, CreditCard } from "lucide-react";

function RpSlider({ label, value, onChange, min, max, step, color, unit, infoIcon }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; color: string; unit?: string; infoIcon?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const displayVal = unit === '$' ? `$${value.toLocaleString()}` : unit === '%' ? `${value}%` : `${value}`;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {infoIcon && <Info className="w-3.5 h-3.5 text-gray-400" />}
        </div>
        <span className="text-sm font-bold text-gray-900 border border-gray-200 rounded-md px-3 py-1 bg-gray-50 min-w-[70px] text-center">
          {displayVal}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rp-slider w-full"
        style={{
          '--slider-color': color,
          background: `linear-gradient(to right, ${color} ${pct}%, #e5e7eb ${pct}%)`
        } as React.CSSProperties}
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{unit === '$' ? `$${min.toLocaleString()}` : unit === '%' ? `${min}%` : min}</span>
        <span>{unit === '$' ? `$${max.toLocaleString()}` : unit === '%' ? `${max}%` : max}</span>
      </div>
    </div>
  );
}

function CircularProgress({ value, max, size, color, label }: {
  value: number; max: number; size: number; color: string; label: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="text-[10px] text-gray-500 mt-1">{label}</span>
    </div>
  );
}

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
      data.push({
        age,
        current: Math.round(currentNW),
        improved: Math.round(improvedNW),
        average: Math.round(avgNW),
      });
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
      <Seo 
        title="What If Simulator"
        description="Explore how different financial choices impact your long-term wealth."
        path="/what-if"
      />
      
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2 text-white">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Discover Your Financial "What-Ifs"
              </h1>
              <p className="text-base text-white/80 mb-8 leading-relaxed max-w-md">
                Ever wondered how your life could change if you made different financial choices today? Explore different scenarios, see your net worth grow, and share your results with friends!
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-md px-6 py-3 font-bold text-sm transition-colors shadow-lg flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Start Your Simulation
                </button>
                <button className="border-2 border-white text-white hover:bg-white/10 rounded-md px-6 py-3 font-bold text-sm transition-colors flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  How it works?
                </button>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative h-[380px] hidden lg:block">
              <div className="absolute top-0 left-8 bg-[#2563eb] rounded-xl p-4 shadow-2xl w-48 z-20 text-white">
                <div className="text-[10px] text-blue-200 mb-1">Portfolio Value</div>
                <div className="text-2xl font-bold">$1,706.58</div>
                <div className="flex gap-1 mt-2">
                  {[40, 60, 30, 70, 50, 80, 45].map((h, i) => (
                    <div key={i} className="w-3 rounded-sm" style={{ height: `${h * 0.3}px`, backgroundColor: i === 5 ? '#f5c542' : 'rgba(255,255,255,0.3)' }}></div>
                  ))}
                </div>
              </div>
              
              <div className="absolute top-2 right-0 bg-[#1e1b4b] rounded-xl p-4 shadow-2xl w-44 z-20 text-white">
                <div className="text-[10px] text-purple-300 mb-1">Weekly Savings</div>
                <div className="text-xl font-bold text-[#f5c542]">$2,150</div>
                <div className="mt-2 h-1 bg-purple-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f5c542] w-3/4 rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute top-28 right-4 bg-white rounded-xl p-4 shadow-2xl w-56 z-30">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Scenario Controls</div>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-gray-900">$2,150</div>
                  <div className="flex-1">
                    <div className="h-1 bg-gray-200 rounded-full mb-1">
                      <div className="h-full bg-teal-500 w-2/3 rounded-full"></div>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full">
                      <div className="h-full bg-[#f5c542] w-1/2 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[9px]">
                  <div className="bg-gray-50 rounded p-1.5">
                    <div className="text-gray-400">Time Horizon</div>
                    <div className="font-bold text-gray-700">25 Years</div>
                  </div>
                  <div className="bg-gray-50 rounded p-1.5">
                    <div className="text-gray-400">Retirement date</div>
                    <div className="font-bold text-gray-700">2055</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-16 left-16 bg-white rounded-xl p-4 shadow-2xl w-32 z-20">
                <div className="relative w-20 h-20 mx-auto">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="100" strokeDashoffset="32" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">68%</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-20 bg-teal-600 rounded-lg p-3 shadow-lg w-36 z-10 text-white">
                <div className="text-[9px] text-teal-200">Budget Protection</div>
                <div className="text-sm font-bold mt-1">Active</div>
                <div className="h-1 bg-teal-800 rounded-full mt-2">
                  <div className="h-full bg-teal-300 w-4/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard */}
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
                {[
                  { num: 1, title: "Your Finances" },
                  { num: 2, title: "What-If Scenarios" },
                  { num: 3, title: "Your Future" }
                ].map((s) => (
                  <div key={s.num} className="flex gap-3 cursor-pointer items-center" onClick={() => setStep(s.num)}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      step >= s.num ? "bg-[#f5c542] text-gray-900" : "bg-gray-100 text-gray-400"
                    }`}>
                      {s.num}
                    </div>
                    <span className={`text-sm font-medium ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Set Your Financial Basics</h2>
                  <p className="text-gray-500 text-sm mb-8">Tell us about your current financial life -- income, savings, and expenses. This helps us estimate your starting point and financial potential.</p>
                  
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-sm text-gray-700">Personal Information</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Current Age</label>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <span className="bg-gray-50 px-3 py-2.5 text-xs text-gray-400 border-r border-gray-200">Yrs</span>
                          <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))}
                            className="w-full px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Retirement Age</label>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <span className="bg-gray-50 px-3 py-2.5 text-xs text-gray-400 border-r border-gray-200">Yrs</span>
                          <input type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))}
                            className="w-full px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-sm text-gray-700">Current Financial Status</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <RpSlider label="Income (Monthly)" value={incomeMonthly} onChange={setIncomeMonthly} min={1000} max={25000} step={500} color="#0d9488" unit="$" infoIcon />
                      <RpSlider label="Savings Rate" value={savingsRate} onChange={setSavingsRate} min={0} max={75} step={1} color="#06b6d4" unit="%" infoIcon />
                      <RpSlider label="Expenses (Monthly)" value={expensesMonthly} onChange={setExpensesMonthly} min={200} max={15000} step={100} color="#3b82f6" unit="$" infoIcon />
                      <RpSlider label="Debt Payoff (Monthly)" value={totalDebt} onChange={setTotalDebt} min={0} max={50000} step={1000} color="#f97316" unit="$" infoIcon />
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-sm text-gray-700">Investment Preferences</span>
                    </div>
                    <div className="max-w-md">
                      <RpSlider label="Investment Return Rate (Yearly)" value={investmentReturn} onChange={setInvestmentReturn} min={0} max={15} step={0.5} color="#8b5cf6" unit="%" infoIcon />
                    </div>
                  </div>
                  
                  <button onClick={() => setStep(2)}
                    className="w-full bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-xl px-8 py-4 font-bold text-base transition-colors">
                    Next
                  </button>
                </div>
              )}
              
              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Try "What-If" Scenarios</h2>
                  <p className="text-gray-500 text-sm mb-8">Experiment with choices that shape your future. See how small lifestyle shifts can lead to big financial impacts.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <RpSlider label="Raise Salary (Yearly)" value={raiseSalary} onChange={setRaiseSalary} min={1} max={50} step={1} color="#f97316" unit="%" infoIcon />
                    <RpSlider label="Retire Earlier (By Years)" value={retireEarlier} onChange={setRetireEarlier} min={0} max={10} step={1} color="#22c55e" unit="" infoIcon />
                    <RpSlider label="Pay Off Debt Faster (Monthly)" value={payOffDebtFaster} onChange={setPayOffDebtFaster} min={0} max={50} step={5} color="#f97316" unit="%" infoIcon />
                    <RpSlider label="Increase Savings Rate (Monthly)" value={increaseSavingsRate} onChange={setIncreaseSavingsRate} min={0} max={50} step={1} color="#22c55e" unit="%" infoIcon />
                    <RpSlider label="Reduce Monthly Expenses (Monthly)" value={reduceExpenses} onChange={setReduceExpenses} min={0} max={40} step={5} color="#3b82f6" unit="%" infoIcon />
                    <RpSlider label="Annual Returns (Yearly)" value={annualReturns} onChange={setAnnualReturns} min={0} max={12} step={0.5} color="#0d9488" unit="%" infoIcon />
                  </div>
                  
                  <div className="mt-10 flex gap-4">
                    <button onClick={() => setStep(1)} className="px-6 py-4 font-bold text-gray-500 hover:text-gray-900 transition-colors text-sm">
                      Back
                    </button>
                    <button onClick={() => setStep(3)}
                      className="flex-1 bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-xl px-8 py-4 font-bold text-base transition-colors">
                      Run My Scenario
                    </button>
                  </div>
                </div>
              )}
              
              {/* STEP 3 */}
              {step === 3 && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Your Financial Future</h2>
                      <p className="text-gray-500 text-sm">See your financial future unfold -- how today's choices impact tomorrow's wealth.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="w-20 h-20 rounded-full border-4 border-teal-500 flex items-center justify-center">
                        <span className="text-3xl font-bold text-teal-600">{whatIfScore > 50 ? whatIfScore : 35}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-medium">Current Net Worth</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">${(currentNW / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Target className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-medium">Projected Growth at {retirementAge}</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">${projectedAt65 >= 1000000 ? `${(projectedAt65 / 1000000).toFixed(1)}M` : `${Math.round(projectedAt65 / 1000)}K`}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-medium">Target Age</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{retirementAge}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-medium">Debt Freedom</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{debtFreeYears}.0</div>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-sm text-gray-700 flex items-center gap-1.5">
                        Your Net Worth Over Time <Info className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-4 text-[10px]">
                        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div> Current Path</div>
                        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> People Like Me</div>
                        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Improved Plan</div>
                      </div>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradImproved" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gradAverage" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
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
                  
                  {/* Insight */}
                  <div className="bg-amber-50 border-l-4 border-[#f5c542] rounded-r-lg p-4 mb-8">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        Increasing your savings rate by {increaseSavingsRate}% could accelerate your retirement timeline by {retireEarlier} years. This adjustment could compound to an additional ${Math.round((improvedAt65 - projectedAt65) / 1000)}K by age {retirementAge}, providing greater financial security and flexibility in your golden years.
                      </p>
                    </div>
                  </div>
                  
                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">What-If Score</div>
                      <div className="text-3xl font-bold text-gray-900">{whatIfScore}</div>
                      <div className="text-[10px] text-gray-400">Out of 100</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Ranks</div>
                      <div className="text-3xl font-bold text-gray-900">3/3</div>
                      <div className="text-[10px] text-gray-400">Above Average</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Percentile Ranking</div>
                      <div className="text-3xl font-bold text-gray-900">90%</div>
                      <div className="text-[10px] text-gray-400"></div>
                    </div>
                  </div>
                  
                  {/* Progress Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] text-gray-500 font-medium">Savings Rate</span>
                      </div>
                      <div className="flex items-end gap-3 mb-2">
                        <span className="text-2xl font-bold text-green-600">{savingsRate + increaseSavingsRate > 100 ? 100 : savingsRate + increaseSavingsRate - Math.round(increaseSavingsRate * 0.6)}%</span>
                        <span className="text-sm text-gray-400 mb-0.5">{savingsRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${savingsRate + increaseSavingsRate > 100 ? 100 : savingsRate + increaseSavingsRate - Math.round(increaseSavingsRate * 0.6)}%` }}></div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">Currently, You're saving ${Math.round(incomeMonthly * savingsRate / 100)}/mo. Your adjusted target aims for more.</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-[10px] text-gray-500 font-medium">Debt Burden</span>
                      </div>
                      <div className="flex items-end gap-3 mb-2">
                        <span className="text-2xl font-bold text-orange-600">${Math.round(totalDebt * (1 - payOffDebtFaster / 100) / 1000)}K</span>
                        <span className="text-sm text-gray-400 mb-0.5">${Math.round(totalDebt / 1000)}K</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${100 - payOffDebtFaster}%` }}></div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">Below the average of 67%. Current Debt will take ~{debtFreeYears} years to pay off.</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] text-gray-500 font-medium">Retirement Timeline</span>
                      </div>
                      <div className="flex items-end gap-3 mb-2">
                        <span className="text-2xl font-bold text-blue-600">{retirementAge - retireEarlier}</span>
                        <span className="text-sm text-gray-400 mb-0.5">{retirementAge}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((retirementAge - retireEarlier) / retirementAge) * 100}%` }}></div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">By being more intentional today, you could retire {retireEarlier} years earlier.</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-[10px] text-gray-500 font-medium">Investment Growth</span>
                      </div>
                      <div className="flex items-end gap-3 mb-2">
                        <span className="text-2xl font-bold text-purple-600">{annualReturns}%</span>
                        <span className="text-sm text-gray-400 mb-0.5">{investmentReturn}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(annualReturns / 12) * 100}%` }}></div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">Targeting {annualReturns}% returns vs. baseline {investmentReturn}% provides significant compounding benefit.</p>
                    </div>
                  </div>
                  
                  {/* Bottom CTA */}
                  <div className="bg-amber-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#f5c542] flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-gray-900" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Amazing Progress! Your What-If score improved based on smarter financial decisions.</span>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap">
                        Try Another Scenario
                      </button>
                      <button className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap">
                        Share Your Result
                      </button>
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
