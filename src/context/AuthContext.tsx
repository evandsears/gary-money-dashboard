import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  authError: null,
  clearAuthError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setAuthError('Firebase credentials are not yet configured in .env. Operating in Local Demo Mode.');
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        // user cancelled, no error message needed
      } else if (error?.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized in Firebase Console. Add your localhost/domain under Authentication > Settings > Authorized Domains.');
      } else {
        setAuthError(error?.message || 'Failed to sign in with Google');
      }
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    if (!auth) {
      setUser(null);
      return;
    }
    try {
      await fbSignOut(auth);
    } catch (error: any) {
      console.error('Sign-out error:', error);
      setAuthError(error?.message || 'Failed to sign out');
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signInWithGoogle,
      signOutUser,
      authError,
      clearAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
