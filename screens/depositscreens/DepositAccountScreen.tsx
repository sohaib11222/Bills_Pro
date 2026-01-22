import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    Pressable,
    Platform,
    StatusBar as RNStatusBar,
    ActivityIndicator,
    Alert,
    Clipboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useDepositBankAccount } from '../../queries/depositQueries';
import { useConfirmDeposit } from '../../mutations/depositMutations';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DepositAccountRouteProp = RouteProp<RootStackParamList, 'DepositAccount'>;

const DepositAccountScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<DepositAccountRouteProp>();
    const { amount, depositData } = route.params || { amount: '0' };

    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [depositReference, setDepositReference] = useState<string | null>(null);

    // Fetch bank account if not provided in depositData
    const { data: bankAccountData, isLoading: isLoadingBankAccount } = useDepositBankAccount('NGN', 'NG');
    const confirmDepositMutation = useConfirmDeposit();

    // Use depositData from navigation or fetch from API
    const bankAccount = depositData?.bank_account || bankAccountData?.data;
    const depositInfo = depositData?.deposit || null;
    const reference = depositData?.reference || depositInfo?.deposit_reference || depositReference;

    useEffect(() => {
        if (depositData?.reference) {
            setDepositReference(depositData.reference);
        } else if (depositInfo?.deposit_reference) {
            setDepositReference(depositInfo.deposit_reference);
        }
    }, [depositData, depositInfo]);

    const formattedAmount = parseFloat(amount || '0').toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const depositFee = depositInfo?.fee || depositData?.fee || 200;
    const totalAmount = depositInfo?.total_amount || depositData?.total_amount || (parseFloat(amount || '0') + depositFee);

    const bankDetails = {
        bankName: bankAccount?.bank_name || 'N/A',
        accountNumber: bankAccount?.account_number || 'N/A',
        accountName: bankAccount?.account_name || 'N/A',
        reference: reference || 'N/A',
    };

    const handleCopy = (text: string) => {
        Clipboard.setString(text);
        Alert.alert('Copied', 'Copied to clipboard');
    };

    const handlePaymentMade = () => {
        setShowSummaryModal(true);
    };

    const handleSummaryProceed = async () => {
        if (!reference) {
            Alert.alert('Error', 'Deposit reference is missing');
            return;
        }

        try {
            const result = await confirmDepositMutation.mutateAsync({
                reference: reference,
            });

            if (result.success && result.data) {
                setShowSummaryModal(false);
                setShowSuccessModal(true);
            } else {
                Alert.alert('Error', result.message || 'Deposit confirmation failed');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Deposit confirmation failed';
            Alert.alert('Error', errorMessage);
        }
    };

    const handleSuccessTransaction = () => {
        setShowSuccessModal(false);
        const transactionData = confirmDepositMutation.data?.data;
        
        if (transactionData) {
            navigation.navigate('TransactionHistory', {
                type: 'deposit',
                transactionData: {
                    type: 'Fiat Deposit',
                    amount: `N${transactionData.deposit?.amount?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }) || formattedAmount}`,
                    fee: `N${transactionData.deposit?.fee?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }) || depositFee.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`,
                    totalAmount: `N${transactionData.deposit?.total_amount?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }) || totalAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`,
                    bankName: bankDetails.bankName,
                    accountNumber: bankDetails.accountNumber,
                    accountName: bankDetails.accountName,
                    reference: reference || bankDetails.reference,
                    transactionId: transactionData.transaction?.transaction_id || 'N/A',
                    date: new Date(transactionData.transaction?.created_at || transactionData.deposit?.completed_at || new Date()).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    }) + ' - ' + new Date(transactionData.transaction?.created_at || transactionData.deposit?.completed_at || new Date()).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    status: transactionData.deposit?.status === 'completed' ? 'Successful' : transactionData.deposit?.status || 'Successful',
                },
            });
        } else {
            navigation.goBack();
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
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Deposit Account</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isLoadingBankAccount && !bankAccount ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#42AC36" />
                        <ThemedText style={styles.loadingText}>Loading bank account details...</ThemedText>
                    </View>
                ) : !bankAccount ? (
                    <View style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>No bank account found for deposits</ThemedText>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarOuter}>
                                <View style={styles.avatarMiddle}>
                                    <View style={styles.avatarInner}>
                                        <Image
                                            source={require('../../assets/dummy_avatar.png')}
                                            style={styles.avatar}
                                            resizeMode="cover"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Amount to Deposit Card */}
                        <View style={styles.amountCard}>
                            <ThemedText style={styles.amountLabel}>Amount to deposit</ThemedText>
                            <ThemedText style={styles.amountValue}>N{formattedAmount}</ThemedText>
                        </View>

                        {/* Warning Box */}
                        <View style={styles.warningBox}>
                            <ThemedText style={styles.warningText}>
                                Ensure you deposit to this exact bank account to avoid loss of funds
                            </ThemedText>
                        </View>

                        {/* Bank Details */}
                        <View style={styles.bankDetailsContainer}>
                            <View style={styles.bankDetailRow}>
                                <ThemedText style={styles.bankDetailLabel}>Bank Name</ThemedText>
                                <View style={styles.bankDetailValueRow}>
                                    <ThemedText style={styles.bankDetailValue}>{bankDetails.bankName}</ThemedText>
                                    <TouchableOpacity
                                        style={styles.copyButton}
                                        onPress={() => handleCopy(bankDetails.bankName)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.bankDetailRow}>
                                <ThemedText style={styles.bankDetailLabel}>Account Number</ThemedText>
                                <View style={styles.bankDetailValueRow}>
                                    <ThemedText style={styles.bankDetailValue}>{bankDetails.accountNumber}</ThemedText>
                                    <TouchableOpacity
                                        style={styles.copyButton}
                                        onPress={() => handleCopy(bankDetails.accountNumber)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.bankDetailRow}>
                                <ThemedText style={styles.bankDetailLabel}>Account Name</ThemedText>
                                <View style={styles.bankDetailValueRow}>
                                    <ThemedText style={styles.bankDetailValue}>{bankDetails.accountName}</ThemedText>
                                    <TouchableOpacity
                                        style={styles.copyButton}
                                        onPress={() => handleCopy(bankDetails.accountName)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.bankDetailRow}>
                                <ThemedText style={styles.bankDetailLabel}>Reference</ThemedText>
                                <View style={styles.bankDetailValueRow}>
                                    <ThemedText style={styles.bankDetailValue}>{bankDetails.reference}</ThemedText>
                                    <TouchableOpacity
                                        style={styles.copyButton}
                                        onPress={() => handleCopy(bankDetails.reference)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Fee Information */}
                        <View style={styles.feeBox}>
                            <Ionicons name="information-circle-outline" size={20} color="#FFA500" />
                            <ThemedText style={styles.feeText}>
                                Fee : N{depositFee.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </ThemedText>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* I have made payment Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.paymentButton,
                        (!bankAccount || confirmDepositMutation.isPending) && styles.paymentButtonDisabled,
                    ]}
                    onPress={handlePaymentMade}
                    disabled={!bankAccount || confirmDepositMutation.isPending}
                    activeOpacity={0.8}
                >
                    {confirmDepositMutation.isPending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <ThemedText style={styles.paymentButtonText}>I have made payment</ThemedText>
                    )}
                </TouchableOpacity>
            </View>

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
                                You are about to make a deposit of{' '}
                                <ThemedText style={styles.pendingAmount}>N{formattedAmount}</ThemedText>
                            </ThemedText>
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>N{formattedAmount}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Fee:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    N{depositFee.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    N{totalAmount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Bank Name:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{bankDetails.bankName}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account Number:</ThemedText>
                                <View style={styles.addressRow}>
                                    <ThemedText style={styles.summaryValue}>{bankDetails.accountNumber}</ThemedText>
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Account Name:</ThemedText>
                                <View style={styles.addressRow}>
                                    <ThemedText style={styles.summaryValue}>{bankDetails.accountName}</ThemedText>
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Reference:</ThemedText>
                                <View style={styles.addressRow}>
                                    <ThemedText style={styles.summaryValue}>{bankDetails.reference}</ThemedText>
                                    <TouchableOpacity activeOpacity={0.8}>
                                        <Ionicons name="copy-outline" size={16} color="#1B800F" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.summaryButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.proceedSummaryButton,
                                    confirmDepositMutation.isPending && styles.proceedSummaryButtonDisabled,
                                ]}
                                onPress={handleSummaryProceed}
                                disabled={confirmDepositMutation.isPending}
                                activeOpacity={0.8}
                            >
                                {confirmDepositMutation.isPending ? (
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
                            {confirmDepositMutation.data?.message || `You have successfully completed a deposit of N${formattedAmount}`}
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
                                onPress={() => {
                                    setShowSuccessModal(false);
                                    navigation.navigate('Main');
                                }}
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
        // paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 44 : 44,
        paddingTop:40,
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
        paddingBottom: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    avatarOuter: {
        width: 122,
        height: 122,
        borderRadius: 60,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1B800F',
    },
    avatarMiddle: {
        width: 83,
        height: 83,
        borderRadius: 50,
        backgroundColor: '#1B800F',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    avatarInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1B800F',
        overflow: 'hidden',
    },
    avatar: {
        width: 80,
        height: 80,
    },
    amountCard: {
        backgroundColor: '#1B800F',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 24,
    },
    amountLabel: {
        fontSize: 10,
        fontWeight: '400',
        color: '#FFFFFF80',
        marginBottom: 15,
        textAlign: 'center',
    
    },
    amountValue: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    warningBox: {
        backgroundColor: '#FFA50026',
        padding: 16,
        // marginBottom: 24,
        textAlign: 'center',
    },
    warningText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        lineHeight: 20,
        textAlign: 'center',
    },
    bankDetailsContainer: {
        backgroundColor: '#EFEFEF',
        // borderRadius: 12,
        borderBottomLeftRadius:20,
        borderBottomRightRadius:20,
        padding: 16,
        marginBottom: 16,
    },
    bankDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    bankDetailLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280',
    },
    bankDetailValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bankDetailValue: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    copyButton: {
        padding: 4,
    },
    feeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFA50026',
        borderRadius: 15,
        padding: 16,
        marginBottom: 24,
    },
    feeText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginLeft: 8,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
    },
    paymentButton: {
        width: '100%',
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    // Modal Styles
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
    addressRow: {
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
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: '#D6F5D9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIconMiddle: {
        width: 80,
        height: 80,
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
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeSuccessButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#42AC36',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    paymentButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    proceedSummaryButtonDisabled: {
        opacity: 0.6,
    },
});

export default DepositAccountScreen;

