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

const billers = [
    { id: 'Ikeja Electricity', name: 'Ikeja Electricity' },
    { id: 'Ibadan Electricity', name: 'Ibadan Electricity' },
    { id: 'Abuja Electricity', name: 'Abuja Electricity' },
];

const accountTypes = [
    { id: 'Prepaid', name: 'Prepaid' },
    { id: 'Postpaid', name: 'Postpaid' },
];

const ElectricityScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [amount, setAmount] = useState('');
    const [selectedBiller, setSelectedBiller] = useState<string | null>(null);
    const [selectedAccountType, setSelectedAccountType] = useState<string | null>(null);
    const [meterNumber, setMeterNumber] = useState('');
    const [showBillerModal, setShowBillerModal] = useState(false);
    const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
    const [billerSearchQuery, setBillerSearchQuery] = useState('');
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pin, setPin] = useState('');

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleProceed = () => {
        if (selectedBiller && selectedAccountType && meterNumber && amount) {
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
                type: 'Electricity Recharge',
                billerType: selectedBiller,
                meterNumber: meterNumber,
                accountType: selectedAccountType,
                accountName: 'Qamardeen Abdulmalik',
                amount: amount,
                fee: '200',
                totalAmount: (parseFloat(amount.replace(/,/g, '')) + 200).toString(),
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

    const filteredBillers = billers.filter(biller => {
        if (billerSearchQuery && !biller.name.toLowerCase().includes(billerSearchQuery.toLowerCase())) return false;
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
                        <ThemedText style={styles.balanceAmount}>10,000.00</ThemedText>
                    </View>
                </ImageBackground>

                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <ThemedText style={styles.sectionTitle}>Details</ThemedText>

                    {/* Biller Type Input */}
                    <TouchableOpacity
                        style={styles.inputContainer}
                        onPress={() => setShowBillerModal(true)}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={[styles.input, !selectedBiller && styles.inputPlaceholder]}>
                            {selectedBiller || 'Biller type'}
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
                            {selectedAccountType || 'Account type'}
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
                        (!selectedBiller || !selectedAccountType || !meterNumber || !amount) && styles.proceedButtonDisabled,
                    ]}
                    onPress={handleProceed}
                    disabled={!selectedBiller || !selectedAccountType || !meterNumber || !amount}
                    activeOpacity={0.8}
                >
                    <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
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
                            {filteredBillers.length > 0 ? (
                                filteredBillers.map((biller) => (
                                    <TouchableOpacity
                                        key={biller.id}
                                        style={styles.billerItem}
                                        onPress={() => setSelectedBiller(biller.id)}
                                        activeOpacity={0.8}
                                    >
                                        <ThemedText style={styles.billerItemText}>{biller.name}</ThemedText>
                                        <View style={styles.radioButton}>
                                            {selectedBiller === biller.id && <View style={styles.radioButtonInner} />}
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
                                    !selectedBiller && styles.applyButtonDisabled,
                                ]}
                                onPress={() => {
                                    if (selectedBiller) {
                                        setShowBillerModal(false);
                                    }
                                }}
                                disabled={!selectedBiller}
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
                                    onPress={() => setSelectedAccountType(accountType.id)}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText style={styles.accountTypeItemText}>{accountType.name}</ThemedText>
                                    <View style={styles.radioButton}>
                                        {selectedAccountType === accountType.id && <View style={styles.radioButtonInner} />}
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
                                You are about to make a Electricity recharge of{' '}
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
                                <ThemedText style={styles.summaryValue}>N200</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    N{formatAmount((parseFloat(amount.replace(/,/g, '')) + 200).toString())}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Biller Name:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedBiller}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Meter Number:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{meterNumber}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account type:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedAccountType}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account name:</ThemedText>
                                <ThemedText style={styles.summaryValue}>Qamardeen Abdulmalik</ThemedText>
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
                            You have successfully completed an Electricity recharge of{' '}
                            <ThemedText style={styles.successAmount}>N{formatAmount(amount)}</ThemedText>
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

export default ElectricityScreen;

