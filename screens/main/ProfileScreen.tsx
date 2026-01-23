import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    StatusBar as RNStatusBar,
    Alert,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { getProfileImage, removeProfileImage } from '../../services/storage/appStorage';
import { useUserProfile } from '../../queries/userQueries';
import { useLogout } from '../../mutations/authMutations';
import { useAuth } from '../../services/context/AuthContext';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const { data, refetch: refetchUserProfile } = useUserProfile();
    const user = data?.data?.user;
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const logoutMutation = useLogout();
    const { checkAuth } = useAuth();

    // Load profile image when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            const loadProfileImage = async () => {
                const storedImage = await getProfileImage();
                if (storedImage) {
                    setProfileImageUri(storedImage);
                }
            };
            loadProfileImage();
        }, [])
    );

    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User';
    const isVerified = user?.email_verified_at ? 'Verified' : 'Unverified';

    // Handle pull to refresh
    const onRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Refetch user profile data
            await refetchUserProfile();
            
            // Reload profile image
            const storedImage = await getProfileImage();
            if (storedImage) {
                setProfileImageUri(storedImage);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Clear profile image
                            await removeProfileImage();
                            
                            // Logout (clears auth data and query cache)
                            await logoutMutation.mutateAsync();
                            
                            // Update auth context
                            await checkAuth();
                            
                            // Navigate to Auth screen
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Auth' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };
  return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* Header Section with Green Background */}
            <ImageBackground
                source={require('../../assets/settings_background.png')}
                style={styles.headerBackground}
                resizeMode="cover"
            >
                <View style={styles.headerContent}>
                    <ThemedText style={styles.headerTitle}>Profile</ThemedText>
                    
                    <View style={styles.userInfoContainer}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={profileImageUri ? { uri: profileImageUri } : require('../../assets/dummy_avatar.png')}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                            {isVerified === 'Verified' && (
                                <View style={styles.verifiedBadge}>
                                    <Image
                                        source={require('../../assets/Vector (55).png')}
                                        style={styles.verifiedIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}
                        </View>
                        <View style={styles.userInfoText}>
                            <ThemedText style={styles.userName}>{userName || 'User'}</ThemedText>
                            <ThemedText style={styles.verifiedText}>{isVerified}</ThemedText>
                        </View>
                    </View>
                </View>
            </ImageBackground>

            {/* Main Content Area */}
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
                {/* General Settings Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionLabel}>General Settings</ThemedText>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <View style={styles.menuIconContainer}>
                            <Image
                                source={require('../../assets/User (2).png')}
                                style={styles.menuIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.menuItemContent}>
                            <ThemedText style={styles.menuItemText}>Profile Settings</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Verification')}
                    >
                        <View style={styles.menuIconContainer}>
                            <Image
                                source={require('../../assets/ShieldCheck.png')}
                                style={styles.menuIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.menuItemContent}>
                            <ThemedText style={styles.menuItemText}>Verification</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('WithdrawalAccounts')}
                    >
                        <View style={styles.menuIconContainer}>
                            <Image
                                source={require('../../assets/Bank (1).png')}
                                style={styles.menuIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.menuItemContent}>
                            <ThemedText style={styles.menuItemText}>Withdrawal Account</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Others Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionLabel}>Others</ThemedText>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('SecuritySettings')}
                    >
                        <View style={styles.menuIconContainer}>
                            <Image
                                source={require('../../assets/User (2).png')}
                                style={styles.menuIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.menuItemContent}>
                            <ThemedText style={styles.menuItemText}>Security Settings</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Support')}
                    >
                        <View style={styles.menuIconContainer}>
                            <Image
                                source={require('../../assets/Headset (1).png')}
                                style={styles.menuIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.menuItemContent}>
                            <ThemedText style={styles.menuItemText}>Support</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('NotificationSettings')}
                    >
                        <View style={styles.menuIconContainer}>
                            <Image
                                source={require('../../assets/notification-01.png')}
                                style={styles.menuIconImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.menuItemContent}>
                            <ThemedText style={styles.menuItemText}>Notification settings</ThemedText>
                            {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Logout Option */}
                <TouchableOpacity 
                    style={styles.logoutItem} 
                    activeOpacity={0.7}
                    onPress={handleLogout}
                    disabled={logoutMutation.isPending}
                >
                    <Image
                        source={require('../../assets/SignOut.png')}
                        style={styles.logoutIcon}
                        resizeMode="contain"
                    />
                    <ThemedText style={styles.logoutText}>
                        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </ThemedText>
                </TouchableOpacity>

                {/* Bottom padding for tab bar */}
                <View style={styles.bottomPadding} />
            </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerBackground: {
        width: '100%',
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 44 : 44,
        paddingBottom: 70,
        // paddingHorizontal: 20,
    },
    headerContent: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        marginRight: 16,
        position: 'relative',
      
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        // borderWidth: 2,
        // borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF0D',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        // backgroundColor: '#1B800F',
        alignItems: 'center',
        justifyContent: 'center',
        // borderWidth: 2,
        // borderColor: '#FFFFFF',
    },
    verifiedIcon: {
        width: 21,
        height: 21,
        // tintColor: '#FFFFFF',
    },
    userInfoText: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '400',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#1B800F',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        zIndex:10,
        marginTop: -20,
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '400',
        color: '#00000080',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuIconContainer: {
        width: 63,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#42AC36',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuIconImage: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    },
    logoutIcon: {
        width: 20,
        height: 20,
        tintColor: '#EF4444',
    },
    menuItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        marginLeft: -12,
        paddingLeft: 28,
        minHeight: 60,
    },
    menuItemText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: '#111827',
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#EF4444',
        marginLeft: 12,
    },
    bottomPadding: {
        height: 20,
    },
});

export default ProfileScreen;
