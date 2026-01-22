import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useVerifyEmailOtp, useResendOtp } from '../../mutations/authMutations';
import { useAuth } from '../../services/context/AuthContext';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type VerifyScreenRouteProp = RouteProp<AuthStackParamList, 'Verify'>;

const { width, height } = Dimensions.get('window');

const VerifyScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VerifyScreenRouteProp>();
  const email = route.params?.email || '';
  const [code, setCode] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const verifyMutation = useVerifyEmailOtp();
  const resendMutation = useResendOtp();
  const { checkAuth } = useAuth();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
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
      const result = await verifyMutation.mutateAsync({
        email: email,
        otp: otp,
      });

      if (result.success) {
        // Refresh auth state
        await checkAuth();
        // Navigate to KYC screen after successful verification
        navigation.navigate('KYC');
      } else {
        Alert.alert('Verification Failed', result.message || 'Invalid OTP. Please try again.');
        // Clear the code on error
        setCode(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error?.message || error?.data?.message || 'Invalid or expired OTP. Please try again.'
      );
      // Clear the code on error
      setCode(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
        // Reset timer
        setTimeLeft(59);
        // Clear code
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
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Section */}
      <View style={styles.backgroundContainer}>
        <Image 
          source={require('../../assets/auth_background.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* White Card */}
      <View style={styles.card}>
        {/* Title */}
        <ThemedText weight='semibold' style={styles.title}>Verify</ThemedText>
        
        {/* Subtitle */}
        <ThemedText style={styles.subtitle}>
          A 5-digit code has been sent to {email ? email : 'your email'}
        </ThemedText>

        {/* Code Input Fields */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
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

        {/* Proceed Button */}
        <TouchableOpacity 
          style={[styles.proceedButton, verifyMutation.isPending && styles.proceedButtonDisabled]}
          onPress={handleVerify}
          disabled={verifyMutation.isPending || code.join('').length !== 5}
        >
          {verifyMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.proceedButtonText}>Verify</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    height: height * 0.707, // ~659px
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: -17,
    left: -13,
    width: width * 1.06, // ~456px
    height: height * 0.716, // ~667px
  },
  backButton: {
    position: 'absolute',
    top: 65,
    left: 21,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.40, // ~335px
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 22,
    marginBottom: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40, // 390px
    marginBottom: 22,
    gap: 7,
  },
  codeInput: {
    backgroundColor: '#efefef',
    width: 70,
    height: 60,
    borderRadius: 15,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000000',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#000000',
    marginBottom: 22,
  },
  timerText: {
    color: '#42ac36',
  },
  proceedButton: {
    backgroundColor: '#42ac36',
    height: 60,
    width: width - 40, // 390px
    borderRadius: 100,
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
  resendButton: {
    marginBottom: 22,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#42ac36',
  },
});

export default VerifyScreen;

