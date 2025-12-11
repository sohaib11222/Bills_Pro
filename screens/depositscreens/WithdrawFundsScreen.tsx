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
    Platform,
    StatusBar as RNStatusBar,
    Modal,
    Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Account {
    id: string;
    accountName: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
}

const WithdrawFundsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState<string | null>(null);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const quickAmounts = ['2,000', '5,000', '10,000', '202,000'];

    const accounts: Account[] = [
        {
            id: '1',
            accountName: 'Account 1',
            accountHolderName: 'Qamardeen Abdul Malik',
            bankName: 'Access Bank',
            accountNumber: '113456789',
        },
        {
            id: '2',
            accountName: 'Account 2',
            accountHolderName: 'Qamardeen Abdul Malik',
            bankName: 'Access Bank',
            accountNumber: '113456789',
        },
        {
            id: '3',
            accountName: 'Account 3',
            accountHolderName: 'Qamardeen Abdul Malik',
            bankName: 'Access Bank',
            accountNumber: '113456789',
        },
    ];

    const handleNumberPress = (num: string) => {
        if (num === '.') {
            if (!withdrawAmount.includes('.')) {
                setWithdrawAmount(withdrawAmount + num);
            }
        } else {
            setWithdrawAmount(withdrawAmount + num);
        }
    };

    const handleBackspace = () => {
        setWithdrawAmount(withdrawAmount.slice(0, -1));
    };

    const handleQuickAmount = (amount: string) => {
        setSelectedQuickAmount(amount);
        setWithdrawAmount(amount.replace(/,/g, ''));
    };

    const handleSelectAccount = () => {
        setShowAccountModal(true);
    };

    const handleAccountSelect = (account: Account) => {
        setSelectedAccount(account);
        setShowAccountModal(false);
    };

    const handleNext = () => {
        if (withdrawAmount.trim() !== '' && selectedAccount) {
            setShowSummaryModal(true);
        }
    };

    const handleSummaryProceed = () => {
        setShowSummaryModal(false);
        setShowSuccessModal(true);
    };

    const handleSuccessTransaction = () => {
        setShowSuccessModal(false);
        const formattedAmount = formatAmount(withdrawAmount);
        const totalAmount = (parseFloat(withdrawAmount.replace(/,/g, '') || '0') + 200).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        
        navigation.navigate('TransactionHistory', {
            type: 'withdrawal',
            transactionData: {
                type: 'Fiat Withdrawal',
                amount: `N${formattedAmount}`,
                fee: 'N200',
                totalAmount: `N${totalAmount}`,
                bankName: selectedAccount?.bankName || 'Access Bank',
                accountNumber: selectedAccount?.accountNumber || '113456789',
                accountName: selectedAccount?.accountHolderName || 'Qamardeen Abdul Malik',
                transactionId: '2348hf8283hfc92eni',
                date: new Date().toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }) + ' - ' + new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                status: 'Successful',
            },
        });
    };

    const formatAmount = (amount: string) => {
        if (!amount) return '';
        const num = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(num)) return amount;
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formattedWithdrawAmount = formatAmount(withdrawAmount);
    const totalAmount = (parseFloat(withdrawAmount.replace(/,/g, '') || '0') + 200).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Withdraw Funds</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Balance Card */}
                <ImageBackground
                    source={require('../../assets/green_background.png')}
                    style={styles.balanceCard}
                    imageStyle={styles.balanceCardImage}
                    resizeMode="cover"
                >
                    <ThemedText style={styles.balanceLabel}>My Balance</ThemedText>
                    <View style={styles.balanceRow}>
                        <ThemedText style={styles.balanceCurrency}>N</ThemedText>
                        <ThemedText style={styles.balanceAmount}>10,000.00</ThemedText>
                    </View>
                </ImageBackground>
                <View style={styles.transferStrip}>
                    <Image
                        source={require('../../assets/emojione_flag-for-nigeria.png')}
                        style={styles.flagIcon}
                        resizeMode="contain"
                    />
                    <View style={styles.transferInfo}>
                        <ThemedText style={styles.transferTitle}>Instant Transfer</ThemedText>
                        <ThemedText style={styles.transferFee}>Fee: N200</ThemedText>
                    </View>
                </View>

                {/* Withdrawal Amount Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Withdrawal Amount"
                        placeholderTextColor="#9CA3AF"
                        value={formattedWithdrawAmount}
                        onChangeText={(text) => setWithdrawAmount(text.replace(/,/g, ''))}
                        keyboardType="numeric"
                    />
                </View>

                {/* Select Account Input */}
                <TouchableOpacity
                    style={[styles.inputContainer, {padding:20}]}
                    onPress={handleSelectAccount}
                    activeOpacity={0.7}
                >
                    <View style={styles.selectAccountRow}>
                        <ThemedText style={[styles.input, !selectedAccount && styles.placeholderText]}>
                            {selectedAccount ? `${selectedAccount.accountName} - ${selectedAccount.bankName}` : 'Select Account'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>

                {/* Recently Withdrawn */}
                <View style={styles.recentSection}>
                    <ThemedText style={styles.recentLabel}>Recently withdrawn</ThemedText>
                    <View style={styles.quickAmountRow}>
                        {quickAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.quickAmountButton,
                                    selectedQuickAmount === amount && styles.quickAmountButtonActive,
                                ]}
                                onPress={() => handleQuickAmount(amount)}
                                activeOpacity={0.7}
                            >
                                <ThemedText
                                    style={[
                                        styles.quickAmountText,
                                        selectedQuickAmount === amount && styles.quickAmountTextActive,
                                    ]}
                                >
                                    {amount}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Numeric Keypad */}
            <View style={styles.numpadContainer}>
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
                            onPress={() => handleNumberPress('00')}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.numButtonText}>00</ThemedText>
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
                            (withdrawAmount.trim() === '' || !selectedAccount) && styles.nextButtonDisabled,
                        ]}
                        onPress={handleNext}
                        disabled={withdrawAmount.trim() === '' || !selectedAccount}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.nextButtonText}>Next</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Account Selection Modal */}
            <Modal
                visible={showAccountModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAccountModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowAccountModal(false)}
                >
                    <Pressable style={styles.accountModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.accountModalHeader}>
                            <ThemedText style={styles.accountModalTitle}>My Accounts</ThemedText>
                            <TouchableOpacity
                                style={styles.accountModalCloseButton}
                                onPress={() => setShowAccountModal(false)}
                            >
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.accountList} showsVerticalScrollIndicator={false}>
                            {accounts.map((account) => (
                                <TouchableOpacity
                                    key={account.id}
                                    style={styles.accountCard}
                                    onPress={() => handleAccountSelect(account)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.accountCardHeader}>
                                        <View style={styles.accountTitleRow}>
                                            <Image
                                                source={require('../../assets/Bank (1).png')}
                                                style={styles.bankIcon}
                                                resizeMode="contain"
                                            />
                                            <ThemedText style={styles.accountName}>{account.accountName}</ThemedText>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.selectButton}
                                            onPress={() => handleAccountSelect(account)}
                                            activeOpacity={0.7}
                                        >
                                            <ThemedText style={styles.selectButtonText}>Select</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <ThemedText style={styles.accountHolderName}>{account.accountHolderName}</ThemedText>
                                    
                                    <View style={styles.accountDetailsRow}>
                                        <ThemedText style={styles.bankName}>{account.bankName}</ThemedText>
                                        <View style={styles.dot} />
                                        <ThemedText style={styles.accountNumber}>{account.accountNumber}</ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
                                You are about to make a withdrawal of{' '}
                                <ThemedText style={styles.pendingAmount}>N{formattedWithdrawAmount}</ThemedText>
                            </ThemedText>
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{formattedWithdrawAmount}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Fee:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N200</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{totalAmount}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Bank Name:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedAccount?.bankName || 'Access Bank'}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account Number:</ThemedText>
                                <View style={styles.copyRow}>
                                    <ThemedText style={styles.summaryValue}>{selectedAccount?.accountNumber || '113456789'}</ThemedText>
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.summaryRow, styles.summaryRowLast]}>
                                <ThemedText style={styles.summaryLabel}>Account Name:</ThemedText>
                                <View style={styles.copyRow}>
                                    <ThemedText style={styles.summaryValue}>{selectedAccount?.accountHolderName || 'Qamardeen Abdul Malik'}</ThemedText>
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
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

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <Pressable
                    style={styles.successModalOverlay}
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
                            You have successfully completed a withdrawal of{' '}
                            <ThemedText style={styles.successAmount}>N{formattedWithdrawAmount}</ThemedText>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 350,
    },
    balanceCard: {
        borderRadius: 20,
        padding: 20,
        paddingVertical: 35,
        marginTop: 20,
        overflow: 'hidden',
        zIndex: 10,
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
    transferStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 35,
        backgroundColor: '#42AC3680',
        borderRadius: 20,
        padding: 12,
        paddingBottom: 7,
        marginTop: -28,
        marginBottom: 25,
    },
    flagIcon: {
        width: 32,
        height: 32,
        marginRight: 12,
    },
    transferInfo: {
        flex: 1,
    },
    transferTitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    transferFee: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    inputContainer: {
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 14,
        marginBottom: 24,
    },
    input: {
        fontSize: 14,
        fontWeight: '400',
        color: '#00000080',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    selectAccountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recentSection: {
        marginBottom: 20,
    },
    recentLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 12,
    },
    quickAmountRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickAmountButton: {
        backgroundColor: '#EFEFEF',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: '#42AC36',
        paddingVertical: 12,
        minWidth: (width - 64) / 4.4,
    },
    quickAmountButtonActive: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#1B800F',
    },
    quickAmountText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1B800F',
        textAlign: 'center',
    },
    quickAmountTextActive: {
        fontWeight: '600',
    },
    numpadContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 316,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 23,
        backgroundColor: '#FFFFFF',
    },
    numpadLeft: {
        flex: 1,
        maxWidth: 290,
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
    numpadRight: {
        width: 90,
        marginLeft: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    backspaceButton: {
        width: 90,
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 10,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    accountModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        position: 'relative',
    },
    accountModalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
    },
    accountModalCloseButton: {
        position: 'absolute',
        right: 20,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    accountList: {
        paddingHorizontal: 20,
    },
    accountCard: {
        backgroundColor: '#EFEFEF',
        borderRadius: 12,
        marginBottom: 16,
    },
    accountCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E0E0E0',
        padding: 13,
        paddingVertical: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    accountTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bankIcon: {
        width: 24,
        height: 24,
        tintColor: '#1B800F',
        marginRight: 8,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1B800F',
    },
    selectButton: {
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    selectButtonText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    accountHolderName: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 8,
        paddingHorizontal: 13,
        marginTop: 12,
    },
    accountDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        paddingBottom: 20,
    },
    bankName: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#6B7280',
        marginHorizontal: 8,
    },
    accountNumber: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
    },
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
        paddingVertical: 20,
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
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    summaryRowLast: {
        borderBottomWidth: 0,
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
    copyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
        fontWeight: '400',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
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
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeSuccessButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
    },
});

export default WithdrawFundsScreen;

