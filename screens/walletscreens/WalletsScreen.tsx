import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useFiatWallets } from '../../queries/walletQueries';
import { useCryptoWallets } from '../../queries/walletQueries';
import { useFiatTransactions } from '../../queries/transactionQueries';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WalletsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedTab, setSelectedTab] = useState<'Naira' | 'Crypto'>('Naira');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch wallets
    const { 
        data: fiatWalletsData, 
        isLoading: isLoadingFiat,
        refetch: refetchFiat 
    } = useFiatWallets();
    
    const { 
        data: cryptoWalletsData, 
        isLoading: isLoadingCrypto,
        refetch: refetchCrypto 
    } = useCryptoWallets();
    
    // Fetch recent transactions (for Naira tab)
    const { 
        data: transactionsData,
        refetch: refetchTransactions 
    } = useFiatTransactions({ limit: 5 });

    // Extract data
    const fiatWallets = fiatWalletsData?.data || [];
    const cryptoWallets = cryptoWalletsData?.data || [];
    const recentTransactions = transactionsData?.data || [];

    // Calculate totals
    const nairaBalance = fiatWallets.reduce((sum: number, wallet: any) => 
        sum + parseFloat(wallet.balance || 0), 0
    );
    
    const cryptoBalance = cryptoWallets.reduce((sum: number, wallet: any) => {
        const balance = parseFloat(wallet.available_balance || 0);
        const rate = parseFloat(wallet.wallet_currency?.rate || 0);
        return sum + (balance * rate);
    }, 0);

    // Format balance
    const formatBalance = (amount: number, currency: 'NGN' | 'USD') => {
        const formatter = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return formatter.format(amount);
    };

    // Helper function to get crypto icon
    const getCryptoIcon = (currency: string) => {
        const icons: Record<string, any> = {
            'BTC': require('../../assets/popular1.png'),
            'ETH': require('../../assets/popular2.png'),
            'USDT': require('../../assets/popular3.png'),
            'USDC': require('../../assets/popular4.png'),
        };
        return icons[currency] || require('../../assets/popular1.png');
    };

    // Helper function to get crypto color
    const getCryptoColor = (currency: string) => {
        const colors: Record<string, string> = {
            'BTC': '#FFA5004D',
            'ETH': '#0000FF4D',
            'USDT': '#0080004D',
            'USDC': '#0000FF4D',
        };
        return colors[currency] || '#42AC36';
    };

    // Handle pull to refresh
    const onRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (selectedTab === 'Naira') {
                await Promise.all([refetchFiat(), refetchTransactions()]);
            } else {
                await refetchCrypto();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Loading state
    if ((selectedTab === 'Naira' && isLoadingFiat) || (selectedTab === 'Crypto' && isLoadingCrypto)) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <StatusBar style="dark" />
                <ActivityIndicator size="large" color="#1B800F" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Top Section with Background */}
            <ImageBackground
                source={selectedTab === 'Crypto'
                    ? require('../../assets/crypto_background.png')
                    : require('../../assets/naira_background.png')}
                style={styles.topBackground}
                resizeMode="cover"
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>Wallets</ThemedText>
                </View>

                {/* Tab Toggle */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Naira' && styles.tabActive]}
                        onPress={() => setSelectedTab('Naira')}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={[styles.tabText, selectedTab === 'Naira' && styles.tabTextActive]}>
                            Naira
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'Crypto' && [styles.tabActive, {backgroundColor: '#381F15'}]]}
                        onPress={() => setSelectedTab('Crypto')}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={[styles.tabText, selectedTab === 'Crypto' && styles.tabTextActive]}>
                            Crypto
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Title Section */}
                <View style={styles.titleSection}>
                    <ThemedText style={styles.mainTitle}>
                        {selectedTab === 'Crypto' ? 'Crypto Wallet' : 'Naira Wallet'}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {selectedTab === 'Crypto' ? 'View you crypto wallet' : 'View your naira wallet'}
                    </ThemedText>
                </View>

                {/* Wallet Balance Card */}
                <View style={styles.walletCardContainer}>
                    <Image
                        source={selectedTab === 'Crypto'
                            ? require('../../assets/Rectangle 39 (1).png')
                            : require('../../assets/Rectangle 39.png')}
                        style={styles.brownImage}
                        resizeMode="contain"
                    />
                    <ImageBackground
                        source={selectedTab === 'Crypto'
                            ? require('../../assets/wallet_background_Crypto.png')
                            : require('../../assets/wallet_background.png')}
                        style={styles.walletCard}
                        resizeMode="stretch"
                    >
                        <ThemedText style={styles.walletBalanceLabel}>
                            {selectedTab === 'Crypto' ? 'Crypto Balance' : 'Wallet Balance'}
                        </ThemedText>
                        <ThemedText style={styles.walletBalanceAmount}>
                            {selectedTab === 'Crypto' 
                                ? formatBalance(cryptoBalance, 'USD')
                                : formatBalance(nairaBalance, 'NGN')}
                        </ThemedText>
                    </ImageBackground>
                </View>
            </ImageBackground>
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollViewContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#1B800F"
                        colors={['#1B800F']}
                        progressViewOffset={20}
                        size="large"
                    />
                }
            >
                {/* Action Buttons */}
                {selectedTab === 'Crypto' ? (
                    <View style={styles.cryptoActionButtonsContainer}>
                        <TouchableOpacity 
                            style={[[styles.actionButton, styles.depositButton, { flexDirection: 'column' }]]} 
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('SelectCrypto', { mode: 'receive' })}
                        >
                            <View style={[styles.actionButtonIcon, styles.depositIcon]}>
                                <Image
                                    source={require('../../assets/sent (1).png')}
                                    style={[styles.actionButtonIconImage, { tintColor: '#000' }]}
                                    resizeMode="contain"
                                />
                            </View>
                            <ThemedText style={styles.actionButtonText}>Recieve</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[[styles.actionButton, styles.withdrawButton, { flexDirection: 'column' }]]} 
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('SelectCrypto', { mode: 'send' })}
                        >
                            <View style={[styles.actionButtonIcon, styles.withdrawIcon]}>
                                <Image
                                    source={require('../../assets/sent (2).png')}
                                    style={[styles.actionButtonIconImage, { tintColor: '#000' }]}
                                    resizeMode="contain"
                                />
                            </View>
                            <ThemedText style={styles.actionButtonText}>Send</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[[styles.actionButton, styles.sellButton, { flexDirection: 'column' }]]} 
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('SelectCrypto', { mode: 'sell' })}
                        >
                            <View style={[styles.actionButtonIcon, styles.sellIcon]}>
                                <Image
                                    source={require('../../assets/sell (1).png')}
                                    style={[styles.actionButtonIconImage, { tintColor: '#000' }]}
                                    resizeMode="contain"
                                />
                            </View>
                            <ThemedText style={styles.actionButtonText}>Sell</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[[styles.actionButton, styles.buyButton, { flexDirection: 'column' }]]} 
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('SelectCrypto', { mode: 'buy' })}
                        >
                            <View style={[styles.actionButtonIcon, styles.buyIcon]}>
                                <Image
                                    source={require('../../assets/sell (2).png')}
                                    style={[styles.actionButtonIconImage, { tintColor: '#000' }]}
                                    resizeMode="contain"
                                />
                            </View>
                            <ThemedText style={styles.actionButtonText}>Buy</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.depositButton]} 
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('DepositFunds')}
                        >
                            <View style={[styles.actionButtonIcon, styles.depositIcon]}>
                                <Image
                                    source={require('../../assets/sent (1).png')}
                                    style={styles.actionButtonIconImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <ThemedText style={[styles.actionButtonText, { color: '#1B800F' }]}>Deposit</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionButton, styles.withdrawButton]} 
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('WithdrawFunds')}
                        >
                            <View style={[styles.actionButtonIcon, styles.withdrawIcon]}>
                                <Image
                                    source={require('../../assets/sent (2).png')}
                                    style={[styles.actionButtonIconImage, { tintColor: '#000' }]}
                                    resizeMode="contain"
                                />
                            </View>
                            <ThemedText style={styles.actionButtonText}>Withdraw</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.billPaymentButton]}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('BillPayments')}
                        >
                            <View style={[styles.actionButtonIcon, styles.billPaymentIcon]}>
                                <Image
                                    source={require('../../assets/invoice-01.png')}
                                    style={styles.actionButtonIconImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <ThemedText style={styles.actionButtonText}>Bill Payment</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedTab === 'Crypto' ? (
                    <>
                        {/* Crypto Assets Section */}
                        <View style={styles.cryptoAssetsHeader}>
                            <ThemedText style={styles.cryptoAssetsTitle}>Crypto</ThemedText>
                            <TouchableOpacity activeOpacity={0.8}>
                                <Ionicons name="search" size={20} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        {/* Crypto Assets Grid */}
                        <View style={styles.cryptoAssetsGrid}>
                            {cryptoWallets.length > 0 ? (
                                cryptoWallets
                                    .filter((wallet: any) => parseFloat(wallet.available_balance || 0) > 0)
                                    .map((wallet: any) => {
                                        const balance = parseFloat(wallet.available_balance || 0);
                                        const rate = parseFloat(wallet.wallet_currency?.rate || 0);
                                        const usdValue = balance * rate;

                                        return (
                                            <TouchableOpacity
                                                key={wallet.id}
                                                style={styles.cryptoAssetCard}
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                    navigation.navigate('CryptoWallet', {
                                                        currency: wallet.currency,
                                                        blockchain: wallet.blockchain,
                                                        balance: balance.toString(),
                                                        usdValue: `$${usdValue.toFixed(2)}`,
                                                        icon: getCryptoIcon(wallet.currency),
                                                        iconBackground: getCryptoColor(wallet.currency),
                                                    });
                                                }}
                                            >
                                                <View style={[styles.cryptoAssetIcon, { backgroundColor: getCryptoColor(wallet.currency) }]}>
                                                    <Image
                                                        source={getCryptoIcon(wallet.currency)}
                                                        style={styles.cryptoAssetIconImage}
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={styles.cryptoAssetContent}>
                                                        <ThemedText style={styles.cryptoAssetSymbol}>
                                                            {wallet.currency}
                                                        </ThemedText>
                                                        <ThemedText style={styles.cryptoAssetName}>
                                                            {wallet.wallet_currency?.symbol || wallet.currency}
                                                        </ThemedText>
                                                    </View>
                                                    <View style={styles.cryptoAssetRight}>
                                                        <ThemedText style={styles.cryptoAssetAmount}>
                                                            {balance.toFixed(4)}
                                                        </ThemedText>
                                                        <ThemedText style={styles.cryptoAssetValue}>
                                                            ${usdValue.toFixed(2)}
                                                        </ThemedText>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <ThemedText style={styles.emptyText}>No crypto wallets found</ThemedText>
                                </View>
                            )}
                        </View>
                    </>
                ) : (
                    <>
                        {/* Recent Transactions Section */}
                        <View style={styles.recentTransactionsHeader}>
                            <ThemedText style={styles.recentTransactionsTitle}>Recent Transactions</ThemedText>
                            <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')} activeOpacity={0.8}>
                                <ThemedText style={styles.viewAllText}>View All</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Transaction List */}
                        <View style={styles.transactionList}>
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction: any) => {
                                    const isDeposit = transaction.type === 'deposit' || transaction.category === 'fiat_deposit';
                                    const transactionDate = transaction.created_at 
                                        ? new Date(transaction.created_at).toLocaleDateString('en-NG', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : '';

                                    // Determine transaction type
                                    const getTransactionType = (transaction: any): 'deposit' | 'withdrawal' | 'bill_payment' | 'crypto' => {
                                        if (transaction.type === 'deposit' || transaction.category === 'fiat_deposit') {
                                            return 'deposit';
                                        }
                                        if (transaction.type === 'withdrawal' || transaction.category === 'fiat_withdrawal') {
                                            return 'withdrawal';
                                        }
                                        if (transaction.category === 'bill_payment' || transaction.type === 'bill_payment') {
                                            return 'bill_payment';
                                        }
                                        if (transaction.wallet_type === 'crypto' || transaction.category?.includes('crypto')) {
                                            return 'crypto';
                                        }
                                        return 'deposit'; // default
                                    };

                                    return (
                                        <TouchableOpacity
                                            key={transaction.id}
                                            style={styles.transactionItem}
                                            onPress={() => {
                                                const transactionType = getTransactionType(transaction);
                                                navigation.navigate('TransactionHistory', {
                                                    type: transactionType,
                                                    transactionData: {
                                                        ...transaction,
                                                        transaction_id: transaction.transaction_id || transaction.id,
                                                        id: transaction.id,
                                                        wallet_type: transaction.wallet_type || 'fiat',
                                                        // Ensure all required fields are present
                                                        category: transaction.category,
                                                        status: transaction.status,
                                                        amount: transaction.amount,
                                                        currency: transaction.currency || 'NGN',
                                                        description: transaction.description,
                                                        created_at: transaction.created_at,
                                                        metadata: transaction.metadata,
                                                    },
                                                });
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.transactionIcon}>
                                                {isDeposit ? (
                                                    <Image
                                                        source={require('../../assets/sent (1).png')}
                                                        style={styles.transactionIconImage}
                                                        resizeMode="contain"
                                                    />
                                                ) : (
                                                    <Image
                                                        source={require('../../assets/sent (2).png')}
                                                        style={styles.transactionIconImage}
                                                        resizeMode="contain"
                                                    />
                                                )}
                                            </View>
                                            <View style={styles.transactionContent}>
                                                <ThemedText style={styles.transactionType}>
                                                    {transaction.description || transaction.type || 'Transaction'}
                                                </ThemedText>
                                                <ThemedText style={styles.transactionStatus}>
                                                    {transaction.status || 'Completed'}
                                                </ThemedText>
                                            </View>
                                            <View style={styles.transactionRight}>
                                                <ThemedText
                                                    style={[
                                                        styles.transactionAmount,
                                                        !isDeposit && styles.transactionAmountWithdrawal,
                                                    ]}
                                                >
                                                    {formatBalance(parseFloat(transaction.amount || 0), 'NGN')}
                                                </ThemedText>
                                                <ThemedText style={styles.transactionDate}>
                                                    {transactionDate}
                                                </ThemedText>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <ThemedText style={styles.emptyText}>No recent transactions</ThemedText>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    topBackground: {
        width,
        zIndex: 0,
        position: 'relative',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 100,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    titleSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#00000080',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        borderRadius: 100,
        paddingVertical: 15,
    },
    tabActive: {
        backgroundColor: '#1B800F',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#00000080',
        opacity: 0.7,
    },
    tabTextActive: {
        opacity: 1,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    walletCardContainer: {
        marginTop: 20,
        marginHorizontal: 20,
        alignItems: 'center',
        zIndex: 1,
        position: 'relative',
        elevation: 1, // Android elevation
    },
    walletCard: {
        width: '100%',
        height: 170,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 1,
        marginTop: -80,
        elevation: 1, // Android elevation
    },
    brownImage: {
        width: '100%',
        height: 98,
        marginTop: -10,
        // zIndex: 1,

    },
    walletBalanceLabel: {
        fontSize: 10,
        fontWeight: '400',
        color: '#FFFFFF',
        marginBottom: 8,
        opacity: 0.9,
    },
    walletBalanceAmount: {
        fontSize: 25,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scrollViewContainer: {
        marginTop: -20,
        zIndex: 10,
        backgroundColor: '#fff',
        position: 'relative',
        elevation: 5, // Android elevation
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 100,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    depositButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#00FF3940',
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#E7FF0040',
    },
    billPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#00CEFF40',
    },
    sellButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#00CEFF33',
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FF000033',
    },
    actionButtonIcon: {
        width: 24,
        height: 24,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    depositIcon: {
        // backgroundColor: '#D6F5D9',
    },
    withdrawIcon: {
        // tintColor: '#000',
    },
    billPaymentIcon: {
        // backgroundColor: '#B3D9FF',
    },
    actionButtonIconImage: {
        width: 24,
        height: 24,
    },
    actionButtonText: {
        fontSize: 10,
        fontWeight: '400',
        color: '#111827',
    },
    recentTransactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    recentTransactionsTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#1B800F',
    },
    transactionList: {
        gap: 12,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 12,
        gap: 12,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#D6F5D9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionIconImage: {
        width: 24,
        height: 24,
        tintColor: '#1B800F',
    },
    transactionContent: {
        flex: 1,
    },
    transactionType: {
        fontSize: 12,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    transactionStatus: {
        fontSize: 8,
        color: '#1B800F',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 10,
        fontWeight: '400',
        color: '#1B800F',
        marginBottom: 4,
    },
    transactionAmountWithdrawal: {
        color: '#008000',
    },
    transactionDate: {
        fontSize: 8,
        color: '#9CA3AF',
    },
    cryptoActionButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 12,
    },
    sellIcon: {
        // backgroundColor: '#B3D9FF',
    },
    buyIcon: {
        // backgroundColor: '#FFE3E3',
    },
    cryptoAssetsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cryptoAssetsTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    cryptoAssetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    cryptoAssetCard: {
        width: (width - 40 - 12) / 2,
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        gap: 12,
    },
    cryptoAssetIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cryptoAssetIconImage: {
        width: 30,
        height: 30,
    },
    cryptoAssetContent: {
        flex: 1,
    },
    cryptoAssetSymbol: {
        fontSize: 12,
        fontWeight: '400',

        marginBottom: 4,
    },
    cryptoAssetName: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    cryptoAssetRight: {
        alignItems: 'flex-end',
    },
    cryptoAssetAmount: {
        fontSize: 12,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    cryptoAssetValue: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    emptyContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});

export default WalletsScreen;

