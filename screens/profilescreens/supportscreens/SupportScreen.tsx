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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../../components/ThemedText';

const { width } = Dimensions.get('window');
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SupportScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();

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
                    <TouchableOpacity
                        style={styles.contactCard}
                        activeOpacity={0.7}
                    >
                        <View style={styles.contactIconContainer}>
                            <Image
                                source={require('../../../assets/Envelope.png')}
                                style={styles.contactIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.contactTextContainer}>
                            <ThemedText style={styles.contactTitle}>Email Us</ThemedText>
                            <ThemedText style={styles.contactSubtitle}>Contact us via Email</ThemedText>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('LiveChat')}
                    >
                        <View style={styles.contactIconContainer}>
                            <Image
                                source={require('../../../assets/Headset (1).png')}
                                style={[styles.contactIconImage, {width: 24, height: 24, tintColor: '#008000'}]}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.contactTextContainer}>
                            <ThemedText style={styles.contactTitle}>Live Chat</ThemedText>
                            <ThemedText style={styles.contactSubtitle}>Contact us via live chat</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Socials Section */}
                <View style={styles.socialsSection}>
                    <ThemedText style={styles.socialsLabel}>Socials</ThemedText>
                    <View style={styles.socialsList}>
                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                            <Image
                                source={require('../../../assets/instagram.png')}
                                style={styles.socialIcon}
                                resizeMode="contain"
                            />
                            <ThemedText style={styles.socialText}>Instagram</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                            <Image
                                source={require('../../../assets/facebook.png')}
                                style={styles.socialIcon}
                                resizeMode="contain"
                            />
                            <ThemedText style={styles.socialText}>Facebook</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                            <Image
                                source={require('../../../assets/tiktok.png')}
                                style={styles.socialIcon}
                                resizeMode="contain"
                            />
                            <ThemedText style={styles.socialText}>TikTok</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
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
});

export default SupportScreen;

