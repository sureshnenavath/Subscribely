import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface Plan {
  id: number;
  name: string;
  monthly_price: number;
  yearly_price: number;
  features: string[];
  trial_days: number;
}

interface Subscription {
  id: number;
  plan: Plan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date: string;
  cancel_date?: string;
  created_at: string;
}

interface Payment {
  id: number;
  amount: number | string;
  method: 'UPI' | 'Card';
  status: 'success' | 'failed' | 'pending';
  razorpay_payment_id?: string;
  payment_date: string;
  plan?: string;
}

interface SubscriptionContextType {
  plans: Plan[];
  subscriptions: Subscription[];
  payments: Payment[];
  activeSubscription: Subscription | null;
  loading: boolean;
  subscribeToPlan: (planId: number, isYearly: boolean) => Promise<boolean>;
  cancelSubscription: (subscriptionId: number) => Promise<boolean>;
  renewSubscription: (subscriptionId: number) => Promise<boolean>;
  fetchData: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const activeSubscription = subscriptions.find(sub => sub.status === 'active') || null;

  const fetchData = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [plansRes, subscriptionsRes, paymentsRes] = await Promise.all([
        api.get('/plans/'),
        api.get('/subscriptions/list/'),
        api.get('/payments/')
      ]);

      setPlans(plansRes.data);
      setSubscriptions(subscriptionsRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId: number, isYearly: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      // Use checkout/create-session endpoint to match assessment API naming
      const response = await api.post('/checkout/create-session/', {
        plan_id: planId,
        is_yearly: isYearly
      });

      // Initialize Razorpay payment
      const options = {
        key: response.data.razorpay_key_id,
        amount: response.data.amount * 100,
        currency: response.data.currency,
        name: response.data.name,
        description: response.data.description,
        order_id: response.data.razorpay_order_id,
        prefill: response.data.prefill,
        theme: {
          color: '#3b82f6'
        },
        handler: function (response: any) {
          console.log('Payment successful:', response);
          fetchData(); // Refresh data after successful payment
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
      return true;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await api.post(`/subscriptions/${subscriptionId}/cancel/`);
      fetchData();
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const renewSubscription = async (subscriptionId: number): Promise<boolean> => {
    try {
      setLoading(true);
      await api.post(`/subscriptions/${subscriptionId}/renew/`);
      fetchData();
      return true;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, user]);

  const value = {
    plans,
    subscriptions,
    payments,
    activeSubscription,
    loading,
    subscribeToPlan,
    cancelSubscription,
    renewSubscription,
    fetchData
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};