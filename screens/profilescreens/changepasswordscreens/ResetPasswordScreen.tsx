import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';
import { useForgotPassword } from '../../../mutations/authMutations';
import { useUserProfile } from '../../../queries/userQueries';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ResetPasswordScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const { data } = useUserProfile();
    const user = data?.data?.user;
    const [email, setEmail] = useState('');
    const forgotPasswordMutation = useForgotPassword();

    // Pre-populate email from user profile
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleProceed = async () => {
        const emailToUse = email.trim() || user?.email;
        
        if (!emailToUse) {
            Alert.alert('Error', 'Email address is required');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToUse)) {
            Alert.alert('Validation Error', 'Please enter a valid email address');
            return;
        }

        try {
            const result = await forgotPasswordMutation.mutateAsync({
                email: emailToUse,
            });

            if (result.success) {
                navigation.navigate('ResetPasswordCode', { email: emailToUse });
            } else {
                Alert.alert('Error', result.message || 'Failed to send reset code. Please try again.');
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error?.message || error?.data?.message || 'Failed to send reset code. Please try again.'
            );
        }
    };

    const isFormValid = () => {
        const emailToUse = email.trim() || user?.email;
        return emailToUse && emailToUse.includes('@');
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
                <ThemedText style={styles.headerTitle}>Reset Password</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.contentSection}>
                    <ThemedText style={styles.mainTitle}>Reset Password</ThemedText>
                    <ThemedText style={styles.subtitle}>Input your registered email</ThemedText>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email Address"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!!user?.email}
                        />
                        {user?.email && (
                            <ThemedText style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4, marginLeft: 4 }}>
                                Using your account email
                            </ThemedText>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Proceed Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        (!isFormValid() || forgotPasswordMutation.isPending) && styles.proceedButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleProceed}
                    disabled={!isFormValid() || forgotPasswordMutation.isPending}
                >
                    {forgotPasswordMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText
                            style={[
                                styles.proceedButtonText,
                                (!isFormValid() || forgotPasswordMutation.isPending) && styles.proceedButtonTextDisabled,
                            ]}
                        >
                            Proceed
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
    },
    input: {
        width: '100%',
        height: 60,
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
    },
    proceedButton: {
        width: '100%',
        height: 60,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    proceedButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    proceedButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    proceedButtonTextDisabled: {
        color: '#9CA3AF',
    },
});

export default ResetPasswordScreen;

