import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_SEEN_KEY = '@billspro_onboarding_seen';
const PROFILE_IMAGE_KEY = '@billspro_profile_image';

// Onboarding status
export const getOnboardingSeen = async (): Promise<boolean> => {
  try {
    const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
    return seen === 'true';
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};

export const setOnboardingSeen = async (seen: boolean = true): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, seen.toString());
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
};

// Profile Image Storage
export const getProfileImage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
  } catch (error) {
    console.error('Error getting profile image:', error);
    return null;
  }
};

export const setProfileImage = async (imageUri: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
  } catch (error) {
    console.error('Error setting profile image:', error);
  }
};

export const removeProfileImage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
  } catch (error) {
    console.error('Error removing profile image:', error);
  }
};
