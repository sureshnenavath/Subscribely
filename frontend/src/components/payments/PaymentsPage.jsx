import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext.jsx';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { CreditCard, CheckCircle, Copy } from 'lucide-react';

export const PaymentsPage = () => {
  const { payments, loading } = useSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-600 dark:text-gray-400">Your payment history and receipts</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {payments.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{p.plan || 'Payment'}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{new Date(p.payment_date).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">₹{Number(p.amount || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{p.status}</div>
                {p.razorpay_payment_id && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end gap-2">
                    <span className="font-mono">Txn: {p.razorpay_payment_id}</span>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard && navigator.clipboard.writeText(p.razorpay_payment_id); }}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      aria-label={`Copy transaction id ${p.razorpay_payment_id}`}>
                      <Copy className="h-4 w-4" /> Copy
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
