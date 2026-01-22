import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useCryptoDepositAddress } from '../../queries/cryptoQueries';
import { useUsdtBlockchains } from '../../queries/cryptoQueries';

// QR Code Component
import QRCodeSVG from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReceiveCryptoRouteProp = RouteProp<RootStackParamList, 'ReceiveCrypto'>;

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

const ReceiveCryptoScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ReceiveCryptoRouteProp>();
    const params = route.params || {
        cryptoType: 'BTC',
        icon: require('../../assets/popular1.png'),
        iconBackground: '#FFA5004D',
    };
    const { cryptoType, balance, usdValue, icon: routeIcon, iconBackground: routeIconBackground, blockchain: routeBlockchain } = params;
    
    // Use route params or fallback to defaults
    const icon = routeIcon || getCryptoIcon(cryptoType);
    const iconBackground = routeIconBackground || getCryptoColor(cryptoType);
    
    // Fetch USDT blockchains if needed
    const { data: blockchainsData } = useUsdtBlockchains();
    
    // Get available networks based on crypto type
    const networks = useMemo(() => {
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
    }, [cryptoType, blockchainsData]);
    
    // Get selected network ID (blockchain)
    const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(
        routeBlockchain || networks[0]?.id || null
    );
    const [selectedNetworkName, setSelectedNetworkName] = useState<string | null>(
        networks[0]?.name || null
    );
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    
    // Set default network on mount
    useEffect(() => {
        if (!selectedNetworkId && networks.length > 0) {
            const defaultNetwork = networks[0];
            setSelectedNetworkId(defaultNetwork.id);
            setSelectedNetworkName(defaultNetwork.name);
        }
    }, [cryptoType, blockchainsData]);
    
    // Fetch deposit address
    const { 
        data: depositData, 
        isLoading: isLoadingAddress, 
        error: addressError,
        refetch: refetchAddress 
    } = useCryptoDepositAddress(
        cryptoType, 
        selectedNetworkId || cryptoType
    );
    
    const depositAddress = depositData?.data?.deposit_address || '';
    const qrCodeData = depositData?.data?.qr_code || depositAddress;
    
    const handleCopyAddress = async () => {
        if (!depositAddress) {
            Alert.alert('Error', 'No deposit address available');
            return;
        }
        try {
            await Clipboard.setStringAsync(depositAddress);
            Alert.alert('Success', 'Address copied to clipboard');
        } catch (error) {
            Alert.alert('Error', 'Failed to copy address');
        }
    };

    const handleSaveOrShare = () => {
        // Save or share address functionality
        // For now, just copy to clipboard
        handleCopyAddress();
    };
    
    const handleNetworkSelect = (network: { id: string; name: string }) => {
        setSelectedNetworkId(network.id);
        setSelectedNetworkName(network.name);
        setShowNetworkModal(false);
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
                    <ThemedText style={styles.headerTitle}>Deposit {cryptoType}</ThemedText>
                    <View style={styles.placeholder} />
                </View>

                {/* QR Code Card */}
                <LinearGradient
                    colors={['#072D03', '#17930A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.qrCard}
                >
                    <View style={styles.qrCardHeader}>
                        <ThemedText style={styles.qrCardTitle}>Deposit {cryptoType}</ThemedText>
                    </View>
                    <View style={styles.qrCodeContainer}>
                        <View style={styles.qrCodePlaceholder}>
                            {isLoadingAddress ? (
                                <View style={styles.qrCodeLoadingContainer}>
                                    <ActivityIndicator size="large" color="#1B800F" />
                                    <ThemedText style={styles.qrCodeLoadingText}>Loading address...</ThemedText>
                                </View>
                            ) : addressError ? (
                                <View style={styles.qrCodeErrorContainer}>
                                    <Ionicons name="alert-circle" size={48} color="#EF4444" />
                                    <ThemedText style={styles.qrCodeErrorText}>
                                        Failed to load address
                                    </ThemedText>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={() => refetchAddress()}
                                        activeOpacity={0.8}
                                    >
                                        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            ) : depositAddress ? (
                                <View style={styles.qrCodeWrapper}>
                                    <QRCodeSVG
                                        value={qrCodeData || depositAddress}
                                        size={width - 120}
                                        color="#000000"
                                        backgroundColor="#FFFFFF"
                                        logo={icon}
                                        logoSize={50}
                                        logoBackgroundColor="#FFFFFF"
                                        logoMargin={4}
                                        logoBorderRadius={25}
                                        quietZone={10}
                                    />
                                </View>
                            ) : (
                                <View style={styles.qrCodeEmptyContainer}>
                                    <ThemedText style={styles.qrCodeEmptyText}>
                                        Select a network to generate address
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                {/* Deposit Address Field */}
                <View style={styles.addressFieldContainer}>
                    <ThemedText style={styles.addressFieldLabel}>Deposit Address</ThemedText>
                    <View style={styles.addressField}>
                        {isLoadingAddress ? (
                            <View style={styles.addressLoadingContainer}>
                                <ActivityIndicator size="small" color="#1B800F" />
                                <ThemedText style={styles.addressLoadingText}>Loading...</ThemedText>
                            </View>
                        ) : depositAddress ? (
                            <>
                                <ThemedText style={styles.addressText} numberOfLines={1}>
                                    {depositAddress}
                                </ThemedText>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={handleCopyAddress}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="copy-outline" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <ThemedText style={styles.addressText} numberOfLines={1}>
                                Select network to generate address
                            </ThemedText>
                        )}
                    </View>
                </View>

                {/* Network Field */}
                <TouchableOpacity
                    style={styles.networkFieldContainer}
                    onPress={() => setShowNetworkModal(true)}
                    activeOpacity={0.8}
                >
                    <ThemedText style={styles.networkFieldLabel}>Network</ThemedText>
                    <View style={styles.networkField}>
                        <ThemedText style={styles.networkText}>
                            {selectedNetworkName || 'Select Network'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>

                {/* Save or Share Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveOrShare}
                    activeOpacity={0.8}
                >
                    <ThemedText style={styles.saveButtonText}>Save or share address</ThemedText>
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
                                    style={[
                                        styles.networkOption,
                                        selectedNetworkId === network.id && styles.networkOptionSelected
                                    ]}
                                    onPress={() => handleNetworkSelect(network)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.networkInfo}>
                                        <ThemedText style={styles.networkName}>{network.name}</ThemedText>
                                        <ThemedText style={styles.networkTime}>
                                            Crediting time = {network.creditingTime}
                                        </ThemedText>
                                    </View>
                                    {selectedNetworkId === network.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#1B800F" />
                                    )}
                                </TouchableOpacity>
                            ))}
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
    qrCard: {
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        padding: 2,
    },
    qrCardHeader: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    qrCardTitle: {
        fontSize: 20,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    qrCodeContainer: {
        padding: 20,
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrCodePlaceholder: {
        width: width - 80,
        height: width - 110,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        position: 'relative',
    },
    qrCodeWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    qrCodeImage: {
        width: '100%',
        height: '100%',
    },
    qrCodeIconContainer: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    qrCodeIcon: {
        width: 40,
        height: 40,
    },
    addressFieldContainer: {
        marginBottom: 16,
    },
    addressFieldLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: '#9CA3AF',
        marginBottom: 8,
    },
    addressField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
        gap: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    copyButton: {
        padding: 4,
    },
    networkFieldContainer: {
        marginBottom: 24,
    },
    networkFieldLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: '#9CA3AF',
        marginBottom: 8,
    },
    networkField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 16,
    },
    networkText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    saveButton: {
        backgroundColor: '#42AC36',
        borderRadius: 100,
        padding: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    networkModalOverlay: {
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
    networkModalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',
        textAlign: 'center',
    },
    networkModalCloseButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
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
    networkOptionSelected: {
        backgroundColor: '#D6F5D9',
        borderWidth: 1,
        borderColor: '#1B800F',
    },
    qrCodeLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    qrCodeLoadingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    qrCodeErrorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 20,
    },
    qrCodeErrorText: {
        fontSize: 12,
        color: '#EF4444',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#1B800F',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 8,
    },
    retryButtonText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    qrCodeFallback: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    qrCodeFallbackText: {
        fontSize: 10,
        color: '#111827',
        textAlign: 'center',
        fontFamily: 'monospace',
    },
    qrCodeEmptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    qrCodeEmptyText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    addressLoadingContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addressLoadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    emptyNetworksContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyNetworksText: {
        fontSize: 14,
        color: '#6B7280',
    },
});

export default ReceiveCryptoScreen;

