import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../components/dashboard/UserDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import { User, Shield } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600 mt-1">
                    Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="text-emerald-600" size={20} />
                  </div>
                  {isAdmin && (
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Shield className="text-orange-600" size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;