import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  Cloud, 
  Download, 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { type Transaction, type UserSettings } from '../types/index.ts';
import { exportTransactionsToCsv, syncLocalDataToFirestore } from '../services/storageService.ts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  settings: UserSettings;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  transactions,
  settings,
}) => {
  const { user, isConfigured, signInWithGoogle, signOutUser, authError, clearAuthError } = useAuth();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSyncToCloud = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      await syncLocalDataToFirestore(user.uid, transactions, settings);
      setSyncStatus('Successfully synced your local ledger to your cloud account!');
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err?.message || 'Failed to sync'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: user?.email || 'guest',
      settings,
      transactions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gary_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-[#131F19]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div 
        className="bg-m3-surface-container border border-m3-outline rounded-m3-xl p-6 shadow-m3-4 w-full max-w-md flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h3 className="text-xl font-black text-stone-800 font-display">
              Account & Sync
            </h3>
          </div>
          <button
            onClick={() => {
              clearAuthError();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Authentication Notice</span>
              <span>{authError}</span>
            </div>
          </div>
        )}

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* User Status Card */}
        {user ? (
          <div className="bg-m3-surface p-4 rounded-2xl border border-m3-outline flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-m3-tertiary object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-m3-primary text-white flex items-center justify-center font-bold text-sm">
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ME'}
                </div>
              )}
              <div>
                <p className="font-extrabold text-stone-900 text-sm">
                  {user.displayName || 'Authenticated User'}
                </p>
                <p className="text-xs text-stone-500 font-medium truncate max-w-[200px]">
                  {user.email}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                  <Cloud className="w-3 h-3" /> Cloud Sync Active
                </span>
              </div>
            </div>

            <button
              onClick={signOutUser}
              className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-white/80 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="bg-m3-surface p-4 rounded-2xl border border-m3-outline flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Mode: {isConfigured ? 'Guest (Local)' : 'Local Demo'}
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {isConfigured ? 'Sign in below' : 'Offline Safe'}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your financial ledger entries are currently stored securely in your browser's local memory.
              Sign in with your Google account to enable multi-device Cloud Firestore sync!
            </p>

            <button
              onClick={signInWithGoogle}
              className="w-full bg-m3-primary text-m3-on-primary font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-m3-secondary shadow-m3-1 transition-all text-xs tracking-wider uppercase font-display"
            >
              <LogIn className="w-4 h-4 text-m3-tertiary" />
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Cloud Sync Action (when authenticated) */}
        {user && (
          <button
            onClick={handleSyncToCloud}
            disabled={syncing}
            className="w-full bg-emerald-800 text-white font-bold py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-emerald-900 transition-all text-xs tracking-wide disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{syncing ? 'Syncing...' : 'Force Cloud Backup / Sync'}</span>
          </button>
        )}

        {/* Data Portability & GitHub Backups */}
        <div className="border-t border-m3-outline pt-3">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">
            Data Portability & Backups
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => exportTransactionsToCsv(transactions)}
              className="flex items-center justify-center gap-1.5 bg-m3-surface hover:bg-m3-surface-high border border-m3-outline text-stone-800 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center justify-center gap-1.5 bg-m3-surface hover:bg-m3-surface-high border border-m3-outline text-stone-800 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export JSON</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-400 font-medium mt-2">
            Download your ledger anytime to commit to GitHub or import into Google Sheets / Excel.
          </p>
        </div>
      </div>
    </div>
  );
};
