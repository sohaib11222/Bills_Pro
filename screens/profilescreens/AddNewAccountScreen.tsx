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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddNewAccountScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [makeDefault, setMakeDefault] = useState(false);

    const isFormValid = () => {
        return (
            bankName.trim() !== '' &&
            accountNumber.trim() !== '' &&
            accountName.trim() !== ''
        );
    };

    const handleSave = () => {
        if (isFormValid()) {
            // Handle save logic here
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
                <ThemedText style={styles.headerTitle}>Add New Account</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Input Fields */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={bankName}
                            onChangeText={setBankName}
                            placeholder="Bank name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            placeholder="Account Number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={accountName}
                            onChangeText={setAccountName}
                            placeholder="Account Name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Make Default Checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        activeOpacity={0.7}
                        onPress={() => setMakeDefault(!makeDefault)}
                    >
                        <View style={[styles.checkbox, makeDefault && styles.checkboxChecked]}>
                            {makeDefault && (
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            )}
                        </View>
                        <ThemedText style={styles.checkboxLabel}>Make default</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        !isFormValid() && styles.saveButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleSave}
                    disabled={!isFormValid()}
                >
                    <ThemedText
                        style={[
                            styles.saveButtonText,
                            !isFormValid() && styles.saveButtonTextDisabled,
                        ]}
                    >
                        Save
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
        paddingTop: 32,
        paddingBottom: 100,
    },
    inputSection: {
        paddingHorizontal: 20,
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#EFEFEF',
        padding: 13,
        paddingVertical: 10,
        borderRadius: 15,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: '#42AC36',
        borderColor: '#42AC36',
    },
    checkboxLabel: {
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
    saveButton: {
        width: '100%',
        height: 56,
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

export default AddNewAccountScreen;

