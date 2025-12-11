import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const BillPaymentsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ImageBackground
        source={require('../../assets/bill_payments_background.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Bill Payments</ThemedText>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bill category cards */}
          <View style={styles.cardsGrid}>
            {[
              {
                key: 'airtime',
                title: 'Airtime Recharge',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#FF0000',
                icon: require('../../assets/mobile.png'),
                borderColor: '#FF0000',
              },
              {
                key: 'data',
                title: 'Data Recharge',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#0000FF',
                icon: require('../../assets/global.png'),
                borderColor: '#0000FF',
              },
              {
                key: 'internet',
                title: 'Internet',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#800080',
                icon: require('../../assets/Vector (58).png'),
                borderColor: '#800080',
              },
              {
                key: 'electricity',
                title: 'Electricity',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#008000',
                icon: require('../../assets/flash.png'),
                borderColor: '#008000',
              },
              {
                key: 'cable',
                title: 'Cable TV',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#FFA500',
                icon: require('../../assets/monitor.png'),
                borderColor: '#FFA500',
              },
              {
                key: 'betting',
                title: 'Betting',
                subtitle: 'Recharge your airtime easily via bills pro',
                color: '#A52A2A',
                icon: require('../../assets/Vector (59).png'),
                borderColor: '#A52A2A',
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.billCard, { borderColor: item.borderColor }]}
                onPress={() => {
                  if (item.key === 'airtime') {
                    navigation.navigate('AirtimeRecharge');
                  } else if (item.key === 'data') {
                    navigation.navigate('DataRecharge');
                  } else if (item.key === 'internet') {
                    navigation.navigate('InternetSubscription');
                  } else if (item.key === 'betting') {
                    navigation.navigate('Betting');
                  } else if (item.key === 'cable') {
                    navigation.navigate('CableTV');
                  } else if (item.key === 'electricity') {
                    navigation.navigate('Electricity');
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.billIconCircle}>
                  <Image
                    source={item.icon}
                    style={[styles.billIcon, { tintColor: item.color }]}
                    resizeMode="contain"
                  />
                </View>
                <ThemedText style={styles.billCardTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.billCardSubtitle}>{item.subtitle}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Transactions */}
          <ThemedText style={styles.recentTitle}>Recent Transactions</ThemedText>

          <View style={styles.transactionsList}>
            {[
              {
                key: 'mtn',
                name: 'Airtime Recharge',
                status: 'Successful - 07033484845',
                statusColor: '#1B800F',
                amount: '20,000',
                date: '06 Oct, 25 - 08:00 PM',
                iconSource: require('../../assets/airtime.png'),
              },
              {
                key: 'bet',
                name: 'Betting',
                status: 'Successful',
                statusColor: '#1B800F',
                amount: '20,000',
                date: '06 Oct, 25 - 08:00 PM',
                iconSource: require('../../assets/betting (2).png'),
              },
              {
                key: 'dstv',
                name: 'Cable TV',
                status: 'Successful - 123456789',
                statusColor: '#1B800F',
                amount: '20,000',
                date: '06 Oct, 25 - 08:00 PM',
                iconSource: require('../../assets/cable (2).png'),
              },
              {
                key: 'glo',
                name: 'Data Recharge',
                status: 'Successful - 07033484845',
                statusColor: '#1B800F',
                amount: '20,000',
                date: '06 Oct, 25 - 08:00 PM',
                iconSource: require('../../assets/datarecharge.png'),
              },
              {
                key: 'ibedc',
                name: 'Electricity Recharge',
                status: 'Pending',
                statusColor: '#F59E0B',
                amount: '20,000',
                date: '06 Oct, 25 - 08:00 PM',
                iconSource: require('../../assets/electricity.png'),
                isPending: true,
              },
            ].map((tx) => (
              <TouchableOpacity
                key={tx.key}
                style={styles.transactionItem}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('TransactionHistory', {
                    type: 'bill_payment',
                    transactionData: tx,
                  });
                }}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    tx.isPending && styles.transactionIconPending,
                  ]}
                >
                  <Image
                    source={tx.iconSource}
                    style={styles.billPaymentIconImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.transactionContent}>
                  <ThemedText style={styles.transactionType}>{tx.name}</ThemedText>
                  <ThemedText
                    style={[
                      styles.transactionStatus,
                      tx.isPending && styles.transactionStatusPending,
                    ]}
                  >
                    {tx.status}
                  </ThemedText>
                </View>
                <View style={styles.transactionRight}>
                  <ThemedText style={styles.transactionAmount}>{tx.amount}</ThemedText>
                  <ThemedText style={styles.transactionDate}>{tx.date}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    width,
    height: height * 0.23,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 53,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginTop: -85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  billCard: {
    width: (width - 16 * 2 - 16) / 3,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 18,
    marginBottom: 15,
    borderWidth: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  billIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  billIcon: {
    width: 24,
    height: 24,
  },
  billCardTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 4,
  },
  billCardSubtitle: {
    fontSize: 8,
    color: 'rgba(0,0,0,0.6)',
    textAlign: 'center',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 15,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 15,
    padding: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 41,
    height: 41,
    borderRadius: 15,
    backgroundColor: '#D6F5D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconPending: {
    backgroundColor: '#FFE3B3',
  },
  billPaymentIconImage: {
    width: 40,
    height: 40,
  },
  transactionContent: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 8,
    color: '#1B800F',
  },
  transactionStatusPending: {
    color: '#F59E0B',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '400',
    color: '#008000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 8,
    color: '#9CA3AF',
  },
});

export default BillPaymentsScreen;


