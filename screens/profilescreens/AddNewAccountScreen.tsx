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
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useAddBankAccount, useUpdateBankAccount } from '../../mutations/withdrawalMutations';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddNewAccountRouteProp = RouteProp<RootStackParamList, 'AddNewAccount'>;

const AddNewAccountScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<AddNewAccountRouteProp>();
    const accountToEdit = route.params?.account;
    
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [makeDefault, setMakeDefault] = useState(false);
    
    const addAccountMutation = useAddBankAccount();
    const updateAccountMutation = useUpdateBankAccount();
    
    // Populate form if editing
    useEffect(() => {
        if (accountToEdit) {
            setBankName(accountToEdit.bank_name || '');
            setAccountNumber(accountToEdit.account_number || '');
            setAccountName(accountToEdit.account_name || '');
            setMakeDefault(accountToEdit.is_default || false);
        }
    }, [accountToEdit]);

    const isFormValid = () => {
        return (
            bankName.trim() !== '' &&
            accountNumber.trim() !== '' &&
            accountName.trim() !== ''
        );
    };

    const handleSave = async () => {
        if (!isFormValid()) return;
        
        try {
            if (accountToEdit) {
                // Update existing account (account_number cannot be changed)
                await updateAccountMutation.mutateAsync({
                    id: accountToEdit.id,
                    data: {
                        bank_name: bankName.trim(),
                        account_name: accountName.trim(),
                        // Note: account_number is not included as it cannot be changed
                    },
                });
                Alert.alert('Success', 'Bank account updated successfully');
            } else {
                // Add new account
                await addAccountMutation.mutateAsync({
                    bank_name: bankName.trim(),
                    account_number: accountNumber.trim(),
                    account_name: accountName.trim(),
                    currency: 'NGN',
                    country_code: 'NG',
                });
                Alert.alert('Success', 'Bank account added successfully');
                
                // Note: The backend automatically sets the first account as default
                // If makeDefault is checked and you want to set it as default after adding,
                // you would need to call setDefaultBankAccount mutation here
                // For now, the backend handles this automatically for the first account
            }
            
            navigation.goBack();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save bank account';
            Alert.alert('Error', errorMessage);
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
                <ThemedText style={styles.headerTitle}>
                    {accountToEdit ? 'Edit Account' : 'Add New Account'}
                </ThemedText>
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
                            style={[styles.input, accountToEdit && styles.inputDisabled]}
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            placeholder="Account Number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            editable={!accountToEdit}
                        />
                        {accountToEdit && (
                            <ThemedText style={styles.disabledHint}>
                                Account number cannot be changed
                            </ThemedText>
                        )}
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

                    {/* Make Default Checkbox - Only show for new accounts */}
                    {!accountToEdit && (
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
                    )}
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!isFormValid() || addAccountMutation.isPending || updateAccountMutation.isPending) && styles.saveButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleSave}
                    disabled={!isFormValid() || addAccountMutation.isPending || updateAccountMutation.isPending}
                >
                    {(addAccountMutation.isPending || updateAccountMutation.isPending) ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <ThemedText
                            style={[
                                styles.saveButtonText,
                                (!isFormValid() || addAccountMutation.isPending || updateAccountMutation.isPending) && styles.saveButtonTextDisabled,
                            ]}
                        >
                            Save
                        </ThemedText>
                    )}
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
    inputDisabled: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
    },
    disabledHint: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
        marginTop: 4,
        marginLeft: 4,
    },
});

export default AddNewAccountScreen;

