import React, { useState } from 'react';
import { X, User, Building, Shield, Users, Lock, Eye, EyeOff } from 'lucide-react';

const EditUserModal = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    organization: user.organization || '',
    role: user.role || 'operator',
    is_active: user.is_active !== false,
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (!formData.organization) {
      newErrors.organization = 'Organization is required';
    }

    // Validate password if changing
    if (changePassword) {
      if (!formData.new_password) {
        newErrors.new_password = 'New password is required';
      } else if (formData.new_password.length < 6) {
        newErrors.new_password = 'Password must be at least 6 characters';
      }

      if (!formData.confirm_password) {
        newErrors.confirm_password = 'Please confirm password';
      } else if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(user.id, formData);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl shadow-2xl border border-border-light max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light sticky top-0 bg-surface">
          <h2 className="text-xl font-bold text-text-primary">Edit User</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 bg-background border border-border-light rounded-lg text-text-secondary cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-text-secondary">Email cannot be changed</p>
          </div>

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

          {/* Change Password Toggle */}
          <div className="border-t border-border-light pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => {
                  setChangePassword(e.target.checked);
                  if (!e.target.checked) {
                    // Clear password fields when unchecked
                    setFormData(prev => ({
                      ...prev,
                      new_password: '',
                      confirm_password: ''
                    }));
                    setErrors(prev => {
                      const { new_password, confirm_password, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className="w-5 h-5 rounded border-border-light bg-background text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-text-primary">
                Change Password
              </span>
            </label>
            <p className="mt-1 text-xs text-text-secondary ml-8">
              Check this to set a new password for the user
            </p>
          </div>

          {/* Password Fields (shown only when changePassword is true) */}
          {changePassword && (
            <>
              {/* New Password */}
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-text-primary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-secondary" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="new_password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className={`w-full pl-10 pr-12 py-3 bg-background border ${
                      errors.new_password ? 'border-red-500' : 'border-border-light'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
                )}
                <p className="mt-1 text-xs text-text-secondary">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-text-primary mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-secondary" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className={`w-full pl-10 pr-12 py-3 bg-background border ${
                      errors.confirm_password ? 'border-red-500' : 'border-border-light'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
                )}
              </div>
            </>
          )}

          {/* Role */}
          <div className="border-t border-border-light pt-4">
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

          {/* Status */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleCheckboxChange}
                className="w-5 h-5 rounded border-border-light bg-background text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-text-primary">
                {formData.is_active ? 'Active' : 'Disabled'}
              </span>
            </label>
            <p className="mt-1 text-xs text-text-secondary">
              Disabled users cannot log in to the system
            </p>
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
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
