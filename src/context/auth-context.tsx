/**
 * @file auth-context.tsx
 * @description State management autentikasi pengguna dan pemantauan sesi login Firebase (FR-16, SRS-14, SRS-16).
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { User as FirebaseAuthUser } from '@react-native-firebase/auth';

import {
  login as serviceLogin,
  logout as serviceLogout,
  register as serviceRegister,
  subscribeAuth,
  subscribeUserProfile,
} from '@/services/auth';
import { RegisterInput, User } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export interface AuthContextType {
  firebaseUser: FirebaseAuthUser | null;
  currentUser: User | null;
  initializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseAuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubsProfile: (() => void) | null = null;

    const unsubsAuth = subscribeAuth((fbUser) => {
      setFirebaseUser(fbUser);

      if (unsubsProfile) {
        unsubsProfile();
        unsubsProfile = null;
      }

      if (!fbUser) {
        setCurrentUser(null);
        setInitializing(false);
      } else {
        unsubsProfile = subscribeUserProfile(
          fbUser.uid,
          (userProfile) => {
            setCurrentUser(userProfile);
            setInitializing(false);
          },
          (err) => {
            setError(getErrorMessage(err));
            setInitializing(false);
          }
        );
      }
    });

    return () => {
      unsubsAuth();
      if (unsubsProfile) unsubsProfile();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await serviceLogin(email, password);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (input: RegisterInput) => {
    setError(null);
    try {
      await serviceRegister(input);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    await serviceLogout();
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        initializing,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }
  return context;
}
