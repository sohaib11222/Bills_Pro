import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import ThemedText from '../../components/ThemedText';
import { useResetPassword } from '../../mutations/authMutations';

type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type NavigationProp = CompositeNavigationProp<AuthNavigationProp, RootNavigationProp>;
type NewPasswordRouteProp = RouteProp<AuthStackParamList, 'NewPassword'>;

const { width, height } = Dimensions.get('window');

const NewPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<NewPasswordRouteProp>();
  const email = route.params?.email || '';
  const otp = route.params?.otp || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const handleProceed = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (!email || !otp) {
      Alert.alert('Error', 'Missing email or OTP. Please start the reset process again.');
      navigation.navigate('ResetPassword');
      return;
    }

    try {
      console.log('🔵 Reset Password - Request Data:', { email, otp, password: '***' });
      const result = await resetPasswordMutation.mutateAsync({
        email: email,
        otp: otp,
        password: password,
        password_confirmation: confirmPassword,
      });

      console.log('🟢 Reset Password - API Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        // Navigate to Login screen immediately
        // Reset the navigation stack to Login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        
        // Show success message after navigation completes
        setTimeout(() => {
          Alert.alert('Success', 'Password changed successfully. Please login with your new password.');
        }, 500);
      } else {
        Alert.alert('Reset Failed', result.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.log('❌ Reset Password - Error:', JSON.stringify(error, null, 2));
      
      if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).flat().join('\n');
        Alert.alert('Reset Failed', errorMessages);
      } else {
        Alert.alert(
          'Reset Failed',
          error?.message || error?.data?.message || 'Failed to reset password. Please try again.'
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="light" />

      {/* Background */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../../assets/auth_background.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* White Card */}
      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <ThemedText style={styles.title}>New Password</ThemedText>

          {/* Subtitle */}
          <ThemedText style={styles.subtitle}>Enter your new password</ThemedText>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* New Password */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="New Password"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(0, 0, 0, 0.5)"
                />
              </TouchableOpacity>
            </View>

            {/* Reenter Password */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Reenter Password"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(0, 0, 0, 0.5)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Proceed Button - Fixed at bottom */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={[styles.proceedButton, (!password.trim() || !confirmPassword.trim() || password !== confirmPassword || resetPasswordMutation.isPending) && styles.proceedButtonDisabled]}
            onPress={handleProceed}
            disabled={!password.trim() || !confirmPassword.trim() || password !== confirmPassword || resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
            )}
          </TouchableOpacity>
        </View>
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
    width,
    height,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  },
  backButton: {
    position: 'absolute',
    top: 65,
    left: 21,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.6,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  cardContent: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  buttonWrapper: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 12,
    marginBottom: 22,
  },
  formContainer: {
    width: width - 40,
  },
  inputContainer: {
    backgroundColor: '#EFEFEF',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#000000',
  },
  eyeIcon: {
    padding: 5,
    marginLeft: 8,
  },
  proceedButton: {
    width: '100%',
    height: 60,
    borderRadius: 100,
    backgroundColor: '#42AC36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#FFFFFF',
  },
  proceedButtonDisabled: {
    opacity: 0.6,
  },
});

export default NewPasswordScreen;


