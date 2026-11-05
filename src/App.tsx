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
import { SubscriptionsView } from './components/SubscriptionsView.tsx';
import { SubscriptionModal } from './components/SubscriptionModal.tsx';

import {
  type Transaction,
  type Subscription,
  type UserSettings,
  type AiInsight,
  type AiForecast,
} from './types/index.ts';

import {
  getLocalTransactions,
  saveLocalTransactions,
  getLocalSubscriptions,
  saveLocalSubscriptions,
  getLocalSettings,
  saveLocalSettings,
  subscribeToUserTransactions,
  subscribeToUserSettings,
  subscribeToUserSubscriptions,
  addTransactionToFirestore,
  updateTransactionInFirestore,
  deleteTransactionFromFirestore,
  addSubscriptionToFirestore,
  updateSubscriptionInFirestore,
  deleteSubscriptionFromFirestore,
  updateUserSettingsInFirestore,
} from './services/storageService.ts';

import {
  generateLocalInsights,
  generateLocalForecast,
  fetchGeminiInsights,
} from './services/aiService.ts';

export const App: React.FC = () => {
  const { user } = useAuth();

  // Navigation state
  const [activeSection, setActiveSection] = useState<'ledger' | 'subscriptions'>('ledger');

  // Primary data state
  const [transactions, setTransactions] = useState<Transaction[]>(() => getLocalTransactions());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => getLocalSubscriptions());
  const [settings, setSettings] = useState<UserSettings>(() => getLocalSettings());

  // View state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().substring(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI intelligence state
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [forecast, setForecast] = useState<AiForecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Helper for toast notifications
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Subscribe to Cloud Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;

    const unsubTx = subscribeToUserTransactions(user.uid, (cloudTxs) => {
      setTransactions(cloudTxs);
    });
    const unsubSettings = subscribeToUserSettings(user.uid, (cloudSettings) => {
      setSettings(cloudSettings);
    });
    const unsubSubs = subscribeToUserSubscriptions(user.uid, (cloudSubs) => {
      setSubscriptions(cloudSubs);
    });

    return () => {
      unsubTx();
      unsubSettings();
      unsubSubs();
    };
  }, [user]);

  // 2. Persist to LocalStorage when in Guest / Offline mode
  useEffect(() => {
    if (!user) {
      saveLocalTransactions(transactions);
      saveLocalSettings(settings);
      saveLocalSubscriptions(subscriptions);
    }
  }, [user, transactions, settings, subscriptions]);

  // Handle add or update transaction
  const handleSaveTransaction = async (tx: Transaction) => {
    // Optimistic UI update
    setTransactions((prev) => {
      const index = prev.findIndex((t) => t.id === tx.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = tx;
        return copy;
      }
      return [tx, ...prev];
    });

    if (user) {
      if (editingTransaction) {
        await updateTransactionInFirestore(user.uid, tx);
      } else {
        await addTransactionToFirestore(user.uid, tx);
      }
    }

    if (viewMode === 'monthly') {
      setSelectedMonth(tx.date.substring(0, 7));
    } else {
      setSelectedYear(tx.date.substring(0, 4));
    }
    setEditingTransaction(null);
    showToast(editingTransaction ? 'Entry updated successfully' : 'New entry recorded');
  };

  // Handle delete transaction (Instant optimistic deletion)
  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      try {
        await deleteTransactionFromFirestore(user.uid, id);
      } catch (err) {
        console.error('Failed to delete transaction from Firestore:', err);
      }
    }
    showToast('Transaction removed');
  };

  // Handle add or update subscription
  const handleSaveSubscription = async (sub: Subscription) => {
    setSubscriptions((prev) => {
      const index = prev.findIndex((s) => s.id === sub.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = sub;
        return copy;
      }
      return [sub, ...prev];
    });

    if (user) {
      if (editingSub) {
        await updateSubscriptionInFirestore(user.uid, sub);
      } else {
        await addSubscriptionToFirestore(user.uid, sub);
      }
    }

    setEditingSub(null);
    showToast(editingSub ? 'Subscription updated' : 'Subscription added');
  };

  // Handle delete subscription
  const handleDeleteSubscription = async (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    if (user) {
      try {
        await deleteSubscriptionFromFirestore(user.uid, id);
      } catch (err) {
        console.error('Failed to delete subscription from Firestore:', err);
      }
    }
    showToast('Subscription deleted');
  };

  // Handle toggle subscription active state
  const handleToggleSubActive = async (sub: Subscription) => {
    const updated = { ...sub, isActive: !sub.isActive };
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? updated : s)));
    if (user) {
      await updateSubscriptionInFirestore(user.uid, updated);
    }
  };

  // Quick action: Log subscription renewal to ledger
  const handleLogSubToLedger = async (sub: Subscription) => {
    const today = new Date();
    const newTx: Transaction = {
      id: `tx-sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${sub.name} (Subscription)`,
      amount: sub.amount,
      type: 'expense',
      category: sub.category,
      paymentMethod: sub.paymentMethod || 'Credit Card',
      spendType: 'normal',
      vibe: sub.vibe,
      date: today.toISOString(),
    };

    await handleSaveTransaction(newTx);
    showToast(`Logged "${sub.name}" ($${sub.amount.toFixed(2)}) to this month's ledger!`);
  };

  // Open edit modal
  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleEditSubscription = (sub: Subscription) => {
    setEditingSub(sub);
    setIsSubModalOpen(true);
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
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-m3-primary text-m3-on-primary px-5 py-2.5 rounded-full shadow-m3-4 text-xs font-bold tracking-wide animate-in fade-in slide-in-from-top-2 flex items-center gap-2 border border-m3-tertiary/30">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Navigation & Header */}
        <Header
          activeSection={activeSection}
          setActiveSection={(sec) => {
            setActiveSection(sec);
            setSelectedCategory(null);
          }}
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

        {/* SECTION 1: CORE LEDGER VIEW */}
        {activeSection === 'ledger' && (
          <>
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
          </>
        )}

        {/* SECTION 2: SUBSCRIPTIONS & RECURRING BILLS VIEW */}
        {activeSection === 'subscriptions' && (
          <SubscriptionsView
            subscriptions={subscriptions}
            onAddSub={() => {
              setEditingSub(null);
              setIsSubModalOpen(true);
            }}
            onEditSub={handleEditSubscription}
            onDeleteSub={handleDeleteSubscription}
            onToggleActive={handleToggleSubActive}
            onLogToLedger={handleLogSubToLedger}
          />
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        existingTransaction={editingTransaction}
        expenseCategories={settings.expenseCategories}
        incomeCategories={settings.incomeCategories}
        allTransactions={transactions}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => {
          setIsSubModalOpen(false);
          setEditingSub(null);
        }}
        onSave={handleSaveSubscription}
        onDelete={handleDeleteSubscription}
        existingSub={editingSub}
        expenseCategories={settings.expenseCategories}
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

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          if (activeSection === 'subscriptions') {
            setEditingSub(null);
            setIsSubModalOpen(true);
          } else {
            setEditingTransaction(null);
            setIsTxModalOpen(true);
          }
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-m3-primary text-m3-on-primary rounded-full shadow-m3-4 hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 border-2 border-m3-tertiary/40 group hover:bg-m3-secondary"
        aria-label={activeSection === 'subscriptions' ? 'New Subscription' : 'New Transaction'}
        title={activeSection === 'subscriptions' ? 'Add Subscription' : 'Add Transaction'}
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300 text-m3-tertiary" />
      </button>
    </div>
  );
};
