import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Trash2, Zap } from 'lucide-react';
import { 
  type Subscription, 
  type BillingCycle, 
  type VibeScore,
  DEFAULT_PAYMENT_METHODS, 
  VIBE_OPTIONS 
} from '../types/index.ts';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Subscription) => void;
  onDelete?: (id: string) => void;
  existingSub?: Subscription | null;
  expenseCategories: string[];
}

interface Preset {
  name: string;
  amount: number;
  category: string;
  cycle: BillingCycle;
}

const PRESETS: Preset[] = [
  { name: 'Netflix', amount: 22.99, category: 'Entertainment', cycle: 'monthly' },
  { name: 'Spotify', amount: 11.99, category: 'Entertainment', cycle: 'monthly' },
  { name: 'Apple One / iCloud', amount: 9.99, category: 'Utilities', cycle: 'monthly' },
  { name: 'YouTube Premium', amount: 13.99, category: 'Entertainment', cycle: 'monthly' },
  { name: 'ChatGPT Plus', amount: 20.00, category: 'Personal', cycle: 'monthly' },
  { name: 'Amazon Prime', amount: 14.99, category: 'Entertainment', cycle: 'monthly' },
  { name: 'Gym Membership', amount: 45.00, category: 'Healthcare', cycle: 'monthly' },
  { name: 'Internet / WiFi', amount: 75.00, category: 'Utilities', cycle: 'monthly' },
  { name: 'Phone Bill', amount: 80.00, category: 'Utilities', cycle: 'monthly' },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingSub,
  expenseCategories,
}) => {
  const isEditing = Boolean(existingSub);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState(expenseCategories[0] || 'Entertainment');
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHODS[2] || 'Credit Card');
  const [renewalDay, setRenewalDay] = useState(1);
  const [vibe, setVibe] = useState<VibeScore>(4);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingSub) {
      setName(existingSub.name);
      setAmount(existingSub.amount.toString());
      setBillingCycle(existingSub.billingCycle || 'monthly');
      setCategory(existingSub.category || expenseCategories[0] || 'Entertainment');
      setPaymentMethod(existingSub.paymentMethod || 'Credit Card');
      setRenewalDay(existingSub.renewalDay || 1);
      setVibe(existingSub.vibe || 4);
      setIsActive(existingSub.isActive ?? true);
      setNotes(existingSub.notes || '');
    } else {
      setName('');
      setAmount('');
      setBillingCycle('monthly');
      setCategory(expenseCategories[0] || 'Entertainment');
      setPaymentMethod('Credit Card');
      setRenewalDay(1);
      setVibe(4);
      setIsActive(true);
      setNotes('');
    }
  }, [existingSub, isOpen, expenseCategories]);

  if (!isOpen) return null;

  const handleApplyPreset = (p: Preset) => {
    setName(p.name);
    setAmount(p.amount.toString());
    setBillingCycle(p.cycle);
    if (expenseCategories.includes(p.category)) {
      setCategory(p.category);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const subToSave: Subscription = {
      id: existingSub ? existingSub.id : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      amount: parsedAmount,
      billingCycle,
      category,
      paymentMethod,
      renewalDay: Math.min(31, Math.max(1, renewalDay)),
      vibe,
      isActive,
      notes: notes.trim() || undefined,
    };

    onSave(subToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#131F19]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div 
        className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 shadow-m3-4 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-m3-primary text-m3-on-primary rounded-full flex items-center justify-center text-sm font-black">
              {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </span>
            <h2 className="text-xl font-black text-emerald-950 font-display">
              {isEditing ? 'Edit Subscription' : 'New Subscription / Bill'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets (Only on Add) */}
        {!isEditing && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Quick Popular Presets</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 bg-m3-surface hover:bg-m3-surface-high border border-m3-outline rounded-full text-xs font-semibold text-stone-700 whitespace-nowrap transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Subscription Name */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
              Service / Bill Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary"
              placeholder="e.g. Netflix, Spotify, Gym"
              autoFocus
            />
          </div>

          {/* Amount & Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Cost ($)
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary appearance-none cursor-pointer"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Renewal Day & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Day of Month (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={renewalDay}
                onChange={(e) => setRenewalDay(Number(e.target.value))}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary appearance-none cursor-pointer"
              >
                {expenseCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between bg-m3-surface border border-m3-outline px-4 py-2.5 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Active Subscription
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                Include in recurring budget totals
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-7 rounded-full relative transition-colors border ${
                isActive ? 'bg-m3-primary border-m3-primary' : 'bg-stone-300 border-stone-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                  isActive ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Vibe Score */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
              Satisfaction / Value Vibe
            </label>
            <div className="flex justify-between bg-m3-surface border border-m3-outline p-2 rounded-2xl">
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setVibe(opt.score)}
                  title={`${opt.label} (${opt.score}/5)`}
                  className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    vibe === opt.score
                      ? 'bg-white scale-110 shadow-m3-1 ring-2 ring-m3-tertiary'
                      : 'opacity-50 hover:opacity-100 hover:bg-white/50'
                  }`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with roommate, cancel after free trial"
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {isEditing && onDelete && existingSub && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete subscription "${existingSub.name}"?`)) {
                    onDelete(existingSub.id);
                    onClose();
                  }
                }}
                className="px-4 py-3 rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 text-sm font-bold active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-m3-primary text-m3-on-primary font-bold py-3.5 rounded-full shadow-m3-2 active:scale-[0.98] transition-all tracking-wide text-sm font-display hover:bg-m3-secondary"
            >
              {isEditing ? 'Save Subscription' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
