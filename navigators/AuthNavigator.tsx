import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyScreen from '../screens/auth/VerifyScreen';
import KYCScreen from '../screens/auth/KYCScreen';
import PinSetupScreen from '../screens/auth/PinSetupScreen';
import ReEnterPinScreen from '../screens/auth/ReEnterPinScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ResetPasswordCodeScreen from '../screens/auth/ResetPasswordCodeScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Verify: { email: string };
  KYC: undefined;
  PinSetup: undefined;
  ReEnterPin: { initialPin: string };
  ResetPassword: undefined;
  ResetPasswordCode: { email: string };
  NewPassword: { email: string; otp: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="KYC" component={KYCScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="ReEnterPin" component={ReEnterPinScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ResetPasswordCode" component={ResetPasswordCodeScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;

