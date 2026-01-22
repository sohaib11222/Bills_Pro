/**
 * API Configuration
 * Base URL and all API routes
 */

export const API_BASE_URL = 'https://billspro.hmstech.xyz/api';

// Authentication Routes
export const AUTH_ROUTES = {
  register: '/auth/register',
  login: '/auth/login',
  verifyEmailOtp: '/auth/verify-email-otp',
  resendOtp: '/auth/resend-otp',
  forgotPassword: '/auth/forgot-password',
  verifyPasswordResetOtp: '/auth/verify-password-reset-otp',
  resetPassword: '/auth/reset-password',
  setPin: '/auth/set-pin',
  checkPinStatus: '/auth/check-pin-status',
  verifyPin: '/auth/verify-pin',
};

// Dashboard Routes
export const DASHBOARD_ROUTES = {
  index: '/dashboard',
};

// Wallet Routes
export const WALLET_ROUTES = {
  balance: '/wallet/balance',
  fiat: '/wallet/fiat',
  crypto: '/wallet/crypto',
};

// Deposit Routes
export const DEPOSIT_ROUTES = {
  bankAccount: '/deposit/bank-account',
  initiate: '/deposit/initiate',
  confirm: '/deposit/confirm',
  history: '/deposit/history',
  show: (reference) => `/deposit/${reference}`,
};

// Withdrawal Routes
export const WITHDRAWAL_ROUTES = {
  bankAccounts: '/withdrawal/bank-accounts',
  addBankAccount: '/withdrawal/bank-accounts',
  updateBankAccount: (id) => `/withdrawal/bank-accounts/${id}`,
  setDefaultBankAccount: (id) => `/withdrawal/bank-accounts/${id}/set-default`,
  deleteBankAccount: (id) => `/withdrawal/bank-accounts/${id}`,
  fee: '/withdrawal/fee',
  withdraw: '/withdrawal',
  transactions: '/withdrawal/transactions',
  transaction: (transactionId) => `/withdrawal/transactions/${transactionId}`,
};

// Transaction Routes
export const TRANSACTION_ROUTES = {
  index: '/transactions',
  all: '/transactions/all',
  billPayments: '/transactions/bill-payments',
  withdrawals: '/transactions/withdrawals',
  deposits: '/transactions/deposits',
  fiat: '/transactions/fiat',
  stats: '/transactions/stats',
  show: (transactionId) => `/transactions/${transactionId}`,
};

// KYC Routes
export const KYC_ROUTES = {
  submit: '/kyc',
  get: '/kyc',
};

// Bill Payment Routes
export const BILL_PAYMENT_ROUTES = {
  categories: '/bill-payment/categories',
  providers: '/bill-payment/providers',
  plans: '/bill-payment/plans',
  validateMeter: '/bill-payment/validate-meter',
  validateAccount: '/bill-payment/validate-account',
  preview: '/bill-payment/preview',
  initiate: '/bill-payment/initiate',
  confirm: '/bill-payment/confirm',
  beneficiaries: '/bill-payment/beneficiaries',
  createBeneficiary: '/bill-payment/beneficiaries',
  updateBeneficiary: (id) => `/bill-payment/beneficiaries/${id}`,
  deleteBeneficiary: (id) => `/bill-payment/beneficiaries/${id}`,
};

// Crypto Routes
export const CRYPTO_ROUTES = {
  usdtBlockchains: '/crypto/usdt/blockchains',
  accounts: '/crypto/accounts',
  accountDetails: (currency) => `/crypto/accounts/${currency}`,
  depositAddress: '/crypto/deposit-address',
  exchangeRate: '/crypto/exchange-rate',
  buyPreview: '/crypto/buy/preview',
  buyConfirm: '/crypto/buy/confirm',
  sellPreview: '/crypto/sell/preview',
  sellConfirm: '/crypto/sell/confirm',
  send: '/crypto/send',
};

// Virtual Card Routes
export const VIRTUAL_CARD_ROUTES = {
  index: '/virtual-cards',
  create: '/virtual-cards',
  show: (id) => `/virtual-cards/${id}`,
  fund: (id) => `/virtual-cards/${id}/fund`,
  withdraw: (id) => `/virtual-cards/${id}/withdraw`,
  transactions: (id) => `/virtual-cards/${id}/transactions`,
  billingAddress: (id) => `/virtual-cards/${id}/billing-address`,
  updateBillingAddress: (id) => `/virtual-cards/${id}/billing-address`,
  limits: (id) => `/virtual-cards/${id}/limits`,
  updateLimits: (id) => `/virtual-cards/${id}/limits`,
  freeze: (id) => `/virtual-cards/${id}/freeze`,
  unfreeze: (id) => `/virtual-cards/${id}/unfreeze`,
};

// Support Routes
export const SUPPORT_ROUTES = {
  index: '/support',
  tickets: '/support/tickets',
  createTicket: '/support/tickets',
  ticket: (id) => `/support/tickets/${id}`,
  updateTicket: (id) => `/support/tickets/${id}`,
  closeTicket: (id) => `/support/tickets/${id}/close`,
};

// Chat Routes
export const CHAT_ROUTES = {
  session: '/chat/session',
  sessions: '/chat/sessions',
  start: '/chat/start',
  sessionDetails: (id) => `/chat/sessions/${id}`,
  sendMessage: (id) => `/chat/sessions/${id}/messages`,
  getMessages: (id) => `/chat/sessions/${id}/messages`,
  markAsRead: (id) => `/chat/sessions/${id}/read`,
  closeSession: (id) => `/chat/sessions/${id}/close`,
};

// User Routes
export const USER_ROUTES = {
  profile: '/user/profile',
  updateProfile: '/user/profile',
  notifications: '/user/notifications',
  markNotificationAsRead: (id) => `/user/notifications/${id}/read`,
  markAllNotificationsAsRead: '/user/notifications/read-all',
};

// Export all routes
export const API_ROUTES = {
  ...AUTH_ROUTES,
  ...DASHBOARD_ROUTES,
  ...WALLET_ROUTES,
  ...DEPOSIT_ROUTES,
  ...WITHDRAWAL_ROUTES,
  ...TRANSACTION_ROUTES,
  ...KYC_ROUTES,
  ...BILL_PAYMENT_ROUTES,
  ...CRYPTO_ROUTES,
  ...VIRTUAL_CARD_ROUTES,
  ...SUPPORT_ROUTES,
  ...CHAT_ROUTES,
  ...USER_ROUTES,
};
