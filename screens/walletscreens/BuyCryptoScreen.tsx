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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { usePreviewBuyCrypto, useConfirmBuyCrypto } from '../../mutations/cryptoMutations';
import { useUsdtBlockchains } from '../../queries/cryptoQueries';
import { useFiatWallets, useCryptoWallets } from '../../queries/walletQueries';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BuyCryptoRouteProp = RouteProp<RootStackParamList, 'BuyCrypto'>;

const BuyCryptoScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<BuyCryptoRouteProp>();
    const { cryptoType, balance, usdValue, icon, iconBackground, blockchain } = route.params || {
        cryptoType: 'BTC',
        balance: '0.00023',
        usdValue: '$20,000',
        icon: require('../../assets/popular1.png'),
        iconBackground: '#FFA5004D',
        blockchain: 'BTC',
    };

    const [amount, setAmount] = useState('');
    const [currencyType, setCurrencyType] = useState<'NGN' | 'USD'>('NGN');
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(blockchain || null);
    const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(blockchain || null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'naira' | 'crypto_wallet'>('naira');
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [confirmData, setConfirmData] = useState<any>(null);

    // Fetch USDT blockchains if needed
    const { data: blockchainsData } = useUsdtBlockchains();
    
    // Fetch wallet balances
    const { data: fiatWalletsData } = useFiatWallets();
    const { data: cryptoWalletsData } = useCryptoWallets();

    // Mutations
    const previewMutation = usePreviewBuyCrypto();
    const confirmMutation = useConfirmBuyCrypto();

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

    // Get wallet balances
    const nairaBalance = fiatWalletsData?.data?.find((w: any) => w.currency === 'NGN' && w.country_code === 'NG')?.balance || 0;
    const cryptoBalance = cryptoWalletsData?.data?.total_usd_value || 0;

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
        if (selectedPaymentMethod === 'naira') {
            setAmount(nairaBalance.toString());
        } else {
            // For crypto wallet, use USD balance
            setAmount(cryptoBalance.toString());
        }
    };

    // Get payment amount (always in NGN for naira, USD for crypto_wallet)
    const getPaymentAmount = (): number => {
        if (!amount) return 0;
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) return 0;
        return amountNum;
    };

    // Handle preview transaction
    const handleProceed = async () => {
        if (!selectedNetworkId || !amount) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const paymentAmount = getPaymentAmount();
        if (paymentAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        // Check if amount exceeds balance
        if (selectedPaymentMethod === 'naira' && paymentAmount > nairaBalance) {
            Alert.alert('Error', 'Amount exceeds available Naira balance');
            return;
        }
        if (selectedPaymentMethod === 'crypto_wallet' && paymentAmount > cryptoBalance) {
            Alert.alert('Error', 'Amount exceeds available Crypto balance');
            return;
        }

        try {
            const result = await previewMutation.mutateAsync({
                currency: cryptoType,
                blockchain: selectedNetworkId,
                amount: paymentAmount,
                payment_method: selectedPaymentMethod,
            });

            if (result.success) {
                setPreviewData(result.data);
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
            const paymentAmount = getPaymentAmount();
            const confirmResult = await confirmMutation.mutateAsync({
                currency: cryptoType,
                blockchain: selectedNetworkId!,
                amount: paymentAmount,
                payment_method: selectedPaymentMethod,
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
                    type: `Crypto Buy - ${cryptoType}`,
                    amount: confirmData.transaction.amount,
                    date: confirmData.transaction.created_at,
                    status: confirmData.transaction.status,
                    cryptoType: 'Buy',
                    network: selectedNetwork,
                    paymentMethod: selectedPaymentMethod === 'naira' ? 'Naira Wallet' : 'Crypto Wallet',
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
                    <ThemedText style={styles.headerTitle}>Buy {cryptoType}</ThemedText>
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
                            style={[styles.toggleOption, currencyType === 'NGN' && styles.toggleOptionActive]}
                            onPress={() => setCurrencyType('NGN')}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={[styles.toggleText, currencyType === 'NGN' && styles.toggleTextActive]}>
                                {selectedPaymentMethod === 'naira' ? 'NGN' : 'USD'}
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

                {/* Payment Method */}
                <View style={styles.walletFieldContainer}>
                    <ThemedText style={styles.walletFieldLabel}>Payment Method</ThemedText>
                    <TouchableOpacity
                        style={styles.walletFieldSelector}
                        onPress={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
                    >
                        <Image
                            source={require('../../assets/emojione_flag-for-nigeria.png')}
                            style={styles.walletFieldFlag}
                            resizeMode="contain"
                        />
                        <ThemedText style={styles.walletFieldText}>
                            {selectedPaymentMethod === 'naira' ? 'Naira' : 'Crypto'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Payment Method Dropdown List */}
                {showPaymentMethodDropdown && (
                    <View style={styles.walletDropdownList}>
                        <TouchableOpacity
                            style={styles.walletDropdownItem}
                            activeOpacity={0.8}
                            onPress={() => {
                                setSelectedPaymentMethod('naira');
                                setShowPaymentMethodDropdown(false);
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
                                    Bal : N{parseFloat(nairaBalance.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </ThemedText>
                            </View>
                            <View
                                style={[
                                    styles.walletRadioOuter,
                                    selectedPaymentMethod === 'naira' && styles.walletRadioActive,
                                ]}
                            >
                                {selectedPaymentMethod === 'naira' && <View style={styles.walletRadioInner} />}
                            </View>
                        </TouchableOpacity>
                        <View style={styles.walletDivider} />
                        <TouchableOpacity
                            style={styles.walletDropdownItem}
                            activeOpacity={0.8}
                            onPress={() => {
                                setSelectedPaymentMethod('crypto');
                                setShowPaymentMethodDropdown(false);
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
                                <ThemedText style={styles.walletSubtitle}>Bal : $20,000</ThemedText>
                            </View>
                            <View
                                style={[
                                    styles.walletRadioOuter,
                                    selectedPaymentMethod === 'crypto' && styles.walletRadioActive,
                                ]}
                            >
                                {selectedPaymentMethod === 'crypto' && <View style={styles.walletRadioInner} />}
                            </View>
                        </TouchableOpacity>
                    </View>
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
                            Fee: {previewData.fee_in_crypto?.toFixed(8) || '0.00000000'} {cryptoType} = {selectedPaymentMethod === 'naira' ? 'N' : '$'}{previewData.fee_in_payment_currency?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </ThemedText>
                    </View>
                )}

                {/* Proceed Button */}
                <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handleProceed}
                    activeOpacity={0.8}
                >
                    <ThemedText style={styles.proceedButtonText}>Proceed</ThemedText>
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
                                You are about to make a purchase of{' '}
                                <ThemedText style={styles.pendingAmount}>
                                    {previewData?.crypto_amount?.toFixed(8) || amount} {cryptoType}
                                </ThemedText>
                            </ThemedText>
                        </View>

                        {/* Transaction Details */}
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Payment Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {selectedPaymentMethod === 'naira' ? 'N' : '$'}{previewData?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || amount}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Crypto Amount:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {previewData?.crypto_amount?.toFixed(8) || '0.00000000'} {cryptoType}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Fee:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {previewData?.fee_in_crypto?.toFixed(8) || '0.00000000'} {cryptoType}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Crypto:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {previewData?.total_crypto_amount?.toFixed(8) || '0.00000000'} {cryptoType}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Total Payment:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {selectedPaymentMethod === 'naira' ? 'N' : '$'}{previewData?.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || amount}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Exchange Rate:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    1 {cryptoType} = {selectedPaymentMethod === 'naira' ? 'N' : '$'}{previewData?.exchange_rate?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Network:</ThemedText>
                                <ThemedText style={styles.summaryValue}>{selectedNetwork}</ThemedText>
                            </View>
                            <View style={styles.summaryRow}>
                                <ThemedText style={styles.summaryLabel}>Payment Method:</ThemedText>
                                <ThemedText style={styles.summaryValue}>
                                    {selectedPaymentMethod === 'naira' ? 'Naira Wallet' : 'Crypto Wallet'}
                                </ThemedText>
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
                            You have successfully completed a purchase of{' '}
                            <ThemedText style={styles.successAmount}>
                                {previewData?.crypto_amount?.toFixed(8) || amount} {cryptoType}
                            </ThemedText>
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
    walletFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
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
    walletDropdownList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: -12,
        marginBottom: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 1000,
        position: 'relative',
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

export default BuyCryptoScreen;

