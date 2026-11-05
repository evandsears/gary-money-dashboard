import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Trash2, 
  Edit3, 
  Filter 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { type Transaction, VIBE_OPTIONS } from '../types/index.ts';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
  selectedCategory: string | null;
  onClearFilter: () => void;
  availableCategories: string[];
  onCategorySelect: (cat: string) => void;
}

type SortField = 'date' | 'amount' | 'name';
type SortOrder = 'asc' | 'desc';

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDelete,
  onEdit,
  selectedCategory,
  onClearFilter,
  availableCategories,
  onCategorySelect,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'date' ? 'desc' : 'asc');
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let result = 0;
      switch (sortField) {
        case 'date':
          result = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount': {
          const valA = a.type === 'income' ? a.amount : -a.amount;
          const valB = b.type === 'income' ? b.amount : -b.amount;
          result = valA - valB;
          break;
        }
        case 'name':
          result = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'asc' ? result : -result;
    });
  }, [transactions, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 inline text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 inline text-emerald-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 inline text-emerald-600" />
    );
  };

  const getVibeEmoji = (vibe: number) => {
    const found = VIBE_OPTIONS.find(v => v.score === vibe);
    return found ? found.emoji : '😐';
  };

  return (
    <div className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 shadow-m3-1 overflow-hidden flex flex-col w-full">
      {/* Table Header Controls */}
      <div className="flex justify-between items-center mb-4 min-h-[36px] shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-stone-800 font-display">
            Recent Activity
          </h2>
          <span className="text-xs bg-m3-surface-high text-emerald-950 font-bold px-2.5 py-0.5 rounded-full border border-m3-outline">
            {sortedTransactions.length} entries
          </span>
        </div>

        {/* Category Filter Dropdown */}
        {availableCategories.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex bg-m3-surface border border-m3-outline rounded-full py-1.5 px-3 items-center hover:bg-m3-surface-high transition-colors">
              <Filter className="w-3.5 h-3.5 text-stone-500 mr-1.5 hidden sm:inline" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mr-2 hidden sm:inline">
                Filter:
              </span>
              <select
                className="bg-transparent text-xs font-bold uppercase text-stone-800 outline-none cursor-pointer appearance-none max-w-[140px] sm:max-w-none"
                value={selectedCategory || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  val === '' ? onClearFilter() : onCategorySelect(val);
                }}
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <button
                onClick={onClearFilter}
                className="p-1.5 hover:bg-stone-200 rounded-full transition-colors flex items-center justify-center shrink-0 border border-transparent text-stone-500"
                title="Clear category filter"
                aria-label="Clear filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Content */}
      {sortedTransactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-sm font-bold uppercase py-14 gap-2">
          <span>No transactions recorded for this selection</span>
          <span className="text-xs text-stone-400 font-normal normal-case">
            Click the "+" button below to add your first transaction.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <th
                  className="pb-2 pl-3 cursor-pointer group hover:text-stone-600 transition-colors select-none"
                  onClick={() => handleSort('date')}
                >
                  Date {renderSortIcon('date')}
                </th>
                <th
                  className="pb-2 cursor-pointer group hover:text-stone-600 transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  Description {renderSortIcon('name')}
                </th>
                <th className="pb-2">Category</th>
                <th className="pb-2 hidden sm:table-cell">Method</th>
                <th className="pb-2 hidden sm:table-cell text-center">Vibe</th>
                <th className="pb-2 hidden sm:table-cell">Status</th>
                <th
                  className="pb-2 text-right pr-3 cursor-pointer group hover:text-stone-600 transition-colors select-none"
                  onClick={() => handleSort('amount')}
                >
                  Amount {renderSortIcon('amount')}
                </th>
                <th className="pb-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                let formattedDate = '—';
                try {
                  formattedDate = format(parseISO(tx.date), 'MMM dd, yyyy');
                } catch {
                  formattedDate = tx.date?.slice(0, 10) || '—';
                }

                return (
                  <tr
                    key={tx.id}
                    className="group bg-white shadow-sm hover:bg-[#F0F4DB]/70 transition-all rounded-2xl cursor-pointer"
                    onClick={() => onEdit(tx)}
                  >
                    {/* Date */}
                    <td className="py-3.5 px-3 text-xs text-stone-500 font-medium whitespace-nowrap rounded-l-2xl">
                      {formattedDate}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-2 font-bold text-stone-800 text-sm">
                      <div className="truncate max-w-[200px]">{tx.name}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-2">
                      <span className="inline-block bg-m3-surface text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-m3-outline">
                        {tx.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-2 hidden sm:table-cell text-xs text-stone-500 font-medium">
                      {tx.paymentMethod || '—'}
                    </td>

                    {/* Vibe Emoji */}
                    <td className="py-3.5 px-2 hidden sm:table-cell text-center text-lg select-none">
                      {getVibeEmoji(tx.vibe)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-2 hidden sm:table-cell">
                      {tx.spendType === 'abnormal' ? (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          Abnormal
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                          Normal
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 pr-3 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          isIncome
                            ? 'text-emerald-700 font-extrabold'
                            : 'text-stone-800'
                        }
                      >
                        {isIncome ? '+' : '-'}$
                        {tx.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-2 text-center rounded-r-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1 text-stone-400 hover:text-emerald-800 rounded-lg hover:bg-stone-100 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
