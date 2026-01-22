import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';
import { useChatSessions, useActiveChatSession } from '../../../queries/chatQueries';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ChatStatus = 'all' | 'pending' | 'resolved';

const LiveChatScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [selectedTab, setSelectedTab] = useState<ChatStatus>('all');

    // Fetch chat sessions
    const { data: sessionsData, isLoading, isError, refetch } = useChatSessions(20);
    const { data: activeSessionData } = useActiveChatSession();

    const sessions = sessionsData?.data?.data || [];
    const activeSession = activeSessionData?.data;

    // Filter sessions based on selected tab
    const filteredSessions = sessions.filter((session: any) => {
        if (selectedTab === 'all') return true;
        if (selectedTab === 'pending') {
            return session.status === 'waiting' || session.status === 'active';
        }
        if (selectedTab === 'resolved') {
            return session.status === 'closed';
        }
        return true;
    });

    const handleNewChat = () => {
        // Check if user has active session
        if (activeSession) {
            Alert.alert(
                'Active Chat Exists',
                'You already have an active chat session. Please close it before starting a new one.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Active Chat',
                        onPress: () => navigation.navigate('ChatDetails', { chatId: activeSession.id.toString() }),
                    },
                ]
            );
            return;
        }
        
        // Navigate to new chat (no chatId means start new chat)
        navigation.navigate('ChatDetails', { chatId: undefined });
    };

    const handleOpenChat = (sessionId: number) => {
        // Convert sessionId (number) to chatId (string) as expected by navigation
        navigation.navigate('ChatDetails', { chatId: sessionId.toString() });
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
            }) + ' - ' + date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return dateString;
        }
    };

    const getIssueTypeDisplay = (issueType: string) => {
        if (!issueType) return 'General issue';
        return issueType.replace('_issue', '').replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
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
                <ThemedText style={styles.headerTitle}>Support</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#42AC36" />
                    <ThemedText style={styles.loadingText}>Loading chat sessions...</ThemedText>
                </View>
            ) : isError ? (
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Failed to load chat sessions</ThemedText>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetch()}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* New Chat Button */}
                    <TouchableOpacity
                        style={styles.newChatButton}
                        onPress={handleNewChat}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={24} color="#00000080" />
                        <ThemedText style={styles.newChatText}>New Chat</ThemedText>
                    </TouchableOpacity>

                    {/* Chat Category Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                selectedTab === 'all' && styles.tabActive,
                            ]}
                            onPress={() => setSelectedTab('all')}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                style={[
                                    styles.tabText,
                                    selectedTab === 'all' && styles.tabTextActive,
                                ]}
                            >
                                All
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tab,
                                selectedTab === 'pending' && styles.tabActive,
                            ]}
                            onPress={() => setSelectedTab('pending')}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                style={[
                                    styles.tabText,
                                    selectedTab === 'pending' && styles.tabTextActive,
                                ]}
                            >
                                Pending
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tab,
                                selectedTab === 'resolved' && styles.tabActive,
                            ]}
                            onPress={() => setSelectedTab('resolved')}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                style={[
                                    styles.tabText,
                                    selectedTab === 'resolved' && styles.tabTextActive,
                                ]}
                            >
                                Resolved
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Chat List */}
                    {filteredSessions.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>No chat sessions found</ThemedText>
                        </View>
                    ) : (
                        <View style={styles.chatList}>
                            {filteredSessions.map((session: any) => {
                                const adminName = session.admin?.name || session.admin?.first_name || 'Admin';
                                const issueType = getIssueTypeDisplay(session.issue_type || 'general');
                                const status = session.status === 'closed' ? 'resolved' : 'pending';
                                const date = formatDate(session.last_message_at || session.created_at);

                                return (
                                    <View
                                        key={session.id}
                                        style={[
                                            styles.chatCard,
                                            status === 'resolved'
                                                ? styles.chatCardResolved
                                                : styles.chatCardPending,
                                        ]}
                                    >
                                        <View style={styles.chatLeft}>
                                            <View style={styles.chatIconContainer}>
                                                <Image
                                                    source={require('../../../assets/Headset (1).png')}
                                                    style={styles.chatIcon}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                            <View style={styles.chatInfo}>
                                                <ThemedText style={styles.chatInfoLabel}>
                                                    Agent Name : <ThemedText style={styles.chatInfoValue}>{adminName}</ThemedText>
                                                </ThemedText>
                                                <ThemedText style={styles.chatInfoLabel}>
                                                    Issue : <ThemedText style={styles.chatIssue}>{issueType}</ThemedText>
                                                </ThemedText>
                                                <ThemedText style={styles.chatInfoLabel}>
                                                    Date : <ThemedText style={styles.chatInfoValue}>{date}</ThemedText>
                                                </ThemedText>
                                            </View>
                                        </View>
                                        <View style={styles.chatRight}>
                                            <TouchableOpacity
                                                style={styles.openChatButton}
                                                onPress={() => handleOpenChat(session.id)}
                                                activeOpacity={0.7}
                                            >
                                                <ThemedText style={styles.openChatButtonText}>Open Chat</ThemedText>
                                            </TouchableOpacity>
                                           
                                            <View
                                                style={[
                                                    styles.statusTag,
                                                    status === 'resolved'
                                                        ? styles.statusTagResolved
                                                        : styles.statusTagPending,
                                                ]}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.statusTagText,
                                                        status === 'resolved'
                                                            ? styles.statusTagTextResolved
                                                            : styles.statusTagTextPending,
                                                    ]}
                                                >
                                                    {status === 'resolved' ? 'Resolved' : 'Pending'}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            )}
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
        paddingBottom: 40,
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    newChatText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#00000080',
        marginLeft: 12,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#EFEFEF',
        borderRadius: 100,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 100,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#1B800F',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#9CA3AF',
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontWeight: '400',
    },
    chatList: {
        gap: 16,
    },
    chatCard: {
        flexDirection: 'row',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
    },
    chatCardPending: {
        backgroundColor: '#FFA50026',
    },
    chatCardResolved: {
        backgroundColor: '#00800026',
    },
    chatLeft: {
        // flexDirection: 'row',
        flex: 1,
    },
    chatIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 30,
        backgroundColor: '#00800026',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    chatIcon: {
        width: 24,
        height: 24,
        tintColor: '#1B800F',
    },
    chatInfo: {
        flex: 1,
        marginTop:10,
    },
    chatInfoLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9CA3AF',
        marginBottom: 4,
    },
    chatInfoValue: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    chatIssue: {
        fontSize: 14,
            fontWeight: '400',
        color: '#111827',
    },
    chatRight: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    openChatButton: {
        backgroundColor: '#42AC36',
        borderRadius: 100,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 8,
    },
    openChatButtonText: {
        fontSize: 10,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    statusTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 0.3,
    },
    statusTagPending: {
        backgroundColor: '#FFA50026',
        borderColor: '#FFA500',
    },
    statusTagResolved: {
        backgroundColor: '#00800026',
        borderColor: '#008000',
    },
    statusTagText: {
        fontSize: 8,
        fontWeight: '400',
    },
    statusTagTextPending: {
        color: '#FFA500',
    },
    statusTagTextResolved: {
        color: '#008000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
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
        paddingVertical: 40,
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
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9CA3AF',
    },
});

export default LiveChatScreen;

