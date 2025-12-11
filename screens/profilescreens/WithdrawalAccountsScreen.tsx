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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Account {
    id: string;
    accountName: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    isDefault: boolean;
}

const WithdrawalAccountsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [accounts, setAccounts] = useState<Account[]>([
        {
            id: '1',
            accountName: 'Account 1',
            accountHolderName: 'Qamardeen Abdul Malik',
            bankName: 'Access Bank',
            accountNumber: '1234567890',
            isDefault: true,
        },
        {
            id: '2',
            accountName: 'Account 2',
            accountHolderName: 'Qamardeen Abdul Malik',
            bankName: 'Access Bank',
            accountNumber: '1234567890',
            isDefault: false,
        },
        {
            id: '3',
            accountName: 'Account 3',
            accountHolderName: 'Qamardeen Abdul Malik',
            bankName: 'Access Bank',
            accountNumber: '1234567890',
            isDefault: false,
        },
    ]);

    const handleDelete = (accountId: string) => {
        setAccounts(accounts.filter((acc) => acc.id !== accountId));
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
                <ThemedText style={styles.headerTitle}>Withdrawal Accounts</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Cards */}
                {accounts.map((account) => (
                    <View key={account.id} style={styles.accountCard}>
                        <View style={styles.accountCardHeader}>
                            <View style={styles.accountTitleRow}>
                                <Image
                                    source={require('../../assets/Bank (1).png')}
                                    style={styles.bankIcon}
                                    resizeMode="contain"
                                />
                                <ThemedText style={styles.accountName}>{account.accountName}</ThemedText>
                            </View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(account.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="trash-outline" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        
                        <ThemedText style={styles.accountHolderName}>{account.accountHolderName}</ThemedText>
                        
                        <View style={styles.accountDetailsRow}>
                            <ThemedText style={styles.bankName}>{account.bankName}</ThemedText>
                            <View style={styles.dot} />
                            <ThemedText style={styles.accountNumber}>{account.accountNumber}</ThemedText>
                        </View>

                        {account.isDefault && (
                            <View style={styles.defaultTag}>
                                <ThemedText style={styles.defaultTagText}>Default</ThemedText>
                            </View>
                        )}
                    </View>
                ))}

                {/* Information Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#111827" />
                    <ThemedText style={styles.infoText}>
                        To edit your account{' '}
                        <ThemedText style={styles.infoLink}>Contact Support</ThemedText>
                    </ThemedText>
                </View>
            </ScrollView>

            {/* Add New Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('AddNewAccount')}
                >
                    <ThemedText style={styles.addButtonText}>Add New</ThemedText>
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
        paddingHorizontal: 20,
    },
    accountCard: {
        backgroundColor: '#EFEFEF',
        borderRadius: 12,
        // padding: 16,
        marginBottom: 16,
        position: 'relative',
    },
    accountCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        backgroundColor: '#E0E0E0',
        padding: 13,
        paddingVertical:10,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    accountTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bankIcon: {
        width: 24,
        height: 24,
        tintColor: '#1B800F',
        marginRight: 8,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1B800F',
    },
    deleteButton: {
        padding: 4,
    },
    accountHolderName: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 8,
        paddingHorizontal: 13,
    },
    accountDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        paddingBottom: 20,
    },
    bankName: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#6B7280',
        marginHorizontal: 8,
    },
    accountNumber: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
    },
    defaultTag: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#00800026',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: '#008000',
    },
    defaultTagText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#008000',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFA50026',
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: '#FFA500',
        padding: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginLeft: 12,
    },
    infoLink: {
        color: '#FFA500',
        fontWeight: '500',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
      
    },
    addButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#42AC36',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
});

export default WithdrawalAccountsScreen;

