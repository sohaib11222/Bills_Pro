import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateCardScreen1 = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const steps = [
    'Once you create a virtual card, you need to fund the card',
    'You will be charged a non - refundable card creation fee of $3',
    'Shop, pay and subscribe online with your card',
    'You cannot use the card for betting, crypto and money transfer',
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Section with Background */}
      <ImageBackground
        source={require('../../assets/Frame 251.png')}
        style={styles.topBackground}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Create Card</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
      </ImageBackground>

      {/* Bottom White Section */}
      <View style={styles.bottomSection}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedText style={styles.sectionTitle}>How a virtual Card Works</ThemedText>

          {/* Steps Container */}
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <ImageBackground
                key={index}
                source={require('../../assets/Subtract.png')}
                style={styles.stepItem}
                resizeMode="stretch"
              >
                <View style={styles.stepNumberCircle}>
                  <ThemedText style={styles.stepNumber}>{index + 1}</ThemedText>
                </View>
                <ThemedText style={styles.stepText}>{step}</ThemedText>
              </ImageBackground>
            ))}
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <ThemedText style={styles.termsText}>
              I agree to the <ThemedText style={styles.termsLink}>terms</ThemedText> and{' '}
              <ThemedText style={styles.termsLink}>conditions</ThemedText>
            </ThemedText>
          </TouchableOpacity>

          {/* Proceed Button */}
          <TouchableOpacity
            style={[
              styles.proceedButton,
              !agreedToTerms && styles.proceedButtonDisabled,
            ]}
            onPress={() => {
              if (agreedToTerms) {
                navigation.navigate('CreateCard2');
              }
            }}
            activeOpacity={0.8}
            disabled={!agreedToTerms}
          >
            <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBackground: {
    width,
    height: height * 0.6,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  primaryCard: {
    width: width - 80,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#D6F5D9',
    padding: 20,
    transform: [{ rotate: '-5deg' }, { translateY: -20 }],
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryCard: {
    width: width - 80,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#1B800F',
    padding: 20,
    position: 'absolute',
    transform: [{ rotate: '5deg' }, { translateY: 20 }],
    zIndex: 1,
    opacity: 0.9,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
  },
  cardLeftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  cardLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1B800F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardRightSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 16,
  },
  cardBrandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B800F',
    marginTop: 8,
  },
  cardBrandNameSecondary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  cardTagline: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cardMastercardLogo: {
    width: 40,
    height: 24,
    marginTop: 8,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -70,
    paddingTop: 30,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#42AC36',
    marginBottom: 20,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    minHeight: 60,
  },
  stepNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#42AC36',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#42AC36',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#42AC36',
  },
  termsText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  termsLink: {
    color: '#42AC36',
    fontWeight: '600',
  },
  proceedButton: {
    backgroundColor: '#42AC36',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  proceedButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  proceedButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});

export default CreateCardScreen1;

