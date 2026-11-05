import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { 
  type Transaction, 
  type TransactionType, 
  type SpendType, 
  type VibeScore,
  DEFAULT_PAYMENT_METHODS, 
  VIBE_OPTIONS 
} from '../types/index.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  existingTransaction?: Transaction | null;
  expenseCategories: string[];
  incomeCategories: string[];
  allTransactions: Transaction[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTransaction,
  expenseCategories,
  incomeCategories,
  allTransactions,
}) => {
  const isEditing = Boolean(existingTransaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHODS[0]);
  const [customMethod, setCustomMethod] = useState('');
  const [spendType, setSpendType] = useState<SpendType>('normal');
  const [vibe, setVibe] = useState<VibeScore>(3);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Sync state if editing an existing transaction
  useEffect(() => {
    if (existingTransaction) {
      setType(existingTransaction.type);
      setDescription(existingTransaction.name);
      setAmount(existingTransaction.amount.toString());
      setCategory(existingTransaction.category);
      if (DEFAULT_PAYMENT_METHODS.includes(existingTransaction.paymentMethod)) {
        setPaymentMethod(existingTransaction.paymentMethod);
        setCustomMethod('');
      } else {
        setPaymentMethod('Other');
        setCustomMethod(existingTransaction.paymentMethod || '');
      }
      setSpendType(existingTransaction.spendType || 'normal');
      setVibe(existingTransaction.vibe || 3);
      setDate(existingTransaction.date.split('T')[0]);
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory(expenseCategories[0] || 'Uncategorized');
      setPaymentMethod(DEFAULT_PAYMENT_METHODS[0]);
      setCustomMethod('');
      setSpendType('normal');
      setVibe(3);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [existingTransaction, isOpen, expenseCategories]);

  // Dynamic available categories
  const activeCategories = type === 'expense' ? expenseCategories : incomeCategories;

  // Ensure category is valid when switching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = newType === 'expense' ? expenseCategories : incomeCategories;
    if (!available.includes(category)) {
      setCategory(available[0] || 'Uncategorized');
    }
  };

  // Payment methods list including dynamic methods from transactions
  const availableMethods = useMemo(() => {
    const historicalMethods = allTransactions
      .map((t) => t.paymentMethod)
      .filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_PAYMENT_METHODS, ...historicalMethods]))
      .filter((m) => m !== 'Other')
      .sort((a, b) => a.localeCompare(b));
    return [...combined, 'Other'];
  }, [allTransactions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    let finalMethod = paymentMethod;
    if (paymentMethod === 'Other' && customMethod.trim()) {
      finalMethod = customMethod.trim();
    }

    const [year, month, day] = date.split('-');
    const localDate = new Date(Number(year), Number(month) - 1, Number(day), 12);

    const transactionToSave: Transaction = {
      id: existingTransaction ? existingTransaction.id : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: description.trim(),
      amount: parsedAmount,
      type,
      category: category || (activeCategories[0] || 'General'),
      paymentMethod: finalMethod,
      spendType,
      vibe,
      date: localDate.toISOString(),
    };

    onSave(transactionToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#131F19]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div 
        className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 shadow-m3-4 w-full max-w-md flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 bg-m3-primary text-m3-on-primary rounded-full flex items-center justify-center text-sm font-black">
              {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </span>
            <h2 className="text-xl font-black text-emerald-950 font-display">
              {isEditing ? 'Edit Entry' : 'New Entry'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Expense / Income Pill Switcher */}
            <div className="flex bg-m3-surface-high p-1 rounded-full border border-m3-outline">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`px-3 py-1 text-[11px] font-extrabold rounded-full uppercase tracking-wider transition-colors ${
                  type === 'expense'
                    ? 'bg-m3-primary shadow-sm text-white'
                    : 'text-emerald-900 hover:text-emerald-950'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`px-3 py-1 text-[11px] font-extrabold rounded-full uppercase tracking-wider transition-colors ${
                  type === 'income'
                    ? 'bg-m3-primary shadow-sm text-white'
                    : 'text-emerald-900 hover:text-emerald-950'
                }`}
              >
                Income
              </button>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
              Description
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all"
              placeholder={type === 'expense' ? 'e.g. Trader Joe\'s Groceries' : 'e.g. Freelance Consulting'}
              autoFocus
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Amount ($)
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all appearance-none cursor-pointer"
              >
                {activeCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all appearance-none cursor-pointer"
              >
                {availableMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Method if "Other" */}
          {paymentMethod === 'Other' && (
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
                Custom Method Name
              </label>
              <input
                type="text"
                required
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                placeholder="e.g. Apple Cash / Venmo"
                className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary transition-all"
              />
            </div>
          )}

          {/* Abnormal Spend Toggle (Expenses only) */}
          {type === 'expense' && (
            <div className="flex items-center justify-between bg-m3-surface border border-m3-outline px-4 py-3 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Abnormal / Unplanned Spend?
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Flags one-off emergencies or splurge events
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSpendType((prev) => (prev === 'normal' ? 'abnormal' : 'normal'))}
                className={`w-12 h-7 rounded-full relative transition-colors border ${
                  spendType === 'abnormal'
                    ? 'bg-m3-primary border-m3-primary'
                    : 'bg-stone-300 border-stone-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                    spendType === 'abnormal' ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Vibe Emoji Selector */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider ml-1 mb-1 block">
              Vibe / Sentiment Rating
            </label>
            <div className="flex justify-between bg-m3-surface border border-m3-outline p-2 rounded-2xl">
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setVibe(opt.score)}
                  title={`${opt.label} (${opt.score}/5)`}
                  className={`text-2xl w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    vibe === opt.score
                      ? 'bg-white scale-110 shadow-m3-1 opacity-100 ring-2 ring-m3-tertiary'
                      : 'opacity-50 hover:opacity-100 hover:bg-white/50'
                  }`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-m3-primary text-m3-on-primary font-bold py-3.5 rounded-full shadow-m3-2 active:scale-[0.98] transition-all tracking-wide text-sm mt-3 font-display hover:bg-m3-secondary"
          >
            {isEditing ? 'Save Changes' : 'Record Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};
