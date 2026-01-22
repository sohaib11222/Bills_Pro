import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useBillPaymentProviders, useBillPaymentPlans } from '../../queries/billPaymentQueries';
import { useBillPaymentBeneficiaries } from '../../queries/billPaymentQueries';
import { useInitiateBillPayment, useConfirmBillPayment, useCreateBeneficiary, useDeleteBeneficiary } from '../../mutations/billPaymentMutations';
import { useFiatWallets } from '../../queries/walletQueries';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_CODE = 'data';

// Network logo mapping - fallback if provider doesn't have logo
const networkLogoMap: { [key: string]: any } = {
    'mtn': require('../../assets/airtime.png'),
    'glo': require('../../assets/datarecharge.png'),
    'airtel': require('../../assets/airtel.png'),
    '9mobile': require('../../assets/9mobile.png'),
};

// Duration filters for plans (currently informational)
const durations = ['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'];


const DataRechargeScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
    const [selectedProviderName, setSelectedProviderName] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<{ id: number; name: string; amount: number; data_amount?: string; validity_days?: number } | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState<string>('All');
    const [planSearchQuery, setPlanSearchQuery] = useState('');
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pin, setPin] = useState('');
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
    const { data: plansData, isLoading: plansLoading } = useBillPaymentPlans(selectedProviderId || 0);
    const { data: beneficiariesData, isLoading: beneficiariesLoading } = useBillPaymentBeneficiaries();
    const { data: walletsData, isLoading: walletsLoading } = useFiatWallets();
    const initiateMutation = useInitiateBillPayment();
    const confirmMutation = useConfirmBillPayment();
    const createBeneficiaryMutation = useCreateBeneficiary();
    const deleteBeneficiaryMutation = useDeleteBeneficiary();

    const providers = providersData?.data || [];
    const plans = plansData?.data || [];
    const beneficiaries = beneficiariesData?.data || [];
    const fiatWallets = walletsData?.data || [];
    const ngnWallet = fiatWallets.find((w: any) => w.currency === 'NGN');
    const balance = ngnWallet?.balance || 0;

    // Reset plan when provider changes
    useEffect(() => {
        if (selectedProviderId) {
            setSelectedPlan(null);
        }
    }, [selectedProviderId]);

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    // Handle initiate payment
    const handleProceed = async () => {
        if (!selectedProviderId || !phoneNumber || !selectedPlan) {
            Alert.alert('Error', 'Please select provider, plan, and enter phone number');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await initiateMutation.mutateAsync({
                categoryCode: CATEGORY_CODE,
                providerId: selectedProviderId,
                planId: selectedPlan.id,
                accountNumber: phoneNumber,
                currency: 'NGN',
            });

            if (result.success && result.data) {
                setTransactionId(result.data.transactionId);
                setTransactionReference(result.data.reference);
                setFee(result.data.fee || 0);
                setTotalAmount(result.data.totalAmount || selectedPlan.amount);
                setShowSummaryModal(true);
            } else {
                Alert.alert('Error', result.message || 'Failed to initiate payment');
            }
        } catch (error: any) {
            console.error('Initiate payment error:', error);
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
        setPin(''); // Reset PIN
    };

    // Handle confirm payment
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
                setPin(''); // Reset PIN on error
            }
        } catch (error: any) {
            console.error('Confirm payment error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Payment confirmation failed. Please try again.';
            Alert.alert('Error', errorMessage);
            setPin(''); // Reset PIN on error
        } finally {
            setIsProcessing(false);
        }
    };

    // Check if beneficiary already exists
    const beneficiaryExists = beneficiaries.some((b: any) => 
        b.provider_id === selectedProviderId && 
        b.account_number === phoneNumber &&
        b.category?.code === CATEGORY_CODE
    );

    // Handle save beneficiary
    const handleSaveBeneficiary = async () => {
        if (!selectedProviderId || !phoneNumber) {
            Alert.alert('Error', 'Missing provider or phone number');
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
                accountNumber: phoneNumber,
                name: beneficiaryName || undefined,
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
        // Reset form
        setPhoneNumber('');
        setSelectedProviderId(null);
        setSelectedProviderName(null);
        setSelectedPlan(null);
        setPin('');
        setTransactionId(null);
        setTransactionReference(null);
        setFee(0);
        setTotalAmount(0);
        setBeneficiaryName('');
        
        navigation.navigate('TransactionHistory', {
            type: 'bill_payment',
            transactionData: {
                type: 'Data Recharge',
                billerType: selectedProviderName,
                phoneNumber: phoneNumber,
                dataPlan: selectedPlan?.name || '',
                amount: selectedPlan?.amount?.toString() || '0',
                fee: fee.toString(),
                totalAmount: totalAmount.toString(),
                date: new Date().toLocaleString(),
                status: 'Successful',
                transactionId: transactionReference,
            },
        });
    };

    const formatAmount = (amt: string | number) => {
        if (!amt) return '';
        const num = typeof amt === 'string' ? parseFloat(amt.replace(/,/g, '')) : amt;
        if (isNaN(num)) return amt.toString();
        return num.toLocaleString('en-US');
    };

    // Filter plans based on search and duration
    const filteredPlans = plans.filter((plan: any) => {
        if (planSearchQuery && !plan.name?.toLowerCase().includes(planSearchQuery.toLowerCase())) return false;
        // Duration filtering can be based on validity_days if available
        // For now, show all plans
        return true;
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
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
                    <ThemedText style={styles.headerTitle}>Data Recharge</ThemedText>
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
                                {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                    const providerCode = provider?.code?.toLowerCase() || 'mtn';
                                    return (
                                        <TouchableOpacity
                                            key={beneficiary.id}
                                            style={styles.recentCard}
                                            onPress={() => {
                                                setPhoneNumber(beneficiary.account_number || beneficiary.phone_number || '');
                                                setSelectedProviderId(beneficiary.provider_id);
                                                setSelectedProviderName(provider?.name || beneficiary.provider?.name || '');
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.recentLogoContainer, { backgroundColor: '#FFD700' }]}>
                                                <Image
                                                    source={networkLogoMap[providerCode] || require('../../assets/airtime.png')}
                                                    style={styles.recentLogoImage}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                            <ThemedText style={styles.recentPhoneNumber}>
                                                {beneficiary.account_number || beneficiary.phone_number || ''}
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


                {/* Select Network Section */}
                <View style={styles.networkSection}>
                    <ThemedText style={styles.sectionTitle}>Select network</ThemedText>
                    {providersLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#42AC36" />
                            <ThemedText style={styles.loadingText}>Loading providers...</ThemedText>
                        </View>
                    ) : providers.length === 0 ? (
                        <ThemedText style={styles.errorText}>No providers available</ThemedText>
                    ) : (
                        <View style={styles.networkButtonsRow}>
                            {providers.map((provider: any) => {
                                const providerCode = provider.code?.toLowerCase() || 'mtn';
                                const logoColor = providerCode === 'mtn' ? '#FFD700' : 
                                                 providerCode === 'glo' ? '#008000' :
                                                 providerCode === 'airtel' ? '#FF0000' : '#008000';
                                return (
                                    <TouchableOpacity
                                        key={provider.id}
                                        style={[
                                            styles.networkButton,
                                            selectedProviderId === provider.id && styles.networkButtonActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedProviderId(provider.id);
                                            setSelectedProviderName(provider.name);
                                            setSelectedPlan(null); // Reset plan when provider changes
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.networkLogoContainer, { backgroundColor: logoColor }]}>
                                            <Image
                                                source={networkLogoMap[providerCode] || require('../../assets/airtime.png')}
                                                style={styles.networkLogoImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                        <ThemedText style={styles.networkName}>{provider.name}</ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Select Plan Input */}
                <TouchableOpacity
                    style={[styles.inputContainer, { padding: 20 }]}
                    onPress={() => {
                        if (selectedProviderId) {
                            setShowPlanModal(true);
                        } else {
                            Alert.alert('Info', 'Please select a network provider first');
                        }
                    }}
                    activeOpacity={0.8}
                    disabled={!selectedProviderId}
                >
                    <ThemedText style={[styles.input, !selectedPlan && styles.inputPlaceholder]}>
                        {selectedPlan ? `${selectedPlan.name} - N${formatAmount(selectedPlan.amount)}` : 'Select Plan'}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Phone Number Input */}
                <View style={[styles.inputContainer, { marginBottom: 100 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone number"
                        placeholderTextColor="#9CA3AF"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>
            </ScrollView>

            {/* Proceed Button - Fixed at Bottom */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        (!selectedProviderId || !phoneNumber || !selectedPlan || isProcessing) && styles.proceedButtonDisabled,
                    ]}
                    onPress={handleProceed}
                    disabled={!selectedProviderId || !phoneNumber || !selectedPlan || isProcessing}
                    activeOpacity={0.8}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
                    )}
                </TouchableOpacity>
            </View>

            {/* Select Plan Modal */}
            <Modal
                visible={showPlanModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPlanModal(false)}
            >
                <Pressable
                    style={styles.planModalOverlay}
                    onPress={() => setShowPlanModal(false)}
                >
                    <Pressable style={styles.planModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.planModalHeader}>
                            <ThemedText style={styles.planModalTitle}>Select Plan for {selectedProviderName || 'Provider'}</ThemedText>
                            <TouchableOpacity
                                style={styles.planModalCloseButton}
                                onPress={() => setShowPlanModal(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.planSearchContainer}>
                            <TextInput
                                style={styles.planSearchInput}
                                placeholder="Search plan"
                                placeholderTextColor="#9CA3AF"
                                value={planSearchQuery}
                                onChangeText={setPlanSearchQuery}
                            />
                        </View>

                        {/* Duration Tabs */}
                        <View style={styles.durationTabsContainer}>
                            {durations.map((duration) => (
                                <TouchableOpacity
                                    key={duration}
                                    style={[
                                        styles.durationTab,
                                        selectedDuration === duration && styles.durationTabActive,
                                    ]}
                                    onPress={() => setSelectedDuration(duration)}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText
                                        style={[
                                            styles.durationTabText,
                                            selectedDuration === duration && styles.durationTabTextActive,
                                        ]}
                                    >
                                        {duration}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Plans List */}
                        <ScrollView
                            style={styles.plansList}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.plansListContent}
                            nestedScrollEnabled={true}
                        >
                            {plansLoading ? (
                                <View style={styles.noPlansContainer}>
                                    <ActivityIndicator size="small" color="#42AC36" />
                                    <ThemedText style={styles.noPlansText}>Loading plans...</ThemedText>
                                </View>
                            ) : filteredPlans.length > 0 ? (
                                filteredPlans.map((plan: any) => (
                                    <TouchableOpacity
                                        key={plan.id}
                                        style={styles.planItem}
                                        onPress={() => setSelectedPlan({
                                            id: plan.id,
                                            name: plan.name,
                                            amount: plan.amount,
                                            data_amount: plan.data_amount,
                                            validity_days: plan.validity_days,
                                        })}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.planItemContent}>
                                            <ThemedText style={styles.planItemText}>
                                                {plan.name}
                                            </ThemedText>
                                            {plan.data_amount && (
                                                <ThemedText style={styles.planItemData}>
                                                    {plan.data_amount}
                                                </ThemedText>
                                            )}
                                            {plan.validity_days && (
                                                <ThemedText style={styles.planItemValidity}>
                                                    Valid for {plan.validity_days} day{plan.validity_days > 1 ? 's' : ''}
                                                </ThemedText>
                                            )}
                                            <ThemedText style={styles.planItemPrice}>
                                                N{formatAmount(plan.amount)}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.radioButton}>
                                            {selectedPlan?.id === plan.id && <View style={styles.radioButtonInner} />}
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.noPlansContainer}>
                                    <ThemedText style={styles.noPlansText}>No plans found</ThemedText>
                                </View>
                            )}
                        </ScrollView>

                        {/* Apply Button */}
                        <View style={styles.planModalButtonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.applyButton,
                                    !selectedPlan && styles.applyButtonDisabled,
                                ]}
                                onPress={() => {
                                    if (selectedPlan) {
                                        setShowPlanModal(false);
                                    }
                                }}
                                disabled={!selectedPlan}
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
                                You are about to make a data recharge of{' '}
                                <ThemedText style={styles.pendingAmount}>N{selectedPlan ? formatAmount(selectedPlan.amount) : '0'} {selectedProviderName}</ThemedText>
                            </ThemedText>
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{selectedPlan ? formatAmount(selectedPlan.amount) : '0'}</ThemedText>
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
                                <ThemedText style={styles.summaryLabel}>Network provider:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedProviderName || 'N/A'}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Data Plan:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedPlan?.name || ''}</ThemedText>
                            </View>
                            {selectedPlan?.data_amount && (
                                <View style={styles.summaryRow}>
                                    <ThemedText style={styles.summaryLabel}>Data Amount:</ThemedText>
                                    <ThemedText style={styles.summaryValue}>{selectedPlan.data_amount}</ThemedText>
                                </View>
                            )}
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Phone Number:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{phoneNumber}</ThemedText>
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
                                        onPress={() => {}}
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
                            You have successfully completed a data recharge of{' '}
                            <ThemedText style={styles.successAmount}>N{selectedPlan ? formatAmount(selectedPlan.amount) : '0'}</ThemedText>
                        </ThemedText>
                        {!beneficiaryExists && selectedProviderId && phoneNumber && (
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
                                <ThemedText style={styles.beneficiaryLabel}>Phone Number</ThemedText>
                                <ThemedText style={styles.beneficiaryValue}>{phoneNumber}</ThemedText>
                            </View>
                            <View style={styles.beneficiaryInputContainer}>
                                <ThemedText style={styles.beneficiaryLabel}>Network</ThemedText>
                                <ThemedText style={styles.beneficiaryValue}>{selectedProviderName}</ThemedText>
                            </View>
                            <View style={styles.beneficiaryInputContainer}>
                                <ThemedText style={styles.beneficiaryLabel}>Name (Optional)</ThemedText>
                                <TextInput
                                    style={styles.beneficiaryNameInput}
                                    placeholder="e.g., My Phone, Home"
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
                                                        {provider?.name || beneficiary.provider?.name || ''}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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
        fontSize: 50,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    recentSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 12,
    },
    recentScrollContent: {
        // gap: 3,
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
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    recentLogoImage: {
        width: 24,
        height: 24,
        borderRadius: 100,
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
    amountSection: {
        marginBottom: 24,
    },
    quickAmountRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    quickAmountButton: {
        backgroundColor: '#EFEFEF',
        borderWidth: 0.5,
        borderColor: '#42AC36',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: (width - 64) / 4.4,
    },
    quickAmountButtonActive: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#42AC36',
    },
    quickAmountText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#42AC36',
        textAlign: 'center',
    },
    quickAmountTextActive: {
        fontWeight: '600',
    },
    amountInputContainer: {
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 14,
    },
    amountInput: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    networkSection: {
        marginBottom: 24,
    },
    networkButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    networkButton: {
        width: (width - 64) / 4.4,
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 12,
        alignItems: 'center',
    },
    networkButtonActive: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#1B800F',
    },
    networkLogoContainer: {
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    networkLogoImage: {
        width: 35,
        height: 35,
        borderRadius: 100,
    },
    networkName: {
        fontSize: 12,
        fontWeight: '400',
        color: '#111827',
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
    // Plan Modal Styles
    planModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    planModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 32,
        paddingHorizontal: 20,
        maxHeight: height * 0.9,
        width: '100%',
    },
    planModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    planModalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
    },
    planModalCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    planSearchContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 10,
        marginBottom: 16,
    },
    planSearchInput: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    durationTabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        padding: 4,
        marginBottom: 20,
    },
    durationTab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 100,
    },
    durationTabActive: {
        backgroundColor: '#1B800F',
    },
    durationTabText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#111827',
    },
    durationTabTextActive: {
        color: '#FFFFFF',
    },
    plansList: {
        height: 300,
        marginBottom: 20,
    },
    plansListContent: {
        paddingBottom: 10,
    },
    noPlansContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noPlansText: {
        fontSize: 14,
        color: '#6B7280',
    },
    planItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    planItemText: {
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
    planModalButtonContainer: {
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
        maxWidth: 290,
        marginLeft: 10,
    },
    numpadRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    numButton: {
        width: 90,
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    numButtonText: {
        fontSize: 30,
        fontWeight: '400',
        color: '#000000',
    },
    backspaceButton: {
        width: 90,
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    numpadRight: {
        width: 90,
        marginLeft: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    nextButton: {
        width: 90,
        height: 200,
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        padding: 20,
    },
    proceedSummaryButtonDisabled: {
        opacity: 0.6,
    },
    planItemContent: {
        flex: 1,
    },
    planItemData: {
        fontSize: 12,
        color: '#42AC36',
        marginTop: 4,
    },
    planItemValidity: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 2,
    },
    planItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginTop: 4,
    },
});

export default DataRechargeScreen;

