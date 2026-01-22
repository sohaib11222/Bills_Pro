import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Linking, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import ThemedText from '../../components/ThemedText';
import { useLogin } from '../../mutations/authMutations';
import { useAuth } from '../../services/context/AuthContext';
import { getBiometricEnabled } from '../../services/storage/appStorage';
import { getLastLoginEmail, getAuthToken } from '../../services/storage/authStorage';

type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type NavigationProp = CompositeNavigationProp<AuthNavigationProp, RootNavigationProp>;

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);
  const loginMutation = useLogin();
  const { checkAuth } = useAuth();

  // Check if biometric login is available
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const biometricEnabled = await getBiometricEnabled();
        const lastEmail = await getLastLoginEmail();
        const hasToken = await getAuthToken();
        
        if (biometricEnabled && lastEmail) {
          // Check if biometric hardware is available
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          
          if (compatible && enrolled) {
            setShowBiometric(true);
            setEmail(lastEmail);
          }
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      } finally {
        setIsCheckingBiometric(false);
      }
    };
    
    checkBiometricAvailability();
  }, []);

  // Handle biometric login
  const handleBiometricLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'No saved email found. Please login manually.');
      return;
    }

    try {
      // Check if token is still valid
      const token = await getAuthToken();
      if (token) {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          // Token is valid, navigate to main app
          const parent = navigation.getParent();
          if (parent) {
            parent.navigate('Main');
          } else {
            navigation.navigate('Main');
          }
          return;
        }
      }

      // Token invalid or expired, authenticate with biometric then prompt for password
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('Biometric Not Available', 'Biometric authentication is not available on this device.');
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('Biometric Not Set Up', 'Please set up biometric authentication in your device settings first.');
        return;
      }

      // Authenticate using biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Biometric successful, but still need password for security
        Alert.alert(
          'Enter Password',
          'Please enter your password to complete login.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Focus password input - user will enter password and click login
                // The email is already filled from stored value
              },
            },
          ]
        );
      } else {
        if (result.error !== 'user_cancel') {
          Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      Alert.alert('Error', 'An error occurred during biometric authentication. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      if (result.success) {
        // Refresh auth state
        await checkAuth();
        // Navigate to main app
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate('Main');
        } else {
          navigation.navigate('Main');
        }
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error?.message || error?.data?.message || 'An error occurred. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="light" />
      
      {/* Background Section */}
      <View style={styles.backgroundContainer}>
        <Image 
          source={require('../../assets/auth_background.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* White Card */}
      <View style={styles.card}>
        {/* Register Button */}
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <ThemedText style={styles.registerButtonText}>Register</ThemedText>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <ThemedText weight='semibold' style={styles.title}>Login</ThemedText>
          
          {/* Subtitle */}
          <ThemedText style={styles.subtitle}>Login to your account</ThemedText>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <ThemedText style={styles.forgotPasswordText}>Forgot Password ?</ThemedText>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, (loginMutation.isPending || !email.trim() || !password.trim()) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loginMutation.isPending || !email.trim() || !password.trim()}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.loginButtonText}>Login</ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {/* Legal Text */}
          <View style={styles.legalContainer}>
            <ThemedText style={styles.legalText}>
              By proceeding you agree with Bill's Pro{' '}
              <ThemedText 
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://example.com/terms')}
              >
                terms of use
              </ThemedText>
              {' '}and{' '}
              <ThemedText 
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://example.com/privacy')}
              >
                privacy policy
              </ThemedText>
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b800f',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.602, // ~561px on 932px screen
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: -17,
    left: -13,
    width: width * 1.06, // ~456px
    height: height * 0.64, // ~597px
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.485, // ~452px
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  cardContent: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  registerButton: {
    position: 'absolute',
    top: 46,
    right: 20,
    backgroundColor: '#1b800f',
    height: 50,
    width: 104,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: '#000000',
    marginTop: 0,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 22,
    marginBottom: 0,
  },
  formContainer: {
    marginTop: 22,
    width: width - 40, // 390px
    gap: 14,
  },
  inputContainer: {
    backgroundColor: '#efefef',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#000000',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 0,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#42ac36',
  },
  loginButton: {
    backgroundColor: '#42ac36',
    height: 60,
    width: width - 40, // 390px
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#FFFFFF',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  legalContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  legalText: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 10,
    color: '#000000',
    textAlign: 'center',
  },
  legalLink: {
    color: '#42ac36',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEFEF',
    height: 60,
    width: width - 40,
    borderRadius: 15,
    marginTop: 12,
    gap: 12,
  },
  biometricButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#42ac36',
  },
});

export default LoginScreen;
