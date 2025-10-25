import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const token = await firebaseUser.getIdToken();
        setFirebaseUser(firebaseUser);
        setAuthToken(token);
        
        // Get additional user data from localStorage
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        const userOrganization = localStorage.getItem('userOrganization');
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: userRole,
          name: userName || firebaseUser.displayName,
          organization: userOrganization,
        });
        setIsAuthenticated(true);
        
        // Store token in localStorage for API calls
        localStorage.setItem('authToken', token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', firebaseUser.email);
      } else {
        // User is signed out
        setFirebaseUser(null);
        setUser(null);
        setAuthToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userOrganization');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      return { user: userCredential.user, token };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      return { user: userCredential.user, token };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const getToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken(true); // Force refresh
    }
    return null;
  };

  const value = {
    user,
    firebaseUser,
    isAuthenticated,
    loading,
    authToken,
    login,
    signup,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
