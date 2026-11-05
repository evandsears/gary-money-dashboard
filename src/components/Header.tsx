import React from 'react';
import { SlidersHorizontal, LogIn } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  viewMode: 'monthly' | 'yearly';
  setViewMode: (mode: 'monthly' | 'yearly') => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  selectedYear: string; // YYYY
  setSelectedYear: (year: string) => void;
  availableMonths: string[];
  availableYears: string[];
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  availableMonths,
  availableYears,
  onOpenSettings,
  onOpenProfile
}) => {
  const { user, isConfigured } = useAuth();

  return (
    <header className="flex justify-between items-start sm:items-center h-auto shrink-0 flex-col sm:flex-row gap-4 sm:gap-0 mt-2">
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black tracking-tight text-emerald-950 font-display underline decoration-emerald-500/40 underline-offset-8">
            GARY
          </h1>
          
          {/* View Switcher Pill */}
          <div className="flex bg-m3-surface-high p-1 rounded-full shadow-m3-1 border border-m3-outline">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-full transition-all ${
                viewMode === 'monthly'
                  ? 'bg-m3-primary text-m3-on-primary shadow-sm'
                  : 'text-emerald-900 hover:bg-m3-surface-highest'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-full transition-all ${
                viewMode === 'yearly'
                  ? 'bg-m3-primary text-m3-on-primary shadow-sm'
                  : 'text-emerald-900 hover:bg-m3-surface-highest'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Date Selector Breadcrumb */}
        <div className="text-xs text-emerald-800/80 font-semibold uppercase tracking-widest mt-2 flex items-center gap-1.5">
          <span>Personal Finance Ledger —</span>
          {viewMode === 'monthly' ? (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-emerald-950 font-extrabold uppercase tracking-widest outline-none cursor-pointer appearance-none hover:text-emerald-700 transition-colors"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="text-stone-800">
                  {format(parseISO(`${m}-01`), 'MMM yyyy')}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-emerald-950 font-extrabold uppercase tracking-widest outline-none cursor-pointer appearance-none hover:text-emerald-700 transition-colors"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="text-stone-800">
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-11 h-11 rounded-full bg-m3-surface-high hover:bg-m3-surface-highest flex items-center justify-center transition-all text-emerald-900 shadow-sm hover:scale-105 active:scale-95"
          title="Manage Categories & Settings"
          aria-label="Settings"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        {/* User Account / Profile Button */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="w-11 h-11 rounded-full bg-m3-primary overflow-hidden border-2 border-m3-tertiary flex items-center justify-center shadow-m3-2 hover:scale-105 active:scale-95 transition-all"
            title={`${user.displayName || user.email} (Manage Account)`}
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xs uppercase">
                {user.displayName ? user.displayName.slice(0, 2) : 'ME'}
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-m3-primary text-m3-on-primary px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-m3-1 hover:bg-m3-secondary hover:shadow-m3-2 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4 text-m3-tertiary" />
            <span>{isConfigured ? 'Sign In' : 'Account / Demo'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
