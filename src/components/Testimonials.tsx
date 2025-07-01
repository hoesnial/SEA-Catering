import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Send, User, AlertCircle, Lock } from 'lucide-react';
import { testimonialService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeInput, validateForm, csrfService } from '../lib/security';
import AuthModal from './AuthModal';

interface Testimonial {
  id: number;
  name: string;
  message: string;
  rating: number;
  created_at?: string;
  location: string;
}

const Testimonials: React.FC = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState('');

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = csrfService.generateToken();
    setCsrfToken(token);
    csrfService.storeToken(token);
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

  // Load testimonials from database
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await testimonialService.getAll();
        setTestimonials(data || []);
      } catch (error) {
        console.error('Error loading testimonials:', error);
        // Fallback to sample data if database fails
        setTestimonials([
          {
            id: 1,
            name: "Sarah Wijaya",
            message: "SEA Catering has completely transformed my eating habits! The meals are not only delicious but also perfectly portioned. I've lost 8kg in 3 months while feeling more energetic than ever.",
            rating: 5,
            location: "Jakarta"
          },
          {
            id: 2,
            name: "Ahmad Rahman", 
            message: "As a busy professional, SEA Catering has been a lifesaver. The Premium Wellness Plan fits perfectly with my schedule, and the nutritionist consultation helped me understand my dietary needs better.",
            rating: 5,
            location: "Surabaya"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 2));
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(testimonials.length / 2)) % Math.ceil(testimonials.length / 2));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input
    let sanitizedValue = value;
    if (name === 'name' || name === 'message') {
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

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateFormData = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const nameError = validateForm.required(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const nameLengthError = validateForm.textLength(formData.name, 2, 50, 'Name');
    if (nameLengthError) newErrors.name = nameLengthError;

    // Validate message
    const messageError = validateForm.required(formData.message, 'Message');
    if (messageError) newErrors.message = messageError;

    const messageLengthError = validateForm.textLength(formData.message, 10, 500, 'Message');
    if (messageLengthError) newErrors.message = messageLengthError;

    // Validate rating
    const ratingError = validateForm.rating(formData.rating);
    if (ratingError) newErrors.rating = ratingError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const sanitizedData = {
        name: sanitizeInput.text(formData.name),
        message: sanitizeInput.text(formData.message),
        rating: formData.rating,
        location: 'Indonesia'
      };

      const newTestimonial = await testimonialService.create(sanitizedData);
      
      // Add new testimonial to the beginning of the array
      setTestimonials(prev => [newTestimonial, ...prev]);
      
      // Reset form
      setFormData({ 
        name: user.user_metadata?.full_name || '', 
        message: '', 
        rating: 5 
      });
      setShowForm(false);
      setErrors({});

      // Generate new CSRF token
      const newToken = csrfService.generateToken();
      setCsrfToken(newToken);
      csrfService.storeToken(newToken);
    } catch (error) {
      console.error('Error creating testimonial:', error);
      setErrors({ submit: 'Failed to submit testimonial. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 20}
            className={`${
              star <= rating 
                ? 'text-yellow-500 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  const visibleTestimonials = testimonials.slice(currentSlide * 2, currentSlide * 2 + 2);

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-emerald-600">Customers Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have transformed their eating habits with SEA Catering. 
              Read their stories and share your own experience!
            </p>
          </div>

          {/* Testimonials Carousel */}
          {testimonials.length > 0 && (
            <div className="relative mb-16">
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {visibleTestimonials.map((testimonial) => (
                    <div 
                      key={testimonial.id}
                      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                          <User className="text-emerald-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.location}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        {renderStars(testimonial.rating)}
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-4">"{testimonial.message}"</p>
                      
                      <div className="text-sm text-gray-500">
                        {testimonial.created_at ? new Date(testimonial.created_at).toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Recently'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {testimonials.length > 2 && (
                <>
                  <button 
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-emerald-50"
                  >
                    <ChevronLeft className="text-emerald-600" size={24} />
                  </button>
                  
                  <button 
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-emerald-50"
                  >
                    <ChevronRight className="text-emerald-600" size={24} />
                  </button>

                  {/* Slide Indicators */}
                  <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Add Testimonial Section */}
          <div className="text-center">
            {!showForm ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Share Your Experience</h3>
                <p className="text-gray-600 mb-6">
                  Have you tried SEA Catering? We'd love to hear about your experience! 
                  Your feedback helps us improve and helps others make informed decisions.
                </p>
                {user ? (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Write a Review
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center text-gray-500 mb-4">
                      <Lock size={20} className="mr-2" />
                      <span>Sign in required to write a review</span>
                    </div>
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      Sign In to Write Review
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Write Your Review</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
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
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <div className="flex items-center space-x-2">
                      {renderStars(formData.rating, true, handleRatingChange)}
                      <span className="text-gray-600 ml-2">({formData.rating}/5)</span>
                    </div>
                    {errors.rating && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.rating}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tell us about your experience with SEA Catering..."
                      maxLength={500}
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.message.length}/500 characters
                    </div>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="mr-2" size={20} />
                          Submit Review
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setErrors({});
                      }}
                      className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    <Lock size={12} className="inline mr-1" />
                    Your review is secured and will be moderated before publication.
                  </p>

                  {/* CSRF Token (hidden) */}
                  <input type="hidden" name="csrf_token" value={csrfToken} />
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  );
};

export default Testimonials;