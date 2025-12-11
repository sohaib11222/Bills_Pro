import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  hasImage?: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Get your virtual card',
    description: 'Getting your virtual card on bills pro is very easy, apply now and get your card easily in seconds',
    date: '09 Oct, 2025',
    time: '07:22 AM',
    hasImage: false,
  },
  {
    id: '2',
    title: 'Get your virtual card',
    description: 'Getting your virtual card on bills pro is very easy, apply now and get your card easily in seconds',
    date: '09 Oct, 2025',
    time: '07:22 AM',
    hasImage: true,
  },
  {
    id: '3',
    title: 'Get your virtual card',
    description: 'Getting your virtual card on bills pro is very easy, apply now and get your card easily in seconds',
    date: '09 Oct, 2025',
    time: '07:22 AM',
    hasImage: false,
  },
  {
    id: '4',
    title: 'Get your virtual card',
    description: 'Getting your virtual card on bills pro is very easy, apply now and get your card easily in seconds',
    date: '09 Oct, 2025',
    time: '07:22 AM',
    hasImage: false,
  },
];

const NotificationsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#000000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            {/* Left Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Image
                  source={require('../../assets/notification-01.png')}
                  style={styles.bellIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Date and Time - Top Right */}
              <View style={styles.dateTimeContainer}>
                <ThemedText style={styles.dateTime}>
                  {notification.date} - {notification.time}
                </ThemedText>
              </View>

              {/* Title */}
              <ThemedText style={styles.title}>{notification.title}</ThemedText>

              {/* Description */}
              <ThemedText style={styles.description}>{notification.description}</ThemedText>

              {/* Image (only for second notification) */}
              {notification.hasImage && (
                <View style={styles.imageContainer}>
                  <Image
                    source={require('../../assets/Rectangle 42.png')}
                    style={styles.notificationImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    top:60,
    zIndex: 0,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    // flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#42AC3633',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    width: 20,
    height: 20,
    tintColor: '#42AC36',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  dateTimeContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 8,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 4,
  },
  description: {
    fontSize: 12,
    color: '#000000',
    lineHeight: 20,
    marginTop: 4,
  },
  imageContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    // backgroundColor: '#E5E5E5',
    width: '100%',
  },
  notificationImage: {
    width: 151,
    height: 76,
  },
});

export default NotificationsScreen;

