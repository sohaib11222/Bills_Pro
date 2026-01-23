import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useNotifications } from '../../queries/notificationQueries';
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../mutations/notificationMutations';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

const NotificationsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, error, refetch, isRefetching } = useNotifications({
    page,
    per_page: perPage,
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications: Notification[] = data?.data?.notifications || [];
  const unreadCount = data?.data?.unread_count || 0;
  const pagination = data?.data?.pagination;

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#42AC36" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <ThemedText style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16 }}>
          Error loading notifications. Please try again.
        </ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <ThemedText style={{ color: '#42AC36' }}>Retry</ThemedText>
        </TouchableOpacity>
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
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#000000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
        <View style={styles.headerSpacer}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <ThemedText style={styles.markAllText}>
                {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all read'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#42AC36"
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No notifications</ThemedText>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}
              activeOpacity={0.7}
              onPress={() => !notification.read && handleMarkAsRead(notification.id)}
            >
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
                    {formatDate(notification.created_at)} - {formatTime(notification.created_at)}
                  </ThemedText>
                </View>

                {/* Title */}
                <ThemedText style={styles.title}>{notification.title}</ThemedText>

                {/* Description */}
                <ThemedText style={styles.description}>{notification.message}</ThemedText>

                {/* Unread indicator */}
                {!notification.read && (
                  <View style={styles.unreadIndicator} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Load More Button */}
        {pagination && pagination.current_page < pagination.last_page && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => setPage(page + 1)}
          >
            <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
          </TouchableOpacity>
        )}
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
  unreadCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 3,
    borderLeftColor: '#42AC36',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#42AC36',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#42AC36',
    fontWeight: '500',
  },
  markAllText: {
    fontSize: 12,
    color: '#42AC36',
    fontWeight: '500',
  },
});

export default NotificationsScreen;

