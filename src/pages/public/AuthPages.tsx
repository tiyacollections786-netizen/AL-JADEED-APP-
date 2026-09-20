import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Gift,
  Egg,
  Check,
  Loader2,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import promoBannerImg from '../../assets/images/promo_banner.jpg';

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot' | 'change-password';
  onNavigate: (view: string, params?: any) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onNavigate,
}) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'change-password'>(initialMode);

  // Form Fields
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Sign Up Fields
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const [showReferralInput, setShowReferralInput] = useState<boolean>(false);

  // Forgot Password Fields
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotCode, setForgotCode] = useState<string>('786120');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState<boolean>(false);

  // Change Password Fields
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

  // UI States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode if initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode]);

  // Clear messages when mode toggles
  const switchMode = (newMode: 'login' | 'register' | 'forgot' | 'change-password') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // ====================================================
  // 1. SUBMIT: LOGIN
  // ====================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your mobile number or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanIdentifier, password);
      setSuccessMessage('Login successful! Redirecting to your dashboard...');
      setTimeout(() => {
        onNavigate('customer-dashboard');
      }, 300);
    } catch (err: any) {
      console.error('Login error:', err);
      const errMsg = err?.response?.data?.error || err?.message || 'Incorrect credentials. Please verify and try again.';
      setErrorMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click login helper for testing
  const handleQuickDemoLogin = async (demoIdentifier: string, role?: string) => {
    if (role === 'admin') {
      onNavigate('admin-login');
      return;
    }
    setIdentifier(demoIdentifier);
    setPassword('User123!@#');
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(demoIdentifier, 'User123!@#');
      setSuccessMessage('Logged in successfully! Entering dashboard...');
      setTimeout(() => {
        onNavigate('customer-dashboard');
      }, 300);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials or create an account.');
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================================
  // 2. SUBMIT: SIGN UP (CREATE ACCOUNT)
  // ====================================================
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 03001234567).');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password,
        referralCode: referralCode.trim() || undefined,
      });

      if (res?.emailConfirmationRequired) {
        setSuccessMessage('Account created. Please verify your email before logging in.');
        setTimeout(() => {
          switchMode('login');
        }, 3200);
      } else {
        setSuccessMessage('Account created successfully! Taking you to your dashboard...');
        setTimeout(() => {
          onNavigate('customer-dashboard');
        }, 400);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errMsg = err?.response?.data?.error || err?.message || 'Registration failed. Please try again.';
      setErrorMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================================
  // 3. SUBMIT: FORGOT PASSWORD
  // ====================================================
  const handleForgotStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your registered mobile number or email.');
      return;
    }

    setIsLoading(true);
    try {
      await api.forgotPassword(cleanId);
      setForgotStep(2);
      setForgotCode('786120'); // Pre-fill default code for effortless testing
      setSuccessMessage('Verification code sent! Use code 786120 to set your new password.');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Account not found. Please verify your mobile number or email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotCode || forgotCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword({
        identifier: identifier.trim(),
        resetCode: forgotCode.trim(),
        newPassword: forgotNewPassword,
      });

      setSuccessMessage('Password reset successfully! Logging you in...');
      setTimeout(async () => {
        try {
          await login(identifier.trim(), forgotNewPassword);
          onNavigate('customer-dashboard');
        } catch {
          switchMode('login');
          setPassword(forgotNewPassword);
          setSuccessMessage('Password updated! Click Login to enter your dashboard.');
        }
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Invalid code or reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================================
  // 4. SUBMIT: CHANGE PASSWORD (LOGGED-IN)
  // ====================================================
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => {
        onNavigate('customer-dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || 'Failed to update password. Verify your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#090416] text-white flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-tr from-purple-900/25 via-pink-600/20 to-indigo-900/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-violet-900/15 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Main Responsive Layout: Two-Column on Desktop (lg:), Top-Banner on Mobile */}
      <div className="w-full max-w-5xl xl:max-w-6xl mx-auto z-10 py-2 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
          
          {/* ====================================================
              COLUMN 1 / DESKTOP ONLY: PROMOTIONAL IMAGE SHOWCASE
              ==================================================== */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-[#12062b]/90 shadow-[0_20px_50px_rgba(168,85,247,0.25)] backdrop-blur-md p-3.5 group">
              <div className="relative rounded-2xl overflow-hidden border border-purple-400/20 bg-[#0d041e] aspect-square flex items-center justify-center">
                <img
                  src={promoBannerImg}
                  alt="Al Jadeed Meta Eggs - Smart Farming, Real Earnings"
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-[1.015]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Subtle soft gradient highlight on bottom of image */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#12062b] via-[#12062b]/50 to-transparent pointer-events-none" />
                
                {/* Floating Tag inside image container */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl bg-purple-950/90 backdrop-blur-md border border-purple-400/40 shadow-lg text-[11px] font-bold text-purple-100 flex items-center gap-1.5">
                    <Egg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Invest • Grow • Earn</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-[11px] tracking-wide shadow-lg border border-pink-400/40">
                    Rs. 500 / Hen
                  </div>
                </div>
              </div>

              {/* 4 Feature Highlights Grid below image */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 px-1">
                <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                    <Egg className="w-4 h-4 text-pink-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate">Rs. 500 / Hen</span>
                    <span className="text-[10px] text-purple-300/70 block truncate">120 Days Commercial Cycle</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate">Daily Production</span>
                    <span className="text-[10px] text-purple-300/70 block truncate">Automated Egg Sales</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate">Shariah Compliant</span>
                    <span className="text-[10px] text-purple-300/70 block truncate">Asset-Backed Farming</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate">Fast Withdrawals</span>
                    <span className="text-[10px] text-purple-300/70 block truncate">Easypaisa & JazzCash</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              COLUMN 2 (DESKTOP) / MAIN COLUMN (MOBILE):
              TOP BANNER (MOBILE) + AUTHENTICATION CARD
              ==================================================== */}
          <div className="w-full max-w-[440px] mx-auto lg:mx-0 lg:col-span-6 xl:col-span-5 space-y-4">
            
            {/* MOBILE ONLY: TOP-BANNER LAYOUT */}
            {/* Ensuring the promotional image is not distorted (object-cover + responsive aspect ratio) and login card remains easily accessible below */}
            <div className="block lg:hidden w-full">
              <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg bg-[#12062b]">
                <img
                  src={promoBannerImg}
                  alt="Al Jadeed Meta Eggs Promotional Banner"
                  className="w-full h-full object-cover object-[center_32%]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12062b] via-transparent to-black/25 pointer-events-none" />
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="text-[10.5px] font-extrabold text-white tracking-wide drop-shadow-md bg-purple-950/85 px-2.5 py-0.5 rounded-lg border border-purple-400/30 backdrop-blur-sm">
                    AL JADEED META EGGS
                  </span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/70 px-2 py-0.5 rounded-lg border border-amber-400/40">
                    Rs. 500/Hen
                  </span>
                </div>
              </div>
            </div>

            {/* BRAND HEADER & TITLE */}
            <div className="text-center space-y-2">
              {/* Desktop animated badge - hidden on mobile since top banner already has vibrant brand art */}
              <div className="hidden lg:flex justify-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative mx-auto w-16 h-16 flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-60 animate-pulse" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#2a0e5c] via-[#1a073a] to-[#0c031d] border border-purple-400/40 p-1 shadow-md flex items-center justify-center">
                    <div className="w-full h-full rounded-[14px] bg-[#12052b] flex flex-col items-center justify-center">
                      <Egg className="w-7 h-7 text-amber-400 fill-amber-400/90 drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Brand Name */}
              <div>
                <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-white block leading-tight">
                  AL JADEED
                </span>
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 leading-tight">
                  META EGGS
                </span>
              </div>

              {/* Platform Purpose */}
              <div className="px-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {mode === 'login' && 'Welcome to Al Jadeed Meta Eggs'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Forgot Password'}
                  {mode === 'change-password' && 'Change Password'}
                </h1>
                <p className="text-xs text-purple-200/80 mt-1 max-w-sm mx-auto leading-relaxed">
                  {mode === 'login' &&
                    'Manage your hens, track egg production, and grow your earnings — all in one simple platform.'}
                  {mode === 'register' &&
                    'Join thousands of Pakistani investors owning commercial layer hens digitally.'}
                  {mode === 'forgot' &&
                    'Enter your registered mobile number or email to receive a password reset code.'}
                  {mode === 'change-password' &&
                    'Update your account security credentials.'}
                </p>
              </div>
            </div>

            {/* ====================================================
                MAIN AUTHENTICATION CARD
                ==================================================== */}
            <div className="bg-[#12062b] p-5 sm:p-7 rounded-3xl border border-purple-500/35 shadow-[0_12px_40px_rgba(168,85,247,0.22),inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-4">
          
          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-red-950/90 border border-red-500/50 rounded-2xl space-y-2.5 text-xs text-red-200"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>

                {/* Error recovery helper: Reset Password */}
                {mode === 'login' && (
                  <div className="pt-2 border-t border-red-500/30 flex items-center justify-between">
                    <span className="text-[11px] text-purple-300">Forgot your credentials?</span>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-pink-400 hover:text-pink-300 font-extrabold underline cursor-pointer"
                    >
                      Reset Password →
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ====================================================
              VIEW 1: LOGIN
              ==================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Field: Mobile Number / Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-200 block">
                  Mobile Number / Email <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    id="login-identifier-input"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    placeholder="03008476546 or email@example.com"
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none transition"
                  />
                </div>
              </div>

              {/* Field: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-200">
                    Password <span className="text-pink-400">*</span>
                  </label>
                  {/* Small link: Forgot Password? */}
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3.5 text-purple-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="login-remember-me"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-purple-500/40 bg-[#090317] text-pink-600 focus:ring-pink-500 cursor-pointer accent-pink-600"
                />
                <label htmlFor="login-remember-me" className="text-xs text-purple-300 cursor-pointer select-none">
                  Remember Me
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Primary Button: Login */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Secondary Button: Create Account */}
                <button
                  type="button"
                  id="switch-to-register-btn"
                  onClick={() => switchMode('register')}
                  className="w-full py-3.5 px-5 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-400/35 hover:border-pink-500/50 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          )}

          {/* ====================================================
              VIEW 2: SIGN UP (CREATE ACCOUNT)
              ==================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  Full Name <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    id="signup-name-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. Muhammad Usman"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  Mobile Number <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    id="signup-phone-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="03001234567"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  Email Address <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    id="signup-email-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  Password <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3.5 text-purple-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  Confirm Password <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="signup-confirm-password-input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3.5 text-purple-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional Referral Code Toggle */}
              <div>
                {!showReferralInput ? (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(true)}
                    className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Have a referral code? (Optional)</span>
                  </button>
                ) : (
                  <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                    <label className="text-xs font-bold text-purple-200 block">
                      Referral Code (Optional)
                    </label>
                    <div className="relative">
                      <Gift className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        id="signup-referral-input"
                        value={referralCode}
                        onChange={e => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="e.g. AJME-786"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 font-mono uppercase focus:border-pink-500 outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Primary Button: Create Account */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Secondary Button: Back to Login */}
                <button
                  type="button"
                  id="switch-to-login-btn"
                  onClick={() => switchMode('login')}
                  className="w-full py-3 px-5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Already have an account?</span>
                  <span className="text-pink-400 font-extrabold">Login</span>
                </button>
              </div>
            </form>
          )}

          {/* ====================================================
              VIEW 3: FORGOT PASSWORD
              ==================================================== */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotStep1Submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-purple-200 block">
                      Mobile Number / Email <span className="text-pink-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        id="forgot-identifier-input"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        required
                        placeholder="03008476546 or email@example.com"
                        className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white placeholder-purple-400/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:border-pink-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <span>Send Reset Code</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="w-full py-2.5 text-xs text-purple-300 hover:text-white font-bold transition-colors cursor-pointer text-center"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotStep2Submit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-200 block">
                      6-Digit Verification Code <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotCode}
                      onChange={e => setForgotCode(e.target.value)}
                      required
                      placeholder="786120"
                      className="w-full py-2.5 px-4 text-center tracking-[0.3em] font-mono text-base font-black rounded-2xl bg-[#090317] border border-purple-500/40 text-pink-300 outline-none focus:border-pink-500"
                    />
                    <span className="text-[10px] text-purple-300/70 block text-center">
                      Demo verification code: <strong className="text-pink-400">786120</strong>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-200 block">
                      New Password <span className="text-pink-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        required
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white font-mono placeholder-purple-400/45 focus:border-pink-500 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3.5 top-3.5 text-purple-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving new password...</span>
                        </>
                      ) : (
                        <span>Save New Password & Login</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        switchMode('login');
                      }}
                      className="w-full py-2 text-xs text-purple-300 hover:text-white font-bold transition-colors cursor-pointer text-center"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ====================================================
              VIEW 4: CHANGE PASSWORD (FOR LOGGED-IN USERS)
              ==================================================== */}
          {mode === 'change-password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  Current Password <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white font-mono placeholder-purple-400/45 focus:border-pink-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-3.5 text-purple-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  New Password <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white font-mono placeholder-purple-400/45 focus:border-pink-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-purple-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  Confirm New Password <span className="text-pink-400">*</span>
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="Re-type new password"
                  className="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#090317] border border-purple-500/40 text-white font-mono placeholder-purple-400/45 focus:border-pink-500 outline-none transition"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('customer-dashboard')}
                  className="w-full py-2 text-xs text-purple-300 hover:text-white font-bold transition-colors cursor-pointer text-center"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </form>
          )}

          {/* ====================================================
              SUBTLE FAST DEMO ACCESS (EFFORTLESS REVIEW TESTING)
              ==================================================== */}
          {mode === 'login' && (
            <div className="pt-3 border-t border-purple-500/20">
              <div className="p-3 bg-[#190838]/80 border border-purple-500/25 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>1-Click Fast Access</span>
                  </span>
                  <span className="text-[10px] text-purple-400/70 font-normal">For Instant Testing</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('tiyacollections786@gmail.com')}
                    disabled={isLoading}
                    className="py-2 px-2.5 bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-left transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <span className="text-[9px] uppercase text-pink-200 font-black block tracking-wider">My Account</span>
                    <span className="text-[11px] font-semibold text-white truncate block">03008476546</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('user@metaeggs.com')}
                    disabled={isLoading}
                    className="py-2 px-2.5 bg-[#200a47] hover:bg-[#2c0e61] border border-purple-400/30 text-white rounded-xl text-left transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <span className="text-[9px] uppercase text-purple-300 font-black block tracking-wider">Demo Investor</span>
                    <span className="text-[11px] font-semibold text-white truncate block">M. Usman Lodhi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

            </div>

            {/* Security & Trust Footer */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-purple-300/60 pt-1 text-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted & Verified</span>
              </span>
              <span>•</span>
              <span>Commercial Farms</span>
              <span>•</span>
              <span>Daily Yields</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
