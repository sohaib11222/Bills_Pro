import React, { useState, useEffect } from 'react';
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
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useUserProfile } from '../../queries/userQueries';
import { useUpdateProfile } from '../../mutations/userMutations';
import { getProfileImage, setProfileImage } from '../../services/storage/appStorage';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const { data, isLoading: isLoadingProfile } = useUserProfile();
    const updateProfileMutation = useUpdateProfile();

    const user = data?.data?.user;

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

    // Load profile image and user data when component mounts
    useEffect(() => {
        const loadProfileImage = async () => {
            const storedImage = await getProfileImage();
            if (storedImage) {
                setProfileImageUri(storedImage);
            }
        };
        loadProfileImage();
    }, []);

    // Populate form with user data when loaded
    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setEmail(user.email || '');
            setPhone(user.phone_number || '');
        }
    }, [user]);

    // Reload profile image when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            const storedImage = await getProfileImage();
            if (storedImage) {
                setProfileImageUri(storedImage);
            }
        });
        return unsubscribe;
    }, [navigation]);

    const handleImagePicker = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to change your profile picture.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setProfileImageUri(imageUri);
                await setProfileImage(imageUri);
                Alert.alert('Success', 'Profile picture updated successfully');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleSave = async () => {
        // Validate required fields
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Validation Error', 'First name and last name are required');
            return;
        }

        try {
            const updateData: {
                first_name?: string;
                last_name?: string;
                phone_number?: string;
            } = {};

            if (firstName.trim() !== user?.first_name) {
                updateData.first_name = firstName.trim();
            }
            if (lastName.trim() !== user?.last_name) {
                updateData.last_name = lastName.trim();
            }
            if (phone.trim() !== user?.phone_number) {
                updateData.phone_number = phone.trim();
            }

            // Only update if there are changes
            if (Object.keys(updateData).length === 0) {
                Alert.alert('No Changes', 'No changes to save');
                navigation.goBack();
                return;
            }

            await updateProfileMutation.mutateAsync(updateData);
            
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 
                                error?.response?.data?.errors?.phone_number?.[0] ||
                                error?.message || 
                                'Failed to update profile';
            Alert.alert('Error', errorMessage);
        }
    };

    if (isLoadingProfile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#42AC36" />
            </View>
        );
    }

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
                <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Picture Section */}
                <View style={styles.profilePictureSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={profileImageUri ? { uri: profileImageUri } : require('../../assets/dummy_avatar.png')}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            style={styles.editAvatarButton}
                            activeOpacity={0.7}
                            onPress={handleImagePicker}
                        >
                            <Image
                                source={require('../../assets/Vector (56).png')}
                                style={styles.editIcon}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Input Fields */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First Name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last Name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#D1D5DB' }]}
                            value={email}
                            editable={false}
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <ThemedText style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4, marginLeft: 4 }}>
                            Email cannot be changed
                        </ThemedText>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Phone Number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Save Changes Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        updateProfileMutation.isPending && { opacity: 0.6 }
                    ]}
                    activeOpacity={0.8}
                    onPress={handleSave}
                    disabled={updateProfileMutation.isPending}
                >
                    {updateProfileMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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
        // paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 44 : 50,
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
    profilePictureSection: {
        alignItems: 'center',
        marginBottom: 40,

    },
    avatarContainer: {
        width: 85,
        height: 85,
        position: 'relative',
        backgroundColor:'#EFEFEF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 60,
        backgroundColor: '#EFEFEF',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    editIcon: {
        width: 10,
        height: 10,
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
});

export default EditProfileScreen;

