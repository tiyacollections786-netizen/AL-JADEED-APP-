import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Package } from '../../types';
import { PaymentBrandLogo } from '../../components/common/PaymentBrandLogo';
import { fireSubtlePurchaseConfetti } from '../../utils/confetti';
import brownHenImg from '../../assets/images/brown_hen_3d_1789737249235.jpg';
import {
  ArrowLeft,
  ArrowRight,
  Egg,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Upload,
  Trash2,
  Clock,
  Coins,
  Check,
  AlertCircle,
  HelpCircle,
  Users,
} from 'lucide-react';

interface HenDetailsPageProps {
  onNavigate: (view: string, params?: any) => void;
  initialQuantity?: number;
  initialPackage?: Package;
}

export const HenDetailsPage: React.FC<HenDetailsPageProps> = ({
  onNavigate,
  initialQuantity = 1,
  initialPackage,
}) => {
  const { isAuthenticated, settings, user, refreshUser } = useAuth();
  const { showSuccess } = useToast();

  // Navigation flow state: 'details' | 'payment' | 'review' | 'success'
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'review' | 'success'>('details');

  // Business Parameters from Settings / Package
  const henPrice = initialPackage?.pricePerHen || settings?.henPrice || 500;
  const henBreed = initialPackage?.breed || 'Brown Commercial Layer';
  const henName = initialPackage?.name || 'Brown Hen';
  const eggsPerDay = initialPackage?.eggsPerDay || 1;
  const cycleDays = initialPackage?.durationDays || 120;
  const totalEggsPerHen = eggsPerDay * cycleDays;

  // Quantity selection
  const [quantity, setQuantity] = useState<number>(Math.max(1, initialQuantity));

  // Payment State
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
  const totalAmount = henPrice * quantity;
  const totalEggsYield = totalEggsPerHen * quantity;
  const dailyTotalEggs = eggsPerDay * quantity;

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Quantity helpers
  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity(prev => Math.min(100, prev + 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      setQuantity(Math.max(1, Math.min(100, val)));
    }
  };

  // Handle flow transition
  const handleContinueToPayment = () => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToReview = () => {
    setCurrentStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('details');
    } else {
      onNavigate('packages');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Payment proof file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be under 5MB. Please select a smaller screenshot.');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = event => {
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

  // Available payment methods from platform settings
  const paymentMethodsList = useMemo(() => {
    const pm = settings?.paymentMethods;
    const list = [
      {
        id: 'easypaisa' as const,
        name: 'Easypaisa',
        brand: 'easypaisa',
        tagline: 'Instant Mobile Account Transfer',
        badge: 'Recommended',
        accountTitle: pm?.easypaisa?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.easypaisa?.accountNumber || '03008476546',
        instructions:
          pm?.easypaisa?.instructions ||
          'Open Easypaisa app → Send Money → To Easypaisa Mobile Account. Enter Mobile Number and exact amount.',
        logoUrl: pm?.easypaisa?.logoUrl,
        enabled: pm?.easypaisa?.enabled !== false,
      },
      {
        id: 'jazzcash' as const,
        name: 'JazzCash',
        brand: 'jazzcash',
        tagline: 'Instant JazzCash Wallet Transfer',
        badge: 'Popular',
        accountTitle: pm?.jazzcash?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.jazzcash?.accountNumber || '03063300658',
        instructions:
          pm?.jazzcash?.instructions ||
          'Open JazzCash app or dial *786# → Money Transfer → To Mobile Account. Enter Mobile Number.',
        logoUrl: pm?.jazzcash?.logoUrl,
        enabled: pm?.jazzcash?.enabled !== false,
      },
      {
        id: 'sadapay' as const,
        name: 'SadaPay',
        brand: 'sadapay',
        tagline: 'Instant SadaPay Account & IBAN Transfer',
        badge: 'Fast & Zero Fee',
        accountTitle: pm?.sadapay?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.sadapay?.accountNumber || '03008476546',
        iban: pm?.sadapay?.iban || 'PK56SADA00000003008476546',
        instructions:
          pm?.sadapay?.instructions ||
          'Open your SadaPay or banking app → Send Money to SadaPay mobile number or IBAN.',
        logoUrl: pm?.sadapay?.logoUrl,
        enabled: pm?.sadapay?.enabled !== false,
      },
      {
        id: 'bankTransfer' as const,
        name: 'Bank Transfer (IBFT)',
        brand: 'bankTransfer',
        tagline: '1-Link Inter-Bank Funds Transfer',
        badge: 'Direct Bank',
        bankName: pm?.bankTransfer?.bankName || 'United Bank Limited (UBL)',
        accountTitle: pm?.bankTransfer?.accountTitle || 'Muhammad Murtaza',
        accountNumber: pm?.bankTransfer?.accountNumber || '23623995142254',
        iban: pm?.bankTransfer?.iban || 'PK72UNIL023623995142254',
        instructions:
          pm?.bankTransfer?.instructions ||
          'Log in to any Pakistani mobile banking app → Select IBFT / Send Money → Choose UBL → Enter Account / IBAN.',
        logoUrl: pm?.bankTransfer?.logoUrl,
        enabled: pm?.bankTransfer?.enabled !== false,
      },
    ];

    if (pm?.crypto?.enabled === true) {
      list.push({
        id: 'crypto' as const,
        name: 'USDT (TRC-20)',
        brand: 'crypto',
        tagline: 'Tether TRC-20 Blockchain Transfer',
        badge: 'Crypto Global',
        accountTitle: 'TRON TRC-20',
        accountNumber: pm?.crypto?.walletAddress || 'TYDzsYq7sWJgXbkmNqp4K5T8Wc4D91xyz',
        instructions:
          pm?.crypto?.instructions ||
          'Send exact USDT via TRC-20 network to the wallet address below.',
        logoUrl: pm?.crypto?.logoUrl,
        enabled: true,
      } as any);
    }

    return list.filter(m => m.enabled);
  }, [settings?.paymentMethods]);

  const activeMethod =
    paymentMethodsList.find(m => m.id === selectedMethodId) || paymentMethodsList[0] || {
      id: 'easypaisa',
      name: 'Easypaisa',
      brand: 'easypaisa',
      tagline: 'Instant Mobile Account Transfer',
      accountTitle: 'Muhammad Murtaza',
      accountNumber: '03008476546',
      instructions: 'Transfer to Easypaisa account.',
      enabled: true,
    };

  // Submit payment for verification
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!paymentReference.trim()) {
      setErrorMessage('Please enter the Transaction ID (TID) or Reference Number.');
      return;
    }

    if (!paymentProofUrl) {
      setErrorMessage('Please upload a screenshot or photo of your payment receipt.');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await api.createOrder({
        packageId: initialPackage?.id || 'ajme-layer-primary',
        quantity,
        paymentMethod: activeMethod.name,
        paymentReference: paymentReference.trim(),
        paymentProofUrl: paymentProofUrl,
        senderAccount: senderAccount.trim() || undefined,
      });

      setCreatedOrder(order);
      setCurrentStep('success');
      if (refreshUser) {
        refreshUser();
      }

      // Trigger celebratory confetti and success toast notification
      fireSubtlePurchaseConfetti();
      showSuccess(
        'Purchase Order Submitted!',
        `Your payment proof for ${quantity} ${quantity === 1 ? 'Hen' : 'Hens'} (${currency} ${totalAmount.toLocaleString()}) has been submitted for admin verification.`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 text-white pb-28 lg:pb-12">
      {/* ====================================================
          2. PAGE HEADER WITH BACK BUTTON & TITLE
          ==================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-purple-500/20 pb-3.5">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 hover:border-purple-400 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-pink-400" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
            {currentStep === 'details' && 'Hen Details'}
            {currentStep === 'payment' && 'Select Payment Method'}
            {currentStep === 'review' && 'Order Review'}
            {currentStep === 'success' && 'Payment Under Review'}
          </h1>
          <p className="text-[10px] text-purple-300">
            {currentStep === 'details' && 'Commercial Digital Flock Specification'}
            {currentStep === 'payment' && 'Step 2 of 3: Verification Channel'}
            {currentStep === 'review' && 'Step 3 of 3: Proof Submission'}
            {currentStep === 'success' && 'Awaiting Admin Verification'}
          </p>
        </div>

        {/* Small Step Indicator Badge */}
        <div className="text-right">
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300">
            {currentStep === 'details' && '1 / 3'}
            {currentStep === 'payment' && '2 / 3'}
            {currentStep === 'review' && '3 / 3'}
            {currentStep === 'success' && 'Done'}
          </span>
        </div>
      </div>

      {/* ====================================================
          STEP 1: DEDICATED HEN DETAILS VIEW
          ==================================================== */}
      {currentStep === 'details' && (
        <div className="space-y-6">
          {/* Main Layout: Balanced 2-Column on Desktop, Stacked on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT / TOP: 3. MAIN HEN HERO CARD (Lg: cols 5) */}
            <div className="lg:col-span-5">
              <div
                id="hen-hero-card"
                className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#2a0d58] via-[#16062f] to-[#3a0c56] border border-purple-500/40 shadow-[0_12px_40px_rgba(168,85,247,0.25),inset_0_1px_2px_rgba(255,255,255,0.15)] flex flex-col items-center text-center group"
              >
                {/* Soft ambient glows (purple & pink highlights) */}
                <div className="absolute -top-12 -left-12 w-44 h-44 bg-purple-600/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
                <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-pink-600/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                {/* Status Badge */}
                <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider text-pink-300 mb-4 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Healthy Commercial Layer</span>
                </div>

                {/* Large 3D Hen Visual with Floating Animation */}
                <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 my-2 flex items-center justify-center">
                  {/* Subtle golden & purple rim glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-amber-500/30 to-pink-500/40 blur-2xl scale-95 animate-pulse-glow" />
                  
                  {/* 3D Hen with gentle float animation */}
                  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-purple-400/40 animate-float-slow bg-[#130728]/80">
                    <img
                      src={brownHenImg}
                      alt="Brown Hen 3D Model"
                      className="w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {/* Vignette depth overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16062f]/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Hen Title & Price */}
                <div className="relative z-10 mt-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                    {henName}
                  </h2>
                  <p className="text-xs text-purple-300/90 mt-0.5 font-medium">
                    {henBreed}
                  </p>

                  <div className="mt-3 inline-block bg-[#0e0424]/90 border border-purple-500/30 rounded-2xl px-5 py-2">
                    <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                      {currency} {henPrice.toLocaleString()}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                      Per Hen
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT / BOTTOM: DETAILS, QUANTITY & CTA (Lg: cols 7) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* 4. SIMPLE HEN INFORMATION (4 Clean Compact Cards) */}
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-purple-300 mb-2 px-1">
                  Production Specifications
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3 text-center shadow-md">
                    <div className="w-7 h-7 mx-auto rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1.5">
                      <Egg className="w-4 h-4 fill-amber-400" />
                    </div>
                    <span className="text-[10px] text-purple-300 font-bold block uppercase">
                      Daily Egg
                    </span>
                    <span className="text-sm font-black text-white">
                      1 Egg
                    </span>
                  </div>

                  <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3 text-center shadow-md">
                    <div className="w-7 h-7 mx-auto rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-purple-300 font-bold block uppercase">
                      Total Production
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      120 Eggs
                    </span>
                  </div>

                  <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3 text-center shadow-md">
                    <div className="w-7 h-7 mx-auto rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-1.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-purple-300 font-bold block uppercase">
                      Production Period
                    </span>
                    <span className="text-sm font-black text-white">
                      120 Days
                    </span>
                  </div>

                  <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3 text-center shadow-md">
                    <div className="w-7 h-7 mx-auto rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-1.5">
                      <Coins className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-purple-300 font-bold block uppercase">
                      Hen Price
                    </span>
                    <span className="text-sm font-black text-amber-300">
                      {currency} {henPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. SIMPLE EXPLANATION */}
              <div className="bg-[#14082e]/90 border border-purple-500/30 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Egg className="w-4 h-4 fill-amber-400" />
                </div>
                <p className="text-xs sm:text-sm text-purple-200 leading-relaxed font-medium">
                  Each active hen produces 1 egg every 24 hours for up to 120 days.
                </p>
              </div>

              {/* 6. QUANTITY SELECTOR */}
              <div className="bg-gradient-to-br from-[#180838] to-[#12052b] border border-purple-500/35 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    How Many Hens?
                  </h3>
                  <span className="text-[11px] text-purple-300 font-medium">
                    Min 1 • Max 100
                  </span>
                </div>

                {/* Stepper with Minus, Input, Plus */}
                <div className="flex items-center justify-center gap-4 py-1">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-2xl bg-[#0e0424] border border-purple-500/40 hover:border-pink-500 text-white font-black text-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-md"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-24 sm:w-28 h-12 bg-[#0d0422] border-2 border-purple-500/50 focus:border-pink-500 rounded-2xl text-center text-xl font-black text-white font-mono outline-none shadow-inner"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= 100}
                    className="w-12 h-12 rounded-2xl bg-[#0e0424] border border-purple-500/40 hover:border-pink-500 text-white font-black text-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-md"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Quick Selection Presets */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[1, 2, 5, 10, 20].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        quantity === q
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)] border border-pink-400/50 scale-102'
                          : 'bg-[#0f0525] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-500/50'
                      }`}
                    >
                      {q} {q === 1 ? 'Hen' : 'Hens'}
                    </button>
                  ))}
                </div>

                {/* Live Dynamic Calculation Box */}
                <div className="bg-[#0b031d] border border-purple-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-300">Live Calculation:</span>
                    <span className="font-mono font-bold text-purple-200">
                      {quantity} {quantity === 1 ? 'Hen' : 'Hens'} × {currency} {henPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-purple-500/20 pt-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Total Payable Amount:
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                      {currency} {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-purple-400 pt-1">
                    <span>Expected Production:</span>
                    <span className="font-bold text-emerald-400">
                      +{dailyTotalEggs} Eggs/day • {totalEggsYield.toLocaleString()} Eggs over 120 days
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. REFERRAL INFORMATION (Compact Card) */}
              <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Referral Benefit
                    </span>
                    <span className="text-[11px] text-purple-300">
                      Earn bonus eggs when direct & team invites purchase hens
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-[#0e0424] border border-purple-500/30 px-2.5 py-1 rounded-xl text-center">
                    <span className="text-[9px] text-purple-400 font-bold block uppercase">L1</span>
                    <span className="text-xs font-black text-amber-300">2 Eggs</span>
                  </div>
                  <div className="bg-[#0e0424] border border-purple-500/30 px-2.5 py-1 rounded-xl text-center">
                    <span className="text-[9px] text-purple-400 font-bold block uppercase">L2</span>
                    <span className="text-xs font-black text-amber-300">1 Egg</span>
                  </div>
                </div>
              </div>

              {/* 8. PRIMARY CTA BUTTON */}
              <button
                type="button"
                id="btn-continue-to-payment"
                onClick={handleContinueToPayment}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base tracking-wide shadow-[0_0_28px_rgba(236,72,153,0.45)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-[11px] text-purple-400">
                Payment verification is processed by admin via Easypaisa, JazzCash, Bank Transfer, or SadaPay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          STEP 2: PAYMENT METHOD SELECTION & ACCOUNT DETAILS
          ==================================================== */}
      {currentStep === 'payment' && (
        <div className="space-y-6">
          {/* 9. ORDER SUMMARY CARD */}
          <div className="bg-gradient-to-br from-[#1e0a44] to-[#12052a] border border-purple-500/40 rounded-3xl p-5 shadow-lg space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 block">
              Order Summary
            </span>

            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
              <div>
                <h3 className="text-base font-black text-white">{henName}</h3>
                <span className="text-xs text-purple-300">Commercial Digital Layer</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-purple-300 block">Quantity</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  {quantity} {quantity === 1 ? 'Hen' : 'Hens'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-purple-300">Unit Price:</span>
              <span className="font-mono text-purple-200">
                {currency} {henPrice.toLocaleString()} × {quantity}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-purple-500/20 font-bold">
              <span className="text-white">Total Amount:</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                {currency} {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Select Payment Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Select Official Payment Channel
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethodsList.map(method => {
                const isSelected = selectedMethodId === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#260e54] to-[#170836] border-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-[1.01]'
                        : 'bg-[#14082e] border-purple-500/25 hover:border-purple-500/50 hover:bg-[#1a0b3b]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PaymentBrandLogo method={method.brand} logoUrl={method.logoUrl} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{method.name}</span>
                          {method.badge && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-purple-300/80 block mt-0.5">
                          {method.tagline}
                        </span>
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-pink-400 bg-pink-500 text-white shadow-sm'
                          : 'border-purple-400/40 bg-[#0e0424]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Details Box for Selected Method */}
          <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <PaymentBrandLogo method={activeMethod.brand} logoUrl={activeMethod.logoUrl} size="sm" />
                <div>
                  <h4 className="text-sm font-black text-white">{activeMethod.name} Details</h4>
                  <p className="text-[11px] text-purple-300">
                    Send exact payment of {currency} {totalAmount.toLocaleString()} to this account
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {activeMethod.bankName && (
                <div className="bg-[#0e0424] border border-purple-500/25 rounded-2xl p-3">
                  <span className="text-[10px] text-purple-400 font-bold block uppercase">
                    Bank Name
                  </span>
                  <span className="text-sm font-bold text-white">{activeMethod.bankName}</span>
                </div>
              )}

              <div className="bg-[#0e0424] border border-purple-500/25 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-purple-400 font-bold block uppercase">
                    Account Title / Name
                  </span>
                  <span className="text-sm font-bold text-white">{activeMethod.accountTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeMethod.accountTitle, 'title')}
                  className="p-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-300 hover:text-white transition-all cursor-pointer"
                >
                  {copiedField === 'title' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="bg-[#0e0424] border border-purple-500/25 rounded-2xl p-3 flex items-center justify-between sm:col-span-2">
                <div>
                  <span className="text-[10px] text-purple-400 font-bold block uppercase">
                    Account / Mobile Number
                  </span>
                  <span className="text-base font-black text-amber-300 font-mono tracking-wide">
                    {activeMethod.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeMethod.accountNumber, 'number')}
                  className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800 border border-purple-500/30 text-xs font-bold text-purple-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'number' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {activeMethod.iban && (
                <div className="bg-[#0e0424] border border-purple-500/25 rounded-2xl p-3 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold block uppercase">
                      IBAN
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-white break-all">
                      {activeMethod.iban}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeMethod.iban || '', 'iban')}
                    className="p-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-300 hover:text-white transition-all cursor-pointer"
                  >
                    {copiedField === 'iban' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#0d0422] border border-purple-500/20 rounded-2xl p-3.5 text-xs text-purple-200">
              <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">
                Payment Instructions:
              </span>
              <p>{activeMethod.instructions}</p>
            </div>
          </div>

          {/* Step 2 CTA */}
          <button
            type="button"
            onClick={handleProceedToReview}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <span>Proceed to Order Review & Verification</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ====================================================
          STEP 3: 10. ORDER REVIEW & PAYMENT SUBMISSION
          ==================================================== */}
      {currentStep === 'review' && (
        <form onSubmit={handleSubmitPayment} className="space-y-6">
          {/* Order Review Card */}
          <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Order Review
              </h3>
              <span className="text-xs font-bold text-pink-400">Ready to Submit</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0e0424] border border-purple-500/20 rounded-2xl p-3">
                <span className="text-[10px] text-purple-400 font-bold block uppercase">Hen</span>
                <span className="text-sm font-bold text-white">{henName}</span>
              </div>

              <div className="bg-[#0e0424] border border-purple-500/20 rounded-2xl p-3">
                <span className="text-[10px] text-purple-400 font-bold block uppercase">
                  Quantity
                </span>
                <span className="text-sm font-bold text-white">
                  {quantity} {quantity === 1 ? 'Hen' : 'Hens'}
                </span>
              </div>

              <div className="bg-[#0e0424] border border-purple-500/20 rounded-2xl p-3">
                <span className="text-[10px] text-purple-400 font-bold block uppercase">
                  Price Per Hen
                </span>
                <span className="text-sm font-bold text-amber-300">
                  {currency} {henPrice.toLocaleString()}
                </span>
              </div>

              <div className="bg-[#0e0424] border border-purple-500/20 rounded-2xl p-3">
                <span className="text-[10px] text-purple-400 font-bold block uppercase">
                  Payment Method
                </span>
                <span className="text-sm font-bold text-pink-300">{activeMethod.name}</span>
              </div>

              <div className="bg-[#0b031d] border border-purple-500/40 rounded-2xl p-3.5 col-span-2 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Total Payable
                </span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  {currency} {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Proof Upload & Reference ID Form */}
          <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-purple-500/20 pb-3">
              Payment Verification Details
            </h3>

            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-300 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Transaction / Reference ID */}
              <div>
                <label className="text-purple-300 font-bold block mb-1">
                  Transaction / Reference ID (TID) <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 19284716492 or UBL102948174"
                  value={paymentReference}
                  onChange={e => setPaymentReference(e.target.value)}
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-pink-500 text-sm"
                />
                <span className="text-[10px] text-purple-400 mt-1 block">
                  Found in your banking SMS, Easypaisa/JazzCash confirmation, or receipt.
                </span>
              </div>

              {/* Sender Mobile / Account Number (Optional) */}
              <div>
                <label className="text-purple-300 font-bold block mb-1">
                  Your Sending Account / Mobile Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0300 1234567"
                  value={senderAccount}
                  onChange={e => setSenderAccount(e.target.value)}
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none focus:border-pink-500 text-sm"
                />
              </div>

              {/* Upload Payment Screenshot */}
              <div>
                <label className="text-purple-300 font-bold block mb-1">
                  Upload Payment Screenshot / Receipt <span className="text-pink-400">*</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!paymentProofUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-500/40 hover:border-pink-500/60 rounded-2xl p-5 text-center cursor-pointer transition-all bg-[#0e0424]/60 hover:bg-[#12052b]"
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-pink-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white block">
                      {isUploading ? 'Processing receipt...' : 'Click to Upload Payment Proof'}
                    </span>
                    <span className="text-[10px] text-purple-300 block mt-0.5">
                      PNG, JPG, or WEBP (Max 5MB)
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#0e0424] border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={paymentProofUrl}
                        alt="Proof preview"
                        className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {proofFileName || 'Receipt Screenshot'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Ready for submission • {proofFileSize}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base tracking-wide shadow-[0_0_28px_rgba(236,72,153,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting for Admin Verification...</span>
            ) : (
              <>
                <span>Submit Payment for Verification</span>
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* ====================================================
          STEP 4: 11. PAYMENT UNDER REVIEW / SUBMITTED STATUS
          ==================================================== */}
      {currentStep === 'success' && (
        <div className="bg-gradient-to-br from-[#1c0840] via-[#12052b] to-[#25094f] border border-purple-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Payment Under Review
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              Payment Under Review
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-md mx-auto leading-relaxed pt-1">
              Your payment has been submitted and is waiting for admin verification.
            </p>
          </div>

          {/* Important business notice as requested */}
          <div className="bg-[#0c031c] border border-purple-500/30 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 text-purple-300">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hen Activation & Earning Cycle</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Hens become active only after admin verifies the payment proof and assigns your hens.
              At the exact moment of assignment, your first egg will be generated immediately and the 24-hour daily cycle will begin!
            </p>
          </div>

          {createdOrder && (
            <div className="bg-[#0e0424] border border-purple-500/20 rounded-2xl p-3 max-w-sm mx-auto text-xs flex items-center justify-between font-mono">
              <span className="text-purple-400">Order ID:</span>
              <span className="text-white font-bold">#{createdOrder.id?.slice(-8).toUpperCase() || 'AJME'}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('customer-orders')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              View My Orders
            </button>
            <button
              type="button"
              onClick={() => onNavigate('customer-dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900 text-purple-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
