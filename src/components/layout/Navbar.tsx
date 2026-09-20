import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Notification } from '../../types';
import {
  Menu,
  X,
  User,
  Settings,
  Lock,
  LogOut,
  Sparkles,
  Wallet,
  Bell,
  Home,
  Egg,
  ShoppingCart,
  Layers,
  HelpCircle,
  MapPin,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout, settings, loginAsDemo } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const currency = settings?.currencySymbol || 'Rs.';

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setProfileMenuOpen(false);
    logout();
    onNavigate('login');
  };

  return (
    <>
      {/* ====================================================
          STICKY HEADER: COMPACT, POLISHED, 360px-414px SAFE
          ==================================================== */}
      <header className="sticky top-0 z-40 bg-[#090416]/95 backdrop-blur-md border-b border-purple-500/20 text-white shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* 1. LEFT: 3D GLOWING HAMBURGER BUTTON */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="header-hamburger-btn"
                onClick={() => {
                  if (onToggleSidebar) onToggleSidebar();
                  setMobileNavOpen(prev => !prev);
                }}
                className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#2a0e5c] to-[#140632] border border-purple-400/30 shadow-[0_0_14px_rgba(168,85,247,0.25),inset_0_1px_1px_rgba(255,255,255,0.18)] hover:shadow-[0_0_18px_rgba(168,85,247,0.4)] flex items-center justify-center text-purple-200 hover:text-white active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileNavOpen ? <X className="w-5 h-5 text-pink-400" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop Logo (hidden on small mobile screens to keep perfect mobile header layout) */}
              <div
                onClick={() => onNavigate(isAuthenticated ? (isAdmin ? 'admin-dashboard' : 'customer-dashboard') : 'login')}
                className="hidden lg:flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-[0_0_14px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#0d0522] rounded-2xl flex items-center justify-center">
                    <Egg className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CENTER: BRAND HEADER - ONLY "Al Jadeed" & "META EGGS" (NO TAGLINE) */}
            <div
              id="header-brand-logo"
              onClick={() => onNavigate(isAuthenticated ? (isAdmin ? 'admin-dashboard' : 'customer-dashboard') : 'login')}
              className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer select-none px-1"
            >
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-white leading-tight">
                Al Jadeed
              </span>
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 leading-tight">
                META EGGS
              </span>
            </div>

            {/* 3. RIGHT: NOTIFICATIONS, DESKTOP LINKS, AND 3D GLOWING PROFILE ICON */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Desktop Quick Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => onNavigate('landing')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    currentView === 'landing' ? 'text-pink-400 bg-purple-950/60' : 'text-purple-200/80 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('packages')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    currentView === 'packages' ? 'text-pink-400 bg-purple-950/60' : 'text-purple-200/80 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  Buy Hens
                </button>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    currentView === 'how-it-works' ? 'text-pink-400 bg-purple-950/60' : 'text-purple-200/80 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  How It Works
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'customer-dashboard')}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl text-amber-300 hover:text-white bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 transition-colors"
                  >
                    Dashboard
                  </button>
                )}
              </nav>

              {/* Wallet Balance Chip (if logged-in investor on desktop/tablet) */}
              {isAuthenticated && !isAdmin && (
                <button
                  onClick={() => onNavigate('customer-withdrawals')}
                  className="hidden md:flex items-center gap-2 bg-[#1b0a3d] hover:bg-[#250d53] border border-purple-500/30 rounded-2xl px-3 py-1.5 transition-colors group"
                  title="Your Cash Wallet"
                >
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                    {currency} {user?.balance?.toLocaleString() || '0'}
                  </span>
                </button>
              )}

              {/* Notifications Bell (if authenticated) */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="w-10 h-10 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-200 hover:text-white transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#13082e] border border-purple-500/40 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] py-3 z-50">
                      <div className="px-4 pb-2 border-b border-purple-500/20 flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-pink-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-purple-500/10">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-purple-300/60">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setNotifDropdownOpen(false);
                                if (n.link) onNavigate(n.link.replace('/user/', 'customer-'));
                              }}
                              className={`p-3 text-left hover:bg-purple-900/30 cursor-pointer transition-colors ${
                                !n.read ? 'bg-purple-950/40' : ''
                              }`}
                            >
                              <p className="text-xs font-semibold text-white">{n.title}</p>
                              <p className="text-[11px] text-purple-300 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. RIGHT PROFILE ICON: 3D GLOWING CIRCULAR BUTTON */}
              <button
                type="button"
                id="header-profile-btn"
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-[0_0_16px_rgba(236,72,153,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_0_22px_rgba(236,72,153,0.6)] flex items-center justify-center active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none"
                aria-label="Account profile menu"
              >
                <div className="w-full h-full rounded-full bg-[#110526] flex items-center justify-center relative">
                  {isAuthenticated ? (
                    <>
                      <span className="text-xs font-black text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#110526] rounded-full" />
                    </>
                  ) : (
                    <User className="w-4 h-4 text-purple-200" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================
          ACCOUNT / PROFILE MENU (BOTTOM SHEET ON MOBILE, DROPDOWN ON DESKTOP)
          ==================================================== */}
      {profileMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={() => setProfileMenuOpen(false)}
          />

          {/* Modal / Sheet Content */}
          <div className="relative z-10 w-full sm:w-80 sm:mt-16 bg-[#13072b] border border-purple-500/40 rounded-t-3xl sm:rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.35)] overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
            {/* Mobile Sheet Handle */}
            <div className="sm:hidden w-12 h-1.5 bg-purple-500/30 rounded-full mx-auto mt-3 mb-1" />

            {/* Menu Header */}
            <div className="p-4 sm:p-5 border-b border-purple-500/20 bg-gradient-to-r from-[#1c0a3d] to-[#14062c] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
                  <div className="w-full h-full rounded-2xl bg-[#0e0424] flex items-center justify-center text-white font-black text-sm">
                    {isAuthenticated ? (user?.name?.charAt(0).toUpperCase() || 'U') : <User className="w-5 h-5 text-purple-300" />}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {isAuthenticated ? user?.name : 'Guest Visitor'}
                  </p>
                  <p className="text-[11px] text-purple-300/80 truncate">
                    {isAuthenticated ? (user?.role === 'admin' ? 'Platform Administrator' : 'User Account') : 'Al Jadeed Meta Eggs'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-purple-900/40 text-purple-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ====================================================
                IF LOGGED IN: SHOW PROFILE, SETTINGS, CHANGE PASSWORD, LOGOUT
                ==================================================== */}
            {isAuthenticated ? (
              <div className="p-3 sm:p-4 space-y-1.5">
                {/* 1. Profile */}
                <button
                  id="menu-profile-btn"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('customer-profile');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-purple-500/40 text-left transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center text-purple-300 group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Profile</span>
                    <span className="text-[10px] text-purple-300/70">View personal details & ID</span>
                  </div>
                </button>

                {/* 2. Account Settings */}
                <button
                  id="menu-settings-btn"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate(isAdmin ? 'admin-settings' : 'customer-profile');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-purple-500/40 text-left transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-800 to-blue-900 flex items-center justify-center text-indigo-300 group-hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Account Settings</span>
                    <span className="text-[10px] text-purple-300/70">Bank account & payout details</span>
                  </div>
                </button>

                {/* 3. Change Password */}
                <button
                  id="menu-change-password-btn"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('change-password');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 hover:border-purple-500/40 text-left transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-800 to-orange-900 flex items-center justify-center text-amber-300 group-hover:text-white transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Change Password</span>
                    <span className="text-[10px] text-purple-300/70">Update your security credentials</span>
                  </div>
                </button>

                <div className="border-t border-purple-500/20 my-2 pt-1" />

                {/* 4. Logout (Triggers Logout Confirmation Dialog) */}
                <button
                  id="menu-logout-btn"
                  onClick={() => {
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/25 hover:border-red-500/40 text-left transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-900/40 flex items-center justify-center text-red-400 group-hover:text-red-200 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-400 block group-hover:text-red-300">Logout</span>
                    <span className="text-[10px] text-red-300/70">End your current session</span>
                  </div>
                </button>
              </div>
            ) : (
              /* ====================================================
                  IF LOGGED OUT: SHOW LOGIN & SIGN UP OPTIONS
                  ==================================================== */
              <div className="p-4 space-y-3">
                <p className="text-xs text-purple-300/90 text-center">
                  Sign in to access your digital flock, egg harvests, and wallet.
                </p>

                {/* Login Option */}
                <button
                  id="menu-login-btn"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('login');
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 hover:border-pink-500/40 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-white block">Login</span>
                    <span className="text-[10px] text-purple-300">Existing investor sign-in</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Sign Up Option */}
                <button
                  id="menu-register-btn"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onNavigate('register');
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-indigo-600/30 hover:from-pink-600/50 hover:to-indigo-600/50 border border-pink-500/40 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-white block">Create Account</span>
                    <span className="text-[10px] text-pink-300">Own digital commercial hens</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Fast One-Click Demo Login */}
                <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block text-center">
                    Instant Demo Preview
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        loginAsDemo('customer');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Demo User
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        loginAsDemo('admin');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-pink-300 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Demo Admin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          LOGOUT CONFIRMATION DIALOG (AS EXPLICITLY REQUESTED)
          ==================================================== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#160833] border border-purple-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.25)] space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-md">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Logout?</h3>
              <p className="text-xs text-purple-200/80 mt-1">
                Are you sure you want to logout?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                id="logout-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-bold text-purple-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="logout-confirm-btn"
                onClick={handleLogoutConfirm}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MOBILE NAVIGATION DRAWER (HAMBURGER FLYOUT)
          ==================================================== */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[#110526] border-r border-purple-500/30 p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-y-auto">
            <div className="space-y-5">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                <div
                  onClick={() => {
                    setMobileNavOpen(false);
                    onNavigate(isAuthenticated ? (isAdmin ? 'admin-dashboard' : 'customer-dashboard') : 'login');
                  }}
                  className="cursor-pointer"
                >
                  <p className="text-base font-black text-white tracking-tight leading-tight">
                    Al Jadeed
                  </p>
                  <p className="text-[10px] font-black uppercase text-pink-400 tracking-wider">
                    META EGGS
                  </p>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-xl bg-purple-950 text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider px-2 block mb-1">
                  Explore
                </span>

                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    onNavigate('landing');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    currentView === 'landing' ? 'bg-purple-900/60 text-pink-400' : 'text-purple-200 hover:bg-purple-900/30'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    onNavigate('packages');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    currentView === 'packages' ? 'bg-purple-900/60 text-pink-400' : 'text-purple-200 hover:bg-purple-900/30'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-pink-400" />
                  <span>Buy Hens (Rs. 500)</span>
                </button>

                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    onNavigate('how-it-works');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    currentView === 'how-it-works' ? 'bg-purple-900/60 text-pink-400' : 'text-purple-200 hover:bg-purple-900/30'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>How It Works</span>
                </button>

                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    onNavigate('locations');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    currentView === 'locations' ? 'bg-purple-900/60 text-pink-400' : 'text-purple-200 hover:bg-purple-900/30'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Farm Locations</span>
                </button>
              </div>

              {/* If Authenticated: Dashboard Shortcuts */}
              {isAuthenticated ? (
                <div className="space-y-1 pt-3 border-t border-purple-500/20">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 block mb-1">
                    {isAdmin ? 'Admin Console' : 'Investor Dashboard'}
                  </span>

                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      onNavigate(isAdmin ? 'admin-dashboard' : 'customer-dashboard');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left text-white bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-purple-500/30"
                  >
                    <Layers className="w-4 h-4 text-pink-400" />
                    <span>Dashboard Home</span>
                  </button>

                  {!isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setMobileNavOpen(false);
                          onNavigate('customer-my-hens');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left text-purple-200 hover:bg-purple-900/30"
                      >
                        <Egg className="w-4 h-4 text-amber-400" />
                        <span>My Hens</span>
                      </button>

                      <button
                        onClick={() => {
                          setMobileNavOpen(false);
                          onNavigate('customer-my-eggs');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left text-purple-200 hover:bg-purple-900/30"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>My Eggs & Payouts</span>
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 space-y-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      onNavigate('login');
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-xs font-bold text-white text-center hover:bg-purple-900"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      onNavigate('register');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-xs font-bold text-white text-center shadow-md"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-bold text-red-300 text-center hover:bg-red-900/40"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
