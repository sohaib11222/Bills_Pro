import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';
import { useWalletBalance } from '../../queries/walletQueries';
import { useVirtualCards } from '../../queries/virtualCardQueries';
import type { BillPaymentSourceValue, BillPaymentWalletType } from '../../types/billPayment';

type Props = {
  value: BillPaymentSourceValue;
  onChange: (v: BillPaymentSourceValue) => void;
};

const BillPaymentSourceSelector = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const { data: walletData, isLoading: walletLoading } = useWalletBalance();
  const { data: cardsData, isLoading: cardsLoading } = useVirtualCards();

  const nairaBalance = walletData?.data?.fiat?.balance ?? 0;
  const cryptoBalanceUsd = walletData?.data?.crypto?.total_usd ?? 0;
  const cards: any[] = cardsData?.data || [];
  const firstCardId = cards[0]?.id ?? null;

  const pickType = (type: BillPaymentWalletType) => {
    if (type === 'virtual_card') {
      onChange({
        type,
        virtualCardId: value.virtualCardId ?? firstCardId ?? null,
      });
    } else {
      onChange({ type, virtualCardId: null });
    }
    setOpen(false);
  };

  const displayLabel = useMemo(() => {
    if (value.type === 'naira_wallet') return 'Naira wallet';
    if (value.type === 'crypto_wallet') return 'Crypto wallet';
    const c = cards.find((x) => x.id === value.virtualCardId);
    if (c) {
      const name = c.card_name || c.masked_number || `Card #${c.id}`;
      return name;
    }
    return 'Virtual card';
  }, [value.type, value.virtualCardId, cards]);

  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.fieldLabel}>Pay from</ThemedText>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setOpen(!open)}
        activeOpacity={0.85}
      >
        <ThemedText style={styles.selectorText} numberOfLines={1}>
          {displayLabel}
        </ThemedText>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => pickType('naira_wallet')}
            activeOpacity={0.85}
          >
            <View style={[styles.walletIconCircle, styles.walletIconNaira]}>
              <Image
                source={require('../../assets/emojione_flag-for-nigeria.png')}
                style={styles.walletFlagIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.walletTextContainer}>
              <ThemedText style={styles.walletTitle}>Naira wallet</ThemedText>
              <ThemedText style={styles.walletSubtitle}>
                {walletLoading ? '…' : `₦${Number(nairaBalance).toLocaleString()}`}
              </ThemedText>
            </View>
            <View
              style={[
                styles.walletRadioOuter,
                value.type === 'naira_wallet' && styles.walletRadioActive,
              ]}
            >
              {value.type === 'naira_wallet' && <View style={styles.walletRadioInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.walletDivider} />

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => pickType('crypto_wallet')}
            activeOpacity={0.85}
          >
            <View style={[styles.walletIconCircle, styles.walletIconCrypto]}>
              <Image
                source={require('../../assets/Vector (52).png')}
                style={styles.walletCryptoIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.walletTextContainer}>
              <ThemedText style={styles.walletTitle}>Crypto wallet</ThemedText>
              <ThemedText style={styles.walletSubtitle}>
                {walletLoading ? '…' : `$${Number(cryptoBalanceUsd).toLocaleString()}`}
              </ThemedText>
            </View>
            <View
              style={[
                styles.walletRadioOuter,
                value.type === 'crypto_wallet' && styles.walletRadioActive,
              ]}
            >
              {value.type === 'crypto_wallet' && <View style={styles.walletRadioInner} />}
            </View>
          </TouchableOpacity>

          <View style={styles.walletDivider} />

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => pickType('virtual_card')}
            activeOpacity={0.85}
            disabled={cards.length === 0}
          >
            <View style={[styles.walletIconCircle, styles.walletIconCard]}>
              <Ionicons name="card-outline" size={20} color="#1B800F" />
            </View>
            <View style={styles.walletTextContainer}>
              <ThemedText style={styles.walletTitle}>Virtual card</ThemedText>
              <ThemedText style={styles.walletSubtitle}>
                {cardsLoading ? '…' : cards.length === 0 ? 'No cards' : `${cards.length} card(s)`}
              </ThemedText>
            </View>
            <View
              style={[
                styles.walletRadioOuter,
                value.type === 'virtual_card' && styles.walletRadioActive,
              ]}
            >
              {value.type === 'virtual_card' && <View style={styles.walletRadioInner} />}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {value.type === 'virtual_card' && cards.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardPickScroll}
          contentContainerStyle={styles.cardPickContent}
        >
          {cards.map((c) => {
            const selected = value.virtualCardId === c.id;
            const label = c.card_name || c.masked_number || `Card #${c.id}`;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.cardChip, selected && styles.cardChipSelected]}
                onPress={() => onChange({ type: 'virtual_card', virtualCardId: c.id })}
                activeOpacity={0.85}
              >
                <ThemedText
                  style={[styles.cardChipText, selected && styles.cardChipTextSelected]}
                  numberOfLines={1}
                >
                  {label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
    zIndex: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginRight: 8,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconNaira: {
    backgroundColor: 'rgba(27, 128, 15, 0.12)',
  },
  walletIconCrypto: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  walletIconCard: {
    backgroundColor: 'rgba(27, 128, 15, 0.12)',
  },
  walletFlagIcon: {
    width: 22,
    height: 22,
  },
  walletCryptoIcon: {
    width: 22,
    height: 22,
  },
  walletTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  walletTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  walletSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  walletRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletRadioActive: {
    borderColor: '#1B800F',
  },
  walletRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1B800F',
  },
  walletDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },
  cardPickScroll: {
    marginTop: 10,
    maxHeight: 44,
  },
  cardPickContent: {
    gap: 8,
    paddingRight: 8,
  },
  cardChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    maxWidth: 200,
  },
  cardChipSelected: {
    backgroundColor: 'rgba(27, 128, 15, 0.15)',
    borderWidth: 1,
    borderColor: '#1B800F',
  },
  cardChipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  cardChipTextSelected: {
    color: '#1B800F',
    fontWeight: '600',
  },
});

export default BillPaymentSourceSelector;
