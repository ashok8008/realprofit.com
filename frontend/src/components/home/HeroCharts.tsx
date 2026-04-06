import { ResponsiveContainer, AreaChart, Area } from "recharts";

export default function HeroCharts() {
  return (
    <>
      {/* Salary Comparison Card */}
      <div className="absolute top-0 right-8 bg-white rounded-xl p-5 shadow-2xl rotate-2 w-56 z-20 border border-gray-100">
        <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2">Salary Comparison</div>
        <div className="flex items-end gap-1.5 mb-2">
          <div className="w-5 bg-teal-400 rounded-sm" style={{height: '32px'}}></div>
          <div className="w-5 bg-gray-300 rounded-sm" style={{height: '24px'}}></div>
          <div className="w-5 bg-teal-400 rounded-sm" style={{height: '44px'}}></div>
          <div className="w-5 bg-gray-300 rounded-sm" style={{height: '36px'}}></div>
          <div className="w-5 bg-teal-500 rounded-sm" style={{height: '52px'}}></div>
        </div>
        <div className="text-[10px] text-gray-500">Your salary: <span className="font-bold text-emerald-600">Above avg</span></div>
      </div>
      
      {/* Resume Preview Card */}
      <div className="absolute top-12 right-64 bg-white rounded-xl p-4 shadow-2xl -rotate-6 w-48 z-10 border border-gray-100">
        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Resume Builder</div>
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-200 rounded-full"></div>
          <div className="h-2 w-3/4 bg-gray-200 rounded-full"></div>
          <div className="h-2 w-5/6 bg-gray-200 rounded-full"></div>
          <div className="h-1.5 w-1/2 bg-blue-200 rounded-full mt-2"></div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
          <div className="h-1.5 w-4/5 bg-gray-100 rounded-full"></div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-[9px] text-gray-500 font-semibold">ATS-ready</span>
        </div>
      </div>
      
      {/* Expense/Subscription Chart Card */}
      <div className="absolute top-52 right-4 bg-white rounded-xl p-5 shadow-2xl rotate-1 w-60 z-30 border border-gray-100">
        <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">Expense Tracker</div>
        <div className="h-14 w-full mb-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={[{v:800},{v:650},{v:900},{v:550},{v:700},{v:450}]}>
              <Area type="monotone" dataKey="v" stroke="#f97316" fill="#fed7aa" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-gray-400">Monthly spending</span>
          <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">-$350 saved</span>
        </div>
      </div>

      {/* Mortgage Card */}
      <div className="absolute bottom-2 right-56 bg-white rounded-xl p-4 shadow-2xl -rotate-3 w-48 z-20 border border-gray-100">
        <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2">Mortgage</div>
        <div className="text-lg font-bold text-gray-900" style={{fontFamily: 'JetBrains Mono, monospace'}}>$2,850<span className="text-xs font-normal text-gray-400">/mo</span></div>
        <div className="h-1 w-full bg-gray-200 rounded-full mt-2">
          <div className="h-full w-1/3 bg-violet-500 rounded-full"></div>
        </div>
      </div>
    </>
  );
}
