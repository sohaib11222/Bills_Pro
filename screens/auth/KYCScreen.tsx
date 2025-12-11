import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigators/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const { width, height } = Dimensions.get('window');

const KYCScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');

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
        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => {
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate('Main');
            }
          }}
        >
          <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
        </TouchableOpacity>

        {/* Title */}
        <ThemedText weight='semibold' style={styles.title}>KYC</ThemedText>
        
        {/* Subtitle */}
        <ThemedText style={styles.subtitle}>Verify your account by completing your KYC</ThemedText>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* First Name Input */}
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.label}>First name</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
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

          {/* Date of Birth Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Date of birth"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
            <Ionicons name="calendar-outline" size={20} color="rgba(0, 0, 0, 0.5)" style={styles.icon} />
          </View>

          {/* BVN Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="BVN Number"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={bvn}
              onChangeText={setBvn}
              keyboardType="number-pad"
            />
          </View>

          {/* NIN Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="NIN Number"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={nin}
              onChangeText={setNin}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={() => navigation.navigate('PinSetup')}
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
    height: height * 0.602, // ~561px
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: -17,
    left: -13,
    width: width * 1.06, // ~456px
    height: height * 0.64, // ~597px
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
    height: height * 0.783, // ~730px
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 46,
    right: 20,
    backgroundColor: '#1B800F',
    height: 50,
    width: 104,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 10,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 12,
    marginBottom: 22,
  },
  formContainer: {
    width: width - 40, // 390px
    gap: 14,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#42ac36',
    marginBottom: 4,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#EFEFEF',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#000000',
    flex: 1,
  },
  icon: {
    marginLeft: 8,
  },
  proceedButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#42ac36',
    height: 60,
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

export default KYCScreen;

