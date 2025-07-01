import React, { useState, useEffect } from 'react';
import { Calculator, Check, AlertCircle, Loader2, CreditCard, Lock, X } from 'lucide-react';
import { subscriptionService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeInput, validateForm, csrfService } from '../lib/security';
import AuthModal from './AuthModal';

interface FormData {
  name: string;
  phone: string;
  plan: 'diet' | 'protein' | 'royal' | '';
  mealTypes: string[];
  deliveryDays: string[];
  allergies: string;
}

interface SelectedPlanData {
  planType: 'diet' | 'protein' | 'royal';
  planName: string;
  planPrice: number;
  mealTypes: string[];
  deliveryDays: string[];
  features: string[];
}

const SubscriptionForm: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<SelectedPlanData | null>(null);
  const [showPlanInfo, setShowPlanInfo] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    plan: '',
    mealTypes: [],
    deliveryDays: [],
    allergies: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState('');

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = csrfService.generateToken();
    setCsrfToken(token);
    csrfService.storeToken(token);
  }, []);

  // Check for selected meal plan data from localStorage
  useEffect(() => {
    const storedPlanData = localStorage.getItem('selectedMealPlan');
    if (storedPlanData) {
      try {
        const planData: SelectedPlanData = JSON.parse(storedPlanData);
        setSelectedPlanData(planData);
        setShowPlanInfo(true);
        
        // Pre-fill form with selected plan data
        setFormData(prev => ({
          ...prev,
          plan: planData.planType,
          mealTypes: [...planData.mealTypes],
          deliveryDays: [...planData.deliveryDays]
        }));
      } catch (error) {
        console.error('Error parsing selected plan data:', error);
        localStorage.removeItem('selectedMealPlan');
      }
    }
  }, []);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user && user.user_metadata?.full_name) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata.full_name
      }));
    }
  }, [user]);

  const plans = [
    { id: 'diet', name: 'Diet Plan', price: 30000, description: 'Perfect for weight management' },
    { id: 'protein', name: 'Protein Plan', price: 40000, description: 'High-protein for fitness enthusiasts' },
    { id: 'royal', name: 'Royal Plan', price: 60000, description: 'Premium gourmet meals' }
  ];

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: '☀️' },
    { id: 'dinner', name: 'Dinner', icon: '🌙' }
  ];

  const weekDays = [
    { id: 'monday', name: 'Monday', short: 'Mon' },
    { id: 'tuesday', name: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', name: 'Wednesday', short: 'Wed' },
    { id: 'thursday', name: 'Thursday', short: 'Thu' },
    { id: 'friday', name: 'Friday', short: 'Fri' },
    { id: 'saturday', name: 'Saturday', short: 'Sat' },
    { id: 'sunday', name: 'Sunday', short: 'Sun' }
  ];

  const calculateTotalPrice = (): number => {
    if (!formData.plan || formData.mealTypes.length === 0 || formData.deliveryDays.length === 0) {
      return 0;
    }

    const selectedPlan = plans.find(p => p.id === formData.plan);
    if (!selectedPlan) return 0;

    const planPrice = selectedPlan.price;
    const mealTypesCount = formData.mealTypes.length;
    const deliveryDaysCount = formData.deliveryDays.length;
    const multiplier = 4.3; // Monthly multiplier

    return planPrice * mealTypesCount * deliveryDaysCount * multiplier;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const validateFormData = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Sanitize and validate name
    const sanitizedName = sanitizeInput.text(formData.name);
    const nameError = validateForm.required(sanitizedName, 'Name');
    if (nameError) newErrors.name = nameError;

    const nameLengthError = validateForm.textLength(sanitizedName, 2, 50, 'Name');
    if (nameLengthError) newErrors.name = nameLengthError;

    // Sanitize and validate phone
    const sanitizedPhone = sanitizeInput.phone(formData.phone);
    const phoneError = validateForm.indonesianPhone(sanitizedPhone);
    if (phoneError) newErrors.phone = phoneError;

    if (!formData.plan) {
      newErrors.plan = 'Please select a meal plan';
    }

    if (formData.mealTypes.length === 0) {
      newErrors.mealTypes = 'Please select at least one meal type';
    }

    if (formData.deliveryDays.length === 0) {
      newErrors.deliveryDays = 'Please select at least one delivery day';
    }

    // Sanitize allergies if provided
    if (formData.allergies) {
      const sanitizedAllergies = sanitizeInput.text(formData.allergies);
      const allergiesLengthError = validateForm.textLength(sanitizedAllergies, 0, 500, 'Allergies');
      if (allergiesLengthError) newErrors.allergies = allergiesLengthError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    if (name === 'name' || name === 'allergies') {
      sanitizedValue = sanitizeInput.text(value);
    } else if (name === 'phone') {
      sanitizedValue = sanitizeInput.phone(value);
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

  const handleCheckboxChange = (type: 'mealTypes' | 'deliveryDays', value: string) => {
    // Sanitize the value
    const sanitizedValue = sanitizeInput.text(value);
    
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(sanitizedValue)
        ? prev[type].filter(item => item !== sanitizedValue)
        : [...prev[type], sanitizedValue]
    }));

    // Clear error when user makes selection
    if (errors[type]) {
      setErrors(prev => ({
        ...prev,
        [type]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!validateFormData()) return;

    // CSRF token validation
    if (!csrfService.validateToken(csrfToken)) {
      setErrors({ submit: 'Security token invalid. Please refresh and try again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const subscriptionData = {
        name: sanitizeInput.text(formData.name),
        phone: sanitizeInput.phone(formData.phone),
        plan: formData.plan as 'diet' | 'protein' | 'royal',
        meal_types: sanitizeInput.stringArray(formData.mealTypes),
        delivery_days: sanitizeInput.stringArray(formData.deliveryDays),
        allergies: formData.allergies ? sanitizeInput.text(formData.allergies) : null,
        total_price: calculateTotalPrice()
      };

      await subscriptionService.create(subscriptionData);
      
      setSubmitSuccess(true);
      setFormData({
        name: user.user_metadata?.full_name || '',
        phone: '',
        plan: '',
        mealTypes: [],
        deliveryDays: [],
        allergies: ''
      });

      // Clear selected plan data from localStorage
      localStorage.removeItem('selectedMealPlan');
      setSelectedPlanData(null);
      setShowPlanInfo(false);

      // Generate new CSRF token for next submission
      const newToken = csrfService.generateToken();
      setCsrfToken(newToken);
      csrfService.storeToken(newToken);
    } catch (error) {
      console.error('Error creating subscription:', error);
      setErrors({ submit: 'Failed to create subscription. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelectedPlan = () => {
    localStorage.removeItem('selectedMealPlan');
    setSelectedPlanData(null);
    setShowPlanInfo(false);
    setFormData(prev => ({
      ...prev,
      plan: '',
      mealTypes: [],
      deliveryDays: []
    }));
  };

  // Show authentication required message if not logged in
  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-emerald-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h3>
          <p className="text-gray-600 mb-6">
            You need to be signed in to create a subscription. This helps us protect your data and provide better service.
          </p>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Sign In to Continue
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      </>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="text-green-600" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Subscription Created Successfully!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to NutriFlow! We'll contact you shortly to confirm your order and arrange payment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => setSubmitSuccess(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Create Another Subscription
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            View My Subscriptions
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-8">
        <h2 className="text-3xl font-bold mb-2">Create Your Subscription</h2>
        <p className="text-emerald-100">
          Customize your healthy meal plan and let us take care of your nutrition journey
        </p>
        <div className="mt-4 flex items-center text-emerald-200">
          <Lock size={16} className="mr-2" />
          <span className="text-sm">Secured with end-to-end encryption</span>
        </div>
      </div>

      {/* Selected Plan Information */}
      {showPlanInfo && selectedPlanData && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-emerald-800 mb-2">
                Selected Plan: {selectedPlanData.planName}
              </h3>
              <p className="text-emerald-700 mb-3">
                Your form has been pre-filled with the selected meal plan details.
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPlanData.features.slice(0, 3).map((feature, index) => (
                  <span 
                    key={index}
                    className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={clearSelectedPlan}
              className="text-emerald-600 hover:text-emerald-800 p-2"
              title="Clear selected plan"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="08123456789"
                maxLength={15}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Plan Selection <span className="text-red-500">*</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                  formData.plan === plan.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => {
                  setFormData(prev => ({ ...prev, plan: plan.id as 'diet' | 'protein' | 'royal' }));
                  if (errors.plan) setErrors(prev => ({ ...prev, plan: '' }));
                }}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">{plan.name}</h4>
                  <div className="text-2xl font-bold text-emerald-600 mb-2">
                    {formatPrice(plan.price)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                  <div className="text-xs text-gray-500">per meal</div>
                </div>
              </div>
            ))}
          </div>
          
          {errors.plan && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.plan}
            </p>
          )}
        </div>

        {/* Meal Types */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Meal Types <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600">Select one or more meal options</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mealTypes.map((meal) => (
              <div
                key={meal.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                  formData.mealTypes.includes(meal.id)
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => handleCheckboxChange('mealTypes', meal.id)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{meal.icon}</div>
                  <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                  {formData.mealTypes.includes(meal.id) && (
                    <Check className="text-emerald-600 mx-auto mt-2" size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {errors.mealTypes && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.mealTypes}
            </p>
          )}
        </div>

        {/* Delivery Days */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Delivery Days <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600">Choose the days for meal delivery</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((day) => (
              <div
                key={day.id}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-300 text-center ${
                  formData.deliveryDays.includes(day.id)
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
                onClick={() => handleCheckboxChange('deliveryDays', day.id)}
              >
                <div className="font-semibold text-gray-900 text-sm">{day.short}</div>
                {formData.deliveryDays.includes(day.id) && (
                  <Check className="text-emerald-600 mx-auto mt-1" size={16} />
                )}
              </div>
            ))}
          </div>
          
          {errors.deliveryDays && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.deliveryDays}
            </p>
          )}
        </div>

        {/* Allergies */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Allergies & Dietary Restrictions
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please list any allergies or dietary restrictions (optional)
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none ${
                errors.allergies ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Peanut allergy, Lactose intolerant, Vegetarian, etc."
              maxLength={500}
            />
            {errors.allergies && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.allergies}
              </p>
            )}
          </div>
        </div>

        {/* Price Calculation */}
        {totalPrice > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Calculator className="text-emerald-600 mr-2" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">Price Calculation</h3>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Plan: {plans.find(p => p.id === formData.plan)?.name}</span>
                <span>{formatPrice(plans.find(p => p.id === formData.plan)?.price || 0)} per meal</span>
              </div>
              <div className="flex justify-between">
                <span>Meal Types Selected:</span>
                <span>{formData.mealTypes.length} types</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Days Selected:</span>
                <span>{formData.deliveryDays.length} days</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Multiplier:</span>
                <span>4.3</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Monthly Price:</span>
                <span className="text-2xl font-bold text-emerald-600">{formatPrice(totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Calculation: {formatPrice(plans.find(p => p.id === formData.plan)?.price || 0)} × {formData.mealTypes.length} × {formData.deliveryDays.length} × 4.3
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6">
          {errors.submit && (
            <p className="mb-4 text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.submit}
            </p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || totalPrice === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Creating Subscription...
              </>
            ) : (
              <>
                <CreditCard className="mr-2" size={20} />
                Create Subscription {totalPrice > 0 && `- ${formatPrice(totalPrice)}`}
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            <Lock size={12} className="inline mr-1" />
            Secured with SSL encryption. By submitting, you agree to our terms and conditions.
          </p>
        </div>

        {/* CSRF Token (hidden) */}
        <input type="hidden" name="csrf_token" value={csrfToken} />
      </form>
    </div>
  );
};

export default SubscriptionForm;