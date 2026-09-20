import React, { useState, useRef, useMemo } from 'react';
import { Package } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PaymentBrandLogo } from '../common/PaymentBrandLogo';
import { fireSubtlePurchaseConfetti } from '../../utils/confetti';
import {
  X,
  CheckCircle2,
  Copy,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Egg,
  Check,
  Upload,
  Trash2,
  Info,
  CheckCircle,
} from 'lucide-react';

interface PurchaseModalProps {
  pkg: Package;
  initialQuantity?: number;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  onNavigateLogin?: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  pkg,
  initialQuantity = 1,
  onClose,
  onSuccess,
  onNavigateLogin,
}) => {
  const { isAuthenticated, settings, refreshUser } = useAuth();
  const { showSuccess } = useToast();
  const [step, setStep] = useState<'quantity' | 'payment' | 'success'>('quantity');
  const [quantity, setQuantity] = useState<number>(Math.max(1, initialQuantity));
  const [selectedMethodId, setSelectedMethodId] = useState<'easypaisa' | 'jazzcash' | 'sadapay' | 'bankTransfer' | 'crypto'>('easypaisa');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofFileSize, setProofFileSize] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currency = settings?.currencySymbol || 'Rs.';
  const pricePerHen = pkg.pricePerHen || 500;
  const totalAmount = pricePerHen * quantity;
  const dailyEggs = (pkg.eggsPerDay || 1) * quantity;
  const cycleDays = pkg.durationDays || 120;
  const totalCycleEggs = dailyEggs * cycleDays;
  const estimatedEggValue = totalCycleEggs * (settings?.eggMonetaryValue || 15);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      if (onNavigateLogin) onNavigateLogin();
      return;
    }
    setStep('payment');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be under 5MB. Please choose a smaller image.');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPaymentProofUrl(base64);
      setProofFileName(file.name);
      const sizeKB = Math.round(file.size / 1024);
      setProofFileSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = () => {
    setPaymentProofUrl('');
    setProofFileName('');
    setProofFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Build available payment methods list dynamically from admin configuration
  const paymentMethodsList = useMemo(() => {
    const pm = settings?.paymentMethods;

    const list: Array<{
      id: 'easypaisa' | 'jazzcash' | 'sadapay' | 'bankTransfer' | 'crypto';
      name: string;
      brand: string;
      description: string;
      enabled: boolean;
      logoUrl?: string;
      accountTitle: string;
      accountNumber: string;
      bankName?: string;
      iban?: string;
      instructions: string[];
    }> = [];

    // 1. Easypaisa
    if (pm?.easypaisa?.enabled !== false) {
      list.push({
        id: 'easypaisa',
        name: 'Easypaisa',
        brand: 'easypaisa',
        description: 'Send payment using Easypaisa',
        enabled: true,
        logoUrl: pm?.easypaisa?.logoUrl,
        accountTitle: pm?.easypaisa?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.easypaisa?.accountNumber || '03008476546',
        instructions: pm?.easypaisa?.instructions
          ? [pm.easypaisa.instructions]
          : [
              'Open your Easypaisa Mobile App.',
              'Go to "Send Money" → "Easypaisa Mobile Account".',
              `Enter ${pm?.easypaisa?.accountNumber || '03008476546'} and verify Title: ${pm?.easypaisa?.accountTitle || 'Muhammad Murtaza'}.`,
              `Send the exact order amount: ${currency} ${totalAmount.toLocaleString()}.`,
              'Save the payment receipt screenshot and copy the 11-digit TID.',
            ],
      });
    }

    // 2. JazzCash
    if (pm?.jazzcash?.enabled !== false) {
      list.push({
        id: 'jazzcash',
        name: 'JazzCash',
        brand: 'jazzcash',
        description: 'Send payment using JazzCash',
        enabled: true,
        logoUrl: pm?.jazzcash?.logoUrl,
        accountTitle: pm?.jazzcash?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.jazzcash?.accountNumber || '03063300658',
        instructions: pm?.jazzcash?.instructions
          ? [pm.jazzcash.instructions]
          : [
              'Open your JazzCash Mobile App.',
              'Select "Send Money" → "Mobile Account".',
              `Enter ${pm?.jazzcash?.accountNumber || '03063300658'} and verify Title: ${pm?.jazzcash?.accountTitle || 'Muhammad Murtaza'}.`,
              `Transfer ${currency} ${totalAmount.toLocaleString()} to complete payment.`,
              'Take a screenshot of the transaction receipt and copy the Transaction ID.',
            ],
      });
    }

    // 3. Bank Transfer
    if (pm?.bankTransfer?.enabled !== false) {
      list.push({
        id: 'bankTransfer',
        name: 'Bank Transfer',
        brand: 'bankTransfer',
        description: 'Transfer directly to our bank account',
        enabled: true,
        logoUrl: pm?.bankTransfer?.logoUrl,
        bankName: pm?.bankTransfer?.bankName || 'UBL — United Bank Limited',
        accountTitle: pm?.bankTransfer?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.bankTransfer?.accountNumber || '23623995142254',
        iban: pm?.bankTransfer?.iban || 'PK72UNIL023623995142254',
        instructions: pm?.bankTransfer?.instructions
          ? [pm.bankTransfer.instructions]
          : [
              'Open your Banking App (UBL, HBL, Meezan, Alfalah, etc.).',
              `Select "Transfer" → "Other Banks / IBFT" → Select "${pm?.bankTransfer?.bankName || 'United Bank Limited (UBL)'}".`,
              `Enter Account Number: ${pm?.bankTransfer?.accountNumber || '23623995142254'} or IBAN.`,
              `Verify Title: ${pm?.bankTransfer?.accountTitle || 'Muhammad Murtaza'}.`,
              `Transfer ${currency} ${totalAmount.toLocaleString()} and download the transaction receipt.`,
            ],
      });
    }

    // 4. SadaPay
    if (pm?.sadapay?.enabled !== false) {
      list.push({
        id: 'sadapay',
        name: 'SadaPay',
        brand: 'sadapay',
        description: 'Send payment using SadaPay',
        enabled: true,
        logoUrl: pm?.sadapay?.logoUrl,
        accountTitle: pm?.sadapay?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.sadapay?.accountNumber || '03008476546',
        iban: pm?.sadapay?.iban || 'PK56SADA00000003008476546',
        instructions: pm?.sadapay?.instructions
          ? [pm.sadapay.instructions]
          : [
              'Open your SadaPay App.',
              'Tap "Send Money" → "SadaPay" or "Local Bank Transfer".',
              `Enter ${pm?.sadapay?.accountNumber || '03008476546'} and confirm Title: ${pm?.sadapay?.accountTitle || 'Muhammad Murtaza'}.`,
              `Transfer ${currency} ${totalAmount.toLocaleString()}.`,
              'Take a screenshot of the payment receipt and note your Reference Number.',
            ],
      });
    }

    // Crypto (optional if enabled in settings)
    if (pm?.crypto?.enabled === true) {
      list.push({
        id: 'crypto',
        name: 'USDT (TRC-20)',
        brand: 'crypto',
        description: 'Tether Stablecoin Transfer',
        enabled: true,
        logoUrl: pm?.crypto?.logoUrl,
        accountTitle: 'Al Jadeed Agri Treasury',
        accountNumber: pm?.crypto?.walletAddress || 'TYDzsYq7sWJgXbkmNqp4K5T8Wc4D91xyz',
        instructions: pm?.crypto?.instructions
          ? [pm.crypto.instructions]
          : [
              'Transfer USDT via Tron TRC-20 Network only.',
              `Calculated amount: ${(totalAmount / 280).toFixed(2)} USDT (Rate: 1 USDT = Rs. 280).`,
              'Copy and paste your Transaction Hash (TxHash / TxID) below.',
            ],
      });
    }

    return list;
  }, [settings?.paymentMethods, totalAmount, currency]);

  // Ensure selected method is one that is enabled
  const currentPayment = useMemo(() => {
    const found = paymentMethodsList.find((m) => m.id === selectedMethodId);
    if (found) return found;
    return paymentMethodsList[0] || null;
  }, [paymentMethodsList, selectedMethodId]);

  const handleFinalSubmitPayment = async () => {
    if (!paymentReference.trim()) {
      setErrorMessage('Please enter the Transaction ID / Reference (TRX / TID) from your payment receipt.');
      return;
    }

    if (!paymentProofUrl) {
      setErrorMessage('Please attach your payment screenshot or proof receipt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let methodLabel = 'Easypaisa';
    if (currentPayment?.id === 'bankTransfer') methodLabel = 'Bank Transfer';
    else if (currentPayment?.id === 'jazzcash') methodLabel = 'JazzCash';
    else if (currentPayment?.id === 'sadapay') methodLabel = 'SadaPay';
    else if (currentPayment?.id === 'crypto') methodLabel = 'Crypto USDT';

    try {
      const res = await api.createOrder({
        packageId: pkg.id,
        quantity,
        paymentMethod: methodLabel,
        paymentReference: paymentReference.trim(),
        senderAccount: senderAccount.trim() || undefined,
        submittedAmount: totalAmount,
        paymentProofUrl: paymentProofUrl,
      });

      setCreatedOrder(res.order);
      await refreshUser();
      setStep('success');
      onSuccess(res.order.id);

      // Trigger celebratory confetti and success toast notification
      fireSubtlePurchaseConfetti();
      showSuccess(
        'Purchase Order Submitted!',
        `Your payment proof for ${quantity} ${quantity === 1 ? 'Hen' : 'Hens'} (${currency} ${totalAmount.toLocaleString()}) has been submitted for admin verification.`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment submission failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in text-white">
      <div className="bg-[#14082e] rounded-3xl max-w-xl w-full border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.35)] overflow-hidden my-4">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#1c0a3d] to-[#14062c] border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-[#0e0424] rounded-2xl flex items-center justify-center">
                <Egg className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{pkg.name}</h3>
              <p className="text-xs text-purple-300">
                {currency} {pricePerHen.toLocaleString()} / Hen • 120-Day Production Cycle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-900/40 text-purple-300 hover:text-white flex items-center justify-center hover:bg-purple-900/70 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-[#0d0422] border-b border-purple-500/15 flex items-center justify-between text-xs font-bold text-purple-300">
          <div className={`flex items-center gap-1.5 ${step === 'quantity' ? 'text-pink-400' : 'text-purple-400'}`}>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'quantity' ? 'bg-pink-600 text-white font-black' : 'bg-purple-950 text-purple-400'
              }`}
            >
              1
            </span>
            <span>Quantity</span>
          </div>
          <div className="w-8 sm:w-12 h-0.5 bg-purple-900/60" />
          <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-pink-400' : 'text-purple-400'}`}>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'payment' ? 'bg-pink-600 text-white font-black' : 'bg-purple-950 text-purple-400'
              }`}
            >
              2
            </span>
            <span>Payment & Proof</span>
          </div>
          <div className="w-8 sm:w-12 h-0.5 bg-purple-900/60" />
          <div className={`flex items-center gap-1.5 ${step === 'success' ? 'text-amber-400' : 'text-purple-400'}`}>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'success' ? 'bg-amber-600 text-white font-black' : 'bg-purple-950 text-purple-400'
              }`}
            >
              3
            </span>
            <span>Under Review</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[78vh] overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: QUANTITY SELECTION ================= */}
          {step === 'quantity' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1b0a3d] rounded-2xl border border-purple-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-300 font-bold">Step 1: Select Number of Hens</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-xl bg-purple-900/70 border border-purple-500/40 text-white font-bold hover:bg-purple-800 transition active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="w-16 bg-[#0d0422] border border-purple-500/40 rounded-xl py-1.5 text-center font-black text-white text-base outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(100, quantity + 1))}
                      className="w-9 h-9 rounded-xl bg-purple-900/70 border border-purple-500/40 text-white font-bold hover:bg-purple-800 transition active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[1, 5, 10, 20].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        quantity === q
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                          : 'bg-[#0d0422] text-purple-300 hover:text-white border border-purple-500/20'
                      }`}
                    >
                      {q} {q === 1 ? 'Hen' : 'Hens'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary & Production Projections */}
              <div className="p-4 bg-[#0d0422] rounded-2xl border border-purple-500/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="font-extrabold text-white uppercase text-[11px] tracking-wide">Order Summary</span>
                  <span className="text-purple-300 text-[11px]">120-Day Production Cycle</span>
                </div>

                <div className="flex justify-between text-purple-300">
                  <span>Price per Hen:</span>
                  <span className="text-white font-bold">
                    {currency} {pricePerHen.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-purple-300">
                  <span>Daily Egg Harvest:</span>
                  <span className="text-amber-400 font-bold">+{dailyEggs} Eggs / 24 hours</span>
                </div>

                <div className="flex justify-between text-purple-300">
                  <span>Total Eggs (120 Days):</span>
                  <span className="text-emerald-400 font-bold">{totalCycleEggs.toLocaleString()} Eggs</span>
                </div>

                <div className="flex justify-between text-purple-300">
                  <span>Estimated Total Egg Value (@ {currency}15):</span>
                  <span className="text-emerald-300 font-mono font-bold">
                    {currency} {estimatedEggValue.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-purple-500/20 flex justify-between items-center text-sm font-black text-white">
                  <span>Total Payable:</span>
                  <span className="text-pink-400 text-lg font-mono">
                    {currency} {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 py-1 text-[10px] text-purple-300 text-center">
                <div className="flex items-center justify-center gap-1 bg-[#120729] p-2 rounded-xl border border-purple-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                  <span>Secure Submission</span>
                </div>
                <div className="flex items-center justify-center gap-1 bg-[#120729] p-2 rounded-xl border border-purple-500/20">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified by Admin</span>
                </div>
                <div className="flex items-center justify-center gap-1 bg-[#120729] p-2 rounded-xl border border-purple-500/20">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Status Tracking</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 font-bold text-sm text-white rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.35)] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Proceed to Payment ({currency} {totalAmount.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= STEP 2: PAYMENT METHOD & PROOF SUBMISSION ================= */}
          {step === 'payment' && (
            <div className="space-y-4">
              {/* Step 2: Payment Method Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-purple-200">
                    Step 2: Select Payment Method
                  </label>
                  <span className="text-[11px] text-pink-300 font-bold">
                    Pay: {currency} {totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Selectable Payment Method Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {paymentMethodsList.map((m) => {
                    const isSelected = selectedMethodId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethodId(m.id)}
                        className={`relative p-3 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-950/90 via-[#230948] to-[#2e0b57] border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.35)] ring-1 ring-pink-500/60'
                            : 'bg-[#12072b] border-purple-500/25 hover:border-purple-400/50 hover:bg-[#1a0b3b]'
                        }`}
                      >
                        {/* Left: Official Brand Logo */}
                        <PaymentBrandLogo method={m.brand} customLogoUrl={m.logoUrl} size="md" />

                        {/* Center: Method Name + Short Description */}
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

              {/* Step 3: View Payment Details */}
              {currentPayment && (
                <div className="p-4 bg-[#0d0422] rounded-2xl border border-purple-500/35 space-y-2.5 text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                    <span className="text-purple-300 font-bold uppercase text-[10px] tracking-wider">
                      Step 3: Send Order Amount
                    </span>
                    <span className="text-pink-400 font-black text-base font-mono">
                      {currency} {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {currentPayment.bankName && (
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300">Bank Name:</span>
                      <span className="font-bold text-white text-right">{currentPayment.bankName}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Account Title:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{currentPayment.accountTitle}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentPayment.accountTitle, 'title')}
                        className="p-1 text-purple-400 hover:text-white cursor-pointer"
                        title="Copy Title"
                      >
                        {copiedField === 'title' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">
                      {currentPayment.id === 'bankTransfer' ? 'Account Number:' : 'Mobile / Account Number:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-amber-300 text-sm">
                        {currentPayment.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentPayment.accountNumber, 'num')}
                        className="p-1 text-purple-400 hover:text-white cursor-pointer"
                        title="Copy Number"
                      >
                        {copiedField === 'num' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {currentPayment.iban && (
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300">IBAN:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-purple-200">
                          {currentPayment.iban}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentPayment.iban!, 'iban')}
                          className="p-1 text-purple-400 hover:text-white cursor-pointer"
                          title="Copy IBAN"
                        >
                          {copiedField === 'iban' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Instructions */}
                  <div className="mt-2 pt-2 border-t border-purple-500/15">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5 mb-1 text-[11px]">
                      <Info className="w-3.5 h-3.5 text-pink-400" />
                      Payment Instructions:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-purple-200/90 text-[11px] pl-1 leading-relaxed">
                      {currentPayment.instructions.map((stepText, idx) => (
                        <li key={idx}>{stepText}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 4: Enter Transaction / Reference ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>
                    Step 4: Enter Transaction / Reference ID <span className="text-pink-400">*</span>
                  </span>
                  <span className="text-[10px] text-purple-300 font-normal">Found on SMS or payment receipt</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TID, TRX ID, or Reference Number"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none font-mono tracking-wider"
                />
              </div>

              {/* Optional: Sender Account / Mobile */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-purple-300 block">
                  Sender Mobile / Account Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567 or Your Name"
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  className="w-full bg-[#0d0422] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none"
                />
              </div>

              {/* Step 5: Upload Payment Screenshot */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>
                    Step 5: Upload Payment Screenshot <span className="text-pink-400">*</span>
                  </span>
                  <span className="text-[10px] text-purple-300 font-normal">PNG, JPG, or WEBP (Max 5MB)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-screenshot-input"
                />

                {!paymentProofUrl ? (
                  <label
                    htmlFor="payment-screenshot-input"
                    className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-purple-500/40 rounded-2xl bg-[#0d0422] hover:bg-[#150730] hover:border-pink-500/60 cursor-pointer transition-all group text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-purple-300 group-hover:text-pink-400 flex items-center justify-center mb-2 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">Click or Drag to Upload Payment Screenshot</span>
                    <span className="text-[10px] text-purple-300/70 mt-0.5">
                      Upload clear receipt showing transaction ID, date, and amount
                    </span>
                  </label>
                ) : (
                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-950 border border-purple-500/40 shrink-0">
                        <img
                          src={paymentProofUrl}
                          alt="Payment Proof Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{proofFileName || 'Payment Screenshot'}</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ready for verification ({proofFileSize})</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="p-2 text-purple-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-[10px] text-purple-300">
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
                  Status Tracking
                </span>
              </div>

              {/* Step 6: Submit Payment Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('quantity')}
                  className="py-3 px-4 rounded-xl bg-[#1b0a3d] border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmitPayment}
                  disabled={isSubmitting || isUploading}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Payment Proof...</span>
                    </>
                  ) : (
                    <span>Step 6: Submit Payment for Verification</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PAYMENT UNDER REVIEW ================= */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse">
                <Clock className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mb-2">
                  Payment Under Review
                </span>
                <h4 className="text-xl font-black text-white">Payment Proof Submitted</h4>
                <p className="text-xs text-purple-200 mt-1.5 max-w-md mx-auto leading-relaxed">
                  Your payment has been submitted and is waiting for admin verification.
                </p>
              </div>

              {/* Order Reference Card */}
              <div className="p-4 bg-[#0d0422] rounded-2xl border border-purple-500/30 text-xs space-y-2 text-left">
                <div className="flex justify-between items-center text-purple-300 pb-2 border-b border-purple-500/15">
                  <span>Order Reference:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {createdOrder?.orderNumber || createdOrder?.id}
                  </span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Hens Ordered:</span>
                  <span className="font-bold text-white">
                    {quantity} {quantity === 1 ? 'Hen' : 'Hens'} (@ {currency} {pricePerHen})
                  </span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Amount Deposited:</span>
                  <span className="font-mono font-bold text-pink-400">
                    {currency} {totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Payment Channel:</span>
                  <span className="font-bold text-white">{currentPayment?.name || selectedMethodId}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Transaction ID:</span>
                  <span className="font-mono font-bold text-amber-300">{paymentReference}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Flock Activation Status:</span>
                  <span className="font-bold text-amber-400">Awaiting Admin Verification</span>
                </div>
              </div>

              {/* Explicit requirement note: Hens must NOT be assigned immediately */}
              <div className="p-3 bg-purple-950/50 rounded-xl border border-purple-500/20 text-[11px] text-purple-300 text-left flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>
                  Hens are <strong className="text-white">not assigned immediately</strong>. Once your payment receipt is
                  verified by the admin, your hen cycle will be activated and your daily egg production will start.
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Done • View My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
