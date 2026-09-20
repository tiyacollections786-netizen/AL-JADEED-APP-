import React, { useState, useEffect } from 'react';
import { Withdrawal } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowDownToLine,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  Search,
  X,
  Smartphone,
  Coins,
  Download,
} from 'lucide-react';
import { downloadCSV, formatDateForCSV } from '../../utils/csvExport';

// Status Badge Component for high-contrast visual scanning
const StatusBadge: React.FC<{
  status: Withdrawal['status'];
  adminNote?: string;
  adminNotes?: string;
}> = ({ status, adminNote, adminNotes }) => {
  const isPending = status === 'pending';
  const isApproved = status === 'approved' || status === 'paid';
  const isRejected = status === 'rejected';
  const note = adminNote || adminNotes;

  if (isPending) {
    return (
      <div className="inline-flex flex-col items-start gap-1 font-sans">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Pending
        </span>
      </div>
    );
  }

  if (isApproved) {
    return (
      <div className="inline-flex flex-col items-start gap-1 font-sans">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-emerald-500/15 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {status === 'paid' ? 'Paid' : 'Approved'}
        </span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="inline-flex flex-col items-start gap-1 font-sans">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-rose-500/15 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400"></span>
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          Rejected
        </span>
        {note && (
          <span
            className="text-[10px] text-rose-300/80 font-normal truncate max-w-[160px]"
            title={note}
          >
            {note}
          </span>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 font-sans">
      {status}
    </span>
  );
};

export const AdminWithdrawalsPage: React.FC = () => {
  const { settings } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Mark as Paid modal
  const [payingWithdrawal, setPayingWithdrawal] = useState<Withdrawal | null>(null);
  const [payoutReference, setPayoutReference] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadWithdrawals = async () => {
    try {
      const data = await api.getAdminWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.updateWithdrawalStatus(id, 'approved', undefined, 'Approved by finance desk');
      setFeedback('Withdrawal request approved.');
      await loadWithdrawals();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Error approving withdrawal: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter rejection reason (funds will be refunded to user wallet):');
    if (reason === null) return;

    try {
      await api.updateWithdrawalStatus(id, 'rejected', undefined, reason);
      setFeedback('Withdrawal rejected and funds refunded to customer wallet.');
      await loadWithdrawals();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Error rejecting withdrawal: ${err.message}`);
    }
  };

  const handleMarkAsPaidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingWithdrawal) return;

    setIsProcessing(true);
    try {
      await api.updateWithdrawalStatus(
        payingWithdrawal.id,
        'approved',
        payoutReference.trim(),
        adminNote.trim() || 'Paid via Banking Desk'
      );
      setPayingWithdrawal(null);
      setPayoutReference('');
      setAdminNote('');
      setFeedback('Withdrawal marked as paid and payout reference recorded.');
      await loadWithdrawals();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Error updating payout: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = withdrawals.filter(w => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'approved'
        ? w.status === 'approved' || w.status === 'paid'
        : w.status === statusFilter;
    const matchesSearch =
      (w.id && w.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.withdrawalId && w.withdrawalId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.userName && w.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.userEmail && w.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.accountTitle && w.accountTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.accountNumber && w.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const approvedCount = withdrawals.filter(w => w.status === 'approved' || w.status === 'paid').length;
  const rejectedCount = withdrawals.filter(w => w.status === 'rejected').length;

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'Withdrawal ID',
      'System ID',
      'Date & Time',
      'Processed Date',
      'Investor Name',
      'Email',
      'Payment Method',
      'Account Title',
      'Account Number / IBAN',
      'Bank Name',
      `Amount (${currency})`,
      `Fee (${currency})`,
      `Net Payout (${currency})`,
      'Status',
      'Payout Reference',
      'Admin Notes',
    ];

    const rows = filtered.map(w => [
      w.withdrawalId || w.id,
      w.id,
      formatDateForCSV(w.createdAt),
      formatDateForCSV(w.processedAt),
      w.userName || '',
      w.userEmail || '',
      w.method ? w.method.toUpperCase() : '',
      w.accountTitle || '',
      w.accountNumber || '',
      w.bankName || '',
      w.amount,
      w.fee || 0,
      w.netAmount ?? w.amount,
      w.status,
      w.payoutReference || '',
      w.adminNotes || '',
    ]);

    const dateSlug = new Date().toISOString().slice(0, 10);
    const filterSlug = statusFilter === 'all' ? 'all' : statusFilter;
    const filename = `aljadeed_withdrawals_${filterSlug}_${dateSlug}.csv`;

    downloadCSV(filename, headers, rows);
    setFeedback(`Exported ${filtered.length} withdrawal transaction(s) to CSV (${filename}).`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/30 border border-purple-500/40 flex items-center justify-center text-pink-400 shrink-0 shadow-inner">
            <ArrowDownToLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cash Payout Disbursement Desk
            </h1>
            <p className="text-xs text-purple-300">
              Manage, review, and disburse customer cash withdrawals via EasyPaisa, JazzCash, SadaPay & Bank IBFT
            </p>
          </div>
        </div>

        {/* Quick Color-Coded Status Overview Cards */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-2 rounded-2xl border transition-all text-left cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/40'
                : 'bg-amber-950/30 border-amber-500/30 hover:border-amber-400/60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              Pending
            </div>
            <div className="text-base font-black text-amber-300 font-mono">
              {withdrawals.filter(w => w.status === 'pending').length}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-2 rounded-2xl border transition-all text-left cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/40'
                : 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400/60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Approved
            </div>
            <div className="text-base font-black text-emerald-300 font-mono">
              {withdrawals.filter(w => w.status === 'approved' || w.status === 'paid').length}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-2 rounded-2xl border transition-all text-left cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-rose-500/25 border-rose-400 ring-2 ring-rose-400/40'
                : 'bg-rose-950/30 border-rose-500/30 hover:border-rose-400/60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              <XCircle className="w-3 h-3 text-rose-400" />
              Rejected
            </div>
            <div className="text-base font-black text-rose-300 font-mono">
              {withdrawals.filter(w => w.status === 'rejected').length}
            </div>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, Account Title, Number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#14082e] border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0d0422] border border-purple-500/25 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              All
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/60 text-purple-200">
                {withdrawals.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-purple-300 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Pending
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-purple-300 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Approved
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {approvedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  : 'text-purple-300 hover:text-rose-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Rejected
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {rejectedCount}
              </span>
            </button>
          </div>

          <button
            type="button"
            id="export-withdrawals-csv-btn"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
            title={`Export ${filtered.length} visible withdrawal record(s) to CSV`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export to CSV</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/30">
              {filtered.length}
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 text-center text-purple-300 text-xs">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading withdrawal requests...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 bg-[#14082e] border border-purple-500/30 rounded-3xl text-center text-xs text-purple-300/80">
          No withdrawal requests found matching filter.
        </div>
      ) : (
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.12)]">
          <div className="overflow-x-auto p-0.5 sm:p-1">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#1a0a3d] text-purple-400 text-[10px] font-bold uppercase tracking-wider border-b border-purple-500/20">
                <tr>
                  <th className="py-3.5 px-4">Payout ID</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Beneficiary Account</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/15 font-mono">
                {filtered.map(w => {
                  const isPending = w.status === 'pending';
                  const isApproved = w.status === 'approved' || w.status === 'paid';
                  const isRejected = w.status === 'rejected';

                  return (
                    <tr
                      key={w.id}
                      className={`transition-all duration-200 ease-out border-l-4 origin-center hover:scale-[1.006] sm:hover:scale-[1.008] hover:z-10 relative cursor-pointer ${
                        isPending
                          ? 'border-l-amber-500 hover:bg-amber-950/30 hover:shadow-[0_4px_25px_rgba(245,158,11,0.22)]'
                          : isApproved
                          ? 'border-l-emerald-500 hover:bg-emerald-950/30 hover:shadow-[0_4px_25px_rgba(16,185,129,0.22)]'
                          : isRejected
                          ? 'border-l-rose-500 hover:bg-rose-950/30 hover:shadow-[0_4px_25px_rgba(244,63,94,0.22)]'
                          : 'border-l-purple-500/40 hover:bg-purple-900/30 hover:shadow-[0_4px_25px_rgba(168,85,247,0.22)]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-amber-300">
                        <span className="block">{w.withdrawalId || w.id}</span>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white uppercase">
                        {w.method}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-sans font-bold text-white block">{w.accountTitle}</span>
                        <span className="text-purple-300 text-[11px] block">{w.accountNumber}</span>
                        {(w.userName || w.userEmail) && (
                          <span className="text-[10px] text-purple-400 block font-sans">
                            User: {w.userName || w.userEmail}
                          </span>
                        )}
                        {w.bankName && <span className="text-[10px] text-purple-400 font-sans block">{w.bankName}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-purple-400">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-pink-400">
                        {currency} {w.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={w.status} adminNotes={w.adminNotes} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPayingWithdrawal(w);
                                setPayoutReference(`TRX-PAY-${Date.now().toString().slice(-6)}`);
                              }}
                              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors"
                            >
                              Disburse Payout
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              className="py-1 px-2 rounded-lg bg-red-950/60 border border-red-500/30 text-red-400 hover:bg-red-900/60 text-[11px] font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-purple-400">
                            {w.payoutReference ? `Ref: ${w.payoutReference}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISBURSE PAYOUT MODAL */}
      {payingWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-white animate-fade-in">
          <div className="bg-[#14082e] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-white">Disburse Payout Funds</h3>
                <StatusBadge status={payingWithdrawal.status} />
              </div>
              <button onClick={() => setPayingWithdrawal(null)} className="text-purple-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#0d0422] rounded-xl border border-purple-500/25 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-300">Amount:</span>
                <span className="font-black text-pink-400 text-sm">
                  {currency} {payingWithdrawal.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Channel:</span>
                <span className="font-bold text-white uppercase">{payingWithdrawal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Account:</span>
                <span className="font-bold text-white">{payingWithdrawal.accountTitle} ({payingWithdrawal.accountNumber})</span>
              </div>
            </div>

            <form onSubmit={handleMarkAsPaidSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-purple-300 font-bold block mb-1">
                  Bank / Wallet Dispatched TRX Reference ID <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={payoutReference}
                  onChange={e => setPayoutReference(e.target.value)}
                  placeholder="e.g. EP-90432849 or Alfalah FT849204"
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3 py-2 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-purple-300 font-bold block mb-1">Admin Audit Note</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="e.g. Sent via EasyPaisa corporate account"
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingWithdrawal(null)}
                  className="py-2.5 px-4 bg-[#1b0a3d] rounded-xl text-xs font-bold text-purple-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {isProcessing ? 'Confirming...' : 'Confirm & Mark Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
