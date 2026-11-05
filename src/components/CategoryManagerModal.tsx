import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { type TransactionType } from '../types/index.ts';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseCategories: string[];
  incomeCategories: string[];
  setExpenseCategories: (cats: string[]) => void;
  setIncomeCategories: (cats: string[]) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  expenseCategories,
  incomeCategories,
  setExpenseCategories,
  setIncomeCategories,
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen) return null;

  const currentList = activeTab === 'expense' ? expenseCategories : incomeCategories;
  const updateList = activeTab === 'expense' ? setExpenseCategories : setIncomeCategories;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed || currentList.includes(trimmed)) return;

    const updated = [...currentList, trimmed].sort((a, b) => a.localeCompare(b));
    updateList(updated);
    setNewCategoryName('');
  };

  const handleRenameCategory = (index: number, newName: string) => {
    const updated = [...currentList];
    updated[index] = newName;
    updateList(updated);
  };

  const handleDeleteCategory = (index: number) => {
    if (currentList.length <= 1) {
      alert('You must have at least one category.');
      return;
    }
    const updated = [...currentList];
    updated.splice(index, 1);
    updateList(updated);
  };

  return (
    <div className="fixed inset-0 bg-[#131F19]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div 
        className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 shadow-m3-4 w-full max-w-md flex flex-col gap-4 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-800" />
            <h3 className="text-xl font-black text-stone-800 font-display">
              Manage Categories
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-m3-surface-high p-1 rounded-full border border-m3-outline shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider transition-all ${
              activeTab === 'expense'
                ? 'bg-m3-primary shadow-sm text-white'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Expenses ({expenseCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider transition-all ${
              activeTab === 'income'
                ? 'bg-m3-primary shadow-sm text-white'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Income ({incomeCategories.length})
          </button>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category Name..."
            className="flex-1 bg-m3-surface border border-m3-outline rounded-2xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-m3-tertiary"
          />
          <button
            type="submit"
            disabled={!newCategoryName.trim()}
            className="bg-m3-tertiary text-m3-primary p-2.5 rounded-2xl hover:bg-m3-tertiary-hover transition-colors flex items-center justify-center min-w-[48px] disabled:opacity-50 font-bold"
            title="Add Category"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[350px] bg-m3-surface rounded-2xl border border-m3-outline divide-y divide-m3-outline">
          {currentList.map((cat, idx) => (
            <div
              key={`${cat}-${idx}`}
              className="flex items-center justify-between p-3 bg-transparent hover:bg-white/60 group transition-colors"
            >
              <input
                type="text"
                value={cat}
                onChange={(e) => handleRenameCategory(idx, e.target.value)}
                className="font-semibold text-sm text-stone-800 bg-transparent border-none outline-none focus:ring-1 focus:ring-m3-tertiary rounded px-2 flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => handleDeleteCategory(idx)}
                className="text-stone-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-rose-50"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
