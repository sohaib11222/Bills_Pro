import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    Image,
    Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SecuritySettingsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [biometricEnabled, setBiometricEnabled] = useState(true);

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
                <ThemedText style={styles.headerTitle}>Security</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Illustration Section */}
                <View style={styles.illustrationContainer}>
                    <Image
                        source={require('../../../assets/security_main.png')}
                        style={styles.illustrationImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Security Options */}
                <View style={styles.optionsSection}>
                    <TouchableOpacity
                        style={styles.optionItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('ResetPassword')}
                    >
                        <View style={styles.optionIconContainer}>
                            <Image
                                source={require('../../../assets/Lock.png')}
                                style={styles.optionIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.optionItemContent}>
                            <ThemedText style={styles.optionText}>Change Password</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('TransactionPin')}
                    >
                        <View style={styles.optionIconContainer}>
                            <Image
                                source={require('../../../assets/Password.png')}
                                style={styles.optionIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.optionItemContent}>
                            <ThemedText style={styles.optionText}>Transaction PIN</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Setup2FA')}
                    >
                        <View style={styles.optionIconContainer}>
                            <Image
                                source={require('../../../assets/ShieldCheck.png')}
                                style={styles.optionIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.optionItemContent}>
                            <ThemedText style={styles.optionText}>Setup 2FA</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.optionItem}>
                        <View style={styles.optionIconContainer}>
                            <Image
                                source={require('../../../assets/Vector (57).png')}
                                style={styles.optionIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.optionItemContent}>
                            <ThemedText style={styles.optionText}>Biometric login</ThemedText>
                            <Switch
                                value={biometricEnabled}
                                onValueChange={setBiometricEnabled}
                                trackColor={{ false: '#D1D5DB', true: '#1B800F' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Delete Account Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.deleteAccountButton} activeOpacity={0.7}>
                    <ThemedText style={styles.deleteAccountText}>Delete Account</ThemedText>
                </TouchableOpacity>
            </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 100,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    illustrationImage: {
        width: width - 40,
        height: 311,
        borderRadius: 12,
    },
    optionsSection: {
        paddingHorizontal: 20,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionIconContainer: {
        width: 63,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#42AC36',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    optionIconImage: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    },
    pinIcon: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    optionItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        marginLeft: -12,
        paddingLeft: 28,
        minHeight: 60,
    },
    optionText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    deleteAccountButton: {
        width: '100%',
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    deleteAccountText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
});

export default SecuritySettingsScreen;

