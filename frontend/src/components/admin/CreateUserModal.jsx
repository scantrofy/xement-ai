import React, { useState } from 'react';
import { X, User, Mail, Lock, Building, Shield, Users, AlertCircle } from 'lucide-react';

const CreateUserModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    organization: '',
    role: 'operator',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.organization) {
      newErrors.organization = 'Organization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        full_name: '',
        email: '',
        password: '',
        organization: '',
        role: 'operator',
      });
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl shadow-2xl border border-border-light max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light sticky top-0 bg-surface">
          <h2 className="text-xl font-bold text-text-primary">Create New Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-text-primary mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className={`w-full pl-10 pr-4 py-3 bg-background border ${
                  errors.full_name ? 'border-red-500' : 'border-border-light'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
              />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className={`w-full pl-10 pr-4 py-3 bg-background border ${
                  errors.email ? 'border-red-500' : 'border-border-light'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Temporary Password
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
                placeholder="Create a temporary password"
                className={`w-full pl-10 pr-12 py-3 bg-background border ${
                  errors.password ? 'border-red-500' : 'border-border-light'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Organization */}
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-text-primary mb-2">
              Organization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Enter organization"
                className={`w-full pl-10 pr-4 py-3 bg-background border ${
                  errors.organization ? 'border-red-500' : 'border-border-light'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
              />
            </div>
            {errors.organization && (
              <p className="mt-1 text-sm text-red-500">{errors.organization}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Role
            </label>
            <div className="flex bg-background rounded-lg p-1 border border-border-light">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                  formData.role === 'admin'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'operator' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                  formData.role === 'operator'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Users size={18} />
                <span>Operator</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border-light text-text-primary font-semibold rounded-lg hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
