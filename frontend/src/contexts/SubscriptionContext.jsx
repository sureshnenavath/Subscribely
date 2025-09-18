import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from '../services/api';

const SubscriptionContext = createContext(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Be defensive: ensure `subscriptions` is an array before calling .find
  const activeSubscription = Array.isArray(subscriptions) ? subscriptions.find(sub => sub && sub.status === 'active') || null : null;

  const fetchData = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [plansRes, subscriptionsRes, paymentsRes] = await Promise.all([
        api.get('/plans/'),
        api.get('/subscriptions/list/'),
        api.get('/payments/')
      ]);

  // Coerce responses to arrays to avoid runtime errors if API returns an object
  setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
  setSubscriptions(Array.isArray(subscriptionsRes.data) ? subscriptionsRes.data : []);
  setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId, isYearly) => {
    try {
      setLoading(true);
      const response = await api.post('/checkout/create-session/', {
        plan_id: planId,
        is_yearly: isYearly
      });

      const options = {
        key: response.data.razorpay_key_id,
        amount: response.data.amount * 100,
        currency: response.data.currency,
        name: response.data.name,
        description: response.data.description,
        order_id: response.data.razorpay_order_id,
        prefill: response.data.prefill,
        theme: { color: '#3b82f6' },
        handler: function (response) {
          console.log('Payment successful:', response);
          fetchData();
        },
        modal: { ondismiss: function () { console.log('Payment modal closed'); } }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      return true;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId) => {
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

  const renewSubscription = async (subscriptionId) => {
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
