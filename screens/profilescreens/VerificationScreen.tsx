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
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useKyc } from '../../queries/kycQueries';
import { useSubmitKyc } from '../../mutations/kycMutations';
import { useUserProfile } from '../../queries/userQueries';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VerificationScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const { data: kycData, isLoading: isLoadingKyc, refetch: refetchKyc } = useKyc();
    const { data: userData } = useUserProfile();
    const submitKycMutation = useSubmitKyc();
    
    const kyc = kycData?.data?.kyc;
    const user = userData?.data?.user;
    
    // Determine verification status
    const isVerified = kyc?.status === 'approved';
    const isPending = kyc?.status === 'pending';
    const isRejected = kyc?.status === 'rejected';
    
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [bvnNumber, setBvnNumber] = useState('');
    const [ninNumber, setNinNumber] = useState('');

    // Load KYC data or user profile data into form
    useEffect(() => {
        if (kyc) {
            // Pre-populate with existing KYC data
            setFirstName(kyc.first_name || '');
            setLastName(kyc.last_name || '');
            setEmail(kyc.email || '');
            setDateOfBirth(kyc.date_of_birth ? formatDateForInput(kyc.date_of_birth) : '');
            setBvnNumber(kyc.bvn_number || '');
            setNinNumber(kyc.nin_number || '');
        } else if (user) {
            // Pre-populate with user profile data
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setEmail(user.email || '');
        }
    }, [kyc, user]);

    // Refetch KYC data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refetchKyc();
        }, [refetchKyc])
    );

    // Format date from API (YYYY-MM-DD) to display format (DD-MM-YYYY)
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Format date from input (DD-MM-YYYY) to API format (YYYY-MM-DD)
    const formatDateForAPI = (dateString: string) => {
        if (!dateString) return '';
        // Try to parse DD-MM-YYYY format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
        }
        // If already in YYYY-MM-DD format, return as is
        return dateString;
    };

    // Check if all required fields are filled
    const isFormValid = () => {
        if (isVerified) return true;
        return (
            firstName.trim() !== '' &&
            lastName.trim() !== '' &&
            email.trim() !== '' &&
            dateOfBirth.trim() !== '' &&
            bvnNumber.trim() !== '' &&
            ninNumber.trim() !== ''
        );
    };

    const handleProceed = async () => {
        if (isVerified) {
            // Already verified, navigate back
            navigation.goBack();
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Validation Error', 'Please enter a valid email address');
            return;
        }

        // Validate date format
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(dateOfBirth.trim())) {
            Alert.alert('Validation Error', 'Please enter date of birth in DD-MM-YYYY format');
            return;
        }

        try {
            const kycData = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
                date_of_birth: formatDateForAPI(dateOfBirth.trim()),
                bvn_number: bvnNumber.trim(),
                nin_number: ninNumber.trim(),
            };

            const result = await submitKycMutation.mutateAsync(kycData);

            if (result.success) {
                Alert.alert('Success', 'KYC information submitted successfully. Your verification is pending review.', [
                    { text: 'OK', onPress: () => {
                        refetchKyc();
                    }}
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to submit KYC information. Please try again.');
            }
        } catch (error: any) {
            console.error('KYC submission error:', error);
            const errorMessage = error?.response?.data?.message || 
                                error?.response?.data?.errors ? 
                                Object.values(error.response.data.errors).flat().join('\n') :
                                error?.message || 
                                'Failed to submit KYC information. Please try again.';
            Alert.alert('Error', errorMessage);
        }
    };

    if (isLoadingKyc) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#42AC36" />
            </View>
        );
    }

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
                <ThemedText style={styles.headerTitle}>Verification</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Information Banner */}
                {isVerified ? (
                    <View style={styles.verifiedBanner}>
                        <ThemedText style={styles.verifiedBannerText}>Account Verified</ThemedText>
                        <View style={styles.verifiedIconContainer}>
                            <Image
                                source={require('../../assets/image 41.png')}
                                style={styles.verifiedIcon}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                ) : isPending ? (
                    <View style={styles.pendingBanner}>
                        <ThemedText style={styles.pendingBannerTitle}>Verification Pending</ThemedText>
                        <ThemedText style={styles.pendingBannerSubtitle}>
                            Your KYC submission is under review. Please wait for approval.
                        </ThemedText>
                    </View>
                ) : isRejected ? (
                    <View style={styles.rejectedBanner}>
                        <ThemedText style={styles.rejectedBannerTitle}>Verification Rejected</ThemedText>
                        <ThemedText style={styles.rejectedBannerSubtitle}>
                            {kyc?.rejection_reason || 'Your KYC submission was rejected. Please update your information and try again.'}
                        </ThemedText>
                    </View>
                ) : (
                    <View style={styles.incompleteBanner}>
                        <ThemedText style={styles.incompleteBannerTitle}>Verification incomplete</ThemedText>
                        <ThemedText style={styles.incompleteBannerSubtitle}>
                            Complete your kyc to access all features
                        </ThemedText>
                    </View>
                )}

                {/* Input Fields */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First name"
                            placeholderTextColor="#9CA3AF"
                            editable={!isVerified}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last name"
                            placeholderTextColor="#9CA3AF"
                            editable={!isVerified}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email Address"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isVerified}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={dateOfBirth}
                            onChangeText={setDateOfBirth}
                            placeholder="Date of birth (DD-MM-YYYY)"
                            placeholderTextColor="#9CA3AF"
                            editable={!isVerified}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                        <TouchableOpacity
                            style={styles.inputIcon}
                            activeOpacity={0.7}
                            disabled={isVerified}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={bvnNumber}
                            onChangeText={setBvnNumber}
                            placeholder="BVN Number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            editable={!isVerified}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={ninNumber}
                            onChangeText={setNinNumber}
                            placeholder="NIN Number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            editable={!isVerified}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Proceed Button */}
            {!isVerified && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.proceedButton,
                            (!isFormValid() || submitKycMutation.isPending) && styles.proceedButtonDisabled,
                        ]}
                        activeOpacity={0.8}
                        onPress={handleProceed}
                        disabled={!isFormValid() || submitKycMutation.isPending}
                    >
                        {submitKycMutation.isPending ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ThemedText
                                style={[
                                    styles.proceedButtonText,
                                    (!isFormValid() || submitKycMutation.isPending) && styles.proceedButtonTextDisabled,
                                ]}
                            >
                                {isPending ? 'Update KYC' : 'Submit KYC'}
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                </View>
            )}
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
        paddingHorizontal: 20,
        paddingTop: 40,
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
    incompleteBanner: {
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 24,
        borderWidth: 0.5,
        borderColor: '#000',
    },
    incompleteBannerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    incompleteBannerSubtitle: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
    },
    pendingBanner: {
        backgroundColor: '#FEF3C7',
        borderRadius: 15,
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 24,
        borderWidth: 0.5,
        borderColor: '#F59E0B',
    },
    pendingBannerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#92400E',
        marginBottom: 4,
    },
    pendingBannerSubtitle: {
        fontSize: 8,
        fontWeight: '400',
        color: '#92400E',
    },
    rejectedBanner: {
        backgroundColor: '#FEE2E2',
        borderRadius: 15,
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 24,
        borderWidth: 0.5,
        borderColor: '#DC2626',
    },
    rejectedBannerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#991B1B',
        marginBottom: 4,
    },
    rejectedBannerSubtitle: {
        fontSize: 8,
        fontWeight: '400',
        color: '#991B1B',
    },
    verifiedBanner: {
        backgroundColor: '#008000',
        borderRadius: 15,
        padding: 13,
        paddingVertical:7,
        marginHorizontal: 20,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    verifiedBannerText: {
        fontSize:  14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    verifiedIconContainer: {
        // backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
       
    },
    verifiedIcon: {
        width: 54,
        height: 54,
        // tintColor: '#1B800F',
    },
    inputSection: {
        paddingHorizontal: 20,
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
    inputIcon: {
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
    proceedButton: {
        width: '100%',
        height: 56,
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

export default VerificationScreen;

