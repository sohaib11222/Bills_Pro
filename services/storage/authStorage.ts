import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@billspro_auth_token';
const USER_DATA_KEY = '@billspro_user_data';
const PIN_STATUS_KEY = '@billspro_pin_status';
const LAST_LOGIN_EMAIL_KEY = '@billspro_last_login_email';

// Auth Token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// User Data
export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const setUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

// PIN Status
export const getPinStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(PIN_STATUS_KEY);
    return status === 'true';
  } catch (error) {
    console.error('Error getting PIN status:', error);
    return false;
  }
};

export const setPinStatus = async (hasPin: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(PIN_STATUS_KEY, hasPin.toString());
  } catch (error) {
    console.error('Error setting PIN status:', error);
  }
};

// Last Login Email (for biometric login)
export const getLastLoginEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_LOGIN_EMAIL_KEY);
  } catch (error) {
    console.error('Error getting last login email:', error);
    return null;
  }
};

export const setLastLoginEmail = async (email: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_LOGIN_EMAIL_KEY, email);
  } catch (error) {
    console.error('Error setting last login email:', error);
  }
};

export const removeLastLoginEmail = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LAST_LOGIN_EMAIL_KEY);
  } catch (error) {
    console.error('Error removing last login email:', error);
  }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, PIN_STATUS_KEY, LAST_LOGIN_EMAIL_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
