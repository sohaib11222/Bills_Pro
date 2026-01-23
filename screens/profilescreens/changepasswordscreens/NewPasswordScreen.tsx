import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    KeyboardAvoidingView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';
import { useResetPassword } from '../../../mutations/authMutations';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type NewPasswordRouteProp = RouteProp<RootStackParamList, 'NewPassword'>;

const NewPasswordScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<NewPasswordRouteProp>();
    const email = route.params?.email || '';
    const otp = route.params?.otp || '';
    const [newPassword, setNewPassword] = useState('');
    const [reenterPassword, setReenterPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showReenterPassword, setShowReenterPassword] = useState(false);
    const resetPasswordMutation = useResetPassword();

    const isFormValid = () => {
        return (
            newPassword.trim() !== '' &&
            reenterPassword.trim() !== '' &&
            newPassword === reenterPassword &&
            newPassword.length >= 6
        );
    };

    const handleSave = async () => {
        if (!newPassword.trim()) {
            Alert.alert('Error', 'Please enter a password');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Validation Error', 'Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== reenterPassword) {
            Alert.alert('Validation Error', 'Passwords do not match');
            return;
        }

        if (!email || !otp) {
            Alert.alert('Error', 'Missing email or OTP. Please start the reset process again.');
            navigation.navigate('ResetPassword');
            return;
        }

        try {
            const result = await resetPasswordMutation.mutateAsync({
                email: email,
                otp: otp,
                password: newPassword,
                password_confirmation: reenterPassword,
            });

            if (result.success) {
                Alert.alert('Success', 'Password changed successfully', [
                    { text: 'OK', onPress: () => navigation.navigate('Main') }
                ]);
            } else {
                Alert.alert('Reset Failed', result.message || 'Failed to reset password. Please try again.');
            }
        } catch (error: any) {
            if (error?.data?.errors) {
                const errorMessages = Object.values(error.data.errors).flat().join('\n');
                Alert.alert('Reset Failed', errorMessages);
            } else {
                Alert.alert(
                    'Reset Failed',
                    error?.message || error?.data?.message || 'Failed to reset password. Please try again.'
                );
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
                <ThemedText style={styles.headerTitle}>New Password</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.contentSection}>
                    <ThemedText style={styles.mainTitle}>New Password</ThemedText>
                    <ThemedText style={styles.subtitle}>Enter your new password</ThemedText>

                    {/* New Password Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="New Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowNewPassword(!showNewPassword)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Reenter Password Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={reenterPassword}
                            onChangeText={setReenterPassword}
                            placeholder="Reenter Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showReenterPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowReenterPassword(!showReenterPassword)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={showReenterPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!isFormValid() || resetPasswordMutation.isPending) && styles.saveButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleSave}
                    disabled={!isFormValid() || resetPasswordMutation.isPending}
                >
                    {resetPasswordMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText
                            style={[
                                styles.saveButtonText,
                                (!isFormValid() || resetPasswordMutation.isPending) && styles.saveButtonTextDisabled,
                            ]}
                        >
                            Save
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        paddingTop: 32,
        paddingBottom: 100,
    },
    contentSection: {
        paddingHorizontal: 20,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    input: {
        width: '100%',
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingRight: 50,
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 18,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
    },
    saveButton: {
        width: '100%',
        height: 60,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    saveButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    saveButtonTextDisabled: {
        color: '#9CA3AF',
    },
});

export default NewPasswordScreen;

