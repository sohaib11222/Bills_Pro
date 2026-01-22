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
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useBankAccounts } from '../../queries/withdrawalQueries';
import {
    useDeleteBankAccount,
    useSetDefaultBankAccount,
} from '../../mutations/withdrawalMutations';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WithdrawalAccountsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const { data: accountsData, isLoading, isError, refetch } = useBankAccounts();
    const deleteAccountMutation = useDeleteBankAccount();
    const setDefaultMutation = useSetDefaultBankAccount();
    
    const accounts = accountsData?.data || [];

    // Handle pull to refresh
    const onRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDelete = (accountId: number) => {
        Alert.alert(
            'Delete Bank Account',
            'Are you sure you want to delete this bank account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccountMutation.mutateAsync(accountId);
                            Alert.alert('Success', 'Bank account deleted successfully');
                            refetch();
                        } catch (error: any) {
                            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete bank account';
                            Alert.alert('Error', errorMessage);
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefault = async (accountId: number) => {
        try {
            await setDefaultMutation.mutateAsync(accountId);
            Alert.alert('Success', 'Default account updated successfully');
            refetch();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to set default account';
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
                <ThemedText style={styles.headerTitle}>Withdrawal Accounts</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#42AC36"
                        colors={['#42AC36']}
                    />
                }
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#42AC36" />
                        <ThemedText style={styles.loadingText}>Loading accounts...</ThemedText>
                    </View>
                ) : isError ? (
                    <View style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>Failed to load accounts</ThemedText>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => refetch()}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : accounts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>No bank accounts found</ThemedText>
                        <ThemedText style={styles.emptySubtext}>Add your first bank account to start withdrawing</ThemedText>
                    </View>
                ) : (
                    <>
                        {/* Account Cards */}
                        {accounts.map((account: any) => (
                            <View key={account.id} style={styles.accountCard}>
                                <View style={styles.accountCardHeader}>
                                    <View style={styles.accountTitleRow}>
                                        <Image
                                            source={require('../../assets/Bank (1).png')}
                                            style={styles.bankIcon}
                                            resizeMode="contain"
                                        />
                                        <ThemedText style={styles.accountName}>{account.bank_name}</ThemedText>
                                    </View>
                                    <View style={styles.headerActions}>
                                        {!account.is_default && (
                                            <TouchableOpacity
                                                style={styles.setDefaultButton}
                                                onPress={() => handleSetDefault(account.id)}
                                                activeOpacity={0.7}
                                            >
                                                <ThemedText style={styles.setDefaultButtonText}>Set Default</ThemedText>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => navigation.navigate('AddNewAccount', { account })}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="pencil-outline" size={18} color="#42AC36" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDelete(account.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#6B7280" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                                <ThemedText style={styles.accountHolderName}>{account.account_name}</ThemedText>
                                
                                <View style={styles.accountDetailsRow}>
                                    <ThemedText style={styles.bankName}>{account.bank_name}</ThemedText>
                                    <View style={styles.dot} />
                                    <ThemedText style={styles.accountNumber}>{account.account_number}</ThemedText>
                                </View>

                                {account.is_default && (
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
                                Tap the edit icon to modify account details or{' '}
                                <ThemedText style={styles.infoLink}>Contact Support</ThemedText>
                            </ThemedText>
                        </View>
                    </>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#42AC36',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280',
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    setDefaultButton: {
        backgroundColor: '#42AC36',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    setDefaultButtonText: {
        fontSize: 10,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    editButton: {
        padding: 4,
    },
});

export default WithdrawalAccountsScreen;

