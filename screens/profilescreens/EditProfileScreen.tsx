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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen = () => {
    const navigation = useNavigation<RootNavigationProp>();
    const [firstName, setFirstName] = useState('Abdul Malik');
    const [lastName, setLastName] = useState('Qamardeen');
    const [email, setEmail] = useState('qamardeenoladimeji@gmail.com');
    const [phone, setPhone] = useState('070123456767');

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
                            source={require('../../assets/dummy_avatar.png')}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            style={styles.editAvatarButton}
                            activeOpacity={0.7}
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
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
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
                    style={styles.saveButton}
                    activeOpacity={0.8}
                    onPress={() => {
                        // Handle save changes
                        navigation.goBack();
                    }}
                >
                    <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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

