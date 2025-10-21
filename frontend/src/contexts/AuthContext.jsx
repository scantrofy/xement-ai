import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');
      const userName = localStorage.getItem('userName');
      const userOrganization = localStorage.getItem('userOrganization');

      if (authStatus === 'true' && userEmail) {
        setUser({
          email: userEmail,
          role: userRole,
          name: userName,
          organization: userOrganization,
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userRole', userData.role);
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.organization) localStorage.setItem('userOrganization', userData.organization);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userOrganization');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
