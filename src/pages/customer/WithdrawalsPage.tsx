import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Withdrawal } from '../../types';
import { PaymentBrandLogo } from '../../components/common/PaymentBrandLogo';
import { fireSubtleWithdrawalConfetti } from '../../utils/confetti';
import {
  Wallet,
  ArrowDownToLine,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

type WithdrawalMethodId = 'easypaisa' | 'jazzcash' | 'sadapay' | 'bank' | 'crypto';

export const WithdrawalsPage: React.FC = () => {
  const { user, settings, refreshUser } = useAuth();
  const { showSuccess } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payout Method
  const [method, setMethod] = useState<WithdrawalMethodId>('easypaisa');

  // Form Fields
  const [amount, setAmount] = useState<string>('');
  const [accountTitle, setAccountTitle] = useState<string>(user?.name || '');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('Bank Alfalah');
  const [iban, setIban] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currency = settings?.currencySymbol || 'Rs.';
  const availableBalance = user?.balance || 0;
  const feePercent = settings?.withdrawalFeePercent || 0;

  const numAmount = parseFloat(amount) || 0;
  const feeAmount = Math.round((numAmount * feePercent) / 100);
  const netAmount = Math.max(0, numAmount - feeAmount);

  const loadWithdrawals = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMyWithdrawals();
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

  // Update account title default when user changes
  useEffect(() => {
    if (user?.name && !accountTitle) {
      setAccountTitle(user.name);
    }
  }, [user?.name]);

  // Dynamic withdrawal methods list
  const withdrawalMethods = useMemo(() => {
    const pm = settings?.paymentMethods;
    const list: Array<{
      id: WithdrawalMethodId;
      name: string;
      brand: string;
      description: string;
      logoUrl?: string;
      enabled: boolean;
    }> = [
      {
        id: 'easypaisa',
        name: 'Easypaisa',
        brand: 'easypaisa',
        description: 'Withdraw to Easypaisa',
        logoUrl: pm?.easypaisa?.logoUrl,
        enabled: pm?.easypaisa?.enabled !== false,
      },
      {
        id: 'jazzcash',
        name: 'JazzCash',
        brand: 'jazzcash',
        description: 'Withdraw to JazzCash',
        logoUrl: pm?.jazzcash?.logoUrl,
        enabled: pm?.jazzcash?.enabled !== false,
      },
      {
        id: 'sadapay',
        name: 'SadaPay',
        brand: 'sadapay',
        description: 'Withdraw to SadaPay',
        logoUrl: pm?.sadapay?.logoUrl,
        enabled: pm?.sadapay?.enabled !== false,
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        brand: 'bankTransfer',
        description: 'Withdraw to Bank Account',
        logoUrl: pm?.bankTransfer?.logoUrl,
        enabled: pm?.bankTransfer?.enabled !== false,
      },
    ];

    if (pm?.crypto?.enabled === true) {
      list.push({
        id: 'crypto',
        name: 'USDT (TRC-20)',
        brand: 'crypto',
        description: 'Withdraw to TRC-20 Wallet',
        logoUrl: pm?.crypto?.logoUrl,
        enabled: true,
      });
    }

    return list.filter((m) => m.enabled);
  }, [settings?.paymentMethods]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedAmount = parseFloat(amount);

    if (amount.trim() === '' || isNaN(parsedAmount)) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    if (parsedAmount < 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    if (parsedAmount === 0) {
      setErrorMessage('Enter an amount greater than Rs.0.');
      return;
    }

    if (parsedAmount > availableBalance) {
      setErrorMessage('Insufficient balance.');
      return;
    }

    if (!accountNumber.trim()) {
      setErrorMessage('Please enter your receiving account / mobile wallet number.');
      return;
    }

    setIsSubmitting(true);

    let methodLabel = 'Easypaisa';
    if (method === 'jazzcash') methodLabel = 'JazzCash';
    else if (method === 'sadapay') methodLabel = 'SadaPay';
    else if (method === 'bank') methodLabel = 'Bank Transfer';
    else if (method === 'crypto') methodLabel = 'Crypto USDT';

    // Build final account number including IBAN if provided for bank/sadapay
    const finalAccountNumber = iban.trim()
      ? `${accountNumber.trim()} (IBAN: ${iban.trim()})`
      : accountNumber.trim();

    try {
      await api.createWithdrawal({
        amount: numAmount,
        method: methodLabel,
        accountTitle: accountTitle.trim() || user?.name || 'Account Holder',
        accountNumber: finalAccountNumber,
        bankName: method === 'bank' ? bankName : method === 'sadapay' ? 'SadaPay' : undefined,
      });

      setSuccessMessage('Withdrawal request submitted successfully. Waiting for admin verification.');
      setAmount('');
      setAccountNumber('');
      setIban('');

      // Trigger celebratory confetti and success toast
      fireSubtleWithdrawalConfetti();
      showSuccess(
        'Withdrawal Request Submitted!',
        `Payout request of ${currency} ${numAmount.toLocaleString()} via ${methodLabel} has been submitted for admin verification.`
      );

      await refreshUser();
      loadWithdrawals();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-5 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-[#0e0424] rounded-2xl flex items-center justify-center text-emerald-400">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cash Withdrawals
            </h1>
            <p className="text-xs text-purple-300">
              Direct payouts to Easypaisa, JazzCash, SadaPay, or Bank IBFT
            </p>
          </div>
        </div>

        <div className="bg-[#0e0424] border border-purple-500/25 p-3 sm:p-4 rounded-2xl flex sm:flex-col justify-between items-center sm:items-end">
          <span className="text-[10px] text-purple-300 font-bold uppercase block">
            Available Wallet Balance
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {currency} {availableBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_25px_rgba(168,85,247,0.12)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-pink-400" />
            Request Cash Withdrawal
          </h3>
          <span className="text-xs text-purple-300">
            Available: <strong className="text-emerald-400 font-mono font-bold">{currency} {availableBalance.toLocaleString()}</strong>
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-2xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
          {/* Method Selection (Branded Cards) */}
          <div>
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-2">
              Select Payout Channel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {withdrawalMethods.map((m) => {
                const isSelected = method === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`relative p-3 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-950/90 via-[#230948] to-[#2e0b57] border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.35)] ring-1 ring-pink-500/60'
                        : 'bg-[#12072b] border-purple-500/25 hover:border-purple-400/50 hover:bg-[#1a0b3b]'
                    }`}
                  >
                    {/* Left: Official Brand Logo */}
                    <PaymentBrandLogo method={m.brand} customLogoUrl={m.logoUrl} size="md" />

                    {/* Center: Method Name + Description */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                        {m.name}
                      </h4>
                      <p className="text-[10px] text-purple-300 truncate mt-0.5 leading-tight">
                        {m.description}
                      </p>
                    </div>

                    {/* Right: Radio / Selection Indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-pink-500 bg-pink-600 text-white'
                          : 'border-purple-500/40 bg-purple-950/50'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-purple-200">
                Withdrawal Amount
              </label>
              <span className="text-[11px] text-purple-300">
                Available: <span className="text-emerald-400 font-bold font-mono">{currency} {availableBalance.toLocaleString()}</span>
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                max={availableBalance}
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-purple-400/50 focus:border-pink-500 outline-none font-mono"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400 font-mono">
                {currency}
              </span>
            </div>

            {/* Quick amount convenience buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    amount === preset.toString()
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'bg-[#0d0422] text-purple-300 border border-purple-500/30 hover:border-pink-500 hover:text-white'
                  }`}
                >
                  {currency} {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toString())}
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/40 hover:text-white transition-all cursor-pointer"
              >
                MAX
              </button>
            </div>

            {numAmount > 0 && (
              <div className="flex items-center justify-between text-[11px] text-purple-300 px-1 pt-0.5">
                <span>
                  Processing Fee ({feePercent}%):{' '}
                  <span className="text-white font-mono">{currency} {feeAmount.toLocaleString()}</span>
                </span>
                <span>
                  Net Payout:{' '}
                  <span className="text-emerald-400 font-mono font-black">{currency} {netAmount.toLocaleString()}</span>
                </span>
              </div>
            )}
          </div>

          {/* DYNAMIC ACCOUNT FIELDS BASED ON SELECTED METHOD */}
          <div className="p-4 bg-[#0d0422] rounded-2xl border border-purple-500/30 space-y-3 text-xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 block">
              Recipient Account Information
            </span>

            {/* Account Title (Common to all methods) */}
            <div>
              <label className="text-purple-300 font-bold block mb-1">
                Account Name / Beneficiary Title <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Muhammad Usman"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                className="w-full bg-[#14082e] border border-purple-500/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none"
              />
            </div>

            {/* Bank Transfer specific: Bank Name selector */}
            {method === 'bank' && (
              <div>
                <label className="text-purple-300 font-bold block mb-1">
                  Bank Name <span className="text-pink-400">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#14082e] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-pink-500 outline-none"
                >
                  <option value="Bank Alfalah">Bank Alfalah</option>
                  <option value="Meezan Bank">Meezan Bank</option>
                  <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                  <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                  <option value="MCB Bank">MCB Bank</option>
                  <option value="Faysal Bank">Faysal Bank</option>
                  <option value="Allied Bank">Allied Bank</option>
                  <option value="Standard Chartered">Standard Chartered</option>
                  <option value="Bank of Punjab (BOP)">Bank of Punjab (BOP)</option>
                  <option value="Askari Bank">Askari Bank</option>
                  <option value="JS Bank">JS Bank</option>
                  <option value="NayaPay">NayaPay</option>
                </select>
              </div>
            )}

            {/* Account Number / Mobile Number */}
            <div>
              <label className="text-purple-300 font-bold block mb-1">
                {method === 'easypaisa' || method === 'jazzcash'
                  ? 'Mobile Account Number (03xx-xxxxxxx)'
                  : method === 'sadapay'
                  ? 'SadaPay Mobile / Account Number'
                  : method === 'bank'
                  ? 'Bank Account Number'
                  : 'TRC-20 Wallet Address'}{' '}
                <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                placeholder={
                  method === 'easypaisa' || method === 'jazzcash' || method === 'sadapay'
                    ? '03001234567'
                    : method === 'bank'
                    ? 'Account Number'
                    : 'TRC-20 Address...'
                }
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-[#14082e] border border-purple-500/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none font-mono"
              />
            </div>

            {/* IBAN (Optional / applicable for Bank & SadaPay) */}
            {(method === 'bank' || method === 'sadapay') && (
              <div>
                <label className="text-purple-300 font-bold block mb-1">
                  IBAN (Optional / where applicable)
                </label>
                <input
                  type="text"
                  placeholder={method === 'sadapay' ? 'PKxxSADA...' : 'PKxxALFH...'}
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                  className="w-full bg-[#14082e] border border-purple-500/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="p-2.5 rounded-xl bg-[#0d0422] border border-purple-500/20 flex flex-wrap items-center justify-between gap-2 text-[10px] text-purple-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
              Secure Payment Submission
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Verified by Admin
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Payment Status Tracking
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || availableBalance <= 0}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Request...</span>
              </>
            ) : (
              <span>Submit Withdrawal Request</span>
            )}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.12)]">
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Withdrawal Request History
          </h4>
          <span className="text-[11px] text-purple-300">
            Total Requests: <strong className="text-white">{withdrawals.length}</strong>
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-xs text-purple-300/70">
            No withdrawal requests logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#1a0a3d] text-purple-400 text-[10px] font-bold uppercase tracking-wider border-b border-purple-500/20">
                <tr>
                  <th className="py-3 px-4">Payout ID</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Account / Number</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/15 font-mono">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="py-3 px-4 text-purple-300 font-bold">{w.withdrawalId || w.id}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <PaymentBrandLogo method={w.method} size="sm" />
                      <span>{w.method}</span>
                    </td>
                    <td className="py-3 px-4 text-purple-300 max-w-xs truncate font-sans">
                      {w.accountTitle} <span className="font-mono text-[11px] text-purple-400">({w.accountNumber})</span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-purple-400 font-sans">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white font-mono">
                      {currency} {w.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          w.status === 'approved' || w.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : w.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-red-500/20 text-red-400 border-red-500/40'
                        }`}
                      >
                        {w.status === 'paid' ? 'Paid' : w.status === 'approved' ? 'Approved' : w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
