import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import type { RouteProp } from '@react-navigation/native';
import { useTransactionDetails } from '../../queries/transactionQueries';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TransactionHistoryRouteProp = RouteProp<RootStackParamList, 'TransactionHistory'>;

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<TransactionHistoryRouteProp>();
  const transactionType = route.params?.type || route.params?.transactionData?.type || 'funding';
  const routeTransactionData = route.params?.transactionData;
  
  // Get transaction ID from route data
  const transactionId = routeTransactionData?.transaction_id || routeTransactionData?.id;
  const walletType = routeTransactionData?.wallet_type;
  const isVirtualCardTransaction = walletType === 'virtual_card' || 
                                   transactionType === 'virtual_card' ||
                                   ['card_funding', 'card_withdrawal'].includes(routeTransactionData?.type);
  
  // Log received transaction data
  console.log('🟢 TransactionHistoryScreen - Received route data:', {
    transactionId,
    walletType,
    transactionType,
    isVirtualCardTransaction,
    routeTransactionData: routeTransactionData ? {
      transaction_id: routeTransactionData.transaction_id,
      id: routeTransactionData.id,
      type: routeTransactionData.type,
      wallet_type: routeTransactionData.wallet_type,
      amount: routeTransactionData.amount,
      currency: routeTransactionData.currency,
      status: routeTransactionData.status,
      metadata: routeTransactionData.metadata,
    } : null,
  });
  
  // For virtual card transactions, don't fetch via regular transaction endpoint
  // as they might not exist in the Transaction model
  // Instead, use the route data directly
  const shouldFetchDetails = !!transactionId && !isVirtualCardTransaction;
  
  // Fetch transaction details if we have an ID and it's not a virtual card transaction
  const { 
    data: transactionDetailsData, 
    isLoading, 
    error 
  } = useTransactionDetails(shouldFetchDetails ? transactionId : '');
  
  // Use API data if available, otherwise fall back to route data
  const transactionData = useMemo(() => {
    if (transactionDetailsData?.data && !isVirtualCardTransaction) {
      console.log('🟡 Using fetched transaction details data');
      return transactionDetailsData.data;
    }
    // For virtual card transactions, use route data directly
    if (isVirtualCardTransaction && routeTransactionData) {
      console.log('🟡 Using route transaction data for virtual card:', {
        transaction_id: routeTransactionData.transaction_id,
        id: routeTransactionData.id,
        type: routeTransactionData.type,
        amount: routeTransactionData.amount,
        currency: routeTransactionData.currency,
        metadata: routeTransactionData.metadata,
      });
      return routeTransactionData;
    }
    console.log('🟡 Using route transaction data as fallback');
    return routeTransactionData;
  }, [transactionDetailsData, routeTransactionData, isVirtualCardTransaction]);
  
  // Loading state (only show if we're actually fetching)
  if (isLoading && shouldFetchDetails && !routeTransactionData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#1B800F" />
        <ThemedText style={{ marginTop: 16, color: '#6B7280' }}>Loading transaction...</ThemedText>
      </View>
    );
  }
  
  // Error state (only show if we tried to fetch and failed, and have no route data)
  // For virtual card transactions, ignore API errors since we use route data
  if (error && shouldFetchDetails && !routeTransactionData && !isVirtualCardTransaction) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <ThemedText style={{ marginTop: 16, color: '#EF4444', textAlign: 'center' }}>
          Failed to load transaction
        </ThemedText>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <ThemedText style={{ color: '#1B800F' }}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!transactionData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <StatusBar style="dark" />
        <ThemedText style={{ color: '#6B7280', textAlign: 'center' }}>
          Transaction not found
        </ThemedText>
        <TouchableOpacity
          style={[styles.backButton, { marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <ThemedText style={{ color: '#1B800F' }}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Determine transaction type from API data
  const txType = transactionData?.type || '';
  const txCategory = transactionData?.category || '';
  // walletType is already declared above, use it from transactionData if available
  const finalWalletType = (transactionData as any)?.wallet_type || walletType;
  
  // Determine if it's a deposit or withdrawal based on transaction type
  const isDeposit = transactionType === 'deposit' || transactionType === 'funding' || 
                    txType === 'deposit' || txType === 'crypto_buy' || txType === 'card_funding';
  const isWithdrawal = transactionType === 'withdrawal' || transactionType === 'withdraw' || 
                       txType === 'withdrawal' || txType === 'crypto_withdrawal' || txType === 'card_withdrawal';
  const isBillPayment = transactionType === 'bill_payment' || txType === 'bill_payment' || 
                        ['airtime', 'data', 'electricity', 'cable_tv', 'internet', 'betting'].includes(txCategory);
  const isCrypto = transactionType === 'crypto' || finalWalletType === 'crypto' || 
                   ['crypto_buy', 'crypto_sell', 'crypto_withdrawal'].includes(txType);
  const isVirtualCard = transactionType === 'virtual_card' || finalWalletType === 'virtual_card' || 
                        ['card_funding', 'card_withdrawal'].includes(txType);
  
  // Get bill payment type from category
  const isAirtime = txCategory === 'airtime' || (transactionData as any)?.type === 'Airtime Recharge';
  const isData = txCategory === 'data' || (transactionData as any)?.type === 'Data Recharge';
  const isElectricity = txCategory === 'electricity' || (transactionData as any)?.type === 'Electricity Recharge';
  const isCableTV = txCategory === 'cable_tv' || (transactionData as any)?.type === 'Cable TV';
  const isBetting = txCategory === 'betting' || (transactionData as any)?.type === 'Betting';
  const isInternet = txCategory === 'internet' || (transactionData as any)?.type === 'Internet Subscription';
  
  // Get crypto transaction type from API type
  const isCryptoReceive = txType === 'crypto_buy';
  const isCryptoSend = txType === 'crypto_withdrawal';
  const isCryptoBuy = txType === 'crypto_buy';
  const isCryptoSell = txType === 'crypto_sell';
  
  // Get virtual card transaction type from API type
  const isCardFunding = txType === 'card_funding' || (transactionData as any)?.type === 'Card Funding';
  const isCardWithdrawal = txType === 'card_withdrawal' || (transactionData as any)?.type === 'Card Withdrawal';
  const isCardPayment = txType === 'card_withdrawal' && (transactionData?.metadata as any)?.paymentReason;
  
  // Format amount and date from API data
  const formatAmount = () => {
    if (!transactionData?.amount) return isBillPayment ? 'N5,000' : isCrypto ? '' : 'N200,000';
    const currency = transactionData.currency || 'NGN';
    if (currency === 'NGN') {
      return `₦${Number(transactionData.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currency === 'USD') {
      return `$${Number(transactionData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Number(transactionData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString && transactionData?.created_at) {
      dateString = transactionData.created_at;
    }
    if (!dateString) return '6th Nov, 2025 - 07:22 AM';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'AM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${day}${getOrdinalSuffix(day)} ${month}, ${year} - ${displayHours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const amount = formatAmount();
  const date = formatDate(transactionData?.date);
  
  // Log complete transaction data for debugging
  if (isVirtualCard) {
    console.log('🟣 Complete Virtual Card Transaction Data:', {
      transaction_id: transactionData?.transaction_id,
      id: transactionData?.id,
      type: transactionData?.type,
      wallet_type: transactionData?.wallet_type,
      amount: transactionData?.amount,
      currency: transactionData?.currency,
      fee: transactionData?.fee,
      total_amount: transactionData?.total_amount,
      status: transactionData?.status,
      reference: transactionData?.reference,
      description: transactionData?.description,
      metadata: transactionData?.metadata,
      created_at: transactionData?.created_at,
      fullTransactionData: transactionData,
    });
  }
  
  // Helper functions for virtual card transaction data
  const getVirtualCardMetadata = () => {
    const metadata = (transactionData as any)?.metadata || {};
    console.log('🔵 Virtual Card Metadata:', {
      metadata,
      hasExchangeRate: !!metadata.exchange_rate,
      hasPaymentWalletType: !!metadata.payment_wallet_type,
      hasAmountUsd: !!metadata.amount_usd,
    });
    return metadata;
  };

  const formatVirtualCardAmount = (amountValue: number | string, currency: string = 'USD') => {
    const numAmount = Number(amountValue) || 0;
    console.log('🔵 Formatting amount:', { amountValue, numAmount, currency });
    if (currency === 'USD') {
      return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currency === 'NGN') {
      return `₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const getExchangeRate = () => {
    const metadata = getVirtualCardMetadata();
    const rate = metadata.exchange_rate || metadata.exchangeRate;
    if (rate) {
      return `₦${Number(rate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = $1`;
    }
    return 'N1,500 = $1'; // Fallback
  };

  const getPaymentWalletType = () => {
    const metadata = getVirtualCardMetadata();
    const walletType = metadata.payment_wallet_type || metadata.paymentWalletType;
    if (walletType === 'naira_wallet') return 'Naira Wallet';
    if (walletType === 'crypto') return 'Crypto Wallet';
    return 'Naira Wallet'; // Default
  };

  const getPaymentWalletCurrency = () => {
    const metadata = getVirtualCardMetadata();
    return metadata.payment_wallet_currency || metadata.paymentWalletCurrency || 'NGN';
  };

  const getAmountInPaymentCurrency = () => {
    const metadata = getVirtualCardMetadata();
    const paymentCurrency = getPaymentWalletCurrency();
    
    if (isCardFunding) {
      // For card funding from Transaction model: amount is in payment currency
      // For card funding from VirtualCardTransaction model: amount is in USD
      if (transactionData?.currency === paymentCurrency) {
        // From Transaction model - amount is already in payment currency
        return formatVirtualCardAmount(transactionData?.amount || 0, paymentCurrency);
      } else {
        // From VirtualCardTransaction model - amount is in USD, need to convert
        const usdAmount = Number(transactionData?.amount) || 0;
        const exchangeRate = Number(metadata.exchange_rate || metadata.exchangeRate) || 1500;
        const ngnAmount = usdAmount * exchangeRate;
        return formatVirtualCardAmount(ngnAmount, paymentCurrency);
      }
    } else if (isCardWithdrawal) {
      // For withdrawal from Transaction model: amount is NGN (amount received)
      // For withdrawal from VirtualCardTransaction model: amount is USD
      if (transactionData?.currency === 'NGN') {
        // From Transaction model - amount is already in NGN (amount received)
        return formatVirtualCardAmount(transactionData?.amount || 0, 'NGN');
      } else {
        // From VirtualCardTransaction model - amount is in USD, calculate NGN
        const usdAmount = Number(transactionData?.amount) || 0;
        const exchangeRate = Number(metadata.exchange_rate || metadata.exchangeRate) || 1500;
        const ngnAmount = usdAmount * exchangeRate;
        return formatVirtualCardAmount(ngnAmount, 'NGN');
      }
    }
    
    return formatVirtualCardAmount(transactionData?.amount || 0, transactionData?.currency || 'USD');
  };

  const getFeeInPaymentCurrency = () => {
    const fee = Number(transactionData?.fee) || 0;
    if (isCardFunding) {
      const paymentCurrency = getPaymentWalletCurrency();
      return formatVirtualCardAmount(fee, paymentCurrency);
    } else if (isCardWithdrawal) {
      // Fee is in NGN for withdrawals
      return formatVirtualCardAmount(fee, 'NGN');
    }
    return formatVirtualCardAmount(fee, transactionData?.currency || 'USD');
  };

  const getTotalAmountInPaymentCurrency = () => {
    const totalAmount = Number(transactionData?.total_amount) || 0;
    if (isCardFunding) {
      const paymentCurrency = getPaymentWalletCurrency();
      return formatVirtualCardAmount(totalAmount, paymentCurrency);
    } else if (isCardWithdrawal) {
      // For withdrawal, total_amount is the NGN amount (including fee) that was converted
      return formatVirtualCardAmount(totalAmount, 'NGN');
    }
    return formatVirtualCardAmount(totalAmount, transactionData?.currency || 'USD');
  };

  const getPaymentReason = () => {
    const metadata = getVirtualCardMetadata();
    return metadata.paymentReason || metadata.payment_reason || metadata.merchant_name || metadata.merchantName || 'N/A';
  };
  
  // Get success message based on transaction type
  const getSuccessMessage = () => {
    if (isVirtualCard) {
      if (isCardFunding) return `You have successfully funded your virtual card with a sum of `;
      if (isCardWithdrawal) return `You have successfully withdrawn `;
      if (isCardPayment) return `You have successfully made a payment of `;
      return `You have successfully completed a virtual card transaction of `;
    }
    if (isCrypto) {
      if (isCryptoReceive) return `You have successfully completed a deposit of `;
      if (isCryptoSend) return `You have successfully completed a withdrawal of `;
      if (isCryptoBuy) return `You have successfully completed a purchase of `;
      if (isCryptoSell) return `You have successfully completed a sale of `;
      return `You have successfully completed a crypto transaction of `;
    }
    if (isBillPayment) {
      if (isAirtime) return `You have successfully completed an airtime recharge of `;
      if (isData) return `You have successfully completed a data recharge of `;
      if (isElectricity) return `You have successfully completed an electricity recharge of `;
      if (isCableTV) return `You have successfully completed a cable TV recharge of `;
      if (isBetting) return `You have successfully completed a betting transaction of `;
      if (isInternet) return `You have successfully completed an internet subscription of `;
      return `You have successfully completed a bill payment of `;
    }
    if (isWithdrawal) return `You have successfully completed a withdrawal of `;
    return `You have successfully completed a deposit of `;
  };
  
  // Get virtual card withdrawal message suffix
  const getVirtualCardWithdrawalSuffix = () => {
    if (isCardWithdrawal) return ` from your virtual card`;
    return ``;
  };
  
  // Get crypto symbol for display
  const getCryptoSymbol = () => {
    const currency = transactionData?.currency || '';
    if (currency.includes('BTC') || currency === 'BTC') return 'BTC';
    if (currency.includes('ETH') || currency === 'ETH') return 'ETH';
    if (currency.includes('USDT') || currency === 'USDT') return 'USDT';
    if (currency.includes('USDC') || currency === 'USDC') return 'USDC';
    return currency || 'BTC';
  };
  
  // Get crypto amount for display
  const getCryptoAmount = () => {
    if (isCrypto) {
      const amountValue = transactionData?.amount || 0;
      const symbol = getCryptoSymbol();
      return `${amountValue} ${symbol}`;
    }
    return amount;
  };
  
  // Get metadata for display
  const metadata = transactionData?.metadata || {};
  const getBillPaymentDetails = () => {
    if (isBillPayment) {
      return {
        phoneNumber: metadata.phoneNumber || metadata.phone_number,
        billerType: metadata.provider || metadata.billerName,
        decoderNumber: metadata.decoderNumber || metadata.decoder_number,
        dataPlan: metadata.planName || metadata.plan_name,
        accountName: metadata.accountName || metadata.account_name,
        meterNumber: metadata.meterNumber || metadata.meter_number,
        accountType: metadata.accountType || metadata.account_type,
      };
    }
    return {};
  };
  
  const billPaymentDetails = getBillPaymentDetails();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Section with Background */}
      <ImageBackground
        source={require('../../assets/Rectangle 30 (1).png')}
        style={styles.topBackground}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Transaction History</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Success Icon and Message */}
        <View style={styles.successSection}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconMiddle}>
              <View style={styles.successIconInner}>
                <Image
                  source={require('../../assets/tick-04.png')}
                  style={styles.successCheckmark}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
      
      <View style={styles.successMessageContainer}>
        <ThemedText style={styles.successTitle}>Success</ThemedText>
        <ThemedText style={styles.successMessage}>
          {getSuccessMessage()}
          <ThemedText style={styles.successAmount}>
            {isCrypto ? getCryptoAmount() : isVirtualCard ? formatVirtualCardAmount(transactionData?.amount || 0, transactionData?.currency || 'USD') : amount}
          </ThemedText>
          {getVirtualCardWithdrawalSuffix()}
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Transaction Details Card */}
        <View style={styles.detailsCard}>
          {/* Virtual Card Transaction Fields */}
          {isVirtualCard ? (
            <>
              {isCardFunding && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount to fund</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {formatVirtualCardAmount(transactionData?.amount || 0, transactionData?.currency || 'USD')}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Payment method</ThemedText>
                    <ThemedText style={styles.detailValue}>{getPaymentWalletType()}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Exchange Rate</ThemedText>
                    <ThemedText style={styles.detailValue}>{getExchangeRate()}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount to pay</ThemedText>
                    <ThemedText style={styles.detailValue}>{getAmountInPaymentCurrency()}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>{getFeeInPaymentCurrency()}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>{getTotalAmountInPaymentCurrency()}</ThemedText>
                  </View>
                </>
              )}
              {isCardWithdrawal && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount to withdraw</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {formatVirtualCardAmount(transactionData?.amount || 0, transactionData?.currency || 'USD')}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Exchange Rate</ThemedText>
                    <ThemedText style={styles.detailValue}>{getExchangeRate()}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount you will receive</ThemedText>
                    <ThemedText style={styles.detailValue}>{getAmountInPaymentCurrency()}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>{getFeeInPaymentCurrency()}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>{getTotalAmountInPaymentCurrency()}</ThemedText>
                  </View>
                </>
              )}
              {isCardPayment && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {formatVirtualCardAmount(transactionData?.amount || 0, transactionData?.currency || 'USD')}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {formatVirtualCardAmount(transactionData?.fee || 0, transactionData?.currency || 'USD')}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {formatVirtualCardAmount(transactionData?.total_amount || transactionData?.amount || 0, transactionData?.currency || 'USD')}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Payment reason</ThemedText>
                    <ThemedText style={styles.detailValue}>{getPaymentReason()}</ThemedText>
                  </View>
                </>
              )}
            </>
          ) : isCrypto ? (
            <>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Amount</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {isCryptoSend 
                    ? `${(transactionData as any)?.amount || '0.0023'} ${getCryptoSymbol()}` 
                    : (transactionData as any)?.cryptoAmount || '0.0023 BTC'}
                </ThemedText>
              </View>
              {(isCryptoSend || isCryptoBuy || isCryptoSell) && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                  <ThemedText style={styles.detailValue}>0.0000000012 {getCryptoSymbol()}</ThemedText>
                </View>
              )}
              {(isCryptoSend || isCryptoBuy || isCryptoSell) && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {isCryptoSend 
                      ? `${(transactionData as any)?.amount || '0.000023'} ${getCryptoSymbol()}` 
                      : '0.000023 BTC'}
                  </ThemedText>
                </View>
              )}
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Amount in USD</ThemedText>
                <ThemedText style={styles.detailValue}>{(transactionData as any)?.usdValue || '$20,000'}</ThemedText>
              </View>
              {isCryptoSell && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Amount to receive</ThemedText>
                  <ThemedText style={styles.detailValue}>{(transactionData as any)?.amountToReceive || 'N200,000'}</ThemedText>
                </View>
              )}
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Network</ThemedText>
                <ThemedText style={styles.detailValue}>{(transactionData as any)?.network || 'Bitcoin'}</ThemedText>
              </View>
              {isCryptoSell && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Payment method</ThemedText>
                  <ThemedText style={styles.detailValue}>{(transactionData as any)?.paymentMethod || 'Naira'}</ThemedText>
                </View>
              )}
              {isCryptoReceive && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>From Address</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>1234567890sk2kdmwkdqkdskw</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>To Address</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>1234567890sk2kdmwkdqkdskw</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              {isCryptoSend && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Address</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.address || '1234567890sk2kdmwkdqkdskw'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {(transactionData as any)?.txHash && (
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Tx Hash</ThemedText>
                      <View style={styles.copyRow}>
                        <ThemedText style={styles.detailValue}>{(transactionData as any)?.txHash}</ThemedText>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  {(transactionData as any)?.transactionId && (
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Transaction id</ThemedText>
                      <View style={styles.copyRow}>
                        <ThemedText style={styles.detailValue}>{(transactionData as any)?.transactionId}</ThemedText>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
              {isCryptoSend && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Tx Hash</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.txHash || '1234567890sk2kdmwkdqkdskw'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {(transactionData as any)?.transactionId && (
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Transaction id</ThemedText>
                      <View style={styles.copyRow}>
                        <ThemedText style={styles.detailValue}>{(transactionData as any)?.transactionId}</ThemedText>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
              {!isCryptoSend && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Tx Hash</ThemedText>
                  <View style={styles.copyRow}>
                    <ThemedText style={styles.detailValue}>1234567890sk2kdmwkdqkdskw</ThemedText>
                    <TouchableOpacity>
                      <Ionicons name="copy-outline" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : isBillPayment ? (
            <>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>
                  {isBetting ? 'Betting Platform' : 'Biller type'}
                </ThemedText>
                <ThemedText style={styles.detailValue}>{(transactionData as any)?.billerType || 'MTN'}</ThemedText>
              </View>
              
              {/* Airtime Recharge */}
              {isAirtime && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Phone Number</ThemedText>
                  <View style={styles.copyRow}>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.phoneNumber || '070123456789'}</ThemedText>
                    <TouchableOpacity>
                      <Ionicons name="copy-outline" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {/* Data Recharge */}
              {isData && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Data Plan</ThemedText>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.dataPlan || '1 GIG for 1 month'}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Phone Number</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.phoneNumber || '070123456789'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              
              {/* Electricity Recharge */}
              {isElectricity && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Meter Number</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.meterNumber || '123466789988'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Account type</ThemedText>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.accountType || 'Prepaid'}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Account name</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.accountName || 'Qamardeen Abdulmalik'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              
              {/* Internet Subscription */}
              {isInternet && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Data Plan</ThemedText>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.dataPlan || '1 GIG for 1 month'}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Router Number</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.routerNumber || '070123456789'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              
              {/* Betting */}
              {isBetting && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>User ID</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.userId || (transactionData as any)?.userID || '123466789988'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              
              {/* Cable TV */}
              {isCableTV && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Decoder Number</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.decoderNumber || '123466789988'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Plan type</ThemedText>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.planType || 'DStv Yanga'}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Account name</ThemedText>
                    <View style={styles.copyRow}>
                      <ThemedText style={styles.detailValue}>{(transactionData as any)?.accountName || 'Qamardeen Abdulmalik'}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              
              {/* Betting */}
              {isBetting && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>User ID</ThemedText>
                  <View style={styles.copyRow}>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.userID || '123466789988'}</ThemedText>
                    <TouchableOpacity>
                      <Ionicons name="copy-outline" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              {/* Deposit/Withdrawal Fields */}
              {isDeposit && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {transactionData?.amount || amount}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {transactionData?.fee || 'N200'}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {transactionData?.totalAmount || 'N200,200'}
                    </ThemedText>
                  </View>
                </>
              )}
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Bank Name</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {isWithdrawal ? 'Access Bank' : transactionData?.bankName || 'Gratuity Bank'}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Account Number</ThemedText>
                <View style={styles.copyRow}>
                  <ThemedText style={styles.detailValue}>
                    {transactionData?.accountNumber || '113456789'}
                  </ThemedText>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Account Name</ThemedText>
                <View style={styles.copyRow}>
                  <ThemedText style={styles.detailValue}>
                    {isWithdrawal ? 'Qamardeen Abdul Malik' : transactionData?.accountName || 'Yellow card Financial'}
                  </ThemedText>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              {!isWithdrawal && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Reference</ThemedText>
                  <View style={styles.copyRow}>
                    <ThemedText style={styles.detailValue}>
                      {transactionData?.reference || '123456789'}
                    </ThemedText>
                    <TouchableOpacity>
                      <Ionicons name="copy-outline" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Transaction id</ThemedText>
            <View style={styles.copyRow}>
              <ThemedText style={styles.detailValue}>2348hf8283hfc92eni</ThemedText>
              <TouchableOpacity>
                <Ionicons name="copy-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Date</ThemedText>
            <ThemedText style={styles.detailValue}>
              {isVirtualCard
                ? (isCardFunding ? 'Card funding'
                  : isCardWithdrawal ? 'Card withdrawal'
                  : isCardPayment ? 'Card payment'
                  : 'Virtual Card Transaction')
                : isCrypto
                ? (isCryptoReceive ? 'Crypto Deposit'
                  : isCryptoSend ? 'Crypto Withdrawal'
                  : isCryptoBuy ? 'Crypto Buy'
                  : isCryptoSell ? 'Crypto Sell'
                  : 'Crypto Transaction')
                : isBillPayment 
                ? (isAirtime ? 'Airtime Recharge' 
                  : isData ? 'Data Recharge'
                  : isElectricity ? 'Electricity'
                  : isCableTV ? 'Cable Tv'
                  : isBetting ? 'Betting'
                  : 'Bill Payment')
                : (isWithdrawal ? 'Fiat Withdrawal' : 'Fiat Deposit')}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Date</ThemedText>
            <ThemedText style={styles.detailValue}>{date}</ThemedText>
          </View>
        </View>
        
        {/* Token Section for Electricity */}
        {isElectricity && (transactionData as any)?.token && (
          <View style={styles.tokenCard}>
            <ThemedText style={styles.tokenLabel}>Token</ThemedText>
            <ThemedText style={styles.tokenValue}>{(transactionData as any).token}</ThemedText>
            <TouchableOpacity style={styles.copyTokenButton}>
              <ThemedText style={styles.copyTokenButtonText}>Copy Token</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Share Receipt or View on Blockchain Button */}
        <TouchableOpacity style={styles.shareButton}>
          <ThemedText style={styles.shareButtonText}>
            {isCrypto ? 'View on blockchain' : 'Share Receipt'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBackground: {
    width,
    paddingBottom: 40,
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  successSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D6F5D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconMiddle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1B800F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1B800F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheckmark: {
    width: 50,
    height: 50,
    tintColor: '#FFFFFF',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B800F',
    marginBottom: 12,
  },
  successMessageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  successMessage: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
  },
  successAmount: {
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  detailsCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
   
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  transactionIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
  },
  tokenCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  tokenLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: 1,
  },
  copyTokenButton: {
    borderWidth: 1,
    borderColor: '#1B800F',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  copyTokenButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1B800F',
  },
});

export default TransactionHistoryScreen;

