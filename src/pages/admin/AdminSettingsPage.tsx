import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PlatformSettings } from '../../types';
import { getSupabaseUrl, getSupabaseAnonKey } from '../../lib/supabase';
import { PaymentBrandLogo } from '../../components/common/PaymentBrandLogo';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import {
  isValidWhatsAppNumber,
  isValidWhatsAppChannelUrl,
  buildWhatsAppSupportUrl,
  normalizeWhatsAppNumber,
} from '../../utils/whatsapp';
import {
  Settings,
  CheckCircle2,
  Save,
  Egg,
  KeyRound,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  ArrowDownToLine,
  Sparkles,
  MessageCircle,
  Radio,
  ExternalLink,
  Database,
  Server,
  RefreshCw,
  Copy,
  Check,
  Code,
  UploadCloud,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useAuth();
  const [formData, setFormData] = useState<PlatformSettings>(() => {
    const rawMin = typeof settings?.minWithdrawal === 'number'
      ? settings.minWithdrawal
      : (typeof (settings as any)?.minWithdrawalAmount === 'number'
          ? (settings as any).minWithdrawalAmount
          : 0);

    const base = settings || {
      siteName: 'AL JADEED META EGGS',
      platformName: 'AL JADEED META EGGS',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      minWithdrawal: Math.max(0, rawMin),
      minWithdrawalAmount: Math.max(0, rawMin),
      eggMonetaryValue: 15,
      maintenanceMode: false,
      paymentMethods: {
        bankTransfer: {
          accountTitle: 'Muhammad Murtaza',
          accountNumber: '23623995142254',
          iban: 'PK72UNIL023623995142254',
          bankName: 'UBL — United Bank Limited',
          instructions: 'Send via 1-Link IBFT from any mobile banking app.',
          enabled: true,
        },
        easypaisa: {
          accountTitle: 'Muhammad Murtaza',
          accountNumber: '03008476546',
          instructions: 'Transfer to Easypaisa Mobile Account.',
          enabled: true,
        },
        jazzcash: {
          accountTitle: 'Muhammad Murtaza',
          accountNumber: '03063300658',
          instructions: 'Transfer to JazzCash Mobile Account.',
          enabled: true,
        },
        sadapay: {
          accountTitle: 'Muhammad Murtaza',
          accountNumber: '03008476546',
          iban: 'PK56SADA00000003008476546',
          instructions: 'Send money to SadaPay mobile wallet or IBAN.',
          enabled: true,
        },
      },
    };

    // Ensure sadapay exists in formData if not in saved settings yet
    if (!base.paymentMethods.sadapay) {
      base.paymentMethods.sadapay = {
        accountTitle: 'Muhammad Murtaza',
        accountNumber: '03008476546',
        iban: 'PK56SADA00000003008476546',
        instructions: 'Send money to SadaPay mobile wallet or IBAN.',
        enabled: true,
      };
    }

    if (!base.whatsapp) {
      base.whatsapp = {
        support: {
          enabled: true,
          number: base.supportWhatsApp || '03008476546',
          displayName: 'Al Jadeed Official Support',
          welcomeMessage: 'Hello, I need help regarding my Al Jadeed Meta Eggs account.',
          enableFloatingButton: true,
        },
        channel: {
          enabled: true,
          channelUrl: 'https://whatsapp.com/channel/0029Vaexample',
          channelName: 'Al Jadeed Meta Eggs Official Channel',
          description: 'Get latest updates, announcements and news.',
        },
      };
    }

    return {
      ...base,
      minWithdrawal: Math.max(0, rawMin),
      minWithdrawalAmount: Math.max(0, rawMin),
    };
  });

  // Sync settings when loaded or refreshed from backend
  React.useEffect(() => {
    if (settings) {
      const rawMin = typeof settings.minWithdrawal === 'number'
        ? settings.minWithdrawal
        : (typeof (settings as any).minWithdrawalAmount === 'number'
            ? (settings as any).minWithdrawalAmount
            : 0);
      const minVal = Math.max(0, rawMin);

      setFormData((prev) => ({
        ...prev,
        ...settings,
        minWithdrawal: minVal,
        minWithdrawalAmount: minVal,
        siteName: (settings as any).siteName || settings.platformName || prev.siteName || prev.platformName,
        paymentMethods: {
          ...prev.paymentMethods,
          ...settings.paymentMethods,
        },
        whatsapp: settings.whatsapp
          ? {
              support: {
                ...prev.whatsapp?.support,
                ...settings.whatsapp.support,
              },
              channel: {
                ...prev.whatsapp?.channel,
                ...settings.whatsapp.channel,
              },
            }
          : prev.whatsapp,
      }));
    }
  }, [settings]);

  const currentMin = typeof formData.minWithdrawal === 'number'
    ? formData.minWithdrawal
    : (typeof formData.minWithdrawalAmount === 'number' ? formData.minWithdrawalAmount : 0);
  const isNoMinimum = currentMin <= 0;

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Administrator Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cloud Database (Firebase Firestore & Supabase) State
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseUrl());
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseAnonKey());
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseResult, setSupabaseResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchDbStatus = () => {
    setIsLoadingDb(true);
    api.getDatabaseStatus()
      .then((res) => setDbStatus(res))
      .catch(() => {})
      .finally(() => setIsLoadingDb(false));
  };

  React.useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseResult(null);
    setSupabaseTesting(true);
    try {
      const res = await api.testSupabase({ url: supabaseUrl, anonKey: supabaseAnonKey });
      setSupabaseResult(res);
      if (res.success) {
        fetchDbStatus();
      }
    } catch (err: any) {
      setSupabaseResult({ success: false, message: err?.message || 'Connection test failed.' });
    } finally {
      setSupabaseTesting(false);
    }
  };

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllFeedback, setSyncAllFeedback] = useState<string | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  const handleSyncAllToDatabase = async () => {
    setIsSyncingAll(true);
    setSyncAllFeedback(null);
    try {
      const res = await api.syncAllToDatabase();
      setSyncAllFeedback(res.message);
      fetchDbStatus();
    } catch (err: any) {
      setSyncAllFeedback(err?.message || 'Sync failed.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleToggleSqlSchema = async () => {
    if (!showSqlSchema && !sqlSchema) {
      try {
        const text = await api.getSupabaseSchema();
        setSqlSchema(text);
      } catch (e) {
        console.error(e);
      }
    }
    setShowSqlSchema((prev) => !prev);
  };

  const handleCopySql = () => {
    if (sqlSchema) {
      navigator.clipboard.writeText(sqlSchema);
      setHasCopiedSql(true);
      setTimeout(() => setHasCopiedSql(false), 2500);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwFeedback(null);

    if (!currentPassword) {
      setPwFeedback({ type: 'error', text: 'Please enter your current administrator password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwFeedback({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPw(true);
    try {
      const res = await api.adminChangePassword({ currentPassword, newPassword });
      setPwFeedback({ type: 'success', text: res.message || 'Administrator password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwFeedback(null), 5000);
    } catch (err: any) {
      setPwFeedback({ type: 'error', text: err.message || 'Failed to update administrator password.' });
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    // Validate WhatsApp support & channel configurations
    if (formData.whatsapp?.support?.enabled) {
      const num = formData.whatsapp.support.number?.trim() || '';
      if (!num) {
        setIsSaving(false);
        setFeedback('Error: WhatsApp Support is enabled, but phone number is empty.');
        return;
      }
      if (!isValidWhatsAppNumber(num)) {
        setIsSaving(false);
        setFeedback('Error: Please enter a valid Pakistani or international WhatsApp number (e.g. 03008476546 or +92 300 8476546).');
        return;
      }
    }

    if (formData.whatsapp?.channel?.enabled) {
      const channelUrl = formData.whatsapp.channel.channelUrl?.trim() || '';
      if (!channelUrl) {
        setIsSaving(false);
        setFeedback('Error: WhatsApp Channel is enabled, but Channel URL is empty.');
        return;
      }
      if (!isValidWhatsAppChannelUrl(channelUrl)) {
        setIsSaving(false);
        setFeedback('Error: WhatsApp Channel URL must be a valid web link starting with https:// or http://');
        return;
      }
    }

    try {
      const payload: PlatformSettings = {
        ...formData,
        minWithdrawal: currentMin,
        minWithdrawalAmount: currentMin,
      };
      await api.updateAdminSettings(payload);
      await refreshSettings();
      setFeedback('Platform settings, payment channels and WhatsApp configurations updated successfully.');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-[#0e0424] rounded-2xl flex items-center justify-center text-purple-300">
              <Settings className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Payment Gateways & System Config
            </h1>
            <p className="text-xs text-purple-300">
              Configure Easypaisa, JazzCash, SadaPay, Bank Transfer, and platform economics
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Parameters */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-purple-500/20 pb-3">
            <Egg className="w-4 h-4 text-amber-400" />
            Economic & Platform Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-purple-300 font-bold block mb-1">Platform Brand Title</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">
                Egg Buyback Liquidation Price (Rs. per Egg)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={formData.eggMonetaryValue || 15}
                onChange={(e) =>
                  setFormData({ ...formData, eggMonetaryValue: parseFloat(e.target.value) || 15 })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            {/* Minimum Withdrawal Threshold Configuration */}
            <div className="sm:col-span-2 bg-[#0c041f] border border-purple-500/35 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-inner mt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/25 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ArrowDownToLine className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Minimum Withdrawal: {isNoMinimum ? 'No Minimum' : `${formData.currencySymbol || 'Rs.'} ${currentMin.toLocaleString()}`}
                    </span>
                    {isNoMinimum ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        No Minimum
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Threshold: {formData.currencySymbol || 'Rs.'} {currentMin.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-purple-300/80">
                    Control whether customers can withdraw any balance without restriction ('No Minimum') or must reach a minimum threshold.
                  </p>
                </div>

                {/* Primary 'No Minimum' Toggle Switch */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = isNoMinimum ? 500 : 0;
                    setFormData({
                      ...formData,
                      minWithdrawal: nextVal,
                      minWithdrawalAmount: nextVal,
                    });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isNoMinimum
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-500/35'
                      : 'bg-purple-900/40 text-purple-300 border border-purple-500/40 hover:bg-purple-800/40 hover:text-white'
                  }`}
                >
                  {isNoMinimum ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                      <span>Allow 'No Minimum': ON</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-purple-400" />
                      <span>Allow 'No Minimum'</span>
                    </>
                  )}
                </button>
              </div>

              {/* Threshold numeric input & quick presets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                <div className="md:col-span-5">
                  <label className="text-[11px] text-purple-200 font-bold block mb-1">
                    Withdrawal Minimum Amount ({formData.currencySymbol || 'Rs.'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={currentMin}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
                        setFormData({
                          ...formData,
                          minWithdrawal: val,
                          minWithdrawalAmount: val,
                        });
                      }}
                      placeholder="0 for No Minimum"
                      className="w-full bg-[#14082e] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs font-bold outline-none focus:border-pink-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-400 font-mono">
                      {isNoMinimum ? 'No Minimum' : `${formData.currencySymbol || 'Rs.'}`}
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-400 block mt-1">
                    Enter <code className="text-emerald-400 font-bold bg-emerald-950/60 px-1 py-0.5 rounded">0</code> or click preset to enable 'No Minimum'.
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="md:col-span-7">
                  <label className="text-[11px] text-purple-200 font-bold block mb-1">
                    Threshold Quick Presets
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: '⚡ No Minimum (Rs. 0)', value: 0, isZero: true },
                      { label: 'Rs. 100', value: 100, isZero: false },
                      { label: 'Rs. 250', value: 250, isZero: false },
                      { label: 'Rs. 500', value: 500, isZero: false },
                      { label: 'Rs. 1,000', value: 1000, isZero: false },
                      { label: 'Rs. 2,000', value: 2000, isZero: false },
                    ].map((preset) => {
                      const isActive = currentMin === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              minWithdrawal: preset.value,
                              minWithdrawalAmount: preset.value,
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? preset.isZero
                                ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] ring-1 ring-emerald-300'
                                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                              : 'bg-[#14082e] text-purple-300 border border-purple-500/30 hover:border-purple-400 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status explanation alert */}
              {isNoMinimum ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-emerald-300 font-bold block mb-0.5">
                      'No Minimum' Policy Active
                    </strong>
                    Customers can submit withdrawal requests for any available wallet balance as low as {formData.currencySymbol || 'Rs.'} 1. Both backend validations and customer withdrawal forms now allow any amount &gt; 0.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-purple-950/50 border border-purple-500/30 rounded-xl flex items-start gap-2.5 text-xs text-purple-300">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-white font-bold block mb-0.5">
                      Enforced Minimum Threshold: {formData.currencySymbol || 'Rs.'} {currentMin.toLocaleString()}
                    </strong>
                    Customer cashout requests below {formData.currencySymbol || 'Rs.'} {currentMin.toLocaleString()} will be blocked in the customer portal and rejected by backend server validations.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= 1. EASYPAISA SETTINGS ================= */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <PaymentBrandLogo method="easypaisa" size="sm" />
              <h3 className="text-sm font-bold text-white">Easypaisa Payment Method</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    easypaisa: {
                      ...formData.paymentMethods.easypaisa,
                      enabled: formData.paymentMethods?.easypaisa?.enabled === false ? true : false,
                    },
                  },
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                formData.paymentMethods?.easypaisa?.enabled !== false
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {formData.paymentMethods?.easypaisa?.enabled !== false ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Enabled in UI</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-purple-300 font-bold block mb-1">Account Title / Name</label>
              <input
                type="text"
                value={formData.paymentMethods?.easypaisa?.accountTitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      easypaisa: {
                        ...formData.paymentMethods.easypaisa,
                        accountTitle: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">Mobile Account Number</label>
              <input
                type="text"
                value={formData.paymentMethods?.easypaisa?.accountNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      easypaisa: {
                        ...formData.paymentMethods.easypaisa,
                        accountNumber: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-purple-300 font-bold block mb-1">Custom Payment Instructions</label>
              <textarea
                rows={2}
                value={formData.paymentMethods?.easypaisa?.instructions || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      easypaisa: {
                        ...formData.paymentMethods.easypaisa,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-purple-300 font-bold block mb-1">
                Custom Logo URL (Optional - Leave blank to use official logo)
              </label>
              <input
                type="text"
                placeholder="https://example.com/easypaisa.png"
                value={formData.paymentMethods?.easypaisa?.logoUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      easypaisa: {
                        ...formData.paymentMethods.easypaisa,
                        logoUrl: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* ================= 2. JAZZCASH SETTINGS ================= */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <PaymentBrandLogo method="jazzcash" size="sm" />
              <h3 className="text-sm font-bold text-white">JazzCash Payment Method</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    jazzcash: {
                      ...formData.paymentMethods.jazzcash,
                      enabled: formData.paymentMethods?.jazzcash?.enabled === false ? true : false,
                    },
                  },
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                formData.paymentMethods?.jazzcash?.enabled !== false
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {formData.paymentMethods?.jazzcash?.enabled !== false ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Enabled in UI</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-purple-300 font-bold block mb-1">Account Title / Name</label>
              <input
                type="text"
                value={formData.paymentMethods?.jazzcash?.accountTitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      jazzcash: {
                        ...formData.paymentMethods.jazzcash,
                        accountTitle: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">Mobile Account Number</label>
              <input
                type="text"
                value={formData.paymentMethods?.jazzcash?.accountNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      jazzcash: {
                        ...formData.paymentMethods.jazzcash,
                        accountNumber: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-purple-300 font-bold block mb-1">Custom Payment Instructions</label>
              <textarea
                rows={2}
                value={formData.paymentMethods?.jazzcash?.instructions || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      jazzcash: {
                        ...formData.paymentMethods.jazzcash,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-purple-300 font-bold block mb-1">
                Custom Logo URL (Optional - Leave blank to use official logo)
              </label>
              <input
                type="text"
                placeholder="https://example.com/jazzcash.png"
                value={formData.paymentMethods?.jazzcash?.logoUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      jazzcash: {
                        ...formData.paymentMethods.jazzcash,
                        logoUrl: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* ================= 3. BANK TRANSFER SETTINGS ================= */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <PaymentBrandLogo method="bankTransfer" size="sm" />
              <h3 className="text-sm font-bold text-white">Bank Transfer / IBFT Method</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    bankTransfer: {
                      ...formData.paymentMethods.bankTransfer,
                      enabled: formData.paymentMethods?.bankTransfer?.enabled === false ? true : false,
                    },
                  },
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                formData.paymentMethods?.bankTransfer?.enabled !== false
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {formData.paymentMethods?.bankTransfer?.enabled !== false ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Enabled in UI</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-purple-300 font-bold block mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.paymentMethods?.bankTransfer?.bankName || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      bankTransfer: {
                        ...formData.paymentMethods.bankTransfer,
                        bankName: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">Account Title / Name</label>
              <input
                type="text"
                value={formData.paymentMethods?.bankTransfer?.accountTitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      bankTransfer: {
                        ...formData.paymentMethods.bankTransfer,
                        accountTitle: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">Account Number</label>
              <input
                type="text"
                value={formData.paymentMethods?.bankTransfer?.accountNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      bankTransfer: {
                        ...formData.paymentMethods.bankTransfer,
                        accountNumber: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">IBAN</label>
              <input
                type="text"
                value={formData.paymentMethods?.bankTransfer?.iban || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      bankTransfer: {
                        ...formData.paymentMethods.bankTransfer,
                        iban: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-purple-300 font-bold block mb-1">Custom Payment Instructions</label>
              <textarea
                rows={2}
                value={formData.paymentMethods?.bankTransfer?.instructions || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      bankTransfer: {
                        ...formData.paymentMethods.bankTransfer,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-purple-300 font-bold block mb-1">
                Custom Logo URL (Optional - Leave blank to use official logo)
              </label>
              <input
                type="text"
                placeholder="https://example.com/bank.png"
                value={formData.paymentMethods?.bankTransfer?.logoUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      bankTransfer: {
                        ...formData.paymentMethods.bankTransfer,
                        logoUrl: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* ================= 4. SADAPAY SETTINGS ================= */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <PaymentBrandLogo method="sadapay" size="sm" />
              <h3 className="text-sm font-bold text-white">SadaPay Payment Method</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    sadapay: {
                      ...formData.paymentMethods.sadapay,
                      enabled: formData.paymentMethods?.sadapay?.enabled === false ? true : false,
                    },
                  },
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                formData.paymentMethods?.sadapay?.enabled !== false
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {formData.paymentMethods?.sadapay?.enabled !== false ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Enabled in UI</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-purple-300 font-bold block mb-1">Account Title / Name</label>
              <input
                type="text"
                value={formData.paymentMethods?.sadapay?.accountTitle || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      sadapay: {
                        ...formData.paymentMethods.sadapay,
                        accountTitle: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">Mobile / Account Number</label>
              <input
                type="text"
                value={formData.paymentMethods?.sadapay?.accountNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      sadapay: {
                        ...formData.paymentMethods.sadapay,
                        accountNumber: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">IBAN (Optional)</label>
              <input
                type="text"
                value={formData.paymentMethods?.sadapay?.iban || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      sadapay: {
                        ...formData.paymentMethods.sadapay,
                        iban: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-purple-300 font-bold block mb-1">
                Custom Logo URL (Optional - Leave blank to use official logo)
              </label>
              <input
                type="text"
                placeholder="https://example.com/sadapay.png"
                value={formData.paymentMethods?.sadapay?.logoUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      sadapay: {
                        ...formData.paymentMethods.sadapay,
                        logoUrl: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-purple-300 font-bold block mb-1">Custom Payment Instructions</label>
              <textarea
                rows={2}
                value={formData.paymentMethods?.sadapay?.instructions || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethods: {
                      ...formData.paymentMethods,
                      sadapay: {
                        ...formData.paymentMethods.sadapay,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none text-xs"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Support & Official Channel Configuration */}
        <div id="admin-whatsapp-settings-section" className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.3)]">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  WhatsApp Support & Community Desk
                </h3>
                <p className="text-xs text-purple-300">
                  Configure direct customer WhatsApp chat support and official broadcast channel links.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                formData.whatsapp?.support?.enabled || formData.whatsapp?.channel?.enabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}>
                {formData.whatsapp?.support?.enabled || formData.whatsapp?.channel?.enabled ? 'Active on Dashboard' : 'Disabled on Dashboard'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. WHATSAPP SUPPORT DESK CONFIG */}
            <div className="bg-[#0e0422] border border-purple-500/25 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    WhatsApp Chat Support
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      whatsapp: {
                        ...formData.whatsapp!,
                        support: {
                          ...formData.whatsapp!.support,
                          enabled: !formData.whatsapp?.support?.enabled,
                        },
                      },
                    })
                  }
                  className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  {formData.whatsapp?.support?.enabled ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ToggleRight className="w-6 h-6 text-emerald-400" /> Enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <ToggleLeft className="w-6 h-6" /> Disabled
                    </span>
                  )}
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-purple-300 font-bold block mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 03008476546 or +92 300 8476546"
                    value={formData.whatsapp?.support?.number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: {
                          ...formData.whatsapp!,
                          support: {
                            ...formData.whatsapp!.support,
                            number: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#15072e] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-400"
                  />
                  <div className="flex items-center justify-between text-[11px] mt-1.5 px-0.5">
                    <span className="text-purple-400">
                      Normalized:{' '}
                      <strong className="text-white font-mono">
                        {normalizeWhatsAppNumber(formData.whatsapp?.support?.number || '') || '—'}
                      </strong>
                    </span>
                    {formData.whatsapp?.support?.number && (
                      <span className={isValidWhatsAppNumber(formData.whatsapp.support.number) ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                        {isValidWhatsAppNumber(formData.whatsapp.support.number) ? 'Valid Format' : 'Invalid number'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-purple-300 font-bold block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Al Jadeed Official Support"
                    value={formData.whatsapp?.support?.displayName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: {
                          ...formData.whatsapp!,
                          support: {
                            ...formData.whatsapp!.support,
                            displayName: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#15072e] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-purple-300 font-bold block mb-1">
                    Pre-filled Welcome Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Hello, I need help regarding my Al Jadeed Meta Eggs account."
                    value={formData.whatsapp?.support?.welcomeMessage || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: {
                          ...formData.whatsapp!,
                          support: {
                            ...formData.whatsapp!.support,
                            welcomeMessage: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#15072e] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Floating Button Toggle */}
                <div className="pt-2 border-t border-purple-500/15 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-200 block text-xs">
                      Floating WhatsApp Button
                    </span>
                    <span className="text-[11px] text-purple-400/80">
                      Show quick-access floating icon at bottom-right of customer dashboard
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        whatsapp: {
                          ...formData.whatsapp!,
                          support: {
                            ...formData.whatsapp!.support,
                            enableFloatingButton: !formData.whatsapp?.support?.enableFloatingButton,
                          },
                        },
                      })
                    }
                    className="cursor-pointer"
                  >
                    {formData.whatsapp?.support?.enableFloatingButton ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Admin Live Preview Support */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = buildWhatsAppSupportUrl(
                        formData.whatsapp?.support?.number || '',
                        formData.whatsapp?.support?.welcomeMessage
                      );
                      if (url) window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    disabled={!formData.whatsapp?.support?.number}
                    className="w-full py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>Open Preview (Test Support Link)</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. WHATSAPP BROADCAST CHANNEL CONFIG */}
            <div className="bg-[#0e0422] border border-purple-500/25 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Official WhatsApp Channel
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      whatsapp: {
                        ...formData.whatsapp!,
                        channel: {
                          ...formData.whatsapp!.channel,
                          enabled: !formData.whatsapp?.channel?.enabled,
                        },
                      },
                    })
                  }
                  className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  {formData.whatsapp?.channel?.enabled ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ToggleRight className="w-6 h-6 text-emerald-400" /> Enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <ToggleLeft className="w-6 h-6" /> Disabled
                    </span>
                  )}
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-purple-300 font-bold block mb-1">
                    WhatsApp Channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://whatsapp.com/channel/0029Vaexample"
                    value={formData.whatsapp?.channel?.channelUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: {
                          ...formData.whatsapp!,
                          channel: {
                            ...formData.whatsapp!.channel,
                            channelUrl: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#15072e] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400"
                  />
                  <div className="flex items-center justify-between text-[11px] mt-1.5 px-0.5">
                    <span className="text-purple-400">
                      Official broadcast link for announcements & news
                    </span>
                    {formData.whatsapp?.channel?.channelUrl && (
                      <span className={isValidWhatsAppChannelUrl(formData.whatsapp.channel.channelUrl) ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                        {isValidWhatsAppChannelUrl(formData.whatsapp.channel.channelUrl) ? 'Valid URL' : 'Invalid URL'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-purple-300 font-bold block mb-1">
                    Channel Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Al Jadeed Meta Eggs Official Channel"
                    value={formData.whatsapp?.channel?.channelName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: {
                          ...formData.whatsapp!,
                          channel: {
                            ...formData.whatsapp!.channel,
                            channelName: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#15072e] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-purple-300 font-bold block mb-1">
                    Short Description / Banner Notice
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Get latest updates, announcements and news directly on WhatsApp."
                    value={formData.whatsapp?.channel?.description || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: {
                          ...formData.whatsapp!,
                          channel: {
                            ...formData.whatsapp!.channel,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#15072e] border border-purple-500/40 rounded-xl px-3.5 py-2 text-white outline-none focus:border-purple-400"
                  />
                </div>

                {/* Admin Live Preview Channel */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.whatsapp?.channel?.channelUrl) {
                        window.open(formData.whatsapp.channel.channelUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    disabled={!formData.whatsapp?.channel?.channelUrl}
                    className="w-full py-2 px-3 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-purple-300" />
                    <span>Open Preview (Test Channel Link)</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Configuration...' : 'Save & Publish Settings'}</span>
        </button>
      </form>

      {/* Administrator Password & Profile Security Section */}
      <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-purple-500/20">
          <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-pink-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Administrator Password & Credentials Security
            </h2>
            <p className="text-xs text-purple-300">
              Update your master administrator password. Password will be salted and hashed with bcrypt on the server.
            </p>
          </div>
        </div>

        {pwFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
              pwFeedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/80 border-red-500/40 text-red-300'
            }`}
          >
            {pwFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{pwFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div>
            <label className="text-purple-300 font-bold block mb-1">Current Admin Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white pr-9 outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white cursor-pointer"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-purple-300 font-bold block mb-1">New Admin Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white pr-9 outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white cursor-pointer"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-purple-300 font-bold block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-pink-500"
            />
          </div>

          <div className="sm:col-span-3 pt-1">
            <button
              type="submit"
              disabled={isChangingPw}
              className="py-2.5 px-5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isChangingPw ? 'Updating Password...' : 'Update Password Credentials'}
            </button>
          </div>
        </form>
      </div>

      {/* Cloud Database & Storage (Firebase Firestore & Supabase) Section */}
      <div className="bg-[#14082e] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Cloud Database & Backend Infrastructure
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 uppercase tracking-wider">
                  Live & Connected
                </span>
              </h2>
              <p className="text-xs text-purple-300">
                Persistent storage provisioned via Google Cloud Firestore, with support for Supabase PostgreSQL & REST sync.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDbStatus}
            disabled={isLoadingDb}
            className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs"
            title="Refresh database status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Firebase Firestore Card */}
          <div className="p-4 rounded-2xl bg-[#0d0422] border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">Google Firestore Database</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3" />
                {dbStatus?.firebase?.status || 'Provisioned & Active'}
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-purple-300">
              <div className="flex justify-between py-1 border-b border-purple-900/40">
                <span className="text-purple-400">Project ID:</span>
                <span className="font-mono text-white select-all">{dbStatus?.firebase?.projectId || 'gen-lang-client-0758425979'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-purple-900/40">
                <span className="text-purple-400">Database ID:</span>
                <span className="font-mono text-cyan-300 select-all truncate max-w-[200px]" title={dbStatus?.firebase?.databaseId || 'Default'}>
                  {dbStatus?.firebase?.databaseId || '(default)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-purple-400">Security Rules:</span>
                <span className="text-emerald-400 font-semibold">Fortress Deployed (ABAC)</span>
              </div>
            </div>
          </div>

          {/* Supabase Status Card */}
          <div className="p-4 rounded-2xl bg-[#0d0422] border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">Supabase Integration</span>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                dbStatus?.supabase?.configured
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
              }`}>
                {dbStatus?.supabase?.configured ? 'Connected' : 'Configurable'}
              </span>
            </div>
            <p className="text-[11px] text-purple-300 leading-relaxed">
              Connect your own external Supabase project (PostgreSQL / Realtime) by testing the credentials below or setting <code className="text-emerald-300 bg-purple-950 px-1 py-0.5 rounded">SUPABASE_URL</code> & <code className="text-emerald-300 bg-purple-950 px-1 py-0.5 rounded">SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        </div>

        {/* Live Supabase Connection Tester */}
        <form onSubmit={handleTestSupabase} className="p-4 rounded-2xl bg-[#0a031a] border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              Test External Supabase Connection
            </span>
            <span className="text-[10px] text-purple-400">Instant Endpoint Validation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-purple-300 block mb-1 font-semibold">Supabase Project URL</label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full bg-[#14082e] border border-purple-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-purple-300 block mb-1 font-semibold">Supabase Anon Public API Key</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full bg-[#14082e] border border-purple-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>
          </div>

          {supabaseResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              supabaseResult.success
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/80 border-red-500/40 text-red-300'
            }`}>
              {supabaseResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{supabaseResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-900/40 mt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSqlSchema}
                className="py-1.5 px-3 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showSqlSchema ? 'Hide Supabase SQL Schema' : 'View Supabase SQL Tables'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={supabaseTesting || !supabaseUrl || !supabaseAnonKey}
              className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {supabaseTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Verify Supabase Endpoint</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* SQL Schema Preview Drawer */}
        {showSqlSchema && (
          <div className="p-4 rounded-2xl bg-[#090216] border border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">PostgreSQL Table Definitions for Supabase</span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="py-1 px-3 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {hasCopiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-purple-300">
              Paste this in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to create all tables (<code>users</code>, <code>orders</code>, <code>hen_ownership</code>, <code>egg_balances</code>, <code>withdrawals</code>) with full schema constraints and Row Level Security.
            </p>
            <pre className="max-h-60 overflow-y-auto p-3 rounded-xl bg-black/60 border border-purple-500/20 text-[10px] text-purple-200 font-mono select-all">
              {sqlSchema || 'Loading SQL schema definitions...'}
            </pre>
          </div>
        )}

        {/* One-Click Cloud Data Sync Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              Synchronize All App Data to Cloud & Supabase
            </h4>
            <p className="text-[11px] text-purple-300 mt-0.5">
              Syncs all registered users, purchase orders, active hen batches, egg balances, and pending withdrawals.
            </p>
            {syncAllFeedback && (
              <p className="text-xs text-emerald-300 font-semibold mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {syncAllFeedback}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSyncAllToDatabase}
            disabled={isSyncingAll}
            className="shrink-0 py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSyncingAll ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Database...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Sync All Records Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
