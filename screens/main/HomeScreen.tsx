import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import { useDashboard } from '../../queries/dashboardQueries';
import { useWalletBalance } from '../../queries/walletQueries';
import { getProfileImage } from '../../services/storage/appStorage';

const { width, height } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showWallets, setShowWallets] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<'naira' | 'crypto'>('naira');
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

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

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard, 
    error: dashboardError, 
    refetch: refetchDashboard 
  } = useDashboard();
  
  // Fetch wallet balance
  const { 
    data: walletBalanceData, 
    isLoading: isLoadingBalance,
    refetch: refetchWalletBalance 
  } = useWalletBalance();

  // Handle pull to refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchDashboard(), refetchWalletBalance()]);
      // Reload profile image on refresh
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

  // Extract data
  const user = dashboardData?.data?.user;
  const fiatBalance = dashboardData?.data?.balances?.fiat?.balance || 0;
  const cryptoBalance = dashboardData?.data?.balances?.crypto?.total_usd || 0;
  const cryptoBreakdown = dashboardData?.data?.balances?.crypto?.breakdown || [];

  // Format balance for display
  const formatBalance = (amount: number, currency: 'NGN' | 'USD') => {
    if (isBalanceHidden) return '******';
    const formatter = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  // Helper function to get crypto icon
  const getCryptoIcon = (currency: string) => {
    const icons: Record<string, any> = {
      'BTC': require('../../assets/popular1.png'),
      'ETH': require('../../assets/popular2.png'),
      'USDT': require('../../assets/popular3.png'),
      'USDC': require('../../assets/popular4.png'),
    };
    return icons[currency] || require('../../assets/popular1.png');
  };

  // Helper function to get crypto color
  const getCryptoColor = (currency: string) => {
    const colors: Record<string, string> = {
      'BTC': '#FFA5004D',
      'ETH': '#0000FF4D',
      'USDT': '#0080004D',
      'USDC': '#0000FF4D',
    };
    return colors[currency] || '#42AC36';
  };

  // Loading state
  if (isLoadingDashboard || isLoadingBalance) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#42AC36" />
      </View>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar style="light" />
        <ThemedText style={styles.errorText}>Failed to load dashboard</ThemedText>
        <TouchableOpacity onPress={() => refetchDashboard()} style={styles.retryButton}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ImageBackground
        source={require('../../assets/home_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#42AC36"
              colors={['#42AC36']}
              progressViewOffset={20}
              size="large"
            />
          }
        >
          <View style={styles.pageContent}>
            {/* Top welcome + balance */}
            <View style={styles.headerContainer}>
              <View style={styles.welcomeRow}>
                <Image
                  source={profileImageUri ? { uri: profileImageUri } : require('../../assets/dummy_avatar.png')}
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <View style={styles.welcomeTextContainer}>
                  <ThemedText style={styles.welcomeLabel}>Welcome</ThemedText>
                  <ThemedText style={styles.welcomeName}>
                    {user?.name || user?.first_name || 'User'}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.iconCircle}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Image
                    source={require('../../assets/notification-01.png')}
                    style={styles.notificationIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                <TouchableOpacity
                  style={styles.balanceHeaderRow}
                  activeOpacity={0.8}
                  onPress={() => setShowWallets(true)}
                >
                  <ThemedText style={styles.balanceLabel}>
                    {selectedWallet === 'crypto' ? 'Crypto Balance' : 'Naira Balance'}
                  </ThemedText>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color="rgba(255,255,255,0.7)"
                    style={styles.balanceChevron}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.eyeCircle}
                  activeOpacity={0.8}
                  onPress={() => setIsBalanceHidden(!isBalanceHidden)}
                >
                  <Ionicons
                    name={isBalanceHidden ? 'eye-off' : 'eye'}
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.balanceContainer}>
                <View>
                  <ThemedText style={styles.balanceValue}>
                    <ThemedText style={styles.balanceCurrency}>
                      {selectedWallet === 'crypto' ? '$ ' : '₦ '}
                    </ThemedText>
                    {selectedWallet === 'crypto'
                      ? formatBalance(cryptoBalance, 'USD')
                      : formatBalance(fiatBalance, 'NGN')}
                  </ThemedText>
                </View>
              </View>

              {/* Quick action tiles */}
              {selectedWallet === 'crypto' ? (
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity
                    style={styles.quickActionCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('SelectCrypto', { mode: 'receive' })}
                  >
                    <Image
                      source={require('../../assets/sent (1).png')}
                      style={styles.quickActionIcon}
                      resizeMode="contain"
                    />
                    <ThemedText style={styles.quickActionText}>Receive</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('SelectCrypto', { mode: 'send' })}
                  >
                    <Image
                      source={require('../../assets/sent (2).png')}
                      style={styles.quickActionIcon}
                      resizeMode="contain"
                    />
                    <ThemedText style={styles.quickActionText}>Send</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('SelectCrypto', { mode: 'buy' })}
                  >
                    <Image
                      source={require('../../assets/sell (2).png')}
                      style={styles.quickActionIcon}
                      resizeMode="contain"
                    />
                    <ThemedText style={styles.quickActionText}>Buy</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('SelectCrypto', { mode: 'sell' })}
                  >
                    <Image
                      source={require('../../assets/sell (1).png')}
                      style={styles.quickActionIcon}
                      resizeMode="contain"
                    />
                    <ThemedText style={styles.quickActionText}>Sell</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.quickActionsRow}>
                  {[
                    {
                      key: 'Deposit',
                      label: 'Deposit',
                      icon: require('../../assets/deposit.png'),
                      onPress: () => navigation.navigate('DepositFunds'),
                    },
                    {
                      key: 'Bill',
                      label: 'Bill Payment',
                      icon: require('../../assets/bill_payments.png'),
                      onPress: () => navigation.navigate('BillPayments'),
                    },
                    {
                      key: 'Virtual',
                      label: 'VirtualCards',
                      icon: require('../../assets/virtual_cards.png'),
                      onPress: () => navigation.navigate('Cards'),
                    },
                    {
                      key: 'Crypto',
                      label: 'Crypto',
                      icon: require('../../assets/bitcoin-ellipse.png'),
                      onPress: () => setSelectedWallet('crypto'),
                    },
                  ].map((item) => {
                    const isActive = item.key === 'Crypto';
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.quickActionCard,
                          isActive && styles.quickActionCardActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={item.onPress}
                      >
                        <Image
                          source={item.icon}
                          style={[
                            styles.quickActionIcon,
                            isActive && styles.quickActionIconActive,
                          ]}
                          resizeMode="contain"
                        />
                        <ThemedText
                          style={[
                            styles.quickActionText,
                            isActive && styles.quickActionTextActive,
                          ]}
                        >
                          {item.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* White card section */}
            <View style={styles.bottomCard}>
              {/* Promo card */}
              <LinearGradient
                colors={['#D9FDD6', '#21D721']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.promoCard}
              >
                <View style={styles.promoTextContainer}>
                  <ThemedText style={styles.promoTitleLine1}>Get instant</ThemedText>
                  <ThemedText style={styles.promoTitleLine2}>Virtual Cards</ThemedText>
                  <ThemedText style={styles.promoSubtitle}>
                    Create dollar virtual cards for all forms of payment
                  </ThemedText>
                  <TouchableOpacity 
                    style={styles.promoButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Cards')}
                  >
                    <ThemedText style={styles.promoButtonText}>Proceed</ThemedText>
                  </TouchableOpacity>
                </View>
                <Image
                  source={require('../../assets/home_image.png')}
                  style={styles.promoImage}
                  // resizeMode="contain"
                  resizeMode="cover"
                />
              </LinearGradient>

              {/* Quick Services or Popular Crypto */}
              <View style={styles.quickServicesHeaderRow}>
                <ThemedText style={styles.quickServicesTitle}>
                  {selectedWallet === 'crypto' ? 'Popular Crypto' : 'Quick Services'}
                </ThemedText>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (selectedWallet === 'crypto') {
                      navigation.navigate('Wallets');
                    } else {
                      navigation.navigate('BillPayments');
                    }
                  }}
                >
                  <ThemedText style={styles.quickServicesViewAll}>View All</ThemedText>
                </TouchableOpacity>
              </View>

              {selectedWallet === 'crypto' ? (
                <View style={styles.popularCryptoRow}>
                  {cryptoBreakdown.length > 0 ? (
                    cryptoBreakdown.slice(0, 4).map((crypto: any) => (
                      <TouchableOpacity
                        key={`${crypto.blockchain}_${crypto.currency}`}
                        style={styles.popularCryptoItem}
                        activeOpacity={0.8}
                        onPress={() => {
                          navigation.navigate('SelectCrypto', {
                            mode: 'view',
                            currency: crypto.currency,
                            blockchain: crypto.blockchain,
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.popularCryptoIconCircle,
                            { backgroundColor: getCryptoColor(crypto.currency) },
                          ]}
                        >
                          <Image
                            source={getCryptoIcon(crypto.currency)}
                            style={styles.popularCryptoIcon}
                            resizeMode="contain"
                          />
                        </View>
                        <ThemedText style={styles.popularCryptoLabel}>
                          {crypto.symbol || crypto.currency}
                        </ThemedText>
                        <ThemedText style={styles.popularCryptoValue}>
                          {crypto.balance?.toFixed(4) || '0.0000'}
                        </ThemedText>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyCryptoContainer}>
                      <ThemedText style={styles.emptyCryptoText}>No crypto wallets</ThemedText>
                    </View>
                  )}
                  {cryptoBreakdown.length > 4 && (
                    <TouchableOpacity
                      style={styles.popularCryptoItem}
                      activeOpacity={0.8}
                      onPress={() => {
                        navigation.navigate('Wallets');
                      }}
                    >
                      <View
                        style={[
                          styles.popularCryptoIconCircle,
                          { backgroundColor: '#42AC36' },
                        ]}
                      >
                        <ThemedText style={styles.popularCryptoSymbol}>+</ThemedText>
                      </View>
                      <ThemedText style={styles.popularCryptoLabel}>More</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.quickServicesRow}>
                  {[
                    {
                      key: 'Airtime',
                      label: 'Airtime',
                      color: '#FF3B30',
                      icon: require('../../assets/mobile.png'),
                      onPress: () => navigation.navigate('AirtimeRecharge'),
                    },
                    {
                      key: 'Data',
                      label: 'Data',
                      color: '#007AFF',
                      icon: require('../../assets/global.png'),
                      onPress: () => navigation.navigate('DataRecharge'),
                    },
                    {
                      key: 'CableTV',
                      label: 'Cable TV',
                      color: '#FF9500',
                      icon: require('../../assets/monitor.png'),
                      onPress: () => navigation.navigate('CableTV'),
                    },
                    {
                      key: 'Electricity',
                      label: 'Electricity',
                      color: '#34C759',
                      icon: require('../../assets/flash.png'),
                      onPress: () => navigation.navigate('Electricity'),
                    },
                    {
                      key: 'More',
                      label: 'More',
                      color: '#8E8E93',
                      icon: require('../../assets/Plus.png'),
                      onPress: () => navigation.navigate('BillPayments'),
                    },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.quickServiceItem}
                      activeOpacity={0.8}
                      onPress={item.onPress}
                    >
                      <View
                        style={[styles.quickServiceIconCircle, { backgroundColor: item.color }]}
                      >
                        <Image
                          source={item.icon}
                          style={styles.quickServiceIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <ThemedText style={styles.quickServiceLabel}>{item.label}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>

      {showWallets && (
        <View style={styles.walletOverlay}>
          <TouchableOpacity
            style={styles.walletBackdrop}
            activeOpacity={1}
            onPress={() => setShowWallets(false)}
          />
          <View style={styles.walletCard}>
            <TouchableOpacity
              style={styles.walletRow}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedWallet('naira');
                setShowWallets(false);
              }}
            >
              <View style={[styles.walletIconCircle, styles.walletIconNaira]}>
                <Image
                  source={require('../../assets/emojione_flag-for-nigeria.png')}
                  style={styles.walletFlagIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.walletTextContainer}>
                <ThemedText style={styles.walletTitle}>Naira Wallet</ThemedText>
                <ThemedText style={styles.walletSubtitle}>
                  Bal : ₦{formatBalance(fiatBalance, 'NGN')}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.walletRadioOuter,
                  selectedWallet === 'naira' && styles.walletRadioActive,
                ]}
              >
                {selectedWallet === 'naira' && <View style={styles.walletRadioInner} />}
              </View>
            </TouchableOpacity>
            <View style={styles.walletDivider} />
            <TouchableOpacity
              style={styles.walletRow}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedWallet('crypto');
                setShowWallets(false);
              }}
            >
              <View style={[styles.walletIconCircle, styles.walletIconCrypto]}>
                <Image
                  source={require('../../assets/Vector (52).png')}
                  style={styles.walletCryptoIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.walletTextContainer}>
                <ThemedText style={styles.walletTitle}>Crypto Wallet</ThemedText>
                <ThemedText style={styles.walletSubtitle}>
                  Bal : ${formatBalance(cryptoBalance, 'USD')}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.walletRadioOuter,
                  selectedWallet === 'crypto' && styles.walletRadioActive,
                ]}
              >
                {selectedWallet === 'crypto' && <View style={styles.walletRadioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A8F3C',
  },
  background: {
    flex: 1,
    width,
    height,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pageContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 70,

  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 40,
    backgroundColor: '#FFFFFF0D',
  },
  welcomeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  welcomeName: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 18,
    height: 18,
  },
  balanceContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#FFFFFF80',
  },
  balanceChevron: {
    marginLeft: 4,
  },
  balanceCurrency: {
    fontSize: 15,
    fontWeight: '400',
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  eyeCircle: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallRoundButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  smallRoundButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 8,
  },
  quickActionCard: {
    flex: 1,
    height: 90,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionCardActive: {
    backgroundColor: '#FFFFFF',
  },
  quickActionIcon: {
    width: 24,
    height: 20,
    borderRadius: 16,
    marginBottom: 8,
    tintColor: '#FFFFFF',
  },
  quickActionIconActive: {
    tintColor: '#000000',
  },
  quickActionText: {
    fontSize: 8,
    color: '#FFFFFF',
  },
  quickActionTextActive: {
    color: '#000000',
  },
  bottomCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  promoCard: {
    borderRadius: 24,
    backgroundColor: '#B9F6C9',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 16,
    alignItems: 'center',
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitleLine1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  promoTitleLine2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  promoSubtitle: {
    fontSize: 8,
    color: '#000000',
    marginTop: 8,
    marginRight: 12,
  },
  promoButton: {
    marginTop: 12,
    width: 110,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A8F3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoButtonText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  promoImage: {
    width: 170,
    height: 100,
  },
  quickServicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  quickServicesTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
  },
  quickServicesViewAll: {
    fontSize: 14,
    color: '#42AC36',
  },
  quickServicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quickServiceItem: {
    alignItems: 'center',
  },
  quickServiceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 30,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickServiceIcon: {
    width: 22,
    height: 22,
  },
  quickServiceLabel: {
    fontSize: 8,
    color: '#000000',
  },
  popularCryptoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  popularCryptoItem: {
    alignItems: 'center',
  },
  popularCryptoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  popularCryptoIcon: {
    width: 30,
    height: 30,
  },
  popularCryptoSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  popularCryptoLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
  },
  popularCryptoValue: {
    fontSize: 8,
    color: 'rgba(0,0,0,0.5)',
  },
  walletOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  walletBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  walletCard: {
    marginTop: 230,
    width: width - 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletIconNaira: {
    backgroundColor: '#E3F8D9',
  },
  walletIconCrypto: {
    backgroundColor: '#FFE3B3',
  },
  walletFlagIcon: {
    width: 26,
    height: 26,
  },
  walletCryptoIcon: {
    width: 24,
    height: 24,
  },
  walletTextContainer: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  walletSubtitle: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  walletRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletRadioActive: {
    borderColor: '#42AC36',
  },
  walletRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#42AC36',
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0A8F3C',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCryptoContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyCryptoText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default HomeScreen;

