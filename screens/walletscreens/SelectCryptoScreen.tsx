import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useCryptoAccounts } from '../../queries/cryptoQueries';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SelectCryptoRouteProp = RouteProp<RootStackParamList, 'SelectCrypto'>;

// Helper function to get crypto icon
const getCryptoIcon = (currency: string) => {
    const icons: { [key: string]: any } = {
        'BTC': require('../../assets/popular1.png'),
        'ETH': require('../../assets/popular2.png'),
        'USDT': require('../../assets/popular3.png'),
        'USDC': require('../../assets/popular4.png'),
    };
    return icons[currency] || require('../../assets/popular1.png');
};

// Helper function to get crypto background color
const getCryptoBackground = (currency: string) => {
    const backgrounds: { [key: string]: string } = {
        'BTC': '#FFA5004D',
        'ETH': '#0000FF4D',
        'USDT': '#0080004D',
        'USDC': '#0000FF4D',
    };
    return backgrounds[currency] || '#FFA5004D';
};

// Helper function to get crypto name
const getCryptoName = (currency: string) => {
    const names: { [key: string]: string } = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'USDT': 'Tether',
        'USDC': 'Circle USDC',
    };
    return names[currency] || currency;
};

const SelectCryptoScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<SelectCryptoRouteProp>();
    const mode = route.params?.mode || 'send'; // 'send', 'sell', 'buy', 'receive'
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch crypto accounts from API
    const { data: accountsData, isLoading, error, refetch } = useCryptoAccounts();

    // Transform API data to crypto assets format
    const cryptoAssets = useMemo(() => {
        if (!accountsData?.data || !Array.isArray(accountsData.data)) {
            return [];
        }

        return accountsData.data.map((account: any, index: number) => {
            const balance = account.balance || 0;
            const usdValue = account.usd_value || 0;
            
            // Use account.id if available, otherwise create unique key with currency and index
            const uniqueId = account.id || `${account.currency}_${index}`;
            
            return {
                id: uniqueId,
                name: account.name || getCryptoName(account.currency),
                symbol: account.symbol || account.currency,
                amount: balance.toString(),
                usdValue: `$${usdValue.toFixed(2)}`,
                icon: getCryptoIcon(account.currency),
                iconBackground: getCryptoBackground(account.currency),
                blockchains: account.blockchains || [], // For USDT grouped accounts
                isGrouped: account.is_grouped || false,
                blockchain: account.blockchains?.[0]?.blockchain, // Default blockchain for USDT
            };
        });
    }, [accountsData]);

    const filteredAssets = useMemo(() => {
        return cryptoAssets.filter(
            (asset) =>
                asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [cryptoAssets, searchQuery]);

    // Handle navigation with blockchain info
    const handleCryptoSelect = (asset: any) => {
        const navigationParams = {
            cryptoType: asset.symbol,
            balance: asset.amount,
            usdValue: asset.usdValue,
            icon: asset.icon,
            iconBackground: asset.iconBackground,
            blockchain: asset.blockchain || asset.symbol, // Default blockchain
        };

        if (mode === 'sell') {
            navigation.navigate('SellCrypto', navigationParams);
        } else if (mode === 'buy') {
            navigation.navigate('BuyCrypto', navigationParams);
        } else if (mode === 'receive') {
            navigation.navigate('ReceiveCrypto', navigationParams);
        } else {
            navigation.navigate('SendCrypto', navigationParams);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Select Crypto</ThemedText>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#42AC36" />
                    <ThemedText style={styles.loadingText}>Loading crypto accounts...</ThemedText>
                </View>
            </View>
        );
    }

    // Show error state
    if (error) {
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Select Crypto</ThemedText>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#FF3B30" />
                    <ThemedText style={styles.errorText}>Failed to load crypto accounts</ThemedText>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetch()}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Show empty state
    if (filteredAssets.length === 0 && !isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Select Crypto</ThemedText>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
                    <ThemedText style={styles.emptyText}>
                        {searchQuery ? 'No crypto found' : 'No crypto accounts available'}
                    </ThemedText>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={24} color="#000000" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Select Crypto</ThemedText>
                <View style={styles.placeholder} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search crypto"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Crypto Grid */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.cryptoGrid}>
                    {filteredAssets.map((asset) => (
                        <TouchableOpacity
                            key={asset.id}
                            style={styles.cryptoCard}
                            activeOpacity={0.8}
                            onPress={() => handleCryptoSelect(asset)}
                        >
                            <View style={[styles.cryptoIcon, { backgroundColor: asset.iconBackground }]}>
                                <Image
                                    source={asset.icon}
                                    style={styles.cryptoIconImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View style={styles.cryptoInfo}>
                                <ThemedText style={styles.cryptoSymbol}>{asset.symbol}</ThemedText>
                                <ThemedText style={styles.cryptoName}>{asset.name}</ThemedText>
                            </View>
                            <View style={styles.cryptoAmounts}>
                                <ThemedText style={styles.cryptoAmount}>{asset.amount}</ThemedText>
                                <ThemedText style={styles.cryptoUsdValue}>{asset.usdValue}</ThemedText>
                            </View>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 16,
        height: 60,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    cryptoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    cryptoCard: {
        width: (width - 40 - 12) / 2,
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        gap: 12,
    },
    cryptoIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cryptoIconImage: {
        width: 30,
        height: 30,
    },
    cryptoInfo: {
        flex: 1,
    },
    cryptoSymbol: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    cryptoName: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    cryptoAmounts: {
        alignItems: 'flex-end',
    },
    cryptoAmount: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    cryptoUsdValue: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    errorText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default SelectCryptoScreen;

