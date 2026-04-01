import React, { useState } from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { PlayCircle } from "lucide-react";

export default function WhatIfSimulator() {
  const [step, setStep] = useState(1);

  // Step 1 State
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [income, setIncome] = useState(60000); // Yearly based on monthly in prompt, but let's stick to prompt exactly
  const [incomeMonthly, setIncomeMonthly] = useState(5000);
  const [savingsRate, setSavingsRate] = useState(25);
  const [expensesMonthly, setExpensesMonthly] = useState(3000);
  const [debtPayoffMonthly, setDebtPayoffMonthly] = useState(500); // Prompt says default 20k, but slider $0-$50k. Assume it's total debt or monthly payoff. Let's do total debt.
  const [totalDebt, setTotalDebt] = useState(20000);
  const [investmentReturn, setInvestmentReturn] = useState(6);

  // Step 2 State
  const [raiseSalary, setRaiseSalary] = useState(5); // Prompt says default 25% but slider 1-15%? Let's use 5%.
  const [retireEarlier, setRetireEarlier] = useState(5);
  const [payOffDebtFaster, setPayOffDebtFaster] = useState(20);
  const [increaseSavingsRate, setIncreaseSavingsRate] = useState(20);
  const [reduceExpenses, setReduceExpenses] = useState(-20);
  const [annualReturns, setAnnualReturns] = useState(7.5);

  const calculateChartData = () => {
    const data = [];
    let currentNetWorth = 0;
    let improvedNetWorth = 0;
    
    let currentDebt = totalDebt;
    let improvedDebt = totalDebt;
    
    for (let age = currentAge; age <= 70; age++) {
      // Very basic approximation for visual effect
      const years = age - currentAge;
      
      const rCurrent = investmentReturn / 100;
      const rImproved = annualReturns / 100;
      
      const annualSavingsCurrent = (incomeMonthly * 12) * (savingsRate / 100);
      const annualSavingsImproved = ((incomeMonthly * 12) * (1 + raiseSalary/100)) * ((savingsRate + increaseSavingsRate) / 100);
      
      currentNetWorth = currentNetWorth * (1 + rCurrent) + annualSavingsCurrent;
      improvedNetWorth = improvedNetWorth * (1 + rImproved) + annualSavingsImproved;
      
      data.push({
        age,
        current: Math.round(currentNetWorth),
        improved: Math.round(improvedNetWorth),
      });
    }
    return data;
  };

  const chartData = calculateChartData();
  const projectedAt65 = chartData.find(d => d.age === retirementAge)?.current || 0;
  const improvedAt65 = chartData.find(d => d.age === retirementAge - retireEarlier)?.improved || 0;

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20">
      <Seo 
        title="What If Simulator"
        description="Explore how different financial choices impact your long-term wealth."
        path="/what-if"
      />
      
      {/* Hero Section */}
      <section className="hero-gradient dark:hero-gradient-dark py-20 px-4 overflow-hidden relative">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-6">
                Discover Your Financial What-Ifs
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                Ever wondered how your life could change if you made different financial choices today? Explore different scenarios, see your net worth grow, and share your results with friends!
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => {
                    document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-8 py-3 font-bold text-lg transition-colors shadow-lg"
                >
                  Start Your Simulation
                </button>
                <button className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-3 font-bold text-lg transition-colors flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  How it works?
                </button>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative h-[400px] hidden lg:block">
              {/* Decorative Cards */}
              <div className="absolute top-10 right-20 bg-white rounded-2xl p-6 shadow-2xl rotate-6 w-64 animate-in fade-in zoom-in duration-700 delay-150">
                <div className="h-2 w-1/2 bg-gray-200 rounded mb-4"></div>
                <div className="h-24 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-lg mb-4"></div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="h-2 w-16 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-800 rounded"></div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-teal-100"></div>
                </div>
              </div>
              
              <div className="absolute top-40 right-0 bg-white rounded-2xl p-6 shadow-2xl -rotate-3 w-72 animate-in fade-in zoom-in duration-700 delay-300 z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-[#f5c542] bg-opacity-20 flex items-center justify-center">
                    <span className="font-bold text-xl text-yellow-600">$</span>
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="text-2xl font-bold text-gray-900">+$42,500</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 rounded">
                    <div className="h-full w-3/4 bg-[#f5c542] rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded">
                    <div className="h-full w-1/2 bg-teal-400 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard Section */}
      <section id="wizard-section" className="py-16 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-6">Your Financial Journey<br/>All in One Glance</h3>
              
              <div className="space-y-6">
                {[
                  { num: 1, title: "Your Finances", desc: "Current numbers" },
                  { num: 2, title: "What-If Scenarios", desc: "Play with variables" },
                  { num: 3, title: "Your Future", desc: "See the results" }
                ].map((s) => (
                  <div key={s.num} className="flex gap-4 cursor-pointer" onClick={() => setStep(s.num)}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      step >= s.num ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {s.num}
                    </div>
                    <div>
                      <div className={`font-bold ${step >= s.num ? "text-gray-900" : "text-gray-500"}`}>{s.title}</div>
                      <div className="text-sm text-gray-500">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Assessment Progress</span>
                  <span className="font-bold text-teal-600">Step {step}/3</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 transition-all duration-500" 
                    style={{ width: `${(step / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[600px]">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="font-serif text-3xl font-bold mb-2">Set Your Financial Basics</h2>
                  <p className="text-gray-500 mb-8">Tell us about your current financial life - income, savings, and expenses.</p>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Current Age</label>
                        <input 
                          type="number" 
                          value={currentAge}
                          onChange={(e) => setCurrentAge(Number(e.target.value))}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 text-lg px-4 py-3 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Retirement Age</label>
                        <input 
                          type="number" 
                          value={retirementAge}
                          onChange={(e) => setRetirementAge(Number(e.target.value))}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 text-lg px-4 py-3 border"
                        />
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-8">
                      <h3 className="font-bold text-xl mb-6">Current Financial Status</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="font-bold text-gray-700">Monthly Income</label>
                            <span className="text-teal-600 font-bold">${incomeMonthly.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range" min="1000" max="25000" step="500" 
                            value={incomeMonthly} onChange={(e) => setIncomeMonthly(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="font-bold text-gray-700">Savings Rate</label>
                            <span className="text-teal-600 font-bold">{savingsRate}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="75" step="1" 
                            value={savingsRate} onChange={(e) => setSavingsRate(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="font-bold text-gray-700">Monthly Expenses</label>
                            <span className="text-teal-600 font-bold">${expensesMonthly.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range" min="200" max="15000" step="100" 
                            value={expensesMonthly} onChange={(e) => setExpensesMonthly(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="font-bold text-gray-700">Total Debt to Payoff</label>
                            <span className="text-teal-600 font-bold">${totalDebt.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range" min="0" max="50000" step="1000" 
                            value={totalDebt} onChange={(e) => setTotalDebt(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-8">
                      <h3 className="font-bold text-xl mb-6">Investment Preferences</h3>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="font-bold text-gray-700">Investment Return Rate (Yearly)</label>
                          <span className="text-teal-600 font-bold">{investmentReturn}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="15" step="0.5" 
                          value={investmentReturn} onChange={(e) => setInvestmentReturn(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10">
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-xl px-8 py-4 font-bold text-lg transition-colors"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
              
              {/* STEP 2 */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="font-serif text-3xl font-bold mb-2">Try What-If Scenarios</h2>
                  <p className="text-gray-500 mb-8">Experiment with choices that shape your future. See how small lifestyle shifts can lead to big financial impacts.</p>
                  
                  <div className="space-y-8">
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                      <div className="flex justify-between mb-2">
                        <label className="font-bold text-orange-800">Raise Salary (Yearly)</label>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded font-bold text-sm">+{raiseSalary}%</span>
                      </div>
                      <input 
                        type="range" min="1" max="15" step="1" 
                        value={raiseSalary} onChange={(e) => setRaiseSalary(Number(e.target.value))}
                        className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                    
                    <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                      <div className="flex justify-between mb-2">
                        <label className="font-bold text-teal-800">Retire Earlier</label>
                        <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded font-bold text-sm">-{retireEarlier} Years</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" step="1" 
                        value={retireEarlier} onChange={(e) => setRetireEarlier(Number(e.target.value))}
                        className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <div className="flex justify-between mb-2">
                        <label className="font-bold text-blue-800">Pay Off Debt Faster</label>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold text-sm">+{payOffDebtFaster}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="50" step="5" 
                        value={payOffDebtFaster} onChange={(e) => setPayOffDebtFaster(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                      <div className="flex justify-between mb-2">
                        <label className="font-bold text-green-800">Increase Savings Rate</label>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-sm">+{increaseSavingsRate}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="50" step="1" 
                        value={increaseSavingsRate} onChange={(e) => setIncreaseSavingsRate(Number(e.target.value))}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                    </div>
                    
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                      <div className="flex justify-between mb-2">
                        <label className="font-bold text-red-800">Reduce Monthly Expenses</label>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded font-bold text-sm">{reduceExpenses}%</span>
                      </div>
                      <input 
                        type="range" min="-40" max="0" step="5" 
                        value={reduceExpenses} onChange={(e) => setReduceExpenses(Number(e.target.value))}
                        className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                      <div className="flex justify-between mb-2">
                        <label className="font-bold text-purple-800">Target Annual Returns</label>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-bold text-sm">{annualReturns}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="12" step="0.5" 
                        value={annualReturns} onChange={(e) => setAnnualReturns(Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-10 flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-4 font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-xl px-8 py-4 font-bold text-lg transition-colors"
                    >
                      Run My Scenario
                    </button>
                  </div>
                </div>
              )}
              
              {/* STEP 3 */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="font-serif text-3xl font-bold mb-2">Your Financial Future</h2>
                  <p className="text-gray-500 mb-8">See your financial future unfold - how today's choices impact tomorrow's wealth.</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">Current Net Worth</div>
                      <div className="text-xl font-bold text-gray-900">${(0).toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
                      <div className="text-xs text-teal-700 font-bold mb-1 uppercase tracking-wider">Growth at {retirementAge}</div>
                      <div className="text-xl font-bold text-teal-800">${Math.round(projectedAt65).toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="text-xs text-blue-700 font-bold mb-1 uppercase tracking-wider">Target Age</div>
                      <div className="text-xl font-bold text-blue-800">{retirementAge - retireEarlier}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <div className="text-xs text-green-700 font-bold mb-1 uppercase tracking-wider">Debt Freedom</div>
                      <div className="text-xl font-bold text-green-800">4 Years</div>
                    </div>
                  </div>
                  
                  <div className="h-[400px] w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorImproved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="age" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
                          labelFormatter={(label) => `Age ${label}`}
                        />
                        <Area type="monotone" dataKey="improved" name="Improved Plan" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorImproved)" />
                        <Area type="monotone" dataKey="current" name="Current Path" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorCurrent)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-[#f5c542] bg-opacity-20 p-6 rounded-xl border border-[#f5c542] mb-8">
                    <p className="text-yellow-800 font-medium">
                      <span className="font-bold">Insight:</span> Increasing your savings rate by {increaseSavingsRate}% and aiming for {annualReturns}% returns could accelerate your retirement timeline by <span className="font-bold text-xl">{retireEarlier} years</span>, landing you with <span className="font-bold">${Math.round(improvedAt65).toLocaleString()}</span>.
                    </p>
                  </div>
                  
                  <h3 className="font-bold text-xl mb-6">Financial Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="border rounded-xl p-5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-bold text-gray-500">Savings Rate</div>
                        <div className="text-lg font-bold">{savingsRate + increaseSavingsRate}%</div>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (savingsRate + increaseSavingsRate)*2)}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="border rounded-xl p-5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-bold text-gray-500">Debt Burden</div>
                        <div className="text-lg font-bold text-orange-600">${totalDebt.toLocaleString()}</div>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    
                    <div className="border rounded-xl p-5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-bold text-gray-500">Retirement Target</div>
                        <div className="text-lg font-bold text-teal-600">Age {retirementAge - retireEarlier}</div>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-8">
                    <h3 className="font-serif text-2xl font-bold text-teal-800 mb-2">Amazing Progress!</h3>
                    <p className="text-gray-500">You're on track to significantly boost your wealth.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-xl px-8 py-4 font-bold text-lg transition-colors"
                    >
                      Try Another Scenario
                    </button>
                    <button 
                      className="flex-1 bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-xl px-8 py-4 font-bold text-lg transition-colors"
                    >
                      Share Your Result
                    </button>
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
