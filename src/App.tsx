import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { MetricCards } from './components/MetricCards.tsx';
import { SpendingChart } from './components/SpendingChart.tsx';
import { ForecastWidget } from './components/ForecastWidget.tsx';
import { TransactionTable } from './components/TransactionTable.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { CategoryManagerModal } from './components/CategoryManagerModal.tsx';
import { UserProfileModal } from './components/UserProfileModal.tsx';

import {
  type Transaction,
  type UserSettings,
  type AiInsight,
  type AiForecast,
} from './types/index.ts';

import {
  getLocalTransactions,
  saveLocalTransactions,
  getLocalSettings,
  saveLocalSettings,
  subscribeToUserTransactions,
  subscribeToUserSettings,
  addTransactionToFirestore,
  updateTransactionInFirestore,
  deleteTransactionFromFirestore,
  updateUserSettingsInFirestore,
} from './services/storageService.ts';

import {
  generateLocalInsights,
  generateLocalForecast,
  fetchGeminiInsights,
} from './services/aiService.ts';

export const App: React.FC = () => {
  const { user } = useAuth();

  // Primary data state
  const [transactions, setTransactions] = useState<Transaction[]>(() => getLocalTransactions());
  const [settings, setSettings] = useState<UserSettings>(() => getLocalSettings());

  // View state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().substring(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // AI intelligence state
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [forecast, setForecast] = useState<AiForecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Sync with Firestore if authenticated; otherwise save to localStorage
  useEffect(() => {
    if (user) {
      const unsubTx = subscribeToUserTransactions(user.uid, (cloudTxs) => {
        setTransactions(cloudTxs);
      });
      const unsubSettings = subscribeToUserSettings(user.uid, (cloudSettings) => {
        setSettings(cloudSettings);
      });
      return () => {
        unsubTx();
        unsubSettings();
      };
    } else {
      // Local storage persistence
      saveLocalTransactions(transactions);
      saveLocalSettings(settings);
    }
  }, [user, transactions, settings]);

  // Handle add or update transaction
  const handleSaveTransaction = async (tx: Transaction) => {
    if (user) {
      if (editingTransaction) {
        await updateTransactionInFirestore(user.uid, tx);
      } else {
        await addTransactionToFirestore(user.uid, tx);
      }
    } else {
      setTransactions((prev) => {
        const index = prev.findIndex((t) => t.id === tx.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = tx;
          return copy;
        }
        return [tx, ...prev];
      });
    }

    // Adjust month or year selector so the user immediately sees their entry
    if (viewMode === 'monthly') {
      setSelectedMonth(tx.date.substring(0, 7));
    } else {
      setSelectedYear(tx.date.substring(0, 4));
    }
    setEditingTransaction(null);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      await deleteTransactionFromFirestore(user.uid, id);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Open edit modal
  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  // Category & Budget updates
  const handleSetExpenseCategories = async (cats: string[]) => {
    const updated = { ...settings, expenseCategories: cats };
    setSettings(updated);
    if (user) await updateUserSettingsInFirestore(user.uid, updated);
  };

  const handleSetIncomeCategories = async (cats: string[]) => {
    const updated = { ...settings, incomeCategories: cats };
    setSettings(updated);
    if (user) await updateUserSettingsInFirestore(user.uid, updated);
  };

  const handleUpdateBudget = async (budget: number) => {
    const updated = { ...settings, targetBudget: budget };
    setSettings(updated);
    if (user) await updateUserSettingsInFirestore(user.uid, updated);
  };

  // Distinct Months and Years for dropdowns
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(new Date().toISOString().substring(0, 7));
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) set.add(t.date.substring(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    set.add(new Date().getFullYear().toString());
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 4) set.add(t.date.substring(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filter transactions by period
  const periodTransactions = useMemo(() => {
    return viewMode === 'monthly'
      ? transactions.filter((t) => t.date.startsWith(selectedMonth))
      : transactions.filter((t) => t.date.startsWith(selectedYear));
  }, [transactions, viewMode, selectedMonth, selectedYear]);

  // Available categories in the current period
  const availableCategoriesInPeriod = useMemo(() => {
    return Array.from(new Set(periodTransactions.map((t) => t.category))).sort();
  }, [periodTransactions]);

  // Filter by category if one is active
  const displayedTransactions = useMemo(() => {
    return selectedCategory
      ? periodTransactions.filter((t) => t.category === selectedCategory)
      : periodTransactions;
  }, [periodTransactions, selectedCategory]);

  // Aggregate totals
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    periodTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { totalIncome: income, totalExpense: expense };
  }, [periodTransactions]);

  // AI Insights & Forecast calculation (debounced)
  useEffect(() => {
    setLoadingInsight(true);
    setLoadingForecast(true);

    const timer = setTimeout(async () => {
      try {
        const newInsight = await fetchGeminiInsights(periodTransactions);
        setInsight(newInsight);
      } catch {
        setInsight(generateLocalInsights(periodTransactions));
      } finally {
        setLoadingInsight(false);
      }

      setForecast(generateLocalForecast(periodTransactions, settings.targetBudget));
      setLoadingForecast(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [periodTransactions, settings.targetBudget]);

  return (
    <div className="min-h-screen bg-m3-surface text-stone-900 font-sans p-3 md:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Navigation & Header */}
        <Header
          viewMode={viewMode}
          setViewMode={(mode) => {
            setViewMode(mode);
            setSelectedCategory(null);
          }}
          selectedMonth={selectedMonth}
          setSelectedMonth={(m) => {
            setSelectedMonth(m);
            setSelectedCategory(null);
          }}
          selectedYear={selectedYear}
          setSelectedYear={(y) => {
            setSelectedYear(y);
            setSelectedCategory(null);
          }}
          availableMonths={availableMonths}
          availableYears={availableYears}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Financial KPI Summary Cards */}
        <MetricCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          periodLabel={viewMode === 'monthly' ? 'Monthly' : 'Yearly'}
        />

        {/* Charts & AI Intelligence Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <div className="lg:col-span-2">
            <SpendingChart
              transactions={periodTransactions}
              onCategoryClick={(cat) =>
                setSelectedCategory((prev) => (prev === cat ? null : cat))
              }
              selectedCategory={selectedCategory}
              insight={insight}
              loadingInsight={loadingInsight}
            />
          </div>

          <div className="lg:col-span-1">
            <ForecastWidget
              transactions={periodTransactions}
              targetBudget={settings.targetBudget}
              onUpdateBudget={handleUpdateBudget}
              forecast={forecast}
              loadingForecast={loadingForecast}
            />
          </div>
        </div>

        {/* Transaction Table */}
        <TransactionTable
          transactions={displayedTransactions}
          onDelete={handleDeleteTransaction}
          onEdit={handleEditTransaction}
          selectedCategory={selectedCategory}
          onClearFilter={() => setSelectedCategory(null)}
          availableCategories={availableCategoriesInPeriod}
          onCategorySelect={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        existingTransaction={editingTransaction}
        expenseCategories={settings.expenseCategories}
        incomeCategories={settings.incomeCategories}
        allTransactions={transactions}
      />

      <CategoryManagerModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        expenseCategories={settings.expenseCategories}
        incomeCategories={settings.incomeCategories}
        setExpenseCategories={handleSetExpenseCategories}
        setIncomeCategories={handleSetIncomeCategories}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        transactions={transactions}
        settings={settings}
      />

      {/* Material 3 Floating Action Button (FAB) */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setIsTxModalOpen(true);
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-m3-primary text-m3-on-primary rounded-full shadow-m3-4 hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 border-2 border-m3-tertiary/40 group hover:bg-m3-secondary"
        aria-label="New Transaction"
        title="Add Transaction"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300 text-m3-tertiary" />
      </button>
    </div>
  );
};
