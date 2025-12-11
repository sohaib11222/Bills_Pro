import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NotificationOption {
    id: string;
    title: string;
    enabled: boolean;
}

const NotificationSettingsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    
    const [notifications, setNotifications] = useState<NotificationOption[]>([
        {
            id: 'general',
            title: 'General notification',
            enabled: true,
        },
        {
            id: 'deposit',
            title: 'Deposit notification',
            enabled: true,
        },
        {
            id: 'withdrawal',
            title: 'Withdrawal notification',
            enabled: true,
        },
    ]);

    const handleToggle = (id: string) => {
        setNotifications(
            notifications.map((notif) =>
                notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
            )
        );
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
                <ThemedText style={styles.headerTitle}>Notification Settings</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {notifications.map((notif) => (
                    <View key={notif.id} style={styles.notificationItem}>
                        <ThemedText style={styles.notificationTitle}>{notif.title}</ThemedText>
                        <Switch
                            value={notif.enabled}
                            onValueChange={() => handleToggle(notif.id)}
                            trackColor={{ false: '#D1D5DB', true: '#1B800F' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                ))}
            </ScrollView>
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
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 14,
        paddingVertical: 10,
        marginBottom: 12,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
});

export default NotificationSettingsScreen;

