import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SelectCryptoRouteProp = RouteProp<RootStackParamList, 'SelectCrypto'>;

const cryptoAssets = [
    {
        id: 'BTC',
        name: 'Bitcoin',
        symbol: 'BTC',
        amount: '0.00023',
        usdValue: '$20,000',
        icon: require('../../assets/popular1.png'),
        iconBackground: '#FFA5004D',
    },
    {
        id: 'ETH',
        name: 'Ethereum',
        symbol: 'ETH',
        amount: '1.23',
        usdValue: '$5,200',
        icon: require('../../assets/popular2.png'),
        iconBackground: '#0000FF4D',
    },
    {
        id: 'USDT',
        name: 'Tehter',
        symbol: 'USDT',
        amount: '200',
        usdValue: '$200',
        icon: require('../../assets/popular3.png'),
        iconBackground: '#0080004D',
    },
    {
        id: 'USDC',
        name: 'Circle USDC',
        symbol: 'USDC',
        amount: '200',
        usdValue: '$200',
        icon: require('../../assets/popular4.png'),
        iconBackground: '#0000FF4D',
    },
];

const SelectCryptoScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<SelectCryptoRouteProp>();
    const mode = route.params?.mode || 'send'; // 'send' or 'sell'
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAssets = cryptoAssets.filter(
        (asset) =>
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            onPress={() => {
                                if (mode === 'sell') {
                                    navigation.navigate('SellCrypto', {
                                        cryptoType: asset.symbol,
                                        balance: asset.amount,
                                        usdValue: asset.usdValue,
                                        icon: asset.icon,
                                        iconBackground: asset.iconBackground,
                                    });
                                } else if (mode === 'buy') {
                                    navigation.navigate('BuyCrypto', {
                                        cryptoType: asset.symbol,
                                        balance: asset.amount,
                                        usdValue: asset.usdValue,
                                        icon: asset.icon,
                                        iconBackground: asset.iconBackground,
                                    });
                                } else if (mode === 'receive') {
                                    navigation.navigate('ReceiveCrypto', {
                                        cryptoType: asset.symbol,
                                        balance: asset.amount,
                                        usdValue: asset.usdValue,
                                        icon: asset.icon,
                                        iconBackground: asset.iconBackground,
                                    });
                                } else {
                                    navigation.navigate('SendCrypto', {
                                        cryptoType: asset.symbol,
                                        balance: asset.amount,
                                        usdValue: asset.usdValue,
                                        icon: asset.icon,
                                        iconBackground: asset.iconBackground,
                                    });
                                }
                            }}
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
});

export default SelectCryptoScreen;

