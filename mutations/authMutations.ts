import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/apiClient';
import { AUTH_ROUTES } from '../api.config';
import { setAuthToken, setUserData, setPinStatus, clearAuthData, setLastLoginEmail } from '../services/storage/authStorage';

// Register
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      phone_number?: string;
      country_code?: string;
    }) => {
      const response = await apiClient.post(AUTH_ROUTES.register, data);
      return response.data;
    },
  });
};

// Login
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      console.log('🔵 Login Mutation - Request Data:', { email: data.email, password: '***' });
      const response = await apiClient.post(AUTH_ROUTES.login, data);
      console.log('🟢 Login Mutation - Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    },
    onSuccess: async (data, variables) => {
      if (data.success && data.data?.token) {
        await setAuthToken(data.data.token);
        if (data.data.user) {
          await setUserData(data.data.user);
        }
        // Store email for biometric login
        await setLastLoginEmail(variables.email);
        console.log('✅ Login Mutation - Token and user data saved');
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
    onError: (error: any) => {
      console.log('❌ Login Mutation - Error:', JSON.stringify(error, null, 2));
    },
  });
};

// Verify Email OTP
export const useVerifyEmailOtp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await apiClient.post(AUTH_ROUTES.verifyEmailOtp, data);
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.success && data.data?.token) {
        await setAuthToken(data.data.token);
        if (data.data.user) {
          await setUserData(data.data.user);
        }
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
  });
};

// Resend OTP
export const useResendOtp = () => {
  return useMutation({
    mutationFn: async (data: {
      email?: string;
      phone_number?: string;
      type: 'email' | 'phone';
    }) => {
      const response = await apiClient.post(AUTH_ROUTES.resendOtp, data);
      return response.data;
    },
  });
};

// Forgot Password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post(AUTH_ROUTES.forgotPassword, data);
      return response.data;
    },
  });
};

// Verify Password Reset OTP
export const useVerifyPasswordResetOtp = () => {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await apiClient.post(AUTH_ROUTES.verifyPasswordResetOtp, data);
      return response.data;
    },
  });
};

// Reset Password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string; password: string; password_confirmation: string }) => {
      const response = await apiClient.post(AUTH_ROUTES.resetPassword, data);
      return response.data;
    },
  });
};

// Set PIN (Transaction PIN)
export const useSetPin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { pin: string; pin_confirmation?: string }) => {
      console.log('🔵 Set PIN Mutation - Request Data:', { pin: '****' });
      // Backend only requires 'pin', but we can send pin_confirmation if provided
      const requestData: any = { pin: data.pin };
      if (data.pin_confirmation) {
        requestData.pin_confirmation = data.pin_confirmation;
      }
      const response = await apiClient.post(AUTH_ROUTES.setPin, requestData);
      console.log('🟢 Set PIN Mutation - Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    },
    onSuccess: async (data) => {
      console.log('✅ Set PIN Mutation - Success');
      await setPinStatus(true);
      queryClient.invalidateQueries({ queryKey: ['auth', 'pin-status'] });
    },
    onError: (error: any) => {
      console.log('❌ Set PIN Mutation - Error:', JSON.stringify(error, null, 2));
    },
  });
};

// Verify PIN
export const useVerifyPin = () => {
  return useMutation({
    mutationFn: async (data: { pin: string }) => {
      const response = await apiClient.post(AUTH_ROUTES.verifyPin, data);
      return response.data;
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      console.log('🔵 Logout Mutation - Clearing auth data');
      await clearAuthData();
      queryClient.clear();
      console.log('✅ Logout Mutation - Auth data cleared');
      return { success: true };
    },
  });
};
