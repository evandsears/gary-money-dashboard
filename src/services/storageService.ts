import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase.ts';
import { 
  type Transaction, 
  type UserSettings, 
  type Subscription,
  DEFAULT_EXPENSE_CATEGORIES, 
  DEFAULT_INCOME_CATEGORIES 
} from '../types/index.ts';

const LOCAL_TX_KEY = 'budget-transactions';
const LOCAL_SUBS_KEY = 'gary-subscriptions';
const LOCAL_EXPENSE_CAT_KEY = 'gary-expense-categories';
const LOCAL_INCOME_CAT_KEY = 'gary-income-categories';
const LOCAL_BUDGET_KEY = 'gary-budget';

const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix 4K Premium',
    amount: 22.99,
    billingCycle: 'monthly',
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    renewalDay: 15,
    vibe: 4,
    isActive: true,
    notes: 'Family sharing'
  },
  {
    id: 'sub-2',
    name: 'Spotify Premium Individual',
    amount: 11.99,
    billingCycle: 'monthly',
    category: 'Entertainment',
    paymentMethod: 'Debit Card',
    renewalDay: 8,
    vibe: 5,
    isActive: true
  },
  {
    id: 'sub-3',
    name: 'Gym & Fitness Center',
    amount: 49.00,
    billingCycle: 'monthly',
    category: 'Healthcare',
    paymentMethod: 'Bank Transfer',
    renewalDay: 1,
    vibe: 4,
    isActive: true
  },
  {
    id: 'sub-4',
    name: 'iCloud+ 2TB Storage',
    amount: 9.99,
    billingCycle: 'monthly',
    category: 'Utilities',
    paymentMethod: 'Credit Card',
    renewalDay: 22,
    vibe: 5,
    isActive: true
  }
];

// Sample starting transactions for first-time onboarding
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'sample-1',
    name: 'Bi-Weekly Paycheck',
    amount: 3200,
    type: 'income',
    category: 'Salary',
    paymentMethod: 'Bank Transfer',
    spendType: 'normal',
    vibe: 5,
    date: new Date().toISOString()
  },
  {
    id: 'sample-2',
    name: 'Apartment Rent',
    amount: 1450,
    type: 'expense',
    category: 'Housing',
    paymentMethod: 'Bank Transfer',
    spendType: 'normal',
    vibe: 3,
    date: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'sample-3',
    name: 'Trader Joe\'s Grocery Run',
    amount: 142.60,
    type: 'expense',
    category: 'Food',
    paymentMethod: 'Credit Card',
    spendType: 'normal',
    vibe: 4,
    date: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'sample-4',
    name: 'Fancy Weekend Dinner & Drinks',
    amount: 195.40,
    type: 'expense',
    category: 'Food',
    paymentMethod: 'Credit Card',
    spendType: 'abnormal',
    vibe: 5,
    date: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'sample-5',
    name: 'Electric & Internet Utility',
    amount: 115.00,
    type: 'expense',
    category: 'Utilities',
    paymentMethod: 'Debit Card',
    spendType: 'normal',
    vibe: 2,
    date: new Date(Date.now() - 86400000 * 8).toISOString()
  }
];

export const getLocalTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(LOCAL_TX_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(SAMPLE_TRANSACTIONS));
      return SAMPLE_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_TRANSACTIONS;
  }
};

export const saveLocalTransactions = (txs: Transaction[]) => {
  localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(txs));
};

export const getLocalSubscriptions = (): Subscription[] => {
  try {
    const raw = localStorage.getItem(LOCAL_SUBS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_SUBS_KEY, JSON.stringify(SAMPLE_SUBSCRIPTIONS));
      return SAMPLE_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_SUBSCRIPTIONS;
  }
};

export const saveLocalSubscriptions = (subs: Subscription[]) => {
  localStorage.setItem(LOCAL_SUBS_KEY, JSON.stringify(subs));
};

export const getLocalSettings = (): UserSettings => {
  try {
    const exp = localStorage.getItem(LOCAL_EXPENSE_CAT_KEY);
    const inc = localStorage.getItem(LOCAL_INCOME_CAT_KEY);
    const bgt = localStorage.getItem(LOCAL_BUDGET_KEY);

    return {
      expenseCategories: exp ? JSON.parse(exp).sort((a: string, b: string) => a.localeCompare(b)) : [...DEFAULT_EXPENSE_CATEGORIES].sort(),
      incomeCategories: inc ? JSON.parse(inc).sort((a: string, b: string) => a.localeCompare(b)) : [...DEFAULT_INCOME_CATEGORIES].sort(),
      targetBudget: bgt ? Number(bgt) : 2500,
    };
  } catch {
    return {
      expenseCategories: [...DEFAULT_EXPENSE_CATEGORIES].sort(),
      incomeCategories: [...DEFAULT_INCOME_CATEGORIES].sort(),
      targetBudget: 2500,
    };
  }
};

export const saveLocalSettings = (settings: UserSettings) => {
  localStorage.setItem(LOCAL_EXPENSE_CAT_KEY, JSON.stringify(settings.expenseCategories));
  localStorage.setItem(LOCAL_INCOME_CAT_KEY, JSON.stringify(settings.incomeCategories));
  localStorage.setItem(LOCAL_BUDGET_KEY, settings.targetBudget.toString());
};

// Cloud Firestore Subscriptions & Operations
export const subscribeToUserTransactions = (
  userId: string,
  onUpdate: (txs: Transaction[]) => void
) => {
  if (!db) return () => {};
  const txRef = collection(db, 'users', userId, 'transactions');
  const q = query(txRef, orderBy('date', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
    });
    onUpdate(items);
  }, (err) => {
    console.error('Firestore transactions subscribe error:', err);
  });
};

export const subscribeToUserSettings = (
  userId: string,
  onUpdate: (settings: UserSettings) => void
) => {
  if (!db) return () => {};
  const settingsDocRef = doc(db, 'users', userId, 'settings', 'general');

  return onSnapshot(settingsDocRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as UserSettings);
    } else {
      // Initialize Firestore document from defaults
      const defaults = getLocalSettings();
      setDoc(settingsDocRef, defaults).catch(console.error);
      onUpdate(defaults);
    }
  }, (err) => {
    console.error('Firestore settings subscribe error:', err);
  });
};

export const addTransactionToFirestore = async (userId: string, tx: Transaction) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'transactions', tx.id);
  await setDoc(docRef, { ...tx, updatedAt: new Date().toISOString() });
};

export const updateTransactionInFirestore = async (userId: string, tx: Transaction) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'transactions', tx.id);
  await updateDoc(docRef, { ...tx, updatedAt: new Date().toISOString() });
};

export const deleteTransactionFromFirestore = async (userId: string, txId: string) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'transactions', txId);
  await deleteDoc(docRef);
};

export const subscribeToUserSubscriptions = (
  userId: string,
  onUpdate: (subs: Subscription[]) => void
) => {
  if (!db) return () => {};
  const subsRef = collection(db, 'users', userId, 'subscriptions');
  const q = query(subsRef, orderBy('amount', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items: Subscription[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Subscription);
    });
    onUpdate(items);
  }, (err) => {
    console.error('Firestore subscriptions subscribe error:', err);
  });
};

export const addSubscriptionToFirestore = async (userId: string, sub: Subscription) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'subscriptions', sub.id);
  await setDoc(docRef, { ...sub, updatedAt: new Date().toISOString() });
};

export const updateSubscriptionInFirestore = async (userId: string, sub: Subscription) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'subscriptions', sub.id);
  await updateDoc(docRef, { ...sub, updatedAt: new Date().toISOString() });
};

export const deleteSubscriptionFromFirestore = async (userId: string, subId: string) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'subscriptions', subId);
  await deleteDoc(docRef);
};

export const updateUserSettingsInFirestore = async (userId: string, settings: UserSettings) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'settings', 'general');
  await setDoc(docRef, settings, { merge: true });
};

// Batch import local data to user's Firestore cloud account
export const syncLocalDataToFirestore = async (userId: string, txs: Transaction[], settings: UserSettings) => {
  if (!db || txs.length === 0) return;
  const batch = writeBatch(db);

  // Settings
  const settingsRef = doc(db, 'users', userId, 'settings', 'general');
  batch.set(settingsRef, settings, { merge: true });

  // Transactions
  for (const t of txs) {
    const tRef = doc(db, 'users', userId, 'transactions', t.id);
    batch.set(tRef, { ...t, syncedAt: new Date().toISOString() }, { merge: true });
  }

  await batch.commit();
};

// Export to CSV
export const exportTransactionsToCsv = (txs: Transaction[]) => {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Spend Type', 'Vibe Score'];
  const rows = txs.map(t => [
    t.id,
    t.date,
    t.type,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.name.replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${t.paymentMethod}"`,
    t.spendType,
    t.vibe
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `gary_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
