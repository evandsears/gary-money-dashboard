export type TransactionType = 'expense' | 'income';
export type SpendType = 'normal' | 'abnormal';
export type VibeScore = 1 | 2 | 3 | 4 | 5;
export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: string;
  paymentMethod: string;
  renewalDay: number; // day of month (1-31)
  nextRenewalDate?: string; // YYYY-MM-DD
  vibe: VibeScore;
  isActive: boolean;
  notes?: string;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: string;
  spendType: SpendType;
  vibe: VibeScore;
  date: string; // ISO string
  createdAt?: string;
}

export interface UserSettings {
  expenseCategories: string[];
  incomeCategories: string[];
  targetBudget: number;
}

export interface AiInsight {
  summary: string;
  suggestion: string;
}

export interface AiForecast {
  summary: string;
  overruns: string;
}

export interface VibeOption {
  score: VibeScore;
  emoji: string;
  label: string;
}

export const VIBE_OPTIONS: VibeOption[] = [
  { score: 1, emoji: "🤬", label: "Stressful / Regret" },
  { score: 2, emoji: "😕", label: "Mild Regret" },
  { score: 3, emoji: "😐", label: "Neutral / Standard" },
  { score: 4, emoji: "🙂", label: "Happy / Value" },
  { score: 5, emoji: "🤩", label: "Super Worth It" },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Savings",
  "Personal",
  "Entertainment"
];

export const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Gifts",
  "Refunds"
];

export const DEFAULT_PAYMENT_METHODS = [
  "Bank Transfer",
  "Cash",
  "Credit Card",
  "Debit Card"
];
