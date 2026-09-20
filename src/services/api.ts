import {
  User,
  Package,
  Order,
  HenOwnership,
  EggBalance,
  EggProductionRecord,
  EggSale,
  Transaction,
  Withdrawal,
  Notification,
  PlatformSettings,
  CustomerDashboardData,
  AdminDashboardData,
  AuditLog,
  EarningRecord,
} from '../types';

const TOKEN_KEY = 'aljadeed_meta_eggs_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Storage error', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

export const api = {
  // Public
  getSettings: () => request<PlatformSettings>('/api/settings'),

  // Auth
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    referralCode?: string;
  }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email?: string; identifier?: string; phone?: string; password: string; updatePasswordIfMismatch?: boolean }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  otpLogin: (payload: { identifier: string; code?: string; newPassword?: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/otp-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminLogin: (payload: { username?: string; identifier?: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminChangePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/admin/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (identifier: string) =>
    request<{ message: string; resetCode?: string; email?: string; phone?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  resetPassword: (payload: { identifier: string; resetCode: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<User>('/api/auth/me'),

  updateProfile: (payload: {
    name?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    bankDetails?: any;
  }) =>
    request<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Packages
  getPackages: () => request<Package[]>('/api/packages'),
  getPackage: (id: string) => request<Package>(`/api/packages/${id}`),

  // Orders
  createOrder: (payload: {
    packageId: string;
    quantity: number;
    paymentMethod: string;
    paymentReference?: string;
    senderAccount?: string;
    submittedAmount?: number;
    paymentProofUrl?: string;
  }) =>
    request<{ message: string; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrders: () => request<Order[]>('/api/orders'),
  getMyOrders: () => request<Order[]>('/api/orders'),
  getOrder: (id: string) => request<Order>(`/api/orders/${id}`),

  submitOrderPayment: (
    id: string,
    payload: {
      paymentMethod?: string;
      paymentReference: string;
      senderAccount?: string;
      submittedAmount?: number;
      paymentProofUrl?: string;
    }
  ) =>
    request<{ message: string; order: Order }>(`/api/orders/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Customer Dashboard & Hen Ownership
  getCustomerDashboard: () => request<CustomerDashboardData>('/api/customer/dashboard'),
  getMyHens: () => request<CustomerDashboardData>('/api/my-hens'),

  // My Eggs
  getMyEggs: () =>
    request<{
      balance: EggBalance;
      productions: EggProductionRecord[];
      eggPrice: number;
      currencySymbol: string;
      isEarningActive?: boolean;
      nextEarningTime?: string | null;
      nextEarningSeconds?: number;
      nextEggBatchCount?: number;
      totalCycleEggsMax?: number;
      totalEarnedActiveFlock?: number;
      activeHens?: number;
      dailyEggs?: number;
      activeCycles?: number;
      serverTime?: string;
    }>('/api/my-eggs'),

  syncEggEarnings: () =>
    request<{
      message: string;
      newlyEarned: number;
      newlyProcessedCycles: number;
      completedCyclesCount: number;
      dashboard: CustomerDashboardData;
    }>('/api/eggs/sync', {
      method: 'POST',
    }),

  // Sell Eggs
  sellEggs: (quantity: number) =>
    request<{
      message: string;
      sale: EggSale;
      newBalance: number;
      newAvailableEggs: number;
    }>('/api/eggs/sell', {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    }),

  // Transactions
  getTransactions: () => request<Transaction[]>('/api/transactions'),
  getMyTransactions: () => request<Transaction[]>('/api/transactions'),

  // Withdrawals
  requestWithdrawal: (payload: {
    amount: number;
    method: string;
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
  }) =>
    request<{ message: string; withdrawal: Withdrawal; newBalance: number }>('/api/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  createWithdrawal: (payload: {
    amount: number;
    method: string;
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
  }) =>
    request<{ message: string; withdrawal: Withdrawal; newBalance: number }>('/api/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getWithdrawals: () => request<Withdrawal[]>('/api/withdrawals'),
  getMyWithdrawals: () => request<Withdrawal[]>('/api/withdrawals'),

  // Referrals
  getReferrals: () =>
    request<{
      referralCode: string;
      referralCount: number;
      referralEarnings: number;
      referredUsers: Array<{ id: string; name: string; joinedAt: string; totalHens: number }>;
      history: Transaction[];
    }>('/api/referrals'),

  // Notifications
  getNotifications: () => request<Notification[]>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),

  // ================= ADMIN API =================
  getAdminOverview: () => request<AdminDashboardData>('/api/admin/overview'),
  getAdminDashboard: () => request<AdminDashboardData>('/api/admin/overview'),
  getAdminCustomers: () =>
    request<
      Array<
        User & {
          totalHens: number;
          totalInvested: number;
          eggBalance: EggBalance;
        }
      >
    >('/api/admin/customers'),

  updateCustomerStatus: (id: string, status: 'active' | 'suspended') =>
    request<{ message: string; user: User }>(`/api/admin/customers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getAdminPackages: () => request<Package[]>('/api/admin/packages'),
  createPackage: (payload: Partial<Package>) =>
    request<{ message: string; package: Package }>('/api/admin/packages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePackage: (id: string, payload: Partial<Package>) =>
    request<{ message: string; package: Package }>(`/api/admin/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deletePackage: (id: string) =>
    request<{ message: string }>(`/api/admin/packages/${id}`, { method: 'DELETE' }),

  getAdminOrders: () => request<Order[]>('/api/admin/orders'),
  approveOrder: (id: string, adminNotes?: string) =>
    request<{ message: string; order: Order; ownership: HenOwnership }>(
      `/api/admin/orders/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ adminNotes }),
      }
    ),
  rejectOrder: (id: string, reason?: string) =>
    request<{ message: string; order: Order }>(`/api/admin/orders/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  markOrderUnderReview: (id: string) =>
    request<{ message: string; order: Order }>(`/api/admin/orders/${id}/under-review`, {
      method: 'POST',
    }),

  updateOrderStatus: (
    id: string,
    paymentStatus: 'approved' | 'rejected' | 'pending',
    orderStatus?: string,
    adminNotes?: string
  ) => {
    if (paymentStatus === 'approved') {
      return request<{ message: string; order: Order; ownership: HenOwnership }>(
        `/api/admin/orders/${id}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({ adminNotes }),
        }
      );
    } else {
      return request<{ message: string; order: Order }>(`/api/admin/orders/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: adminNotes }),
      });
    }
  },

  getAdminHenOwnerships: () => request<HenOwnership[]>('/api/admin/hen-ownership'),
  getAdminHens: () => request<HenOwnership[]>('/api/admin/hen-ownership'),
  assignHens: (payload: {
    userId: string;
    packageId?: string;
    numberOfHens: number;
    pricePerHen?: number;
    status?: string;
  }) =>
    request<{ message: string; ownership: HenOwnership }>('/api/admin/hen-ownership/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createAdminHenAllocation: (payload: {
    userId: string;
    packageId?: string;
    quantity: number;
  }) =>
    request<{ message: string; ownership: HenOwnership }>('/api/admin/hen-ownership/assign', {
      method: 'POST',
      body: JSON.stringify({
        userId: payload.userId,
        packageId: payload.packageId,
        numberOfHens: payload.quantity,
      }),
    }),
  updateHenOwnershipStatus: (id: string, status: string) =>
    request<{ message: string; ownership: HenOwnership }>(`/api/admin/hen-ownership/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  updateAdminHenStatus: (id: string, status: string) =>
    request<{ message: string; ownership: HenOwnership }>(`/api/admin/hen-ownership/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Run Daily Egg Production
  runDailyEggProduction: () =>
    request<{
      message: string;
      cyclesProcessed: number;
      eggsProducedTotal: number;
      completedCyclesCount: number;
      usersCreditedCount: number;
    }>('/api/admin/eggs/run-production', { method: 'POST' }),

  triggerEarningsDistribution: () =>
    request<{
      message: string;
      cyclesProcessed: number;
      eggsProducedTotal: number;
      completedCyclesCount: number;
      usersCreditedCount: number;
    }>('/api/admin/eggs/run-production', { method: 'POST' }),

  getAdminWithdrawals: () => request<Withdrawal[]>('/api/admin/withdrawals'),
  processWithdrawal: (id: string, action: 'approve' | 'paid' | 'reject', adminNotes?: string) =>
    request<{ message: string; withdrawal: Withdrawal }>(`/api/admin/withdrawals/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({ action, adminNotes }),
    }),

  updateWithdrawalStatus: (
    id: string,
    status: 'approved' | 'rejected',
    payoutReference?: string,
    adminNotes?: string
  ) =>
    request<{ message: string; withdrawal: Withdrawal }>(`/api/admin/withdrawals/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({
        action: status === 'approved' ? 'paid' : 'reject',
        payoutReference,
        adminNotes,
      }),
    }),

  getAdminTransactions: () => request<Transaction[]>('/api/admin/transactions'),
  getAdminAuditLogs: () => request<AuditLog[]>('/api/admin/audit-logs'),

  updateSettings: (payload: Partial<PlatformSettings>) =>
    request<{ message: string; settings: PlatformSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateAdminSettings: (payload: Partial<PlatformSettings>) =>
    request<{ message: string; settings: PlatformSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  trackAnalytics: (event: 'whatsapp_support' | 'whatsapp_channel') =>
    request<{ success: boolean }>('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event }),
    }).catch(() => ({ success: false })),

  broadcastNotification: (payload: { title: string; message: string }) =>
    request<{ message: string; notification: Notification }>('/api/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminEggLedger: () => request<EggProductionRecord[]>('/api/admin/egg-production-ledger'),

  getAdminLocations: () => request<any[]>('/api/admin/locations'),
  createAdminLocation: (payload: any) =>
    request<{ message: string; location: any }>('/api/admin/locations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteAdminLocation: (id: string) =>
    request<{ message: string }>(`/api/admin/locations/${id}`, { method: 'DELETE' }),

  // Legacy alias
  triggerDailyEarnings: () =>
    request<{
      message: string;
      cyclesProcessed: number;
      eggsProducedTotal: number;
      completedCyclesCount: number;
      usersCreditedCount: number;
    }>('/api/admin/eggs/run-production', { method: 'POST' }),

  // Database & Cloud Sync
  getDatabaseStatus: () =>
    request<{
      firebase: {
        connected: boolean;
        projectId: string | null;
        databaseId: string | null;
        authDomain: string | null;
        storageBucket: string | null;
        status: string;
      };
      supabase: {
        configured: boolean;
        url: string | null;
        status: string;
      };
    }>('/api/database/status'),

  testSupabase: (payload: { url: string; anonKey: string }) =>
    request<{ success: boolean; message: string }>('/api/database/test-supabase', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSupabaseSchema: async (): Promise<string> => {
    const res = await fetch('/api/database/supabase/schema');
    return res.text();
  },

  syncAllToDatabase: () =>
    request<{
      success: boolean;
      message: string;
      stats: { usersSynced: number; ordersSynced: number; hensSynced: number; withdrawalsSynced: number };
    }>('/api/database/sync-all', { method: 'POST' }),
};
