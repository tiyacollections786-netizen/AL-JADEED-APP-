import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, PlatformSettings } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';
import { getSupabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  settings: PlatformSettings | null;
  login: (identifier: string, password: string, updatePasswordIfMismatch?: boolean) => Promise<void>;
  otpLogin: (identifier: string, code?: string, newPassword?: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    referralCode?: string;
  }) => Promise<{ emailConfirmationRequired?: boolean; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  loginAsDemo: (role: 'customer' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Settings using default configuration', err);
    }
  }, []);

  const buildAppUserFromSupabase = useCallback(async (supabaseUser: any, supabaseClient: any): Promise<User> => {
    let profile: any = null;
    try {
      const { data: p } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      profile = p;
    } catch (err) {
      console.warn('Failed to load profile from public.users', err);
    }

    const metadata = supabaseUser.user_metadata || {};
    const email = supabaseUser.email || profile?.email || '';
    const name = profile?.name || metadata.name || email.split('@')[0] || 'Al Jadeed Member';
    const phone = profile?.phone || metadata.phone || '';
    const role = (profile?.role === 'admin' || metadata.role === 'admin' || email === 'admin@metaeggs.com')
      ? 'admin'
      : 'customer';
    const balance = Number(profile?.balance ?? 0);
    const referralCode = profile?.referral_code || metadata.referral_code || `AJME-${supabaseUser.id.substring(0, 5).toUpperCase()}`;

    return {
      id: supabaseUser.id,
      name,
      email,
      phone,
      role,
      balance,
      referralCode,
      status: (profile?.status as any) || 'active',
      bankDetails: profile?.bank_details || profile?.bankDetails,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      updatedAt: profile?.updated_at || new Date().toISOString(),
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const appUser = await buildAppUserFromSupabase(session.user, supabase);
          setStoredToken(session.access_token);
          setToken(session.access_token);
          setUser(appUser);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not restore Supabase session', err);
      }
    }

    // Fallback to existing api.getMe() or stored token
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch (err) {
      console.warn('Session expired or invalid, clearing token', err);
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [buildAppUserFromSupabase]);

  useEffect(() => {
    refreshSettings();
    refreshUser();

    // Listen to Supabase auth state changes if Supabase client is initialized
    const supabase = getSupabase();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const appUser = await buildAppUserFromSupabase(session.user, supabase);
          setStoredToken(session.access_token);
          setToken(session.access_token);
          setUser(appUser);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setStoredToken(null);
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [refreshSettings, refreshUser, buildAppUserFromSupabase]);

  const login = async (identifier: string, password: string, _updatePasswordIfMismatch?: boolean) => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error(
          'Supabase credentials not found. Please ensure NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
        );
      }

      const cleanIdentifier = identifier.trim();
      let targetEmail = cleanIdentifier.toLowerCase();

      // If identifier does not have an '@', attempt resolving phone or username from public.users table
      if (!targetEmail.includes('@')) {
        try {
          const { data: matchedUser } = await supabase
            .from('users')
            .select('email')
            .or(`phone.eq.${cleanIdentifier},username.eq.${cleanIdentifier}`)
            .maybeSingle();

          if (matchedUser?.email) {
            targetEmail = matchedUser.email.toLowerCase().trim();
          } else {
            throw new Error(`No account found for "${cleanIdentifier}". Please enter your registered email address.`);
          }
        } catch (lookupErr: any) {
          if (lookupErr.message && !lookupErr.message.includes('schema cache')) {
            throw lookupErr;
          }
        }
      }

      // Call Supabase Auth signInWithPassword()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed: user profile could not be loaded.');
      }

      const appUser = await buildAppUserFromSupabase(data.user, supabase);
      const authToken = data.session?.access_token || data.user.id;
      setStoredToken(authToken);
      setToken(authToken);
      setUser(appUser);
    } finally {
      setIsLoading(false);
    }
  };

  const otpLogin = async (identifier: string, _code?: string, newPassword?: string) => {
    return login(identifier, newPassword || 'User123!@#');
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    referralCode?: string;
  }): Promise<{ emailConfirmationRequired?: boolean; user?: User }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error(
          'Supabase credentials not found. Please ensure NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
        );
      }

      const cleanEmail = payload.email.trim().toLowerCase();
      const cleanName = payload.name.trim();
      const cleanPhone = payload.phone.trim();
      const refCode = payload.referralCode?.trim() || `AJME-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Call Supabase Auth signUp()
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: payload.password,
        options: {
          data: {
            name: cleanName,
            phone: cleanPhone,
            referral_code: refCode,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Failed to create account. Please check your details and try again.');
      }

      // Check if user identity is already registered (when email confirmation is enabled in Supabase)
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      // Upsert user into public.users table so relational queries and features work smoothly
      try {
        await supabase.from('users').upsert({
          id: data.user.id,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          balance: 0,
          referral_code: refCode,
          role: 'customer',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Ensure egg_balances row exists
        await supabase.from('egg_balances').upsert({
          user_id: data.user.id,
          available_eggs: 0,
          total_produced_eggs: 0,
          total_sold_eggs: 0,
          total_cash_earned: 0,
          last_updated: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('[Supabase DB Sync Warning]', dbErr);
      }

      const appUser: User = {
        id: data.user.id,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'customer',
        balance: 0,
        referralCode: refCode,
        status: 'active',
        createdAt: data.user.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (data.session) {
        setStoredToken(data.session.access_token);
        setToken(data.session.access_token);
        setUser(appUser);
        return { emailConfirmationRequired: false, user: appUser };
      } else {
        // Email confirmation is enabled in Supabase project settings
        return { emailConfirmationRequired: true, user: appUser };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error', err);
      }
    }
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const loginAsDemo = async (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      await login('admin@metaeggs.com', 'admin123456');
    } else {
      await login('user@metaeggs.com', 'User123!@#');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        settings,
        login,
        otpLogin,
        register,
        logout,
        refreshUser,
        refreshSettings,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

