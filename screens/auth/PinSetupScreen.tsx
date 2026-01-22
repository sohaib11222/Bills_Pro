import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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

const PinSetupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [pin, setPin] = useState('');

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleNext = () => {
    if (pin.length === 4) {
      // Navigate to Re-Enter Pin screen
      navigation.navigate('ReEnterPin', { initialPin: pin });
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
        <ThemedText weight='semibold' style={styles.title}>Setup Pin</ThemedText>
        
        {/* Subtitle */}
        <ThemedText style={styles.subtitle}>Setup your 4 digit pin to complete transactions</ThemedText>

        {/* Security Icon */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/security-safe.png')} 
            style={styles.securityIcon}
            resizeMode="contain"
          />
        </View>

        {/* PIN Input Fields */}
        <View style={styles.pinContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                pin.length > index && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        {/* Numpad */}
        <View style={styles.numpadContainer}>
          <View style={styles.numpadLeft}>
            <View style={styles.numpadRow}>
              {[1, 2, 3].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numButton}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.numpadRow}>
              {[4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numButton}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.numpadRow}>
              {[7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numButton}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.numpadRow}>
              <TouchableOpacity
                style={styles.numButton}
                onPress={() => {}}
              >
                <Ionicons name="finger-print" size={24} color="#42AC36" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.numButton}
                onPress={() => handleNumberPress('0')}
              >
                <ThemedText style={styles.numButtonText}>0</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.numButton}
                onPress={() => handleNumberPress('.')}
              >
                <ThemedText style={styles.numButtonText}>.</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.numpadRight}>
            <TouchableOpacity
              style={styles.backspaceButton}
              onPress={handleBackspace}
            >
              <Ionicons name="backspace-outline" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, pin.length !== 4 && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={pin.length !== 4}
            >
              <ThemedText style={styles.nextButtonText}>Next</ThemedText>
            </TouchableOpacity>
          </View>
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
    height: height * 0.85, // ~717px
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
    backgroundColor: '#1b800f',
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
    lineHeight: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 12,
    marginBottom: 22,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 22,
  },
  securityIcon: {
    width: 139,
    height: 139,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  pinDot: {
    width: 70,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#efefef',
    marginHorizontal: 5,
  },
  pinDotFilled: {
    backgroundColor: '#42ac36',
    borderColor: '#42ac36',
  },
  numpadContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 316,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 23,
  },
  numpadLeft: {
    flex: 1,
    maxWidth: 290,
  },
  numpadRight: {
    width: 90,
   marginLeft: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  numpadRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  numButton: {
    width: 90,
    height: 60,
    backgroundColor: '#efefef',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  numButtonText: {
    fontSize: 30,
    fontWeight: '400',
    color: '#000000',
  },
  backspaceButton: {
    width: 90,
    height: 60,
    backgroundColor: '#efefef',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButton: {
    width: 90,
    height: 200,
    backgroundColor: '#42AC36',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#FFFFFF',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
});

export default PinSetupScreen;

