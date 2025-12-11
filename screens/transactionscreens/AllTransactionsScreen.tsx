import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterType = 'All Transactions' | 'Bill Payments' | 'Crypto' | 'Virtual Cards';
type BillPaymentCategory = 'All' | 'Airtime' | 'Data' | 'Cable TV' | 'Electricity' | 'Internet' | 'Betting';
type CryptoCategory = 'All Transactions' | 'Receive' | 'Send' | 'Buy' | 'Sell';
type VirtualCardCategory = 'All Transactions' | 'Fund' | 'Withdraw' | 'Payments';

const AllTransactionsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [showAllTransactionsDropdown, setShowAllTransactionsDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showAllFilterDropdown, setShowAllFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All Transactions');
  const [selectedBillCategory, setSelectedBillCategory] = useState<BillPaymentCategory>('All');
  const [selectedCryptoCategory, setSelectedCryptoCategory] = useState<CryptoCategory>('All Transactions');
  const [selectedVirtualCardCategory, setSelectedVirtualCardCategory] = useState<VirtualCardCategory>('All Transactions');
  
  // Button refs and positions for dropdowns
  const allTransactionsButtonRef = useRef<View>(null);
  const dateFilterButtonRef = useRef<View>(null);
  const allFilterButtonRef = useRef<View>(null);
  
  const [allTransactionsButtonLayout, setAllTransactionsButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dateFilterButtonLayout, setDateFilterButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [allFilterButtonLayout, setAllFilterButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const allTransactions = [
    {
      id: '1',
      type: 'Funds Deposit',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
    },
    {
      id: '2',
      type: 'Funds Deposit',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
    },
    {
      id: '3',
      type: 'Funds Deposit',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
    },
    {
      id: '4',
      type: 'Funds Deposit',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
    },
    {
      id: '5',
      type: 'Funds Deposit',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
    },
    {
      id: '6',
      type: 'Funds Deposit',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
    },
    {
      id: '7',
      type: 'Funds Deposit',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
    },
    {
      id: '8',
      type: 'Funds Withdrawal',
      status: 'Successful',
      amount: '20,000',
      date: '05 Oct, 25 - 08:00 PM',
      isDeposit: false,
    },
    {
      id: '9',
      type: 'Airtime Recharge',
      status: 'Pending',
      amount: '20,000',
      date: '05 Oct, 25 - 08:00 PM',
      isDeposit: true,
      isPending: true,
    },
  ];

  const billPaymentTransactions = [
    {
      id: '1',
      type: 'Airtime Recharge',
      billerType: 'MTN',
      phoneNumber: '07033484845',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Airtime',
      iconSource: require('../../assets/airtime.png'),
    },
    {
      id: '2',
      type: 'Airtime Recharge',
      billerType: 'MTN',
      phoneNumber: '07033484845',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Airtime',
      iconSource: require('../../assets/airtime.png'),
    },
    {
      id: '3',
      type: 'Airtime Recharge',
      billerType: 'MTN',
      phoneNumber: '07033484845',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Airtime',
      iconSource: require('../../assets/airtime.png'),
    },
    {
      id: '4',
      type: 'Betting',
      billerType: 'Bet9ja',
      userID: '123466789988',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Betting',
      iconSource: require('../../assets/betting (2).png'),
    },
    {
      id: '5',
      type: 'Cable TV',
      billerType: 'DStv',
      decoderNumber: '123456789',
      planType: 'DStv Yanga',
      accountName: 'Qamardeen Abdulmalik',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Cable TV',
      iconSource: require('../../assets/cable (2).png'),
    },
    {
      id: '6',
      type: 'Data Recharge',
      billerType: 'MTN',
      phoneNumber: '07033484845',
      dataPlan: '1 GIG for 1 month',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Data',
      iconSource: require('../../assets/datarecharge.png'),
    },
    {
      id: '7',
      type: 'Data Recharge',
      billerType: 'MTN',
      phoneNumber: '07033484845',
      dataPlan: '1 GIG for 1 month',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Data',
      iconSource: require('../../assets/datarecharge.png'),
    },
    {
      id: '8',
      type: 'Data Recharge',
      billerType: 'MTN',
      phoneNumber: '07033484845',
      dataPlan: '1 GIG for 1 month',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Data',
      iconSource: require('../../assets/datarecharge.png'),
    },
    {
      id: '9',
      type: 'Electricity Recharge',
      billerType: 'Ikeja Electricity',
      meterNumber: '123466789988',
      accountType: 'Prepaid',
      accountName: 'Qamardeen Abdulmalik',
      token: '1234 - 4567 - 1245 - 12345',
      status: 'Pending',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      category: 'Electricity',
      iconSource: require('../../assets/electricity.png'),
      isPending: true,
    },
  ];

  const cryptoTransactions = [
    {
      id: '1',
      type: 'Crypto Deposit - BTC',
      cryptoType: 'Receive',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sent (1).png'),
    },
    {
      id: '2',
      type: 'Crypto Withdrawal - BTC',
      cryptoType: 'Send',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sent (2).png'),
    },
    {
      id: '3',
      type: 'Crypto Buy - BTC',
      cryptoType: 'Buy',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sell (2).png'),
    },
    {
      id: '4',
      type: 'Crypto Sell - BTC',
      cryptoType: 'Sell',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sell (1).png'),
    },
    {
      id: '5',
      type: 'Crypto Sell - BTC',
      cryptoType: 'Sell',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sell (1).png'),
    },
    {
      id: '6',
      type: 'Crypto Sell - BTC',
      cryptoType: 'Sell',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sell (1).png'),
    },
    {
      id: '7',
      type: 'Crypto Sell - BTC',
      cryptoType: 'Sell',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sell (1).png'),
    },
    {
      id: '8',
      type: 'Crypto Sell - BTC',
      cryptoType: 'Sell',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sell (1).png'),
    },
    {
      id: '9',
      type: 'Crypto Sell - BTC',
      cryptoType: 'Sell',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      cryptoAmount: '0.0023 BTC',
      network: 'Bitcoin',
      iconSource: require('../../assets/sell (1).png'),
    },
  ];

  const virtualCardTransactions = [
    {
      id: '1',
      type: 'Card Funding',
      virtualCardType: 'Fund',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      iconSource: require('../../assets/sent (1).png'),
    },
    {
      id: '2',
      type: 'Card Funding',
      virtualCardType: 'Fund',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      iconSource: require('../../assets/sent (1).png'),
    },
    {
      id: '3',
      type: 'Card Funding',
      virtualCardType: 'Fund',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      iconSource: require('../../assets/sent (1).png'),
    },
    {
      id: '4',
      type: 'Card Funding',
      virtualCardType: 'Fund',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      iconSource: require('../../assets/sent (1).png'),
    },
    {
      id: '5',
      type: 'Card Withdrawal',
      virtualCardType: 'Withdraw',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      iconSource: require('../../assets/sent (2).png'),
    },
    {
      id: '6',
      type: 'Card Withdrawal',
      virtualCardType: 'Withdraw',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      iconSource: require('../../assets/sent (2).png'),
    },
    {
      id: '7',
      type: 'Card Withdrawal',
      virtualCardType: 'Withdraw',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 06:00 PM',
      iconSource: require('../../assets/sent (2).png'),
    },
    {
      id: '8',
      type: 'Card Payment - Paypal',
      virtualCardType: 'Payments',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      paymentReason: 'Paypal',
      iconSource: require('../../assets/card.png'),
    },
    {
      id: '9',
      type: 'Card Payment - Paypal',
      virtualCardType: 'Payments',
      status: 'Successful',
      amount: '$5',
      date: '06 Oct, 25 - 08:00 PM',
      paymentReason: 'Paypal',
      iconSource: require('../../assets/card.png'),
    },
  ];

  // Filter transactions based on selected filter
  const getFilteredTransactions = () => {
    if (selectedFilter === 'Bill Payments') {
      let filtered = billPaymentTransactions;
      if (selectedBillCategory !== 'All') {
        filtered = filtered.filter(tx => {
          if (selectedBillCategory === 'Airtime') return tx.category === 'Airtime';
          if (selectedBillCategory === 'Data') return tx.category === 'Data';
          if (selectedBillCategory === 'Cable TV') return tx.category === 'Cable TV';
          if (selectedBillCategory === 'Electricity') return tx.category === 'Electricity';
          if (selectedBillCategory === 'Internet') return tx.category === 'Internet';
          if (selectedBillCategory === 'Betting') return tx.category === 'Betting';
          return true;
        });
      }
      return filtered;
    }
    if (selectedFilter === 'Crypto') {
      let filtered = cryptoTransactions;
      if (selectedCryptoCategory !== 'All Transactions') {
        filtered = filtered.filter(tx => {
          if (selectedCryptoCategory === 'Receive') return tx.cryptoType === 'Receive';
          if (selectedCryptoCategory === 'Send') return tx.cryptoType === 'Send';
          if (selectedCryptoCategory === 'Buy') return tx.cryptoType === 'Buy';
          if (selectedCryptoCategory === 'Sell') return tx.cryptoType === 'Sell';
          return true;
        });
      }
      return filtered;
    }
    if (selectedFilter === 'Virtual Cards') {
      let filtered = virtualCardTransactions;
      if (selectedVirtualCardCategory !== 'All Transactions') {
        filtered = filtered.filter(tx => {
          if (selectedVirtualCardCategory === 'Fund') return tx.virtualCardType === 'Fund';
          if (selectedVirtualCardCategory === 'Withdraw') return tx.virtualCardType === 'Withdraw';
          if (selectedVirtualCardCategory === 'Payments') return tx.virtualCardType === 'Payments';
          return true;
        });
      }
      return filtered;
    }
    return allTransactions;
  };

  const transactions = getFilteredTransactions();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Transactions</ThemedText>
        <TouchableOpacity
          ref={allTransactionsButtonRef}
          style={styles.filterButton}
          onPress={() => {
            allTransactionsButtonRef.current?.measure((fx: number, fy: number, fwidth: number, fheight: number, px: number, py: number) => {
              setAllTransactionsButtonLayout({ x: px, y: py, width: fwidth, height: fheight });
              setShowAllTransactionsDropdown(!showAllTransactionsDropdown);
            });
          }}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.filterButtonText}>{selectedFilter}</ThemedText>
          <Ionicons name="chevron-down" size={12} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Title */}
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <View style={styles.titleSection}>
          <ThemedText style={styles.mainTitle}>
            {selectedFilter === 'Bill Payments' ? 'Bill Payments' 
             : selectedFilter === 'Crypto' ? 'Crypto' 
             : selectedFilter === 'Virtual Cards' ? 'Virtual Card'
             : 'All Transactions'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {selectedFilter === 'Crypto' ? 'View all crypto transactions' 
             : selectedFilter === 'Virtual Cards' ? 'View all virtual card transactions'
             : 'View all naira transactions'}
          </ThemedText>
        </View>

        <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
          {/* All Filter (for Bill Payments, Crypto, and Virtual Cards) */}
          {(selectedFilter === 'Bill Payments' || selectedFilter === 'Crypto' || selectedFilter === 'Virtual Cards') && (
            <TouchableOpacity
              ref={allFilterButtonRef}
              style={styles.dateFilterButton}
              onPress={() => {
                allFilterButtonRef.current?.measure((fx: number, fy: number, fwidth: number, fheight: number, px: number, py: number) => {
                  setAllFilterButtonLayout({ x: px, y: py, width: fwidth, height: fheight });
                  setShowAllFilterDropdown(!showAllFilterDropdown);
                });
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dateFilterButtonText}>
                {selectedFilter === 'Crypto' ? selectedCryptoCategory 
                 : selectedFilter === 'Virtual Cards' ? selectedVirtualCardCategory
                 : 'All'}
              </ThemedText>
              <Ionicons name="chevron-down" size={12} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Date Filter */}
          <TouchableOpacity
            ref={dateFilterButtonRef}
            style={styles.dateFilterButton}
            onPress={() => {
              dateFilterButtonRef.current?.measure((fx: number, fy: number, fwidth: number, fheight: number, px: number, py: number) => {
                setDateFilterButtonLayout({ x: px, y: py, width: fwidth, height: fheight });
                setShowDateDropdown(!showDateDropdown);
              });
            }}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.dateFilterButtonText}>Date</ThemedText>
            <Ionicons name="chevron-down" size={12} color="#6B7280" />
          </TouchableOpacity>
        </View>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionList}>
          {transactions.map((transaction: any) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => {
                if (selectedFilter === 'Bill Payments') {
                  navigation.navigate('TransactionHistory', {
                    type: 'bill_payment',
                    transactionData: transaction,
                  });
                } else if (selectedFilter === 'Crypto') {
                  navigation.navigate('TransactionHistory', {
                    type: 'crypto',
                    transactionData: transaction,
                  });
                } else if (selectedFilter === 'Virtual Cards') {
                  navigation.navigate('TransactionHistory', {
                    type: 'virtual_card',
                    transactionData: transaction,
                  });
                } else {
                  navigation.navigate('TransactionHistory', {
                    type: transaction.isDeposit ? 'deposit' : 'withdraw',
                    transactionData: transaction,
                  });
                }
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.transactionIcon,
                  transaction.isPending && styles.transactionIconPending,
                ]}
              >
                {(selectedFilter === 'Bill Payments' || selectedFilter === 'Crypto' || selectedFilter === 'Virtual Cards') && (transaction as any).iconSource ? (
                  <Image
                    source={(transaction as any).iconSource}
                    style={(selectedFilter === 'Crypto' || selectedFilter === 'Virtual Cards') ? styles.transactionIconImage : styles.billPaymentIconImage}
                    resizeMode="contain"
                  />
                ) : transaction.type === 'Airtime Recharge' ? (
                  <View style={styles.mtnLogoContainer}>
                    <ThemedText style={styles.mtnLogoText}>MTN</ThemedText>
                  </View>
                ) : transaction.type === 'Funds Deposit' ? (
                  <Image
                    source={require('../../assets/sent (1).png')}
                    style={styles.transactionIconImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={require('../../assets/sent (2).png')}
                    style={styles.transactionIconImage}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View style={styles.transactionContent}>
                <ThemedText style={styles.transactionType}>{transaction.type}</ThemedText>
                <ThemedText
                  style={[
                    styles.transactionStatus,
                    transaction.isPending && styles.transactionStatusPending,
                  ]}
                >
                  {selectedFilter === 'Bill Payments' && transaction.phoneNumber
                    ? `${transaction.status} - ${transaction.phoneNumber}`
                    : selectedFilter === 'Bill Payments' && transaction.decoderNumber
                    ? `${transaction.status} - ${transaction.decoderNumber}`
                    : transaction.status}
                </ThemedText>
              </View>
              <View style={styles.transactionRight}>
                <ThemedText
                  style={[
                    styles.transactionAmount,
                    !transaction.isDeposit && styles.transactionAmountWithdrawal,
                  ]}
                >
                  {transaction.amount}
                </ThemedText>
                <ThemedText style={styles.transactionDate}>{transaction.date}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* All Transactions Dropdown */}
      {showAllTransactionsDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={() => setShowAllTransactionsDropdown(false)}
          />
          <View
            style={[
              styles.dropdown,
              styles.allTransactionsDropdown,

              {
                position: 'absolute',
                width:170,
                top: allTransactionsButtonLayout.y + allTransactionsButtonLayout.height + 4,
                left: Math.max(20, allTransactionsButtonLayout.x - 100),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedFilter('All Transactions');
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/Notebook.png')}
                style={styles.dropdownItemIcon}
                resizeMode="contain"
              />
              <ThemedText style={styles.dropdownItemText}>All Transactions</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedFilter('Bill Payments');
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/Money (1).png')}
                style={styles.dropdownItemIcon}
                resizeMode="contain"
              />
              <ThemedText style={styles.dropdownItemText}>Bill Payments</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedFilter('Crypto');
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/bitcoin-ellipse.png')}
                style={styles.dropdownItemIcon}
                resizeMode="contain"
              />
              <ThemedText style={styles.dropdownItemText}>Crypto</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedFilter('Virtual Cards');
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/virtual_cards.png')}
                style={styles.dropdownItemIcon}
                resizeMode="contain"
              />
              <ThemedText style={styles.dropdownItemText}>Virtual Cards</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* All Filter Dropdown (for Bill Payments and Crypto) */}
      {showAllFilterDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={() => setShowAllFilterDropdown(false)}
          />
          <View
            style={[
              styles.dropdown,
              styles.allFilterDropdown,
              {
                position: 'absolute',
                width:170,
                top: allFilterButtonLayout.y + allFilterButtonLayout.height + 4,
                left: Math.max(20, allFilterButtonLayout.x - 100),
              },
            ]}
          >
            {selectedFilter === 'Bill Payments' ? (
              (['All', 'Airtime', 'Data', 'Cable TV', 'Electricity', 'Internet', 'Betting'] as BillPaymentCategory[]).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedBillCategory(category);
                    setShowAllFilterDropdown(false);
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.dropdownItemText}>{category}</ThemedText>
                </TouchableOpacity>
              ))
            ) : selectedFilter === 'Virtual Cards' ? (
              (['All Transactions', 'Fund', 'Withdraw', 'Payments'] as VirtualCardCategory[]).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedVirtualCardCategory(category);
                    setShowAllFilterDropdown(false);
                  }}
                  activeOpacity={0.8}
                >
                  {category === 'All Transactions' ? (
                    <Image
                      source={require('../../assets/Notebook.png')}
                      style={styles.dropdownItemIcon}
                      resizeMode="contain"
                    />
                  ) : category === 'Fund' ? (
                    <Image
                      source={require('../../assets/ArrowDownLeft (1).png')}
                      style={styles.dropdownItemIcon}
                      resizeMode="contain"
                    />
                  ) : category === 'Withdraw' ? (
                    <Image
                      source={require('../../assets/ArrowDownLeft.png')}
                      style={styles.dropdownItemIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={require('../../assets/card.png')}
                      style={styles.dropdownItemIcon}
                      resizeMode="contain"
                    />
                  )}
                  <ThemedText style={styles.dropdownItemText}>{category}</ThemedText>
                </TouchableOpacity>
              ))
            ) : selectedFilter === 'Crypto' ? (
              (['All Transactions', 'Receive', 'Send', 'Buy', 'Sell'] as CryptoCategory[]).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCryptoCategory(category);
                    setShowAllFilterDropdown(false);
                  }}
                  activeOpacity={0.8}
                >
                  {category === 'All Transactions' ? (
                    <Image
                      source={require('../../assets/Notebook.png')}
                      style={styles.dropdownItemIcon}
                      resizeMode="contain"
                    />
                  ) : category === 'Receive' || category === 'Buy' ? (
                    <Image
                      source={require('../../assets/arrowdown.png')}
                      style={styles.dropdownItemIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={require('../../assets/arrowup.png')}
                      style={styles.dropdownItemIcon}
                      resizeMode="contain"
                    />
                  )}
                  <ThemedText style={styles.dropdownItemText}>{category}</ThemedText>
                </TouchableOpacity>
              ))
            ) : null}
          </View>
        </View>
      )}

      {/* Date Dropdown */}
      {showDateDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={() => setShowDateDropdown(false)}
          />
          <View
            style={[
              styles.dropdown,
              styles.dateDropdown,
              {
                position: 'absolute',
                top: dateFilterButtonLayout.y + dateFilterButtonLayout.height + 4,
                left: Math.max(20, dateFilterButtonLayout.x - 85),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDateDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>Today</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDateDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>This Week</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDateDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>This Month</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowDateDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>Custom Range</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    marginTop: 30,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 0.3,
    borderColor: '#0000004D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:23,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 0.3,
    borderColor: '#0000004D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
    gap: 4,
  },
  dateFilterButtonText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#111827',
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 15,
    padding: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 41,
    height: 41,
    borderRadius: 15,
    backgroundColor: '#D6F5D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconPending: {
    backgroundColor: '#FFE3B3',
  },
  transactionIconMTN: {
    backgroundColor: '#FFD700',
  },
  transactionIconImage: {
    width: 24,
    height: 24,
    tintColor: '#1B800F',
  },
  mtnLogoContainer: {
    width: 41,
    height: 41,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mtnLogoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  transactionContent: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 8,
    color: '#1B800F',
  },
  transactionStatusPending: {
    color: '#F59E0B',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '400',
    color: '#008000',
    marginBottom: 4,
  },
  transactionAmountWithdrawal: {
    color: '#008000',
  },
  transactionDate: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 8,
  },
  allTransactionsDropdown: {
    width: 180,
    zIndex: 1001,
  },
  dateDropdown: {
    width: 150,
    zIndex: 1001,
  },
  allFilterDropdown: {
    width: 150,
    zIndex: 1001,
  },
  billPaymentIconImage: {
    width: 40,
    height: 40,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemIcon: {
    width: 20,
    height: 20,
    marginRight: 0,
    tintColor:'#000'
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
});

export default AllTransactionsScreen;

