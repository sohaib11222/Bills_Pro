import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import type { RouteProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TransactionHistoryRouteProp = RouteProp<RootStackParamList, 'TransactionHistory'>;

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<TransactionHistoryRouteProp>();
  const transactionType = route.params?.type || route.params?.transactionData?.type || 'funding';
  const transactionData = route.params?.transactionData;
  
  // Determine if it's a deposit or withdrawal based on transaction type
  const isDeposit = transactionType === 'deposit' || transactionType === 'funding' || 
                    transactionData?.type === 'Funds Deposit';
  const isWithdrawal = transactionType === 'withdrawal' || transactionType === 'withdraw' || 
                       transactionData?.type === 'Funds Withdrawal';
  const isBillPayment = transactionType === 'bill_payment' || !!(transactionData as any)?.category;
  const isCrypto = transactionType === 'crypto' || !!(transactionData as any)?.cryptoType;
  const isVirtualCard = transactionType === 'virtual_card' || !!(transactionData as any)?.virtualCardType;
  
  // Get bill payment type
  const billPaymentType = transactionData?.type || '';
  const isAirtime = billPaymentType === 'Airtime Recharge';
  const isData = billPaymentType === 'Data Recharge';
  const isElectricity = billPaymentType === 'Electricity Recharge';
  const isCableTV = billPaymentType === 'Cable TV';
  const isBetting = billPaymentType === 'Betting';
  const isInternet = billPaymentType === 'Internet Subscription';
  
  // Get crypto transaction type
  const cryptoType = (transactionData as any)?.cryptoType || '';
  const isCryptoReceive = cryptoType === 'Receive';
  const isCryptoSend = cryptoType === 'Send';
  const isCryptoBuy = cryptoType === 'Buy';
  const isCryptoSell = cryptoType === 'Sell';
  
  // Get virtual card transaction type
  const virtualCardType = (transactionData as any)?.virtualCardType || '';
  const isCardFunding = virtualCardType === 'Fund' || (transactionData as any)?.type === 'Card Funding';
  const isCardWithdrawal = virtualCardType === 'Withdraw' || (transactionData as any)?.type === 'Card Withdrawal';
  const isCardPayment = virtualCardType === 'Payments' || (transactionData as any)?.type?.includes('Card Payment');
  
  const amount = transactionData?.amount ? `N${transactionData.amount}` : (isBillPayment ? 'N5,000' : isCrypto ? '' : 'N200,000');
  const date = transactionData?.date || '6th Nov, 2025 - 07:22 AM';
  
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
    if (transactionData?.type?.includes('BTC')) return 'BTC';
    if (transactionData?.type?.includes('ETH')) return 'ETH';
    if (transactionData?.type?.includes('USDT')) return 'USDT';
    if (transactionData?.type?.includes('USDC')) return 'USDC';
    return 'BTC';
  };
  
  // Get crypto amount for display
  const getCryptoAmount = () => {
    if (isCrypto && isCryptoSend) {
      const amountValue = transactionData?.amount || '0.00023';
      return `${amountValue} ${getCryptoSymbol()}`;
    }
    if (isCrypto) {
      return (transactionData as any)?.cryptoAmount || '0.00023 BTC';
    }
    return amount;
  };

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
            {isCrypto ? getCryptoAmount() : isVirtualCard ? (transactionData as any)?.amount || '$10' : amount}
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
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.amount || '$10'}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Payment method</ThemedText>
                    <ThemedText style={styles.detailValue}>Naira Wallet</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Exchange Rate</ThemedText>
                    <ThemedText style={styles.detailValue}>N1,500 = $1</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount to pay</ThemedText>
                    <ThemedText style={styles.detailValue}>N15,000</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>N500</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>N15,500</ThemedText>
                  </View>
                </>
              )}
              {isCardWithdrawal && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount to withdraw</ThemedText>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.amount || '$10'}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Exchange Rate</ThemedText>
                    <ThemedText style={styles.detailValue}>N1,500 = $1</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount you will receive</ThemedText>
                    <ThemedText style={styles.detailValue}>N15,000</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>N500</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>N15,500</ThemedText>
                  </View>
                </>
              )}
              {isCardPayment && (
                <>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.amount || '$10'}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Fee</ThemedText>
                    <ThemedText style={styles.detailValue}>$0.1</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Total Amount</ThemedText>
                    <ThemedText style={styles.detailValue}>$10.10</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Payment reason</ThemedText>
                    <ThemedText style={styles.detailValue}>{(transactionData as any)?.paymentReason || 'Paypal'}</ThemedText>
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

