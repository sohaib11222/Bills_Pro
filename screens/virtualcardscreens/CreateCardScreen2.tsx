import React, { useState, useMemo } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useCreateVirtualCard } from '../../mutations/virtualCardMutations';
import { useWalletBalance } from '../../queries/walletQueries';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type CardColor = {
  id: string;
  name: string;
  tintColor: string;
  backgroundColor: string;
};

// Constants
const CARD_CREATION_FEE_USD = 3;
const PROCESSING_FEE_NGN = 500;
const EXCHANGE_RATE = 1500; // $1 = N1,500

const CreateCardScreen2 = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [cardName, setCardName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<CardColor | null>(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<'naira' | 'crypto'>('naira');
  const [showSummary, setShowSummary] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  
  // Billing address state
  const [billingCountry, setBillingCountry] = useState('Nigeria');
  const [billingState, setBillingState] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingStreet, setBillingStreet] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  
  // API hooks
  const createCardMutation = useCreateVirtualCard();
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalance();
  
  // Extract wallet balances
  const nairaBalance = walletData?.data?.fiat?.balance || 0;
  const cryptoBalanceUsd = walletData?.data?.crypto?.total_usd || 0;

  const cardColors: CardColor[] = [
    { id: 'green', name: 'Green', tintColor: '#1B800F', backgroundColor: '#1B800F' },
    { id: 'brown', name: 'Brown', tintColor: '#291603', backgroundColor: '#8B4513' },
    { id: 'purple', name: 'Purple', tintColor: '#6B46C1', backgroundColor: '#6B46C1' },
  ];

  // Calculate total fee based on selected wallet
  const totalFee = useMemo(() => {
    if (selectedWallet === 'naira') {
      // Card fee in NGN + processing fee
      const cardFeeInNgn = CARD_CREATION_FEE_USD * EXCHANGE_RATE;
      return {
        currency: 'NGN',
        amount: cardFeeInNgn + PROCESSING_FEE_NGN,
        cardFee: cardFeeInNgn,
        processingFee: PROCESSING_FEE_NGN,
      };
    } else {
      // Crypto wallet: fee in USD
      return {
        currency: 'USD',
        amount: CARD_CREATION_FEE_USD,
        cardFee: CARD_CREATION_FEE_USD,
        processingFee: 0,
      };
    }
  }, [selectedWallet]);

  // Check if user has sufficient balance
  const hasSufficientBalance = useMemo(() => {
    if (selectedWallet === 'naira') {
      return nairaBalance >= totalFee.amount;
    } else {
      return cryptoBalanceUsd >= totalFee.amount;
    }
  }, [selectedWallet, nairaBalance, cryptoBalanceUsd, totalFee]);

  const handleProceed = () => {
    if (!cardName.trim()) {
      Alert.alert('Validation Error', 'Please enter a card name');
      return;
    }

    if (!selectedColor) {
      Alert.alert('Validation Error', 'Please select a card color');
      return;
    }

    if (!hasSufficientBalance) {
      const currency = selectedWallet === 'naira' ? 'NGN' : 'USD';
      const balance = selectedWallet === 'naira' ? nairaBalance : cryptoBalanceUsd;
      Alert.alert(
        'Insufficient Balance',
        `You need ${totalFee.amount.toLocaleString()} ${currency} to create a card. Your current balance is ${balance.toLocaleString()} ${currency}.`
      );
      return;
    }

    // Check if billing details are filled
    if (!billingCountry.trim() || !billingState.trim() || !billingCity.trim() || !billingStreet.trim() || !billingPostalCode.trim()) {
      setShowBillingModal(true);
      return;
    }

    setShowSummary(true);
  };

  const handleCreateCard = async () => {
    try {
      const requestData = {
        card_name: cardName.trim(),
        card_color: selectedColor?.id as 'green' | 'brown' | 'purple',
        payment_wallet_type: selectedWallet === 'naira' ? 'naira_wallet' : 'crypto_wallet',
        payment_wallet_currency: selectedWallet === 'naira' ? 'NGN' : undefined,
        billing_address_street: billingStreet.trim(),
        billing_address_city: billingCity.trim(),
        billing_address_state: billingState.trim(),
        billing_address_country: billingCountry.trim(),
        billing_address_postal_code: billingPostalCode.trim(),
      };

      console.log('🔵 Create Card - Request Data:', JSON.stringify(requestData, null, 2));

      const result = await createCardMutation.mutateAsync(requestData);

      console.log('🟢 Create Card - API Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        setShowSummary(false);
        setShowSuccess(true);
      } else {
        Alert.alert('Card Creation Failed', result.message || 'Failed to create card. Please try again.');
      }
    } catch (error: any) {
      console.log('❌ Create Card - Error:', JSON.stringify(error, null, 2));
      
      if (error?.response?.status === 400) {
        Alert.alert('Card Creation Failed', error.response.data?.message || 'Insufficient balance or invalid request.');
      } else if (error?.response?.status === 422) {
        const errorMessages = error.response.data?.errors 
          ? Object.values(error.response.data.errors).flat().join('\n')
          : error.response.data?.message || 'Validation error';
        Alert.alert('Validation Error', errorMessages);
      } else {
        Alert.alert(
          'Card Creation Failed',
          error?.message || error?.response?.data?.message || 'An error occurred. Please try again.'
        );
      }
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
        <ThemedText style={styles.headerTitle}>Create new card</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Virtual Card Preview */}
        <View style={styles.cardPreviewWrapper}>
          <ImageBackground
            source={require('../../assets/card_background.png')}
            style={styles.cardPreview}
            imageStyle={styles.cardPreviewImage}
            resizeMode="cover"
          >
            {selectedColor && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: selectedColor.tintColor, opacity: 0.7 },
                  styles.cardPreviewOverlay,
                ]}
              />
            )}
            <View style={styles.cardPreviewContent}>
              <View style={styles.cardPreviewTopRow}>
                <ThemedText style={styles.cardPreviewSmallText}>Online Payment Virtual Card</ThemedText>
                <ThemedText style={styles.cardPreviewBrandText}>Bills</ThemedText>
              </View>
              <View style={styles.cardPreviewBottomRow}>
                <Image
                  source={require('../../assets/Group 2.png')}
                  style={styles.cardPreviewMastercardLogo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Card Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Card Name"
            placeholderTextColor="#9CA3AF"
            value={cardName}
            onChangeText={setCardName}
          />
        </View>

        {/* Card Color Selection */}
        <ThemedText style={styles.sectionLabel}>Card Color</ThemedText>
        <View style={styles.colorSelectionRow}>
          {cardColors.map((color) => (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.colorSwatch,
                selectedColor?.id === color.id && styles.colorSwatchSelected,
              ]}
              onPress={() => setSelectedColor(color)}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={require('../../assets/card_background.png')}
                style={styles.colorSwatchBackground}
                imageStyle={styles.colorSwatchImage}
                resizeMode="cover"
              >
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: color.tintColor, opacity: 0.7 },
                    styles.colorSwatchOverlay,
                  ]}
                />
              </ImageBackground>
              {selectedColor?.id === color.id && (
                <View style={styles.colorCheckmark}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Wallet Dropdown */}
        <View style={styles.walletFieldContainer}>
          <ThemedText style={styles.walletFieldLabel}>Payment Wallet</ThemedText>
          <TouchableOpacity
            style={styles.walletFieldSelector}
            onPress={() => setShowWalletDropdown(!showWalletDropdown)}
          >
            <Image
              source={require('../../assets/emojione_flag-for-nigeria.png')}
              style={styles.walletFieldFlag}
              resizeMode="contain"
            />
            <ThemedText style={styles.walletFieldText}>
              {selectedWallet === 'naira' ? 'Naira' : 'Crypto'}
            </ThemedText>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Wallet Dropdown List */}
        {showWalletDropdown && (
          <View style={styles.walletDropdownList}>
            <TouchableOpacity
              style={styles.walletDropdownItem}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedWallet('naira');
                setShowWalletDropdown(false);
              }}
            >
              <View style={[styles.walletIconCircle, styles.walletIconNaira]}>
                <Image
                  source={require('../../assets/emojione_flag-for-nigeria.png')}
                  style={styles.walletFlagIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.walletTextContainer}>
                <ThemedText style={styles.walletTitle}>Naira Wallet</ThemedText>
                <ThemedText style={styles.walletSubtitle}>
                  {isLoadingWallet ? 'Loading...' : `Bal : N${Number(nairaBalance).toLocaleString()}`}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.walletRadioOuter,
                  selectedWallet === 'naira' && styles.walletRadioActive,
                ]}
              >
                {selectedWallet === 'naira' && <View style={styles.walletRadioInner} />}
              </View>
            </TouchableOpacity>
            <View style={styles.walletDivider} />
            <TouchableOpacity
              style={styles.walletDropdownItem}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedWallet('crypto');
                setShowWalletDropdown(false);
              }}
            >
              <View style={[styles.walletIconCircle, styles.walletIconCrypto]}>
                <Image
                  source={require('../../assets/Vector (52).png')}
                  style={styles.walletCryptoIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.walletTextContainer}>
                <ThemedText style={styles.walletTitle}>Crypto Wallet</ThemedText>
                <ThemedText style={styles.walletSubtitle}>
                  {isLoadingWallet ? 'Loading...' : `Bal : $${Number(cryptoBalanceUsd).toLocaleString()}`}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.walletRadioOuter,
                  selectedWallet === 'crypto' && styles.walletRadioActive,
                ]}
              >
                {selectedWallet === 'crypto' && <View style={styles.walletRadioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Exchange Rate & Fee Info */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/ArrowsDownUp.png')}
              style={styles.infoIcon}
              resizeMode="contain"
            />
            <ThemedText style={styles.infoText}>Exchange Rate : $1 = N{EXCHANGE_RATE.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Image
              source={require('../../assets/CoinVertical (1).png')}
              style={styles.infoIcon}
              resizeMode="contain"
            />
            <ThemedText style={styles.infoText}>
              Fee : {selectedWallet === 'naira' 
                ? `N${totalFee.amount.toLocaleString()} ($${CARD_CREATION_FEE_USD} + N${PROCESSING_FEE_NGN})`
                : `$${totalFee.amount.toLocaleString()}`
              }
            </ThemedText>
          </View>
          {!hasSufficientBalance && (
            <View style={styles.warningRow}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <ThemedText style={styles.warningText}>
                Insufficient balance. You need {totalFee.amount.toLocaleString()} {totalFee.currency}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Billing Address Section */}
        <View style={styles.billingSection}>
          <View style={styles.billingSectionHeader}>
            <ThemedText style={styles.billingSectionTitle}>Billing Address</ThemedText>
            <TouchableOpacity
              onPress={() => setShowBillingModal(true)}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.editBillingText}>
                {billingCountry && billingState && billingCity && billingStreet && billingPostalCode ? 'Edit' : 'Add'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          {billingCountry && billingState && billingCity && billingStreet && billingPostalCode ? (
            <View style={styles.billingPreview}>
              <ThemedText style={styles.billingPreviewText}>
                {billingStreet}, {billingCity}, {billingState}, {billingCountry} - {billingPostalCode}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.billingPlaceholder}>
              <ThemedText style={styles.billingPlaceholderText}>
                Tap to add billing address
              </ThemedText>
            </View>
          )}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!cardName.trim() || !selectedColor || !hasSufficientBalance || isLoadingWallet) && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceed}
          activeOpacity={0.8}
          disabled={!cardName.trim() || !selectedColor || !hasSufficientBalance || isLoadingWallet}
        >
          {isLoadingWallet ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
          )}
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
              <TouchableOpacity
                style={styles.summaryBackButton}
                onPress={() => setShowSummary(false)}
              >
                {/* <Ionicons name="chevron-back" size={24} color="#000" /> */}
              </TouchableOpacity>
              <ThemedText style={styles.summaryTitle}>Summary</ThemedText>
              <TouchableOpacity
                style={styles.summaryCloseButton}
                onPress={() => setShowSummary(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Summary Section - Scrollable */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.summaryScrollView}
              contentContainerStyle={styles.summaryScrollContent}
              nestedScrollEnabled={true}
            >
              <View style={styles.summarySection}>
              {/* <ThemedText style={styles.summarySectionTitle}>Summary</ThemedText> */}
              
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
                  You are about to create your virtual card
                </ThemedText>
              </View>

              {/* Card Details */}
                <ThemedText style={styles.detailsSectionTitle}>Card Details</ThemedText>
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Card Name</ThemedText>
                  <ThemedText style={styles.detailValue}>{cardName || 'N/A'}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Card fee</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {selectedWallet === 'naira' 
                      ? `N${totalFee.amount.toLocaleString()}` 
                      : `$${totalFee.amount.toLocaleString()}`
                    }
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Payment Wallet</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {selectedWallet === 'naira' ? 'Naira Wallet' : 'Crypto Wallet'}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Card Color</ThemedText>
                  {selectedColor && (
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: selectedColor.backgroundColor },
                      ]}
                    />
                  )}
                </View>
              </View>

              {/* Nigeria Billing Address */}
                <ThemedText style={styles.detailsSectionTitle}>Billing Address</ThemedText>
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Country</ThemedText>
                  <ThemedText style={styles.detailValue}>{billingCountry || 'N/A'}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>State</ThemedText>
                  <ThemedText style={styles.detailValue}>{billingState || 'N/A'}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>City</ThemedText>
                  <ThemedText style={styles.detailValue}>{billingCity || 'N/A'}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Street</ThemedText>
                  <ThemedText style={styles.detailValue}>{billingStreet || 'N/A'}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Postal code</ThemedText>
                  <ThemedText style={styles.detailValue}>{billingPostalCode || 'N/A'}</ThemedText>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.summaryButtons}>
                <TouchableOpacity
                  style={[
                    styles.proceedSummaryButton,
                    createCardMutation.isPending && styles.proceedSummaryButtonDisabled,
                  ]}
                  onPress={handleCreateCard}
                  disabled={createCardMutation.isPending}
                >
                  {createCardMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.proceedSummaryButtonText}>Proceed</ThemedText>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowSummary(false)}
                  disabled={createCardMutation.isPending}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Billing Address Modal */}
      <Modal
        visible={showBillingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBillingModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowBillingModal(false)}
        >
          <View style={styles.billingModalContent}>
            <View style={styles.billingModalHeader}>
              <ThemedText style={styles.billingModalTitle}>Billing Address</ThemedText>
              <TouchableOpacity
                style={styles.billingModalCloseButton}
                onPress={() => setShowBillingModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.billingModalScroll}
              contentContainerStyle={styles.billingModalScrollContent}
              nestedScrollEnabled={true}
            >
              <View style={styles.billingInputContainer}>
                <ThemedText style={styles.billingInputLabel}>Country</ThemedText>
                <TextInput
                  style={styles.billingInput}
                  placeholder="Enter country (e.g., Nigeria)"
                  placeholderTextColor="#9CA3AF"
                  value={billingCountry}
                  onChangeText={setBillingCountry}
                />
              </View>

              <View style={styles.billingInputContainer}>
                <ThemedText style={styles.billingInputLabel}>State</ThemedText>
                <TextInput
                  style={styles.billingInput}
                  placeholder="Enter state"
                  placeholderTextColor="#9CA3AF"
                  value={billingState}
                  onChangeText={setBillingState}
                />
              </View>

              <View style={styles.billingInputContainer}>
                <ThemedText style={styles.billingInputLabel}>City</ThemedText>
                <TextInput
                  style={styles.billingInput}
                  placeholder="Enter city"
                  placeholderTextColor="#9CA3AF"
                  value={billingCity}
                  onChangeText={setBillingCity}
                />
              </View>

              <View style={styles.billingInputContainer}>
                <ThemedText style={styles.billingInputLabel}>Street Address</ThemedText>
                <TextInput
                  style={[styles.billingInput, styles.billingInputMultiline]}
                  placeholder="Enter street address"
                  placeholderTextColor="#9CA3AF"
                  value={billingStreet}
                  onChangeText={setBillingStreet}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.billingInputContainer}>
                <ThemedText style={styles.billingInputLabel}>Postal Code</ThemedText>
                <TextInput
                  style={styles.billingInput}
                  placeholder="Enter postal code"
                  placeholderTextColor="#9CA3AF"
                  value={billingPostalCode}
                  onChangeText={setBillingPostalCode}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={styles.saveBillingButton}
                onPress={() => {
                  if (!billingCountry.trim() || !billingState.trim() || !billingCity.trim() || !billingStreet.trim() || !billingPostalCode.trim()) {
                    Alert.alert('Validation Error', 'Please fill in all billing address fields');
                    return;
                  }
                  setShowBillingModal(false);
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.saveBillingButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
              You have successfully created your virtual card
            </ThemedText>
            <View style={styles.successButtons}>
              <TouchableOpacity
                style={styles.viewCardButton}
                onPress={() => {
                  setShowSuccess(false);
                  // Navigate back to VirtualCardsScreen (which should show the new card)
                  navigation.navigate('Main');
                }}
              >
                <ThemedText style={styles.viewCardButtonText}>View Card</ThemedText>
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
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardPreviewWrapper: {
    marginBottom: 24,
  },
  cardPreview: {
    width: width - 40,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardPreviewImage: {
    borderRadius: 24,
  },
  cardPreviewOverlay: {
    borderRadius: 24,
  },
  cardPreviewContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    zIndex: 1,
  },
  cardPreviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPreviewSmallText: {
    fontSize: 8,
    color: '#E5FBE0',
  },
  cardPreviewBrandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardPreviewBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  cardPreviewMastercardLogo: {
    width: 40,
    height: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  flagIcon: {
    width: 24,
    height: 24,
  },
  walletDropdownText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  walletFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  walletFieldLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  walletFieldSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  walletFieldFlag: {
    width: 27,
    height: 27,
  },
  walletFieldText: {
    fontSize: 14,
    color: '#111827',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 12,
  },
  colorSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorSwatch: {
    width: (width - 80) / 3,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  colorSwatchSelected: {
    borderColor: '#1B800F',
    borderWidth: 3,
  },
  colorSwatchBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchImage: {
    borderRadius: 10,
  },
  colorSwatchOverlay: {
    borderRadius: 10,
  },
  colorCheckmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  infoBox: {
    backgroundColor: '#FFA50026',
    borderRadius: 15,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.3,
    borderColor: '#FFA500',
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
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 8,
    flex: 1,
  },
  proceedButton: {
    backgroundColor: '#42AC36',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  proceedButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  proceedButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  // Billing Address Section
  billingSection: {
    marginBottom: 20,
  },
  billingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billingSectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
  },
  editBillingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#42AC36',
  },
  billingPreview: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  billingPreviewText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  billingPlaceholder: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  billingPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Billing Modal
  billingModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    height: '85%',
    width: '100%',
  },
  billingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  billingModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  billingModalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  billingModalScroll: {
    flex: 1,
  },
  billingModalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
  billingInputContainer: {
    marginBottom: 20,
  },
  billingInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  billingInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 48,
  },
  billingInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBillingButton: {
    backgroundColor: '#42AC36',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBillingButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  // Wallet Dropdown
  walletDropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  walletDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletIconNaira: {
    backgroundColor: '#E3F8D9',
  },
  walletIconCrypto: {
    backgroundColor: '#FFE3B3',
  },
  walletFlagIcon: {
    width: 26,
    height: 26,
  },
  walletCryptoIcon: {
    width: 24,
    height: 24,
  },
  walletTextContainer: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  walletSubtitle: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  walletRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletRadioActive: {
    borderColor: '#42AC36',
  },
  walletRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#42AC36',
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },
  // Summary Modal
  summaryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  summaryModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    // maxHeight: height * 0.9,
    height: '93%',
    width: '100%',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  summaryBackButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    flex: 1,
  },
  summaryCloseButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  summaryScrollView: {
    flex: 1,
  },
  summaryScrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  summarySection: {
    paddingHorizontal: 0,
  },
  summarySectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 20,
  },
  pendingContainer: {
    alignItems: 'center',
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
  detailsSection: {
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 10,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  summaryButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  proceedSummaryButton: {
    flex: 1,
    backgroundColor: '#42AC36',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  proceedSummaryButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  proceedSummaryButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  successButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  viewCardButton: {
    flex: 1,
    backgroundColor: '#1B800F',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCardButtonText: {
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

export default CreateCardScreen2;

