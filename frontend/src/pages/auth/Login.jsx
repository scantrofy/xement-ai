import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Shield, Users, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Logo from '../../components/ui/Logo';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // 'admin' or 'operator'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    console.log('Login attempt:', { email: formData.email, role: userRole });
    
    try {
      // First, fetch user data from backend to get role from Firestore
      let userData = null;
      try {
        console.log('Calling backend login API...');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
          {
            email: formData.email,
            password: formData.password,
            role: userRole
          }
        );
        
        console.log('Backend login successful:', response.data);
        userData = response.data.user;
        const backendToken = response.data.token;
        
        // Store user data from Firestore in localStorage BEFORE Firebase login
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userName', userData.full_name);
        localStorage.setItem('userOrganization', userData.organization);
        localStorage.setItem('userEmail', userData.email);
        // Store backend token for API calls (this is what the backend expects)
        localStorage.setItem('authToken', backendToken);
      } catch (backendError) {
        console.error('Backend login error:', backendError);
        console.error('Error details:', backendError.response?.data);
        // Handle different types of errors appropriately
        if (backendError.response?.status === 403) {
          setApiError(backendError.response.data.detail || 'Invalid role selection.');
        } else {
          setApiError('Invalid credentials. Please check your email and password.');
        }
        setIsLoading(false);
        return;
      }
      
      // Then use Firebase authentication
      try {
        console.log('Attempting Firebase login...');
        const { user, token: firebaseToken } = await login(formData.email, formData.password);
        
        console.log('Firebase login successful');
        // Don't overwrite authToken - keep the backend token for API calls
        // localStorage.setItem('authToken', firebaseToken); // REMOVED - we use backend token
        localStorage.setItem('firebaseToken', firebaseToken); // Store separately if needed
        localStorage.setItem('isAuthenticated', 'true');
      } catch (firebaseError) {
        console.error('Firebase login error:', firebaseError);
        console.error('Firebase error code:', firebaseError.code);
        // If Firebase fails but backend succeeded, we still have a valid session
        // The authToken from backend is stored in localStorage, so we can proceed
        localStorage.setItem('isAuthenticated', 'true');
        
        // Show a warning but don't fail the login
        console.warn('Firebase authentication failed, but backend authentication succeeded');
      }
      
      // Navigate to dashboard
      navigate('/overview-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Sign In to Your Account
          </h1>
          <p className="text-text-secondary">
            Access the Xement.AI cement manufacturing dashboard
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-2xl shadow-xl border border-border-light p-8">
          {/* Role Switcher */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Account Type
            </label>
            <div className="flex bg-background rounded-lg p-1 border border-border-light">
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                  userRole === 'admin'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('operator')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                  userRole === 'operator'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Users size={18} />
                <span>Operator</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {userRole === 'admin' 
                ? 'Full access to all features and user management' 
                : 'Access to monitoring and operational features'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 bg-background border ${
                    errors.email ? 'border-red-500' : 'border-border-light'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 bg-background border ${
                    errors.password ? 'border-red-500' : 'border-border-light'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Admin Contact Message */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Need an account? Contact your system administrator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>© 2025 Xement.AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
