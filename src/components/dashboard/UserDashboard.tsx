import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Pause, 
  Play, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Utensils,
  MapPin,
  Edit3
} from 'lucide-react';
import { subscriptionService } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface Subscription {
  id: number;
  name: string;
  phone: string;
  plan: 'diet' | 'protein' | 'royal';
  meal_types: string[];
  delivery_days: string[];
  allergies?: string;
  total_price: number;
  status: 'active' | 'paused' | 'cancelled';
  pause_start_date?: string;
  pause_end_date?: string;
  cancelled_at?: string;
  created_at: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showPauseModal, setShowPauseModal] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  const [pauseDates, setPauseDates] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await subscriptionService.getUserSubscriptions();
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDetails = (plan: string) => {
    const plans = {
      diet: { name: 'Diet Plan', color: 'emerald', price: 30000 },
      protein: { name: 'Protein Plan', color: 'blue', price: 40000 },
      royal: { name: 'Royal Plan', color: 'purple', price: 60000 }
    };
    return plans[plan as keyof typeof plans] || plans.diet;
  };

  const getStatusBadge = (subscription: Subscription) => {
    switch (subscription.status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={16} className="mr-1" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Pause size={16} className="mr-1" />
            Paused
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <X size={16} className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handlePauseSubscription = async (subscriptionId: number) => {
    if (!pauseDates.startDate || !pauseDates.endDate) {
      alert('Please select both start and end dates for the pause period.');
      return;
    }

    if (new Date(pauseDates.startDate) >= new Date(pauseDates.endDate)) {
      alert('End date must be after start date.');
      return;
    }

    setActionLoading(subscriptionId);
    try {
      await subscriptionService.updateStatus(subscriptionId, 'paused', {
        pause_start_date: pauseDates.startDate,
        pause_end_date: pauseDates.endDate
      });
      
      await loadSubscriptions();
      setShowPauseModal(null);
      setPauseDates({ startDate: '', endDate: '' });
    } catch (error) {
      console.error('Error pausing subscription:', error);
      alert('Failed to pause subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId: number) => {
    setActionLoading(subscriptionId);
    try {
      await subscriptionService.updateStatus(subscriptionId, 'active', {
        pause_start_date: null,
        pause_end_date: null
      });
      
      await loadSubscriptions();
    } catch (error) {
      console.error('Error resuming subscription:', error);
      alert('Failed to resume subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    setActionLoading(subscriptionId);
    try {
      await subscriptionService.updateStatus(subscriptionId, 'cancelled', {
        cancelled_at: new Date().toISOString()
      });
      
      await loadSubscriptions();
      setShowCancelModal(null);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Utensils className="text-gray-400" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscriptions Yet</h3>
        <p className="text-gray-600 mb-6">
          You haven't created any meal subscriptions yet. Start your healthy journey today!
        </p>
        <button 
          onClick={() => window.location.href = '/subscription'}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
        >
          Create Your First Subscription
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Pause className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paused Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.filter(s => s.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(
                  subscriptions
                    .filter(s => s.status === 'active')
                    .reduce((total, s) => total + s.total_price, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-6">
        {subscriptions.map((subscription) => {
          const planDetails = getPlanDetails(subscription.plan);
          
          return (
            <div key={subscription.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-${planDetails.color}-100 rounded-lg flex items-center justify-center`}>
                      <Utensils className={`text-${planDetails.color}-600`} size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{planDetails.name}</h3>
                      <p className="text-gray-600">Created on {formatDate(subscription.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(subscription)}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(subscription.total_price)}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Utensils size={16} className="mr-2" />
                      Meal Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {subscription.meal_types.map((meal, index) => (
                        <span 
                          key={index}
                          className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Delivery Days
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {subscription.delivery_days.map((day, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin size={16} className="mr-2" />
                      Contact Info
                    </h4>
                    <p className="text-gray-600 text-sm">{subscription.name}</p>
                    <p className="text-gray-600 text-sm">{subscription.phone}</p>
                  </div>
                </div>

                {/* Allergies */}
                {subscription.allergies && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Allergies & Restrictions
                    </h4>
                    <p className="text-gray-600 bg-orange-50 p-3 rounded-lg">{subscription.allergies}</p>
                  </div>
                )}

                {/* Pause Information */}
                {subscription.status === 'paused' && subscription.pause_start_date && subscription.pause_end_date && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <Clock size={16} className="mr-2" />
                      Pause Period
                    </h4>
                    <p className="text-yellow-700">
                      Paused from {formatDate(subscription.pause_start_date)} to {formatDate(subscription.pause_end_date)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {subscription.status === 'active' && (
                    <>
                      <button
                        onClick={() => setShowPauseModal(subscription.id)}
                        disabled={actionLoading === subscription.id}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
                      >
                        <Pause size={16} className="mr-2" />
                        Pause Subscription
                      </button>
                      <button
                        onClick={() => setShowCancelModal(subscription.id)}
                        disabled={actionLoading === subscription.id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
                      >
                        <X size={16} className="mr-2" />
                        Cancel Subscription
                      </button>
                    </>
                  )}

                  {subscription.status === 'paused' && (
                    <button
                      onClick={() => handleResumeSubscription(subscription.id)}
                      disabled={actionLoading === subscription.id}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
                    >
                      {actionLoading === subscription.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Play size={16} className="mr-2" />
                      )}
                      Resume Subscription
                    </button>
                  )}

                  <button
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
                  >
                    <Edit3 size={16} className="mr-2" />
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pause Subscription</h3>
            <p className="text-gray-600 mb-6">
              Select the period you want to pause your subscription. No charges will be applied during this time.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={pauseDates.startDate}
                  onChange={(e) => setPauseDates(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={pauseDates.endDate}
                  onChange={(e) => setPauseDates(prev => ({ ...prev, endDate: e.target.value }))}
                  min={pauseDates.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handlePauseSubscription(showPauseModal)}
                disabled={actionLoading === showPauseModal}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {actionLoading === showPauseModal ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Pausing...
                  </div>
                ) : (
                  'Confirm Pause'
                )}
              </button>
              <button
                onClick={() => {
                  setShowPauseModal(null);
                  setPauseDates({ startDate: '', endDate: '' });
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this subscription? This action cannot be undone, but you can create a new subscription anytime.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => handleCancelSubscription(showCancelModal)}
                disabled={actionLoading === showCancelModal}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {actionLoading === showCancelModal ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </div>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;