import React, { useState, useEffect } from 'react';
import { User, EggBalance } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Egg,
  Wallet,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  UserCheck,
  UserX,
  X,
  Share2,
  Coins,
  RefreshCw,
} from 'lucide-react';

interface CustomerWithDetails extends User {
  totalHens?: number;
  totalInvested?: number;
  eggBalance?: EggBalance;
}

export const AdminCustomersPage: React.FC = () => {
  const { settings } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithDetails | null>(null);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Failed to load customer directory', err);
      setFeedback({ type: 'error', text: err.message || 'Failed to load customers' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleStatus = async (customer: CustomerWithDetails) => {
    const nextStatus = customer.status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      nextStatus === 'suspended'
        ? `Are you sure you want to suspend account for ${customer.name}? They will be blocked from logging in.`
        : `Are you sure you want to restore active access for ${customer.name}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(customer.id);
    try {
      await api.updateCustomerStatus(customer.id, nextStatus);
      setFeedback({
        type: 'success',
        text: `Customer ${customer.name} status updated to ${nextStatus.toUpperCase()}.`,
      });
      await loadCustomers();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update customer status' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = customers.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      (c.referralCode && c.referralCode.toLowerCase().includes(search.toLowerCase())) ||
      (c.username && c.username.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalRegistered = customers.length;
  const totalActive = customers.filter(c => c.status === 'active').length;
  const totalSuspended = customers.filter(c => c.status === 'suspended').length;
  const totalFlock = customers.reduce((sum, c) => sum + (c.totalHens || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-pink-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Customer & Investor Management
              </h1>
              <p className="text-xs text-purple-300">
                View investors, monitor active hen flocks, wallet balances, and manage account statuses
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadCustomers}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-200 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12072b] border border-purple-500/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
            Total Investors
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {totalRegistered}
          </span>
          <span className="text-[11px] text-purple-300/70 mt-1 block">Registered in ecosystem</span>
        </div>

        <div className="bg-[#12072b] border border-purple-500/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
            Active Accounts
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {totalActive}
          </span>
          <span className="text-[11px] text-emerald-300/70 mt-1 block">Good standing</span>
        </div>

        <div className="bg-[#12072b] border border-purple-500/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">
            Suspended Accounts
          </span>
          <span className="text-2xl font-black text-red-400 font-mono mt-1 block">
            {totalSuspended}
          </span>
          <span className="text-[11px] text-red-300/70 mt-1 block">Access blocked</span>
        </div>

        <div className="bg-[#12072b] border border-purple-500/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <span className="text-[10px] uppercase font-bold text-pink-400 block tracking-wider">
            Total Investor Flock
          </span>
          <span className="text-2xl font-black text-pink-400 font-mono mt-1 block">
            {totalFlock.toLocaleString()}
          </span>
          <span className="text-[11px] text-pink-300/70 mt-1 block">Assigned active hens</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, referral..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#14082e] border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0d0422] border border-purple-500/25 rounded-xl self-start sm:self-auto">
          {(['all', 'active', 'suspended'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all ${
                statusFilter === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Customers' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#12072b] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        {isLoading ? (
          <div className="py-16 text-center text-purple-400">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading customer directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-purple-400/70">
            <Users className="w-10 h-10 mx-auto mb-2 text-purple-500/40" />
            <p className="text-sm font-bold">No Customers Found</p>
            <p className="text-xs text-purple-400/60 mt-1">Try refining your search terms or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#1c0c42] text-purple-300 font-bold uppercase tracking-wider text-[10px] border-b border-purple-500/20">
                <tr>
                  <th className="py-3.5 px-4">Investor Profile</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Flock Size</th>
                  <th className="py-3.5 px-4">Cash Wallet</th>
                  <th className="py-3.5 px-4">Egg Yield</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 font-sans">
                {filtered.map(c => {
                  const isSuspended = c.status === 'suspended';
                  const isActionLoading = actionLoadingId === c.id;

                  return (
                    <tr key={c.id} className="hover:bg-purple-950/30 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-pink-600 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {c.role === 'admin' && (
                                <span className="bg-purple-900/80 text-purple-300 text-[9px] px-1.5 py-0.2 rounded border border-purple-500/40 font-mono">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-purple-400 font-mono block">
                              Ref: {c.referralCode || c.id.slice(0, 10)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-purple-200">
                            <Mail className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-purple-300 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Flock Size */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-pink-950/80 border border-pink-500/30 flex items-center justify-center text-pink-400 font-mono font-bold text-xs">
                            {c.totalHens || 0}
                          </span>
                          <span className="text-[11px] text-purple-300">Hens</span>
                        </div>
                      </td>

                      {/* Cash Wallet */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {currency} {(c.balance || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Egg Yield */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div className="text-amber-300 flex items-center gap-1">
                            <Egg className="w-3 h-3 text-amber-400" />
                            <span>{c.eggBalance?.availableEggs || 0} avail</span>
                          </div>
                          <div className="text-purple-400 text-[10px]">
                            {c.eggBalance?.totalEarnedEggs || 0} total earned
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 border border-red-500/40 text-red-300">
                            <XCircle className="w-3 h-3 text-red-400" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white rounded-lg border border-purple-500/30 transition-all title='View Details'"
                            title="View Customer Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {c.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleStatus(c)}
                              disabled={isActionLoading}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isSuspended
                                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                                  : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-500/40'
                              }`}
                              title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                            >
                              {isSuspended ? (
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <UserX className="w-3.5 h-3.5 text-red-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Dossier Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14082e] border border-purple-500/40 rounded-3xl p-6 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative text-white space-y-4">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg bg-purple-900/40"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-pink-600 flex items-center justify-center text-white font-black text-lg uppercase">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{selectedCustomer.name}</h2>
                <span className="text-xs text-purple-300 font-mono">
                  User ID: {selectedCustomer.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0e0422] p-3 rounded-xl border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Flock Holdings</span>
                <span className="text-base font-black text-pink-400 font-mono">
                  {selectedCustomer.totalHens || 0} Hens
                </span>
              </div>

              <div className="bg-[#0e0422] p-3 rounded-xl border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Cash Balance</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {currency} {(selectedCustomer.balance || 0).toLocaleString()}
                </span>
              </div>

              <div className="bg-[#0e0422] p-3 rounded-xl border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Available Eggs</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {selectedCustomer.eggBalance?.availableEggs || 0} Eggs
                </span>
              </div>

              <div className="bg-[#0e0422] p-3 rounded-xl border border-purple-500/20">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Total Lifetime Yield</span>
                <span className="text-base font-black text-purple-300 font-mono">
                  {selectedCustomer.eggBalance?.totalEarnedEggs || 0} Eggs
                </span>
              </div>
            </div>

            <div className="bg-[#0e0422] p-3.5 rounded-xl border border-purple-500/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-400">Email:</span>
                <span className="text-white font-medium">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Phone:</span>
                <span className="text-white font-mono">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Referral Code:</span>
                <span className="text-pink-400 font-mono font-bold">
                  {selectedCustomer.referralCode || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Account Status:</span>
                <span
                  className={`font-bold ${
                    selectedCustomer.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {selectedCustomer.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Registered On:</span>
                <span className="text-purple-200">
                  {new Date(selectedCustomer.createdAt).toLocaleDateString('en-PK', {
                    dateStyle: 'medium',
                  })}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
