# Gary — Personal Finance & Smart Budgeting Dashboard

[![CI Build Check](https://github.com/your-username/gary-money-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/gary-money-dashboard/actions)
[![Design](https://img.shields.io/badge/Design-Material_3_Expressive-131F19?logo=google)](https://m3.material.io)
[![Stack](https://img.shields.io/badge/Stack-React_18_+_TypeScript_+_Vite-61DAFB?logo=react)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Backend-Firebase_Auth_+_Firestore-FFCA28?logo=firebase)](https://firebase.google.com)

A personal finance ledger and AI-powered budgeting tool built with **Material 3 Expressive Design**, **Google Sign-In**, **Cloud Firestore real-time synchronization**, and **Gemini AI Insights**.

---

## 🌟 Key Features

### 🎨 Material 3 Expressive Design System
- **Earthy Sage & Forest Green Palette**: High-contrast, tactile, organic tones (`#131F19`, `#F0F4DB`, `#A3D9A5`, `#E1EBC2`).
- **Tactile Components**: Rounded pill tokens (`rounded-[2rem]`, `rounded-full`), floating action buttons (FAB), smooth modal sheets, and soft multi-level elevation shadows.
- **Expressive Typography**: Plus Jakarta Sans for displays and JetBrains Mono for figures and financial amounts.

### 💰 Core Ledger & Budgeting
- **Monthly & Yearly Views**: Switch timeframes seamlessly with dynamic month/year dropdowns.
- **Financial KPIs**: Track total period Income, Expenses, and an animated Savings Rate progress meter.
- **Spending Patterns Bar Chart**: Toggle between Expense and Income breakdowns with interactive click-to-filter.
- **Abnormal Spend Tracking**: Flag one-off emergency or splurge purchases to distinguish them from baseline recurring expenses.
- **5-Point Vibe / Sentiment System**: Rate every expense with a tactile sentiment reaction (`🤬 Stressful`, `😕 Regret`, `😐 Neutral`, `🙂 Value`, `🤩 Super Worth It`) to identify emotional spending triggers.
- **Category Manager**: Add, rename, or delete Expense and Income categories on the fly.
- **Interactive Activity Table**: Sort by date, name, and amount; filter by category; inline edit or delete entries.

### 🤖 Gary's AI Insights & Budget Forecasting
- **Autonomous Insights**: Automatic heuristic calculations that detect low-vibe expense leaks, abnormal spend spikes, and high-velocity categories with actionable tips.
- **Target Budget Forecast**: Set a monthly budget goal; Gary computes projected overrun risks and pacing alerts.
- **Gemini API Integration Ready**: Optional client-side Gemini Flash integration for deep natural language summaries.

### ☁️ Google Sign-In & Firebase Sync
- **Google Authentication**: One-click Google Sign-In via Firebase Auth.
- **Multi-Device Cloud Firestore**: Real-time cloud sync (`users/{uid}/transactions` & `users/{uid}/settings`).
- **Zero-Friction Local Demo Mode**: Works immediately in offline/guest mode using `localStorage` without requiring Firebase credentials upfront.
- **Seamless Cloud Migration**: One-click import to sync your local ledger items into your Google account when you sign in.
- **Data Portability**: Instant one-click export to CSV (for Excel/Google Sheets) and JSON backup.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or pnpm

### 2. Local Setup
```bash
# Clone the repository
git clone https://github.com/your-username/gary-money-dashboard.git
cd gary-money-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to preview Gary.

---

## 🔑 Firebase & Google Sign-In Configuration

To enable cloud sync and Google Sign-In:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project (e.g. `gary-finance`).
2. **Enable Authentication**:
   - Navigate to **Authentication** > **Sign-in method**.
   - Enable the **Google** provider and save.
   - Under **Authorized domains**, ensure `localhost` is listed.
3. **Enable Cloud Firestore**:
   - Navigate to **Firestore Database** > **Create database**.
   - Choose production mode. The security rules in `firestore.rules` will protect user data.
4. **Get Configuration Keys**:
   - Go to **Project Settings** (gear icon) > **General** > **Your apps**.
   - Register a **Web app** (`</>`) and copy the `firebaseConfig` keys.
5. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   ```
   Fill in the variables in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

   # Optional: Google Gemini API key for natural language Gary insights
   VITE_GEMINI_API_KEY=
   ```
6. Restart your dev server:
   ```bash
   npm run dev
   ```

---

## 📦 Pushing to GitHub

To push your repository to GitHub:

```bash
# Stage and commit your changes
git add .
git commit -m "feat: Initial Gary M3 Expressive budget app with Google Sign-In and Firestore"

# Create a new repository on GitHub, then link and push:
git remote add origin https://github.com/your-username/gary-money-dashboard.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploying to Firebase Hosting

This project includes pre-configured `firebase.json` and `firestore.rules`.

```bash
# Build production bundle
npm run build

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize or select your project
firebase use --add

# Deploy hosting and Firestore security rules
firebase deploy
```

---

## 🔮 Incremental Ideation & Future Roadmap

Ideas for future iterations:

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Bank / CSV Importer** | Automatically parse bank exports (Chase, Amex, Capital One) and auto-assign categories | 💡 Backlog |
| **Gemini Receipt Scanner** | Take a photo or upload a receipt; Gemini extracts items, taxes, and amounts | 💡 Backlog |
| **Recurring Subscriptions** | Dedicated tracker showing active streaming/software subscriptions and renewal dates | 💡 Backlog |
| **Split / Shared Ledgers** | Invite partners or roommates to shared household budgets with permissions | 💡 Backlog |
| **Savings Goal Confetti** | Visual progress towards vacation or emergency funds with confetti celebration | 💡 Backlog |
| **PWA & Offline Service Worker** | Installable home screen app with instant offline caching on iOS and Android | 💡 Backlog |

---

## 📄 License
MIT License. Created with ❤️ for Gary and personal finance mindful spending.
