import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type CurrencyType = 'naira' | 'crypto' | 'virtualCard';
type TimeframeType = '7 Days' | '30 Days' | '90 Days';
type TransactionType = 'Deposit' | 'Withdrawal' | 'Bill Payments';

const TransactionsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('naira');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('7 Days');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>('Deposit');
  const [showTransactionTypeDropdown, setShowTransactionTypeDropdown] = useState(false);
  const [showAllTransactionsDropdown, setShowAllTransactionsDropdown] = useState(false);

  const timeframes: TimeframeType[] = ['7 Days', '30 Days', '90 Days'];
  const transactionTypes: TransactionType[] = ['Deposit', 'Withdrawal', 'Bill Payments'];

  const recentTransactions = [
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
      type: 'Funds Withdrawal',
      status: 'Successful',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: false,
    },
    {
      id: '3',
      type: 'Airtime Recharge',
      status: 'Pending',
      amount: '20,000',
      date: '06 Oct, 25 - 08:00 PM',
      isDeposit: true,
      isPending: true,
    },
  ];

  // Bar chart data for 7 days - matching the design
  const chartData = [
    { day: 'Mon', value: 2000, isHighlighted: false },
    { day: 'Tue', value: 1200, isHighlighted: false },
    { day: 'Wed', value: 500, isHighlighted: true }, // Has tooltip
    { day: 'Thu', value: 1500, isHighlighted: false },
    { day: 'Fri', value: 1200, isHighlighted: false },
    { day: 'Sat', value: 2000, isHighlighted: true }, // Darker green
    { day: 'Sun', value: 800, isHighlighted: false },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>

        {/* Currency Selector */}
        <View style={styles.currencySelector}>
          <TouchableOpacity
            style={[
              styles.currencyOption,
              selectedCurrency === 'naira' && styles.currencyOptionActive,
            ]}
            onPress={() => setSelectedCurrency('naira')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.currencyOptionText,
                selectedCurrency === 'naira' && styles.currencyOptionTextActive,
              ]}
            >
              Naira
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyOption,
              selectedCurrency === 'crypto' && styles.currencyOptionActive,
            ]}
            onPress={() => setSelectedCurrency('crypto')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.currencyOptionText,
                selectedCurrency === 'crypto' && styles.currencyOptionTextActive,
              ]}
            >
              Crypto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyOption,
              selectedCurrency === 'virtualCard' && styles.currencyOptionActive,
            ]}
            onPress={() => setSelectedCurrency('virtualCard')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.currencyOptionText,
                selectedCurrency === 'virtualCard' && styles.currencyOptionTextActive,
              ]}
            >
              Virtual Card
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Deposits Card */}
        <LinearGradient
          colors={['#D6F5D9', '#A8E5AD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.depositsCard}
        >
          <View style={styles.depositsCardHeader}>
            <View style={styles.depositsCardLeft}>
              <Text style={styles.depositsLabel}>Total Deposits</Text>
              <Text style={styles.depositsAmount}>N200,000</Text>
            </View>
            <View style={styles.depositsCardRight}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                activeOpacity={0.8}
              >
                <Text style={styles.filterButtonText}>{selectedTimeframe}</Text>
                <Ionicons name="chevron-down" size={16} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowTransactionTypeDropdown(!showTransactionTypeDropdown)}
                activeOpacity={0.8}
              >
                <Text style={styles.filterButtonText}>{selectedTransactionType}</Text>
                <Ionicons name="chevron-down" size={16} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartYLabel}>2000</Text>
              <Text style={styles.chartYLabel}>1000</Text>
              <Text style={styles.chartYLabel}>500</Text>
              <Text style={styles.chartYLabel}>0</Text>
            </View>
            <View style={styles.chartBarsContainer}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.chartBarWrapper}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: (item.value / maxValue) * 120,
                        backgroundColor: item.isHighlighted && item.day === 'Sat' ? '#1B800F' : '#D6F5D9',
                      },
                    ]}
                  />
                  {item.isHighlighted && item.day === 'Wed' && (
                    <View style={styles.chartTooltip}>
                      <View style={styles.chartTooltipArrow} />
                      <Text style={styles.chartTooltipText}>N5,000</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            <View style={styles.chartXAxis}>
              {chartData.map((item, index) => (
                <Text key={index} style={styles.chartXLabel}>
                  {item.day}
                </Text>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Recent Transactions Section */}
        <View style={styles.recentTransactionsSection}>
          <View style={styles.recentTransactionsHeader}>
            <Text style={styles.recentTransactionsTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllTransactions')}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.allTransactionsButton}
            onPress={() => setShowAllTransactionsDropdown(!showAllTransactionsDropdown)}
            activeOpacity={0.8}
          >
            <Text style={styles.allTransactionsButtonText}>All Transactions</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* Transaction List */}
          <View style={styles.transactionList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View
                  style={[
                    styles.transactionIcon,
                    transaction.isPending && styles.transactionIconPending,
                    transaction.type === 'Airtime Recharge' && styles.transactionIconMTN,
                  ]}
                >
                  {transaction.type === 'Airtime Recharge' ? (
                    <View style={styles.mtnLogoContainer}>
                      <Text style={styles.mtnLogoText}>MTN</Text>
                    </View>
                  ) : (
                    <Ionicons
                      name={transaction.isDeposit ? 'arrow-down' : 'arrow-up'}
                      size={20}
                      color={transaction.isDeposit ? '#1B800F' : '#1B800F'}
                    />
                  )}
                </View>
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                  <Text
                    style={[
                      styles.transactionStatus,
                      transaction.isPending && styles.transactionStatusPending,
                    ]}
                  >
                    {transaction.status}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      !transaction.isDeposit && styles.transactionAmountWithdrawal,
                    ]}
                  >
                    {transaction.amount}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Timeframe Dropdown */}
      {showTimeframeDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={() => setShowTimeframeDropdown(false)}
          />
          <View style={[styles.dropdown, { marginTop: 280, marginLeft: 20 }]}>
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTimeframe(timeframe);
                  setShowTimeframeDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownItemText}>{timeframe}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Transaction Type Dropdown */}
      {showTransactionTypeDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={() => setShowTransactionTypeDropdown(false)}
          />
          <View style={[styles.dropdown, { marginTop: 280, marginLeft: width - 200 }]}>
            {transactionTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTransactionType(type);
                  setShowTransactionTypeDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={
                    type === 'Deposit'
                      ? 'arrow-down-circle'
                      : type === 'Withdrawal'
                      ? 'arrow-up-circle'
                      : 'camera'
                  }
                  size={20}
                  color="#6B7280"
                  style={styles.dropdownItemIcon}
                />
                <Text style={styles.dropdownItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* All Transactions Dropdown */}
      {showAllTransactionsDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={() => setShowAllTransactionsDropdown(false)}
          />
          <View style={[styles.dropdown, { marginTop: 600, marginLeft: 20 }]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="list" size={20} color="#6B7280" style={styles.dropdownItemIcon} />
              <Text style={styles.dropdownItemText}>All Transactions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-down-circle"
                size={20}
                color="#6B7280"
                style={styles.dropdownItemIcon}
              />
              <Text style={styles.dropdownItemText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-up-circle"
                size={20}
                color="#6B7280"
                style={styles.dropdownItemIcon}
              />
              <Text style={styles.dropdownItemText}>Withdrawal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={20} color="#6B7280" style={styles.dropdownItemIcon} />
              <Text style={styles.dropdownItemText}>Bill Payments</Text>
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
    paddingBottom: 100,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  currencySelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currencyOptionActive: {
    backgroundColor: '#1B800F',
  },
  currencyOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  currencyOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  depositsCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  depositsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  depositsCardLeft: {
    flex: 1,
  },
  depositsLabel: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  depositsAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  depositsCardRight: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    height: 140,
    marginRight: 8,
    paddingBottom: 20,
  },
  chartYLabel: {
    fontSize: 10,
    color: '#6B7280',
    height: 30,
    textAlign: 'right',
  },
  chartBarsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingBottom: 20,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  chartBar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartTooltip: {
    position: 'absolute',
    top: -40,
    backgroundColor: '#1B800F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTooltipArrow: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1B800F',
  },
  chartTooltipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartXAxis: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  chartXLabel: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  recentTransactionsSection: {
    paddingHorizontal: 20,
  },
  recentTransactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTransactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B800F',
  },
  allTransactionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  allTransactionsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 20,
    height: 20,
  },
  mtnLogoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
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
    fontWeight: '600',
    color: '#1B800F',
    marginBottom: 4,
  },
  transactionAmountWithdrawal: {
    color: '#EF4444',
  },
  transactionDate: {
    fontSize: 10,
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
    marginHorizontal: 20,
    marginTop: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemIcon: {
    marginRight: 0,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
});

export default TransactionsScreen;

