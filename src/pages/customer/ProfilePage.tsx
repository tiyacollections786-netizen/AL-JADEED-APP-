import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User,
  Mail,
  Phone,
  Lock,
  Gift,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Calendar,
  Check,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatusMessage(null);

    try {
      await api.updateProfile({
        name,
        phone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      await refreshUser();
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-5 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Investor Profile & Security
              </h1>
              <p className="text-xs text-purple-300">
                Manage contact details, credentials, and referral affiliate links
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0424] border border-purple-500/25 p-3 rounded-2xl">
          <span className="text-[10px] text-purple-400 font-bold uppercase block">Account ID</span>
          <span className="text-xs font-mono font-bold text-amber-300">
            {user?.id}
          </span>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Referral Link Card */}
      <div className="bg-gradient-to-br from-[#1d0842] to-[#14082e] border border-pink-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(236,72,153,0.15)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <Gift className="w-4 h-4" />
            Investor Referral Program
          </span>
          <span className="text-[11px] text-purple-300">Earn 5% bonus on friend hen purchases</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-300">
            {user?.referralCode || 'ALJADEED-REF-DEFAULT'}
          </div>
          <button
            onClick={copyReferral}
            className="py-2 px-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            {copiedReferral ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.12)]">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          Personal & Security Settings
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-purple-300 font-bold block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">Mobile Contact</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="text-purple-300 font-bold block mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-[#0d0422]/60 border border-purple-500/20 rounded-xl px-3.5 py-2 text-purple-400 outline-none cursor-not-allowed"
            />
            <span className="text-[10px] text-purple-400 mt-0.5 block">Email cannot be altered for security compliance.</span>
          </div>

          <div className="pt-2 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-purple-300 font-bold block mb-1">Current Password (optional)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">New Password (optional)</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {isUpdating ? 'Updating Information...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
