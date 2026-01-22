import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    Image,
    Modal,
    Pressable,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';
import { useSetPin } from '../../../mutations/authMutations';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TransactionPinScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [pin, setPin] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const setPinMutation = useSetPin();

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleNext = async () => {
        if (pin.length !== 4) {
            Alert.alert('Error', 'Please enter a complete 4-digit PIN');
            return;
        }

        try {
            console.log('🔵 Transaction PIN Setup - Request Data:', { pin: '****' });
            const result = await setPinMutation.mutateAsync({
                pin: pin,
                pin_confirmation: pin, // Use same PIN for confirmation
            });

            console.log('🟢 Transaction PIN Setup - API Response:', JSON.stringify(result, null, 2));

            if (result.success) {
                console.log('✅ Transaction PIN Setup - Success');
                setShowSuccessModal(true);
            } else {
                Alert.alert('PIN Setup Failed', result.message || 'Failed to set transaction PIN. Please try again.');
                setPin('');
            }
        } catch (error: any) {
            console.log('❌ Transaction PIN Setup - Error:', JSON.stringify(error, null, 2));
            
            // Handle validation errors from backend
            if (error?.data?.errors) {
                const errorMessages = Object.values(error.data.errors).flat().join('\n');
                Alert.alert('PIN Setup Failed', errorMessages);
            } else {
                Alert.alert(
                    'PIN Setup Failed',
                    error?.message || error?.data?.message || 'Failed to set transaction PIN. Please try again.'
                );
            }
            setPin('');
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Setup Pin</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Security Icon */}
                <View style={styles.iconContainer}>
                    <Image
                        source={require('../../../assets/security-safe.png')}
                        style={styles.securityIcon}
                        resizeMode="contain"
                    />
                </View>

                {/* PIN Input Fields */}
                <View style={styles.pinContainer}>
                    {[0, 1, 2, 3].map((index) => (
                        <View
                            key={index}
                            style={[
                                styles.pinDot,
                                pin.length > index && styles.pinDotFilled,
                            ]}
                        />
                    ))}
                </View>

                {/* Numpad */}
                <View style={styles.numpadContainer}>
                    <View style={styles.numpadLeft}>
                        <View style={styles.numpadRow}>
                            {[1, 2, 3].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={styles.numButton}
                                    onPress={() => handleNumberPress(num.toString())}
                                    activeOpacity={0.7}
                                >
                                    <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.backspaceButton}
                                onPress={handleBackspace}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="backspace-outline" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.numpadRow}>
                            {[4, 5, 6].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={styles.numButton}
                                    onPress={() => handleNumberPress(num.toString())}
                                    activeOpacity={0.7}
                                >
                                    <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.numpadRow}>
                            {[7, 8, 9].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={styles.numButton}
                                    onPress={() => handleNumberPress(num.toString())}
                                    activeOpacity={0.7}
                                >
                                    <ThemedText style={styles.numButtonText}>{num}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.numpadRow}>
                            <TouchableOpacity
                                style={styles.numButton}
                                onPress={() => {}}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="finger-print" size={24} color="#42AC36" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.numButton}
                                onPress={() => handleNumberPress('0')}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={styles.numButtonText}>0</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.numButton}
                                onPress={() => handleNumberPress('.')}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={styles.numButtonText}>.</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.numpadRight}>
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                (pin.length !== 4 || setPinMutation.isPending) && styles.nextButtonDisabled,
                            ]}
                            onPress={handleNext}
                            disabled={pin.length !== 4 || setPinMutation.isPending}
                            activeOpacity={0.8}
                        >
                            {setPinMutation.isPending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <ThemedText style={styles.nextButtonText}>Next</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
                    <Pressable style={styles.successModalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.successIconContainer}>
                            <View style={styles.successIconOuter}>
                                <View style={styles.successIconMiddle}>
                                    <View style={styles.successIconInner}>
                                        <Image
                                            source={require('../../../assets/tick-04.png')}
                                            style={styles.successCheckmark}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <ThemedText style={styles.successTitle}>Success</ThemedText>
                        <ThemedText style={styles.successMessage}>
                            Your transaction pin has been set successfully
                        </ThemedText>
                        <View style={styles.successButtons}>
                            <TouchableOpacity
                                style={styles.closeSuccessButton}
                                onPress={handleCloseModal}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 44 : 44,
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingTop: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    securityIcon: {
        width: 139,
        height: 139,
        tintColor: '#1B800F',
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    pinDot: {
        width: 70,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#EFEFEF',
        marginHorizontal: 5,
    },
    pinDotFilled: {
        backgroundColor: '#42AC36',
    },
    numpadContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 316,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 23,
    },
    numpadLeft: {
        flex: 1,
        maxWidth: 290,
    },
    numpadRight: {
        width: 90,
        marginLeft: 15,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    numpadRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    numButton: {
        width: 90,
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    numButtonText: {
        fontSize: 30,
        fontWeight: '400',
        color: '#000000',
    },
    backspaceButton: {
        width: 90,
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    nextButton: {
        width: 90,
        height: 200,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 70,
    },
    nextButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    nextButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
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
    successIconContainer: {
        marginBottom: 20,
    },
    successIconOuter: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: '#D6F5D9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIconMiddle: {
        width:  80,
        height: 80,
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
    successButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    closeSuccessButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeSuccessButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
    },
});

export default TransactionPinScreen;

