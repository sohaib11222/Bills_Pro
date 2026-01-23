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
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { usePreviewSellCrypto, useConfirmSellCrypto } from '../../mutations/cryptoMutations';
import { useUsdtBlockchains } from '../../queries/cryptoQueries';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SellCryptoRouteProp = RouteProp<RootStackParamList, 'SellCrypto'>;

const SellCryptoScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<SellCryptoRouteProp>();
    const { cryptoType, balance, usdValue, icon, iconBackground, blockchain } = route.params || {
        cryptoType: 'BTC',
        balance: '0.00023',
        usdValue: '$20,000',
        icon: require('../../assets/popular1.png'),
        iconBackground: '#FFA5004D',
        blockchain: 'BTC',
    };

    const [amount, setAmount] = useState('');
    const [currencyType, setCurrencyType] = useState<'BTC' | 'USD'>('BTC'); // Note: Always enter amount in crypto, USD toggle is for reference only
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(blockchain || null);
    const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(blockchain || null);
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [confirmData, setConfirmData] = useState<any>(null);
    const [amountToReceive, setAmountToReceive] = useState('N0.00');

    // Fetch USDT blockchains if needed
    const { data: blockchainsData } = useUsdtBlockchains();
    
    // Mutations
    const previewMutation = usePreviewSellCrypto();
    const confirmMutation = useConfirmSellCrypto();

    // Get crypto amount (always in crypto for sell)
    const getCryptoAmount = (): number => {
        if (!amount) return 0;
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) return 0;
        // For sell, amount is always in crypto
        return amountNum;
    };

    // Get available networks based on crypto type
    const getAvailableNetworks = () => {
        if (cryptoType === 'USDT' && blockchainsData?.data) {
            return blockchainsData.data.map((bc: any) => ({
                id: bc.blockchain,
                name: `${bc.blockchain} (${bc.blockchain_name || bc.blockchain})`,
                creditingTime: bc.crediting_time || '1 min',
            }));
        }
        // For other cryptos, use default blockchain
        return [{
            id: cryptoType,
            name: `${cryptoType} (${cryptoType})`,
            creditingTime: '1 min',
        }];
    };

    const networks = getAvailableNetworks();

    // Set default network on mount
    useEffect(() => {
        if (!selectedNetwork && networks.length > 0) {
            const defaultNetwork = networks[0];
            setSelectedNetwork(defaultNetwork.name);
            setSelectedNetworkId(defaultNetwork.id);
        }
    }, [cryptoType, blockchainsData]);

    // For USDT, ensure blockchain is selected
    useEffect(() => {
        if (cryptoType === 'USDT' && !selectedNetworkId && blockchainsData?.data && blockchainsData.data.length > 0) {
            const defaultBlockchain = blockchainsData.data[0];
            setSelectedNetwork(`${defaultBlockchain.blockchain} (${defaultBlockchain.blockchain_name || defaultBlockchain.blockchain})`);
            setSelectedNetworkId(defaultBlockchain.blockchain);
        }
    }, [cryptoType, blockchainsData, selectedNetworkId]);

    // Handle Max button
    const handleMaxAmount = () => {
        const balanceNum = parseFloat(balance.replace(/,/g, ''));
        if (!isNaN(balanceNum)) {
            setAmount(balanceNum.toString());
        }
    };

    // Handle preview transaction
    const handleProceed = async () => {
        if (!selectedNetworkId || !amount) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const cryptoAmount = getCryptoAmount();
        if (cryptoAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        // Check if amount exceeds balance
        const balanceNum = parseFloat(balance.replace(/,/g, ''));
        if (cryptoAmount > balanceNum) {
            Alert.alert('Error', 'Amount exceeds available balance');
            return;
        }

        // If USD is selected, wait for exchange rate
        if (currencyType === 'USD' && !exchangeRateData?.data) {
            Alert.alert('Error', 'Please wait for exchange rate to load');
            return;
        }

        try {
            const result = await previewMutation.mutateAsync({
                currency: cryptoType,
                blockchain: selectedNetworkId,
                amount: cryptoAmount,
            });

            if (result.success) {
                setPreviewData(result.data);
                setAmountToReceive(`N${result.data.amount_to_receive.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                setShowSummaryModal(true);
            } else {
                Alert.alert('Error', result.message || 'Failed to preview transaction');
            }
        } catch (error: any) {
            console.error('Preview error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Failed to preview transaction'
            );
        }
    };

    // Handle confirm transaction
    const handleSummaryProceed = async () => {
        setShowSummaryModal(false);
        
        try {
            const cryptoAmount = getCryptoAmount();
            const confirmResult = await confirmMutation.mutateAsync({
                currency: cryptoType,
                blockchain: selectedNetworkId!,
                amount: cryptoAmount,
            });

            if (confirmResult.success) {
                setConfirmData(confirmResult.data);
                setShowSuccessModal(true);
            } else {
                Alert.alert('Error', confirmResult.message || 'Transaction failed');
            }
        } catch (error: any) {
            console.error('Confirm error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Transaction failed'
            );
        }
    };

    const handleSuccessTransaction = () => {
        setShowSuccessModal(false);
        if (confirmData?.transaction) {
            navigation.navigate('TransactionHistory', {
                type: 'crypto',
                transactionData: {
                    id: confirmData.transaction.id,
                    transaction_id: confirmData.transaction.transaction_id,
                    type: `Crypto Sell - ${cryptoType}`,
                    amount: confirmData.transaction.amount,
                    date: confirmData.transaction.created_at,
                    status: confirmData.transaction.status,
                    cryptoType: 'Sell',
                    network: selectedNetwork,
                    amountToReceive: amountToReceive,
                    paymentMethod: 'Naira',
                },
            });
        } else {
            navigation.goBack();
        }
    };

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
                    <ThemedText style={styles.headerTitle}>Sell {cryptoType}</ThemedText>
                    <View style={styles.placeholder} />
                </View>

                {/* Balance Card */}
                <ImageBackground
                    source={require('../../assets/green_background.png')}
                    style={styles.balanceCard}
                    imageStyle={styles.balanceCardImage}
                    resizeMode="cover"
                >
                    <ThemedText style={styles.balanceLabel}>{cryptoType} Balance</ThemedText>
                    <View style={styles.balanceRow}>
                        <ThemedText style={styles.balanceAmount}>{balance.replace('.', ',')}</ThemedText>
                        <ThemedText style={styles.balanceCurrency}>{cryptoType}</ThemedText>
                    </View>
                </ImageBackground>

                {/* Amount Input */}
                <View style={styles.amountContainer}>
                    <View style={styles.currencyToggle}>
                        <TouchableOpacity
                            style={[styles.toggleOption, currencyType === 'BTC' && styles.toggleOptionActive]}
                            onPress={() => setCurrencyType('BTC')}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={[styles.toggleText, currencyType === 'BTC' && styles.toggleTextActive]}>
                                BTC
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleOption, currencyType === 'USD' && styles.toggleOptionActive]}
                            onPress={() => setCurrencyType('USD')}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={[styles.toggleText, currencyType === 'USD' && styles.toggleTextActive]}>
                                USD
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0"
                    />
                    <TouchableOpacity 
                        style={styles.maxButton} 
                        activeOpacity={0.8}
                        onPress={handleMaxAmount}
                    >
                        <ThemedText style={styles.maxButtonText}>Max</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Select Network */}
                <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowNetworkModal(true)}
                    activeOpacity={0.8}
                >
                    <ThemedText style={[styles.input, !selectedNetwork && styles.inputPlaceholder]}>
                        {selectedNetwork || 'Select Network'}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* You Will Receive Card */}
                {previewData && (
                    <LinearGradient
                        colors={['#D9FDD6', '#21D721']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.receiveCard}
                    >
                        <ThemedText style={styles.receiveLabel}>You will receive</ThemedText>
                        <ThemedText style={styles.receiveAmount}>{amountToReceive}</ThemedText>
                        <View style={{backgroundColor: '#1B800F', padding: 5, borderBottomLeftRadius:20, borderBottomRightRadius:20}}>
                        <ThemedText style={styles.receiveSubtext}>Funds will be deposited into your naira wallet</ThemedText>
                        </View>
                    </LinearGradient>
                )}

                {/* Fee Information */}
                {previewData && (
                    <View style={styles.feeContainer}>
                        <Image
                            source={require('../../assets/CoinVertical (1).png')}
                            style={styles.feeIcon}
                            resizeMode="contain"
                        />
                        <ThemedText style={styles.feeText}>
                            Fee: {previewData.fee_in_crypto?.toFixed(8) || '0.00000000'} {cryptoType} = N{previewData.fee_in_ngn?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </ThemedText>
                    </View>
                )}

                {/* Proceed Button */}
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        (previewMutation.isPending || !amount || !selectedNetworkId) && styles.proceedButtonDisabled
                    ]}
                    onPress={handleProceed}
                    activeOpacity={0.8}
                    disabled={previewMutation.isPending || !amount || !selectedNetworkId}
                >
                    {previewMutation.isPending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Network Selection Modal */}
            <Modal
                visible={showNetworkModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowNetworkModal(false)}
            >
                <Pressable
                    style={styles.networkModalOverlay}
                    onPress={() => setShowNetworkModal(false)}
                >
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.networkModalHeader}>
                            <ThemedText style={styles.modalTitle}>Network</ThemedText>
                            <TouchableOpacity
                                style={styles.networkModalCloseButton}
                                onPress={() => setShowNetworkModal(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        {/* Warning Banner */}
                        <View style={styles.warningBanner}>
                            <Ionicons name="warning" size={20} color="#FF9500" />
                            <ThemedText style={styles.warningText}>Ensure you select the right network</ThemedText>
                        </View>

                        {/* Network Options */}
                        <View style={styles.networkList}>
                            {networks.map((network) => (
                                <TouchableOpacity
                                    key={network.id}
                                    style={styles.networkOption}
                                    onPress={() => {
                                        setSelectedNetwork(network.name);
                                        setSelectedNetworkId(network.id);
                                        setShowNetworkModal(false);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.networkInfo}>
                                        <ThemedText style={styles.networkName}>{network.name}</ThemedText>
                                        <ThemedText style={styles.networkTime}>
                                            Crediting time = {network.creditingTime}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))}
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
                                You are about to make a sale of{' '}
                                <ThemedText style={styles.pendingAmount}>{amount} {cryptoType}</ThemedText>
                            </ThemedText>
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {previewData?.crypto_amount || amount} {cryptoType}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Fee:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {previewData?.fee_in_crypto?.toFixed(8) || '0.00000000'} {cryptoType}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {previewData?.total_crypto_amount?.toFixed(8) || amount} {cryptoType}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Exchange Rate:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    1 {cryptoType} = N{previewData?.exchange_rate?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Amount to receive:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{amountToReceive}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Network:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedNetwork}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Payment Method:</ThemedText>
                                <ThemedText style={styles.summaryValue}>Naira Wallet</ThemedText>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.summaryButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.proceedSummaryButton,
                                    confirmMutation.isPending && styles.proceedSummaryButtonDisabled
                                ]}
                                onPress={handleSummaryProceed}
                                activeOpacity={0.8}
                                disabled={confirmMutation.isPending}
                            >
                                {confirmMutation.isPending ? (
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
                            You have successfully completed a sale of{' '}
                            <ThemedText style={styles.successAmount}>{amount} {cryptoType}</ThemedText>
                            {'\n'}You received {amountToReceive}
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
    balanceAmount: {
        fontSize: 25,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 8,
    },
    balanceCurrency: {
        fontSize: 20,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    amountContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        marginBottom: 16,
        position: 'relative',
    },
    currencyToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        padding: 2,
        marginBottom: 16,
        gap: 5,
    },
    toggleOption: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 18,
    },
    toggleOptionActive: {
        backgroundColor: '#42AC36',
    },
    toggleText: {
        fontSize: 10,
        fontWeight: '400',
        color: '#9CA3AF',
    },
    toggleTextActive: {
        color: '#FFFFFF',
    },
    amountInput: {
        fontSize: 40,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 12,
    },
    maxButton: {
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: '#CFCFCF',
        paddingVertical: 6,
    },
    maxButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
    },
    inputContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
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
    receiveCard: {
        borderRadius: 20,
        // paddingVertical: 24,
        paddingTop:24,
        marginBottom: 16,
    },
    receiveLabel: {
        fontSize: 10,
        fontWeight: '400',
        color: '#000000',
        // opacity: 0.9,
        marginBottom: 12,
        textAlign: 'center',
    },
    receiveAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8,
        textAlign: 'center',
    },
    receiveSubtext: {
        fontSize: 8,
        fontWeight: '400',
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    feeContainer: {
        backgroundColor: '#FFA50026',
        borderRadius: 15,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 0.3,
        borderColor: '#FFA500',
    },
    feeIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    feeText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    proceedButton: {
        backgroundColor: '#42AC36',
        borderRadius: 100,
        padding: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 20,
    },
    proceedButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    proceedButtonDisabled: {
        opacity: 0.6,
    },
    proceedSummaryButtonDisabled: {
        opacity: 0.6,
    },
    networkModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
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
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        maxHeight: '80%',
    },
    summaryModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '90%',
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
    networkModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    networkModalCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
    },
    warningBanner: {
        backgroundColor: '#FFA50026',
        borderRadius: 12,
        borderWidth: 0.3,
        borderColor: '#FFA500',
        padding: 12,
        paddingVertical: 17,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    warningText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFA500',
        marginLeft: 8,
    },
    networkList: {
        gap: 12,
    },
    networkOption: {
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
    },
    networkInfo: {
        gap: 4,
    },
    networkName: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 5,
    },
    networkTime: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
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
    twoFAIconContainer: {
        marginBottom: 20,
    },
    twoFAIconOuter: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
    },
    twoFAIconMiddle: {
        width: 84,
        height: 84,
        borderRadius: 50,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    twoFAIconInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
    },
    twoFATitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FF9500',
        marginBottom: 12,
    },
    twoFAMessage: {
        fontSize: 14,
        color: '#111827',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    twoFAButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    setup2FAButton: {
        flex: 1,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setup2FAButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    close2FAButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    close2FAButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
    },
    authenticatorCodeContainer: {
        backgroundColor: '#1B800F',
        borderRadius: 15,
        padding: 16,
        width: '100%',
        marginBottom: 16,
    },
    authenticatorCodeLabel: {
        fontSize: 8,
        fontWeight: '400',
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 8,
        textAlign: 'center',
    },
    authenticatorCodeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    authenticatorCode: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    twoFAInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: '100%',
        marginBottom: 24,
    },
    twoFAInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    pasteButton: {
        backgroundColor: 'transparent',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#1B800F',
        paddingHorizontal: 12,
        paddingVertical: 11,
    },
    pasteButtonText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#1B800F',
    },
    completeButton: {
        flex: 1,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
    },
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
        paddingHorizontal: 24,
        maxHeight: '90%',
    },
    securityModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    securityModalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
    },
    securityModalCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    verificationContainer: {
        alignItems: 'center',
        marginBottom: 24,
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
    securityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        gap: 12,
    },
    securityInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    getCodeButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#1B800F',
        paddingHorizontal: 12,
        paddingVertical: 11,
    },
    getCodeButtonText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#1B800F',
    },
    pasteSecurityButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#1B800F',
        paddingHorizontal: 12,
        paddingVertical: 11,
    },
    pasteSecurityButtonText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#1B800F',
    },
    securityButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    proceedSecurityButton: {
        flex: 1,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    proceedSecurityButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    cancelSecurityButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelSecurityButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
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

export default SellCryptoScreen;

