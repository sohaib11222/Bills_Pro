import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useForgotPassword } from '../../mutations/authMutations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const { width, height } = Dimensions.get('window');

const ResetPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      console.log('🔵 Forgot Password - Request Data:', { email: email.trim() });
      const result = await forgotPasswordMutation.mutateAsync({
        email: email.trim(),
      });

      console.log('🟢 Forgot Password - API Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        // Navigate to reset password code screen with email
        navigation.navigate('ResetPasswordCode', { email: email.trim() });
      } else {
        Alert.alert('Error', result.message || 'Failed to send reset code. Please try again.');
      }
    } catch (error: any) {
      console.log('❌ Forgot Password - Error:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error',
        error?.message || error?.data?.message || 'Failed to send reset code. Please try again.'
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
          <ThemedText style={styles.title}>Reset Password</ThemedText>

          {/* Subtitle */}
          <ThemedText style={styles.subtitle}>Input your registered email</ThemedText>

          {/* Email Input */}
          <View style={styles.formContainer}>
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
          </View>
        </ScrollView>

        {/* Proceed Button - Fixed at bottom */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.proceedButton, (!email.trim() || forgotPasswordMutation.isPending) && styles.proceedButtonDisabled]}
            onPress={handleForgotPassword}
            disabled={!email.trim() || forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
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
    maxHeight: height * 0.5,
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
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#000000',
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

export default ResetPasswordScreen;


