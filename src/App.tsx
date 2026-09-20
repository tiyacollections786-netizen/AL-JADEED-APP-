import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { Egg } from 'lucide-react';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { PackagesPage } from './pages/public/PackagesPage';
import { AuthPages } from './pages/public/AuthPages';
import { InfoPages } from './pages/public/InfoPages';

// Customer pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { MyHensPage } from './pages/customer/MyHensPage';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { TransactionsPage } from './pages/customer/TransactionsPage';
import { EarningsPage } from './pages/customer/EarningsPage';
import { WithdrawalsPage } from './pages/customer/WithdrawalsPage';
import { NotificationsPage } from './pages/customer/NotificationsPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { HenDetailsPage } from './pages/customer/HenDetailsPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminPackagesPage } from './pages/admin/AdminPackagesPage';
import { AdminHenOwnershipPage } from './pages/admin/AdminHenOwnershipPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminEarningsPage } from './pages/admin/AdminEarningsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminLocationsPage } from './pages/admin/AdminLocationsPage';

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Initial routing:
  // When a visitor opens the website/app for the first time, NEVER take them directly to the dashboard.
  // Instead, show a polished, engaging Login / Welcome screen first.
  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin/login') return 'admin-login';
    if (path === '/admin' || path.startsWith('/admin/')) return 'admin-dashboard';
    if (path === '/register') return 'register';
    if (path === '/forgot-password') return 'forgot-password';
    return 'login';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [viewParams, setViewParams] = useState<any>(null);

  // Sync with browser URL changes and history navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/login') {
        setCurrentView('admin-login');
      } else if (path === '/admin' || path === '/admin/dashboard') {
        setCurrentView(isAuthenticated && user?.role === 'admin' ? 'admin-dashboard' : 'admin-login');
      } else if (path === '/dashboard') {
        setCurrentView(
          isAuthenticated
            ? user?.role === 'admin'
              ? 'admin-dashboard'
              : 'customer-dashboard'
            : 'login'
        );
      } else if (path === '/register') {
        setCurrentView(isAuthenticated ? 'customer-dashboard' : 'register');
      } else if (path === '/forgot-password') {
        setCurrentView(isAuthenticated ? 'customer-dashboard' : 'forgot-password');
      } else if (path === '/' || path === '/login') {
        setCurrentView(
          isAuthenticated
            ? user?.role === 'admin'
              ? 'admin-dashboard'
              : 'customer-dashboard'
            : 'login'
        );
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, user]);

  // Reactive authentication enforcement logic:
  // 1. If unauthenticated: protected dashboard routes must not be accessible directly.
  //    If an unauthenticated user tries to open dashboard or customer views, redirect to Login.
  // 2. If authenticated: do not show Login again. Redirect them directly to their Dashboard.
  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (
        (currentView.startsWith('customer-') && currentView !== 'customer-hen-details') ||
        currentView === 'dashboard' ||
        currentView === 'landing'
      ) {
        setCurrentView('login');
      } else if (currentView.startsWith('admin-') && currentView !== 'admin-login') {
        setCurrentView('admin-login');
      }
    } else {
      if (
        currentView === 'login' ||
        currentView === 'register' ||
        currentView === 'landing' ||
        currentView === 'forgot-password'
      ) {
        if (user?.role === 'admin') {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('customer-dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, currentView]);

  const handleNavigate = (view: string, params?: any) => {
    if (params) {
      setViewParams(params);
    }

    // Protected admin route gate
    if (view.startsWith('admin-') && view !== 'admin-login' && (!isAuthenticated || user?.role !== 'admin')) {
      setCurrentView('admin-login');
      window.history.pushState(null, '', '/admin/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Protected customer route gate
    if (
      (view.startsWith('customer-') && view !== 'customer-hen-details') ||
      (view === 'dashboard' && !isAuthenticated)
    ) {
      if (!isAuthenticated) {
        setCurrentView('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // If authenticated user clicks login or register, take them to their dashboard
    if ((view === 'login' || view === 'register') && isAuthenticated) {
      setCurrentView(user?.role === 'admin' ? 'admin-dashboard' : 'customer-dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Sync URL path for admin views
    if (view === 'admin-login') {
      window.history.pushState(null, '', '/admin/login');
    } else if (view === 'admin-dashboard') {
      window.history.pushState(null, '', '/admin');
    }

    setCurrentView(view);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading Splash Screen while session/token initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090416] text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-[0_0_30px_rgba(236,72,153,0.5)] animate-pulse mb-3">
          <div className="w-full h-full bg-[#0d0522] rounded-3xl flex items-center justify-center">
            <Egg className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
        </div>
        <h1 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 uppercase">
          Al Jadeed Meta Eggs
        </h1>
        <p className="text-[11px] text-purple-300/70 mt-1">Starting platform...</p>
      </div>
    );
  }

  const isCustomerDashboard = currentView.startsWith('customer-');
  const isAdminDashboard = currentView.startsWith('admin-');
  const isDashboardMode = isCustomerDashboard || isAdminDashboard;

  // Pure auth screen detection (where distracting marketing footer should be omitted)
  const isAuthScreen =
    currentView === 'login' ||
    currentView === 'register' ||
    currentView === 'forgot-password' ||
    currentView === 'change-password' ||
    currentView === 'admin-login';

  return (
    <div className="min-h-screen bg-[#090416] text-white flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Main Navigation Bar with Mobile-first Header & Profile Menu */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Content Area */}
      {isDashboardMode ? (
        <div className="flex-1 flex flex-col lg:flex-row max-w-full">
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:block shrink-0">
            <Sidebar
              currentView={currentView}
              onNavigate={handleNavigate}
              isAdminMode={isAdminDashboard}
            />
          </div>

          {/* Mobile Dashboard Bar */}
          <div className="lg:hidden bg-[#12062b] text-white px-4 py-3 border-b border-purple-500/20 flex items-center justify-between shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
              {isAdminDashboard ? 'Admin Operations' : 'Investor Flock Portal'}
            </span>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="px-3 py-1 bg-purple-900/40 text-xs font-bold rounded-xl border border-purple-500/30 text-purple-200 active:scale-95 transition-all"
            >
              {mobileSidebarOpen ? 'Close Menu' : 'Operations Menu'}
            </button>
          </div>

          {/* Mobile Collapsible Sidebar Drawer */}
          {mobileSidebarOpen && (
            <div className="lg:hidden bg-[#12062b] border-b border-purple-500/20">
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
                isAdminMode={isAdminDashboard}
              />
            </div>
          )}

          {/* Dashboard Workspace */}
          <main className="flex-1 overflow-x-hidden min-w-0 pb-16 lg:pb-8">
            {/* Customer Views */}
            {currentView === 'customer-dashboard' && <CustomerDashboard onNavigate={handleNavigate} />}
            {currentView === 'customer-hen-details' && (
              <HenDetailsPage
                onNavigate={handleNavigate}
                initialQuantity={viewParams?.quantity || 1}
                initialPackage={viewParams?.pkg}
              />
            )}
            {currentView === 'customer-my-hens' && <MyHensPage onNavigate={handleNavigate} />}
            {currentView === 'customer-my-eggs' && <EarningsPage />}
            {currentView === 'customer-orders' && <CustomerOrdersPage onNavigate={handleNavigate} />}
            {currentView === 'customer-transactions' && <TransactionsPage onNavigate={handleNavigate} />}
            {currentView === 'customer-earnings' && <EarningsPage />}
            {currentView === 'customer-withdrawals' && <WithdrawalsPage />}
            {currentView === 'customer-notifications' && <NotificationsPage />}
            {currentView === 'customer-profile' && <ProfilePage />}

            {/* Admin Views */}
            {currentView === 'admin-dashboard' && <AdminDashboard onNavigate={handleNavigate} />}
            {currentView === 'admin-customers' && <AdminCustomersPage />}
            {currentView === 'admin-packages' && <AdminPackagesPage />}
            {currentView === 'admin-hen-ownership' && <AdminHenOwnershipPage />}
            {currentView === 'admin-orders' && <AdminOrdersPage />}
            {currentView === 'admin-payments' && <AdminOrdersPage />}
            {currentView === 'admin-transactions' && <TransactionsPage onNavigate={handleNavigate} />}
            {currentView === 'admin-earnings' && <AdminEarningsPage />}
            {currentView === 'admin-withdrawals' && <AdminWithdrawalsPage />}
            {currentView === 'admin-notifications' && <NotificationsPage />}
            {currentView === 'admin-audit-logs' && <AdminAuditLogsPage />}
            {currentView === 'admin-locations' && <AdminLocationsPage />}
            {currentView === 'admin-settings' && <AdminSettingsPage />}
          </main>
        </div>
      ) : (
        /* Public Portal Views */
        <main className="flex-1 pb-12 lg:pb-0">
          {/* Default entry: Welcome + Login screen */}
          {currentView === 'login' && <AuthPages initialMode="login" onNavigate={handleNavigate} />}
          {currentView === 'register' && <AuthPages initialMode="register" onNavigate={handleNavigate} />}
          {currentView === 'forgot-password' && <AuthPages initialMode="forgot" onNavigate={handleNavigate} />}
          {currentView === 'change-password' && <AuthPages initialMode="change-password" onNavigate={handleNavigate} />}
          {currentView === 'admin-login' && (
            <AdminLoginPage
              onLoginSuccess={() => handleNavigate('admin-dashboard')}
              onNavigateToPublic={() => handleNavigate('login')}
            />
          )}
          {currentView === 'landing' && <AuthPages initialMode="login" onNavigate={handleNavigate} />}
          {currentView === 'packages' && <PackagesPage onNavigate={handleNavigate} />}
          {currentView === 'customer-hen-details' && (
            <HenDetailsPage
              onNavigate={handleNavigate}
              initialQuantity={viewParams?.quantity || 1}
              initialPackage={viewParams?.pkg}
            />
          )}
          {currentView === 'hen-details' && (
            <HenDetailsPage
              onNavigate={handleNavigate}
              initialQuantity={viewParams?.quantity || 1}
              initialPackage={viewParams?.pkg}
            />
          )}
          {currentView === 'how-it-works' && <InfoPages type="how-it-works" onNavigate={handleNavigate} />}
          {currentView === 'about' && <InfoPages type="about" onNavigate={handleNavigate} />}
          {currentView === 'contact' && <InfoPages type="contact" onNavigate={handleNavigate} />}
          {currentView === 'locations' && <InfoPages type="locations" onNavigate={handleNavigate} />}
          {currentView === 'calculator' && <LandingPage onNavigate={handleNavigate} />}
        </main>
      )}

      {/* Mobile Bottom Navigation (Shown on mobile for logged-in users) */}
      {isAuthenticated && <BottomNav currentView={currentView} onNavigate={handleNavigate} />}

      {/* Global Footer (shown on public info/catalog pages, omitted on focused auth screens) */}
      {!isDashboardMode && !isAuthScreen && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
