import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WithdrawCardScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [selectedAmount, setSelectedAmount] = useState<string>('10,000');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const quickAmounts = ['2,000', '5,000', '10,000', '202,000'];

  const calculateAmountToReceive = () => {
    const amount = parseFloat(withdrawAmount.replace(/,/g, '')) || 0;
    const exchangeRate = 1500; // N1,500 = $1
    const fee = 500;
    const total = amount * exchangeRate - fee;
    return total > 0 ? total.toLocaleString() : '0';
  };

  const handleProceed = () => {
    if (withdrawAmount) {
      setShowSummary(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Withdraw</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Virtual Card */}
        <ImageBackground
          source={require('../../assets/card_background.png')}
          style={styles.cardContainer}
          imageStyle={styles.cardImage}
          resizeMode="cover"
        >
          <View style={styles.cardTopRow}>
            <ThemedText style={styles.cardSmallText}>Online Payment Virtual Card</ThemedText>
            <View style={styles.cardTopRight}>
              <ThemedText style={styles.cardBrandText}>Bills</ThemedText>
              <View style={styles.cardEyeCircle}>
                <Image
                  source={require('../../assets/security-safe.png')}
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          <View style={styles.cardAmountRow}>
            <ThemedText style={styles.cardCurrency}>$</ThemedText>
            <ThemedText style={styles.cardAmount}>10,000.00</ThemedText>
          </View>

          <View style={styles.cardNumberRow}>
            <ThemedText style={styles.cardMaskedNumber}>**** **** **** 1234</ThemedText>
          </View>

          <View style={styles.cardBottomRow}>
            <ThemedText style={styles.cardHolderName}>Camardeen Abdul Malik</ThemedText>
            <Image
              source={require('../../assets/Group 2.png')}
              style={styles.mastercardLogo}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountRow}>
          {quickAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.quickAmountButton,
                selectedAmount === amount && styles.quickAmountButtonActive,
              ]}
              onPress={() => {
                setSelectedAmount(amount);
                setWithdrawAmount(amount);
              }}
            >
              <ThemedText
                style={[
                  styles.quickAmountText,
                  selectedAmount === amount && styles.quickAmountTextActive,
                ]}
              >
                {amount}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Withdrawal Amount Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <View style={styles.usFlagIcon}>
              <ThemedText style={styles.usFlagText}>🇺🇸</ThemedText>
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Withdrawal Amount"
            placeholderTextColor="#9CA3AF"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Amount to Receive */}
        <LinearGradient
          colors={['#D9FDD6', '#21D721']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.amountToReceiveContainer}
        >
          <ThemedText style={styles.amountToReceiveLabel}>You will receive</ThemedText>
          <ThemedText style={styles.amountToReceiveValue}>
            N{calculateAmountToReceive() || '0'}
          </ThemedText>
        </LinearGradient>

        {/* Exchange Rate & Fee Info */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/ArrowsDownUp.png')}
              style={styles.infoIcon}
              resizeMode="contain"
            />
            <ThemedText style={styles.infoText}>Exchange Rate :$1,500 = N1</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/CoinVertical (1).png')}
              style={styles.infoIcon}
              resizeMode="contain"
            />
            <ThemedText style={styles.infoText}>Fee :N500</ThemedText>
          </View>
        </View>

        {/* Information Message */}
        <View style={styles.infoMessageBox}>
          <ThemedText style={styles.infoMessageText}>
            The funds will be deposited into your naira wallet then you can withdraw into your local bank account
          </ThemedText>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceed}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Summary Modal */}
      <Modal
        visible={showSummary}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSummary(false)}
      >
        <Pressable
          style={styles.summaryModalOverlay}
          onPress={() => setShowSummary(false)}
        >
          <Pressable style={styles.summaryModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.summaryHeader}>
              <ThemedText style={styles.summaryTitle}>Summary</ThemedText>
              <TouchableOpacity
                style={styles.summaryCloseButton}
                onPress={() => setShowSummary(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Pending Status */}
            <View style={styles.pendingContainer}>
              <View style={styles.pendingIconOuter}>
                <View style={styles.pendingIconMiddle}>
                  <View style={styles.pendingIconInner}>
                    <Ionicons name="warning" size={40} color="#FFFFFF" />
                  </View>
                </View>
              </View>
              <ThemedText style={styles.pendingText}>Pending</ThemedText>
              <ThemedText style={styles.pendingDescription}>
                You are about to withdraw{' '}
                <ThemedText style={styles.pendingAmount}>${withdrawAmount || '0'}</ThemedText>
              </ThemedText>
            </View>

            {/* Transaction Details */}
            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Amount to withdraw</ThemedText>
                <ThemedText style={styles.summaryValue}>${withdrawAmount || '0'}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Exchange Rate</ThemedText>
                <ThemedText style={styles.summaryValue}>N1,500 = $1</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Amount you will receive</ThemedText>
                <ThemedText style={styles.summaryValue}>N{calculateAmountToReceive() || '0'}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Fee</ThemedText>
                <ThemedText style={styles.summaryValue}>N500</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Total Amount</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  N{(parseFloat(calculateAmountToReceive().replace(/,/g, '')) + 500 || 500).toLocaleString()}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Type</ThemedText>
                <ThemedText style={styles.summaryValue}>Card withdrawal</ThemedText>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.summaryButtons}>
              <TouchableOpacity
                style={styles.proceedSummaryButton}
                onPress={() => {
                  setShowSummary(false);
                  setShowSuccess(true);
                }}
              >
                <ThemedText style={styles.proceedSummaryButtonText}>Proceed</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSummary(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSuccess(false)}
        >
          <Pressable style={styles.successModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.successIconContainer}>
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
            <ThemedText style={styles.successTitle}>Success</ThemedText>
            <ThemedText style={styles.successMessage}>
              You have successfully withdrawn{' '}
              <ThemedText style={styles.successAmount}>${withdrawAmount || '0'}</ThemedText> from your virtual card
            </ThemedText>
            <View style={styles.successButtons}>
              <TouchableOpacity
                style={styles.transactionButton}
                onPress={() => {
                  setShowSuccess(false);
                  navigation.navigate('TransactionHistory', { type: 'withdrawal' });
                }}
              >
                <ThemedText style={styles.transactionButtonText}>Transaction</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeSuccessButton}
                onPress={() => setShowSuccess(false)}
              >
                <ThemedText style={styles.closeSuccessButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    width: width - 40,
    height: 190,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardImage: {
    borderRadius: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSmallText: {
    fontSize: 8,
    color: '#E5FBE0',
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBrandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 26,
  },
  cardCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardAmount: {
    fontSize: 30,
    fontWeight: '700',
    color: '#E5FBE0',
    marginLeft: 4,
  },
  cardEyeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  cardMaskedNumber: {
    fontSize: 16,
    letterSpacing: 2,
    color: '#E5FBE0',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  cardHolderName: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  mastercardLogo: {
    width: 40,
    height: 24,
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAmountButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#D6F5D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickAmountButtonActive: {
    borderColor: '#1B800F',
    backgroundColor: '#F0FDF4',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B800F',
  },
  quickAmountTextActive: {
    color: '#1B800F',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  usFlagIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usFlagText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  amountToReceiveContainer: {
    borderRadius: 16,
    padding: 20,
    paddingVertical: 25,
    marginBottom: 16,
  },
  amountToReceiveLabel: {
    fontSize: 10,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  amountToReceiveValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#FFA50026',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  infoMessageBox: {
    backgroundColor: '#FFA50026',
    borderRadius: 20,
    padding: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  infoMessageText: {
    fontSize: 10,
    color: '#FFA500',
    lineHeight: 20,
  },
  proceedButton: {
    backgroundColor: '#42AC36',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  proceedButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  // Summary Modal
  summaryModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
  },
  summaryCloseButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  pendingContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pendingIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  pendingIconMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE5CC',
  },
  pendingIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 12,
  },
  pendingDescription: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
  },
  pendingAmount: {
    fontWeight: '700',
    color: '#111827',
  },
  summaryDetails: {
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#EFEFEF',
    marginHorizontal: 20,
    borderRadius: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
  },
  summaryButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  proceedSummaryButton: {
    flex: 1,
    backgroundColor: '#42AC36',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedSummaryButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  // Success Modal Styles
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    width: width - 48,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D6F5D9',
    justifyContent: 'center',
    alignItems: 'center',
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
  successMessage: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  successAmount: {
    fontWeight: '700',
    color: '#111827',
  },
  successButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  transactionButton: {
    flex: 1,
    backgroundColor: '#1B800F',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  closeSuccessButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSuccessButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
});

export default WithdrawCardScreen;

