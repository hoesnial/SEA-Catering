import React, { useState } from 'react';
import { Utensils, Truck, BarChart3, Clock, Shield, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Features: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      // User is logged in, redirect to subscription page
      window.location.href = '/subscription';
    } else {
      // User not logged in, show auth modal
      setShowAuthModal(true);
    }
  };

  const features = [
    {
      icon: Utensils,
      title: 'Meal Customization',
      description: 'Tailor your meals to your dietary preferences, allergies, and nutritional goals with our flexible menu options.',
      color: 'emerald'
    },
    {
      icon: Truck,
      title: 'Indonesia-wide Delivery',
      description: 'We deliver to major cities across Indonesia, from Jakarta and Surabaya to Bali and Medan, ensuring fresh meals reach you.',
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'Detailed Nutritional Info',
      description: 'Every meal comes with comprehensive nutritional breakdowns, helping you track calories, macros, and nutrients.',
      color: 'orange'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Choose your delivery times and meal frequencies that fit your lifestyle and schedule perfectly.',
      color: 'purple'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'All ingredients are sourced from trusted suppliers and prepared in certified kitchens with strict quality standards.',
      color: 'red'
    },
    {
      icon: Leaf,
      title: 'Sustainable Practices',
      description: 'We use eco-friendly packaging and work with local farmers to reduce our environmental impact.',
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: 'bg-emerald-100 text-emerald-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      green: 'bg-green-100 text-green-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <>
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-emerald-600">SEA Catering</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built our service around what matters most to you: convenience, quality, and your health goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className={`w-16 h-16 rounded-xl ${getColorClasses(feature.color)} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Healthy Journey?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of satisfied customers who have transformed their eating habits with SEA Catering. 
                Experience the convenience of healthy, customizable meals delivered right to your door.
              </p>
              <button 
                onClick={handleGetStarted}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started Today
              </button>
            </div>
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

export default Features;