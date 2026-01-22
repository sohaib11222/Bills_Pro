import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useBillPaymentTransactions } from '../../queries/transactionQueries';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const BillPaymentsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch recent bill payment transactions
  const { 
    data: billPaymentData, 
    isLoading, 
    error,
    refetch 
  } = useBillPaymentTransactions({ limit: 10 });

  // Handle refresh
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Helper function to get bill payment icon based on category
  const getBillPaymentIcon = (category?: string) => {
    switch (category) {
      case 'airtime':
        return require('../../assets/airtime.png');
      case 'data':
        return require('../../assets/datarecharge.png');
      case 'cable_tv':
        return require('../../assets/cable (2).png');
      case 'electricity':
        return require('../../assets/electricity.png');
      case 'internet':
        return require('../../assets/global.png');
      case 'betting':
        return require('../../assets/betting (2).png');
      default:
        return require('../../assets/airtime.png');
    }
  };

  // Helper function to get bill payment name
  const getBillPaymentName = (category?: string) => {
    switch (category) {
      case 'airtime':
        return 'Airtime Recharge';
      case 'data':
        return 'Data Recharge';
      case 'cable_tv':
        return 'Cable TV';
      case 'electricity':
        return 'Electricity Recharge';
      case 'internet':
        return 'Internet Subscription';
      case 'betting':
        return 'Betting';
      default:
        return 'Bill Payment';
    }
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '06 Oct, 25 - 08:00 PM';
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

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  // Map status
  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'completed': 'Successful',
      'pending': 'Pending',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || status;
  };

  // Format transactions for display
  const recentTransactions = useMemo(() => {
    if (!billPaymentData?.data) return [];

    return billPaymentData.data.slice(0, 5).map((tx: any) => {
      const metadata = tx.metadata || {};
      const status = mapStatus(tx.status);
      const isPending = tx.status === 'pending';
      
      // Build status text with additional info
      let statusText = status;
      if (tx.category === 'airtime' || tx.category === 'data') {
        const phoneNumber = metadata.phoneNumber || metadata.phone_number;
        if (phoneNumber) {
          statusText = `${status} - ${phoneNumber}`;
        }
      } else if (tx.category === 'cable_tv') {
        const decoderNumber = metadata.decoderNumber || metadata.decoder_number;
        if (decoderNumber) {
          statusText = `${status} - ${decoderNumber}`;
        }
      }

      return {
        key: tx.transaction_id || tx.id,
        name: getBillPaymentName(tx.category),
        status: statusText,
        statusColor: isPending ? '#F59E0B' : '#1B800F',
        amount: formatCurrency(tx.amount, tx.currency),
        date: formatDate(tx.created_at),
        iconSource: getBillPaymentIcon(tx.category),
        isPending,
        originalData: tx, // Preserve original data for navigation
      };
    });
  }, [billPaymentData]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ImageBackground
        source={require('../../assets/bill_payments_background.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Bill Payments</ThemedText>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1B800F"
            />
          }
        >
          {/* Bill category cards */}
          <View style={styles.cardsGrid}>
            {[
              {
                key: 'airtime',
                title: 'Airtime Recharge',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#FF0000',
                icon: require('../../assets/mobile.png'),
                borderColor: '#FF0000',
              },
              {
                key: 'data',
                title: 'Data Recharge',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#0000FF',
                icon: require('../../assets/global.png'),
                borderColor: '#0000FF',
              },
              {
                key: 'internet',
                title: 'Internet',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#800080',
                icon: require('../../assets/Vector (58).png'),
                borderColor: '#800080',
              },
              {
                key: 'electricity',
                title: 'Electricity',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#008000',
                icon: require('../../assets/flash.png'),
                borderColor: '#008000',
              },
              {
                key: 'cable',
                title: 'Cable TV',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#FFA500',
                icon: require('../../assets/monitor.png'),
                borderColor: '#FFA500',
              },
              {
                key: 'betting',
                title: 'Betting',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#A52A2A',
                icon: require('../../assets/Vector (59).png'),
                borderColor: '#A52A2A',
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.billCard, { borderColor: item.borderColor }]}
                onPress={() => {
                  if (item.key === 'airtime') {
                    navigation.navigate('AirtimeRecharge');
                  } else if (item.key === 'data') {
                    navigation.navigate('DataRecharge');
                  } else if (item.key === 'internet') {
                    navigation.navigate('InternetSubscription');
                  } else if (item.key === 'betting') {
                    navigation.navigate('Betting');
                  } else if (item.key === 'cable') {
                    navigation.navigate('CableTV');
                  } else if (item.key === 'electricity') {
                    navigation.navigate('Electricity');
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.billIconCircle}>
                  <Image
                    source={item.icon}
                    style={[styles.billIcon, { tintColor: item.color }]}
                    resizeMode="contain"
                  />
                </View>
                <ThemedText style={styles.billCardTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.billCardSubtitle}>{item.subtitle}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Transactions */}
          <ThemedText style={styles.recentTitle}>Recent Transactions</ThemedText>

          {isLoading && recentTransactions.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1B800F" />
              <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Failed to load transactions. Pull down to refresh.
              </ThemedText>
            </View>
          ) : recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No recent transactions</ThemedText>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((tx) => (
                <TouchableOpacity
                  key={tx.key}
                  style={styles.transactionItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('TransactionHistory', {
                      type: 'bill_payment',
                      transactionData: {
                        ...tx.originalData,
                        transaction_id: tx.originalData.transaction_id || tx.originalData.id,
                      },
                    });
                  }}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      tx.isPending && styles.transactionIconPending,
                    ]}
                  >
                    <Image
                      source={tx.iconSource}
                      style={styles.billPaymentIconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.transactionContent}>
                    <ThemedText style={styles.transactionType}>{tx.name}</ThemedText>
                    <ThemedText
                      style={[
                        styles.transactionStatus,
                        { color: tx.statusColor },
                        tx.isPending && styles.transactionStatusPending,
                      ]}
                    >
                      {tx.status}
                    </ThemedText>
                  </View>
                  <View style={styles.transactionRight}>
                    <ThemedText style={styles.transactionAmount}>{tx.amount}</ThemedText>
                    <ThemedText style={styles.transactionDate}>{tx.date}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    width,
    height: height * 0.23,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 53,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginTop: -85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  billCard: {
    width: (width - 16 * 2 - 16) / 3,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 18,
    marginBottom: 15,
    borderWidth: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  billIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  billIcon: {
    width: 24,
    height: 24,
  },
  billCardTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 4,
  },
  billCardSubtitle: {
    fontSize: 8,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 15,
  },
  transactionsList: {
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
  billPaymentIconImage: {
    width: 40,
    height: 40,
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
  transactionDate: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default BillPaymentsScreen;


