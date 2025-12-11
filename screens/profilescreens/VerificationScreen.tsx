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
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VerificationScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [isVerified, setIsVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [bvnNumber, setBvnNumber] = useState('');
    const [ninNumber, setNinNumber] = useState('');
    const [password, setPassword] = useState('');

    // Verified state values
    const verifiedData = {
        firstName: 'Abdul malik',
        lastName: 'Qamardeen',
        email: 'qamardeenabdulmalik@gmail.com',
        dateOfBirth: '01-01-2024',
        bvnNumber: '123456789',
        ninNumber: '123456789',
    };

    // Check if all fields are filled
    const isFormValid = () => {
        if (isVerified) return true;
        return (
            firstName.trim() !== '' &&
            lastName.trim() !== '' &&
            email.trim() !== '' &&
            dateOfBirth.trim() !== '' &&
            bvnNumber.trim() !== '' &&
            ninNumber.trim() !== '' &&
            password.trim() !== ''
        );
    };

    const handleProceed = () => {
        if (!isVerified) {
            // Validate and submit, then set verified
            setIsVerified(true);
            setFirstName(verifiedData.firstName);
            setLastName(verifiedData.lastName);
            setEmail(verifiedData.email);
            setDateOfBirth(verifiedData.dateOfBirth);
            setBvnNumber(verifiedData.bvnNumber);
            setNinNumber(verifiedData.ninNumber);
        } else {
            // Already verified, can navigate back or do something else
            navigation.goBack();
        }
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
                <ThemedText style={styles.headerTitle}>Verification</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
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
                            placeholder="Date of birth"
                            placeholderTextColor="#9CA3AF"
                            editable={!isVerified}
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

                    {!isVerified && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.inputIcon}
                                activeOpacity={0.7}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Proceed Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        !isFormValid() && styles.proceedButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleProceed}
                    disabled={!isFormValid()}
                >
                    <ThemedText
                        style={[
                            styles.proceedButtonText,
                            !isFormValid() && styles.proceedButtonTextDisabled,
                        ]}
                    >
                        Proceed
                    </ThemedText>
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

