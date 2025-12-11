import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import ThemedText from '../../components/ThemedText';

type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type NavigationProp = CompositeNavigationProp<AuthNavigationProp, RootNavigationProp>;

const { width, height } = Dimensions.get('window');

const NewPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProceed = () => {
    if (password && password === confirmPassword) {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate('Auth');
      } else {
        navigation.navigate('Login');
      }
    } else {
      alert('Passwords do not match');
    }
  };

  return (
    <View style={styles.container}>
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

        {/* Proceed Button */}
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
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
    height: height * 0.40,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
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
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
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
});

export default NewPasswordScreen;


