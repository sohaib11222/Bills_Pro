import React from 'react';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import RootNavigator from './RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Manrope-Thin': require('./assets/fonts/manrope-thin.otf'),
    'Manrope-Light': require('./assets/fonts/manrope-light.otf'),
    'Manrope-Regular': require('./assets/fonts/manrope-regular.otf'),
    'Manrope-Medium': require('./assets/fonts/manrope-medium.otf'),
    'Manrope-SemiBold': require('./assets/fonts/manrope-semibold.otf'),
    'Manrope-Bold': require('./assets/fonts/manrope-bold.otf'),
    'Manrope-ExtraBold': require('./assets/fonts/manrope-extrabold.otf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#42AC36" />
      </View>
    );
  }

  return <RootNavigator />;
}
