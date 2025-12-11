import React, { useState } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatDetailsRouteProp = RouteProp<RootStackParamList, 'ChatDetails'>;

type IssueType = 'fiat' | 'virtual_card' | 'crypto';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
}

const ChatDetailsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ChatDetailsRouteProp>();
    const chatId = route.params?.chatId;

    // If chatId exists, load existing chat data; otherwise start fresh
    const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(
        chatId ? 'crypto' : null
    );
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>(
        chatId
            ? [
                  {
                      id: '1',
                      text: 'I have issue with crypto',
                      isUser: true,
                      timestamp: '07:22 AM - Sent',
                  },
                  {
                      id: '2',
                      text: 'Sorry for the inconvenience, can you describe your issue in detail',
                      isUser: false,
                      timestamp: '07:22 AM - Sent',
                  },
              ]
            : []
    );

    const handleIssueSelect = (issue: IssueType) => {
        setSelectedIssue(issue);
        // Auto-send message when issue is selected
        if (messages.length === 0) {
            const issueMessage: Message = {
                id: Date.now().toString(),
                text: `I have issue with ${issue === 'fiat' ? 'fiat' : issue === 'virtual_card' ? 'virtual card' : 'crypto'}`,
                isUser: true,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }) + ' - Sent',
            };
            setMessages([issueMessage]);
            
            // Simulate admin response after a delay
            setTimeout(() => {
                const adminResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    text: 'Sorry for the inconvenience, can you describe your issue in detail',
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }) + ' - Sent',
                };
                setMessages([issueMessage, adminResponse]);
            }, 1000);
        }
    };

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: message.trim(),
                isUser: true,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }) + ' - Sent',
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
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
                
                <View style={styles.headerContact}>
                    <View style={styles.headerAvatar}>
                        <Image
                            source={require('../../../assets/Headset (1).png')}
                            style={styles.headerAvatarIcon}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.headerContactInfo}>
                        <ThemedText style={styles.headerContactName}>Admin</ThemedText>
                        <ThemedText style={styles.headerContactStatus}>Online</ThemedText>
                    </View>
                </View>
                
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Issue Selection Section */}
                <View style={styles.issueSelectionContainer}>
                    <ThemedText style={styles.issueSelectionLabel}>Select Issue</ThemedText>
                    <View style={styles.issueButtonsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.issueButton,
                                selectedIssue === 'fiat' && styles.issueButtonSelected,
                            ]}
                            onPress={() => handleIssueSelect('fiat')}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                style={[
                                    styles.issueButtonText,
                                    selectedIssue === 'fiat' && styles.issueButtonTextSelected,
                                ]}
                            >
                                Fiat issue
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.issueButton,
                                selectedIssue === 'virtual_card' && styles.issueButtonSelected,
                            ]}
                            onPress={() => handleIssueSelect('virtual_card')}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                style={[
                                    styles.issueButtonText,
                                    selectedIssue === 'virtual_card' && styles.issueButtonTextSelected,
                                ]}
                            >
                                Virtual card issue
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.issueButton,
                                selectedIssue === 'crypto' && styles.issueButtonSelected,
                            ]}
                            onPress={() => handleIssueSelect('crypto')}
                            activeOpacity={0.7}
                        >
                            <ThemedText
                                style={[
                                    styles.issueButtonText,
                                    selectedIssue === 'crypto' && styles.issueButtonTextSelected,
                                ]}
                            >
                                Crypto issue
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chat Messages */}
                <View style={styles.messagesContainer}>
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageWrapper,
                                msg.isUser ? styles.messageWrapperUser : styles.messageWrapperAdmin,
                            ]}
                        >
                            <View
                                style={[
                                    styles.messageBubble,
                                    msg.isUser ? styles.messageBubbleUser : styles.messageBubbleAdmin,
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.messageText,
                                        msg.isUser ? styles.messageTextUser : styles.messageTextAdmin,
                                    ]}
                                >
                                    {msg.text}
                                </ThemedText>
                            </View>
                            <ThemedText style={styles.messageTimestamp}>{msg.timestamp}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* Waiting Divider */}
                {messages.length > 0 && (
                    <View style={styles.waitingDivider}>
                        <View style={styles.waitingDividerLine} />
                        <ThemedText style={styles.waitingDividerText}>Waiting for Admin</ThemedText>
                        <View style={styles.waitingDividerLine} />
                    </View>
                )}
            </ScrollView>

            {/* Message Input Field */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachmentButton} activeOpacity={0.7}>
                    <Image
                        source={require('../../../assets/Paperclip.png')}
                        style={styles.attachmentIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Type message"
                    placeholderTextColor="#9CA3AF"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    activeOpacity={0.7}
                    disabled={message.trim() === ''}
                >
                    <Image
                        source={require('../../../assets/PaperPlaneRight.png')}
                        style={[
                            styles.sendIcon,
                            message.trim() === '' && styles.sendIconDisabled,
                        ]}
                        resizeMode="contain"
                    />
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 15,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContact: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#00800026',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerAvatarIcon: {
        width: 20,
        height: 20,
        tintColor: '#008000',
    },
    headerContactInfo: {
        flex: 1,
    },
    headerContactName: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 2,
    },
    headerContactStatus: {
        fontSize: 8,
        fontWeight: '400',
        color: '#1B800F',
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
        paddingBottom: 20,
    },
    issueSelectionContainer: {
        backgroundColor: '#EFEFEF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 24,
    },
    issueSelectionLabel: {
        fontSize: 10,
        fontWeight: '400',
        color: '#6B7280',
        marginBottom: 12,
    },
    issueButtonsContainer: {
        gap: 12,
    },
    issueButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 12,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    issueButtonSelected: {
        borderColor: '#42AC36',
    },
    issueButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    issueButtonTextSelected: {
        fontWeight: '400',
    },
    messagesContainer: {
        marginBottom: 16,
    },
    messageWrapper: {
        marginBottom: 16,
    },
    messageWrapperUser: {
        alignItems: 'flex-end',
    },
    messageWrapperAdmin: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: width * 0.7,
        borderRadius: 100,
        padding: 14,
        marginBottom: 4,
    },
    messageBubbleUser: {
        backgroundColor: '#42AC36',
    },
    messageBubbleAdmin: {
        backgroundColor: '#EFEFEF',
    },
    messageText: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    messageTextUser: {
        color: '#FFFFFF',
    },
    messageTextAdmin: {
        color: '#111827',
    },
    messageTimestamp: {
        fontSize: 7,
        fontWeight: '400',
        color: '#9CA3AF',
        marginTop: 4,
    },
    waitingDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    waitingDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    waitingDividerText: {
        fontSize: 7,
        fontWeight: '400',
        color: '#9CA3AF',
        marginHorizontal: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: Platform.OS === 'ios' ? 34 : 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    attachmentButton: {
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentIcon: {
        width: 24,
        height: 24,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 12,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        width: 20,
        height: 20,
    },
    sendIconDisabled: {
        tintColor: '#9CA3AF',
    },
});

export default ChatDetailsScreen;

