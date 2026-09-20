import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { User, Order, HenOwnership, EggBalance, Withdrawal } from '../src/types';

export function getServerSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  ).trim();
}

export function getServerSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();
}

export function getServerSupabaseProjectId(): string {
  const url = getServerSupabaseUrl();
  try {
    const parsed = new URL(url);
    return parsed.hostname.split('.')[0] || '';
  } catch {
    return '';
  }
}

let firebaseConfigCache: any = null;
let supabaseServerClient: SupabaseClient | null = null;

export function getFirebaseConfig() {
  if (!firebaseConfigCache) {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        firebaseConfigCache = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (e) {
      console.error('[CloudDb] Failed to read firebase-applet-config.json', e);
    }
  }
  return firebaseConfigCache;
}

/**
 * Returns or initializes the Supabase server client.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = getServerSupabaseUrl();
  const key = getServerSupabaseAnonKey();

  if (!url || !key) {
    return null;
  }

  if (!supabaseServerClient) {
    try {
      supabaseServerClient = createClient(url, key, {
        auth: {
          persistSession: false,
        },
      });
      console.log('[Supabase Server] Initialized connection to:', url);
    } catch (err) {
      console.error('[Supabase Server Init Error]', err);
      return null;
    }
  }

  return supabaseServerClient;
}

/**
 * Provides comprehensive database connection status.
 */
export function getDatabaseStatus() {
  const fbConfig = getFirebaseConfig();
  const supabaseUrl = getServerSupabaseUrl();
  const supabaseKey = getServerSupabaseAnonKey();
  const projectId = getServerSupabaseProjectId();
  const isSupabaseReady = !!(supabaseUrl && supabaseKey);

  return {
    firebase: {
      connected: !!fbConfig?.projectId,
      projectId: fbConfig?.projectId || null,
      databaseId: fbConfig?.firestoreDatabaseId || null,
      authDomain: fbConfig?.authDomain || null,
      storageBucket: fbConfig?.storageBucket || null,
      status: fbConfig?.projectId ? 'Active & Provisioned' : 'Unconfigured',
    },
    supabase: {
      configured: isSupabaseReady,
      projectId: projectId || 'Not set',
      url: supabaseUrl || 'Not set',
      status: isSupabaseReady ? `Live & Connected (${projectId})` : 'Waiting for Credentials',
    },
  };
}

/**
 * Generates the complete PostgreSQL schema definition for Supabase.
 */
export function getSupabaseSqlSchema(): string {
  return `-- ================================================================
-- AL JADEED META EGGS - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  balance NUMERIC(12,2) DEFAULT 0,
  referral_code TEXT,
  referred_by TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE (Hen Purchases)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  package_id TEXT,
  package_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_hen NUMERIC(10,2) NOT NULL DEFAULT 500,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  sender_account TEXT,
  submitted_amount NUMERIC(12,2),
  payment_proof_url TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  hen_status TEXT DEFAULT 'Awaiting Approval',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HEN OWNERSHIP TABLE (120-Day Production Cycles)
CREATE TABLE IF NOT EXISTS public.hen_ownership (
  id TEXT PRIMARY KEY,
  ownership_id TEXT,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  order_id TEXT,
  package_id TEXT,
  package_name TEXT,
  number_of_hens INTEGER NOT NULL DEFAULT 1,
  price_per_hen NUMERIC(10,2) DEFAULT 500,
  total_invested NUMERIC(12,2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  production_duration_days INTEGER DEFAULT 120,
  days_elapsed INTEGER DEFAULT 0,
  days_remaining INTEGER DEFAULT 120,
  daily_egg_rate INTEGER DEFAULT 1,
  expected_total_eggs INTEGER,
  total_eggs_produced INTEGER DEFAULT 0,
  eggs_retained INTEGER DEFAULT 0,
  eggs_sold INTEGER DEFAULT 0,
  last_egg_date TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EGG BALANCES TABLE
CREATE TABLE IF NOT EXISTS public.egg_balances (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  available_eggs INTEGER DEFAULT 0,
  total_produced_eggs INTEGER DEFAULT 0,
  total_sold_eggs INTEGER DEFAULT 0,
  total_cash_earned NUMERIC(12,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  account_type TEXT NOT NULL,
  account_title TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hen_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egg_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow public service role access & authenticated reads
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow server service_role full access') THEN
    CREATE POLICY "Allow server service_role full access" ON public.users FOR ALL USING (true);
    CREATE POLICY "Allow server service_role full access" ON public.orders FOR ALL USING (true);
    CREATE POLICY "Allow server service_role full access" ON public.hen_ownership FOR ALL USING (true);
    CREATE POLICY "Allow server service_role full access" ON public.egg_balances FOR ALL USING (true);
    CREATE POLICY "Allow server service_role full access" ON public.withdrawals FOR ALL USING (true);
  END IF;
END $$;
`;
}

/**
 * Synchronizes a User record to Supabase (if connected)
 */
export async function syncUserToSupabase(user: User): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      balance: user.balance || 0,
      referral_code: user.referralCode || null,
      referred_by: user.referredBy || null,
      status: user.status || 'active',
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync User Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Sync User Exception]', err);
    return false;
  }
}

/**
 * Synchronizes an Order to Supabase (if connected)
 */
export async function syncOrderToSupabase(order: Order): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      order_number: order.orderNumber,
      user_id: order.userId,
      user_name: order.userName,
      user_email: order.userEmail,
      user_phone: order.userPhone,
      package_id: order.packageId,
      package_name: order.packageName,
      quantity: order.quantity,
      price_per_hen: order.pricePerHen,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      payment_reference: order.paymentReference || null,
      sender_account: order.senderAccount || null,
      submitted_amount: order.submittedAmount || null,
      payment_proof_url: order.paymentProofUrl || null,
      status: order.status,
      payment_status: order.paymentStatus,
      hen_status: order.henStatus,
      admin_notes: order.adminNotes || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync Order Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Sync Order Exception]', err);
    return false;
  }
}

/**
 * Synchronizes a Withdrawal to Supabase (if connected)
 */
export async function syncWithdrawalToSupabase(withdrawal: Withdrawal): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('withdrawals').upsert({
      id: withdrawal.id,
      user_id: withdrawal.userId,
      amount: withdrawal.amount,
      account_type: withdrawal.method,
      account_title: withdrawal.accountTitle,
      account_number: withdrawal.accountNumber,
      bank_name: withdrawal.bankName || null,
      status: withdrawal.status,
      admin_notes: withdrawal.adminNotes || null,
      created_at: withdrawal.createdAt,
    });

    if (error) {
      console.warn('[Supabase Sync Withdrawal Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Sync Withdrawal Exception]', err);
    return false;
  }
}

/**
 * Synchronizes a Hen Ownership cycle to Supabase (if connected)
 */
export async function syncHenOwnershipToSupabase(ownership: HenOwnership): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('hen_ownership').upsert({
      id: ownership.id,
      ownership_id: ownership.ownershipId,
      user_id: ownership.userId,
      order_id: ownership.orderId || null,
      package_id: ownership.packageId,
      package_name: ownership.packageName,
      number_of_hens: ownership.numberOfHens,
      price_per_hen: ownership.pricePerHen,
      total_invested: ownership.totalInvested,
      start_date: ownership.purchaseDate,
      end_date: ownership.expiryDate,
      production_duration_days: 120,
      days_elapsed: ownership.daysCompleted,
      days_remaining: ownership.daysRemaining,
      daily_egg_rate: ownership.dailyEggs,
      expected_total_eggs: ownership.totalCycleEggs,
      total_eggs_produced: ownership.eggsEarned,
      eggs_retained: ownership.remainingEggs,
      eggs_sold: 0,
      last_egg_date: ownership.lastProductionDate || null,
      status: ownership.status,
    });

    if (error) {
      console.warn('[Supabase Sync Hen Ownership Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Sync Hen Ownership Exception]', err);
    return false;
  }
}

/**
 * Synchronizes an Egg Balance to Supabase (if connected)
 */
export async function syncEggBalanceToSupabase(balance: EggBalance): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('egg_balances').upsert({
      user_id: balance.userId,
      available_eggs: balance.availableEggs,
      total_produced_eggs: balance.totalEarnedEggs,
      total_sold_eggs: balance.soldEggs,
      total_cash_earned: 0,
      last_updated: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync Egg Balance Error]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Sync Egg Balance Exception]', err);
    return false;
  }
}
