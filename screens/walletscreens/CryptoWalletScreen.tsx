import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useCryptoAccountDetails } from '../../queries/cryptoQueries';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CryptoWalletRouteProp = RouteProp<RootStackParamList, 'CryptoWallet'>;

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

// Helper function to format transaction type
const formatTransactionType = (type: string, currency: string): string => {
    const typeMap: Record<string, string> = {
        'crypto_buy': `Buy ${currency}`,
        'crypto_sell': `Sell ${currency}`,
        'crypto_withdrawal': `Send ${currency}`,
        'crypto_deposit': `Receive ${currency}`,
    };
    return typeMap[type] || type;
};

// Helper function to format transaction status
const formatTransactionStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'completed': 'Successful',
        'pending': 'Pending',
        'failed': 'Failed',
        'processing': 'Processing',
    };
    return statusMap[status?.toLowerCase()] || status || 'Pending';
};

// Helper function to determine if transaction is deposit/receive
const isDepositTransaction = (type: string): boolean => {
    return type === 'crypto_deposit' || type === 'crypto_buy';
};

const CryptoWalletScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<CryptoWalletRouteProp>();
    
    // Get currency and blockchain from route params (new way)
    // Fallback to cryptoType for backward compatibility
    const currency = route.params?.currency || route.params?.cryptoType || 'BTC';
    const blockchain = route.params?.blockchain;
    
    // Fetch account details and transactions
    const { 
        data: accountData, 
        isLoading, 
        error, 
        refetch,
        isRefetching 
    } = useCryptoAccountDetails(currency, blockchain || undefined);
    
    // Extract account info and transactions
    const account = accountData?.data;
    const transactions = account?.transactions || [];
    
    // Use API data if available, otherwise fallback to route params
    const cryptoType = currency;
    const balance = account?.balance?.toString() || route.params?.balance || '0.00';
    const usdValue = account?.usd_value 
        ? `$${account.usd_value.toFixed(2)}` 
        : route.params?.usdValue || '$0.00';
    const icon = route.params?.icon || getCryptoIcon(currency);
    const iconBackground = route.params?.iconBackground || getCryptoColor(currency);
    
    // Format transactions for display
    const formattedTransactions = useMemo(() => {
        return transactions.map((transaction: {
            id?: number | string;
            transaction_id?: string;
            type: string;
            status: string;
            amount: number;
            created_at?: string;
            blockchain?: string;
            [key: string]: any;
        }) => {
            const isDeposit = isDepositTransaction(transaction.type);
            const transactionDate = transaction.created_at 
                ? new Date(transaction.created_at).toLocaleDateString('en-NG', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : '';
            
            return {
                id: transaction.id || transaction.transaction_id,
                transaction_id: transaction.transaction_id,
                type: formatTransactionType(transaction.type, currency),
                status: formatTransactionStatus(transaction.status),
                amount: transaction.amount?.toFixed(4) || '0.0000',
                date: transactionDate,
                isDeposit,
                ...transaction, // Include all original transaction data
            };
        });
    }, [transactions, currency]);
    
    // Handle refresh
    const onRefresh = () => {
        refetch();
    };

    // Loading state
    if (isLoading && !account) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#FFFFFF" />
                <ThemedText style={styles.loadingText}>Loading wallet...</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Top Section with Green Background */}
            <View style={styles.topBackground}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>{cryptoType} Wallet</ThemedText>
                    <View style={styles.placeholder} />
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCardContainer}>
                    <View style={[styles.balanceIconCircle, { backgroundColor: iconBackground }]}>
                        <Image
                            source={icon}
                            style={styles.balanceIcon}
                            resizeMode="contain"
                        />
                    </View>
                    <ThemedText style={styles.balanceAmount}>{parseFloat(balance).toFixed(4)}</ThemedText>
                    <ThemedText style={styles.balanceUsdValue}>{usdValue}</ThemedText>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.depositButton]} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('ReceiveCrypto', {
                            cryptoType,
                            balance,
                            usdValue,
                            icon,
                            iconBackground,
                            blockchain,
                        })}
                    >
                        <View style={styles.actionButtonIcon}>
                            <Image
                                source={require('../../assets/sent (1).png')}
                                style={styles.actionButtonIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <ThemedText style={styles.actionButtonText}>Recieve</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.withdrawButton]}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('SendCrypto', {
                            cryptoType,
                            balance,
                            usdValue,
                            icon,
                            iconBackground,
                            blockchain,
                        })}
                    >
                        <View style={styles.actionButtonIcon}>
                            <Image
                                source={require('../../assets/sent (2).png')}
                                style={styles.actionButtonIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <ThemedText style={styles.actionButtonText}>Send</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.sellButton]} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('SellCrypto', {
                            cryptoType,
                            balance,
                            usdValue,
                            icon,
                            iconBackground,
                            blockchain,
                        })}
                    >
                        <View style={styles.actionButtonIcon}>
                            <Image
                                source={require('../../assets/sell (1).png')}
                                style={styles.actionButtonIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <ThemedText style={styles.actionButtonText}>Sell</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.buyButton]} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('BuyCrypto', {
                            cryptoType,
                            balance,
                            usdValue,
                            icon,
                            iconBackground,
                            blockchain,
                        })}
                    >
                        <View style={styles.actionButtonIcon}>
                            <Image
                                source={require('../../assets/sell (2).png')}
                                style={styles.actionButtonIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <ThemedText style={styles.actionButtonText}>Buy</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom White Section */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor="#1B800F"
                        colors={['#1B800F']}
                    />
                }
            >
                {/* Recent Transactions Section */}
                <View style={styles.recentTransactionsHeader}>
                    <ThemedText style={styles.recentTransactionsTitle}>Recent Transactions</ThemedText>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('AllTransactions', { 
                            initialFilter: 'Crypto',
                            wallet_type: 'crypto'
                        })} 
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.viewAllText}>View All</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Transaction List */}
                <View style={styles.transactionList}>
                    {error ? (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.errorText}>
                                Failed to load transactions. Pull to refresh.
                            </ThemedText>
                        </View>
                    ) : formattedTransactions.length > 0 ? (
                        formattedTransactions.map((transaction) => (
                            <TouchableOpacity
                                key={transaction.id || transaction.transaction_id}
                                style={styles.transactionItem}
                                onPress={() => {
                                    navigation.navigate('TransactionHistory', {
                                        type: 'crypto',
                                        transactionData: {
                                            id: transaction.id,
                                            transaction_id: transaction.transaction_id,
                                            type: transaction.type,
                                            status: transaction.status,
                                            amount: transaction.amount,
                                            date: transaction.date,
                                            currency: currency,
                                            blockchain: transaction.blockchain,
                                            cryptoType: transaction.isDeposit ? 'Receive' : 'Send',
                                            ...transaction,
                                        },
                                    });
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={styles.transactionIcon}>
                                    <Image
                                        source={
                                            transaction.isDeposit
                                                ? require('../../assets/sent (1).png')
                                                : require('../../assets/sent (2).png')
                                        }
                                        style={styles.transactionIconImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.transactionContent}>
                                    <ThemedText style={styles.transactionType}>{transaction.type}</ThemedText>
                                    <ThemedText style={[
                                        styles.transactionStatus,
                                        transaction.status === 'Failed' && styles.transactionStatusFailed,
                                        transaction.status === 'Pending' && styles.transactionStatusPending,
                                    ]}>
                                        {transaction.status}
                                    </ThemedText>
                                </View>
                                <View style={styles.transactionRight}>
                                    <ThemedText style={[
                                        styles.transactionAmount,
                                        !transaction.isDeposit && styles.transactionAmountWithdrawal,
                                    ]}>
                                        {transaction.isDeposit ? '+' : '-'}{transaction.amount} {currency}
                                    </ThemedText>
                                    <ThemedText style={styles.transactionDate}>{transaction.date}</ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
                        </View>
                    )}
                </View>
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
        paddingBottom: 40,
        backgroundColor: '#1B800F',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    placeholder: {
        width: 40,
    },
    balanceCardContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    balanceIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    balanceIcon: {
        width: 60,
        height: 60,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    balanceUsdValue: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    depositButton: {
        backgroundColor: '#043B4880',
    },
    withdrawButton: {
        backgroundColor: '#555D0580',
    },
    sellButton: {
        backgroundColor: '#043B4880',
    },
    buyButton: {
        backgroundColor: '#FF000080',
    },
    actionButtonIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonIconImage: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    },
    actionButtonText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 100,
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
        fontSize: 14,
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
        fontSize: 14,
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
        fontSize: 14,
        fontWeight: '400',
        color: '#1B800F',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 8,
        color: '#9CA3AF',
    },
    transactionAmountWithdrawal: {
        color: '#008000',
    },
    transactionStatusFailed: {
        color: '#EF4444',
    },
    transactionStatusPending: {
        color: '#F59E0B',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1B800F',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#FFFFFF',
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
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
    },
});

export default CryptoWalletScreen;

