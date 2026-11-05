import { type Transaction, type AiInsight, type AiForecast } from '../types/index.ts';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateLocalInsights = (transactions: Transaction[]): AiInsight => {
  if (transactions.length === 0) {
    return {
      summary: "Add your first transaction to unlock Gary's personalized spending insights.",
      suggestion: "Start by logging your fixed expenses like Rent, Utilities, or Subscriptions."
    };
  }

  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
  const abnormalTxs = expenses.filter(t => t.spendType === 'abnormal');
  const abnormalTotal = abnormalTxs.reduce((acc, t) => acc + t.amount, 0);

  // Vibe analysis
  const lowVibeTxs = expenses.filter(t => t.vibe <= 2);
  const lowVibeTotal = lowVibeTxs.reduce((acc, t) => acc + t.amount, 0);

  // Top category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  let topCat = 'None';
  let topCatAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topCatAmount) {
      topCat = cat;
      topCatAmount = amt;
    }
  }

  const topCatPct = totalExpense > 0 ? Math.round((topCatAmount / totalExpense) * 100) : 0;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  let summary = `You've spent $${totalExpense.toFixed(2)} this period across ${expenses.length} expense items. ${topCat} dominates ${topCatPct}% of your budget.`;
  
  if (abnormalTxs.length > 0) {
    summary += ` Noticeably, ${abnormalTxs.length} unplanned item(s) totaled $${abnormalTotal.toFixed(2)}.`;
  }

  let suggestion = "";
  if (lowVibeTotal > 0) {
    suggestion = `You logged $${lowVibeTotal.toFixed(2)} in low-vibe expenses (🤬 / 😕). Re-evaluating these could easily boost your savings rate!`;
  } else if (savingsRate >= 30) {
    suggestion = `Outstanding job! You're operating at a healthy ${savingsRate}% savings rate. Consider allocating extra surplus into high-yield investments.`;
  } else if (savingsRate < 10 && totalIncome > 0) {
    suggestion = `Savings rate is tight at ${savingsRate}%. Look for opportunities to trim the highest variable category: ${topCat}.`;
  } else {
    suggestion = `Keep recording transactions and tracking your vibes to discover hidden spending patterns!`;
  }

  return { summary, suggestion };
};

export const generateLocalForecast = (transactions: Transaction[], budget: number): AiForecast => {
  if (transactions.length === 0) {
    return {
      summary: `Your target budget is $${budget.toLocaleString()}. Log transactions to view pacing and overrun alerts.`,
      overruns: "No overruns detected yet."
    };
  }

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const budgetVariance = budget - totalExpense;
  const pctUsed = budget > 0 ? Math.round((totalExpense / budget) * 100) : 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  let summary = "";
  let overruns = "";

  if (pctUsed > 100) {
    summary = `You have surpassed your $${budget.toLocaleString()} monthly target by $${Math.abs(budgetVariance).toFixed(2)} (${pctUsed}% utilized).`;
    overruns = `Critical alert: Budget limit breached. Immediately defer all discretionary or abnormal expenses.`;
  } else if (pctUsed >= 80) {
    summary = `Caution: You've consumed ${pctUsed}% ($${totalExpense.toFixed(2)}) of your $${budget.toLocaleString()} target with $${budgetVariance.toFixed(2)} remaining.`;
    overruns = `Watch out: If you maintain current spending velocity, you are projected to exceed budget by month-end.`;
  } else {
    summary = `On Track: $${totalExpense.toFixed(2)} spent out of $${budget.toLocaleString()} (${pctUsed}% used). You have a comfortable buffer of $${budgetVariance.toFixed(2)}.`;
    overruns = `Safe status: No critical category overruns predicted under standard spending habits.`;
  }

  return { summary, overruns };
};

// Remote Gemini API Integration (optional client-side key)
export const fetchGeminiInsights = async (transactions: Transaction[]): Promise<AiInsight> => {
  if (!GEMINI_API_KEY) {
    return generateLocalInsights(transactions);
  }

  try {
    const prompt = `You are Gary, a friendly, witty, and sharp personal finance advisor.
Analyze these financial transactions:
${JSON.stringify(transactions.map(t => ({ name: t.name, amount: t.amount, type: t.type, category: t.category, spendType: t.spendType, vibe: t.vibe })))}

Respond with STRICT JSON format:
{
  "summary": "1-2 concise sentences summarizing key spending patterns",
  "suggestion": "1 actionable and encouraging piece of advice"
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) throw new Error('Gemini API call failed');
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text) as AiInsight;
    }
  } catch (err) {
    console.warn('Gemini API fallback to local heuristics:', err);
  }

  return generateLocalInsights(transactions);
};
