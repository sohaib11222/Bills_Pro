import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import VirtualCardsScreen from '../screens/main/VirtualCardsScreen';
import TransactionsScreen from '../screens/transactionscreens/TransactionsScreen';
import WalletsScreen from '../screens/walletscreens/WalletsScreen';

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Cards: undefined;
  Wallets: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const iconMap: Record<keyof MainTabParamList, any> = {
  Home: require('../assets/home-04.png'),
  Transactions: require('../assets/transaction-history.png'),
  Cards: require('../assets/credit-card.png'),
  Wallets: require('../assets/wallet-3.png'),
  Settings: require('../assets/settings-03.png'),
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          // borderTopLeftRadius: 30,
          // borderTopRightRadius: 30,
          position: 'absolute',
          left: 0,
          right: 0,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop:17,
          bottom: 0,
          backgroundColor: '#F5F5F5',
          borderTopWidth: 0,
          elevation: 8,
        },
        tabBarIcon: ({ focused }) => {
          const source = iconMap[route.name as keyof MainTabParamList];
          return (
            <View
              style={[
                styles.tabIconWrapper,
                focused && styles.tabIconWrapperActive,
              ]}
            >
              <Image
                source={source}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? '#FFFFFF' : '#4A4A4A' },
                ]}
                resizeMode="contain"
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Cards" component={VirtualCardsScreen} />
      <Tab.Screen name="Wallets" component={WalletsScreen} />
      <Tab.Screen name="Settings" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  tabIconWrapperActive: {
    backgroundColor: '#1B800F',
  },
  tabIcon: {
    width: 22,
    height: 22,
  },
});

export default MainNavigator;

