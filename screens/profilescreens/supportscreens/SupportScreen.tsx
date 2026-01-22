import React from 'react';
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
    Linking,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';
import { useSupportInfo } from '../../../queries/supportQueries';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Static mapping for social platform images (React Native doesn't support dynamic require)
const socialImages: Record<string, any> = {
    instagram: require('../../../assets/instagram.png'),
    facebook: require('../../../assets/facebook.png'),
    tiktok: require('../../../assets/tiktok.png'),
};

const SupportScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const { data: supportData, isLoading, isError, refetch } = useSupportInfo();

    const supportInfo = supportData?.data || {};
    const contactOptions = supportInfo.contact_options || [];
    const socials = supportInfo.socials || [];

    const handleEmailContact = (email: string) => {
        Linking.openURL(`mailto:${email}?subject=Support Request`).catch(() => {
            Alert.alert('Error', 'Unable to open email client');
        });
    };

    const handleSocialLink = (url: string) => {
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to open link');
        });
    };

    const getSocialImage = (platform: string) => {
        return socialImages[platform] || socialImages.instagram; // Default to instagram if not found
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
                    <ThemedText style={styles.loadingText}>Loading support information...</ThemedText>
                </View>
            ) : isError ? (
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Failed to load support information</ThemedText>
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
                    {/* Main Illustration Section */}
                    <View style={styles.illustrationSection}>
                        <Image
                            source={require('../../../assets/support_background.png')}
                            style={styles.illustrationImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Contact Options Section */}
                    <View style={styles.contactSection}>
                        {contactOptions.map((option: any, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.contactCard}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (option.type === 'email' && option.value) {
                                        handleEmailContact(option.value);
                                    } else if (option.type === 'live_chat' && option.available) {
                                        navigation.navigate('LiveChat');
                                    }
                                }}
                            >
                                <View style={styles.contactIconContainer}>
                                    <Image
                                        source={
                                            option.type === 'email'
                                                ? require('../../../assets/Envelope.png')
                                                : require('../../../assets/Headset (1).png')
                                        }
                                        style={[
                                            styles.contactIconImage,
                                            option.type === 'live_chat' && { width: 24, height: 24, tintColor: '#008000' }
                                        ]}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.contactTextContainer}>
                                    <ThemedText style={styles.contactTitle}>{option.title || 'Contact'}</ThemedText>
                                    <ThemedText style={styles.contactSubtitle}>{option.subtitle || ''}</ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Socials Section */}
                    {socials.length > 0 && (
                        <View style={styles.socialsSection}>
                            <ThemedText style={styles.socialsLabel}>Socials</ThemedText>
                            <View style={styles.socialsList}>
                                {socials.map((social: any, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.socialButton}
                                        activeOpacity={0.7}
                                        onPress={() => handleSocialLink(social.url)}
                                    >
                                        <Image
                                            source={getSocialImage(social.platform)}
                                            style={styles.socialIcon}
                                            resizeMode="contain"
                                        />
                                        <ThemedText style={styles.socialText}>{social.name || social.platform}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
    illustrationSection: {
        width: '100%',
        height: 300,
        marginTop: 20,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustrationImage: {
        width: '100%',
        height: '100%',
    },
    contactSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    contactCard: {
        flex: 1,
        backgroundColor: '#00800026',
        borderRadius: 16,
        padding: 20,
        // alignItems: 'center',
        shadowColor: '#00800026',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    contactIconContainer: {
     
        borderRadius: 28,
        // backgroundColor: '#FFFFFF',
        // justifyContent: 'center',
        // alignItems: 'center',
        marginBottom: 26,
    },
    contactIconImage: {
        width: 24,
        height: 24,
    },
    contactTextContainer: {
        // alignItems: 'center',
    },
    contactTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 4,
    },
    contactSubtitle: {
        fontSize: 8,
        fontWeight: '400',
        color: '#6B7280',
        // textAlign: 'center',
    },
    socialsSection: {
        marginBottom: 20,
    },
    socialsLabel: {
        fontSize: 10,
        fontWeight: '400',
        color: '#9CA3AF',
        marginBottom: 12,
    },
    socialsList: {
        gap: 12,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
    },
    socialIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    socialText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
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
});

export default SupportScreen;

