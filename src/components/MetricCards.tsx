import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

interface MetricCardsProps {
  totalIncome: number;
  totalExpense: number;
  periodLabel: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalIncome,
  totalExpense,
  periodLabel
}) => {
  const savingsRate = totalIncome > 0 
    ? Math.max(-100, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100)).toFixed(1)
    : '0.0';

  const savingsRateNum = Number(savingsRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
      {/* Income Card */}
      <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 flex flex-col justify-between shadow-m3-1 transition-all hover:shadow-m3-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            {periodLabel} Income
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-display tracking-tight">
            ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 flex flex-col justify-between shadow-m3-1 transition-all hover:shadow-m3-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            {periodLabel} Expenses
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-3xl sm:text-4xl font-extrabold text-m3-error font-display tracking-tight">
            ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="bg-m3-tertiary border border-m3-tertiary-hover rounded-m3-xl p-6 flex flex-col justify-between shadow-m3-2 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-m3-primary/75 uppercase tracking-wider">
            Savings Rate
          </span>
          <div className="w-8 h-8 rounded-full bg-m3-primary/10 flex items-center justify-center text-m3-primary">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-3xl sm:text-4xl font-black text-m3-primary font-display tracking-tight">
            {savingsRate}%
          </span>
          <div className="flex-1 h-2 bg-m3-primary/15 rounded-full overflow-hidden ml-3 shadow-inner">
            <div
              className="h-full bg-m3-primary transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, savingsRateNum))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
