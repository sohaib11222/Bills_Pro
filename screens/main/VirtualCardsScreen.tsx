import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../../RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ThemedText from '../../components/ThemedText';
import {
  useVirtualCards,
  useVirtualCardDetails,
  useVirtualCardBillingAddress,
  useVirtualCardLimits,
  useVirtualCardTransactions,
} from '../../queries/virtualCardQueries';
import {
  useFreezeVirtualCard,
  useUnfreezeVirtualCard,
} from '../../mutations/virtualCardMutations';

const { width } = Dimensions.get('window');

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const VirtualCardsScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const {
    data: cardsData,
    isLoading: isLoadingCards,
    error: cardsError,
  } = useVirtualCards();

  const cards = cardsData?.data || [];

  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [cardDetailsVisible, setCardDetailsVisible] = useState(false);
  const [billingAddressVisible, setBillingAddressVisible] = useState(false);
  const [cardLimitVisible, setCardLimitVisible] = useState(false);
  const [freezeCardVisible, setFreezeCardVisible] = useState(false);
  const [freezeToggle, setFreezeToggle] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const selectedCard = cards[selectedCardIndex] || null;
  const cardId = selectedCard?.id;

  // Card color mapping
  const getCardColor = (colorId?: string) => {
    const colorMap: { [key: string]: string } = {
      green: '#1B800F',
      brown: '#8B4513',
      purple: '#6B46C1',
    };
    return colorMap[colorId || 'green'] || '#1B800F';
  };

  const handleCardScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = width - 100 + 12; // card width + margin
    const index = Math.round(contentOffsetX / cardWidth);
    if (index >= 0 && index < cards.length) {
      setSelectedCardIndex(index);
    }
  };

  const {
    data: cardDetailsData,
    isLoading: isLoadingDetails,
  } = useVirtualCardDetails(cardId ?? 0);

  const {
    data: billingData,
    isLoading: isLoadingBilling,
  } = useVirtualCardBillingAddress(cardId ?? 0);

  const {
    data: limitsData,
    isLoading: isLoadingLimits,
  } = useVirtualCardLimits(cardId ?? 0);

  const {
    data: transactionsData,
    isLoading: isLoadingTx,
  } = useVirtualCardTransactions(cardId ?? 0);

  const recentTx = transactionsData?.data?.[0] || null;

  const freezeMutation = useFreezeVirtualCard();
  const unfreezeMutation = useUnfreezeVirtualCard();

  const isFrozen = selectedCard?.is_frozen ?? false;

  useEffect(() => {
    setFreezeToggle(isFrozen);
  }, [isFrozen]);

  const handleFreezeToggle = async () => {
    if (!cardId) {
      Alert.alert('No Card', 'Please create or select a card first.');
      return;
    }

    try {
      setFreezeToggle(prev => !prev);
      if (isFrozen) {
        await unfreezeMutation.mutateAsync(cardId);
      } else {
        await freezeMutation.mutateAsync(cardId);
      }
    } catch (error: any) {
      setFreezeToggle(isFrozen);
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update card status. Please try again.',
      );
    }
  };

  const requireCardAnd = (cb: () => void) => {
    if (!cardId) {
      Alert.alert('No Card', 'Please create a card first.');
      return;
    }
    cb();
  };

  const handleNavigateFund = () => {
    requireCardAnd(() => navigation.navigate('FundCard', { cardId }));
  };

  const handleNavigateWithdraw = () => {
    requireCardAnd(() => navigation.navigate('WithdrawCard', { cardId }));
  };

  const handleNavigateTransactions = () => {
    navigation.navigate('AllTransactions', { 
      initialFilter: 'Virtual Cards',
      wallet_type: 'virtual_card',
    });
  };

  if (isLoadingCards) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#42AC36" />
      </View>
    );
  }

  if (cardsError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="dark" />
        <ThemedText style={{ marginBottom: 8 }}>Unable to load virtual cards.</ThemedText>
        <ThemedText>Please check your connection and try again.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top content background (card + actions) */}
        <ImageBackground
          source={require('../../assets/topcontentbackground.png')}
          style={styles.topBackground}
          resizeMode="stretch"
        >
          {/* Card and Add Card Button Row */}
          <View style={styles.cardRowContainer}>
            {cards.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={cards}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleCardScroll}
                keyExtractor={(item, index) => `card-${item.id || index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.cardWrapper}>
                    <ImageBackground
                      source={require('../../assets/card_background.png')}
                      style={styles.cardContainer}
                      imageStyle={styles.cardImage}
                      resizeMode="cover"
                    >
                      {/* Color overlay based on card_color */}
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: getCardColor(item.card_color),
                            opacity: 0.7,
                            borderRadius: 24,
                          },
                        ]}
                      />
                      <View style={styles.cardContent}>
                        <View style={styles.cardTopRow}>
                          <ThemedText style={styles.cardSmallText}>Online Payment Virtual Card</ThemedText>
                          <ThemedText style={styles.cardBrandText}>Bills Pro</ThemedText>
                        </View>

                        <View style={styles.cardAmountRow}>
                          <View style={styles.cardAmountLeft}>
                            <ThemedText style={styles.cardCurrency}>$</ThemedText>
                            <ThemedText style={styles.cardAmount}>
                              {Number(item.balance || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </ThemedText>
                          </View>
                          <View style={styles.cardEyeCircle}>
                            <Image
                              source={require('../../assets/security-safe.png')}
                              style={styles.eyeIcon}
                              resizeMode="contain"
                            />
                          </View>
                        </View>

                        <View style={styles.cardNumberRow}>
                          <ThemedText style={styles.cardMaskedNumber}>
                            {`**** **** **** ${String(item.card_number || '').slice(-4)}`}
                          </ThemedText>
                        </View>

                        <View style={styles.cardBottomRow}>
                          <View>
                            <ThemedText style={styles.cardHolderName}>
                              {item.card_name || 'No card'}
                            </ThemedText>
                          </View>
                          <Image
                            source={require('../../assets/Group 2.png')}
                            style={styles.mastercardLogo}
                            resizeMode="contain"
                          />
                        </View>
                      </View>
                    </ImageBackground>
                  </View>
                )}
                contentContainerStyle={styles.cardsListContent}
                getItemLayout={(data, index) => ({
                  length: width - 100 + 12,
                  offset: (width - 100 + 12) * index,
                  index,
                })}
              />
            ) : (
              <View style={styles.emptyCardContainer}>
                <ThemedText style={styles.emptyCardText}>No cards yet</ThemedText>
              </View>
            )}

            {/* Add Card Button */}
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => navigation.navigate('CreateCard1')}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/Plus.png')}
                style={styles.addCardIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Pagination dots (center under the card) */}
          {cards.length > 1 && (
            <View style={styles.paginationDotWrapper}>
              {cards.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === selectedCardIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
          {cards.length <= 1 && (
            <View style={styles.paginationDotWrapper}>
              <View style={styles.paginationDot} />
            </View>
          )}

          {/* Buttons container background */}
          <ImageBackground
            source={require('../../assets/buttons_background_container.png')}
            style={styles.buttonsBackground}
            resizeMode="stretch"
          >
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: '#42AC36'}]}
                onPress={handleNavigateFund}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/ArrowDownLeft (1).png')}
                  style={styles.actionButtonIcon}
                  resizeMode="contain"
                />
                <ThemedText style={styles.actionButtonText}>Fund</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: '#42AC36'}]}
                onPress={handleNavigateWithdraw}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../assets/ArrowDownLeft.png')}
                  style={styles.actionButtonIcon}
                  resizeMode="contain"
                />
                <ThemedText style={styles.actionButtonText}>Withdraw</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: '#1B800F'}]}
                onPress={handleNavigateTransactions}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.actionButtonText}>Transaction</ThemedText>
              </TouchableOpacity>
            </View>
            {/* Small green bar indicator */}
            <View style={styles.greenBarContainer}>
              <Image
                source={require('../../assets/Rectangle 33.png')}
                style={styles.greenBar}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>
        </ImageBackground>

        {/* Bottom white content */}
        <View style={styles.bottomContainer}>
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.gridItem, styles.gridItemGreen]}
              activeOpacity={0.8}
              onPress={() => setCardDetailsVisible(true)}
            >
              <View style={[styles.innerShadowOverlay, {shadowColor: '#00800040'}]} />
              <View style={styles.gridIconRow}>
                <View style={[styles.gridIconSquare, { backgroundColor: 'transparent' }]}>
                  <Image
                    source={require('../../assets/Vector (53).png')}
                    style={[styles.gridIcon, { tintColor: '#1B800F' }]}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <ThemedText style={styles.gridTitle}>Card Details</ThemedText>
              <ThemedText style={styles.gridSubtitle}>View your card details</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridItem, styles.gridItemYellow]}
              activeOpacity={0.8}
              onPress={() => setBillingAddressVisible(true)}
            >
              <View style={[styles.innerShadowOverlay, {shadowColor: '#FFA50040'}]} />
              <View style={styles.gridIconRow}>
                <View style={[styles.gridIconSquare, { backgroundColor: 'transparent' }]}>
                  <Image
                    source={require('../../assets/Vector (53).png')}
                    style={[styles.gridIcon, { tintColor: '#FBBF24' }]}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <ThemedText style={styles.gridTitle}>Billing Address</ThemedText>
              <ThemedText style={styles.gridSubtitle}>View the billing address for your card</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.gridItem, styles.gridItemPurple]}
              activeOpacity={0.8}
              onPress={() => setCardLimitVisible(true)}
            >
              <View style={[styles.innerShadowOverlay, {shadowColor: '#0000FF40'}]} />
              <View style={styles.gridIconRow}>
                <View style={[styles.gridIconSquare, { backgroundColor: 'transparent' }]}>
                  <Image
                    source={require('../../assets/Vector (53).png')}
                    style={[styles.gridIcon, { tintColor: '#6366F1' }]}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <ThemedText style={styles.gridTitle}>Card Limit</ThemedText>
              <ThemedText style={styles.gridSubtitle}>View your card limit</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridItem, styles.gridItemRed]}
              activeOpacity={0.8}
              onPress={() => setFreezeCardVisible(true)}
            >
              <View style={[styles.innerShadowOverlay, {shadowColor: '#FF000040'}]} />
              <View style={styles.gridIconRow}>
                <View style={[styles.gridIconSquare, { backgroundColor: 'transparent' }]}>
                  <Image
                    source={require('../../assets/Vector (53).png')}
                    style={[styles.gridIcon, { tintColor: '#F97373' }]}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <ThemedText style={styles.gridTitle}>Freeze Card</ThemedText>
              <ThemedText style={styles.gridSubtitle}>Freeze your card</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View style={styles.recentHeaderRow}>
            <ThemedText style={styles.recentTitle}>Recent Transactions</ThemedText>
            <ThemedText style={styles.recentViewAll}>View All</ThemedText>
          </View>

          <View style={styles.transactionCard}>
            <View style={styles.transactionLeft}>
              <View style={styles.transactionIconCircle}>
                <Image
                  source={require('../../assets/sent (1).png')}
                  style={styles.transactionIconImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <ThemedText style={styles.transactionTitle}>
                  {recentTx?.description || 'Funds Deposit'}
                </ThemedText>
                <ThemedText style={styles.transactionStatus}>
                  {recentTx
                    ? recentTx.status === 'completed'
                      ? 'Successful'
                      : recentTx.status
                    : '—'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <ThemedText style={styles.transactionAmount}>
                {recentTx
                  ? `${recentTx.currency} ${Number(recentTx.amount || 0).toLocaleString()}`
                  : '--'}
              </ThemedText>
              <ThemedText style={styles.transactionDate}>
                {recentTx?.created_at || ''}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Card Details Modal */}
      <Modal
        visible={cardDetailsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCardDetailsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCardDetailsVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Card Details</ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCardDetailsVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {isLoadingDetails && (
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#42AC36" />
              </View>
            )}

            {(() => {
              const details: any = cardDetailsData?.data || selectedCard;

              return (
                <>
                  {/* Card Display */}
                  <ImageBackground
                    source={require('../../assets/card_background.png')}
                    style={styles.modalCardContainer}
                    imageStyle={styles.modalCardImage}
                    resizeMode="cover"
                  >
                    {/* Color overlay */}
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          backgroundColor: getCardColor(details?.card_color),
                          opacity: 0.7,
                          borderRadius: 24,
                        },
                      ]}
                    />
                    <View style={styles.modalCardContent}>
                      <View style={styles.modalCardTopRow}>
                        <ThemedText style={styles.modalCardSmallText}>
                          Online Payment Virtual Card
                        </ThemedText>
                        <ThemedText style={styles.modalCardBrandText}>Bills Pro</ThemedText>
                      </View>

                      <View style={styles.modalCardAmountRow}>
                        <View style={styles.modalCardAmountLeft}>
                          <ThemedText style={styles.modalCardCurrency}>$</ThemedText>
                          <ThemedText style={styles.modalCardAmount}>
                            {details
                              ? Number(details.balance || 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : '0.00'}
                          </ThemedText>
                        </View>
                        <View style={styles.modalCardEyeCircle}>
                          <Image
                            source={require('../../assets/security-safe.png')}
                            style={styles.modalEyeIcon}
                            resizeMode="contain"
                          />
                        </View>
                      </View>

                      <View style={styles.modalCardNumberRow}>
                        <ThemedText style={styles.modalCardMaskedNumber}>
                          {details
                            ? `**** **** **** ${String(details.card_number).slice(-4)}`
                            : '**** **** **** ----'}
                        </ThemedText>
                      </View>

                      <View style={styles.modalCardBottomRow}>
                        <ThemedText style={styles.modalCardHolderName}>
                          {details?.card_name || '---'}
                        </ThemedText>
                        <Image
                          source={require('../../assets/Group 2.png')}
                          style={styles.modalMastercardLogo}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  </ImageBackground>

                  {/* Card Details List */}
                  <View style={styles.cardDetailsList}>
                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Card Name</ThemedText>
                      <View style={styles.detailValueRow}>
                        <ThemedText style={styles.detailValue}>
                          {details?.card_name || '---'}
                        </ThemedText>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Card Number</ThemedText>
                      <View style={styles.detailValueRow}>
                        <ThemedText style={styles.detailValue}>
                          {details?.card_number || '---- ---- ---- ----'}
                        </ThemedText>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>CVV</ThemedText>
                      <View style={styles.detailValueRow}>
                        <ThemedText style={styles.detailValue}>
                          {details?.cvv || '---'}
                        </ThemedText>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Expiry Date</ThemedText>
                      <View style={styles.detailValueRow}>
                        <ThemedText style={styles.detailValue}>
                          {details
                            ? `${details.expiry_month}/${details.expiry_year}`
                            : '--/----'}
                        </ThemedText>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Billing Address Modal */}
      <Modal
        visible={billingAddressVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBillingAddressVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setBillingAddressVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Billing Address</ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setBillingAddressVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.billingAddressList}>
              <View style={styles.billingField}>
                <ThemedText style={styles.billingLabel}>Street Name</ThemedText>
                <View style={styles.billingValueContainer}>
                  <ThemedText style={styles.billingValue}>
                    {billingData?.data?.street || '---'}
                  </ThemedText>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.billingField}>
                <ThemedText style={styles.billingLabel}>City Name</ThemedText>
                <View style={styles.billingValueContainer}>
                  <ThemedText style={styles.billingValue}>
                    {billingData?.data?.city || '---'}
                  </ThemedText>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.billingField}>
                <ThemedText style={styles.billingLabel}>State Name</ThemedText>
                <View style={styles.billingValueContainer}>
                  <ThemedText style={styles.billingValue}>
                    {billingData?.data?.state || '---'}
                  </ThemedText>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.billingField}>
                <ThemedText style={styles.billingLabel}>Country Name</ThemedText>
                <View style={styles.billingValueContainer}>
                  <ThemedText style={styles.billingValue}>
                    {billingData?.data?.country || '---'}
                  </ThemedText>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.billingField}>
                <ThemedText style={styles.billingLabel}>Postal Code</ThemedText>
                <View style={styles.billingValueContainer}>
                  <ThemedText style={styles.billingValue}>
                    {billingData?.data?.postal_code || '---'}
                  </ThemedText>
                  <TouchableOpacity>
                    <Ionicons name="copy-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Card Limit Modal */}
      <Modal
        visible={cardLimitVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCardLimitVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCardLimitVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Card Limit</ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCardLimitVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Daily Limit */}
            <View style={styles.limitSection}>
              <View style={styles.limitHeader}>
                <ThemedText style={styles.limitHeaderText}>Daily Limit</ThemedText>
              </View>
              <View style={styles.limitContent}>
                <View style={styles.limitRow}>
                  <ThemedText style={styles.limitLabel}>Spending Limit</ThemedText>
                  <ThemedText style={styles.limitValue}>
                    ${limitsData?.data?.daily?.spending_limit ?? 0}
                  </ThemedText>
                </View>
                <View style={[styles.limitRow, styles.limitRowLast]}>
                  <ThemedText style={styles.limitLabel}>Card Transactions</ThemedText>
                  <ThemedText style={styles.limitValue}>
                    {limitsData?.data?.daily?.transaction_limit ?? 0}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Monthly Limit */}
            <View style={styles.limitSection}>
              <View style={styles.limitHeader}>
                <ThemedText style={styles.limitHeaderText}>Monthly Limit</ThemedText>
              </View>
              <View style={styles.limitContent}>
                <View style={styles.limitRow}>
                  <ThemedText style={styles.limitLabel}>Spending Limit</ThemedText>
                  <ThemedText style={styles.limitValue}>
                    ${limitsData?.data?.monthly?.spending_limit ?? 0}
                  </ThemedText>
                </View>
                <View style={[styles.limitRow, styles.limitRowLast]}>
                  <ThemedText style={styles.limitLabel}>Card Transactions</ThemedText>
                  <ThemedText style={styles.limitValue}>
                    {limitsData?.data?.monthly?.transaction_limit ?? 0}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Freeze Card Modal */}
      <Modal
        visible={freezeCardVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFreezeCardVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFreezeCardVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Freeze Card</ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setFreezeCardVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.freezeContent}>
              <View style={styles.warningIconContainer}>
                <View style={styles.warningIconOuter}>
                  <View style={styles.warningIconInner}>
                    <Ionicons name="warning" size={40} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              <ThemedText style={styles.warningTitle}>Warning</ThemedText>
              <ThemedText style={styles.warningText}>
                Freezing your card will make it inactive and you will need to contact support to unfreeze it
              </ThemedText>

              <View style={styles.freezeToggleContainer}>
                <View style={styles.freezeToggleHeader}>
                  <ThemedText style={styles.freezeToggleLabel}>Freeze Card</ThemedText>
                </View>
                <View style={styles.freezeToggleRow}>
                  <ThemedText style={styles.freezeToggleText}>Freeze your card to protect it</ThemedText>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, freezeToggle && styles.toggleSwitchActive]}
                    onPress={handleFreezeToggle}
                  >
                    <View style={[styles.toggleCircle, freezeToggle && styles.toggleCircleActive]} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  topBackground: {
    width,
    height: 399,
    paddingTop: 40,
    alignItems: 'center',
  },
  cardRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 40,
    paddingHorizontal: 0,
  },
  cardsListContent: {
    paddingRight: 12,
  },
  cardWrapper: {
    marginRight: 12,
  },
  cardContainer: {
    width: width - 100,
    height: 190,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 24,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    zIndex: 1,
  },
  emptyCardContainer: {
    width: width - 100,
    height: 190,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emptyCardText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSmallText: {
    fontSize: 8,
    color: '#E5FBE0',
  },
  cardBrandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  cardAmountLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cardCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardAmount: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  cardMaskedNumber: {
    fontSize: 16,
    letterSpacing: 2,
    color: '#E5FBE0',
  },
  cardEyeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  cardHolderName: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  mastercardLogo: {
    width: 40,
    height: 24,
  },
  addCardButton: {
    width: 56,
    height: 190,
    borderRadius: 28,
    backgroundColor: '#BDFFB5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardIcon: {
    width: 24,
    height: 24,
    tintColor: '#1B800F',
  },
  paginationDotWrapper: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    backgroundColor: '#3B7F3F',
    width: 20,
  },
  buttonsBackground: {
    width: width - 25,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: -10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    height: 60,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  actionButtonIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  greenBarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  greenBar: {
    width: 40,
    height: 4,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    paddingVertical:20,
    marginHorizontal: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  innerShadowOverlay: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 18,
    // Inner shadow simulation using shadow with green color at 25% opacity
    shadowColor: '#008000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 0,
    // Use a semi-transparent overlay to enhance the inner shadow effect
    backgroundColor: 'rgba(0, 128, 0, 0.05)',
  },
  gridItemGreen: {
    backgroundColor: '#00800026',
  },
  gridItemYellow: {
    backgroundColor: '#FFA50026',
  },
  gridItemPurple: {
    backgroundColor: '#0000FF26',
  },
  gridItemRed: {
    backgroundColor: '#FF000026',
  },
  gridIconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 18,
  },
  gridIconSquare: {
    width: 32,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIcon: {
    width: 22,
    height: 24,
    tintColor: '#FFFFFF',
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 8,
    color: '#6B7280',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  recentViewAll: {
    fontSize: 12,
    color: '#1B800F',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#D6F5D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionIconImage: {
    width: 20,
    height: 20,
    tintColor: '#1B800F',
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  transactionStatus: {
    marginTop: 4,
    fontSize: 10,
    color: '#16A34A',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  transactionDate: {
    marginTop: 4,
    fontSize: 8,
    color: '#6B7280',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  // Card Details Modal Styles
  modalCardContainer: {
    width: width - 40,
    height: 190,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalCardImage: {
    borderRadius: 24,
  },
  modalCardContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    zIndex: 1,
  },
  modalCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCardSmallText: {
    fontSize: 8,
    color: '#E5FBE0',
  },
  modalCardBrandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCardAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  modalCardAmountLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  modalCardCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCardAmount: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  modalCardEyeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEyeIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  modalCardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  modalCardMaskedNumber: {
    fontSize: 16,
    letterSpacing: 2,
    color: '#E5FBE0',
  },
  modalCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  modalCardHolderName: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modalMastercardLogo: {
    width: 40,
    height: 24,
  },
  cardDetailsList: {
    backgroundColor: '#EFEFEF',
    borderRadius: 20,
    marginHorizontal:15,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  // Billing Address Modal Styles
  billingAddressList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  billingField: {
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  billingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  billingValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    flex: 1,
  },
  // Card Limit Modal Styles
  limitSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  limitHeader: {
    backgroundColor: '#42AC36',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom:30
  },
  limitHeaderText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  limitContent: {
    backgroundColor: '#F3F4F6',
   borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop:-20
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitRowLast: {
    marginBottom: 0,
  },
  limitLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  // Freeze Card Modal Styles
  freezeContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  warningIconContainer: {
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  warningIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFE5CC',
  },
  warningIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  freezeToggleContainer: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  freezeToggleHeader: {
    marginBottom: 12,
  },
  freezeToggleLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  freezeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freezeToggleText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#111827',
    flex: 1,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#1B800F',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});

export default VirtualCardsScreen;


