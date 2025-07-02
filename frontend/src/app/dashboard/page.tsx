'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import DashboardComponent from '../../components/dashboard/DashboardComponent';
import LoginModal from '../../components/auth/LoginModal';

export default function DashboardPage() {
  const { user, login, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoginError(null);
      await login(email, password);
      setShowLoginModal(false);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">System Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Please sign in to view your application metrics
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          isLoading={isLoading}
          error={loginError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time monitoring of your application and server metrics
          </p>
        </div>
        
        <DashboardComponent />
      </div>
    </div>
  )
}