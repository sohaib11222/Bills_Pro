import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
    Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReceiveCryptoRouteProp = RouteProp<RootStackParamList, 'ReceiveCrypto'>;

const networks = [
    { id: 'BTC', name: 'BTC (Bitcoin)', creditingTime: '1 min' },
    { id: 'LIGHTNING', name: 'LIGHTNING (Lightning Network)', creditingTime: '1 min' },
    { id: 'BEP20', name: 'BEP20 (Binance Smart Chain)', creditingTime: '1 min' },
];

const ReceiveCryptoScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ReceiveCryptoRouteProp>();
    const params = route.params || {
        cryptoType: 'BTC',
        icon: require('../../assets/popular1.png'),
        iconBackground: '#FFA5004D',
    };
    const { cryptoType, balance, usdValue, icon, iconBackground } = params;

    const [selectedNetwork, setSelectedNetwork] = useState<string | null>('BTC');
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const depositAddress = '12334jje3294f2i3edmdei3nfwdnwiwejcjw';

    const handleCopyAddress = () => {
        // Copy address to clipboard
        // You can use Clipboard from @react-native-clipboard/clipboard or expo-clipboard
    };

    const handleSaveOrShare = () => {
        // Save or share address functionality
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
                            <View style={styles.qrCodeWrapper}>
                                <Image
                                    source={require('../../assets/qr_code.png')}
                                    style={styles.qrCodeImage}
                                    resizeMode="contain"
                                />
                                <View style={[styles.qrCodeIconContainer, { backgroundColor: iconBackground }]}>
                                    <Image
                                        source={icon}
                                        style={styles.qrCodeIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Deposit Address Field */}
                <View style={styles.addressFieldContainer}>
                    <ThemedText style={styles.addressFieldLabel}>Deposit Address</ThemedText>
                    <View style={styles.addressField}>
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
                            {selectedNetwork || 'Select Network'}
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
                                    style={styles.networkOption}
                                    onPress={() => {
                                        setSelectedNetwork(network.name);
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
});

export default ReceiveCryptoScreen;

