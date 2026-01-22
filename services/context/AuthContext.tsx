import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, getUserData } from '../storage/authStorage';
import { getOnboardingSeen } from '../storage/appStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  checkAuth: () => Promise<void>;
  checkOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const checkAuth = async () => {
    try {
      const token = await getAuthToken();
      const userData = await getUserData();
      
      console.log('🔐 Auth Context - Checking auth state');
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!userData);
      
      if (token && userData) {
        setIsAuthenticated(true);
        console.log('✅ Auth Context - User is authenticated');
      } else {
        setIsAuthenticated(false);
        console.log('❌ Auth Context - User is not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth Context - Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkOnboarding = async () => {
    try {
      const seen = await getOnboardingSeen();
      setHasSeenOnboarding(seen);
      console.log('📱 Auth Context - Onboarding seen:', seen);
    } catch (error) {
      console.error('❌ Auth Context - Error checking onboarding:', error);
      setHasSeenOnboarding(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([checkAuth(), checkOnboarding()]);
    };
    initialize();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        hasSeenOnboarding,
        checkAuth,
        checkOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
