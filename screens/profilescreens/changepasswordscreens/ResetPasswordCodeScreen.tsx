import React, { useState, useEffect, useRef } from 'react';
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
import { useVerifyPasswordResetOtp, useResendOtp } from '../../../mutations/authMutations';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResetPasswordCodeRouteProp = RouteProp<RootStackParamList, 'ResetPasswordCode'>;

const ResetPasswordCodeScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ResetPasswordCodeRouteProp>();
    const { email } = route.params || { email: '' };
    
    const [code, setCode] = useState(['', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const verifyOtpMutation = useVerifyPasswordResetOtp();
    const resendMutation = useResendOtp();

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleCodeChange = (text: string, index: number) => {
        if (text.length > 1) return;
        
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const isCodeComplete = () => {
        return code.every((digit) => digit !== '');
    };

    const handleProceed = async () => {
        const otp = code.join('');
        
        if (otp.length !== 5) {
            Alert.alert('Error', 'Please enter the complete 5-digit code');
            return;
        }

        if (!email) {
            Alert.alert('Error', 'Email address is required');
            return;
        }

        try {
            const result = await verifyOtpMutation.mutateAsync({
                email: email,
                otp: otp,
            });

            if (result.success) {
                navigation.navigate('NewPassword', { email: email, otp: otp });
            } else {
                Alert.alert('Verification Failed', result.message || 'Invalid OTP. Please try again.');
                setCode(['', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            Alert.alert(
                'Verification Failed',
                error?.message || error?.data?.message || 'Invalid or expired OTP. Please try again.'
            );
            setCode(['', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) {
            Alert.alert('Please Wait', `You can resend code in ${timeLeft} seconds`);
            return;
        }

        if (!email) {
            Alert.alert('Error', 'Email address is required');
            return;
        }

        setIsResending(true);
        try {
            const result = await resendMutation.mutateAsync({
                email: email,
                type: 'email',
            });

            if (result.success) {
                Alert.alert('Success', 'OTP has been resent to your email');
                setTimeLeft(59);
                setCanResend(false);
                setCode(['', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                Alert.alert('Error', result.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error?.message || error?.data?.message || 'Failed to resend OTP. Please try again.'
            );
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} sec`;
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
                    <ThemedText style={styles.subtitle}>
                        Enter the 5-digit code sent to {email || 'your email'}
                    </ThemedText>

                    {/* Code Input Fields */}
                    <View style={styles.codeContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputRefs.current[index] = ref;
                                }}
                                style={styles.codeInput}
                                value={digit}
                                onChangeText={(text) => handleCodeChange(text, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Resend Code */}
                    <View style={styles.resendContainer}>
                        {timeLeft > 0 ? (
                            <ThemedText style={styles.resendText}>
                                You can resend code in{' '}
                                <ThemedText style={styles.resendTimer}>{formatTime(timeLeft)}</ThemedText>
                            </ThemedText>
                        ) : (
                            <TouchableOpacity 
                                onPress={handleResend} 
                                activeOpacity={0.7}
                                disabled={isResending || resendMutation.isPending}
                            >
                                {isResending || resendMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#1B800F" />
                                ) : (
                                    <ThemedText style={styles.resendLink}>Resend code</ThemedText>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Proceed Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        (!isCodeComplete() || verifyOtpMutation.isPending) && styles.proceedButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleProceed}
                    disabled={!isCodeComplete() || verifyOtpMutation.isPending}
                >
                    {verifyOtpMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText
                            style={[
                                styles.proceedButtonText,
                                (!isCodeComplete() || verifyOtpMutation.isPending) && styles.proceedButtonTextDisabled,
                            ]}
                        >
                            Verify
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
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    codeInput: {
        width: (width - 80) / 5,
        height: 56,
        backgroundColor: '#EFEFEF',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '500',
        color: '#111827',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    resendText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280',
    },
    resendTimer: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1B800F',
    },
    resendLink: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1B800F',
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

export default ResetPasswordCodeScreen;

