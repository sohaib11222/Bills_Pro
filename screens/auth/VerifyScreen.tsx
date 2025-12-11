import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const { width, height } = Dimensions.get('window');

const VerifyScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [code, setCode] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);
  const inputRefs = useRef<(TextInput | null)[]>([]);

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
        <ThemedText style={styles.subtitle}>A 5-digit code has been sent to your email</ThemedText>

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

        {/* Resend Timer */}
        <ThemedText style={styles.resendText}>
          You can resend code in{' '}
          <ThemedText style={styles.timerText}>00:{String(timeLeft).padStart(2, '0')} sec</ThemedText>
        </ThemedText>

        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={() => navigation.navigate('KYC')}
        >
          <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
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
});

export default VerifyScreen;

