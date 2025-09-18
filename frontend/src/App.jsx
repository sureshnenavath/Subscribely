import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SubscriptionProvider } from './contexts/SubscriptionContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { Header } from './components/layout/Header.jsx';
import { LoginForm } from './components/auth/LoginForm.jsx';
import { SignupForm } from './components/auth/SignupForm.jsx';
import { Dashboard } from './components/dashboard/Dashboard.jsx';
import { PlansPage } from './components/plans/PlansPage.jsx';
import { PaymentsPage } from './components/payments/PaymentsPage.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { NotFound } from './components/NotFound.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Header />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<SignupForm />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/plans" 
                  element={
                    <ProtectedRoute>
                      <PlansPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payments" 
                  element={
                    <ProtectedRoute>
                      <PaymentsPage />
                    </ProtectedRoute>
                  } 
                />
                {/* Catch-all for unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
