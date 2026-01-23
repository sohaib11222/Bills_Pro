import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import {
  useTransactionStats,
  useDepositTransactions,
  useWithdrawalTransactions,
  useBillPaymentTransactions,
  useAllTransactions,
} from '../../queries/transactionQueries';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Button refs and positions for dropdowns
  const timeframeButtonRef = useRef<View>(null);
  const transactionTypeButtonRef = useRef<View>(null);
  const allTransactionsButtonRef = useRef<View>(null);
  
  const [timeframeButtonLayout, setTimeframeButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [transactionTypeButtonLayout, setTransactionTypeButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [allTransactionsButtonLayout, setAllTransactionsButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const timeframes: TimeframeType[] = ['7 Days', '30 Days', '90 Days'];
  const transactionTypes: TransactionType[] = ['Deposit', 'Withdrawal', 'Bill Payments'];

  // Map timeframe to period for stats
  const getPeriodFromTimeframe = (timeframe: TimeframeType): 'day' | 'week' | 'month' => {
    if (timeframe === '7 Days') return 'week';
    if (timeframe === '30 Days') return 'month';
    return 'month'; // Default for 90 Days
  };

  // API calls
  const period = getPeriodFromTimeframe(selectedTimeframe);
  const { data: statsData, isLoading: isLoadingStats, refetch: refetchStats } = useTransactionStats(period);

  // Calculate date range based on timeframe
  const getDateRange = (timeframe: TimeframeType) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    if (timeframe === '7 Days') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      return {
        start_date: formatDate(weekStart),
        end_date: formatDate(today),
      };
    } else if (timeframe === '30 Days') {
      const monthStart = new Date(today);
      monthStart.setDate(today.getDate() - 30);
      return {
        start_date: formatDate(monthStart),
        end_date: formatDate(today),
      };
    } else if (timeframe === '90 Days') {
      const days90Start = new Date(today);
      days90Start.setDate(today.getDate() - 90);
      return {
        start_date: formatDate(days90Start),
        end_date: formatDate(today),
      };
    }
    return {};
  };

  const dateRange = useMemo(() => getDateRange(selectedTimeframe), [selectedTimeframe]);

  // Get transactions based on currency and type with filters
  // Note: These endpoints don't support date filters directly, so we'll filter client-side if needed
  const { data: depositData, isLoading: isLoadingDeposits, refetch: refetchDeposits } = useDepositTransactions();
  const { data: withdrawalData, isLoading: isLoadingWithdrawals, refetch: refetchWithdrawals } = useWithdrawalTransactions();
  const { data: billPaymentData, isLoading: isLoadingBillPayments, refetch: refetchBillPayments } = useBillPaymentTransactions();
  
  // For crypto and virtual card with date range
  const cryptoFilters = useMemo(() => ({
    wallet_type: 'crypto' as const,
    limit: 50,
    ...dateRange,
  }), [dateRange]);
  
  const virtualCardFilters = useMemo(() => ({
    wallet_type: 'virtual_card' as const,
    limit: 50,
    ...dateRange,
  }), [dateRange]);

  const { data: cryptoData, isLoading: isLoadingCrypto, refetch: refetchCrypto } = useAllTransactions(
    selectedCurrency === 'crypto' ? cryptoFilters : undefined
  );
  
  const { data: virtualCardData, isLoading: isLoadingVirtualCard, refetch: refetchVirtualCard } = useAllTransactions(
    selectedCurrency === 'virtualCard' ? virtualCardFilters : undefined
  );

  // Get all transactions for chart data (for the selected timeframe)
  const chartTransactionsFilters = useMemo(() => ({
    wallet_type: selectedCurrency === 'naira' ? 'naira' as const : 
                 selectedCurrency === 'crypto' ? 'crypto' as const : 
                 selectedCurrency === 'virtualCard' ? 'virtual_card' as const : undefined,
    type: selectedTransactionType === 'Deposit' ? 'deposit' :
          selectedTransactionType === 'Withdrawal' ? 'withdrawal' :
          selectedTransactionType === 'Bill Payments' ? 'bill_payment' : undefined,
    limit: 100,
    ...dateRange,
  }), [selectedCurrency, selectedTransactionType, dateRange]);

  const { data: chartTransactionsData, refetch: refetchChartTransactions } = useAllTransactions(chartTransactionsFilters);

  // Helper functions
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${day} ${month}, ${year} - ${displayHours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'completed': 'Successful',
      'pending': 'Pending',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getTransactionTypeLabel = (type: string, category?: string): string => {
    if (type === 'deposit') return 'Funds Deposit';
    if (type === 'withdrawal') return 'Funds Withdrawal';
    if (type === 'bill_payment') {
      if (category === 'airtime') return 'Airtime Recharge';
      if (category === 'data') return 'Data Recharge';
      return 'Bill Payment';
    }
    return type;
  };

  // Format transaction for UI
  const formatTransaction = (tx: any): any => {
    const isDeposit = tx.type === 'deposit' || tx.type === 'crypto_buy' || tx.type === 'card_funding';
    const isPending = tx.status === 'pending';
    
    return {
      id: tx.transaction_id || tx.id,
      transaction_id: tx.transaction_id,
      type: getTransactionTypeLabel(tx.type, tx.category),
      status: mapStatus(tx.status),
      amount: formatCurrency(tx.amount, tx.currency),
      date: formatDate(tx.created_at),
      isDeposit,
      isPending,
      originalData: {
        ...tx,
        wallet_type: tx.wallet_type, // Preserve wallet_type
      },
    };
  };

  // Get recent transactions based on selected currency and type
  const recentTransactions = useMemo(() => {
    let transactions: any[] = [];
    
    if (selectedCurrency === 'naira') {
      if (selectedTransactionType === 'Deposit') {
        transactions = depositData?.data || [];
      } else if (selectedTransactionType === 'Withdrawal') {
        transactions = withdrawalData?.data || [];
      } else if (selectedTransactionType === 'Bill Payments') {
        transactions = billPaymentData?.data || [];
      }
    } else if (selectedCurrency === 'crypto') {
      transactions = cryptoData?.data || [];
    } else if (selectedCurrency === 'virtualCard') {
      transactions = virtualCardData?.data || [];
    }

    // Filter by date range if needed
    if (dateRange.start_date && dateRange.end_date) {
      transactions = transactions.filter((tx: any) => {
        if (!tx.created_at) return false;
        const txDate = new Date(tx.created_at).toISOString().split('T')[0];
        return txDate >= dateRange.start_date! && txDate <= dateRange.end_date!;
      });
    }

    return transactions.slice(0, 3).map(formatTransaction);
  }, [
    selectedCurrency,
    selectedTransactionType,
    depositData,
    withdrawalData,
    billPaymentData,
    cryptoData,
    virtualCardData,
    dateRange,
  ]);

  // Generate chart data from actual transactions grouped by day of week
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Get transactions for chart based on selected filters
    let transactions: any[] = [];
    
    if (selectedCurrency === 'naira') {
      if (selectedTransactionType === 'Deposit') {
        transactions = depositData?.data || [];
      } else if (selectedTransactionType === 'Withdrawal') {
        transactions = withdrawalData?.data || [];
      } else if (selectedTransactionType === 'Bill Payments') {
        transactions = billPaymentData?.data || [];
      }
    } else {
      transactions = chartTransactionsData?.data || [];
    }

    // Filter by date range if needed (client-side filtering for endpoints that don't support it)
    if (dateRange.start_date && dateRange.end_date) {
      transactions = transactions.filter((tx: any) => {
        if (!tx.created_at) return false;
        const txDate = new Date(tx.created_at).toISOString().split('T')[0];
        return txDate >= dateRange.start_date! && txDate <= dateRange.end_date!;
      });
    }

    // Group transactions by day of week
    const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    
    transactions.forEach((tx: any) => {
      try {
        const date = new Date(tx.created_at);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Convert to Monday = 0 format
        const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        dayTotals[mondayBasedDay] += Number(tx.amount) || 0;
      } catch (e) {
        // Skip invalid dates
      }
    });

    // Find max value for scaling
    const maxValue = Math.max(...Object.values(dayTotals), 1);
    
    // Find days with highest values for highlighting
    const sortedDays = Object.entries(dayTotals)
      .map(([day, value]) => ({ day: parseInt(day), value }))
      .sort((a, b) => b.value - a.value);
    
    const topTwoDays = sortedDays.slice(0, 2).map(d => d.day);

    return days.map((day, index) => {
      const value = dayTotals[index] || 0;
      const isHighlighted = topTwoDays.includes(index) && value > 0;
      
      return {
        day,
        value: Math.floor(value),
        isHighlighted,
      };
    });
  }, [selectedCurrency, selectedTransactionType, depositData, withdrawalData, billPaymentData, chartTransactionsData, dateRange]);

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  // Handle pull to refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refetch all relevant queries based on current selections
      await Promise.all([
        refetchStats(),
        refetchDeposits(),
        refetchWithdrawals(),
        refetchBillPayments(),
        refetchCrypto(),
        refetchVirtualCard(),
        refetchChartTransactions(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state
  const isLoading = isLoadingStats || isLoadingDeposits || isLoadingWithdrawals || 
                    isLoadingBillPayments || isLoadingCrypto || isLoadingVirtualCard;

  // Get total deposits for display
  const totalDeposits = useMemo(() => {
    if (statsData?.data?.total_deposits) {
      return formatCurrency(statsData.data.total_deposits, 'NGN');
    }
    return 'N0';
  }, [statsData]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#1B800F"
            colors={['#1B800F']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Transactions</ThemedText>
        </View>

        {/* Currency Selector */}
        <View style={styles.currencySelector}>
          <TouchableOpacity
            style={[
              styles.currencyOption,
              selectedCurrency === 'naira' && styles.currencyOptionActive,
            ]}
            onPress={() => {
              setSelectedCurrency('naira');
              // Reset transaction type when currency changes
              setSelectedTransactionType('Deposit');
            }}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.currencyOptionText,
                selectedCurrency === 'naira' && styles.currencyOptionTextActive,
              ]}
            >
              Naira
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyOption,
              selectedCurrency === 'crypto' && styles.currencyOptionActive,
            ]}
            onPress={() => {
              setSelectedCurrency('crypto');
              // Reset transaction type when currency changes
              setSelectedTransactionType('Deposit');
            }}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.currencyOptionText,
                selectedCurrency === 'crypto' && styles.currencyOptionTextActive,
              ]}
            >
              Crypto
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.currencyOption,
              selectedCurrency === 'virtualCard' && styles.currencyOptionActive,
            ]}
            onPress={() => {
              setSelectedCurrency('virtualCard');
              // Reset transaction type when currency changes
              setSelectedTransactionType('Deposit');
            }}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.currencyOptionText,
                selectedCurrency === 'virtualCard' && styles.currencyOptionTextActive,
              ]}
            >
              Virtual Card
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Total Deposits Card */}
        <LinearGradient
          colors={['#21D721', '#B2FFAC']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.depositsCard}
        >
          <View style={styles.depositsCardHeader}>
            <View style={styles.depositsCardLeft}>
              <ThemedText style={styles.depositsLabel}>Total Deposits</ThemedText>
              <ThemedText style={styles.depositsAmount}>
                {isLoadingStats ? '...' : totalDeposits}
              </ThemedText>
            </View>
            <View style={styles.depositsCardRight}>
              <TouchableOpacity
                ref={timeframeButtonRef}
                style={styles.filterButton}
                onPress={() => {
                  setShowTransactionTypeDropdown(false);
                  setShowAllTransactionsDropdown(false);
                  timeframeButtonRef.current?.measure((fx: number, fy: number, fwidth: number, fheight: number, px: number, py: number) => {
                    setTimeframeButtonLayout({ x: px, y: py, width: fwidth, height: fheight });
                    setShowTimeframeDropdown(!showTimeframeDropdown);
                  });
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.filterButtonText}>{selectedTimeframe}</ThemedText>
                <Ionicons name="chevron-down" size={12} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity
                ref={transactionTypeButtonRef}
                style={styles.filterButton}
                onPress={() => {
                  setShowTimeframeDropdown(false);
                  setShowAllTransactionsDropdown(false);
                  transactionTypeButtonRef.current?.measure((fx: number, fy: number, fwidth: number, fheight: number, px: number, py: number) => {
                    setTransactionTypeButtonLayout({ x: px, y: py, width: fwidth, height: fheight });
                    setShowTransactionTypeDropdown(!showTransactionTypeDropdown);
                  });
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.filterButtonText}>{selectedTransactionType}</ThemedText>
                <Ionicons name="chevron-down" size={12} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartArea}>
            <View style={styles.chartContainer}>
              <View style={styles.chartYAxis}>
                <ThemedText style={styles.chartYLabel}>
                  {maxValue > 0 ? Math.ceil(maxValue).toLocaleString() : '2000'}
                </ThemedText>
                <ThemedText style={styles.chartYLabel}>
                  {maxValue > 0 ? Math.ceil(maxValue * 0.5).toLocaleString() : '1000'}
                </ThemedText>
                <ThemedText style={styles.chartYLabel}>
                  {maxValue > 0 ? Math.ceil(maxValue * 0.25).toLocaleString() : '500'}
                </ThemedText>
                <ThemedText style={styles.chartYLabel}>0</ThemedText>
              </View>
              <View style={styles.chartBarsContainer}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.chartBarWrapper}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: (item.value / maxValue) * 140,
                        backgroundColor: item.isHighlighted && item.day === 'Sat' ? '#1B800F' : '#64CA58',
                      },
                    ]}
                  />
                  {item.isHighlighted && item.value > 0 && (
                    <View style={styles.chartTooltipContainer}>
                      <View style={styles.chartTooltip}>
                        <ThemedText style={styles.chartTooltipText}>
                          {selectedCurrency === 'naira' 
                            ? `₦${item.value.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            : selectedCurrency === 'crypto'
                            ? `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </ThemedText>
                      </View>
                      <View style={styles.chartTooltipArrow} />
                    </View>
                  )}
                </View>
              ))}
              </View>
              <View style={styles.chartXAxis}>
                {chartData.map((item, index) => (
                  <ThemedText key={index} style={styles.chartXLabel}>
                    {item.day}
                  </ThemedText>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Recent Transactions Section */}
        <View style={styles.recentTransactionsSection}>
          <View style={styles.recentTransactionsHeader}>
            <ThemedText style={styles.recentTransactionsTitle}>Recent Transactions</ThemedText>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllTransactions')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.viewAllLink}>View All</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            ref={allTransactionsButtonRef}
            style={styles.allTransactionsButton}
            onPress={() => {
              setShowTimeframeDropdown(false);
              setShowTransactionTypeDropdown(false);
              allTransactionsButtonRef.current?.measure((fx: number, fy: number, fwidth: number, fheight: number, px: number, py: number) => {
                setAllTransactionsButtonLayout({ x: px, y: py, width: fwidth, height: fheight });
                setShowAllTransactionsDropdown(!showAllTransactionsDropdown);
              });
            }}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.allTransactionsButtonText} numberOfLines={1}>All Transactions</ThemedText>
            <Ionicons name="chevron-down" size={10} color="#6B7280" />
          </TouchableOpacity>

          {/* Transaction List */}
          <View style={styles.transactionList}>
            {isLoading && recentTransactions.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#1B800F" />
              </View>
            ) : recentTransactions.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ThemedText style={{ color: '#6B7280', fontSize: 12 }}>
                  No recent transactions
                </ThemedText>
              </View>
            ) : (
              recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() => {
                    // Determine transaction type based on currency
                    let txType: string = transaction.isDeposit ? 'deposit' : 'withdraw';
                    if (selectedCurrency === 'crypto') {
                      txType = 'crypto';
                    } else if (selectedCurrency === 'virtualCard') {
                      txType = 'virtual_card';
                    }
                    
                    navigation.navigate('TransactionHistory', {
                      type: txType as any,
                      transactionData: {
                        ...(transaction.originalData || transaction),
                        transaction_id: transaction.transaction_id,
                        wallet_type: selectedCurrency === 'crypto' ? 'crypto' : 
                                     selectedCurrency === 'virtualCard' ? 'virtual_card' : undefined,
                      },
                    });
                  }}
                  activeOpacity={0.8}
                >
                <View
                  style={[
                    styles.transactionIcon,
                    transaction.isPending && styles.transactionIconPending,
                    transaction.type === 'Airtime Recharge' && styles.transactionIconMTN,
                  ]}
                >
                  {transaction.type === 'Airtime Recharge' ? (
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
                    {transaction.status}
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
              ))
            )}
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
          <View
            style={[
              styles.dropdown,
              styles.timeframeDropdown,
              {
                position: 'absolute',
                top: timeframeButtonLayout.y + timeframeButtonLayout.height + 4,
                left: timeframeButtonLayout.x,
              },
            ]}
          >
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTimeframe(timeframe);
                  setShowTimeframeDropdown(false);
                  // Data will automatically refetch when timeframe changes due to query key change
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.dropdownItemText}>{timeframe}</ThemedText>
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
          <View
            style={[
              styles.dropdown,
              styles.transactionTypeDropdown,
              {
                position: 'absolute',
                top: transactionTypeButtonLayout.y + transactionTypeButtonLayout.height + 4,
                left: Math.max(20, transactionTypeButtonLayout.x - 50),
              },
            ]}
          >
            {transactionTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTransactionType(type);
                  setShowTransactionTypeDropdown(false);
                  // Refetch data when transaction type changes
                  refetchDeposits();
                  refetchWithdrawals();
                  refetchBillPayments();
                  refetchChartTransactions();
                }}
                activeOpacity={0.8}
              >
                {type === 'Bill Payments' ? (
                  <Image
                    source={require('../../assets/Money (1).png')}
                    style={styles.dropdownItemIcon}
                    resizeMode="contain"
                  />
                ) : type === 'Deposit' ? (
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
                <ThemedText style={styles.dropdownItemText}>{type}</ThemedText>
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
          <View
            style={[
              styles.dropdown,
              styles.allTransactionsDropdown,
              {
                position: 'absolute',
                top: allTransactionsButtonLayout.y + allTransactionsButtonLayout.height + 4,
                left: allTransactionsButtonLayout.x,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
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
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/arrowdown.png')}
                style={styles.dropdownItemIcon}
                resizeMode="contain"
              />
              <ThemedText style={styles.dropdownItemText}>Deposit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowAllTransactionsDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/arrowup.png')}
                style={styles.dropdownItemIcon}
                resizeMode="contain"
              />
              <ThemedText style={styles.dropdownItemText}>Withdrawal</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
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
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
  },
  currencySelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    padding: 4,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  currencyOptionActive: {
    backgroundColor: '#1B800F',
  },
  currencyOptionText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  currencyOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  depositsCard: {
    borderRadius: 20,
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
    fontSize: 12,
    color: '#111827',
    marginBottom: 8,
  },
  depositsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 25,
  },
  depositsCardRight: {
    flexDirection: 'row',
    gap: 8,
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
  chartArea: {
    // backgroundColor: '#E8F5E9',
    // borderRadius: 12,
    // padding: 16,
    // marginTop: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    height: 20,
    textAlign: 'right',
    marginTop: -10,
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
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    minHeight: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTooltipContainer: {
    position: 'absolute',
    top: -50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  chartTooltip: {
    backgroundColor: '#1B800F',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
  },
  chartTooltipArrow: {
    marginTop: -1,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1B800F',
  },
  chartTooltipText: {
    fontSize: 8,
    fontWeight: '400',
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
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1B800F',
  },
  allTransactionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 0.3,
    borderColor: '#0000004D',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 4,
  },
  allTransactionsButtonText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#111827',
    flexShrink: 1,
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
    color: '#1B800F',
    marginBottom: 4,
  },
  transactionAmountWithdrawal: {
    color: '#EF4444',
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
  timeframeDropdown: {
    width: 120,
    zIndex: 1001,
  },
  transactionTypeDropdown: {
    width: 160,
    zIndex: 1001,
  },
  allTransactionsDropdown: {
    width: 200,
    zIndex: 1001,
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
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
});

export default TransactionsScreen;

