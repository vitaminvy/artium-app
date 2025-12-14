import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../../configs/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  status: 'loading',
});

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthContextType>({
    user: null,
    status: 'loading',
  });

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setAuthData({ user: firebaseUser, status: 'authenticated' });
      } else {
        // User is signed out
        setAuthData({ user: null, status: 'unauthenticated' });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
