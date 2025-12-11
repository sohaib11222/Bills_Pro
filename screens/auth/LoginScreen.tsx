import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import ThemedText from '../../components/ThemedText';

type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type NavigationProp = CompositeNavigationProp<AuthNavigationProp, RootNavigationProp>;

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        {/* Register Button */}
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <ThemedText style={styles.registerButtonText}>Register</ThemedText>
        </TouchableOpacity>

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
            style={styles.loginButton}
            onPress={() => navigation.navigate('Main')}
          >
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
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
    height: height * 0.485, // ~452px
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
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
    lineHeight: 10,
    color: '#000000',
    textAlign: 'center',
  },
  legalLink: {
    color: '#42ac36',
  },
});

export default LoginScreen;
