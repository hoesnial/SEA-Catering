import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Download,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Edit3,
  Trash2,
  UserCheck,
  AlertCircle,
  Star,
  MessageSquare
} from 'lucide-react';
import { adminService } from '../services/admin';
import ProtectedRoute from '../components/ProtectedRoute';

interface DashboardMetrics {
  newSubscriptions: number;
  monthlyRecurringRevenue: number;
  reactivations: number;
  subscriptionGrowth: number;
  totalActiveSubscriptions: number;
  totalPausedSubscriptions: number;
  totalCancelledSubscriptions: number;
  averageSubscriptionValue: number;
}

interface Subscription {
  id: number;
  name: string;
  phone: string;
  plan: string;
  meal_types: string[];
  delivery_days: string[];
  total_price: number;
  status: string;
  created_at: string;
  user_id: string;
}

interface Testimonial {
  id: number;
  name: string;
  message: string;
  rating: number;
  location: string;
  approved: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'subscriptions' | 'testimonials' | 'settings'>('analytics');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Analytics state
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    newSubscriptions: 0,
    monthlyRecurringRevenue: 0,
    reactivations: 0,
    subscriptionGrowth: 0,
    totalActiveSubscriptions: 0,
    totalPausedSubscriptions: 0,
    totalCancelledSubscriptions: 0,
    averageSubscriptionValue: 0
  });
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, dateRange]);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, subscriptionFilter, searchTerm]);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, testimonialFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadSubscriptions(),
        loadTestimonials()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await adminService.getDashboardMetrics(dateRange.startDate, dateRange.endDate);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const data = await adminService.getAllSubscriptions();
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const data = await adminService.getTestimonials();
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Filter by status
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === subscriptionFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone.includes(searchTerm) ||
        sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubscriptions(filtered);
  };

  const filterTestimonials = () => {
    let filtered = testimonials;

    if (testimonialFilter === 'approved') {
      filtered = filtered.filter(test => test.approved);
    } else if (testimonialFilter === 'pending') {
      filtered = filtered.filter(test => !test.approved);
    }

    setFilteredTestimonials(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleApproveTestimonial = async (testimonialId: number) => {
    try {
      await adminService.approveTestimonial(testimonialId);
      await loadTestimonials();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      alert('Failed to approve testimonial');
    }
  };

  const handleUpdateSubscriptionStatus = async (subscriptionId: number, newStatus: string) => {
    try {
      await adminService.updateSubscriptionStatus(subscriptionId, newStatus as any);
      await loadSubscriptions();
      await loadMetrics(); // Refresh metrics after status change
    } catch (error) {
      console.error('Error updating subscription status:', error);
      alert('Failed to update subscription status');
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
      month: 'short',
      day: 'numeric'
    });
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['New Subscriptions', metrics.newSubscriptions],
      ['Monthly Recurring Revenue', metrics.monthlyRecurringRevenue],
      ['Reactivations', metrics.reactivations],
      ['Subscription Growth', `${metrics.subscriptionGrowth}%`],
      ['Total Active Subscriptions', metrics.totalActiveSubscriptions],
      ['Total Paused Subscriptions', metrics.totalPausedSubscriptions],
      ['Total Cancelled Subscriptions', metrics.totalCancelledSubscriptions],
      ['Average Subscription Value', metrics.averageSubscriptionValue]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriflow-admin-metrics-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div></div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-orange-100">
                Welcome back, {user?.user_metadata?.full_name}! Manage your NutriFlow business.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'subscriptions', label: 'Subscriptions', icon: Users },
              { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Business Analytics</h2>
                  <p className="text-gray-600">Monitor key metrics and business performance</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Calendar size={20} className="text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="text-emerald-600" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{metrics.newSubscriptions}</div>
                    <div className="text-sm text-gray-500">New Subscriptions</div>
                  </div>
                </div>
                <div className="text-sm text-emerald-600 font-medium">
                  +{metrics.subscriptionGrowth.toFixed(1)}% growth rate
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(metrics.monthlyRecurringRevenue)}
                    </div>
                    <div className="text-sm text-gray-500">Monthly Recurring Revenue</div>
                  </div>
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  Avg: {formatPrice(metrics.averageSubscriptionValue)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="text-purple-600" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{metrics.reactivations}</div>
                    <div className="text-sm text-gray-500">Reactivations</div>
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium">
                  Previously cancelled
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-orange-600" size={24} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{metrics.totalActiveSubscriptions}</div>
                    <div className="text-sm text-gray-500">Active Subscriptions</div>
                  </div>
                </div>
                <div className="text-sm text-orange-600 font-medium">
                  Total active users
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Status Breakdown */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 size={20} className="mr-2" />
                  Subscription Status Breakdown
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="text-green-600 mr-3" size={20} />
                      <span className="font-medium text-gray-900">Active</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{metrics.totalActiveSubscriptions}</div>
                      <div className="text-sm text-gray-500">
                        {((metrics.totalActiveSubscriptions / (metrics.totalActiveSubscriptions + metrics.totalPausedSubscriptions + metrics.totalCancelledSubscriptions)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="text-yellow-600 mr-3" size={20} />
                      <span className="font-medium text-gray-900">Paused</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-600">{metrics.totalPausedSubscriptions}</div>
                      <div className="text-sm text-gray-500">
                        {((metrics.totalPausedSubscriptions / (metrics.totalActiveSubscriptions + metrics.totalPausedSubscriptions + metrics.totalCancelledSubscriptions)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <XCircle className="text-red-600 mr-3" size={20} />
                      <span className="font-medium text-gray-900">Cancelled</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600">{metrics.totalCancelledSubscriptions}</div>
                      <div className="text-sm text-gray-500">
                        {((metrics.totalCancelledSubscriptions / (metrics.totalActiveSubscriptions + metrics.totalPausedSubscriptions + metrics.totalCancelledSubscriptions)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Insights */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <DollarSign size={20} className="mr-2" />
                  Revenue Insights
                </h3>
                
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(metrics.monthlyRecurringRevenue)}
                    </div>
                    <div className="text-gray-600 mb-4">Total MRR for Selected Period</div>
                    <div className="text-sm text-emerald-600 font-medium">
                      +{metrics.subscriptionGrowth.toFixed(1)}% growth rate
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(metrics.averageSubscriptionValue)}
                      </div>
                      <div className="text-sm text-gray-600">Average Value</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {metrics.reactivations}
                      </div>
                      <div className="text-sm text-gray-600">Reactivations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Subscription Management</h2>
                  <p className="text-gray-600">View and manage all customer subscriptions</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <Search size={20} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search subscriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <select
                    value={subscriptionFilter}
                    onChange={(e) => setSubscriptionFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subscriptions List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{subscription.name}</div>
                            <div className="text-sm text-gray-500">{subscription.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{subscription.plan} Plan</div>
                          <div className="text-sm text-gray-500">
                            {subscription.meal_types.length} meals, {subscription.delivery_days.length} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(subscription.total_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit3 size={16} />
                            </button>
                            {subscription.status !== 'cancelled' && (
                              <button 
                                onClick={() => handleUpdateSubscriptionStatus(subscription.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Testimonial Management</h2>
                  <p className="text-gray-600">Review and approve customer testimonials</p>
                </div>
                
                <select
                  value={testimonialFilter}
                  onChange={(e) => setTestimonialFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Testimonials</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">"{testimonial.message}"</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {testimonial.approved ? 'Approved' : 'Pending'}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(testimonial.created_at)}</span>
                    </div>
                    
                    {!testimonial.approved && (
                      <button
                        onClick={() => handleApproveTestimonial(testimonial.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 flex items-center"
                      >
                        <UserCheck size={14} className="mr-1" />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Meal Plan Management</span>
                        <Settings size={16} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Add, edit, or remove meal plans</p>
                    </button>
                    
                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">User Management</span>
                        <Users size={16} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Manage user accounts and permissions</p>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reports & Analytics</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Advanced Analytics</span>
                        <BarChart3 size={16} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Detailed business intelligence reports</p>
                    </button>
                    
                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Export Data</span>
                        <Download size={16} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Export customer and subscription data</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;