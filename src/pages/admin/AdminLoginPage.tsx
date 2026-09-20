import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Layers,
  Sparkles,
  Egg,
} from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess?: () => void;
  onNavigateToPublic?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToPublic,
}) => {
  const { loginSuccess } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMessage('Please enter your administrator username or email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.adminLogin({
        username: cleanUsername,
        password,
      });

      if (res.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges are required to enter.');
      }

      loginSuccess(res.token, res.user);

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrator credentials. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#090416]">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Security Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-purple-900/80 to-pink-900/60 border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)] mb-4">
            <ShieldCheck className="w-9 h-9 text-pink-400" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-pink-400 bg-pink-950/60 px-3 py-1 rounded-full border border-pink-500/30 flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-pink-400" />
              Restricted Portal Access
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Al Jadeed Meta Eggs
          </h1>
          <p className="text-xs text-purple-300 mt-1 font-medium">
            Central Administrator & Financial Verification Console
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#12072b]/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-start gap-3 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300">Authentication Failed</p>
                <p className="text-red-200/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Quick Fill Master Credentials Banner */}
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">Master Admin Access</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-white font-mono text-xs">
                <span>Username: <strong className="text-pink-300 font-semibold">admin</strong></span>
                <span>Password: <strong className="text-pink-300 font-semibold">Admin@2026</strong></span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('Admin@2026');
              }}
              className="py-1.5 px-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              Auto-Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5">
                Admin Username or Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full bg-[#1b0a3f] border border-purple-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-200">
                  Master Password
                </label>
                <span className="text-[10px] text-purple-400 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3" /> Encrypted
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#1b0a3f] border border-purple-500/30 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security notice */}
            <div className="p-3 bg-[#0d0422] border border-purple-500/20 rounded-xl text-[11px] text-purple-300/80 leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                Authorized access only. All login sessions, verification approvals, and database modifications are audited and logged with IP verification.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Administrator...</span>
                </>
              ) : (
                <>
                  <span>Enter Administrator Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Navigation to Public Website */}
          <div className="mt-6 pt-5 border-t border-purple-500/20 text-center">
            <button
              type="button"
              onClick={onNavigateToPublic}
              className="text-xs text-purple-300 hover:text-pink-400 font-medium transition-colors inline-flex items-center gap-1.5"
            >
              ← Return to Investor & Customer Portal
            </button>
          </div>
        </div>

        {/* Security Footer Badge */}
        <div className="mt-6 text-center text-[11px] text-purple-400/60 font-mono flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Server Security Active • 256-bit BCrypt Role Guard</span>
        </div>
      </div>
    </div>
  );
};
