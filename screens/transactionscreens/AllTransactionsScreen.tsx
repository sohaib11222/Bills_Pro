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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import ThemedText from '../../components/ThemedText';
import { 
  useAllTransactions, 
  useBillPaymentTransactions 
} from '../../queries/transactionQueries';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AllTransactionsRouteProp = RouteProp<RootStackParamList, 'AllTransactions'>;

type FilterType = 'All Transactions' | 'Bill Payments' | 'Crypto' | 'Virtual Cards';
type BillPaymentCategory = 'All' | 'Airtime' | 'Data' | 'Cable TV' | 'Electricity' | 'Internet' | 'Betting';
type CryptoCategory = 'All Transactions' | 'Receive' | 'Send' | 'Buy' | 'Sell';
type VirtualCardCategory = 'All Transactions' | 'Fund' | 'Withdraw' | 'Payments';

const AllTransactionsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<AllTransactionsRouteProp>();
  const initialFilter = route.params?.initialFilter || 'All Transactions';
  const walletType = route.params?.wallet_type;

  const [showAllTransactionsDropdown, setShowAllTransactionsDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showAllFilterDropdown, setShowAllFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(initialFilter);
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
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Date filter state
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string }>({});

  // Helper function to get date range
  const getDateRange = (filter: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (filter) {
      case 'Today':
        return {
          start_date: formatDate(today),
          end_date: formatDate(today),
        };
      case 'This Week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start_date: formatDate(weekStart),
          end_date: formatDate(today),
        };
      case 'This Month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start_date: formatDate(monthStart),
          end_date: formatDate(today),
        };
      default:
        return {};
    }
  };

  // Map UI categories to API categories
  const mapBillCategoryToAPI = (category: BillPaymentCategory): string | undefined => {
    const map: Record<string, string> = {
      'Airtime': 'airtime',
      'Data': 'data',
      'Cable TV': 'cable_tv',
      'Electricity': 'electricity',
      'Internet': 'internet',
      'Betting': 'betting',
    };
    return category === 'All' ? undefined : map[category];
  };

  // Map crypto category to transaction type
  const mapCryptoCategoryToType = (category: CryptoCategory): string | undefined => {
    const map: Record<string, string> = {
      'Receive': 'crypto_buy',
      'Send': 'crypto_withdrawal',
      'Buy': 'crypto_buy',
      'Sell': 'crypto_sell',
    };
    return category === 'All Transactions' ? undefined : map[category];
  };

  // Map virtual card category to transaction type
  const mapVirtualCardCategoryToType = (category: VirtualCardCategory): string | undefined => {
    const map: Record<string, string> = {
      'Fund': 'card_funding',
      'Withdraw': 'card_withdrawal',
      'Payments': 'card_withdrawal', // Payments are also withdrawals
    };
    return category === 'All Transactions' ? undefined : map[category];
  };

  // API calls based on selected filter
  const allTransactionsFilters = useMemo(() => {
    const filters: any = {
      limit: 100,
    };
    
    // Use wallet_type from route params if provided, otherwise use selected filter
    if (walletType) {
      filters.wallet_type = walletType;
    } else if (selectedFilter === 'Crypto') {
      filters.wallet_type = 'crypto';
      const type = mapCryptoCategoryToType(selectedCryptoCategory);
      if (type) filters.type = type;
    } else if (selectedFilter === 'Virtual Cards') {
      filters.wallet_type = 'virtual_card';
      const type = mapVirtualCardCategoryToType(selectedVirtualCardCategory);
      if (type) filters.type = type;
    } else if (selectedFilter === 'All Transactions') {
      // No additional filters for all transactions
    }
    
    // Add date filters
    if (dateRange.start_date) filters.start_date = dateRange.start_date;
    if (dateRange.end_date) filters.end_date = dateRange.end_date;
    
    return filters;
  }, [selectedFilter, selectedCryptoCategory, selectedVirtualCardCategory, dateRange, walletType]);

  const billPaymentFilters = useMemo(() => {
    const filters: any = {
      limit: 100,
    };
    
    const category = mapBillCategoryToAPI(selectedBillCategory);
    if (category) filters.category = category;
    
    // Add date filters
    if (dateRange.start_date) filters.start_date = dateRange.start_date;
    if (dateRange.end_date) filters.end_date = dateRange.end_date;
    
    return filters;
  }, [selectedBillCategory, dateRange]);

  // API hooks
  const { 
    data: allTransactionsData, 
    isLoading: isLoadingAll,
    error: errorAll,
    refetch: refetchAll
  } = useAllTransactions(selectedFilter !== 'Bill Payments' ? allTransactionsFilters : undefined);

  const { 
    data: billPaymentData, 
    isLoading: isLoadingBill,
    error: errorBill,
    refetch: refetchBill
  } = useBillPaymentTransactions(selectedFilter === 'Bill Payments' ? billPaymentFilters : undefined);

  // Helper functions for formatting
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
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      if (category === 'electricity') return 'Electricity Recharge';
      if (category === 'cable_tv') return 'Cable TV';
      if (category === 'internet') return 'Internet Subscription';
      if (category === 'betting') return 'Betting';
      return 'Bill Payment';
    }
    if (type === 'crypto_buy') return 'Crypto Buy';
    if (type === 'crypto_sell') return 'Crypto Sell';
    if (type === 'crypto_withdrawal') return 'Crypto Withdrawal';
    if (type === 'card_funding') return 'Card Funding';
    if (type === 'card_withdrawal') return 'Card Withdrawal';
    return type;
  };

  const getBillPaymentIcon = (category?: string) => {
    const icons: Record<string, any> = {
      'airtime': require('../../assets/airtime.png'),
      'data': require('../../assets/datarecharge.png'),
      'cable_tv': require('../../assets/cable (2).png'),
      'electricity': require('../../assets/electricity.png'),
      'betting': require('../../assets/betting (2).png'),
    };
    return icons[category || ''] || require('../../assets/Money (1).png');
  };

  // Format transactions for UI
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
      // Original transaction data for navigation
      originalData: {
        ...tx,
        wallet_type: tx.wallet_type, // Preserve wallet_type
      },
    };
  };

  const formatBillPaymentTransaction = (tx: any): any => {
    const base = formatTransaction(tx);
    const metadata = tx.metadata || {};
    
    return {
      ...base,
      category: tx.category === 'airtime' ? 'Airtime' :
                tx.category === 'data' ? 'Data' :
                tx.category === 'cable_tv' ? 'Cable TV' :
                tx.category === 'electricity' ? 'Electricity' :
                tx.category === 'internet' ? 'Internet' :
                tx.category === 'betting' ? 'Betting' : tx.category,
      phoneNumber: metadata.phoneNumber || metadata.phone_number,
      billerType: metadata.provider || metadata.billerName,
      decoderNumber: metadata.decoderNumber || metadata.decoder_number,
      dataPlan: metadata.planName || metadata.plan_name,
      accountName: metadata.accountName || metadata.account_name,
      meterNumber: metadata.meterNumber || metadata.meter_number,
      accountType: metadata.accountType || metadata.account_type,
      token: tx.token || metadata.rechargeToken,
      iconSource: getBillPaymentIcon(tx.category),
      originalData: {
        ...base.originalData,
        wallet_type: tx.wallet_type, // Preserve wallet_type
      },
    };
  };

  const formatCryptoTransaction = (tx: any): any => {
    const base = formatTransaction(tx);
    const metadata = tx.metadata || {};
    
    let cryptoType = 'Receive';
    if (tx.type === 'crypto_withdrawal') cryptoType = 'Send';
    else if (tx.type === 'crypto_buy') cryptoType = 'Buy';
    else if (tx.type === 'crypto_sell') cryptoType = 'Sell';
    
    return {
      ...base,
      cryptoType,
      cryptoAmount: `${tx.amount} ${tx.currency}`,
      network: metadata.blockchain || tx.currency,
      iconSource: cryptoType === 'Receive' || cryptoType === 'Buy' 
        ? require('../../assets/sent (1).png')
        : require('../../assets/sent (2).png'),
      originalData: {
        ...base.originalData,
        wallet_type: tx.wallet_type || 'crypto', // Preserve wallet_type
      },
    };
  };

  const formatVirtualCardTransaction = (tx: any): any => {
    const base = formatTransaction(tx);
    const metadata = tx.metadata || {};
    
    let virtualCardType = 'Fund';
    if (tx.type === 'card_withdrawal') {
      virtualCardType = metadata.paymentReason ? 'Payments' : 'Withdraw';
    }
    
    // Ensure all original transaction data is preserved
    const originalData = {
      ...tx, // Start with all original transaction fields
      ...base.originalData, // Merge with base originalData
      wallet_type: tx.wallet_type || 'virtual_card', // Ensure wallet_type is set
      transaction_id: tx.transaction_id || tx.id, // Ensure transaction_id is set
      metadata: tx.metadata || {}, // Preserve metadata
    };
    
    return {
      ...base,
      virtualCardType,
      paymentReason: metadata.paymentReason || metadata.merchant_name,
      iconSource: virtualCardType === 'Fund' 
        ? require('../../assets/sent (1).png')
        : virtualCardType === 'Withdraw'
        ? require('../../assets/sent (2).png')
        : require('../../assets/card.png'),
      originalData,
    };
  };

  // Get filtered transactions
  const transactions = useMemo(() => {
    if (selectedFilter === 'Bill Payments') {
      const data = billPaymentData?.data || [];
      let filtered = data.map(formatBillPaymentTransaction);
      
      // Apply category filter if not 'All'
      if (selectedBillCategory !== 'All') {
        filtered = filtered.filter((tx: any) => tx.category === selectedBillCategory);
      }
      
      return filtered;
    }
    
    if (selectedFilter === 'Crypto') {
      const data = allTransactionsData?.data || [];
      let filtered = data.map(formatCryptoTransaction);
      
      // Apply crypto category filter
      if (selectedCryptoCategory !== 'All Transactions') {
        filtered = filtered.filter((tx: any) => tx.cryptoType === selectedCryptoCategory);
      }
      
      return filtered;
    }
    
    if (selectedFilter === 'Virtual Cards') {
      const data = allTransactionsData?.data || [];
      let filtered = data.map(formatVirtualCardTransaction);
      
      // Apply virtual card category filter
      if (selectedVirtualCardCategory !== 'All Transactions') {
        filtered = filtered.filter((tx: any) => {
          if (selectedVirtualCardCategory === 'Fund') return tx.virtualCardType === 'Fund';
          if (selectedVirtualCardCategory === 'Withdraw') return tx.virtualCardType === 'Withdraw';
          if (selectedVirtualCardCategory === 'Payments') return tx.virtualCardType === 'Payments';
          return true;
        });
      }
      
      return filtered;
    }
    
    // All Transactions
    const data = allTransactionsData?.data || [];
    return data.map(formatTransaction);
  }, [
    selectedFilter,
    selectedBillCategory,
    selectedCryptoCategory,
    selectedVirtualCardCategory,
    allTransactionsData,
    billPaymentData,
  ]);

  // Loading state
  const isLoading = isLoadingAll || isLoadingBill;
  const error = errorAll || errorBill;

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchAll(),
        refetchBill(),
      ]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle date filter selection
  const handleDateFilter = (filter: string) => {
    setSelectedDateFilter(filter);
    setShowDateDropdown(false);
    
    if (filter === 'Custom Range') {
      // TODO: Implement custom date picker
      Alert.alert('Custom Range', 'Custom date range picker will be implemented');
      return;
    }
    
    const range = getDateRange(filter);
    setDateRange(range);
  };

  // Show loading state
  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#1B800F" />
        <ThemedText style={{ marginTop: 16, color: '#6B7280' }}>Loading transactions...</ThemedText>
      </View>
    );
  }

  // Show error state
  if (error && transactions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <ThemedText style={{ marginTop: 16, color: '#EF4444', textAlign: 'center' }}>
          Failed to load transactions
        </ThemedText>
        <ThemedText style={{ marginTop: 8, color: '#6B7280', textAlign: 'center', fontSize: 12 }}>
          {(error as any)?.response?.data?.message || 'Please try again later'}
        </ThemedText>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 20 }]}
          onPress={handleRefresh}
        >
          <ThemedText style={{ color: '#1B800F' }}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1B800F"
          />
        }
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
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>No transactions found</ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                {selectedDateFilter ? 'Try adjusting your date filter' : 'Your transaction history will appear here'}
              </ThemedText>
            </View>
          ) : (
            transactions.map((transaction: any) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => {
                  if (selectedFilter === 'Bill Payments') {
                    navigation.navigate('TransactionHistory', {
                      type: 'bill_payment',
                      transactionData: {
                        ...(transaction.originalData || transaction),
                        transaction_id: transaction.transaction_id,
                      },
                    });
                  } else if (selectedFilter === 'Crypto') {
                    navigation.navigate('TransactionHistory', {
                      type: 'crypto',
                      transactionData: {
                        ...(transaction.originalData || transaction),
                        transaction_id: transaction.transaction_id,
                      },
                    });
                  } else if (selectedFilter === 'Virtual Cards') {
                    // Log the transaction data being passed
                    const transactionDataToPass = {
                      ...(transaction.originalData || transaction),
                      transaction_id: transaction.transaction_id || transaction.id,
                      wallet_type: 'virtual_card', // Mark as virtual card transaction
                    };
                    
                    console.log('🔵 Virtual Card Transaction - Navigating with data:', {
                      transaction_id: transactionDataToPass.transaction_id,
                      id: transactionDataToPass.id,
                      type: transactionDataToPass.type,
                      wallet_type: transactionDataToPass.wallet_type,
                      amount: transactionDataToPass.amount,
                      currency: transactionDataToPass.currency,
                      status: transactionDataToPass.status,
                      metadata: transactionDataToPass.metadata,
                      fullData: transactionDataToPass,
                    });
                    
                    navigation.navigate('TransactionHistory', {
                      type: 'virtual_card',
                      transactionData: transactionDataToPass,
                    });
                  } else {
                    navigation.navigate('TransactionHistory', {
                      type: transaction.isDeposit ? 'deposit' : 'withdraw',
                      transactionData: {
                        ...(transaction.originalData || transaction),
                        transaction_id: transaction.transaction_id,
                      },
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
            ))
          )}
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
              onPress={() => handleDateFilter('Today')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>Today</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleDateFilter('This Week')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>This Week</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleDateFilter('This Month')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>This Month</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleDateFilter('Custom Range')}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.dropdownItemText}>Custom Range</ThemedText>
            </TouchableOpacity>
            {selectedDateFilter && (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedDateFilter('');
                  setDateRange({});
                  setShowDateDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.dropdownItemText, { color: '#EF4444' }]}>Clear Filter</ThemedText>
              </TouchableOpacity>
            )}
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
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
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
    fontSize: 12,
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
    fontSize: 12,
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
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AllTransactionsScreen;

