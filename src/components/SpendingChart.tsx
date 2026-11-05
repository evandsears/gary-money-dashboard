import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { Sparkles, AlertCircle } from 'lucide-react';
import { type Transaction, type AiInsight } from '../types/index.ts';

interface SpendingChartProps {
  transactions: Transaction[];
  onCategoryClick?: (category: string) => void;
  selectedCategory: string | null;
  insight: AiInsight | null;
  loadingInsight: boolean;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  transactions,
  onCategoryClick,
  selectedCategory,
  insight,
  loadingInsight,
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Group by category
  const expenseData = React.useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const incomeData = React.useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpense = expenseData.reduce((acc, cur) => acc + cur.value, 0);
  const abnormalCount = transactions.filter(t => t.type === 'expense' && t.spendType === 'abnormal').length;
  const topCategory = expenseData[0] || { name: 'None', value: 0 };
  const topCategoryPct = totalExpense > 0 ? Math.round((topCategory.value / totalExpense) * 100) : 0;

  const currentData = activeTab === 'expense' ? expenseData : incomeData;

  return (
    <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 shadow-m3-1 flex flex-col min-h-[360px] w-full">
      {/* Header and Toggle */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-xl font-black text-stone-800 font-display">
            Spending Patterns
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Click any bar to filter ledger transactions
          </p>
        </div>
        <div className="flex bg-m3-surface-high p-1 rounded-full shadow-inner border border-m3-outline">
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'expense'
                ? 'bg-m3-primary text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'income'
                ? 'bg-m3-primary text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col md:flex-row gap-8 flex-1 w-full min-h-0">
        {/* Chart View */}
        <div className="flex-1 min-h-[220px] h-full overflow-hidden">
          {currentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAF2D3" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 11, fontWeight: 500 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <Tooltip 
                  cursor={{ fill: '#F0F4DB', opacity: 0.6 }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, activeTab === 'expense' ? 'Expense' : 'Income']}
                  contentStyle={{
                    borderRadius: '1rem',
                    border: '1px solid #EAF2D3',
                    backgroundColor: '#FCFDF6',
                    color: '#131F19',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => onCategoryClick && onCategoryClick(entry.name)}
                  className="cursor-pointer"
                >
                  {currentData.map((entry, index) => {
                    const isSelected = selectedCategory === entry.name;
                    let fill = activeTab === 'expense' ? '#B04C4C' : '#8BCE8D';
                    if (selectedCategory) {
                      fill = isSelected 
                        ? (activeTab === 'expense' ? '#922B2B' : '#5CAE5F')
                        : '#D6D3D1';
                    }
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-400 text-xs font-bold uppercase tracking-wider">
              No {activeTab} data for this period
            </div>
          )}
        </div>

        {/* Sidebar Info & Gary's Insights */}
        <div className="w-full md:w-80 flex flex-col justify-start border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-m3-surface/50 p-3 rounded-2xl border border-m3-outline">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Top Category
              </p>
              <p className="text-base font-extrabold text-stone-800 truncate mt-0.5">
                {topCategory.name}
              </p>
              <p className="text-xs text-stone-500 font-medium">
                {topCategoryPct}% of spend
              </p>
            </div>

            <div className="bg-m3-surface/50 p-3 rounded-2xl border border-m3-outline">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                Abnormal Spend
              </p>
              <p className="text-base font-extrabold text-rose-600 font-mono mt-0.5">
                {abnormalCount}
              </p>
              <p className="text-xs text-stone-500 font-medium">
                Unplanned entries
              </p>
            </div>
          </div>

          {/* Gary's Insights Box */}
          {loadingInsight ? (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-pulse">
              <div className="h-3 bg-emerald-200/50 rounded w-1/3 mb-2" />
              <div className="h-2 bg-emerald-200/40 rounded w-full mb-1" />
              <div className="h-2 bg-emerald-200/40 rounded w-4/5" />
            </div>
          ) : insight ? (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100/70 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gary's Insights</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                {insight.summary}
              </p>
              {insight.suggestion && (
                <div className="text-xs font-medium text-emerald-900 leading-relaxed bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200/50">
                  <span className="font-bold text-emerald-800 uppercase text-[9px] tracking-wider block mb-0.5">
                    Gary's Tip
                  </span>
                  {insight.suggestion}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
