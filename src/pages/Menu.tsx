import React, { useState } from 'react';
import { Clock, Users, Star, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

interface MealPlan {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  image: string;
  duration: string;
  servings: number;
  rating: number;
  features: string[];
  detailedDescription: string;
  nutritionalInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  sampleMeals: string[];
  planType: 'diet' | 'protein' | 'royal';
  mealTypes: string[];
  deliveryDays: string[];
}

const Menu: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleChoosePlan = (plan: MealPlan) => {
    if (user) {
      // Store selected plan data in localStorage for the subscription form
      const planData = {
        planType: plan.planType,
        planName: plan.name,
        planPrice: plan.priceValue,
        mealTypes: plan.mealTypes,
        deliveryDays: plan.deliveryDays,
        features: plan.features
      };
      localStorage.setItem('selectedMealPlan', JSON.stringify(planData));
      
      // Redirect to subscription page
      window.location.href = '/subscription';
    } else {
      // User not logged in, show auth modal
      setShowAuthModal(true);
    }
  };

  const mealPlans: MealPlan[] = [
    {
      id: 1,
      name: "Diet Plan",
      price: "Rp 30,000",
      priceValue: 30000,
      description: "Perfect for weight management with balanced, nutritious meals designed to support your health goals.",
      image: "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      duration: "Monthly",
      servings: 60,
      rating: 4.8,
      features: ["Low calorie meals", "Balanced nutrition", "Weight management", "Fresh ingredients"],
      detailedDescription: "Our Diet Plan is designed for those looking to maintain a healthy weight while enjoying delicious, nutritious meals. Each meal is carefully crafted to provide balanced nutrition with controlled portions.",
      nutritionalInfo: {
        calories: "300-400 per meal",
        protein: "20-25g",
        carbs: "30-40g",
        fat: "10-15g"
      },
      sampleMeals: [
        "Grilled Chicken with Quinoa Salad",
        "Steamed Fish with Vegetables",
        "Vegetarian Buddha Bowl",
        "Lean Beef with Cauliflower Rice"
      ],
      planType: 'diet',
      mealTypes: ['lunch', 'dinner'],
      deliveryDays: ['monday', 'wednesday', 'friday']
    },
    {
      id: 2,
      name: "Protein Plan",
      price: "Rp 40,000",
      priceValue: 40000,
      description: "High-protein meals designed for fitness enthusiasts and those looking to build muscle mass.",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      duration: "Monthly",
      servings: 60,
      rating: 4.9,
      features: ["High protein content", "Muscle building", "Post-workout meals", "Premium ingredients"],
      detailedDescription: "Our Protein Plan offers high-protein meals perfect for athletes and fitness enthusiasts. Each meal is designed to support muscle growth and recovery with premium protein sources.",
      nutritionalInfo: {
        calories: "450-600 per meal",
        protein: "35-45g",
        carbs: "40-50g",
        fat: "15-25g"
      },
      sampleMeals: [
        "Grilled Salmon with Sweet Potato",
        "Chicken Breast with Brown Rice",
        "Beef Steak with Quinoa",
        "Protein-Packed Smoothie Bowl",
        "Turkey Meatballs with Pasta",
        "Tuna Salad with Avocado"
      ],
      planType: 'protein',
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      deliveryDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    {
      id: 3,
      name: "Royal Plan",
      price: "Rp 60,000",
      priceValue: 60000,
      description: "Premium gourmet meals with the finest ingredients for the ultimate dining experience.",
      image: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      duration: "Monthly",
      servings: 90,
      rating: 4.9,
      features: ["Gourmet ingredients", "Chef-prepared", "Premium quality", "Luxury dining"],
      detailedDescription: "The Royal Plan brings luxury dining to your doorstep with gourmet meals prepared by professional chefs using the finest ingredients available.",
      nutritionalInfo: {
        calories: "500-700 per meal",
        protein: "30-40g",
        carbs: "45-60g",
        fat: "20-30g"
      },
      sampleMeals: [
        "Wagyu Beef Tenderloin",
        "Lobster Thermidor",
        "Truffle Risotto",
        "Pan-Seared Duck Breast",
        "Grilled Sea Bass",
        "Lamb Rack with Herbs"
      ],
      planType: 'royal',
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      deliveryDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }
  ];

  const openModal = (plan: MealPlan) => {
    setSelectedPlan(plan);
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-emerald-600 to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our <span className="text-emerald-200">Meal Plans</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Choose from our carefully crafted meal plans designed to fit your lifestyle, 
              dietary preferences, and health goals.
            </p>
          </div>
        </div>

        {/* Meal Plans Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mealPlans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={plan.image} 
                    alt={plan.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="text-yellow-500 fill-current" size={16} />
                    <span className="text-sm font-semibold text-gray-800">{plan.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{plan.price}</div>
                      <div className="text-sm text-gray-500">per meal</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">{plan.description}</p>
                  
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{plan.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{plan.servings} meals/month</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {plan.features.slice(0, 2).map((feature, index) => (
                      <span 
                        key={index}
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                    {plan.features.length > 2 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        +{plan.features.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => openModal(plan)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    See More Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img 
                  src={selectedPlan.image} 
                  alt={selectedPlan.name}
                  className="w-full h-64 object-cover"
                />
                <button 
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                  <Star className="text-yellow-500 fill-current" size={20} />
                  <span className="font-semibold text-gray-800">{selectedPlan.rating} Rating</span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedPlan.name}</h2>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock size={18} />
                        <span>{selectedPlan.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users size={18} />
                        <span>{selectedPlan.servings} meals/month</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">{selectedPlan.price}</div>
                    <div className="text-gray-500">per meal</div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-8">{selectedPlan.detailedDescription}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Features</h3>
                    <div className="space-y-3">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Check className="text-emerald-600 flex-shrink-0" size={20} />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Nutritional Info (per meal)</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calories:</span>
                        <span className="font-semibold">{selectedPlan.nutritionalInfo.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-semibold">{selectedPlan.nutritionalInfo.protein}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-semibold">{selectedPlan.nutritionalInfo.carbs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-semibold">{selectedPlan.nutritionalInfo.fat}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Sample Meals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPlan.sampleMeals.map((meal, index) => (
                      <div key={index} className="bg-emerald-50 rounded-lg p-3 flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{meal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Included Meal Types and Delivery Days */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Included Meal Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.mealTypes.map((meal, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium capitalize"
                        >
                          {meal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Schedule</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.deliveryDays.map((day, index) => (
                        <span 
                          key={index}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium capitalize"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleChoosePlan(selectedPlan)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Choose This Plan
                  </button>
                  <button 
                    onClick={closeModal}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  );
};

export default Menu;