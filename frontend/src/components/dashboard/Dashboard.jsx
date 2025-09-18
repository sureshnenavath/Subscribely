import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useSubscription } from '../../contexts/SubscriptionContext.jsx';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { User, Calendar, CreditCard, AlertCircle, Crown, CheckCircle } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { activeSubscription, cancelSubscription, renewSubscription, loading } = useSubscription();

  const handleCancelSubscription = async () => {
    if (activeSubscription && window.confirm('Are you sure you want to cancel your subscription?')) {
      await cancelSubscription(activeSubscription.id);
    }
  };

  const handleRenewSubscription = async () => {
    if (activeSubscription) {
      await renewSubscription(activeSubscription.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'expired': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user?.first_name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your subscription and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
                <p className="text-gray-600 dark:text-gray-400">Account information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Status</h3>
                  <p className="text-gray-600 dark:text-gray-400">Current plan details</p>
                </div>
              </div>
            </div>

            {activeSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{activeSubscription.plan.name} Plan</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeSubscription.status)}`}>
                        {activeSubscription.status.charAt(0).toUpperCase() + activeSubscription.status.slice(1)}
                      </span>
                      {activeSubscription.status === 'active' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{activeSubscription.plan.monthly_price}<span className="text-sm text-gray-600 dark:text-gray-400 font-normal">/month</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Started</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(activeSubscription.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activeSubscription.status === 'cancelled' ? 'Expires' : 'Renews'}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(activeSubscription.end_date)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Plan Features:</h5>
                  <ul className="space-y-1">
                    {activeSubscription.plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"><CheckCircle className="h-4 w-4 text-green-500" /><span>{feature}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3 pt-4">
                  {activeSubscription.status === 'active' && (
                    <Button variant="danger" onClick={handleCancelSubscription} loading={loading}>Cancel Subscription</Button>
                  )}
                  {activeSubscription.status === 'cancelled' && (
                    <Button variant="primary" onClick={handleRenewSubscription} loading={loading}>Renew Subscription</Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Active Subscription</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Choose a plan to get started with Subscribely</p>
                <Button onClick={() => window.location.href = '/plans'}>View Plans</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
