import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeInput, validateForm, csrfService, rateLimiter } from '../lib/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

type ModalMode = 'signin' | 'signup' | 'forgot-password';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signIn, signUp, requestPasswordReset } = useAuth();

  // Generate CSRF token on mount
  useEffect(() => {
    if (isOpen) {
      const token = csrfService.generateToken();
      setCsrfToken(token);
      csrfService.storeToken(token);
    }
  }, [isOpen]);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        fullName: '',
        confirmPassword: ''
      });
      setErrors({});
      setSuccessMessage('');
      setShowPassword(false);
    }
  }, [isOpen, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'email') {
      sanitizedValue = sanitizeInput.email(value);
    } else if (name === 'fullName') {
      sanitizedValue = sanitizeInput.text(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateFormData = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailError = validateForm.email(formData.email);
    if (emailError) newErrors.email = emailError;

    if (mode === 'forgot-password') {
      // Only validate email for password reset
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Password validation
    if (mode === 'signup') {
      const passwordErrors = [];
      
      if (formData.password.length < 8) {
        passwordErrors.push('at least 8 characters');
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('one uppercase letter');
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push('one lowercase letter');
      }
      if (!/\d/.test(formData.password)) {
        passwordErrors.push('one number');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
        passwordErrors.push('one special character');
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Full name validation
      const nameError = validateForm.required(formData.fullName, 'Full name');
      if (nameError) newErrors.fullName = nameError;

      const nameLengthError = validateForm.textLength(formData.fullName, 2, 50, 'Full name');
      if (nameLengthError) newErrors.fullName = nameLengthError;
    } else {
      // Sign in - just check password is not empty
      const passwordError = validateForm.required(formData.password, 'Password');
      if (passwordError) newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) return;

    // CSRF token validation
    if (!csrfService.validateToken(csrfToken)) {
      setErrors({ submit: 'Security token invalid. Please refresh and try again.' });
      return;
    }

    // Rate limiting
    const rateLimitKey = `auth_${formData.email}`;
    if (rateLimiter.isRateLimited(rateLimitKey)) {
      setErrors({ submit: 'Too many attempts. Please wait 5 minutes before trying again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.fullName);
        setSuccessMessage('Account created successfully! Please check your email for a confirmation link before signing in.');
        // Clear rate limit on successful auth
        rateLimiter.clearRateLimit(rateLimitKey);
        // Switch to sign in mode after successful signup
        setTimeout(() => {
          setMode('signin');
          setSuccessMessage('');
        }, 3000);
      } else if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        // Clear rate limit on successful auth
        rateLimiter.clearRateLimit(rateLimitKey);
        onClose();
      } else if (mode === 'forgot-password') {
        await requestPasswordReset(formData.email);
        setSuccessMessage('If an account with that email exists, a password reset link has been sent to your email.');
        // Switch back to sign in after 3 seconds
        setTimeout(() => {
          setMode('signin');
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = error.message || `Failed to ${mode === 'signup' ? 'create account' : mode === 'signin' ? 'sign in' : 'send reset email'}. Please try again.`;
      
      // Provide more helpful error messages for common issues
      if (mode === 'signin' && error.message === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'signin': return 'Welcome Back';
      case 'forgot-password': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case 'signup': return 'Join SEA Catering for healthy meal subscriptions';
      case 'signin': return 'Sign in to manage your meal subscriptions';
      case 'forgot-password': return 'Enter your email to receive a password reset link';
      default: return 'Sign in to manage your meal subscriptions';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          {mode === 'forgot-password' && (
            <button 
              onClick={() => setMode('signin')}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getModalTitle()}
            </h2>
            <p className="text-gray-600">
              {getModalDescription()}
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle size={16} className="mr-2" />
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    maxLength={50}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.password}
                  </p>
                )}
                {mode === 'signup' && !errors.password && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                        At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                        One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                        One lowercase letter
                      </li>
                      <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                        One number
                      </li>
                      <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : ''}>
                        One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    Passwords match
                  </p>
                )}
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  {errors.submit}
                </p>
                {mode === 'signin' && errors.submit.includes('Invalid') && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Having trouble signing in?</p>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      <li>Double-check your email and password</li>
                      <li>Make sure you've confirmed your email address</li>
                      <li>Try using the "Forgot Password?" option below</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {mode === 'signup' ? 'Creating Account...' : mode === 'signin' ? 'Signing In...' : 'Sending Reset Email...'}
                </div>
              ) : (
                mode === 'signup' ? 'Create Account' : mode === 'signin' ? 'Sign In' : 'Send Reset Email'
              )}
            </button>

            {/* CSRF Token (hidden) */}
            <input type="hidden" name="csrf_token" value={csrfToken} />
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <button
                onClick={() => setMode('forgot-password')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
              >
                Forgot Password?
              </button>
            )}
            
            {mode !== 'forgot-password' && (
              <p className="text-gray-600">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              Your data is encrypted and securely stored.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;