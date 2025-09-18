import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Card } from '../ui/Card';
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { payments, loading } = useSubscription();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getMethodIcon = (method: string) => {
    return <CreditCard className="h-5 w-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all your subscription payments and transactions
          </p>
        </div>

        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No Payment History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment transactions will appear here once you subscribe to a plan.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      {getMethodIcon(payment.method)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          ₹{(typeof payment.amount === 'number' ? payment.amount : Number(payment.amount || 0)).toFixed(2)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-4 w-4" />
                          <span>{payment.method}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                            <span>{payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Transaction #{payment.id}
                      </p>
                      {payment.plan && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">Plan: {payment.plan}</p>
                      )}
                    {payment.razorpay_payment_id && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {payment.razorpay_payment_id}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {payments.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {payments.filter(p => p.status === 'success').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{payments.filter(p => p.status === 'success').reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : Number(p.amount || 0)), 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};