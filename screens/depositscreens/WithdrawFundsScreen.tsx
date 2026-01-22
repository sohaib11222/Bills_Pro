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
    Platform,
    StatusBar as RNStatusBar,
    Modal,
    Pressable,
    ActivityIndicator,
    Alert,
    Clipboard,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useBankAccounts, useWithdrawalFee } from '../../queries/withdrawalQueries';
import { useWithdraw } from '../../mutations/withdrawalMutations';
import { useFiatWallets } from '../../queries/walletQueries';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WithdrawFundsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState<string | null>(null);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [pin, setPin] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch data
    const { data: balanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useFiatWallets();
    const { data: accountsData, refetch: refetchAccounts } = useBankAccounts();
    const { data: feeData } = useWithdrawalFee();
    const withdrawMutation = useWithdraw();

    const nairaWallet = balanceData?.data?.find((w: any) => w.currency === 'NGN' && w.country_code === 'NG');
    const balance = nairaWallet ? parseFloat(nairaWallet.balance || 0) : 0;
    const accounts = accountsData?.data || [];
    const withdrawalFee = parseFloat(feeData?.data?.fee || 200); // Default to N200

    // Set default account if available
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccount) {
            const defaultAccount = accounts.find((acc: any) => acc.is_default) || accounts[0];
            setSelectedAccount(defaultAccount);
        }
    }, [accounts]);

    const quickAmounts = ['2,000', '5,000', '10,000', '20,000'];

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

    const handlePinNumberPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handlePinBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleQuickAmount = (amount: string) => {
        setSelectedQuickAmount(amount);
        setWithdrawAmount(amount.replace(/,/g, ''));
    };

    // Handle pull to refresh
    const onRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetchBalance(),
                refetchAccounts(),
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSelectAccount = () => {
        setShowAccountModal(true);
    };

    const handleAccountSelect = (account: any) => {
        setSelectedAccount(account);
        setShowAccountModal(false);
    };

    const handleNext = () => {
        if (withdrawAmount.trim() !== '' && selectedAccount) {
            const amount = parseFloat(withdrawAmount.replace(/,/g, ''));
            const totalAmount = amount + withdrawalFee;
            
            // Check balance before showing summary
            if (balance < totalAmount) {
                Alert.alert(
                    'Insufficient Balance',
                    `You need N${totalAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })} but you have N${balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`
                );
                return;
            }
            
            setShowSummaryModal(true);
        }
    };

    const handleSummaryProceed = () => {
        setShowSummaryModal(false);
        setShowSecurityModal(true);
        setPin(''); // Reset PIN
    };

    const handleBiometric = async () => {
        // First validate that amount and account are selected
        if (withdrawAmount.trim() === '') {
            Alert.alert('Error', 'Please enter a withdrawal amount first');
            return;
        }

        if (!selectedAccount) {
            Alert.alert('Error', 'Please select a withdrawal account first');
            return;
        }

        const amount = parseFloat(withdrawAmount.replace(/,/g, ''));
        
        // Validate minimum amount
        if (amount < 100) {
            Alert.alert('Error', 'Minimum withdrawal amount is N100');
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
                promptMessage: 'Authenticate to proceed with withdrawal',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (result.success) {
                // Biometric authentication successful, proceed with withdrawal
                handleNext();
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

    const handleSecurityBiometric = async () => {
        // Validate that PIN is entered
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit PIN first');
            return;
        }

        if (!selectedAccount || !withdrawAmount) {
            Alert.alert('Error', 'Please select an account and enter amount');
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
                promptMessage: 'Authenticate to confirm withdrawal',
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
        
        if (!selectedAccount || !withdrawAmount) {
            Alert.alert('Error', 'Please select an account and enter amount');
            return;
        }
        
        const amount = parseFloat(withdrawAmount.replace(/,/g, ''));
        const totalAmount = amount + withdrawalFee;
        
        // Check balance again
        if (balance < totalAmount) {
            Alert.alert(
                'Insufficient Balance',
                `You need N${totalAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })} but you have N${balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`
            );
            setShowSecurityModal(false);
            setPin('');
            return;
        }
        
        try {
            const result = await withdrawMutation.mutateAsync({
                bank_account_id: selectedAccount.id,
                amount: amount,
                pin: pin,
            });
            
            if (result.success) {
                setShowSecurityModal(false);
                setShowSuccessModal(true);
                // Clear form
                setWithdrawAmount('');
                setSelectedQuickAmount(null);
                setPin(''); // Clear PIN for security
                // Refetch accounts and balance
                refetchAccounts();
                refetchBalance();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Withdrawal failed';
            
            // Handle specific errors
            if (errorMessage.includes('Invalid PIN') || errorMessage.includes('PIN')) {
                Alert.alert('Invalid PIN', 'The PIN you entered is incorrect. Please try again.');
                setPin(''); // Clear PIN on error
            } else if (errorMessage.includes('Insufficient balance')) {
                Alert.alert('Insufficient Balance', errorMessage);
                setShowSecurityModal(false);
                setPin('');
            } else {
                Alert.alert('Error', errorMessage);
                setShowSecurityModal(false);
                setPin('');
            }
        }
    };

    const handleSuccessTransaction = () => {
        setShowSuccessModal(false);
        const transactionData = withdrawMutation.data?.data;
        
        if (transactionData) {
            navigation.navigate('TransactionHistory', {
                type: 'withdrawal',
                transactionData: {
                    type: 'Fiat Withdrawal',
                    amount: `N${transactionData.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`,
                    fee: `N${transactionData.fee.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`,
                    totalAmount: `N${transactionData.total_amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`,
                    bankName: transactionData.bank_account.bank_name,
                    accountNumber: transactionData.bank_account.account_number,
                    accountName: transactionData.bank_account.account_name,
                    transactionId: transactionData.transaction.transaction_id,
                    reference: transactionData.transaction.reference,
                    date: new Date(transactionData.transaction.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    }) + ' - ' + new Date(transactionData.transaction.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    status: transactionData.transaction.status === 'completed' ? 'Successful' : transactionData.transaction.status,
                },
            });
        } else {
            navigation.goBack();
        }
    };

    const formatAmount = (amount: string) => {
        if (!amount) return '';
        const num = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(num)) return amount;
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formattedWithdrawAmount = formatAmount(withdrawAmount);
    const totalAmount = (parseFloat(withdrawAmount.replace(/,/g, '') || '0') + withdrawalFee).toLocaleString('en-US', {
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
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#42AC36"
                        colors={['#42AC36']}
                    />
                }
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
                        {isLoadingBalance ? (
                            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />
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
                <View style={styles.transferStrip}>
                    <Image
                        source={require('../../assets/emojione_flag-for-nigeria.png')}
                        style={styles.flagIcon}
                        resizeMode="contain"
                    />
                    <View style={styles.transferInfo}>
                        <ThemedText style={styles.transferTitle}>Instant Transfer</ThemedText>
                        <ThemedText style={styles.transferFee}>
                            Fee: N{withdrawalFee.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </ThemedText>
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
                            {selectedAccount ? `${selectedAccount.bank_name} - ${selectedAccount.account_number}` : 'Select Account'}
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
                            {accounts.length === 0 ? (
                                <View style={styles.emptyAccountContainer}>
                                    <ThemedText style={styles.emptyAccountText}>No bank accounts found</ThemedText>
                                    <TouchableOpacity
                                        style={styles.addAccountButton}
                                        onPress={() => {
                                            setShowAccountModal(false);
                                            navigation.navigate('WithdrawalAccounts');
                                        }}
                                    >
                                        <ThemedText style={styles.addAccountButtonText}>Add Account</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                accounts.map((account: any) => (
                                    <TouchableOpacity
                                        key={account.id}
                                        style={[
                                            styles.accountCard,
                                            selectedAccount?.id === account.id && styles.accountCardSelected,
                                        ]}
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
                                                <ThemedText style={styles.accountName}>
                                                    {account.bank_name}
                                                </ThemedText>
                                                {account.is_default && (
                                                    <View style={styles.defaultBadge}>
                                                        <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                                                    </View>
                                                )}
                                            </View>
                                            <TouchableOpacity
                                                style={styles.selectButton}
                                                onPress={() => handleAccountSelect(account)}
                                                activeOpacity={0.7}
                                            >
                                                <ThemedText style={styles.selectButtonText}>Select</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                        
                                        <ThemedText style={styles.accountHolderName}>
                                            {account.account_name}
                                        </ThemedText>
                                        
                                        <View style={styles.accountDetailsRow}>
                                            <ThemedText style={styles.bankName}>{account.bank_name}</ThemedText>
                                            <View style={styles.dot} />
                                            <ThemedText style={styles.accountNumber}>
                                                {account.account_number}
                                            </ThemedText>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
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
                                <ThemedText style={styles.summaryValue}>
                                    N{withdrawalFee.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{totalAmount}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Bank Name:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {selectedAccount?.bank_name || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account Number:</ThemedText>
                                <View style={styles.copyRow}>
                                    <ThemedText style={styles.summaryValue}>
                                        {selectedAccount?.account_number || 'N/A'}
                                    </ThemedText>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            Clipboard.setString(selectedAccount?.account_number || '');
                                            Alert.alert('Copied', 'Account number copied to clipboard');
                                        }}
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.summaryRow, styles.summaryRowLast]}>
                                <ThemedText style={styles.summaryLabel}>Account Name:</ThemedText>
                                <View style={styles.copyRow}>
                                    <ThemedText style={styles.summaryValue}>
                                        {selectedAccount?.account_name || 'N/A'}
                                    </ThemedText>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            Clipboard.setString(selectedAccount?.account_name || '');
                                            Alert.alert('Copied', 'Account name copied to clipboard');
                                        }}
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.summaryButtons}>
                            <TouchableOpacity
                                style={[styles.proceedSummaryButton, withdrawMutation.isPending && styles.proceedSummaryButtonDisabled]}
                                onPress={handleSummaryProceed}
                                activeOpacity={0.8}
                                disabled={withdrawMutation.isPending}
                            >
                                {withdrawMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
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
                onRequestClose={() => {
                    setShowSecurityModal(false);
                    setPin('');
                }}
            >
                <Pressable
                    style={styles.securityModalOverlay}
                    onPress={() => {
                        setShowSecurityModal(false);
                        setPin('');
                    }}
                >
                    <Pressable style={styles.securityModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.securityModalHeader}>
                            <ThemedText style={styles.securityModalTitle}>Security Confirmation</ThemedText>
                            <TouchableOpacity
                                style={styles.securityModalCloseButton}
                                onPress={() => {
                                    setShowSecurityModal(false);
                                    setPin('');
                                }}
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
                                            onPress={() => handlePinNumberPress(num.toString())}
                                            activeOpacity={0.7}
                                        >
                                            <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.backspaceButton}
                                        onPress={handlePinBackspace}
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
                                            onPress={() => handlePinNumberPress(num.toString())}
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
                                            onPress={() => handlePinNumberPress(num.toString())}
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
                                        onPress={() => handlePinNumberPress('0')}
                                        activeOpacity={0.7}
                                    >
                                        <ThemedText style={styles.numButtonText}>0</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.numButton}
                                        onPress={() => {}}
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
                                        (pin.length !== 4 || withdrawMutation.isPending) && styles.nextButtonDisabled,
                                    ]}
                                    onPress={handleSecurityNext}
                                    disabled={pin.length !== 4 || withdrawMutation.isPending}
                                    activeOpacity={0.8}
                                >
                                    {withdrawMutation.isPending ? (
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
                            {withdrawMutation.data?.message || `You have successfully completed a withdrawal of N${formattedWithdrawAmount}`}
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
        fontSize: 25,
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
        maxWidth: 280,
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
    numpadRight: {
        width: 85,
        marginLeft: 10,
        justifyContent: 'flex-start',
        alignItems: 'center',
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
    proceedSummaryButtonDisabled: {
        opacity: 0.6,
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
    emptyAccountContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyAccountText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    addAccountButton: {
        backgroundColor: '#42AC36',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    addAccountButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    accountCardSelected: {
        borderWidth: 2,
        borderColor: '#42AC36',
    },
    defaultBadge: {
        backgroundColor: '#00800026',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    defaultBadgeText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#008000',
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
});

export default WithdrawFundsScreen;

