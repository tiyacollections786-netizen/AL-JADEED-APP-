import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Egg,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Eye,
  X,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface CustomerOrdersPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({ onNavigate }) => {
  const { settings } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProofImage, setActiveProofImage] = useState<{ url: string; title: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadOrders = async () => {
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
  const approvedOrders = orders.filter(o => o.paymentStatus === 'approved');
  const rejectedOrders = orders.filter(o => o.paymentStatus === 'rejected');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-[#0d0422] rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Hen Purchase Orders
              </h1>
              <p className="text-xs text-purple-300">
                Track payment verification status, transaction proofs, and digital flock activation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadOrders}
            className="p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-purple-200 hover:text-white transition"
            title="Refresh Orders"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('packages')}
            className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Buy More Hens</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#14082e] border border-amber-500/30 rounded-2xl p-3 sm:p-4 text-center">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase block">Pending Verification</span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
            {pendingOrders.length}
          </span>
        </div>

        <div className="bg-[#14082e] border border-emerald-500/30 rounded-2xl p-3 sm:p-4 text-center">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">Approved Orders</span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
            {approvedOrders.length}
          </span>
        </div>

        <div className="bg-[#14082e] border border-purple-500/30 rounded-2xl p-3 sm:p-4 text-center">
          <span className="text-[10px] text-purple-300 font-extrabold uppercase block">Total Orders</span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="p-16 text-center text-purple-300 text-xs">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading purchase history...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 bg-[#14082e] border border-purple-500/30 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/40 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30">
            <Egg className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">No Hen Orders Placed Yet</h3>
            <p className="text-xs text-purple-300 max-w-sm mx-auto mt-1 leading-relaxed">
              Start your digital poultry journey today at Rs. 500 per hen. Each hen produces 1 egg daily for 120 continuous days.
            </p>
          </div>
          <button
            onClick={() => onNavigate('packages')}
            className="py-3 px-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-102 transition-transform"
          >
            Explore Hen Packages
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isApproved = order.paymentStatus === 'approved' || order.status === 'approved' || order.status === 'verified';
            const isPending = order.paymentStatus === 'pending' || order.status === 'pending';
            const isReview = order.paymentStatus === 'under_review' || order.status === 'under_review';
            const isRejected = order.paymentStatus === 'rejected' || order.status === 'rejected' || order.status === 'failed';

            const hasImageProof =
              order.paymentProofUrl &&
              (order.paymentProofUrl.startsWith('data:image') ||
                order.paymentProofUrl.startsWith('http://') ||
                order.paymentProofUrl.startsWith('https://'));

            return (
              <div
                key={order.id}
                className={`bg-[#14082e] border rounded-3xl p-5 sm:p-6 transition-all space-y-4 shadow-sm ${
                  isPending
                    ? 'border-amber-500/40 bg-gradient-to-b from-[#180a33] to-[#14082e]'
                    : isReview
                    ? 'border-blue-500/40'
                    : isApproved
                    ? 'border-emerald-500/30'
                    : 'border-red-500/30'
                }`}
              >
                {/* Header: Order ID, Submission Date, Payment Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-300">
                      {order.orderNumber || order.id}
                    </span>
                    {order.paymentId && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                        {order.paymentId}
                      </span>
                    )}
                    <span className="text-xs text-purple-300">
                      • {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : isReview
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isReview && <Clock className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {isRejected && <AlertCircle className="w-3.5 h-3.5" />}
                      <span>
                        {isApproved
                          ? 'Payment Approved'
                          : isReview
                          ? 'Under Verification'
                          : isPending
                          ? 'Pending Verification'
                          : 'Payment Rejected'}
                      </span>
                    </span>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-950 text-purple-200 border border-purple-500/20">
                      {order.henStatus || (isApproved ? 'Flock Active' : isPending ? 'Hens Locked' : 'Not Allocated')}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-400 font-bold uppercase block">Hens Ordered</span>
                    <span className="text-white font-bold text-sm">{order.quantity} Hens</span>
                    <span className="text-[10px] text-amber-400 block mt-0.5">+{order.quantity} Eggs/day</span>
                  </div>

                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-400 font-bold uppercase block">Amount Paid</span>
                    <span className="text-pink-400 font-mono font-bold text-sm">
                      {currency} {order.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-purple-300 block mt-0.5">Rs. {order.pricePerHen || 500}/hen</span>
                  </div>

                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-400 font-bold uppercase block">Channel</span>
                    <span className="text-white font-bold uppercase truncate block text-sm">
                      {order.paymentMethod}
                    </span>
                    <span className="text-[10px] text-purple-300 block mt-0.5">Manual Transfer</span>
                  </div>

                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-400 font-bold uppercase block">Transaction TID</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-mono text-amber-300 font-bold text-xs truncate">
                        {order.paymentReference || 'N/A'}
                      </span>
                      {order.paymentReference && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(order.paymentReference, `ref-${order.id}`)}
                          className="p-0.5 text-purple-400 hover:text-white"
                          title="Copy TID"
                        >
                          {copiedId === `ref-${order.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Notice / Rejection Alert */}
                {isPending && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">Payment Verification in Progress</p>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Our administrative team is verifying your payment with the bank/wallet records. Once approved, your {order.quantity} hens will automatically be added to your flock and begin laying eggs.
                      </p>
                    </div>
                  </div>
                )}

                {isRejected && (
                  <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-2xl text-xs text-red-200 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Payment Verification Failed</span>
                    </div>
                    <p className="text-[11px] text-red-200/90 leading-relaxed">
                      <strong>Reason from Admin:</strong> {order.rejectionReason || order.adminNotes || 'Payment could not be confirmed in bank records.'}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-purple-300">
                        Need assistance? Contact support or place a new order with valid receipt.
                      </span>
                      <button
                        onClick={() => onNavigate('packages')}
                        className="py-1 px-3 bg-red-800 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg transition"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer bar: View screenshot button and View Flock link */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-500/15 text-xs">
                  {hasImageProof ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveProofImage({
                          url: order.paymentProofUrl!,
                          title: `Payment Receipt - Order #${order.orderNumber || order.id}`,
                        })
                      }
                      className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1.5 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Attached Payment Screenshot</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-purple-400">
                      Payment Ref: {order.paymentReference || 'N/A'}
                    </span>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => onNavigate('customer-my-hens')}
                      className="py-1.5 px-3.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <span>View Active Flock ({order.quantity} Hens)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= LIGHTBOX IMAGE MODAL ================= */}
      {activeProofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-2xl w-full bg-[#14082e] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-[#1c0a3d] border-b border-purple-500/20 flex items-center justify-between">
              <span className="font-bold text-sm text-white truncate">{activeProofImage.title}</span>
              <button
                type="button"
                onClick={() => setActiveProofImage(null)}
                className="w-8 h-8 rounded-full bg-purple-900/40 text-purple-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-black/40 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={activeProofImage.url}
                alt="Submitted Payment Proof"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-purple-500/20"
              />
            </div>
            <div className="p-3 bg-[#110526] border-t border-purple-500/20 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveProofImage(null)}
                className="py-1.5 px-4 rounded-xl bg-purple-900/50 hover:bg-purple-900 text-xs font-bold text-white transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
