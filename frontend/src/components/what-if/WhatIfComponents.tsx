"use client";
import React from "react";
import { Info } from "lucide-react";

export function RpSlider({ label, value, onChange, min, max, step, color, unit, infoIcon }: {
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

export function WhatIfHero({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero-gradient py-16 md:py-24 px-4" data-testid="what-if-hero">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-1/2 text-white">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover Your Financial &quot;What-Ifs&quot;
            </h1>
            <p className="text-base text-white/80 mb-8 leading-relaxed max-w-md">
              Ever wondered how your life could change if you made different financial choices today? Explore different scenarios, see your net worth grow, and share your results with friends!
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onStart}
                className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-md px-6 py-3 font-bold text-sm transition-colors shadow-lg flex items-center gap-2"
                data-testid="start-simulation-btn"
              >
                Start Your Simulation
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 relative h-[380px] hidden lg:block">
            <div className="absolute top-0 left-8 bg-[#2563eb] rounded-xl p-4 shadow-2xl w-48 z-20 text-white">
              <div className="text-[10px] text-blue-200 mb-1">Portfolio Value</div>
              <div className="text-2xl font-bold">$1,706.58</div>
              <div className="flex gap-1 mt-2">
                {[40, 60, 30, 70, 50, 80, 45].map((h, i) => (
                  <div key={`bar-${i}`} className="w-3 rounded-sm" style={{ height: `${h * 0.3}px`, backgroundColor: i === 5 ? '#f5c542' : 'rgba(255,255,255,0.3)' }}></div>
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
                  <div className="h-1 bg-gray-200 rounded-full mb-1"><div className="h-full bg-teal-500 w-2/3 rounded-full"></div></div>
                  <div className="h-1 bg-gray-200 rounded-full"><div className="h-full bg-[#f5c542] w-1/2 rounded-full"></div></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-[9px]">
                <div className="bg-gray-50 rounded p-1.5"><div className="text-gray-400">Time Horizon</div><div className="font-bold text-gray-700">25 Years</div></div>
                <div className="bg-gray-50 rounded p-1.5"><div className="text-gray-400">Retirement date</div><div className="font-bold text-gray-700">2055</div></div>
              </div>
            </div>
            <div className="absolute bottom-16 left-16 bg-white rounded-xl p-4 shadow-2xl w-32 z-20">
              <div className="relative w-20 h-20 mx-auto">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="100" strokeDashoffset="32" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold text-gray-900">68%</span></div>
              </div>
            </div>
            <div className="absolute bottom-4 right-20 bg-teal-600 rounded-lg p-3 shadow-lg w-36 z-10 text-white">
              <div className="text-[9px] text-teal-200">Budget Protection</div>
              <div className="text-sm font-bold mt-1">Active</div>
              <div className="h-1 bg-teal-800 rounded-full mt-2"><div className="h-full bg-teal-300 w-4/5 rounded-full"></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
