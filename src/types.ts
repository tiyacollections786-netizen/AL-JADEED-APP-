export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  role: UserRole;
  balance: number; // Cash balance in PKR
  referralCode?: string;
  referredBy?: string;
  status: 'active' | 'suspended';
  bankDetails?: {
    method: string;
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type OwnershipStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface Package {
  id: string;
  name: string;
  breed: string;
  description: string;
  image: string;
  pricePerHen: number; // Rs. 500 default
  eggsPerDay: number; // 1 egg/day default
  durationDays: number; // 120 days default
  maxEggsPerHen: number; // 120 eggs default
  minQuantity: number;
  maxQuantity: number;
  availableQuantity: number;
  benefits: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  // Compatibility fields if needed
  dailyReturnPerHen?: number;
  returnPercentage?: number;
  earningFrequency?: 'daily' | 'weekly' | 'monthly';
}

export type OrderStatus = 'pending' | 'submitted' | 'under_review' | 'verified' | 'approved' | 'rejected' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "AJME-ORD-000001"
  paymentId: string; // e.g. "AJME-PAY-000001"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  packageId: string;
  packageName: string;
  quantity: number;
  pricePerHen: number;
  subtotal: number;
  fees: number;
  totalAmount: number; // Expected Amount
  submittedAmount?: number; // User confirmed amount
  dailyProduction: number; // quantity * eggsPerDay
  durationDays: number; // 120
  maxProduction: number; // quantity * maxEggsPerHen
  status: OrderStatus;
  paymentStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  henStatus: 'Awaiting Approval' | 'Active' | 'Not Assigned';
  paymentMethod: string;
  paymentReference: string; // Transaction ID
  senderAccount?: string; // Sender mobile/bank name
  paymentProofUrl?: string; // Screenshot base64 / image URL
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface HenOwnership {
  id: string;
  ownershipId: string; // e.g. "HEN CYCLE #AJME-0001"
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  breed: string;
  orderId?: string;
  numberOfHens: number;
  pricePerHen: number;
  totalInvested: number;
  dailyEggs: number; // numberOfHens * 1
  totalCycleEggs: number; // numberOfHens * 120
  daysCompleted: number; // 0 to 120 (starts at 1 immediately upon activation)
  daysRemaining: number; // 120 - daysCompleted
  eggsEarned: number; // numberOfHens * daysCompleted
  remainingEggs: number; // totalCycleEggs - eggsEarned
  status: OwnershipStatus;
  purchaseDate: string;
  expiryDate: string;
  activatedAt?: string; // exact server timestamp when hen was assigned/activated
  productionStartTime?: string; // exact timestamp of activation
  productionEndTime?: string; // activation + 120 days
  nextEarningDate?: string; // exact server timestamp of next egg cycle
  lastProductionDate?: string;
  completedAt?: string;
  createdAt: string;
  // Legacy / compatibility
  dailyReturnPerHen?: number;
  totalEarned?: number;
}

export interface EggProductionRecord {
  id: string;
  cycleId: string;
  cycleRef: string;
  userId: string;
  hens: number;
  eggs: number;
  dayNumber: number;
  date: string;
  source?: string; // 'Immediate First Egg Credited upon Hen Activation' | 'Automatic 24-Hour Production'
  createdAt: string;
}

export interface EggBalance {
  userId: string;
  totalEarnedEggs: number;
  todayEggs: number;
  availableEggs: number;
  soldEggs: number;
}

export interface EggSale {
  id: string;
  saleId: string; // e.g. "AJME-SALE-104"
  userId: string;
  userName: string;
  quantity: number;
  eggPrice: number; // Rs. per egg
  totalAmount: number; // Rs.
  status: 'completed' | 'pending';
  createdAt: string;
}

export type TransactionType =
  | 'purchase'
  | 'hen_purchase'
  | 'egg_production'
  | 'egg_sale'
  | 'withdrawal'
  | 'referral_reward'
  | 'adjustment'
  | 'refund';

export interface Transaction {
  id: string;
  referenceId: string; // e.g. "TXN-84920"
  userId: string;
  userName?: string;
  type: TransactionType;
  quantity?: number; // eggs or hens
  amount: number; // in PKR
  fee: number;
  netAmount: number;
  balanceAfter: number;
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface Withdrawal {
  id: string;
  withdrawalId: string; // e.g. "AJME-WTH-882"
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  status: WithdrawalStatus;
  adminNotes?: string;
  payoutReference?: string;
  createdAt: string;
  processedAt?: string;
}

export type NotificationType =
  | 'order'
  | 'payment'
  | 'ownership'
  | 'production'
  | 'egg_sale'
  | 'earning'
  | 'withdrawal'
  | 'system';

export interface Notification {
  id: string;
  userId: string | null; // null for broadcast
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface LocationItem {
  id: string;
  name: string;
  type: 'farm' | 'center' | 'office';
  address: string;
  city: string;
  phone: string;
  timings: string;
  status: 'active' | 'inactive';
}

export interface WhatsAppSupportSettings {
  enabled: boolean;
  number: string;
  displayName?: string;
  welcomeMessage?: string;
  enableFloatingButton?: boolean;
}

export interface WhatsAppChannelSettings {
  enabled: boolean;
  channelUrl: string;
  channelName: string;
  description?: string;
}

export interface WhatsAppSettings {
  support: WhatsAppSupportSettings;
  channel: WhatsAppChannelSettings;
}

export interface PlatformSettings {
  platformName: string;
  siteName?: string;
  henPrice: number; // Rs. 500
  eggsPerHenPerDay: number; // 1
  productionDurationDays: number; // 120
  eggMonetaryValue: number; // Rs. 15 (admin-configurable egg sale price)
  minPurchaseQuantity: number; // 1
  maxPurchaseQuantity: number; // 100
  minWithdrawal: number; // 0 for 'No Minimum'
  minWithdrawalAmount?: number; // Optional alias for backwards compatibility
  withdrawalFeePercent: number; // 0
  referralRewardEggs: number; // 0 or bonus eggs
  referralRewardCash: number; // 50 (PKR bonus per referred hen purchase)
  currencySymbol: string;
  currencyCode: string;
  contactEmail: string;
  contactPhone: string;
  supportWhatsApp: string;
  whatsapp?: WhatsAppSettings;
  locations: LocationItem[];
  paymentMethods: {
    bankTransfer: {
      enabled: boolean;
      bankName: string;
      accountTitle: string;
      accountNumber: string;
      iban: string;
      instructions: string;
      logoUrl?: string;
    };
    easypaisa: {
      enabled: boolean;
      accountTitle: string;
      accountNumber: string;
      instructions: string;
      logoUrl?: string;
    };
    jazzcash: {
      enabled: boolean;
      accountTitle: string;
      accountNumber: string;
      instructions: string;
      logoUrl?: string;
    };
    sadapay: {
      enabled: boolean;
      accountTitle: string;
      accountNumber: string;
      iban?: string;
      instructions: string;
      logoUrl?: string;
    };
    crypto?: {
      enabled: boolean;
      network: string;
      walletAddress: string;
      instructions: string;
      logoUrl?: string;
    };
  };
}

export interface CustomerDashboardData {
  totalHens: number;
  activeHens: number;
  dailyEggs: number;
  cycleProgressAvg: number; // e.g. 35 / 120
  totalEggsEarned: number;
  availableEggs: number;
  soldEggs: number;
  todayEggs: number;
  totalPurchases: number; // in PKR
  activeCycles: number;
  availableBalance: number; // in PKR
  pendingWithdrawals: number;
  pendingBalance: number;
  totalWithdrawn: number;
  eggPrice: number; // Current admin egg selling price
  rewards: {
    dailyEggs: number;
    referralRewards: number;
    bonus: number;
    specialRewards: number;
  };
  activeOwnerships: HenOwnership[];
  recentProductions: EggProductionRecord[];
  recentTransactions: Transaction[];
  unreadNotificationsCount: number;
  referralCount: number;
  referralEarnings: number;
  pendingOrdersCount?: number;
  pendingHensCount?: number;
  // Real-time authoritative egg earning fields
  isEarningActive?: boolean;
  nextEarningTime?: string | null; // ISO timestamp of next egg cycle
  nextEarningSeconds?: number; // seconds remaining
  nextEggBatchCount?: number; // quantity of eggs due next
  totalCycleEggsMax?: number; // e.g. 10 hens = 1,200 eggs total
  totalEarnedActiveFlock?: number; // total eggs earned across active flock
  serverTime?: string; // ISO timestamp for client sync
}

export interface AdminDashboardData {
  totalUsers: number;
  totalCustomers: number;
  totalHens?: number;
  totalHensSold: number;
  activeHens: number;
  completedCycles: number;
  eggsProduced?: number;
  totalEggsProduced?: number;
  todayEggs?: number;
  eggsSold: number;
  totalPurchases: number; // PKR
  totalSales: number; // PKR
  totalWithdrawals?: number;
  pendingOrders?: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  totalPaymentValue: number;
  pendingWithdrawals: number;
  currentHenPrice: number;
  currentEggPrice: number;
  recentOrders: Order[];
  recentWithdrawals: Withdrawal[];
  recentEggSales: EggSale[];
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  targetId?: string;
  createdAt: string;
}

// For compatibility with earlier earning records if needed
export interface EarningRecord {
  id: string;
  ownershipId: string;
  ownershipRef: string;
  userId: string;
  packageName: string;
  numberOfHens: number;
  perHenAmount: number;
  totalAmount: number;
  date: string;
  status: 'credited' | 'pending';
  notes?: string;
  createdAt: string;
}
