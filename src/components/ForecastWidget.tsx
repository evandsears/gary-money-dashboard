import React, { useState } from 'react';
import { Target, Bot, AlertTriangle } from 'lucide-react';
import { type Transaction, type AiForecast } from '../types/index.ts';

interface ForecastWidgetProps {
  transactions: Transaction[];
  targetBudget: number;
  onUpdateBudget: (budget: number) => void;
  forecast: AiForecast | null;
  loadingForecast: boolean;
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({
  transactions,
  targetBudget,
  onUpdateBudget,
  forecast,
  loadingForecast,
}) => {
  const [activeTab, setActiveTab] = useState<'tally' | 'forecast'>('forecast');

  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

  // Category breakdown top 3
  const topCategories = React.useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [expenses]);

  return (
    <div className="bg-m3-primary border border-m3-primary-container rounded-m3-xl p-6 shadow-m3-3 flex flex-col justify-between overflow-hidden min-h-[360px] text-m3-on-primary">
      {/* Header with Tally / AI switcher */}
      <div>
        <div className="flex justify-between items-center mb-5 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-m3-on-primary font-black font-display text-lg tracking-tight">
              {activeTab === 'tally' ? 'Category Tally' : 'Budget Forecast'}
            </h2>
          </div>
          <div className="flex bg-[#213329] p-1 rounded-full shadow-inner border border-emerald-950">
            <button
              onClick={() => setActiveTab('tally')}
              className={`px-3.5 py-1 text-[10px] font-extrabold uppercase rounded-full transition-all ${
                activeTab === 'tally'
                  ? 'bg-m3-tertiary text-m3-primary shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tally
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3.5 py-1 text-[10px] font-extrabold uppercase rounded-full transition-all ${
                activeTab === 'forecast'
                  ? 'bg-m3-tertiary text-m3-primary shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              AI Forecast
            </button>
          </div>
        </div>

        {/* Tab 1: Category Tally */}
        {activeTab === 'tally' && (
          <div className="space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-300">{item.name}</span>
                    <span className="text-white font-mono font-bold">
                      ${item.value.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-emerald-400' : idx === 1 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (item.value / (totalExpense || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-stone-500 text-xs py-8">
                No expense categories recorded yet
              </div>
            )}
            <div className="pt-3 border-t border-stone-800 text-center">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                Top 3 Heavy Categories
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: AI Forecast */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            {/* Target Budget Input */}
            <div className="bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-m3-tertiary" />
                <span>Target Monthly Budget</span>
              </label>
              <div className="flex items-center gap-2 text-white font-mono text-2xl font-bold">
                <span className="text-emerald-400">$</span>
                <input
                  type="number"
                  value={targetBudget || ''}
                  onChange={(e) => onUpdateBudget(Math.max(0, Number(e.target.value)))}
                  className="bg-transparent border-none outline-none text-white w-full font-bold font-mono focus:ring-0"
                  placeholder="2500"
                  min="0"
                />
              </div>
            </div>

            {/* Forecast Output */}
            {loadingForecast ? (
              <div className="animate-pulse space-y-2.5 py-2">
                <div className="h-2.5 bg-stone-800 rounded w-full" />
                <div className="h-2.5 bg-stone-800 rounded w-5/6" />
                <div className="h-2.5 bg-stone-800 rounded w-2/3" />
              </div>
            ) : forecast ? (
              <div className="space-y-3">
                <div className="text-xs text-stone-300 leading-relaxed font-medium bg-stone-900/40 p-3 rounded-xl border border-stone-800/60">
                  <strong className="text-emerald-400 font-bold tracking-wider text-[10px] uppercase block mb-1 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" /> Forecast Analysis
                  </strong>
                  {forecast.summary}
                </div>

                <div className="text-xs text-stone-300 leading-relaxed font-medium bg-rose-950/20 p-3 rounded-xl border border-rose-900/30">
                  <strong className="text-rose-400 font-bold tracking-wider text-[10px] uppercase block mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Budget Alerts
                  </strong>
                  {forecast.overruns}
                </div>
              </div>
            ) : (
              <div className="text-center text-stone-500 text-[10px] uppercase tracking-widest py-4">
                No Forecast Available
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-800/80 flex justify-between items-center text-[10px] text-stone-400 uppercase tracking-widest">
        <span>Gary Autonomous Engine</span>
        <span className="text-emerald-400 font-semibold">Active</span>
      </div>
    </div>
  );
};
