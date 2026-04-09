/**
 * Bill payment funding source — aligns with backend + virtual card wallet fields
 * (`payment_wallet_type`, `payment_wallet_currency`, optional `virtual_card_id`).
 */
export type BillPaymentWalletType = 'naira_wallet' | 'crypto_wallet' | 'virtual_card';

export type BillPaymentSourceValue = {
  type: BillPaymentWalletType;
  virtualCardId: number | null;
};

export const DEFAULT_BILL_PAYMENT_SOURCE: BillPaymentSourceValue = {
  type: 'naira_wallet',
  virtualCardId: null,
};

export function billPaymentWalletPayload(
  source: BillPaymentSourceValue
): {
  payment_wallet_type: BillPaymentWalletType;
  payment_wallet_currency?: string;
  virtual_card_id?: number;
} {
  const { type, virtualCardId } = source;
  if (type === 'naira_wallet') {
    return { payment_wallet_type: 'naira_wallet', payment_wallet_currency: 'NGN' };
  }
  if (type === 'crypto_wallet') {
    return { payment_wallet_type: 'crypto_wallet', payment_wallet_currency: 'USD' };
  }
  const payload: {
    payment_wallet_type: 'virtual_card';
    payment_wallet_currency: string;
    virtual_card_id?: number;
  } = {
    payment_wallet_type: 'virtual_card',
    payment_wallet_currency: 'USD',
  };
  if (virtualCardId != null) {
    payload.virtual_card_id = virtualCardId;
  }
  return payload;
}

export function validateBillPaymentSource(
  source: BillPaymentSourceValue,
  virtualCardCount: number
): string | null {
  if (source.type === 'virtual_card') {
    if (virtualCardCount === 0) {
      return 'Create a virtual card first to pay from card balance.';
    }
    if (source.virtualCardId == null) {
      return 'Select which card to charge.';
    }
  }
  return null;
}
