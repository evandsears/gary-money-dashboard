import React, { useMemo } from 'react';
import { 
  Repeat, 
  Calendar, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Edit3,
  Trash2
} from 'lucide-react';
import { type Subscription, type Transaction, VIBE_OPTIONS } from '../types/index.ts';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  onAddSub: () => void;
  onEditSub: (sub: Subscription) => void;
  onDeleteSub: (id: string) => void;
  onToggleActive: (sub: Subscription) => void;
  onLogToLedger: (sub: Subscription) => void;
}

interface UpcomingRenewal {
  sub: Subscription;
  daysUntil: number;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  onAddSub,
  onEditSub,
  onDeleteSub,
  onToggleActive,
  onLogToLedger,
}) => {
  // Calculations
  const { monthlyTotal, yearlyTotal, activeCount, lowVibeTotal, nextUpcoming } = useMemo(() => {
    let monthly = 0;
    let active = 0;
    let lowVibe = 0;

    const today = new Date();
    const currentDay = today.getDate();
    let closestDaysDiff = 999;
    let upcomingSub: UpcomingRenewal | null = null;

    subscriptions.forEach((s) => {
      if (!s.isActive) return;
      active++;

      let normalizedMonthly = s.amount;
      if (s.billingCycle === 'yearly') normalizedMonthly = s.amount / 12;
      else if (s.billingCycle === 'weekly') normalizedMonthly = s.amount * 4.333;
      else if (s.billingCycle === 'quarterly') normalizedMonthly = s.amount / 3;

      monthly += normalizedMonthly;

      if (s.vibe <= 2) {
        lowVibe += normalizedMonthly;
      }

      // Renewal countdown calculation
      let daysUntil = s.renewalDay - currentDay;
      if (daysUntil < 0) {
        // Renews next month
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        daysUntil += daysInMonth;
      }

      if (daysUntil < closestDaysDiff) {
        closestDaysDiff = daysUntil;
        upcomingSub = { sub: s, daysUntil };
      }
    });

    return {
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
      activeCount: active,
      lowVibeTotal: lowVibe,
      nextUpcoming: upcomingSub as UpcomingRenewal | null,
    };
  }, [subscriptions]);

  const getVibeEmoji = (vibe: number) => {
    return VIBE_OPTIONS.find((v) => v.score === vibe)?.emoji || '😐';
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full">
        {/* Monthly Cost */}
        <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-5 shadow-m3-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Monthly Subscriptions
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-extrabold text-emerald-950 font-display">
              ${monthlyTotal.toFixed(2)}
            </span>
            <span className="text-xs text-stone-500 font-semibold">/ month</span>
          </div>
        </div>

        {/* Annualized Cost */}
        <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-5 shadow-m3-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Annual Run-Rate
            </span>
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-extrabold text-stone-900 font-display">
              ${yearlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-stone-500 font-semibold">/ year</span>
          </div>
        </div>

        {/* Active Subscriptions Count */}
        <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-5 shadow-m3-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Active Recurring Services
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-stone-900 font-display">
              {activeCount}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              of {subscriptions.length} tracked
            </span>
          </div>
        </div>

        {/* Next Due Bill */}
        <div className="bg-m3-tertiary border border-m3-tertiary-hover rounded-m3-xl p-5 shadow-m3-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-m3-primary/75 uppercase tracking-wider">
              Next Due Renewal
            </span>
            <div className="w-8 h-8 rounded-full bg-m3-primary/10 flex items-center justify-center text-m3-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            {nextUpcoming ? (
              <div>
                <p className="font-extrabold text-m3-primary text-lg truncate">
                  {nextUpcoming.sub.name}
                </p>
                <p className="text-xs font-bold text-m3-primary/80 mt-0.5">
                  ${nextUpcoming.sub.amount.toFixed(2)} — {nextUpcoming.daysUntil === 0 ? 'Due Today!' : `Renews in ${nextUpcoming.daysUntil} days`}
                </p>
              </div>
            ) : (
              <p className="text-xs font-bold text-m3-primary/70">No upcoming renewals</p>
            )}
          </div>
        </div>
      </div>

      {/* Low Vibe Alert Banner */}
      {lowVibeTotal > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-amber-950 text-sm">
              Gary's Vampire Subscription Alert
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed mt-0.5">
              You are spending <strong>${lowVibeTotal.toFixed(2)}/month</strong> (${(lowVibeTotal * 12).toFixed(2)}/year) on subscriptions rated with low satisfaction (🤬 or 😕). Consider cancelling or pausing them to instantly reclaim this cash!
            </p>
          </div>
        </div>
      )}

      {/* Subscriptions List Card */}
      <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 shadow-m3-1 flex flex-col">
        {/* Table Header */}
        <div className="flex justify-between items-center mb-5 shrink-0 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-stone-800 font-display">
              Recurring Bills & Subscriptions
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Track renewals, audit satisfaction vibes, and log recurring charges to your ledger in 1-click
            </p>
          </div>
          <button
            onClick={onAddSub}
            className="flex items-center gap-2 bg-m3-primary text-m3-on-primary px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-m3-1 hover:bg-m3-secondary transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-m3-tertiary" />
            <span>Add Subscription</span>
          </button>
        </div>

        {/* Content */}
        {subscriptions.length === 0 ? (
          <div className="py-14 text-center text-stone-400 font-medium flex flex-col items-center gap-3">
            <Repeat className="w-10 h-10 text-stone-300" />
            <p className="font-bold text-sm text-stone-500">No subscriptions or recurring bills added yet</p>
            <button
              onClick={onAddSub}
              className="text-xs font-bold text-emerald-800 underline underline-offset-4 hover:text-emerald-950"
            >
              Add your first recurring subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => {
              const cycleLabel = sub.billingCycle === 'monthly' ? '/mo' : `/${sub.billingCycle.slice(0, 2)}`;

              return (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-m3-2 ${
                    sub.isActive ? 'border-m3-outline' : 'border-stone-200 opacity-60 bg-stone-50/70'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                          {sub.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-m3-surface text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-m3-outline uppercase tracking-wider">
                            {sub.category}
                          </span>
                          <span className="text-base select-none" title={`Vibe Score: ${sub.vibe}/5`}>
                            {getVibeEmoji(sub.vibe)}
                          </span>
                        </div>
                      </div>

                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => onToggleActive(sub)}
                        className={`w-9 h-5 rounded-full relative transition-colors ${
                          sub.isActive ? 'bg-m3-primary' : 'bg-stone-300'
                        }`}
                        title={sub.isActive ? 'Active (Click to pause)' : 'Paused (Click to activate)'}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                            sub.isActive ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Cost and renewal info */}
                    <div className="mt-4 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-stone-900 font-mono">
                          ${sub.amount.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-stone-500 uppercase">{cycleLabel}</span>
                      </div>
                      <span className="text-xs font-bold text-stone-500">
                        Day {sub.renewalDay} of mo
                      </span>
                    </div>

                    {sub.notes && (
                      <p className="text-[11px] text-stone-500 italic mt-2 line-clamp-1">
                        "{sub.notes}"
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => onLogToLedger(sub)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
                      title="Add a transaction entry to this month's ledger"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Log to Ledger</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditSub(sub)}
                        className="p-1.5 text-stone-400 hover:text-emerald-800 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Edit Subscription"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSub(sub.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
