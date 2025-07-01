import React from 'react';
import SubscriptionForm from '../components/SubscriptionForm';
import { Star, Users, Clock, Shield } from 'lucide-react';

const Subscription: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Start Your <span className="text-emerald-200">Subscription</span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have transformed their eating habits with SEA Catering. 
            Choose a plan that fits your lifestyle and start your healthy journey today.
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="text-emerald-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
            <p className="text-sm text-gray-600">Fresh, high-quality ingredients in every meal</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">10K+ Customers</h3>
            <p className="text-sm text-gray-600">Join our growing community of healthy eaters</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="text-orange-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Flexible Delivery</h3>
            <p className="text-sm text-gray-600">Choose your preferred delivery days and times</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Safe & Secure</h3>
            <p className="text-sm text-gray-600">Secure payment and reliable delivery service</p>
          </div>
        </div>

        {/* Subscription Form */}
        <SubscriptionForm />
      </div>
    </div>
  );
};

export default Subscription;