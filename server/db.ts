import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Package,
  Order,
  HenOwnership,
  OwnershipStatus,
  EggProductionRecord,
  EggBalance,
  EggSale,
  Transaction,
  Withdrawal,
  Notification,
  PlatformSettings,
  WhatsAppSettings,
  CustomerDashboardData,
  AdminDashboardData,
  AuditLog,
  LocationItem,
  EarningRecord,
} from '../src/types';

interface DatabaseSchema {
  users: User[];
  packages: Package[];
  orders: Order[];
  hen_ownership: HenOwnership[];
  egg_productions: EggProductionRecord[];
  egg_balances: Record<string, EggBalance>; // userId -> EggBalance
  egg_sales: EggSale[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
  settings: PlatformSettings;
  audit_logs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'aljadeed_meta_eggs_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultSettings: PlatformSettings = {
  platformName: 'Al Jadeed Meta Eggs',
  henPrice: 500, // Rs. 500 default
  eggsPerHenPerDay: 1, // 1 egg per day
  productionDurationDays: 120, // 120 days cycle
  eggMonetaryValue: 15, // Rs. 15 per egg when sold (admin configurable)
  minPurchaseQuantity: 1,
  maxPurchaseQuantity: 100,
  minWithdrawal: 0,
  minWithdrawalAmount: 0,
  withdrawalFeePercent: 0,
  referralRewardEggs: 0,
  referralRewardCash: 50, // Rs. 50 per hen purchase by referee
  currencySymbol: 'Rs.',
  currencyCode: 'PKR',
  contactEmail: 'support@aljadeedmetaeggs.com',
  contactPhone: '+92 300 8476546',
  supportWhatsApp: '+92 300 8476546',
  whatsapp: {
    support: {
      enabled: true,
      number: '03008476546',
      displayName: 'Al Jadeed Official Support',
      welcomeMessage: 'Hello, I need help regarding my Al Jadeed Meta Eggs account.',
      enableFloatingButton: true,
    },
    channel: {
      enabled: true,
      channelUrl: 'https://whatsapp.com/channel/0029Vaexample',
      channelName: 'Al Jadeed Meta Eggs Official Channel',
      description: 'Get latest updates, announcements and news.',
    },
  },
  locations: [
    {
      id: 'loc-farm-01',
      name: 'Al Jadeed Digital Poultry Farm',
      type: 'farm',
      address: 'Near Motorway Interchange, Sheikhupura Road',
      city: 'Punjab, Pakistan',
      phone: '+92 300 8476546',
      timings: 'Mon - Sat: 08:00 AM - 05:00 PM',
      status: 'active',
    },
    {
      id: 'loc-center-02',
      name: 'Al Jadeed Egg Grading & Distribution Center',
      type: 'center',
      address: 'Wholesale Poultry Mandi, Badami Bagh',
      city: 'Lahore, Punjab, Pakistan',
      phone: '+92 312 8476546',
      timings: 'Mon - Sun: 06:00 AM - 08:00 PM',
      status: 'active',
    },
    {
      id: 'loc-office-03',
      name: 'Al Jadeed Agri-Fintech Operations Hub',
      type: 'office',
      address: 'Commercial Zone, Gulberg III',
      city: 'Lahore, Pakistan',
      phone: '+92 300 8476546',
      timings: 'Mon - Fri: 09:00 AM - 06:00 PM',
      status: 'active',
    },
  ],
  paymentMethods: {
    bankTransfer: {
      enabled: true,
      bankName: 'UBL — United Bank Limited',
      accountTitle: 'Muhammad Murtaza',
      accountNumber: '23623995142254',
      iban: 'PK72UNIL023623995142254',
      instructions: 'Transfer the exact order amount via UBL App or 1-Link IBFT. Keep your transfer receipt.',
    },
    easypaisa: {
      enabled: true,
      accountTitle: 'Muhammad Murtaza',
      accountNumber: '03008476546',
      instructions: 'Send money via EasyPaisa App to 03008476546. Enter your 3737 TID in verification field.',
    },
    jazzcash: {
      enabled: true,
      accountTitle: 'Muhammad Murtaza',
      accountNumber: '03063300658',
      instructions: 'Pay via JazzCash App to 03063300658. Provide your 12-digit transaction ID.',
    },
    sadapay: {
      enabled: true,
      accountTitle: 'Muhammad Murtaza',
      accountNumber: '03008476546',
      iban: 'PK56SADA00000003008476546',
      instructions: 'Send payment via SadaPay App to 03008476546. Enter the Reference Number or Transaction ID.',
    },
    crypto: {
      enabled: true,
      network: 'USDT (TRC-20)',
      walletAddress: 'TYDzsYq7sWJgXbkmNqp4K5T8Wc4D91xyz',
      instructions: 'Transfer USDT equivalent (Rate: 1 USDT = Rs. 280). Paste your TxHash transaction hash.',
    },
  },
};

const defaultPackages: Package[] = [
  {
    id: 'pkg-al-jadeed-hen',
    name: 'AL JADEED HEN',
    breed: 'Al Jadeed High-Yield Layer',
    description: 'Our signature commercial layer breed optimized for resilient, automated aviary conditions. Produces 1 pure farm egg daily for a 120-day production cycle.',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    pricePerHen: 500, // Rs. 500 / Hen
    eggsPerDay: 1, // 1 egg/day
    durationDays: 120, // 120 days
    maxEggsPerHen: 120, // 120 eggs max
    minQuantity: 1,
    maxQuantity: 100,
    availableQuantity: 500,
    benefits: [
      '1 Egg per day guaranteed production',
      '120-Day full production cycle (120 Eggs Total)',
      'Direct egg sale on platform at market rate',
      'High-tech automated climate-controlled aviary',
      'Zero feed, vaccination or mortality deductions',
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pkg-al-jadeed-golden',
    name: 'AL JADEED GOLDEN COMET',
    breed: 'Golden Comet Layer',
    description: 'Premium brown egg layer with exceptional feed-to-egg conversion in biosecure aviaries. 1 egg per day for 120 consecutive days.',
    image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80',
    pricePerHen: 500,
    eggsPerDay: 1,
    durationDays: 120,
    maxEggsPerHen: 120,
    minQuantity: 1,
    maxQuantity: 100,
    availableQuantity: 400,
    benefits: [
      '1 Egg per day high-grade organic brown egg',
      'Full 120-day production cycle (120 Eggs Total)',
      'Digital ownership verification & serial tagging',
      'Automated daily egg collection & warehouse recording',
      'Instant egg-to-cash liquidation at market rates',
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pkg-al-jadeed-australorp',
    name: 'AL JADEED AUSTRALORP',
    breed: 'Black Australorp Heritage',
    description: 'Hardy heritage black layer famous for continuous laying stamina and stress resistance in Pakistani climates. 1 egg daily for 120 days.',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe0a?auto=format&fit=crop&w=800&q=80',
    pricePerHen: 500,
    eggsPerDay: 1,
    durationDays: 120,
    maxEggsPerHen: 120,
    minQuantity: 1,
    maxQuantity: 100,
    availableQuantity: 300,
    benefits: [
      '1 Egg per day continuous laying',
      '120-Day production cycle (120 Eggs Total)',
      'Complete veterinary care & mortality cover',
      'Sell eggs anytime or withdraw balance via IBFT',
      'Transparent live aviary status updates',
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.users)) {
          this.ensureInitialAdmin(parsed);
          this.ensureWhatsAppSettings(parsed);
          this.migrateHenOwnershipRecords(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading Al Jadeed DB, resetting...', e);
    }
    return this.initializeDefault();
  }

  private migrateHenOwnershipRecords(schema: DatabaseSchema): void {
    let changed = false;
    const now = new Date();
    const nowMs = now.getTime();
    const durationLimit = schema.settings?.productionDurationDays || 120;

    if (!Array.isArray(schema.hen_ownership)) schema.hen_ownership = [];
    if (!schema.egg_balances) schema.egg_balances = {};
    if (!Array.isArray(schema.egg_productions)) schema.egg_productions = [];

    for (const cycle of schema.hen_ownership) {
      if (!cycle.activatedAt) {
        cycle.activatedAt = cycle.purchaseDate || cycle.createdAt || now.toISOString();
        changed = true;
      }
      if (!cycle.productionStartTime) {
        cycle.productionStartTime = cycle.activatedAt;
        changed = true;
      }
      const actMs = new Date(cycle.activatedAt).getTime();
      const validActMs = isNaN(actMs) ? nowMs : actMs;

      if (!cycle.productionEndTime) {
        cycle.productionEndTime = new Date(validActMs + durationLimit * 24 * 3600 * 1000).toISOString();
        changed = true;
      }
      if (!cycle.totalCycleEggs) {
        cycle.totalCycleEggs = cycle.numberOfHens * durationLimit;
        changed = true;
      }

      if (cycle.status === 'active') {
        const daysCompleted = Math.max(1, cycle.daysCompleted || 1);
        if (!cycle.nextEarningDate) {
          cycle.nextEarningDate = new Date(validActMs + daysCompleted * 24 * 3600 * 1000).toISOString();
          changed = true;
        }
      }
    }

    if (schema.settings && schema.settings.paymentMethods) {
      if (!schema.settings.paymentMethods.sadapay) {
        schema.settings.paymentMethods.sadapay = {
          enabled: true,
          accountTitle: 'Muhammad Murtaza',
          accountNumber: '03008476546',
          iban: 'PK56SADA00000003008476546',
          instructions: 'Send payment via SadaPay App to 03008476546. Enter the Reference Number or Transaction ID.',
        };
        changed = true;
      }
    }

    if (changed) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to write migrated DB file', err);
      }
    }
  }

  private ensureInitialAdmin(schema: DatabaseSchema): void {
    const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@2026';

    const existingAdmin = schema.users.find(
      u => (u.username && u.username.toLowerCase() === adminUsername.toLowerCase()) ||
           (u.role === 'admin')
    );

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(adminPassword, salt);

    if (!existingAdmin) {
      const newAdmin: User = {
        id: 'usr-admin-01',
        username: adminUsername,
        name: 'Al Jadeed Master Administrator',
        email: `admin@aljadeedmetaeggs.com`,
        phone: '+92 300 8476546',
        passwordHash,
        role: 'admin',
        balance: 0,
        referralCode: 'AJME-ADMIN',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      schema.users.unshift(newAdmin);
      if (!schema.audit_logs) schema.audit_logs = [];
      schema.audit_logs.push({
        id: 'log-' + Date.now(),
        adminId: newAdmin.id,
        adminName: newAdmin.name,
        action: 'ADMIN_PROVISIONED',
        details: `Initial administrator account (${adminUsername}) securely provisioned with encrypted password hash.`,
        createdAt: new Date().toISOString(),
      });
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to write updated DB file with provisioned admin', err);
      }
    } else {
      let changed = false;
      if (existingAdmin.username !== 'admin') {
        existingAdmin.username = 'admin';
        changed = true;
      }
      existingAdmin.passwordHash = passwordHash;
      changed = true;
      if (changed) {
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
        } catch (err) {
          console.error('Failed to update existing admin record', err);
        }
      }
    }
  }

  private ensureWhatsAppSettings(schema: DatabaseSchema): void {
    if (!schema.settings) {
      schema.settings = { ...defaultSettings };
      return;
    }
    const currentWa = schema.settings.whatsapp;
    schema.settings.whatsapp = {
      support: {
        enabled: currentWa?.support?.enabled !== false,
        number: currentWa?.support?.number || schema.settings.supportWhatsApp || '03008476546',
        displayName: currentWa?.support?.displayName || 'Al Jadeed Official Support',
        welcomeMessage: currentWa?.support?.welcomeMessage ?? 'Hello, I need help regarding my Al Jadeed Meta Eggs account.',
        enableFloatingButton: currentWa?.support?.enableFloatingButton !== false,
      },
      channel: {
        enabled: currentWa?.channel?.enabled !== false,
        channelUrl: currentWa?.channel?.channelUrl || 'https://whatsapp.com/channel/0029Vaexample',
        channelName: currentWa?.channel?.channelName || 'Al Jadeed Meta Eggs Official Channel',
        description: currentWa?.channel?.description || 'Get latest updates, announcements and news.',
      },
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save Al Jadeed DB file', e);
    }
  }

  private initializeDefault(): DatabaseSchema {
    const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'ajme_admin_7K4x';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'V7!qN2#rL9@xP4$mZ8&cT6';

    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync(adminPassword, salt);
    const demoHash = bcrypt.hashSync('password123', salt);

    const adminUser: User = {
      id: 'usr-admin-01',
      username: adminUsername,
      name: 'Al Jadeed Master Administrator',
      email: `${adminUsername.toLowerCase()}@aljadeedmetaeggs.com`,
      phone: '+92 300 8476546',
      passwordHash: adminHash,
      role: 'admin',
      balance: 0,
      referralCode: 'AJME-ADMIN',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const demoCustomer: User = {
      id: 'usr-demo-01',
      name: 'Muhammad Usman Lodhi',
      email: 'user@metaeggs.com',
      phone: '+92 300 8476546',
      passwordHash: demoHash,
      role: 'customer',
      balance: 1500, // Rs. 1500 from egg sales
      referralCode: 'AJME-USMAN',
      status: 'active',
      bankDetails: {
        method: 'easypaisa',
        accountTitle: 'Muhammad Usman Lodhi',
        accountNumber: '0300-8476546',
        bankName: 'EasyPaisa',
      },
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Pre-seed an active 10-hen cycle at day 35 / 120 matching the prompt's example:
    // 10 Hens -> Daily 10 eggs -> Day 35 / 120 -> Eggs Earned: 350 -> Remaining: 850
    const demoCycle: HenOwnership = {
      id: 'own-ajme-0001',
      ownershipId: 'HEN CYCLE #AJME-0001',
      userId: demoCustomer.id,
      userName: demoCustomer.name,
      userEmail: demoCustomer.email,
      packageId: defaultPackages[0].id,
      packageName: defaultPackages[0].name,
      breed: defaultPackages[0].breed,
      numberOfHens: 10,
      pricePerHen: 500,
      totalInvested: 5000,
      dailyEggs: 10,
      totalCycleEggs: 1200,
      daysCompleted: 35,
      daysRemaining: 85,
      eggsEarned: 350,
      remainingEggs: 850,
      status: 'active',
      purchaseDate: new Date(Date.now() - 35 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 85 * 86400000).toISOString(),
      lastProductionDate: new Date().toISOString(),
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    };

    // Egg balances for demo user:
    // Earned: 350 eggs, sold: 100 eggs (@ Rs. 15 = Rs. 1500), available: 250 eggs
    const eggBalances: Record<string, EggBalance> = {
      [demoCustomer.id]: {
        userId: demoCustomer.id,
        totalEarnedEggs: 350,
        todayEggs: 10,
        availableEggs: 250,
        soldEggs: 100,
      },
    };

    // Seed production history records for the past 7 days
    const eggProductions: EggProductionRecord[] = [];
    for (let i = 7; i >= 1; i--) {
      const d = new Date(Date.now() - i * 86400000);
      eggProductions.push({
        id: `prod-${Date.now()}-${i}`,
        cycleId: demoCycle.id,
        cycleRef: demoCycle.ownershipId,
        userId: demoCustomer.id,
        hens: 10,
        eggs: 10,
        dayNumber: 35 - i,
        date: d.toISOString().split('T')[0],
        createdAt: d.toISOString(),
      });
    }

    const eggSales: EggSale[] = [
      {
        id: 'sale-ajme-01',
        saleId: 'AJME-SALE-001',
        userId: demoCustomer.id,
        userName: demoCustomer.name,
        quantity: 100,
        eggPrice: 15,
        totalAmount: 1500,
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];

    const initialTransactions: Transaction[] = [
      {
        id: 'txn-01',
        referenceId: 'AJME-TXN-001',
        userId: demoCustomer.id,
        userName: demoCustomer.name,
        type: 'hen_purchase',
        quantity: 10,
        amount: 5000,
        fee: 0,
        netAmount: 5000,
        balanceAfter: 0,
        description: 'Purchased 10 Hens (HEN CYCLE #AJME-0001)',
        status: 'completed',
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: 'txn-02',
        referenceId: 'AJME-TXN-002',
        userId: demoCustomer.id,
        userName: demoCustomer.name,
        type: 'egg_sale',
        quantity: 100,
        amount: 1500,
        fee: 0,
        netAmount: 1500,
        balanceAfter: 1500,
        description: 'Sold 100 Eggs @ Rs. 15 per egg',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];

    const initialOrders: Order[] = [
      {
        id: 'ord-ajme-01',
        orderNumber: 'AJME-ORD-0001',
        paymentId: 'AJME-PAY-0001',
        userId: demoCustomer.id,
        userName: demoCustomer.name,
        userEmail: demoCustomer.email,
        packageId: defaultPackages[0].id,
        packageName: defaultPackages[0].name,
        quantity: 10,
        pricePerHen: 500,
        subtotal: 5000,
        fees: 0,
        totalAmount: 5000,
        dailyProduction: 10,
        durationDays: 120,
        maxProduction: 1200,
        status: 'approved',
        paymentStatus: 'approved',
        henStatus: 'Active',
        paymentMethod: 'Bank Transfer',
        paymentReference: 'IBFT-776251094',
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
    ];

    const initialNotifications: Notification[] = [
      {
        id: 'notif-01',
        userId: demoCustomer.id,
        title: 'Welcome to Al Jadeed Meta Eggs! 🥚',
        message: 'Your account is ready. Purchase hens @ Rs. 500 to start your 120-day egg production cycle.',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: 'notif-02',
        userId: demoCustomer.id,
        title: 'Hen Ownership Activated! 🐓',
        message: 'HEN CYCLE #AJME-0001 (10 Hens) is active. Earning 10 eggs daily for 120 days.',
        type: 'ownership',
        read: true,
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
    ];

    const schema: DatabaseSchema = {
      users: [adminUser, demoCustomer],
      packages: defaultPackages,
      orders: initialOrders,
      hen_ownership: [demoCycle],
      egg_productions: eggProductions,
      egg_balances: eggBalances,
      egg_sales: eggSales,
      transactions: initialTransactions,
      withdrawals: [],
      notifications: initialNotifications,
      settings: defaultSettings,
      audit_logs: [
        {
          id: 'log-01',
          adminId: 'usr-admin-01',
          adminName: 'Al Jadeed Administrator',
          action: 'SYSTEM_INITIALIZED',
          details: 'Al Jadeed Meta Eggs system initialized with default Rs. 500 hen price and 120-day production cycle.',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write initial DB file', err);
    }

    return schema;
  }

  // --- SETTINGS ---
  public getSettings(): PlatformSettings {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<PlatformSettings>, adminName: string = 'Admin'): PlatformSettings {
    const sanitized = { ...partial };

    // Support both minWithdrawal and minWithdrawalAmount, allowing 0 for 'No Minimum'
    if (sanitized.minWithdrawal !== undefined) {
      const parsed = Math.max(0, parseInt(String(sanitized.minWithdrawal), 10) || 0);
      sanitized.minWithdrawal = parsed;
      sanitized.minWithdrawalAmount = parsed;
    } else if (sanitized.minWithdrawalAmount !== undefined) {
      const parsed = Math.max(0, parseInt(String(sanitized.minWithdrawalAmount), 10) || 0);
      sanitized.minWithdrawal = parsed;
      sanitized.minWithdrawalAmount = parsed;
    }

    if (sanitized.whatsapp) {
      const prevWa = this.data.settings.whatsapp || {
        support: { enabled: true, number: '03008476546', displayName: 'Al Jadeed Official Support', welcomeMessage: 'Hello, I need help regarding my Al Jadeed Meta Eggs account.', enableFloatingButton: true },
        channel: { enabled: true, channelUrl: 'https://whatsapp.com/channel/0029Vaexample', channelName: 'Al Jadeed Meta Eggs Official Channel', description: 'Get latest updates, announcements and news.' },
      };

      const supportInput = sanitized.whatsapp.support || prevWa.support;
      const channelInput = sanitized.whatsapp.channel || prevWa.channel;

      sanitized.whatsapp = {
        support: {
          enabled: typeof supportInput.enabled === 'boolean' ? supportInput.enabled : prevWa.support.enabled,
          number: typeof supportInput.number === 'string' ? supportInput.number.trim() : prevWa.support.number,
          displayName: typeof supportInput.displayName === 'string' ? supportInput.displayName.trim() : prevWa.support.displayName,
          welcomeMessage: typeof supportInput.welcomeMessage === 'string' ? supportInput.welcomeMessage : prevWa.support.welcomeMessage,
          enableFloatingButton: typeof supportInput.enableFloatingButton === 'boolean' ? supportInput.enableFloatingButton : prevWa.support.enableFloatingButton,
        },
        channel: {
          enabled: typeof channelInput.enabled === 'boolean' ? channelInput.enabled : prevWa.channel.enabled,
          channelUrl: typeof channelInput.channelUrl === 'string' ? channelInput.channelUrl.trim() : prevWa.channel.channelUrl,
          channelName: typeof channelInput.channelName === 'string' ? channelInput.channelName.trim() : prevWa.channel.channelName,
          description: typeof channelInput.description === 'string' ? channelInput.description.trim() : prevWa.channel.description,
        },
      };

      if (sanitized.whatsapp.support.number) {
        sanitized.supportWhatsApp = sanitized.whatsapp.support.number;
      }
    }

    this.data.settings = { ...this.data.settings, ...sanitized };
    this.createAuditLog(
      'admin',
      adminName,
      'UPDATE_SETTINGS',
      `Platform settings updated: ${JSON.stringify(sanitized)}`
    );
    this.save();
    return this.data.settings;
  }

  public incrementWhatsAppClick(event: string): void {
    try {
      this.createAuditLog(
        'system',
        'Customer Portal',
        'WHATSAPP_CLICK',
        `User engaged with ${event === 'whatsapp_channel' ? 'WhatsApp Channel' : 'WhatsApp Support'}`
      );
    } catch {
      // ignore
    }
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByUsername(username: string): User | undefined {
    const clean = username.trim().toLowerCase();
    return this.data.users.find(u => u.username && u.username.toLowerCase() === clean);
  }

  // Normalizes phone numbers (e.g., +92 300 8476546, 03008476546, 3008476546 -> 3008476546)
  public static normalizePhone(phoneStr?: string): string {
    if (!phoneStr) return '';
    const digits = phoneStr.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('0092')) return digits.slice(4);
    if (digits.startsWith('92') && digits.length >= 11) return digits.slice(2);
    if (digits.startsWith('0') && digits.length >= 10) return digits.slice(1);
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  }

  public static phonesMatch(p1?: string, p2?: string): boolean {
    if (!p1 || !p2) return false;
    const n1 = Database.normalizePhone(p1);
    const n2 = Database.normalizePhone(p2);
    if (!n1 || !n2) return false;
    if (n1 === n2) return true;
    if (n1.length >= 7 && n2.length >= 7 && (n1.endsWith(n2) || n2.endsWith(n1))) return true;
    return false;
  }

  public getUsersByEmailOrPhone(identifier: string): User[] {
    const cleanId = identifier.trim().toLowerCase();
    const digits = identifier.replace(/\D/g, '');
    const isLikelyPhone = digits.length >= 7;

    return this.data.users.filter(u => {
      if (u.username && u.username.trim().toLowerCase() === cleanId) return true;
      if (u.email && u.email.trim().toLowerCase() === cleanId) return true;
      if (u.referralCode && u.referralCode.trim().toLowerCase() === cleanId) return true;
      if (u.role === 'admin' && (cleanId === 'admin' || cleanId === 'administrator' || cleanId === 'jimmy')) return true;
      if (isLikelyPhone && u.phone && Database.phonesMatch(identifier, u.phone)) return true;
      return false;
    });
  }

  public getUserByUsernameOrEmail(identifier: string): User | undefined {
    const list = this.getUsersByEmailOrPhone(identifier);
    return list.length > 0 ? list[0] : undefined;
  }

  public getUserByEmailOrPhone(identifier: string): User | undefined {
    const list = this.getUsersByEmailOrPhone(identifier);
    return list.length > 0 ? list[0] : undefined;
  }

  public getUserByReferralCode(code: string): User | undefined {
    return this.data.users.find(u => u.referralCode?.toUpperCase() === code.toUpperCase());
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'balance'> & { balance?: number }): User {
    const newUser: User = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...userData,
      balance: userData.balance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);

    // Initialize egg balance
    this.data.egg_balances[newUser.id] = {
      userId: newUser.id,
      totalEarnedEggs: 0,
      todayEggs: 0,
      availableEggs: 0,
      soldEggs: 0,
    };

    this.save();
    return newUser;
  }

  public updateUser(id: string, partial: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  // --- PACKAGES ---
  public getPackages(): Package[] {
    return this.data.packages;
  }

  public getPackageById(id: string): Package | undefined {
    return this.data.packages.find(p => p.id === id);
  }

  public createPackage(pkgData: Omit<Package, 'id' | 'createdAt'>): Package {
    const newPkg: Package = {
      id: 'pkg-' + Date.now(),
      ...pkgData,
      createdAt: new Date().toISOString(),
    };
    this.data.packages.push(newPkg);
    this.save();
    return newPkg;
  }

  public updatePackage(id: string, partial: Partial<Package>): Package | undefined {
    const idx = this.data.packages.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.packages[idx] = { ...this.data.packages[idx], ...partial };
    this.save();
    return this.data.packages[idx];
  }

  public deletePackage(id: string): boolean {
    const initialLen = this.data.packages.length;
    this.data.packages = this.data.packages.filter(p => p.id !== id);
    if (this.data.packages.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public getUserOrders(userId: string): Order[] {
    return this.data.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(orderData: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    packageId: string;
    quantity: number;
    paymentMethod: string;
    paymentReference?: string;
    senderAccount?: string;
    paymentProofUrl?: string;
    submittedAmount?: number;
  }): Order {
    const pkg = this.getPackageById(orderData.packageId);
    if (!pkg) throw new Error('Package not found');

    // Duplicate transaction ID protection
    if (orderData.paymentReference && orderData.paymentReference.trim()) {
      const cleanRef = orderData.paymentReference.trim().toLowerCase();
      const existing = this.data.orders.find(
        o => o.paymentReference && o.paymentReference.trim().toLowerCase() === cleanRef && o.status !== 'rejected' && o.status !== 'cancelled'
      );
      if (existing) {
        throw new Error('This payment reference has already been submitted. Please check your transaction ID.');
      }
    }

    const pricePerHen = this.data.settings.henPrice || pkg.pricePerHen || 500;
    const durationDays = this.data.settings.productionDurationDays || 120;
    const eggsPerDayRate = this.data.settings.eggsPerHenPerDay || 1;

    const quantity = Math.max(1, orderData.quantity);
    const subtotal = quantity * pricePerHen;
    const totalAmount = subtotal; // No hidden fees
    const dailyProduction = quantity * eggsPerDayRate;
    const maxProduction = quantity * durationDays;

    const count = this.data.orders.length + 1;
    const orderNumber = `AJME-ORD-${String(count).padStart(6, '0')}`;
    const paymentId = `AJME-PAY-${String(count).padStart(6, '0')}`;

    const newOrder: Order = {
      id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      orderNumber,
      paymentId,
      userId: orderData.userId,
      userName: orderData.userName,
      userEmail: orderData.userEmail,
      userPhone: orderData.userPhone || '',
      packageId: pkg.id,
      packageName: pkg.name,
      quantity,
      pricePerHen,
      subtotal,
      fees: 0,
      totalAmount,
      submittedAmount: orderData.submittedAmount || totalAmount,
      dailyProduction,
      durationDays,
      maxProduction,
      status: 'pending',
      paymentStatus: 'pending',
      henStatus: 'Awaiting Approval',
      paymentMethod: orderData.paymentMethod || 'Bank Transfer',
      paymentReference: orderData.paymentReference || '',
      senderAccount: orderData.senderAccount || '',
      paymentProofUrl: orderData.paymentProofUrl || '',
      createdAt: new Date().toISOString(),
    };

    this.data.orders.push(newOrder);

    // Notify customer
    this.createNotification({
      userId: orderData.userId,
      title: 'Payment Verification Pending #' + orderNumber,
      message: `Your payment proof for ${quantity} Hens (Rs. ${totalAmount.toLocaleString()}) has been submitted. Status: Pending Verification. Hens will be activated once verified.`,
      type: 'order',
      link: '/user/orders',
    });

    this.createAuditLog(
      orderData.userId,
      orderData.userName,
      'SUBMIT_ORDER_PAYMENT',
      `Submitted payment proof for Order #${orderNumber} (${paymentId}). Ref: ${orderData.paymentReference || 'N/A'}.`,
      newOrder.id
    );

    this.save();
    return newOrder;
  }

  public updateOrder(id: string, partial: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx] = { ...this.data.orders[idx], ...partial };
    this.save();
    return this.data.orders[idx];
  }

  // --- APPROVE ORDER & ACTIVATE HEN CYCLE ---
  public approveOrder(orderId: string, adminNotes?: string): { order: Order; ownership: HenOwnership } {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.status === 'approved') throw new Error('Order is already approved');

    order.status = 'approved';
    order.paymentStatus = 'approved';
    order.henStatus = 'Active';
    order.adminNotes = adminNotes || 'Payment verified by Admin';
    order.approvedAt = new Date().toISOString();

    const user = this.getUserById(order.userId);
    if (!user) throw new Error('Customer not found');

    const pkg = this.getPackageById(order.packageId);
    const durationDays = this.data.settings.productionDurationDays || 120;
    const pricePerHen = order.pricePerHen;
    const quantity = order.quantity;
    const dailyEggs = quantity * (this.data.settings.eggsPerHenPerDay || 1);
    const totalCycleEggs = quantity * durationDays;

    const cycleCount = this.data.hen_ownership.length + 1;
    const ownershipId = `HEN CYCLE #AJME-${String(cycleCount).padStart(4, '0')}`;

    const activationDate = new Date();
    const expiryDate = new Date(activationDate.getTime() + durationDays * 86400000);
    const nextEarningDate = new Date(activationDate.getTime() + 24 * 3600 * 1000).toISOString();

    const ownership: HenOwnership = {
      id: 'own-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      ownershipId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      packageId: order.packageId,
      packageName: order.packageName,
      breed: pkg?.breed || 'Al Jadeed Layer',
      orderId: order.id,
      numberOfHens: quantity,
      pricePerHen,
      totalInvested: order.totalAmount,
      dailyEggs,
      totalCycleEggs,
      daysCompleted: 1, // First egg credited immediately upon activation
      daysRemaining: Math.max(0, durationDays - 1),
      eggsEarned: quantity,
      remainingEggs: Math.max(0, totalCycleEggs - quantity),
      status: 'active',
      purchaseDate: activationDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      activatedAt: activationDate.toISOString(),
      productionStartTime: activationDate.toISOString(),
      productionEndTime: expiryDate.toISOString(),
      nextEarningDate: nextEarningDate,
      lastProductionDate: activationDate.toISOString(),
      createdAt: activationDate.toISOString(),
    };

    this.data.hen_ownership.push(ownership);

    // Credit immediate first egg to user's egg balance
    const eggBal = this.getUserEggBalance(user.id);
    eggBal.availableEggs += quantity;
    eggBal.totalEarnedEggs += quantity;
    eggBal.todayEggs = (eggBal.todayEggs || 0) + quantity;

    // Create production record for immediate first egg
    this.data.egg_productions.push({
      id: `prod-${ownership.id}-day-1`,
      cycleId: ownership.id,
      cycleRef: ownership.ownershipId,
      userId: user.id,
      hens: quantity,
      eggs: quantity,
      dayNumber: 1,
      date: activationDate.toISOString().split('T')[0],
      source: 'Immediate First Egg Credited upon Hen Activation',
      createdAt: activationDate.toISOString(),
    });

    // Create Transaction record for purchase
    this.createTransaction({
      userId: user.id,
      userName: user.name,
      type: 'hen_purchase',
      quantity,
      amount: order.totalAmount,
      fee: 0,
      netAmount: order.totalAmount,
      balanceAfter: user.balance,
      description: `Purchase of ${quantity} Hens (${ownershipId})`,
      status: 'completed',
    });

    // Check if user was referred by someone and credit referral reward if applicable
    if (user.referredBy) {
      const referrer = this.getUserByReferralCode(user.referredBy) || this.getUserById(user.referredBy);
      if (referrer && this.data.settings.referralRewardCash > 0) {
        const bonus = this.data.settings.referralRewardCash * quantity;
        referrer.balance += bonus;
        this.createTransaction({
          userId: referrer.id,
          userName: referrer.name,
          type: 'referral_reward',
          quantity,
          amount: bonus,
          fee: 0,
          netAmount: bonus,
          balanceAfter: referrer.balance,
          description: `Referral bonus from ${user.name}'s purchase of ${quantity} hens`,
          status: 'completed',
        });
        this.createNotification({
          userId: referrer.id,
          title: 'Referral Bonus Credited! 🎁',
          message: `You received Rs. ${bonus} referral reward from ${user.name}'s purchase of ${quantity} hens!`,
          type: 'earning',
          link: '/user/transactions',
        });
      }
    }

    // Customer Notification
    this.createNotification({
      userId: user.id,
      title: 'Payment Approved & First Eggs Credited! 🥚',
      message: `Payment approved! ${quantity} hens (${ownershipId}) are active. Your first ${quantity} egg${quantity > 1 ? 's have' : ' has'} been credited immediately and can be sold right now! Next egg batch in 24 hours.`,
      type: 'ownership',
      link: '/user/my-eggs',
    });

    this.createAuditLog(
      'admin',
      'Admin',
      'APPROVE_PAYMENT',
      `Approved Order #${order.orderNumber} (${order.paymentId}) for ${user.name}. Generated ${ownershipId} with ${quantity} hens.`,
      order.id
    );

    this.save();
    return { order, ownership };
  }

  // --- REJECT ORDER PAYMENT ---
  public rejectOrder(orderId: string, reason: string): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.status === 'approved') throw new Error('Cannot reject an already approved order');

    order.status = 'rejected';
    order.paymentStatus = 'rejected';
    order.henStatus = 'Not Assigned';
    order.rejectionReason = reason || 'Payment unverified';
    order.adminNotes = reason || 'Payment unverified';
    order.rejectedAt = new Date().toISOString();

    this.createNotification({
      userId: order.userId,
      title: 'Hen Order Payment Rejected',
      message: `Your payment for Order ${order.orderNumber} was rejected. Reason: ${order.rejectionReason}`,
      type: 'order',
      link: '/user/orders',
    });

    this.createAuditLog(
      'admin',
      'Admin',
      'REJECT_PAYMENT',
      `Rejected Order #${order.orderNumber} (${order.paymentId || ''}) for ${order.userName}. Reason: ${order.rejectionReason}`,
      order.id
    );

    this.save();
    return order;
  }

  // --- HEN OWNERSHIP (HEN CYCLES) ---
  public getHenOwnerships(): HenOwnership[] {
    return this.data.hen_ownership;
  }

  public getHenOwnershipById(id: string): HenOwnership | undefined {
    return this.data.hen_ownership.find(h => h.id === id);
  }

  public getUserHenOwnerships(userId: string): HenOwnership[] {
    return this.data.hen_ownership
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public updateHenOwnership(id: string, partial: Partial<HenOwnership>): HenOwnership | undefined {
    const idx = this.data.hen_ownership.findIndex(h => h.id === id);
    if (idx === -1) return undefined;
    this.data.hen_ownership[idx] = { ...this.data.hen_ownership[idx], ...partial };
    this.save();
    return this.data.hen_ownership[idx];
  }

  public assignHenOwnership(data: {
    userId: string;
    packageId: string;
    numberOfHens: number;
    pricePerHen?: number;
    status?: OwnershipStatus;
  }): HenOwnership {
    const user = this.getUserById(data.userId);
    if (!user) throw new Error('User not found');
    const pkg = this.getPackageById(data.packageId) || this.data.packages[0];

    const price = data.pricePerHen || this.data.settings.henPrice || 500;
    const durationDays = this.data.settings.productionDurationDays || 120;
    const qty = data.numberOfHens;
    const dailyEggs = qty * (this.data.settings.eggsPerHenPerDay || 1);
    const totalCycleEggs = qty * durationDays;

    const cycleCount = this.data.hen_ownership.length + 1;
    const ownershipId = `HEN CYCLE #AJME-${String(cycleCount).padStart(4, '0')}`;

    const activationDate = new Date();
    const expiryDate = new Date(activationDate.getTime() + durationDays * 86400000);
    const nextEarningDate = new Date(activationDate.getTime() + 24 * 3600 * 1000).toISOString();
    const isAct = (data.status || 'active') === 'active';

    const ownership: HenOwnership = {
      id: 'own-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      ownershipId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      packageId: pkg.id,
      packageName: pkg.name,
      breed: pkg.breed,
      numberOfHens: qty,
      pricePerHen: price,
      totalInvested: qty * price,
      dailyEggs,
      totalCycleEggs,
      daysCompleted: isAct ? 1 : 0,
      daysRemaining: isAct ? Math.max(0, durationDays - 1) : durationDays,
      eggsEarned: isAct ? qty : 0,
      remainingEggs: isAct ? Math.max(0, totalCycleEggs - qty) : totalCycleEggs,
      status: data.status || 'active',
      purchaseDate: activationDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      activatedAt: activationDate.toISOString(),
      productionStartTime: activationDate.toISOString(),
      productionEndTime: expiryDate.toISOString(),
      nextEarningDate: isAct ? nextEarningDate : undefined,
      lastProductionDate: isAct ? activationDate.toISOString() : undefined,
      createdAt: activationDate.toISOString(),
    };

    this.data.hen_ownership.push(ownership);

    if (isAct) {
      // Credit immediate first egg to user's egg balance
      const eggBal = this.getUserEggBalance(user.id);
      eggBal.availableEggs += qty;
      eggBal.totalEarnedEggs += qty;
      eggBal.todayEggs = (eggBal.todayEggs || 0) + qty;

      // Create production record for immediate first egg
      this.data.egg_productions.push({
        id: `prod-${ownership.id}-day-1`,
        cycleId: ownership.id,
        cycleRef: ownership.ownershipId,
        userId: user.id,
        hens: qty,
        eggs: qty,
        dayNumber: 1,
        date: activationDate.toISOString().split('T')[0],
        source: 'Immediate First Egg Credited upon Hen Activation',
        createdAt: activationDate.toISOString(),
      });
    }

    this.createNotification({
      userId: user.id,
      title: 'Hens Assigned & First Eggs Credited! 🥚',
      message: `Admin assigned ${qty} Hens (${ownershipId}) to your account. Your first ${qty} egg${qty > 1 ? 's have' : ' has'} been credited immediately and ready to sell! Next egg batch in 24 hours.`,
      type: 'ownership',
      link: '/user/my-eggs',
    });

    this.createAuditLog(
      'admin',
      'Admin',
      'MANUAL_ASSIGN_HENS',
      `Assigned ${qty} hens (${ownershipId}) to ${user.name} (${user.email})`
    );

    this.save();
    return ownership;
  }

  // --- REAL-TIME AUTHORITATIVE EGG PRODUCTION ENGINE ---
  // Authoritative server-side calculation:
  // - Day 1 first egg batch credited immediately on hen activation
  // - Subsequent egg batches credited every 24 hours from activation timestamp
  // - Multiple batches/purchases have completely independent 24-hour schedules
  // - 120-day production limit per hen (automatically stops at Day 120)
  // - Fully idempotent (uses deterministic record keys to prevent duplicate crediting)
  private _isSyncingEggs = false;

  public syncEggEarnings(targetUserId?: string): {
    newlyEarned: number;
    newlyProcessedCycles: number;
    completedCyclesCount: number;
  } {
    if (this._isSyncingEggs) {
      return { newlyEarned: 0, newlyProcessedCycles: 0, completedCyclesCount: 0 };
    }

    this._isSyncingEggs = true;
    let newlyEarned = 0;
    let newlyProcessedCycles = 0;
    let completedCyclesCount = 0;
    let dataChanged = false;

    try {
      const now = new Date();
      const nowMs = now.getTime();
      const durationLimit = this.data.settings.productionDurationDays || 120;
      const notifiedUsers = new Set<string>();

      if (!Array.isArray(this.data.hen_ownership)) this.data.hen_ownership = [];
      if (!this.data.egg_balances) this.data.egg_balances = {};
      if (!Array.isArray(this.data.egg_productions)) this.data.egg_productions = [];

      for (const cycle of this.data.hen_ownership) {
        if (targetUserId && cycle.userId !== targetUserId) continue;
        if (cycle.status !== 'active') continue;

        // Ensure cycle has valid timestamps
        if (!cycle.activatedAt) {
          cycle.activatedAt = cycle.purchaseDate || cycle.createdAt || now.toISOString();
          dataChanged = true;
        }
        if (!cycle.productionStartTime) {
          cycle.productionStartTime = cycle.activatedAt;
          dataChanged = true;
        }

        const actMs = new Date(cycle.activatedAt).getTime();
        const validActMs = isNaN(actMs) ? nowMs : actMs;

        if (!cycle.productionEndTime) {
          cycle.productionEndTime = new Date(validActMs + durationLimit * 24 * 3600 * 1000).toISOString();
          dataChanged = true;
        }

        if (!cycle.totalCycleEggs) {
          cycle.totalCycleEggs = cycle.numberOfHens * durationLimit;
          dataChanged = true;
        }

        const userBalance = this.getUserEggBalance(cycle.userId);

        // --- STEP 1: GUARANTEE FIRST EGG BATCH CREDITED UPON ACTIVATION ---
        const day1RecordId = `prod-${cycle.id}-day-1`;
        const hasDay1 = this.data.egg_productions.some(
          p => p.id === day1RecordId || (p.cycleId === cycle.id && p.dayNumber === 1)
        );

        if (!hasDay1) {
          const firstBatchQty = cycle.numberOfHens;
          this.data.egg_productions.push({
            id: day1RecordId,
            cycleId: cycle.id,
            cycleRef: cycle.ownershipId,
            userId: cycle.userId,
            hens: cycle.numberOfHens,
            eggs: firstBatchQty,
            dayNumber: 1,
            date: new Date(validActMs).toISOString().split('T')[0],
            source: 'Immediate First Egg Credited upon Hen Activation',
            createdAt: new Date(validActMs).toISOString(),
          });

          userBalance.availableEggs += firstBatchQty;
          userBalance.totalEarnedEggs += firstBatchQty;
          userBalance.todayEggs = (userBalance.todayEggs || 0) + firstBatchQty;

          cycle.daysCompleted = Math.max(cycle.daysCompleted || 0, 1);
          cycle.eggsEarned = Math.max(cycle.eggsEarned || 0, firstBatchQty);
          cycle.remainingEggs = Math.max(0, cycle.totalCycleEggs - cycle.eggsEarned);
          cycle.daysRemaining = Math.max(0, durationLimit - cycle.daysCompleted);
          cycle.lastProductionDate = new Date(validActMs).toISOString();

          newlyEarned += firstBatchQty;
          newlyProcessedCycles++;
          dataChanged = true;
        }

        // --- STEP 2: CALCULATE ELAPSED 24-HOUR PERIODS ---
        const elapsedMs = Math.max(0, nowMs - validActMs);
        const periodsElapsed = Math.floor(elapsedMs / (24 * 3600 * 1000));
        const targetDays = Math.min(durationLimit, 1 + periodsElapsed);

        if (targetDays > (cycle.daysCompleted || 1)) {
          const startDay = (cycle.daysCompleted || 1) + 1;
          for (let d = startDay; d <= targetDays; d++) {
            const dayRecordId = `prod-${cycle.id}-day-${d}`;
            const exists = this.data.egg_productions.some(
              p => p.id === dayRecordId || (p.cycleId === cycle.id && p.dayNumber === d)
            );

            if (!exists) {
              const eggsInBatch = cycle.numberOfHens;
              const periodTimestamp = new Date(validActMs + (d - 1) * 24 * 3600 * 1000).toISOString();

              this.data.egg_productions.push({
                id: dayRecordId,
                cycleId: cycle.id,
                cycleRef: cycle.ownershipId,
                userId: cycle.userId,
                hens: cycle.numberOfHens,
                eggs: eggsInBatch,
                dayNumber: d,
                date: periodTimestamp.split('T')[0],
                source: 'Automatic 24-Hour Production',
                createdAt: periodTimestamp,
              });

              userBalance.availableEggs += eggsInBatch;
              userBalance.totalEarnedEggs += eggsInBatch;
              userBalance.todayEggs = (userBalance.todayEggs || 0) + eggsInBatch;

              cycle.daysCompleted = d;
              cycle.eggsEarned = (cycle.eggsEarned || 0) + eggsInBatch;
              cycle.remainingEggs = Math.max(0, cycle.totalCycleEggs - cycle.eggsEarned);
              cycle.daysRemaining = Math.max(0, durationLimit - cycle.daysCompleted);
              cycle.lastProductionDate = periodTimestamp;

              newlyEarned += eggsInBatch;
              newlyProcessedCycles++;
              dataChanged = true;
              notifiedUsers.add(cycle.userId);
            } else {
              if ((cycle.daysCompleted || 0) < d) {
                cycle.daysCompleted = d;
                dataChanged = true;
              }
            }
          }
        }

        // --- STEP 3: CHECK 120-DAY PRODUCTION CAP & SCHEDULE NEXT EVENT ---
        if (cycle.daysCompleted >= durationLimit) {
          cycle.status = 'completed';
          cycle.completedAt = cycle.completedAt || new Date(validActMs + durationLimit * 24 * 3600 * 1000).toISOString();
          cycle.nextEarningDate = undefined;
          cycle.remainingEggs = 0;
          cycle.daysRemaining = 0;
          completedCyclesCount++;
          dataChanged = true;
        } else {
          // Next egg is exactly 24 hours after previous completed day
          cycle.nextEarningDate = new Date(validActMs + cycle.daysCompleted * 24 * 3600 * 1000).toISOString();
          cycle.remainingEggs = Math.max(0, cycle.totalCycleEggs - (cycle.eggsEarned || 0));
          cycle.daysRemaining = Math.max(0, durationLimit - cycle.daysCompleted);
        }
      }

      for (const uid of notifiedUsers) {
        this.createNotification({
          userId: uid,
          title: '🥚 New Eggs Collected!',
          message: 'Your 24-hour hen cycle completed and fresh eggs were added to your available inventory.',
          type: 'production',
          link: '/user/my-eggs',
        });
      }

      if (dataChanged) {
        this.save();
      }
    } finally {
      this._isSyncingEggs = false;
    }

    return { newlyEarned, newlyProcessedCycles, completedCyclesCount };
  }

  // --- EGG PRODUCTION ENGINE (SCHEDULED / CRON / MANUAL TRIGGER) ---
  public runDailyEggProduction(): {
    cyclesProcessed: number;
    eggsProducedTotal: number;
    completedCyclesCount: number;
    usersCreditedCount: number;
  } {
    // Delegates directly to authoritative 24-hour cycle sync
    const res = this.syncEggEarnings();

    this.createAuditLog(
      'admin',
      'System Cron',
      'RUN_DAILY_PRODUCTION',
      `Synchronized active cycles. Newly generated: ${res.newlyEarned} eggs across ${res.newlyProcessedCycles} cycles. Completed cycles: ${res.completedCyclesCount}.`
    );

    return {
      cyclesProcessed: res.newlyProcessedCycles,
      eggsProducedTotal: res.newlyEarned,
      completedCyclesCount: res.completedCyclesCount,
      usersCreditedCount: res.newlyEarned > 0 ? 1 : 0,
    };
  }

  // --- EGG BALANCES & PRODUCTIONS ---
  public getUserEggBalance(userId: string): EggBalance {
    if (!this.data.egg_balances[userId]) {
      this.data.egg_balances[userId] = {
        userId,
        totalEarnedEggs: 0,
        todayEggs: 0,
        availableEggs: 0,
        soldEggs: 0,
      };
    }
    return this.data.egg_balances[userId];
  }

  public getUserEggProductions(userId: string): EggProductionRecord[] {
    return this.data.egg_productions
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- EGG SELLING SYSTEM ---
  // "After sale: Available Eggs decrease, Sold Eggs increase, Transaction is created, User balance increases."
  // "Egg price must come from an ADMIN-CONFIGURED setting. Do not hard-code an egg selling price."
  public sellEggs(userId: string, quantity: number): { sale: EggSale; newBalance: number; newAvailableEggs: number } {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const numQty = parseInt(String(quantity), 10);
    if (isNaN(numQty) || numQty <= 0) {
      throw new Error('Please specify a valid egg quantity to sell');
    }

    const eggBal = this.getUserEggBalance(userId);
    if (eggBal.availableEggs < numQty) {
      throw new Error(`Insufficient available eggs. You only have ${eggBal.availableEggs} eggs available.`);
    }

    const eggPrice = this.data.settings.eggMonetaryValue || 15;
    const totalAmount = numQty * eggPrice;

    // Deduct available eggs and increase sold eggs
    eggBal.availableEggs -= numQty;
    eggBal.soldEggs += numQty;

    // Credit user's wallet balance
    user.balance += totalAmount;

    const count = this.data.egg_sales.length + 1;
    const saleId = `AJME-SALE-${String(count).padStart(4, '0')}`;

    const sale: EggSale = {
      id: 'sale-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      saleId,
      userId: user.id,
      userName: user.name,
      quantity: numQty,
      eggPrice,
      totalAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    this.data.egg_sales.push(sale);

    // Record Transaction
    this.createTransaction({
      userId: user.id,
      userName: user.name,
      type: 'egg_sale',
      quantity: numQty,
      amount: totalAmount,
      fee: 0,
      netAmount: totalAmount,
      balanceAfter: user.balance,
      description: `Sold ${numQty} Eggs @ Rs. ${eggPrice} / egg (${saleId})`,
      status: 'completed',
    });

    // Notify user
    this.createNotification({
      userId: user.id,
      title: 'Eggs Sold Successfully! 💰',
      message: `Sold ${numQty} eggs for Rs. ${totalAmount.toLocaleString()} (@ Rs. ${eggPrice}/egg). Balance updated.`,
      type: 'egg_sale',
      link: '/user/transactions',
    });

    this.save();
    return {
      sale,
      newBalance: user.balance,
      newAvailableEggs: eggBal.availableEggs,
    };
  }

  // --- WITHDRAWALS ---
  public getWithdrawals(): Withdrawal[] {
    return this.data.withdrawals;
  }

  public getUserWithdrawals(userId: string): Withdrawal[] {
    return this.data.withdrawals
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createWithdrawal(data: {
    userId: string;
    amount: number;
    method: string;
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
  }): Withdrawal {
    const user = this.getUserById(data.userId);
    if (!user) throw new Error('User not found');

    if (isNaN(data.amount) || data.amount < 0) {
      throw new Error('Please enter a valid amount.');
    }

    if (data.amount === 0) {
      throw new Error('Enter an amount greater than Rs.0.');
    }

    if (data.amount <= 0) {
      throw new Error('Enter an amount greater than Rs.0.');
    }

    if (user.balance < data.amount) {
      throw new Error('Insufficient balance.');
    }

    const feePercent = this.data.settings.withdrawalFeePercent || 0;
    const fee = Math.round((data.amount * feePercent) / 100);
    const netAmount = data.amount - fee;

    // Deduct immediately to prevent double spending
    user.balance -= data.amount;

    const count = this.data.withdrawals.length + 1;
    const withdrawalId = `AJME-WTH-${String(count).padStart(4, '0')}`;

    const newWithdrawal: Withdrawal = {
      id: 'wth-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      withdrawalId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: data.amount,
      fee,
      netAmount,
      method: data.method,
      accountTitle: data.accountTitle,
      accountNumber: data.accountNumber,
      bankName: data.bankName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.withdrawals.push(newWithdrawal);

    // Record Transaction
    this.createTransaction({
      userId: user.id,
      userName: user.name,
      type: 'withdrawal',
      amount: data.amount,
      fee,
      netAmount,
      balanceAfter: user.balance,
      description: `Withdrawal request #${withdrawalId} via ${data.method}`,
      status: 'pending',
    });

    this.createNotification({
      userId: user.id,
      title: 'Withdrawal Requested #' + withdrawalId,
      message: `Your request to withdraw Rs. ${data.amount.toLocaleString()} has been submitted. Pending admin review.`,
      type: 'withdrawal',
      link: '/user/withdrawals',
    });

    this.save();
    return newWithdrawal;
  }

  public processWithdrawal(
    id: string,
    action: 'approve' | 'paid' | 'reject',
    adminNotes?: string,
    payoutReference?: string
  ): Withdrawal {
    const wth = this.data.withdrawals.find(w => w.id === id);
    if (!wth) throw new Error('Withdrawal record not found');

    const user = this.getUserById(wth.userId);

    if (action === 'reject') {
      if (wth.status === 'rejected') throw new Error('Already rejected');
      wth.status = 'rejected';
      wth.adminNotes = adminNotes || 'Rejected by Admin';
      wth.processedAt = new Date().toISOString();

      // Refund balance to customer
      if (user) {
        user.balance += wth.amount;
        this.createTransaction({
          userId: user.id,
          userName: user.name,
          type: 'refund',
          amount: wth.amount,
          fee: 0,
          netAmount: wth.amount,
          balanceAfter: user.balance,
          description: `Refund for rejected withdrawal #${wth.withdrawalId}`,
          status: 'completed',
        });

        this.createNotification({
          userId: user.id,
          title: 'Withdrawal Rejected & Refunded',
          message: `Withdrawal #${wth.withdrawalId} was rejected. Rs. ${wth.amount} has been refunded to your wallet. Reason: ${wth.adminNotes}`,
          type: 'withdrawal',
          link: '/user/withdrawals',
        });
      }
    } else if (action === 'paid') {
      wth.status = 'paid';
      wth.adminNotes = adminNotes || 'Funds successfully transferred';
      wth.payoutReference = payoutReference || `PO-${Date.now().toString().slice(-6)}`;
      wth.processedAt = new Date().toISOString();

      if (user) {
        this.createNotification({
          userId: user.id,
          title: 'Withdrawal Dispatched! 💸',
          message: `Rs. ${wth.netAmount.toLocaleString()} has been sent to your ${wth.method} account (${wth.accountNumber}). Ref: ${wth.payoutReference}`,
          type: 'withdrawal',
          link: '/user/withdrawals',
        });
      }
    } else if (action === 'approve') {
      wth.status = 'approved';
      wth.adminNotes = adminNotes || 'Approved for disbursement';
      wth.processedAt = new Date().toISOString();
    }

    this.createAuditLog(
      'admin',
      'Admin',
      'PROCESS_WITHDRAWAL',
      `Marked withdrawal #${wth.withdrawalId} as ${action} for ${wth.userName}`,
      wth.id
    );

    this.save();
    return wth;
  }

  // --- TRANSACTIONS ---
  public getTransactions(): Transaction[] {
    return this.data.transactions;
  }

  public getUserTransactions(userId: string): Transaction[] {
    return this.data.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createTransaction(tData: Omit<Transaction, 'id' | 'referenceId' | 'createdAt'>): Transaction {
    const count = this.data.transactions.length + 1;
    const ref = `AJME-TXN-${String(count).padStart(5, '0')}`;
    const newTxn: Transaction = {
      id: 'txn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      referenceId: ref,
      ...tData,
      createdAt: new Date().toISOString(),
    };
    this.data.transactions.push(newTxn);
    this.save();
    return newTxn;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): Notification[] {
    if (!Array.isArray(this.data.notifications)) {
      this.data.notifications = [];
    }
    return this.data.notifications
      .filter(n => n && (n.userId === userId || n.userId === null || !n.userId))
      .map(n => ({
        ...n,
        read: !!(n.read || (n as any).isRead),
      }))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  public createNotification(nData: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      ...nData,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    this.save();
    return true;
  }

  public markAllNotificationsRead(userId: string): void {
    for (const notif of this.data.notifications) {
      if (notif.userId === userId || notif.userId === null) {
        notif.read = true;
      }
    }
    this.save();
  }

  // --- AUDIT LOGS ---
  public createAuditLog(
    adminId: string,
    adminName: string,
    action: string,
    details: string,
    targetId?: string
  ): AuditLog {
    const log: AuditLog = {
      id: 'log-' + Date.now(),
      adminId,
      adminName,
      action,
      details,
      targetId,
      createdAt: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    this.save();
    return log;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  // --- DASHBOARDS ---
  public getCustomerDashboard(userId: string): CustomerDashboardData {
    // Authoritatively synchronize egg earnings first
    this.syncEggEarnings(userId);

    const user = this.getUserById(userId);
    const ownerships = this.getUserHenOwnerships(userId);
    const activeOwnerships = ownerships.filter(o => o.status === 'active');

    const totalHens = ownerships.reduce((sum, o) => sum + o.numberOfHens, 0);
    const activeHens = activeOwnerships.reduce((sum, o) => sum + o.numberOfHens, 0);
    const dailyEggs = activeHens * (this.data.settings.eggsPerHenPerDay || 1);

    const totalPurchases = ownerships.reduce((sum, o) => sum + o.totalInvested, 0);

    const eggBal = this.getUserEggBalance(userId);
    const recentProductions = this.getUserEggProductions(userId).slice(0, 15);
    const recentTransactions = this.getUserTransactions(userId).slice(0, 10);

    const withdrawals = this.getUserWithdrawals(userId);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    const pendingBalance = withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);
    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'paid')
      .reduce((sum, w) => sum + w.amount, 0);

    const unreadCount = this.getNotifications(userId).filter(n => !n.read).length;

    // Referrals
    const myCode = user?.referralCode;
    const referrals = this.data.users.filter(u => u.referredBy === myCode || u.referredBy === user?.id);
    const referralEarnings = this.getUserTransactions(userId)
      .filter(t => t.type === 'referral_reward')
      .reduce((sum, t) => sum + t.amount, 0);

    const cycleProgressAvg =
      activeOwnerships.length > 0
        ? Math.round(
            activeOwnerships.reduce((sum, o) => sum + o.daysCompleted, 0) / activeOwnerships.length
          )
        : 0;

    const userOrders = this.data.orders.filter(o => o.userId === userId);
    const pendingOrders = userOrders.filter(o => o.status === 'pending' || o.status === 'submitted' || o.status === 'under_review');
    const pendingOrdersCount = pendingOrders.length;
    const pendingHensCount = pendingOrders.reduce((acc, o) => acc + o.quantity, 0);

    // Calculate real-time authoritative next earning timing across active cycles
    const nowMs = Date.now();
    const durationLimit = this.data.settings.productionDurationDays || 120;
    let nextEarningTime: string | null = null;
    let nextEarningSeconds = 0;
    let nextEggBatchCount = 0;

    const validNextCycles = activeOwnerships
      .filter(o => o.nextEarningDate && o.daysCompleted < durationLimit)
      .map(o => ({
        cycle: o,
        ms: new Date(o.nextEarningDate!).getTime(),
      }))
      .filter(item => !isNaN(item.ms))
      .sort((a, b) => a.ms - b.ms);

    if (validNextCycles.length > 0) {
      const earliest = validNextCycles[0];
      nextEarningTime = new Date(earliest.ms).toISOString();
      nextEarningSeconds = Math.max(0, Math.floor((earliest.ms - nowMs) / 1000));
      // Sum all batches due at the earliest event (within 10s window)
      nextEggBatchCount = validNextCycles
        .filter(item => Math.abs(item.ms - earliest.ms) < 10000)
        .reduce((sum, item) => sum + item.cycle.numberOfHens, 0);
    }

    const totalCycleEggsMax = activeOwnerships.reduce(
      (sum, o) => sum + (o.totalCycleEggs || o.numberOfHens * durationLimit),
      0
    );
    const totalEarnedActiveFlock = activeOwnerships.reduce((sum, o) => sum + (o.eggsEarned || 0), 0);
    const isEarningActive = activeHens > 0 && validNextCycles.length > 0;

    return {
      totalHens,
      activeHens,
      dailyEggs,
      cycleProgressAvg,
      totalEggsEarned: eggBal.totalEarnedEggs,
      availableEggs: eggBal.availableEggs,
      soldEggs: eggBal.soldEggs,
      todayEggs: eggBal.todayEggs,
      totalPurchases,
      activeCycles: activeOwnerships.length,
      availableBalance: user?.balance || 0,
      pendingWithdrawals,
      pendingBalance,
      totalWithdrawn,
      eggPrice: this.data.settings.eggMonetaryValue || 15,
      rewards: {
        dailyEggs,
        referralRewards: referralEarnings,
        bonus: 0,
        specialRewards: 0,
      },
      activeOwnerships,
      recentProductions,
      recentTransactions,
      unreadNotificationsCount: unreadCount,
      referralCount: referrals.length,
      referralEarnings,
      pendingOrdersCount,
      pendingHensCount,
      isEarningActive,
      nextEarningTime,
      nextEarningSeconds,
      nextEggBatchCount: nextEggBatchCount || dailyEggs,
      totalCycleEggsMax: totalCycleEggsMax || totalHens * durationLimit,
      totalEarnedActiveFlock,
      serverTime: new Date().toISOString(),
    };
  }

  public getAdminDashboard(): AdminDashboardData {
    const customers = this.data.users.filter(u => u.role === 'customer');
    const totalHensSold = this.data.hen_ownership.reduce((sum, o) => sum + o.numberOfHens, 0);
    const activeHens = this.data.hen_ownership
      .filter(o => o.status === 'active')
      .reduce((sum, o) => sum + o.numberOfHens, 0);
    const completedCycles = this.data.hen_ownership.filter(o => o.status === 'completed').length;

    const eggsProduced = this.data.hen_ownership.reduce((sum, o) => sum + o.eggsEarned, 0);
    const eggsSold = this.data.egg_sales.reduce((sum, s) => sum + s.quantity, 0);

    const totalPurchases = this.data.orders
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSales = this.data.egg_sales.reduce((sum, s) => sum + s.totalAmount, 0);

    const pendingPayments = this.data.orders.filter(
      o => o.status === 'pending' || o.status === 'submitted' || o.status === 'under_review'
    ).length;
    const approvedPayments = this.data.orders.filter(o => o.status === 'approved').length;
    const rejectedPayments = this.data.orders.filter(o => o.status === 'rejected').length;
    const totalPaymentValue = this.data.orders
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingWithdrawals = this.data.withdrawals.filter(w => w.status === 'pending').length;

    const todayEggs = this.data.hen_ownership
      .filter(o => o.status === 'active')
      .reduce((sum, o) => sum + o.dailyEggs, 0);
    const totalWithdrawals = this.data.withdrawals
      .filter(w => w.status === 'paid' || w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);

    return {
      totalUsers: this.data.users.length,
      totalCustomers: customers.length,
      totalHens: totalHensSold,
      totalHensSold,
      activeHens,
      completedCycles,
      eggsProduced,
      totalEggsProduced: eggsProduced,
      todayEggs,
      eggsSold,
      totalPurchases,
      totalSales,
      totalWithdrawals,
      pendingOrders: pendingPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalPaymentValue,
      pendingWithdrawals,
      currentHenPrice: this.data.settings.henPrice || 500,
      currentEggPrice: this.data.settings.eggMonetaryValue || 15,
      recentOrders: this.data.orders.slice(-5).reverse(),
      recentWithdrawals: this.data.withdrawals.slice(-5).reverse(),
      recentEggSales: this.data.egg_sales.slice(-5).reverse(),
    };
  }

  public getEggProductionsAll(): EggProductionRecord[] {
    return [...this.data.egg_productions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Legacy compatibility for older earnings call
  public getUserEarnings(userId: string): EarningRecord[] {
    const productions = this.getUserEggProductions(userId);
    return productions.map(p => ({
      id: p.id,
      ownershipId: p.cycleId,
      ownershipRef: p.cycleRef,
      userId: p.userId,
      packageName: 'AL JADEED HEN',
      numberOfHens: p.hens,
      perHenAmount: 1, // 1 egg
      totalAmount: p.eggs,
      date: p.date,
      status: 'credited' as const,
      createdAt: p.createdAt,
    }));
  }

  public distributeDailyEarnings() {
    const res = this.runDailyEggProduction();
    return {
      message: `Daily egg production executed! Produced ${res.eggsProducedTotal} eggs across ${res.cyclesProcessed} active cycles.`,
      totalEarned: res.eggsProducedTotal,
      totalHensBenefited: res.eggsProducedTotal,
      accountsCredited: res.usersCreditedCount,
    };
  }
}

export const db = new Database();
