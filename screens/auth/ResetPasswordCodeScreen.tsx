import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useVerifyPasswordResetOtp, useResendOtp } from '../../mutations/authMutations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type ResetPasswordCodeRouteProp = RouteProp<AuthStackParamList, 'ResetPasswordCode'>;

const { width, height } = Dimensions.get('window');

const ResetPasswordCodeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResetPasswordCodeRouteProp>();
  const email = route.params?.email || '';
  const [code, setCode] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const verifyOtpMutation = useVerifyPasswordResetOtp();
  const resendMutation = useResendOtp();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otp = code.join('');
    
    if (otp.length !== 5) {
      Alert.alert('Error', 'Please enter the complete 5-digit code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address is required');
      return;
    }

    try {
      console.log('🔵 Verify Password Reset OTP - Request Data:', { email, otp });
      const result = await verifyOtpMutation.mutateAsync({
        email: email,
        otp: otp,
      });

      console.log('🟢 Verify Password Reset OTP - API Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        // Navigate to new password screen with email and OTP
        navigation.navigate('NewPassword', { email: email, otp: otp });
      } else {
        Alert.alert('Verification Failed', result.message || 'Invalid OTP. Please try again.');
        setCode(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.log('❌ Verify Password Reset OTP - Error:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Verification Failed',
        error?.message || error?.data?.message || 'Invalid or expired OTP. Please try again.'
      );
      setCode(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      Alert.alert('Please Wait', `You can resend code in ${timeLeft} seconds`);
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address is required');
      return;
    }

    setIsResending(true);
    try {
      const result = await resendMutation.mutateAsync({
        email: email,
        type: 'email',
      });

      if (result.success) {
        Alert.alert('Success', 'OTP has been resent to your email');
        setTimeLeft(59);
        setCode(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || error?.data?.message || 'Failed to resend OTP. Please try again.'
      );
    } finally {
      setIsResending(false);
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
          <ThemedText style={styles.subtitle}>
            Enter the 5-digit code sent to {email ? email : 'your email'}
          </ThemedText>

          {/* Code Inputs */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Timer/Button */}
          <View style={styles.resendSection}>
            {timeLeft > 0 ? (
              <ThemedText style={styles.resendText}>
                You can resend code in{' '}
                <ThemedText style={styles.timerText}>00:{String(timeLeft).padStart(2, '0')} sec</ThemedText>
              </ThemedText>
            ) : (
              <TouchableOpacity 
                onPress={handleResendOtp}
                disabled={isResending || resendMutation.isPending}
                style={styles.resendButton}
              >
                {isResending || resendMutation.isPending ? (
                  <ActivityIndicator size="small" color="#42ac36" />
                ) : (
                  <ThemedText style={styles.resendButtonText}>Resend Code</ThemedText>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Proceed Button - Fixed at bottom */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.proceedButton, (verifyOtpMutation.isPending || code.join('').length !== 5) && styles.proceedButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={verifyOtpMutation.isPending || code.join('').length !== 5}
          >
            {verifyOtpMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.proceedButtonText}>Verify</ThemedText>
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
    maxHeight: height * 0.55,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  cardContent: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  resendSection: {
    marginBottom: 20,
    alignItems: 'center',
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    marginBottom: 22,
  },
  codeInput: {
    backgroundColor: '#EFEFEF',
    width: 70,
    height: 60,
    borderRadius: 15,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000000',
  },
  buttonWrapper: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 10,
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
  resendText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#000000',
    textAlign: 'center',
  },
  timerText: {
    color: '#42ac36',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#42ac36',
  },
});

export default ResetPasswordCodeScreen;


