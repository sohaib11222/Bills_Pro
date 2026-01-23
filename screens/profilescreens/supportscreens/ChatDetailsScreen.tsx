import React, { useState, useEffect, useRef } from 'react';
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
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';
import {
    useChatSession,
    useChatMessages,
} from '../../../queries/chatQueries';
import {
    useStartChat,
    useSendChatMessage,
    useMarkChatAsRead,
} from '../../../mutations/chatMutations';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatDetailsRouteProp = RouteProp<RootStackParamList, 'ChatDetails'>;

type IssueType = 'fiat' | 'virtual_card' | 'crypto';

const ChatDetailsScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<ChatDetailsRouteProp>();
    const chatId = route.params?.chatId;
    const scrollViewRef = useRef<ScrollView>(null);
    
    const sessionId = chatId ? parseInt(chatId, 10) : undefined;
    
    const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Fetch session if sessionId exists
    const { data: sessionData, isLoading: sessionLoading } = useChatSession(sessionId || 0);
    
    // Fetch messages
    const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useChatMessages(sessionId || 0);
    
    // Mutations
    const startChatMutation = useStartChat();
    const sendMessageMutation = useSendChatMessage();
    const markAsReadMutation = useMarkChatAsRead();
    
    const session = sessionData?.data;
    const messages = messagesData?.data || [];
    const currentSessionId = sessionId || session?.id;
    
    // Set selected issue from session if exists
    useEffect(() => {
        if (session?.issue_type) {
            const issueTypeMap: Record<string, IssueType> = {
                'fiat_issue': 'fiat',
                'virtual_card_issue': 'virtual_card',
                'crypto_issue': 'crypto',
            };
            const mappedIssue = issueTypeMap[session.issue_type] || null;
            setSelectedIssue(mappedIssue);
        }
    }, [session]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0 && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    // Mark messages as read when session is opened
    useEffect(() => {
        if (currentSessionId) {
            markAsReadMutation.mutate(currentSessionId);
        }
    }, [currentSessionId]);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        if (!currentSessionId) return;
        
        const interval = setInterval(() => {
            refetchMessages();
        }, 5000);
        
        return () => clearInterval(interval);
    }, [currentSessionId]);

    const handleIssueSelect = async (issue: IssueType) => {
        if (currentSessionId) {
            // Session already exists, just update UI
            setSelectedIssue(issue);
            return;
        }
        
        // Map frontend issue type to backend format
        const issueTypeMap: Record<IssueType, string> = {
            fiat: 'fiat_issue',
            virtual_card: 'virtual_card_issue',
            crypto: 'crypto_issue',
        };
        
        const backendIssueType = issueTypeMap[issue] || 'general';
        const initialMessage = `I have issue with ${issue === 'fiat' ? 'fiat' : issue === 'virtual_card' ? 'virtual card' : 'crypto'}`;
        
        setSelectedIssue(issue);
        
        try {
            const result = await startChatMutation.mutateAsync({
                issue_type: backendIssueType as any,
                message: initialMessage,
            });
            
            // Backend returns: { success: true, data: { success: true, session: {...}, message: {...} } }
            if (result.success && result.data?.success && result.data?.session) {
                // Navigate to the new session
                navigation.setParams({ chatId: result.data.session.id.toString() });
                // Refetch messages after a short delay
                setTimeout(() => {
                    refetchMessages();
                }, 500);
            } else if (result.success === false || result.data?.success === false) {
                // Active session exists - backend returns error with session in errors
                const existingSession = result.errors?.session || result.data?.session;
                Alert.alert(
                    'Active Chat Exists',
                    result.message || result.data?.message || 'You already have an active chat session.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Active Chat',
                            onPress: () => {
                                if (existingSession?.id) {
                                    navigation.setParams({ chatId: existingSession.id.toString() });
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to start chat. Please try again.');
        }
    };

    const handleImagePicker = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to attach images.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleSendMessage = async () => {
        if ((message.trim() === '' && !selectedImage) || !currentSessionId) return;
        
        const messageText = message.trim();
        const imageToSend = selectedImage;
        
        // Clear inputs
        setMessage('');
        setSelectedImage(null);
        
        try {
            // Create file object for React Native FormData
            let attachment: any = null;
            if (imageToSend) {
                const filename = imageToSend.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                
                attachment = {
                    uri: imageToSend,
                    type: type,
                    name: filename,
                } as any;
            }
            
            await sendMessageMutation.mutateAsync({
                id: currentSessionId,
                data: {
                    message: messageText || 'Image',
                    attachment: attachment,
                },
            });
            
            // Refetch messages to get the new message
            setTimeout(() => {
                refetchMessages();
            }, 300);
            
            // Scroll to bottom
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 500);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
            setMessage(messageText); // Restore message on error
            setSelectedImage(imageToSend); // Restore image on error
        }
    };

    const formatTimestamp = (dateString: string, status?: string) => {
        try {
            const date = new Date(dateString);
            const time = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
            const statusText = status === 'read' ? 'Read' : 'Sent';
            return `${time} - ${statusText}`;
        } catch {
            return dateString;
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
                        <ThemedText style={styles.headerContactName}>
                            {session?.admin?.name || session?.admin?.first_name || 'Admin'}
                        </ThemedText>
                        <ThemedText style={styles.headerContactStatus}>
                            {session?.status === 'active' ? 'Online' : session?.status === 'waiting' ? 'Waiting' : 'Offline'}
                        </ThemedText>
                    </View>
                </View>
                
                <View style={styles.headerSpacer} />
            </View>

            {(sessionLoading || messagesLoading) && !currentSessionId ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#42AC36" />
                    <ThemedText style={styles.loadingText}>Loading...</ThemedText>
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Issue Selection Section - Only show if no session */}
                    {!currentSessionId && (
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
                                    disabled={startChatMutation.isPending}
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
                                    disabled={startChatMutation.isPending}
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
                                    disabled={startChatMutation.isPending}
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
                            {startChatMutation.isPending && (
                                <View style={styles.loadingIndicator}>
                                    <ActivityIndicator size="small" color="#42AC36" />
                                    <ThemedText style={styles.loadingTextSmall}>Starting chat...</ThemedText>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Chat Messages */}
                    {messagesLoading && currentSessionId ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#42AC36" />
                            <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
                        </View>
                    ) : messages.length === 0 && currentSessionId ? (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
                        </View>
                    ) : (
                        <View style={styles.messagesContainer}>
                            {messages.map((msg: any) => {
                                const isUser = msg.sender_type === 'user';
                                const timestamp = formatTimestamp(msg.created_at, msg.status);
                                
                                return (
                                    <View
                                        key={msg.id}
                                        style={[
                                            styles.messageWrapper,
                                            isUser ? styles.messageWrapperUser : styles.messageWrapperAdmin,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.messageBubble,
                                                isUser ? styles.messageBubbleUser : styles.messageBubbleAdmin,
                                            ]}
                                        >
                                            {msg.attachment && (
                                                <Image
                                                    source={{ uri: msg.attachment }}
                                                    style={styles.messageImage}
                                                    resizeMode="cover"
                                                />
                                            )}
                                            {msg.message && (
                                                <ThemedText
                                                    style={[
                                                        styles.messageText,
                                                        isUser ? styles.messageTextUser : styles.messageTextAdmin,
                                                        msg.attachment && styles.messageTextWithImage,
                                                    ]}
                                                >
                                                    {msg.message}
                                                </ThemedText>
                                            )}
                                        </View>
                                        <ThemedText style={styles.messageTimestamp}>{timestamp}</ThemedText>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Waiting Divider */}
                    {messages.length > 0 && session?.status === 'waiting' && (
                        <View style={styles.waitingDivider}>
                            <View style={styles.waitingDividerLine} />
                            <ThemedText style={styles.waitingDividerText}>Waiting for Admin</ThemedText>
                            <View style={styles.waitingDividerLine} />
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Image Preview */}
            {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Message Input Field */}
            <View style={styles.inputContainer}>
                <TouchableOpacity 
                    style={styles.attachmentButton} 
                    activeOpacity={0.7}
                    onPress={handleImagePicker}
                >
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
                    disabled={(message.trim() === '' && !selectedImage) || !currentSessionId || sendMessageMutation.isPending}
                >
                    <Image
                        source={require('../../../assets/PaperPlaneRight.png')}
                        style={[
                            styles.sendIcon,
                            (message.trim() === '' && !selectedImage) && styles.sendIconDisabled,
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
        borderRadius: 12,
        padding: 14,
        marginBottom: 4,
        overflow: 'hidden',
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
    loadingTextSmall: {
        fontSize: 12,
        fontWeight: '400',
        color: '#6B7280',
        marginLeft: 8,
    },
    loadingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
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
    imagePreviewContainer: {
        marginHorizontal: 20,
        marginBottom: 12,
        position: 'relative',
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    messageImage: {
        width: '100%',
        maxWidth: width * 0.65,
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F3F4F6',
    },
    messageTextWithImage: {
        marginTop: 0,
    },
});

export default ChatDetailsScreen;

