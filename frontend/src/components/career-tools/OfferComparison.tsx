import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Download, Trophy, DollarSign, Briefcase, Heart } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";

const STORAGE_KEY = 'offer_comparison';

interface JobOffer {
  id: string;
  companyName: string;
  jobTitle: string;
  baseSalary: number;
  signingBonus: number;
  annualBonus: number;
  stockValue: number;
  stockVestingYears: number;
  healthInsurance: number;
  retirement401k: number;
  ptoWeeks: number;
  remoteWork: boolean;
  commuteCost: number;
  otherBenefits: number;
  notes: string;
}

const createEmptyOffer = (): JobOffer => ({
  id: Date.now().toString(),
  companyName: '',
  jobTitle: '',
  baseSalary: 0,
  signingBonus: 0,
  annualBonus: 0,
  stockValue: 0,
  stockVestingYears: 4,
  healthInsurance: 0,
  retirement401k: 0,
  ptoWeeks: 2,
  remoteWork: false,
  commuteCost: 0,
  otherBenefits: 0,
  notes: '',
});

function calculateTotalComp(offer: JobOffer): {
  year1: number;
  yearlyAvg: number;
  breakdown: { name: string; value: number }[];
} {
  const annualStock = offer.stockVestingYears > 0 ? offer.stockValue / offer.stockVestingYears : 0;
  const annualCommuteCost = offer.remoteWork ? 0 : offer.commuteCost * 12;
  
  const year1 = 
    offer.baseSalary + 
    offer.signingBonus + 
    offer.annualBonus + 
    annualStock +
    offer.healthInsurance +
    offer.retirement401k +
    offer.otherBenefits -
    annualCommuteCost;
  
  const yearlyAvg = 
    offer.baseSalary + 
    offer.annualBonus + 
    annualStock +
    offer.healthInsurance +
    offer.retirement401k +
    offer.otherBenefits -
    annualCommuteCost;
  
  const breakdown = [
    { name: 'Base Salary', value: offer.baseSalary },
    { name: 'Bonus', value: offer.annualBonus },
    { name: 'Stock/Equity', value: annualStock },
    { name: 'Benefits', value: offer.healthInsurance + offer.retirement401k + offer.otherBenefits },
  ].filter(b => b.value > 0);
  
  return { year1, yearlyAvg, breakdown };
}

export function OfferComparison() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<JobOffer[]>(() => {
    const saved = loadFromStorage<JobOffer[]>(STORAGE_KEY, []);
    return saved.length > 0 ? saved : [createEmptyOffer(), createEmptyOffer()];
  });

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, offers);
    }, 500);
    return () => clearTimeout(timeout);
  }, [offers]);

  const addOffer = () => {
    if (offers.length >= 5) {
      toast({ title: "Maximum 5 offers", description: "Remove an offer to add a new one." });
      return;
    }
    setOffers([...offers, createEmptyOffer()]);
  };

  const removeOffer = (id: string) => {
    if (offers.length <= 2) {
      toast({ title: "Minimum 2 offers", description: "Need at least 2 offers to compare." });
      return;
    }
    setOffers(offers.filter(o => o.id !== id));
  };

  const updateOffer = (id: string, field: keyof JobOffer, value: any) => {
    setOffers(offers.map(o => 
      o.id === id ? { ...o, [field]: value } : o
    ));
  };

  const handleReset = () => {
    if (confirm('Clear all offers and start over?')) {
      setOffers([createEmptyOffer(), createEmptyOffer()]);
      clearStorage(STORAGE_KEY);
      toast({ title: "Offers cleared" });
    }
  };

  // Calculate totals and find winner
  const offerResults = offers.map(offer => ({
    offer,
    ...calculateTotalComp(offer),
  }));

  const validOffers = offerResults.filter(r => r.offer.baseSalary > 0);
  const bestOffer = validOffers.length > 0 
    ? validOffers.reduce((best, curr) => curr.yearlyAvg > best.yearlyAvg ? curr : best)
    : null;

  // Chart data
  const chartData = validOffers.map(r => ({
    name: r.offer.companyName || 'Unnamed',
    'Year 1 Total': r.year1,
    'Yearly Average': r.yearlyAvg,
  }));

  const colors = ['#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Compare Job Offers</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>Reset All</Button>
          <Button size="sm" onClick={addOffer} disabled={offers.length >= 5}>
            <Plus className="w-4 h-4 mr-1" /> Add Offer
          </Button>
        </div>
      </div>

      {/* Offer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer, idx) => {
          const result = offerResults[idx];
          const isBest = bestOffer && bestOffer.offer.id === offer.id && validOffers.length > 1;
          
          return (
            <div 
              key={offer.id} 
              className={`border rounded-xl p-5 space-y-4 ${
                isBest ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20' : 'bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isBest && <Trophy className="w-5 h-5 text-teal-600" />}
                  <span className="font-semibold text-sm">Offer {idx + 1}</span>
                </div>
                {offers.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeOffer(offer.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Company Name</Label>
                  <Input 
                    placeholder="Company"
                    value={offer.companyName}
                    onChange={e => updateOffer(offer.id, 'companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Job Title</Label>
                  <Input 
                    placeholder="Software Engineer"
                    value={offer.jobTitle}
                    onChange={e => updateOffer(offer.id, 'jobTitle', e.target.value)}
                  />
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Compensation
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Base Salary</Label>
                      <Input 
                        type="number"
                        placeholder="100000"
                        value={offer.baseSalary || ''}
                        onChange={e => updateOffer(offer.id, 'baseSalary', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Signing Bonus</Label>
                      <Input 
                        type="number"
                        placeholder="10000"
                        value={offer.signingBonus || ''}
                        onChange={e => updateOffer(offer.id, 'signingBonus', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Annual Bonus</Label>
                      <Input 
                        type="number"
                        placeholder="15000"
                        value={offer.annualBonus || ''}
                        onChange={e => updateOffer(offer.id, 'annualBonus', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Stock Value (total)</Label>
                      <Input 
                        type="number"
                        placeholder="50000"
                        value={offer.stockValue || ''}
                        onChange={e => updateOffer(offer.id, 'stockValue', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Benefits
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Health Insurance/yr</Label>
                      <Input 
                        type="number"
                        placeholder="8000"
                        value={offer.healthInsurance || ''}
                        onChange={e => updateOffer(offer.id, 'healthInsurance', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">401k Match/yr</Label>
                      <Input 
                        type="number"
                        placeholder="6000"
                        value={offer.retirement401k || ''}
                        onChange={e => updateOffer(offer.id, 'retirement401k', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Work Style
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Remote Work</Label>
                    <Switch 
                      checked={offer.remoteWork}
                      onCheckedChange={v => updateOffer(offer.id, 'remoteWork', v)}
                    />
                  </div>
                  {!offer.remoteWork && (
                    <div>
                      <Label className="text-xs">Monthly Commute Cost</Label>
                      <Input 
                        type="number"
                        placeholder="300"
                        value={offer.commuteCost || ''}
                        onChange={e => updateOffer(offer.id, 'commuteCost', Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>

                {/* Result Summary */}
                {offer.baseSalary > 0 && (
                  <div className={`pt-3 border-t ${isBest ? 'bg-teal-100/50' : 'bg-muted/30'} -mx-5 -mb-5 p-5 rounded-b-xl`}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Year 1 Total</div>
                        <div className="text-lg font-bold">${result.year1.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Yearly Avg</div>
                        <div className={`text-lg font-bold ${isBest ? 'text-teal-600' : ''}`}>
                          ${result.yearlyAvg.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Chart */}
      {validOffers.length >= 2 && (
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Total Compensation Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Year 1 Total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Yearly Average" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Winner Summary */}
      {bestOffer && validOffers.length >= 2 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-8 h-8 text-teal-600" />
            <div>
              <h3 className="font-bold text-teal-800">Recommended: {bestOffer.offer.companyName || 'Unnamed'}</h3>
              <p className="text-teal-600 text-sm">{bestOffer.offer.jobTitle}</p>
            </div>
          </div>
          <p className="text-teal-700">
            Based on total compensation, this offer provides <strong>${bestOffer.yearlyAvg.toLocaleString()}</strong> in 
            average yearly value, which is{' '}
            <strong>
              ${(bestOffer.yearlyAvg - validOffers.filter(v => v !== bestOffer).reduce((sum, v) => sum + v.yearlyAvg, 0) / (validOffers.length - 1)).toLocaleString()}
            </strong> more than the average of other offers.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 mb-2">Tips for Comparing Offers</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Consider the total value of stock/equity, not just base salary</li>
          <li>• Factor in health insurance premiums your employer covers</li>
          <li>• Remote work can save $3,000-$10,000+ yearly in commute costs</li>
          <li>• 401k match is free money — factor in the full employer contribution</li>
          <li>• Consider growth opportunities, culture, and job satisfaction beyond compensation</li>
        </ul>
      </div>
    </div>
  );
}
