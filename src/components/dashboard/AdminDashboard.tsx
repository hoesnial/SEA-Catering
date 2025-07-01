import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { adminService } from '../../services/admin';

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

interface DateRange {
  startDate: string;
  endDate: string;
}

const AdminDashboard: React.FC = () => {
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
  
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardMetrics(dateRange.startDate, dateRange.endDate);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading admin metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
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
    a.download = `sea-catering-metrics-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Business Analytics</h2>
            <p className="text-gray-600">Monitor key metrics and business performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
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

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={exportData}
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
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
            {formatPercentage(metrics.subscriptionGrowth)} from last period
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
            Avg: {formatPrice(metrics.averageSubscriptionValue)} per subscription
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
            Previously cancelled subscriptions
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{metrics.totalActiveSubscriptions}</div>
              <div className="text-sm text-gray-500">Subscription Growth</div>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">
            Total active subscriptions
          </div>
        </div>
      </div>

      {/* Subscription Growth Highlight */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp size={20} className="mr-2" />
          Subscription Growth Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
            <div className="text-4xl font-bold text-emerald-600 mb-2">
              {metrics.totalActiveSubscriptions}
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Active Subscriptions</div>
            <div className="text-sm text-gray-600">Overall number of active subscriptions</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {metrics.newSubscriptions}
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">New This Period</div>
            <div className="text-sm text-gray-600">Subscriptions added in selected date range</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {formatPercentage(metrics.subscriptionGrowth)}
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Growth Rate</div>
            <div className="text-sm text-gray-600">Percentage growth from last period</div>
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
                <span className="font-medium text-gray-900">Active Subscriptions</span>
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
                <span className="font-medium text-gray-900">Paused Subscriptions</span>
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
                <span className="font-medium text-gray-900">Cancelled Subscriptions</span>
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
                {formatPercentage(metrics.subscriptionGrowth)} growth rate
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {formatPrice(metrics.averageSubscriptionValue)}
                </div>
                <div className="text-sm text-gray-600">Average Subscription Value</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {metrics.reactivations}
                </div>
                <div className="text-sm text-gray-600">Customer Reactivations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-300">
            <Eye size={20} className="mr-2" />
            View All Subscriptions
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-300">
            <Filter size={20} className="mr-2" />
            Manage Meal Plans
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-all duration-300">
            <BarChart3 size={20} className="mr-2" />
            Advanced Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;