import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WalletsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [selectedTab, setSelectedTab] = useState<'Naira' | 'Crypto'>('Naira');

    const recentTransactions = [
        {
            id: '1',
            type: 'Funds Deposit',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: true,
        },
        {
            id: '2',
            type: 'Funds Withdrawal',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: false,
        },
        {
            id: '3',
            type: 'Funds Withdrawal',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: false,
        },
        {
            id: '4',
            type: 'Funds Withdrawal',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: false,
        },
    ];

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
                            {selectedTab === 'Crypto' ? '$200,000.00' : 'N200,000.00'}
                        </ThemedText>
                    </ImageBackground>
                </View>
            </ImageBackground>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={{ marginTop: -20, zIndex: 3, backgroundColor: '#fff' }}
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
                        <TouchableOpacity style={[styles.actionButton, styles.depositButton]} activeOpacity={0.8}>
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
                            {/* BTC */}
                            <TouchableOpacity
                                style={styles.cryptoAssetCard}
                                activeOpacity={0.8}
                                onPress={() => {
                                    navigation.navigate('CryptoWallet', {
                                        cryptoType: 'BTC',
                                        balance: '0.00023',
                                        usdValue: '$20,000',
                                        icon: require('../../assets/popular1.png'),
                                        iconBackground: '#FFA5004D',
                                    });
                                }}
                            >
                                <View style={[styles.cryptoAssetIcon, { backgroundColor: '#FFA5004D' }]}>
                                    <Image
                                        source={require('../../assets/popular1.png')}
                                        style={styles.cryptoAssetIconImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={styles.cryptoAssetContent}>
                                        <ThemedText style={styles.cryptoAssetSymbol}>BTC</ThemedText>
                                        <ThemedText style={styles.cryptoAssetName}>Bitcoin</ThemedText>
                                    </View>
                                    <View style={styles.cryptoAssetRight}>
                                        <ThemedText style={styles.cryptoAssetAmount}>0.00023</ThemedText>
                                        <ThemedText style={styles.cryptoAssetValue}>$20,000</ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* ETH */}
                            <TouchableOpacity
                                style={styles.cryptoAssetCard}
                                activeOpacity={0.8}
                                onPress={() => {
                                    navigation.navigate('CryptoWallet', {
                                        cryptoType: 'ETH',
                                        balance: '1.23',
                                        usdValue: '$5,200',
                                        icon: require('../../assets/popular2.png'),
                                        iconBackground: '#0000FF4D',
                                    });
                                }}
                            >
                                <View style={[styles.cryptoAssetIcon, { backgroundColor: '#0000FF4D' }]}>
                                    <Image
                                        source={require('../../assets/popular2.png')}
                                        style={styles.cryptoAssetIconImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={styles.cryptoAssetContent}>
                                        <ThemedText style={styles.cryptoAssetSymbol}>ETH</ThemedText>
                                        <ThemedText style={styles.cryptoAssetName}>Ethereum</ThemedText>
                                    </View>
                                    <View style={styles.cryptoAssetRight}>
                                        <ThemedText style={styles.cryptoAssetAmount}>1.23</ThemedText>
                                        <ThemedText style={styles.cryptoAssetValue}>$5,200</ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* USDT */}
                            <TouchableOpacity
                                style={styles.cryptoAssetCard}
                                activeOpacity={0.8}
                                onPress={() => {
                                    navigation.navigate('CryptoWallet', {
                                        cryptoType: 'USDT',
                                        balance: '200',
                                        usdValue: '$200',
                                        icon: require('../../assets/popular3.png'),
                                        iconBackground: '#0080004D',
                                    });
                                }}
                            >
                                <View style={[styles.cryptoAssetIcon, { backgroundColor: '#0080004D' }]}>
                                    <Image
                                        source={require('../../assets/popular3.png')}
                                        style={styles.cryptoAssetIconImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={styles.cryptoAssetContent}>
                                        <ThemedText style={styles.cryptoAssetSymbol}>USDT</ThemedText>
                                        <ThemedText style={styles.cryptoAssetName}>Tehter</ThemedText>
                                    </View>
                                    <View style={styles.cryptoAssetRight}>
                                        <ThemedText style={styles.cryptoAssetAmount}>200</ThemedText>
                                        <ThemedText style={styles.cryptoAssetValue}>$200</ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* USDC */}
                            <TouchableOpacity
                                style={styles.cryptoAssetCard}
                                activeOpacity={0.8}
                                onPress={() => {
                                    navigation.navigate('CryptoWallet', {
                                        cryptoType: 'USDC',
                                        balance: '200',
                                        usdValue: '$200',
                                        icon: require('../../assets/popular4.png'),
                                        iconBackground: '#0000FF4D',
                                    });
                                }}
                            >
                                <View style={[styles.cryptoAssetIcon, { backgroundColor: '#0000FF4D' }]}>
                                    <Image
                                        source={require('../../assets/popular4.png')}
                                        style={styles.cryptoAssetIconImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={styles.cryptoAssetContent}>
                                        <ThemedText style={styles.cryptoAssetSymbol}>USDC</ThemedText>
                                        <ThemedText style={styles.cryptoAssetName}>Circle USDC</ThemedText>
                                    </View>
                                    <View style={styles.cryptoAssetRight}>
                                        <ThemedText style={styles.cryptoAssetAmount}>200</ThemedText>
                                        <ThemedText style={styles.cryptoAssetValue}>$200</ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>
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
                            {recentTransactions.map((transaction) => (
                                <TouchableOpacity
                                    key={transaction.id}
                                    style={styles.transactionItem}
                                    onPress={() => {
                                        navigation.navigate('TransactionHistory', {
                                            type: transaction.isDeposit ? 'deposit' : 'withdraw',
                                            transactionData: transaction,
                                        });
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.transactionIcon}>
                                        {transaction.isDeposit ? (
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
                                        <ThemedText style={styles.transactionType}>{transaction.type}</ThemedText>
                                        <ThemedText style={styles.transactionStatus}>{transaction.status}</ThemedText>
                                    </View>
                                    <View style={styles.transactionRight}>
                                        <ThemedText
                                            style={[
                                                styles.transactionAmount,
                                                !transaction.isDeposit && styles.transactionAmountWithdrawal,
                                            ]}
                                        >
                                            {transaction.amount}
                                        </ThemedText>
                                        <ThemedText style={styles.transactionDate}>{transaction.date}</ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))}
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
        // paddingBottom: 40,
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
        zIndex: 2,
    },
    walletCard: {
        width: '100%',
        height: 170,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 2,
        marginTop: -80,
    },
    brownImage: {
        width: '100%',
        height: 98,
        marginTop: -10,
        // zIndex: 1,

    },
    walletBalanceLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
        marginBottom: 8,
        opacity: 0.9,
    },
    walletBalanceAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFFFFF',
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
        fontSize: 12,
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
        fontSize: 14,
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
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    cryptoAssetValue: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
});

export default WalletsScreen;

