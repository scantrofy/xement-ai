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
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser || (isAuth && localStorage.getItem('authToken'))) {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
        }
        
        const customToken = localStorage.getItem('authToken');
        setAuthToken(customToken);
        
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        const userOrganization = localStorage.getItem('userOrganization');
        const userEmail = localStorage.getItem('userEmail');
        
        setUser({
          uid: firebaseUser?.uid || userEmail,
          email: firebaseUser?.email || userEmail,
          role: userRole,
          name: userName || firebaseUser?.displayName,
          organization: userOrganization,
        });
        setIsAuthenticated(true);
      } else {
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
      return await firebaseUser.getIdToken(true);
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
