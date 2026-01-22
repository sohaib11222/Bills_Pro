import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Linking, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useRegister } from '../../mutations/authMutations';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return false;
    }

    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter a password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: password,
        phone_number: phoneNumber.trim() || undefined,
        country_code: 'NG', // Default to Nigeria, can be made dynamic
      });

      if (result.success) {
        // Navigate to verify screen with email
        navigation.navigate('Verify', { email: email.trim() });
      } else {
        Alert.alert('Registration Failed', result.message || 'An error occurred during registration. Please try again.');
      }
    } catch (error: any) {
      // Handle validation errors from backend
      if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).flat().join('\n');
        Alert.alert('Registration Failed', errorMessages);
      } else {
        Alert.alert(
          'Registration Failed',
          error?.message || error?.data?.message || 'An error occurred. Please try again.'
        );
      }
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
      </View>

      {/* White Card */}
      <View style={styles.card}>
        {/* Login Button */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <ThemedText style={styles.loginButtonText}>Login</ThemedText>
        </TouchableOpacity>

        {/* Title */}
        <ThemedText weight='semibold' style={styles.title}>Register</ThemedText>
        
        {/* Subtitle */}
        <ThemedText style={styles.subtitle}>Create your free account</ThemedText>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* First Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

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

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
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
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="rgba(0, 0, 0, 0.5)" 
              />
            </TouchableOpacity>
          </View>


          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, registerMutation.isPending && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.registerButtonText}>Register</ThemedText>
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
    height: height * 0.608, // ~561px
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
    height: height * 0.72, // ~652px
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  loginButton: {
    position: 'absolute',
    top: 46,
    right: 20,
    backgroundColor: '#1b800f',
    height: 50,
    width: 104,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
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
  },
  inputContainer: {
    backgroundColor: '#efefef',
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
    flex: 1,
  },
  verifyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 100,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginLeft: 8,
  },
  verifyButtonText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#000000',
  },
  eyeIcon: {
    padding: 5,
    marginLeft: 8,
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
  registerButton: {
    backgroundColor: '#42ac36',
    height: 60,
    width: width - 40, // 390px
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#FFFFFF',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  legalContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
    color: '#000000',
    textAlign: 'center',
  },
  legalLink: {
    color: '#42ac36',
  },
});

export default RegisterScreen;
