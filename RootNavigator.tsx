import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingNavigator from './navigators/OnboardingNavigator';
import AuthNavigator from './navigators/AuthNavigator';
import MainNavigator from './navigators/MainNavigator';
import BillPaymentsScreen from './screens/billpayments/BillPaymentsScreen';
import FundCardScreen from './screens/virtualcardscreens/FundCardScreen';
import WithdrawCardScreen from './screens/virtualcardscreens/WithdrawCardScreen';
import CreateCardScreen1 from './screens/virtualcardscreens/CreateCardScreen1';
import CreateCardScreen2 from './screens/virtualcardscreens/CreateCardScreen2';
import TransactionHistoryScreen from './screens/virtualcardscreens/TransactionHistoryScreen';
import AllTransactionsScreen from './screens/transactionscreens/AllTransactionsScreen';
import CryptoWalletScreen from './screens/walletscreens/CryptoWalletScreen';
import SelectCryptoScreen from './screens/walletscreens/SelectCryptoScreen';
import SendCryptoScreen from './screens/walletscreens/SendCryptoScreen';
import SellCryptoScreen from './screens/walletscreens/SellCryptoScreen';
import BuyCryptoScreen from './screens/walletscreens/BuyCryptoScreen';
import ReceiveCryptoScreen from './screens/walletscreens/ReceiveCryptoScreen';
import EditProfileScreen from './screens/profilescreens/EditProfileScreen';
import VerificationScreen from './screens/profilescreens/VerificationScreen';
import WithdrawalAccountsScreen from './screens/profilescreens/WithdrawalAccountsScreen';
import AddNewAccountScreen from './screens/profilescreens/AddNewAccountScreen';
import SecuritySettingsScreen from './screens/profilescreens/changepasswordscreens/SecuritySettingsScreen';
import ResetPasswordScreen from './screens/profilescreens/changepasswordscreens/ResetPasswordScreen';
import ResetPasswordCodeScreen from './screens/profilescreens/changepasswordscreens/ResetPasswordCodeScreen';
import NewPasswordScreen from './screens/profilescreens/changepasswordscreens/NewPasswordScreen';
import TransactionPinScreen from './screens/profilescreens/changepasswordscreens/TransactionPinScreen';
import Setup2FAScreen from './screens/profilescreens/changepasswordscreens/Setup2FAScreen';
import SupportScreen from './screens/profilescreens/supportscreens/SupportScreen';
import LiveChatScreen from './screens/profilescreens/supportscreens/LiveChatScreen';
import ChatDetailsScreen from './screens/profilescreens/supportscreens/ChatDetailsScreen';
import NotificationSettingsScreen from './screens/profilescreens/NotificationSettingsScreen';
import DepositFundsScreen from './screens/depositscreens/DepositFundsScreen';
import DepositAccountScreen from './screens/depositscreens/DepositAccountScreen';
import WithdrawFundsScreen from './screens/depositscreens/WithdrawFundsScreen';
import AirtimeRechargeScreen from './screens/billpayments/AirtimeRechargeScreen';
import DataRechargeScreen from './screens/billpayments/DataRechargeScreen';
import InternetSubscriptionScreen from './screens/billpayments/InternetSubscriptionScreen';
import BettingScreen from './screens/billpayments/BettingScreen';
import CableTVScreen from './screens/billpayments/CableTVScreen';
import ElectricityScreen from './screens/billpayments/ElectricityScreen';
import NotificationsScreen from './screens/main/NotificationsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  BillPayments: undefined;
  FundCard: undefined;
  WithdrawCard: undefined;
  CreateCard1: undefined;
  CreateCard2: undefined;
  TransactionHistory: { 
    type?: 'funding' | 'withdrawal' | 'deposit' | 'withdraw' | 'bill_payment' | 'creation' | 'crypto' | 'virtual_card';
    transactionData?: any;
  };
  AllTransactions: undefined;
  CryptoWallet: {
    cryptoType: string;
    balance: string;
    usdValue: string;
    icon: any;
    iconBackground: string;
  };
  SelectCrypto: { mode?: 'send' | 'sell' | 'buy' | 'receive' };
  SendCrypto: {
    cryptoType: string;
    balance: string;
    usdValue: string;
    icon: any;
    iconBackground: string;
  };
  SellCrypto: {
    cryptoType: string;
    balance: string;
    usdValue: string;
    icon: any;
    iconBackground: string;
  };
  BuyCrypto: {
    cryptoType: string;
    balance: string;
    usdValue: string;
    icon: any;
    iconBackground: string;
  };
  ReceiveCrypto: {
    cryptoType: string;
    balance?: string;
    usdValue?: string;
    icon: any;
    iconBackground: string;
  };
  EditProfile: undefined;
  Verification: undefined;
  WithdrawalAccounts: undefined;
  AddNewAccount: undefined;
  SecuritySettings: undefined;
  ResetPassword: undefined;
  ResetPasswordCode: { email: string };
  NewPassword: undefined;
  TransactionPin: undefined;
  Setup2FA: undefined;
  Support: undefined;
  LiveChat: undefined;
  ChatDetails: { chatId?: string };
  NotificationSettings: undefined;
  DepositFunds: undefined;
  DepositAccount: { amount: string };
  WithdrawFunds: undefined;
  AirtimeRecharge: undefined;
  DataRecharge: undefined;
  InternetSubscription: undefined;
  Betting: undefined;
  CableTV: undefined;
  Electricity: undefined;
  Notifications: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const isSignedIn = false; // TODO: wire this to real auth state
  const hasSeenOnboarding = false; // TODO: wire this to AsyncStorage or similar

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={hasSeenOnboarding ? (isSignedIn ? 'Main' : 'Auth') : 'Onboarding'}
      >
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Main" component={MainNavigator} />
        <RootStack.Screen name="BillPayments" component={BillPaymentsScreen} />
        <RootStack.Screen name="FundCard" component={FundCardScreen} />
        <RootStack.Screen name="WithdrawCard" component={WithdrawCardScreen} />
        <RootStack.Screen name="CreateCard1" component={CreateCardScreen1} />
        <RootStack.Screen name="CreateCard2" component={CreateCardScreen2} />
        <RootStack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <RootStack.Screen name="AllTransactions" component={AllTransactionsScreen} />
        <RootStack.Screen name="CryptoWallet" component={CryptoWalletScreen} />
        <RootStack.Screen name="SelectCrypto" component={SelectCryptoScreen} />
        <RootStack.Screen name="SendCrypto" component={SendCryptoScreen} />
        <RootStack.Screen name="SellCrypto" component={SellCryptoScreen} />
        <RootStack.Screen name="BuyCrypto" component={BuyCryptoScreen} />
        <RootStack.Screen name="ReceiveCrypto" component={ReceiveCryptoScreen} />
        <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
        <RootStack.Screen name="Verification" component={VerificationScreen} />
        <RootStack.Screen name="WithdrawalAccounts" component={WithdrawalAccountsScreen} />
        <RootStack.Screen name="AddNewAccount" component={AddNewAccountScreen} />
        <RootStack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
        <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <RootStack.Screen name="ResetPasswordCode" component={ResetPasswordCodeScreen} />
        <RootStack.Screen name="NewPassword" component={NewPasswordScreen} />
        <RootStack.Screen name="TransactionPin" component={TransactionPinScreen} />
        <RootStack.Screen name="Setup2FA" component={Setup2FAScreen} />
        <RootStack.Screen name="Support" component={SupportScreen} />
        <RootStack.Screen name="LiveChat" component={LiveChatScreen} />
        <RootStack.Screen name="ChatDetails" component={ChatDetailsScreen} />
        <RootStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <RootStack.Screen name="DepositFunds" component={DepositFundsScreen} />
        <RootStack.Screen name="DepositAccount" component={DepositAccountScreen} />
        <RootStack.Screen name="WithdrawFunds" component={WithdrawFundsScreen} />
        <RootStack.Screen name="AirtimeRecharge" component={AirtimeRechargeScreen} />
        <RootStack.Screen name="DataRecharge" component={DataRechargeScreen} />
        <RootStack.Screen name="InternetSubscription" component={InternetSubscriptionScreen} />
        <RootStack.Screen name="Betting" component={BettingScreen} />
        <RootStack.Screen name="CableTV" component={CableTVScreen} />
        <RootStack.Screen name="Electricity" component={ElectricityScreen} />
        <RootStack.Screen name="Notifications" component={NotificationsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

