import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Modal,
    Pressable,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useBillPaymentProviders, useBillPaymentBeneficiaries } from '../../queries/billPaymentQueries';
import { useValidateMeter, useInitiateBillPayment, useConfirmBillPayment, useCreateBeneficiary, useDeleteBeneficiary } from '../../mutations/billPaymentMutations';
import { useFiatWallets } from '../../queries/walletQueries';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_CODE = 'electricity';

const accountTypes = [
    { id: 'prepaid', name: 'Prepaid' },
    { id: 'postpaid', name: 'Postpaid' },
];

const ElectricityScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [amount, setAmount] = useState('');
    const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
    const [selectedProviderName, setSelectedProviderName] = useState<string | null>(null);
    const [selectedAccountType, setSelectedAccountType] = useState<'prepaid' | 'postpaid' | null>(null);
    const [meterNumber, setMeterNumber] = useState('');
    const [showBillerModal, setShowBillerModal] = useState(false);
    const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
    const [billerSearchQuery, setBillerSearchQuery] = useState('');
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pin, setPin] = useState('');
    const [accountName, setAccountName] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<number | null>(null);
    const [transactionReference, setTransactionReference] = useState<string | null>(null);
    const [fee, setFee] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSaveBeneficiaryModal, setShowSaveBeneficiaryModal] = useState(false);
    const [showManageBeneficiariesModal, setShowManageBeneficiariesModal] = useState(false);
    const [beneficiaryName, setBeneficiaryName] = useState('');

    // API Hooks
    const { data: providersData, isLoading: providersLoading } = useBillPaymentProviders(CATEGORY_CODE, 'NG');
    const { data: beneficiariesData, isLoading: beneficiariesLoading } = useBillPaymentBeneficiaries();
    const { data: walletsData, isLoading: walletsLoading } = useFiatWallets();
    const validateMeterMutation = useValidateMeter();
    const initiateMutation = useInitiateBillPayment();
    const confirmMutation = useConfirmBillPayment();
    const createBeneficiaryMutation = useCreateBeneficiary();
    const deleteBeneficiaryMutation = useDeleteBeneficiary();

    const providers = providersData?.data || [];
    const beneficiaries = beneficiariesData?.data || [];
    const fiatWallets = walletsData?.data || [];
    const ngnWallet = fiatWallets.find((w: any) => w.currency === 'NGN');
    const balance = ngnWallet?.balance || 0;

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleProceed = async () => {
        if (!selectedProviderId || !selectedAccountType || !meterNumber || !amount) {
            Alert.alert('Error', 'Please select biller, account type, enter meter number and amount');
            return;
        }

        const numericAmount = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        try {
            // Validate meter first
            const validateResult = await validateMeterMutation.mutateAsync({
                providerId: selectedProviderId,
                meterNumber: meterNumber,
                accountType: selectedAccountType,
            });

            if (!validateResult.success) {
                Alert.alert('Validation Failed', validateResult.message || 'Invalid meter details');
                setIsProcessing(false);
                return;
            }

            const validatedAccountName = validateResult.data?.accountName || null;
            setAccountName(validatedAccountName);

            // Initiate payment
            const initiateResult = await initiateMutation.mutateAsync({
                categoryCode: CATEGORY_CODE,
                providerId: selectedProviderId,
                currency: 'NGN',
                amount: numericAmount,
                accountNumber: meterNumber,
                accountType: selectedAccountType,
            });

            if (initiateResult.success && initiateResult.data) {
                setTransactionId(initiateResult.data.transactionId);
                setTransactionReference(initiateResult.data.reference);
                setFee(initiateResult.data.fee || 0);
                setTotalAmount(initiateResult.data.totalAmount || numericAmount);
                setShowSummaryModal(true);
            } else {
                Alert.alert('Error', initiateResult.message || 'Failed to initiate payment');
            }
        } catch (error: any) {
            console.error('Electricity initiate error:', error);
            Alert.alert(
                'Error',
                error?.response?.data?.message || error?.message || 'Failed to initiate payment. Please try again.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSummaryProceed = () => {
        setShowSummaryModal(false);
        setShowSecurityModal(true);
        setPin('');
    };

    // Handle biometric authentication for security
    const handleSecurityBiometric = async () => {
        // Validate that PIN is entered
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN first');
            return;
        }

        if (!transactionId) {
            Alert.alert('Error', 'Transaction ID is missing');
            return;
        }

        try {
            // Check if biometric hardware is available
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                Alert.alert(
                    'Biometric Not Available',
                    'Biometric authentication is not available on this device. Please use the Next button instead.'
                );
                return;
            }

            // Check if biometrics are enrolled
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            if (!enrolled) {
                Alert.alert(
                    'Biometric Not Set Up',
                    'Please set up biometric authentication (fingerprint or face ID) in your device settings first.'
                );
                return;
            }

            // Authenticate using biometrics
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to confirm payment',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (result.success) {
                // Biometric authentication successful, proceed with security next
                await handleSecurityNext();
            } else {
                // User cancelled or authentication failed
                if (result.error === 'user_cancel') {
                    // User cancelled, don't show error
                    return;
                } else {
                    Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again.');
                }
            }
        } catch (error: any) {
            console.error('Biometric authentication error:', error);
            Alert.alert('Error', 'An error occurred during biometric authentication. Please try again.');
        }
    };

    const handleSecurityNext = async () => {
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN');
            return;
        }

        if (!transactionId) {
            Alert.alert('Error', 'Transaction ID is missing');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await confirmMutation.mutateAsync({
                transactionId: transactionId,
                pin: pin,
            });

            if (result.success && result.data) {
                setShowSecurityModal(false);
                setShowSuccessModal(true);
            } else {
                Alert.alert('Error', result.message || 'Payment confirmation failed');
                setPin('');
            }
        } catch (error: any) {
            console.error('Electricity confirm error:', error);
            const errorMessage =
                error?.response?.data?.message || error?.message || 'Payment confirmation failed. Please try again.';
            Alert.alert('Error', errorMessage);
            setPin('');
        } finally {
            setIsProcessing(false);
        }
    };

    // Check if beneficiary already exists
    const beneficiaryExists = beneficiaries.some((b: any) => 
        b.provider_id === selectedProviderId && 
        b.account_number === meterNumber &&
        b.category?.code === CATEGORY_CODE
    );

    // Handle save beneficiary
    const handleSaveBeneficiary = async () => {
        if (!selectedProviderId || !meterNumber) {
            Alert.alert('Error', 'Missing provider or meter number');
            return;
        }

        if (beneficiaryExists) {
            Alert.alert('Info', 'This beneficiary already exists');
            setShowSaveBeneficiaryModal(false);
            return;
        }

        setIsProcessing(true);
        try {
            const result = await createBeneficiaryMutation.mutateAsync({
                categoryCode: CATEGORY_CODE,
                providerId: selectedProviderId,
                accountNumber: meterNumber,
                name: beneficiaryName || undefined,
                accountType: selectedAccountType || undefined,
            });

            if (result.success) {
                Alert.alert('Success', 'Beneficiary saved successfully');
                setShowSaveBeneficiaryModal(false);
                setBeneficiaryName('');
            } else {
                Alert.alert('Error', result.message || 'Failed to save beneficiary');
            }
        } catch (error: any) {
            console.error('Save beneficiary error:', error);
            Alert.alert(
                'Error',
                error?.response?.data?.message || error?.message || 'Failed to save beneficiary. Please try again.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle delete beneficiary
    const handleDeleteBeneficiary = async (beneficiaryId: number) => {
        Alert.alert(
            'Delete Beneficiary',
            'Are you sure you want to delete this beneficiary?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            const result = await deleteBeneficiaryMutation.mutateAsync(beneficiaryId);
                            if (result.success) {
                                Alert.alert('Success', 'Beneficiary deleted successfully');
                            } else {
                                Alert.alert('Error', result.message || 'Failed to delete beneficiary');
                            }
                        } catch (error: any) {
                            console.error('Delete beneficiary error:', error);
                            Alert.alert(
                                'Error',
                                error?.response?.data?.message || error?.message || 'Failed to delete beneficiary. Please try again.'
                            );
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                },
            ]
        );
    };

    const handleSuccessTransaction = () => {
        setShowSuccessModal(false);
        // Reset state
        setAmount('');
        setSelectedProviderId(null);
        setSelectedProviderName(null);
        setSelectedAccountType(null);
        setMeterNumber('');
        setAccountName(null);
        setPin('');
        setTransactionId(null);
        setTransactionReference(null);
        setFee(0);
        setTotalAmount(0);
        setBeneficiaryName('');

        navigation.navigate('TransactionHistory', {
            type: 'bill_payment',
            transactionData: {
                type: 'Electricity Recharge',
                billerType: selectedProviderName,
                meterNumber: meterNumber,
                accountType: selectedAccountType ? (selectedAccountType === 'prepaid' ? 'Prepaid' : 'Postpaid') : '',
                accountName: accountName || '',
                amount: amount,
                fee: fee.toString(),
                totalAmount: totalAmount.toString(),
                date: new Date().toLocaleString(),
                status: 'Successful',
                transactionId: transactionReference,
            },
        });
    };

    const formatAmount = (amt: string) => {
        if (!amt) return '';
        const num = parseFloat(amt.replace(/,/g, ''));
        if (isNaN(num)) return amt;
        return num.toLocaleString('en-US');
    };

    const filteredBillers = providers.filter((biller: any) => {
        if (billerSearchQuery && !biller.name?.toLowerCase().includes(billerSearchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar style="dark" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Electricity</ThemedText>
                    <View style={styles.placeholder} />
                </View>

                {/* Balance Card */}
                <ImageBackground
                    source={require('../../assets/green_background.png')}
                    style={styles.balanceCard}
                    imageStyle={styles.balanceCardImage}
                    resizeMode="cover"
                >
                    <ThemedText style={styles.balanceLabel}>My Balance</ThemedText>
                    <View style={styles.balanceRow}>
                        <ThemedText style={styles.balanceCurrency}>₦</ThemedText>
                        {walletsLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <ThemedText style={styles.balanceAmount}>
                                {balance.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </ThemedText>
                        )}
                    </View>
                </ImageBackground>

                {/* Recent Section */}
                <View style={styles.recentSection}>
                    <View style={styles.recentSectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Recent</ThemedText>
                        <TouchableOpacity
                            onPress={() => setShowManageBeneficiariesModal(true)}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={styles.manageButtonText}>Manage</ThemedText>
                        </TouchableOpacity>
                    </View>
                    {beneficiariesLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#42AC36" />
                        </View>
                    ) : beneficiaries.filter((b: any) => b.category?.code === CATEGORY_CODE).length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.recentScrollContent}
                        >
                            {beneficiaries
                                .filter((b: any) => b.category?.code === CATEGORY_CODE)
                                .slice(0, 5)
                                .map((beneficiary: any) => {
                                    const provider = providers.find((p: any) => p.id === beneficiary.provider_id);
                                    return (
                                        <TouchableOpacity
                                            key={beneficiary.id}
                                            style={styles.recentCard}
                                            onPress={() => {
                                                setMeterNumber(beneficiary.account_number || '');
                                                setSelectedProviderId(beneficiary.provider_id);
                                                setSelectedProviderName(provider?.name || beneficiary.provider?.name || '');
                                                setSelectedAccountType(beneficiary.account_type as 'prepaid' | 'postpaid' | null);
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.recentLogoContainer, { backgroundColor: '#FFD700' }]}>
                                                <Ionicons name="flash" size={24} color="#FFA500" />
                                            </View>
                                            <ThemedText style={styles.recentPhoneNumber}>
                                                {beneficiary.account_number || ''}
                                            </ThemedText>
                                            <ThemedText style={styles.recentNetworkName}>
                                                {beneficiary.name || provider?.name || beneficiary.provider?.name || ''}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyBeneficiariesContainer}>
                            <ThemedText style={styles.emptyBeneficiariesText}>No saved beneficiaries</ThemedText>
                            <ThemedText style={styles.emptyBeneficiariesSubtext}>Save beneficiaries for faster payments</ThemedText>
                        </View>
                    )}
                </View>

                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <ThemedText style={styles.sectionTitle}>Details</ThemedText>

                    {/* Biller Type Input */}
                    <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={() => setShowBillerModal(true)}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={[styles.input, !selectedProviderName && styles.inputPlaceholder]}>
                            {selectedProviderName || 'Biller type'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Account Type Input */}
                    <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={() => setShowAccountTypeModal(true)}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={[styles.input, !selectedAccountType && styles.inputPlaceholder]}>
                            {selectedAccountType
                                ? selectedAccountType === 'prepaid'
                                    ? 'Prepaid'
                                    : 'Postpaid'
                                : 'Account type'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Meter Number Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Meter number"
                            placeholderTextColor="#9CA3AF"
                            value={meterNumber}
                            onChangeText={setMeterNumber}
                            keyboardType="default"
                        />
                    </View>

                    {/* Amount Input */}
                    <View style={[styles.inputContainer, { marginBottom: 100 }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            placeholderTextColor="#9CA3AF"
                            value={formatAmount(amount)}
                            onChangeText={(text) => setAmount(text.replace(/,/g, ''))}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Proceed Button - Fixed at Bottom */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        (!selectedProviderId || !selectedAccountType || !meterNumber || !amount || isProcessing) &&
                            styles.proceedButtonDisabled,
                    ]}
                    onPress={handleProceed}
                    disabled={!selectedProviderId || !selectedAccountType || !meterNumber || !amount || isProcessing}
                    activeOpacity={0.8}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
                    )}
                </TouchableOpacity>
            </View>

            {/* Select Biller Modal */}
            <Modal
                visible={showBillerModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowBillerModal(false)}
            >
                <Pressable
                    style={styles.billerModalOverlay}
                    onPress={() => setShowBillerModal(false)}
                >
                    <Pressable style={styles.billerModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.billerModalHeader}>
                            <ThemedText style={styles.billerModalTitle}>Select Biller</ThemedText>
                            <TouchableOpacity
                                style={styles.billerModalCloseButton}
                                onPress={() => setShowBillerModal(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.billerSearchContainer}>
                            <TextInput
                                style={styles.billerSearchInput}
                                placeholder="Search biller"
                                placeholderTextColor="#9CA3AF"
                                value={billerSearchQuery}
                                onChangeText={setBillerSearchQuery}
                            />
                        </View>

                        {/* Billers List */}
                        <ScrollView
                            style={styles.billersList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.billersListContent}
                            nestedScrollEnabled={true}
                        >
                            {providersLoading ? (
                                <View style={styles.noBillersContainer}>
                                    <ActivityIndicator size="small" color="#42AC36" />
                                    <ThemedText style={styles.noBillersText}>Loading billers...</ThemedText>
                                </View>
                            ) : filteredBillers.length > 0 ? (
                                filteredBillers.map((biller: any) => (
                                    <TouchableOpacity
                                        key={biller.id}
                                        style={styles.billerItem}
                                        onPress={() => {
                                            setSelectedProviderId(biller.id);
                                            setSelectedProviderName(biller.name);
                                            setAccountName(null);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <ThemedText style={styles.billerItemText}>{biller.name}</ThemedText>
                                        <View style={styles.radioButton}>
                                            {selectedProviderId === biller.id && <View style={styles.radioButtonInner} />}
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.noBillersContainer}>
                                    <ThemedText style={styles.noBillersText}>No billers found</ThemedText>
                                </View>
                            )}
                        </ScrollView>

                        {/* Apply Button */}
                        <View style={styles.billerModalButtonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.applyButton,
                                    !selectedProviderId && styles.applyButtonDisabled,
                                ]}
                                onPress={() => {
                                    if (selectedProviderId) {
                                        setShowBillerModal(false);
                                    }
                                }}
                                disabled={!selectedProviderId}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Select Account Type Modal */}
            <Modal
                visible={showAccountTypeModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAccountTypeModal(false)}
            >
                <Pressable
                    style={styles.accountTypeModalOverlay}
                    onPress={() => setShowAccountTypeModal(false)}
                >
                    <Pressable style={styles.accountTypeModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.accountTypeModalHeader}>
                            <ThemedText style={styles.accountTypeModalTitle}>Account Type</ThemedText>
                            <TouchableOpacity
                                style={styles.accountTypeModalCloseButton}
                                onPress={() => setShowAccountTypeModal(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        {/* Account Types List */}
                        <View style={styles.accountTypesList}>
                            {accountTypes.map((accountType) => (
                                <TouchableOpacity
                                    key={accountType.id}
                                    style={styles.accountTypeItem}
                                    onPress={() =>
                                        setSelectedAccountType(accountType.id as 'prepaid' | 'postpaid')
                                    }
                                    activeOpacity={0.8}
                                >
                                    <ThemedText style={styles.accountTypeItemText}>{accountType.name}</ThemedText>
                                    <View style={styles.radioButton}>
                                        {selectedAccountType === accountType.id && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Apply Button */}
                        <View style={styles.accountTypeModalButtonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.applyButton,
                                    !selectedAccountType && styles.applyButtonDisabled,
                                ]}
                                onPress={() => {
                                    if (selectedAccountType) {
                                        setShowAccountTypeModal(false);
                                    }
                                }}
                                disabled={!selectedAccountType}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Summary Modal */}
            <Modal
                visible={showSummaryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSummaryModal(false)}
            >
                <Pressable
                    style={styles.summaryModalOverlay}
                    onPress={() => setShowSummaryModal(false)}
                >
                    <Pressable style={styles.summaryModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.summaryHeader}>
                            <ThemedText style={styles.summaryTitle}>Summary</ThemedText>
                            <TouchableOpacity
                                style={styles.summaryCloseButton}
                                onPress={() => setShowSummaryModal(false)}
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
                                You are about to make an Electricity recharge of{' '}
                                <ThemedText style={styles.pendingAmount}>N{formatAmount(amount)}</ThemedText>
                            </ThemedText>
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{formatAmount(amount)}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Fee:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{formatAmount(fee.toString())}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    N{formatAmount(totalAmount.toString())}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Biller Name:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedProviderName}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Meter Number:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{meterNumber}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account type:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {selectedAccountType
                                        ? selectedAccountType === 'prepaid'
                                            ? 'Prepaid'
                                            : 'Postpaid'
                                        : ''}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account name:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{accountName || ''}</ThemedText>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.summaryButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.proceedSummaryButton,
                                    isProcessing && styles.proceedSummaryButtonDisabled,
                                ]}
                                onPress={handleSummaryProceed}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <ThemedText style={styles.proceedSummaryButtonText}>Proceed</ThemedText>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowSummaryModal(false)}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Security Confirmation Modal */}
            <Modal
                visible={showSecurityModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSecurityModal(false)}
            >
                <Pressable
                    style={styles.securityModalOverlay}
                    onPress={() => setShowSecurityModal(false)}
                >
                    <Pressable style={styles.securityModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.securityModalHeader}>
                            <ThemedText style={styles.securityModalTitle}>Security Confirmation</ThemedText>
                            <TouchableOpacity
                                style={styles.securityModalCloseButton}
                                onPress={() => setShowSecurityModal(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        {/* Warning Icon */}
                        <View style={styles.verificationContainer}>
                            <View style={styles.verificationIconOuter}>
                                <View style={styles.verificationIconMiddle}>
                                    <View style={styles.verificationIconInner}>
                                        <Ionicons name="warning" size={40} color="#FFFFFF" />
                                    </View>
                                </View>
                            </View>
                            <ThemedText style={styles.verificationText}>Input Pin or Biometrics</ThemedText>
                        </View>

                        {/* PIN Input Fields */}
                        <View style={styles.pinContainer}>
                            {[0, 1, 2, 3].map((index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.pinDot,
                                        pin.length > index && styles.pinDotFilled,
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Numpad */}
                        <View style={styles.securityNumpadContainer}>
                            <View style={styles.numpadLeft}>
                                <View style={styles.numpadRow}>
                                    {[1, 2, 3].map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            style={styles.numButton}
                                            onPress={() => handleNumberPress(num.toString())}
                                            activeOpacity={0.7}
                                        >
                                            <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.backspaceButton}
                                        onPress={handleBackspace}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="backspace-outline" size={24} color="#000000" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.numpadRow}>
                                    {[4, 5, 6].map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            style={styles.numButton}
                                            onPress={() => handleNumberPress(num.toString())}
                                            activeOpacity={0.7}
                                        >
                                            <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.numpadRow}>
                                    {[7, 8, 9].map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            style={styles.numButton}
                                            onPress={() => handleNumberPress(num.toString())}
                                            activeOpacity={0.7}
                                        >
                                            <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.numpadRow}>
                                    <TouchableOpacity
                                        style={styles.numButton}
                                        onPress={handleSecurityBiometric}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="finger-print" size={24} color="#42AC36" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.numButton}
                                        onPress={() => handleNumberPress('0')}
                                        activeOpacity={0.7}
                                    >
                                        <ThemedText style={styles.numButtonText}>0</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.numButton}
                                        onPress={() => handleNumberPress('.')}
                                        activeOpacity={0.7}
                                    >
                                        <ThemedText style={styles.numButtonText}>.</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.numpadRight}>
                                <TouchableOpacity
                                    style={[
                                        styles.nextButton,
                                        (pin.length !== 4 || isProcessing) && styles.nextButtonDisabled,
                                    ]}
                                    onPress={handleSecurityNext}
                                    disabled={pin.length !== 4 || isProcessing}
                                    activeOpacity={0.8}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <ThemedText style={styles.nextButtonText}>Next</ThemedText>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowSuccessModal(false)}
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
                            You have successfully completed an Electricity recharge of{' '}
                            <ThemedText style={styles.successAmount}>N{formatAmount(amount)}</ThemedText>
                        </ThemedText>
                        {!beneficiaryExists && selectedProviderId && meterNumber && (
                            <TouchableOpacity
                                style={styles.saveBeneficiaryButton}
                                onPress={() => {
                                    setShowSuccessModal(false);
                                    setShowSaveBeneficiaryModal(true);
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="bookmark-outline" size={16} color="#42AC36" />
                                <ThemedText style={styles.saveBeneficiaryButtonText}>Save as Beneficiary</ThemedText>
                            </TouchableOpacity>
                        )}
                        <View style={styles.successButtons}>
                            <TouchableOpacity
                                style={styles.transactionButton}
                                onPress={handleSuccessTransaction}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.transactionButtonText}>Transaction</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closeSuccessButton}
                                onPress={() => setShowSuccessModal(false)}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.closeSuccessButtonText}>Close</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Save Beneficiary Modal */}
            <Modal
                visible={showSaveBeneficiaryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSaveBeneficiaryModal(false)}
            >
                <Pressable
                    style={styles.beneficiaryModalOverlay}
                    onPress={() => setShowSaveBeneficiaryModal(false)}
                >
                    <Pressable style={styles.beneficiaryModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.beneficiaryModalHeader}>
                            <ThemedText style={styles.beneficiaryModalTitle}>Save as Beneficiary</ThemedText>
                            <TouchableOpacity
                                style={styles.beneficiaryModalCloseButton}
                                onPress={() => {
                                    setShowSaveBeneficiaryModal(false);
                                    setBeneficiaryName('');
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.beneficiaryForm}>
                            <View style={styles.beneficiaryInputContainer}>
                                <ThemedText style={styles.beneficiaryLabel}>Meter Number</ThemedText>
                                <ThemedText style={styles.beneficiaryValue}>{meterNumber}</ThemedText>
                            </View>
                            <View style={styles.beneficiaryInputContainer}>
                                <ThemedText style={styles.beneficiaryLabel}>Biller</ThemedText>
                                <ThemedText style={styles.beneficiaryValue}>{selectedProviderName}</ThemedText>
                            </View>
                            <View style={styles.beneficiaryInputContainer}>
                                <ThemedText style={styles.beneficiaryLabel}>Account Type</ThemedText>
                                <ThemedText style={styles.beneficiaryValue}>
                                    {selectedAccountType ? (selectedAccountType === 'prepaid' ? 'Prepaid' : 'Postpaid') : ''}
                                </ThemedText>
                            </View>
                            <View style={styles.beneficiaryInputContainer}>
                                <ThemedText style={styles.beneficiaryLabel}>Name (Optional)</ThemedText>
                                <TextInput
                                    style={styles.beneficiaryNameInput}
                                    placeholder="e.g., Home Meter, Office"
                                    placeholderTextColor="#9CA3AF"
                                    value={beneficiaryName}
                                    onChangeText={setBeneficiaryName}
                                />
                            </View>
                        </View>

                        <View style={styles.beneficiaryModalButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.saveBeneficiaryConfirmButton,
                                    isProcessing && styles.saveBeneficiaryConfirmButtonDisabled,
                                ]}
                                onPress={handleSaveBeneficiary}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <ThemedText style={styles.saveBeneficiaryConfirmButtonText}>Save</ThemedText>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelBeneficiaryButton}
                                onPress={() => {
                                    setShowSaveBeneficiaryModal(false);
                                    setBeneficiaryName('');
                                }}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.cancelBeneficiaryButtonText}>Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Manage Beneficiaries Modal */}
            <Modal
                visible={showManageBeneficiariesModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowManageBeneficiariesModal(false)}
            >
                <Pressable
                    style={styles.beneficiaryModalOverlay}
                    onPress={() => setShowManageBeneficiariesModal(false)}
                >
                    <Pressable style={styles.beneficiaryModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.beneficiaryModalHeader}>
                            <ThemedText style={styles.beneficiaryModalTitle}>Manage Beneficiaries</ThemedText>
                            <TouchableOpacity
                                style={styles.beneficiaryModalCloseButton}
                                onPress={() => setShowManageBeneficiariesModal(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.beneficiariesList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.beneficiariesListContent}
                        >
                            {beneficiariesLoading ? (
                                <View style={styles.beneficiariesLoadingContainer}>
                                    <ActivityIndicator size="small" color="#42AC36" />
                                    <ThemedText style={styles.beneficiariesLoadingText}>Loading...</ThemedText>
                                </View>
                            ) : beneficiaries.filter((b: any) => b.category?.code === CATEGORY_CODE).length > 0 ? (
                                beneficiaries
                                    .filter((b: any) => b.category?.code === CATEGORY_CODE)
                                    .map((beneficiary: any) => {
                                        const provider = providers.find((p: any) => p.id === beneficiary.provider_id);
                                        return (
                                            <View key={beneficiary.id} style={styles.beneficiaryListItem}>
                                                <View style={styles.beneficiaryListItemContent}>
                                                    <ThemedText style={styles.beneficiaryListItemName}>
                                                        {beneficiary.name || 'Unnamed'}
                                                    </ThemedText>
                                                    <ThemedText style={styles.beneficiaryListItemNumber}>
                                                        {beneficiary.account_number}
                                                    </ThemedText>
                                                    <ThemedText style={styles.beneficiaryListItemProvider}>
                                                        {provider?.name || beneficiary.provider?.name || ''} • {beneficiary.account_type || 'N/A'}
                                                    </ThemedText>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.deleteBeneficiaryButton}
                                                    onPress={() => handleDeleteBeneficiary(beneficiary.id)}
                                                    disabled={isProcessing}
                                                    activeOpacity={0.8}
                                                >
                                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })
                            ) : (
                                <View style={styles.emptyBeneficiariesModalContainer}>
                                    <ThemedText style={styles.emptyBeneficiariesModalText}>No beneficiaries saved</ThemedText>
                                    <ThemedText style={styles.emptyBeneficiariesModalSubtext}>
                                        Save beneficiaries after successful payments for faster checkout
                                    </ThemedText>
                                </View>
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
    },
    placeholder: {
        width: 40,
    },
    balanceCard: {
        borderRadius: 20,
        padding: 20,
        paddingVertical: 35,
        marginBottom: 24,
        overflow: 'hidden',
    },
    balanceCardImage: {
        borderRadius: 15,
    },
    balanceLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF80',
        opacity: 0.9,
        marginBottom: 17,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    balanceCurrency: {
        fontSize: 20,
        fontWeight: '400',
        color: '#FFFFFF',
        marginRight: 8,
    },
    balanceAmount: {
        fontSize: 25,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    detailsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 16,
    },
    inputContainer: {
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 10,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        flex: 1,
    },
    inputPlaceholder: {
        color: '#9CA3AF',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    proceedButton: {
        backgroundColor: '#42AC36',
        borderRadius: 100,
        padding: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    proceedButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    proceedButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    // Biller Modal Styles
    billerModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    billerModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 32,
        paddingHorizontal: 20,
        maxHeight: height * 0.9,
        width: '100%',
    },
    billerModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    billerModalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
    },
    billerModalCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    billerSearchContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
    },
    billerSearchInput: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    billersList: {
        maxHeight: 400,
        marginBottom: 20,
    },
    billersListContent: {
        paddingBottom: 10,
    },
    noBillersContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noBillersText: {
        fontSize: 14,
        color: '#6B7280',
    },
    billerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    billerItemText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        flex: 1,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#42AC36',
    },
    billerModalButtonContainer: {
        paddingTop: 16,
    },
    // Account Type Modal Styles
    accountTypeModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    accountTypeModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 32,
        paddingHorizontal: 20,
        maxHeight: height * 0.9,
        width: '100%',
    },
    accountTypeModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    accountTypeModalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
    },
    accountTypeModalCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    accountTypesList: {
        marginBottom: 20,
    },
    accountTypeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    accountTypeItemText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        flex: 1,
    },
    accountTypeModalButtonContainer: {
        paddingTop: 16,
    },
    applyButton: {
        backgroundColor: '#42AC36',
        borderRadius: 100,
        padding: 16,
        paddingVertical: 18,
        alignItems: 'center',
    },
    applyButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    // Summary Modal Styles
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
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
    },
    // Security Modal Styles
    securityModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    securityModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 32,
        maxHeight: '90%',
        width: '100%',
    },
    securityModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        position: 'relative',
    },
    securityModalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
    },
    securityModalCloseButton: {
        position: 'absolute',
        right: 20,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    verificationContainer: {
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    verificationIconOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    verificationIconMiddle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    verificationIconInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verificationText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FF9500',
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    pinDot: {
        width: 70,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#EFEFEF',
        marginHorizontal: 5,
    },
    pinDotFilled: {
        backgroundColor: '#42AC36',
    },
    securityNumpadContainer: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        paddingTop: 23,
    },
    numpadLeft: {
        flex: 1,
        maxWidth: 280,
        marginLeft: 10,
    },
    numpadRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    numButton: {
        width: 85,
        height: 58,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    numButtonText: {
        fontSize: 28,
        fontWeight: '400',
        color: '#000000',
    },
    backspaceButton: {
        width: 85,
        height: 58,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    numpadRight: {
        width: 85,
        marginLeft: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    nextButton: {
        width: 85,
        height: 150,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 70,
    },
    nextButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    nextButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
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
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingVertical: 18,
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
    saveBeneficiaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#42AC36',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    saveBeneficiaryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#42AC36',
    },
    recentSection: {
        marginBottom: 24,
    },
    recentSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    manageButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#42AC36',
    },
    recentScrollContent: {
        gap: 12,
    },
    recentCard: {
        width: 85,
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 12,
        alignItems: 'center',
        marginRight: 12,
    },
    recentLogoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    recentPhoneNumber: {
        fontSize: 8,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    recentNetworkName: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    emptyBeneficiariesContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyBeneficiariesText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 4,
    },
    emptyBeneficiariesSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    beneficiaryModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    beneficiaryModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 32,
        paddingHorizontal: 20,
        maxHeight: height * 0.9,
        width: '100%',
    },
    beneficiaryModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    beneficiaryModalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
    },
    beneficiaryModalCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    beneficiaryForm: {
        marginBottom: 24,
    },
    beneficiaryInputContainer: {
        marginBottom: 16,
    },
    beneficiaryLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 8,
    },
    beneficiaryValue: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
    },
    beneficiaryNameInput: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    beneficiaryModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    saveBeneficiaryConfirmButton: {
        flex: 1,
        backgroundColor: '#42AC36',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBeneficiaryConfirmButtonDisabled: {
        opacity: 0.6,
    },
    saveBeneficiaryConfirmButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    cancelBeneficiaryButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBeneficiaryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    beneficiariesList: {
        maxHeight: 400,
    },
    beneficiariesListContent: {
        paddingBottom: 10,
    },
    beneficiariesLoadingContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    beneficiariesLoadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    beneficiaryListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    beneficiaryListItemContent: {
        flex: 1,
    },
    beneficiaryListItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    beneficiaryListItemNumber: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
        marginBottom: 2,
    },
    beneficiaryListItemProvider: {
        fontSize: 11,
        fontWeight: '400',
        color: '#9CA3AF',
    },
    deleteBeneficiaryButton: {
        padding: 8,
    },
    emptyBeneficiariesModalContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyBeneficiariesModalText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 8,
    },
    emptyBeneficiariesModalSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

export default ElectricityScreen;

