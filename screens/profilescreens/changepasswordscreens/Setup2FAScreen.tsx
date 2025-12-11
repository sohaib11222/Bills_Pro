import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Modal,
    Pressable,
    Platform,
    StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Setup2FAScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [twoFACode, setTwoFACode] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const authenticatorCode = 'AW213CFJDK2R';

    const handleCopyCode = () => {
        // Copy to clipboard functionality would go here
        // For now, just a placeholder
    };

    const handlePaste = () => {
        // Paste functionality would go here
        // For now, just a placeholder
    };

    const handleComplete = () => {
        if (twoFACode.trim() !== '') {
            setShowSuccessModal(true);
        }
    };

    const handleCloseSuccessModal = () => {
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
                <ThemedText style={styles.headerTitle}>Setup 2FA</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Title and Instructions */}
                <View style={styles.titleSection}>
                    <ThemedText style={styles.mainTitle}>Setup 2FA</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Setup your 2FA from your authenticator app
                    </ThemedText>
                </View>

                {/* Authenticator Code Display */}
                <View style={styles.authenticatorCodeContainer}>
                    <ThemedText style={styles.authenticatorCodeLabel}>Authenticator Code</ThemedText>
                    <View style={styles.authenticatorCodeRow}>
                        <ThemedText style={styles.authenticatorCodeText}>{authenticatorCode}</ThemedText>
                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={handleCopyCode}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2FA Code Input Field */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 2FA Code"
                            placeholderTextColor="#9CA3AF"
                            value={twoFACode}
                            onChangeText={setTwoFACode}
                            keyboardType="default"
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            style={styles.pasteButton}
                            onPress={handlePaste}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.pasteButtonText}>Paste</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Complete Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.completeButton,
                        twoFACode.trim() === '' && styles.completeButtonDisabled,
                    ]}
                    onPress={handleComplete}
                    disabled={twoFACode.trim() === ''}
                    activeOpacity={0.8}
                >
                    <ThemedText
                        style={[
                            styles.completeButtonText,
                            twoFACode.trim() === '' && styles.completeButtonTextDisabled,
                        ]}
                    >
                        Complete
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseSuccessModal}
            >
                <Pressable style={styles.modalOverlay} onPress={handleCloseSuccessModal}>
                    <Pressable
                        style={styles.successModalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
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
                            Your 2FA has been setup successfully
                        </ThemedText>
                        <View style={styles.successButtons}>
                            <TouchableOpacity
                                style={styles.closeSuccessButton}
                                onPress={handleCloseSuccessModal}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    titleSection: {
        marginTop: 24,
        marginBottom: 32,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
        lineHeight: 20,
    },
    authenticatorCodeContainer: {
        backgroundColor: '#1B800F',
        borderRadius: 15,
        padding: 20,
        marginBottom: 24,
    },
    authenticatorCodeLabel: {
        fontSize: 8,
        fontWeight: '400',
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 12,
        textAlign: 'center',
    },
    authenticatorCodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    authenticatorCodeText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    copyButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        // backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputSection: {
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    pasteButton: {
        paddingHorizontal: 12,
        paddingVertical: 11,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#1B800F',
        backgroundColor: '#fff',
    },
    pasteButtonText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#1B800F',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
    },
    completeButton: {
        width: '100%',
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    completeButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    completeButtonTextDisabled: {
        color: '#9CA3AF',
    },
    // Modal Styles
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
        width: 80,
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

export default Setup2FAScreen;

