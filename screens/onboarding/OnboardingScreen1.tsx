import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigators/OnboardingNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { StatusBar } from 'expo-status-bar';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

const { width, height } = Dimensions.get('window');

const OnboardingScreen1 = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
       <StatusBar style="light" />
      <Image 
        source={require('../../assets/onboarding_background.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Green Box - Behind Phone */}
      <View style={styles.greenBoxContainer}>
        <Image 
          source={require('../../assets/onboarding_1.png')} 
          style={styles.greenBox}
          resizeMode="contain"
        />
      </View>

      {/* Phone Image - In Front */}
      <View style={styles.phoneContainer}>
        <Image 
          source={require('../../assets/onboading1.png')} 
          style={styles.phoneImage}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title} >Pay Bills Quickly</ThemedText>
        <ThemedText style={styles.title} >and Easily</ThemedText>
      </View>

      {/* Subtitle */}
      <ThemedText style={styles.subtitle}>
        Pat all form of bills from airtime recharge, data{'\n'}recharge , cable tv and many more
      </ThemedText>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => navigation.navigate('Onboarding3')}
        >
          <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => navigation.navigate('Onboarding2')}
        >
          <ThemedText style={styles.nextButtonText}>Next</ThemedText>
          <View style={styles.circleContainer}>
            <View style={styles.circle}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#072d03',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  greenBoxContainer: {
    position: 'absolute',
    top: height * 0.353, // ~329px
    left: width / 2,
    width: width * 0.886, // ~381px
    height: height * 0.197, // ~184px
    transform: [{ translateX: -width * 0.443 }],
    zIndex: 1,
  },
  greenBox: {
    width: '100%',
    height: '100%',
  },
  phoneContainer: {
    position: 'absolute',
    top: height * 0.099, // ~92px
    left: -14,
    width: width * 0.749, // ~322px
    height: height * 0.452, // ~421px
    zIndex: 2,
  },
  phoneImage: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    position: 'absolute',
    top: height * 0.614, // ~572px
    left: width / 2,
    alignItems: 'center',
    width: width * 0.95,
    transform: [{ translateX: -width * 0.475 }],
  },
  title: {
    fontSize: width * 0.116, // ~50px on 430px
    fontWeight: '700',
    lineHeight: width * 0.14, // ~60px
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily:"Manrope",
  },
  subtitle: {
    position: 'absolute',
    top: height * 0.767, // ~715px
    left: width / 2,
    width: width * 0.965, // ~415px
    fontSize: width * 0.037, // ~16px
    fontWeight: '400',
    lineHeight: width * 0.051, // ~22px
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    transform: [{ translateX: -width * 0.4825 }],
  },
  paginationContainer: {
    position: 'absolute',
    top: height * 0.832, // ~775px
    left: width * 0.4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
  },
  dotActive: {
    backgroundColor: '#42ac36',
    width: 24,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: height * 0.056, // ~52px
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    paddingHorizontal: 20, // ~43px
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    height: 60,
    width: width * 0.24, // ~103px
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#42ac36',
    height: 60,
    width: width * 0.64, // ~275px
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: '#FFFFFF',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -14 }],
  },
  circleContainer: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 51,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 51,
    height: 51,
    borderRadius: 25.5,
    backgroundColor: '#1B800F', // rgba(27, 128, 15, 1) - darker green
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen1;

