import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CryptoWalletRouteProp = RouteProp<RootStackParamList, 'CryptoWallet'>;

const CryptoWalletScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<CryptoWalletRouteProp>();
    const { cryptoType, balance, usdValue, icon, iconBackground } = route.params || {
        cryptoType: 'BTC',
        balance: '0.00023',
        usdValue: '$20,000',
        icon: require('../../assets/popular1.png'),
        iconBackground: '#FFA5004D',
    };

    const recentTransactions = [
        {
            id: '1',
            type: 'Crypto Deposit - BTC',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: true,
        },
        {
            id: '2',
            type: 'Crypto Deposit - BTC',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: true,
        },
        {
            id: '3',
            type: 'Crypto Deposit - BTC',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: true,
        },
        {
            id: '4',
            type: 'Crypto Deposit - BTC',
            status: 'Successful',
            amount: '20,000',
            date: '06 Oct, 25 - 08:00 PM',
            isDeposit: true,
        },
    ];

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
                    <ThemedText style={styles.balanceAmount}>{balance}</ThemedText>
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
            >
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
                                    type: 'crypto',
                                    transactionData: {
                                        ...transaction,
                                        cryptoType: 'Receive',
                                    },
                                });
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.transactionIcon}>
                                <Image
                                    source={require('../../assets/sent (2).png')}
                                    style={styles.transactionIconImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.transactionContent}>
                                <ThemedText style={styles.transactionType}>{transaction.type}</ThemedText>
                                <ThemedText style={styles.transactionStatus}>{transaction.status}</ThemedText>
                            </View>
                            <View style={styles.transactionRight}>
                                <ThemedText style={styles.transactionAmount}>{transaction.amount}</ThemedText>
                                <ThemedText style={styles.transactionDate}>{transaction.date}</ThemedText>
                            </View>
                        </TouchableOpacity>
                    ))}
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
});

export default CryptoWalletScreen;

