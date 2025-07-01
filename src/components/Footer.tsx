import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    // If we're not on the home page, navigate to home first
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    } else {
      // If we're already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFeaturesClick = () => {
    // If we're not on the home page, navigate to home with features section
    if (window.location.pathname !== '/') {
      window.location.href = '/#features';
    } else {
      // If we're on home page, scroll to features section
      scrollToSection('features');
    }
  };

  const handleContactClick = () => {
    // If we're not on the home page, navigate to home with contact section
    if (window.location.pathname !== '/') {
      window.location.href = '/#contact';
    } else {
      // If we're on home page, scroll to contact section
      scrollToSection('contact');
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-emerald-400 mb-4">SEA Catering</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Indonesia's premier healthy meal delivery service. We're committed to making nutritious eating 
              accessible, convenient, and delicious for everyone across the archipelago.
            </p>
            <p className="text-sm text-gray-400">
              "Healthy Meals, Anytime, Anywhere"
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button 
                  onClick={handleHomeClick}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={handleFeaturesClick}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={handleContactClick}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Contact
                </button>
              </li>
              <li>
                <Link 
                  to="/menu" 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  to="/subscription" 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Subscription
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <span className="text-gray-400">Manager:</span> 
                <span className="ml-1 font-medium">Brian</span>
              </li>
              <li>
                <span className="text-gray-400">Phone:</span> 
                <a 
                  href="tel:08123456789" 
                  className="ml-1 font-medium hover:text-emerald-400 transition-colors"
                >
                  08123456789
                </a>
              </li>
              <li>
                <span className="text-gray-400">Email:</span> 
                <a 
                  href="mailto:hello@seacatering.id" 
                  className="ml-1 font-medium hover:text-emerald-400 transition-colors"
                >
                  hello@seacatering.id
                </a>
              </li>
              <li>
                <span className="text-gray-400">Service:</span> 
                <span className="ml-1 font-medium">Indonesia Wide Delivery</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 SEA Catering. All rights reserved.
          </p>
          <div className="flex items-center text-gray-400 text-sm">
            <span>Made with</span>
            <Heart className="mx-1 text-red-500" size={16} />
            <span>for healthy living in Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;