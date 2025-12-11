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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const networks = [
    { id: 'MTN', name: 'MTN', logoColor: '#FFD700', icon: require('../../assets/airtime.png') },
    { id: 'GLO', name: 'GLO', logoColor: '#008000', icon: require('../../assets/datarecharge.png') },
    { id: 'Airtel', name: 'Airtel', logoColor: '#FF0000', icon: require('../../assets/airtel.png') },
    { id: '9mobile', name: '9mobile', logoColor: '#008000', icon: require('../../assets/9mobile.png') },
];

const recentNumbers = [
    { id: '1', phoneNumber: '081134564789', network: 'MTN' },
    { id: '2', phoneNumber: '081134564789', network: 'MTN' },
    { id: '3', phoneNumber: '081134564789', network: 'MTN' },
    { id: '4', phoneNumber: '081134564789', network: 'MTN' },
    { id: '5', phoneNumber: '081134564789', network: 'MTN' },
];

const quickAmounts = ['2,000', '5,000', '10,000', '202,000'];

const dataPlans = [
    { id: '1', duration: 'Daily', name: '1 GIG for 1 day', price: '5,000' },
    { id: '2', duration: 'Daily', name: '1 GIG for 1 day', price: '5,000' },
    { id: '3', duration: 'Daily', name: '1 GIG for 1 day', price: '5,000' },
    { id: '4', duration: 'Daily', name: '1 GIG for 1 day', price: '5,000' },
    { id: '5', duration: 'Daily', name: '1 GIG for 1 day', price: '5,000' },
];

const durations = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const DataRechargeScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [amount, setAmount] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: string } | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState('Daily');
    const [planSearchQuery, setPlanSearchQuery] = useState('');
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pin, setPin] = useState('');

    const handleQuickAmount = (amt: string) => {
        setSelectedQuickAmount(amt);
        setAmount(amt.replace(/,/g, ''));
    };

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleProceed = () => {
        if (selectedNetwork && phoneNumber && selectedPlan) {
            setShowSummaryModal(true);
        }
    };

    const handleSummaryProceed = () => {
        setShowSummaryModal(false);
        setShowSecurityModal(true);
    };

    const handleSecurityNext = () => {
        if (pin.length === 4) {
            setShowSecurityModal(false);
            setShowSuccessModal(true);
        }
    };

    const handleSuccessTransaction = () => {
        setShowSuccessModal(false);
        navigation.navigate('TransactionHistory', {
            type: 'bill_payment',
                transactionData: {
                    type: 'Data Recharge',
                    billerType: selectedNetwork,
                    phoneNumber: phoneNumber,
                    dataPlan: selectedPlan?.name || '',
                    amount: selectedPlan?.price || amount,
                    fee: '200',
                    totalAmount: (parseFloat((selectedPlan?.price || amount).replace(/,/g, '')) + 200).toString(),
                    date: new Date().toLocaleString(),
                    status: 'Successful',
                    transactionId: '2348hf8283hfc92eni',
                },
        });
    };

    const formatAmount = (amt: string) => {
        if (!amt) return '';
        const num = parseFloat(amt.replace(/,/g, ''));
        if (isNaN(num)) return amt;
        return num.toLocaleString('en-US');
    };

    const filteredPlans = dataPlans.filter(plan => {
        if (selectedDuration !== 'Daily' && plan.duration !== selectedDuration) return false;
        if (planSearchQuery && !plan.name.toLowerCase().includes(planSearchQuery.toLowerCase())) return false;
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
                        <ThemedText style={styles.balanceAmount}>10,000.00</ThemedText>
                    </View>
                </ImageBackground>

                {/* Recent Section */}
                <View style={styles.recentSection}>
                    <ThemedText style={styles.sectionTitle}>Recent</ThemedText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recentScrollContent}
                    >
                        {recentNumbers.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.recentCard}
                                onPress={() => {
                                    setPhoneNumber(item.phoneNumber);
                                    setSelectedNetwork(item.network);
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.recentLogoContainer, { backgroundColor: '#FFD700' }]}>
                                    <Image
                                        source={require('../../assets/airtime.png')}
                                        style={styles.recentLogoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <ThemedText style={styles.recentPhoneNumber}>{item.phoneNumber}</ThemedText>
                                <ThemedText style={styles.recentNetworkName}>{item.network}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Choose Amount Section */}
                <View style={styles.amountSection}>
                    <ThemedText style={styles.sectionTitle}>Choose an amount</ThemedText>
                    <View style={styles.quickAmountRow}>
                        {quickAmounts.map((amt) => (
                            <TouchableOpacity
                                key={amt}
                                style={[
                                    styles.quickAmountButton,
                                    selectedQuickAmount === amt && styles.quickAmountButtonActive,
                                ]}
                                onPress={() => handleQuickAmount(amt)}
                                activeOpacity={0.8}
                            >
                                <ThemedText
                                    style={[
                                        styles.quickAmountText,
                                        selectedQuickAmount === amt && styles.quickAmountTextActive,
                                    ]}
                                >
                                    {amt}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.amountInputContainer}>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="Type Amount"
                            placeholderTextColor="#9CA3AF"
                            value={formatAmount(amount)}
                            onChangeText={(text) => setAmount(text.replace(/,/g, ''))}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Select Network Section */}
                <View style={styles.networkSection}>
                    <ThemedText style={styles.sectionTitle}>Select network</ThemedText>
                    <View style={styles.networkButtonsRow}>
                        {networks.map((network) => (
                            <TouchableOpacity
                                key={network.id}
                                style={[
                                    styles.networkButton,
                                    selectedNetwork === network.id && styles.networkButtonActive,
                                ]}
                                onPress={() => setSelectedNetwork(network.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.networkLogoContainer, { backgroundColor: network.logoColor }]}>
                                    <Image
                                        source={network.icon}
                                        style={styles.networkLogoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <ThemedText style={styles.networkName}>{network.name}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Select Plan Input */}
                <TouchableOpacity
                    style={[styles.inputContainer, { padding: 20 }]}
                    onPress={() => {
                        if (selectedNetwork) {
                            setShowPlanModal(true);
                        }
                    }}
                    activeOpacity={0.8}
                >
                    <ThemedText style={[styles.input, !selectedPlan && styles.inputPlaceholder]}>
                        {selectedPlan ? selectedPlan.name : 'Select Plan'}
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
                        (!selectedNetwork || !phoneNumber || !selectedPlan) && styles.proceedButtonDisabled,
                    ]}
                    onPress={handleProceed}
                    disabled={!selectedNetwork || !phoneNumber || !selectedPlan}
                    activeOpacity={0.8}
                >
                    <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
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
                            <ThemedText style={styles.planModalTitle}>Select Plan for {selectedNetwork}</ThemedText>
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
                            {filteredPlans.length > 0 ? (
                                filteredPlans.map((plan) => (
                                    <TouchableOpacity
                                        key={plan.id}
                                        style={styles.planItem}
                                        onPress={() => setSelectedPlan(plan)}
                                        activeOpacity={0.8}
                                    >
                                        <ThemedText style={styles.planItemText}>{plan.name} - N{plan.price}</ThemedText>
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
                                <ThemedText style={styles.pendingAmount}>N{selectedPlan?.price || formatAmount(amount)} {selectedNetwork}</ThemedText>
                            </ThemedText>
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{selectedPlan?.price || formatAmount(amount)}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Fee:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N200</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    N{formatAmount((parseFloat((selectedPlan?.price || amount).replace(/,/g, '')) + 200).toString())}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Network provider:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedNetwork}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Data Plan:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedPlan?.name || ''}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Phone Number:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{phoneNumber}</ThemedText>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.summaryButtons}>
                            <TouchableOpacity
                                style={styles.proceedSummaryButton}
                                onPress={handleSummaryProceed}
                                activeOpacity={0.8}
                            >
                                <ThemedText style={styles.proceedSummaryButtonText}>Proceed</ThemedText>
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
                                        pin.length !== 4 && styles.nextButtonDisabled,
                                    ]}
                                    onPress={handleSecurityNext}
                                    disabled={pin.length !== 4}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText style={styles.nextButtonText}>Next</ThemedText>
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
                            <ThemedText style={styles.successAmount}>N{selectedPlan?.price || formatAmount(amount)}</ThemedText>
                        </ThemedText>
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
});

export default DataRechargeScreen;

