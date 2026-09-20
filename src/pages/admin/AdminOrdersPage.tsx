import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Egg,
  Search,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  Smartphone,
  Coins,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  Download,
} from 'lucide-react';
import { downloadCSV, formatDateForCSV } from '../../utils/csvExport';

export const AdminOrdersPage: React.FC = () => {
  const { settings } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [activeProofImage, setActiveProofImage] = useState<{ url: string; title: string } | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Transaction ID could not be verified in bank/wallet statement.');
  const [approvingOrder, setApprovingOrder] = useState<Order | null>(null);
  const [adminApprovalNotes, setAdminApprovalNotes] = useState<string>('Payment received and verified in bank statement.');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadOrders = async () => {
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (err: any) {
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

  const handleApproveOrder = async () => {
    if (!approvingOrder) return;
    setActionLoadingId(approvingOrder.id);
    try {
      const res = await api.approveOrder(approvingOrder.id, adminApprovalNotes);
      setFeedbackMsg({
        type: 'success',
        text: `Order #${res.order.orderNumber || approvingOrder.id} approved! ${res.ownership?.numberOfHens || approvingOrder.quantity} hens assigned and activated into 120-day production cycle.`,
      });
      setApprovingOrder(null);
      await loadOrders();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to approve order' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectingOrder) return;
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason for the investor.');
      return;
    }
    setActionLoadingId(rejectingOrder.id);
    try {
      await api.rejectOrder(rejectingOrder.id, rejectReason.trim());
      setFeedbackMsg({
        type: 'success',
        text: `Order #${rejectingOrder.orderNumber || rejectingOrder.id} rejected. Customer has been notified with the reason.`,
      });
      setRejectingOrder(null);
      await loadOrders();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to reject order' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkUnderReview = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await api.markOrderUnderReview(orderId);
      setFeedbackMsg({
        type: 'success',
        text: `Order status set to "Under Review".`,
      });
      await loadOrders();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update order' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
  const underReviewOrders = orders.filter(o => o.paymentStatus === 'under_review');
  const approvedOrders = orders.filter(o => o.paymentStatus === 'approved');
  const rejectedOrders = orders.filter(o => o.paymentStatus === 'rejected');

  const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const approvedAmount = approvedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (o.paymentStatus === 'pending' || o.status === 'pending')) ||
      (statusFilter === 'under_review' && (o.paymentStatus === 'under_review' || o.status === 'under_review')) ||
      (statusFilter === 'approved' && (o.paymentStatus === 'approved' || o.status === 'approved' || o.status === 'verified')) ||
      (statusFilter === 'rejected' && (o.paymentStatus === 'rejected' || o.status === 'rejected' || o.status === 'failed'));

    const matchesMethod =
      methodFilter === 'all' ||
      o.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.paymentId && o.paymentId.toLowerCase().includes(q)) ||
      (o.userName && o.userName.toLowerCase().includes(q)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(q)) ||
      (o.userPhone && o.userPhone.toLowerCase().includes(q)) ||
      (o.paymentReference && o.paymentReference.toLowerCase().includes(q)) ||
      (o.senderAccount && o.senderAccount.toLowerCase().includes(q));

    return matchesStatus && matchesMethod && matchesSearch;
  });

  const presetReasons = [
    'Transaction ID could not be verified in bank/wallet statement.',
    'Submitted amount does not match order payable amount.',
    'Duplicate transaction ID already used in another order.',
    'Payment screenshot is blurry or unreadable.',
    'Funds have not credited into Al Jadeed account yet.',
    'Sender account details do not match receipt.',
  ];

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      'Order Number',
      'System Order ID',
      'Payment ID',
      'Transaction Reference / TRX ID',
      'Order Date & Time',
      'Approved / Completed Date',
      'Investor Name',
      'Email',
      'Phone Number',
      'Package Name',
      'Hens Quantity',
      `Price Per Hen (${currency})`,
      `Total Amount (${currency})`,
      `Submitted Amount (${currency})`,
      'Payment Method',
      'Sender Account Details',
      'Order Status',
      'Payment Status',
      'Hen Cycle Status',
      'Admin Notes',
      'Rejection Reason',
    ];

    const rows = filteredOrders.map(o => [
      o.orderNumber || o.id,
      o.id,
      o.paymentId || '',
      o.paymentReference || '',
      formatDateForCSV(o.createdAt),
      formatDateForCSV(o.approvedAt || o.rejectedAt),
      o.userName || '',
      o.userEmail || '',
      o.userPhone || '',
      o.packageName || 'Meta Layer Hen',
      o.quantity,
      o.pricePerHen,
      o.totalAmount,
      o.submittedAmount ?? o.totalAmount,
      o.paymentMethod ? o.paymentMethod.toUpperCase() : '',
      o.senderAccount || '',
      o.status,
      o.paymentStatus,
      o.henStatus,
      o.adminNotes || '',
      o.rejectionReason || '',
    ]);

    const dateSlug = new Date().toISOString().slice(0, 10);
    const filterSlug = statusFilter === 'all' ? 'all' : statusFilter;
    const filename = `aljadeed_orders_${filterSlug}_${dateSlug}.csv`;

    downloadCSV(filename, headers, rows);
    setFeedbackMsg({
      type: 'success',
      text: `Exported ${filteredOrders.length} order transaction(s) to CSV (${filename}).`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_25px_rgba(168,85,247,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-[#0d0422] rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Hen Purchase Verification Desk
            </h1>
            <p className="text-xs text-purple-300">
              Review investor payment proofs, verify bank/wallet transfers, and activate 120-day hen cycles
            </p>
          </div>
        </div>

        <button
          onClick={loadOrders}
          disabled={isLoading}
          className="py-2 px-4 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-md ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#14082e] border border-amber-500/30 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase">
            <span>Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{pendingOrders.length}</p>
          <p className="text-[11px] text-amber-300/80 font-mono">
            {currency} {pendingAmount.toLocaleString()} awaiting approval
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-[#14082e] border border-blue-500/30 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-blue-400 text-xs font-bold uppercase">
            <span>Under Review</span>
            <Search className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{underReviewOrders.length}</p>
          <p className="text-[11px] text-blue-300/80 font-mono">In progress checks</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-[#14082e] border border-emerald-500/30 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase">
            <span>Approved & Active</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{approvedOrders.length}</p>
          <p className="text-[11px] text-emerald-300/80 font-mono">
            {currency} {approvedAmount.toLocaleString()} verified revenue
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-[#14082e] border border-red-500/30 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-red-400 text-xs font-bold uppercase">
            <span>Rejected / Invalid</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{rejectedOrders.length}</p>
          <p className="text-[11px] text-red-300/80 font-mono">Declined proofs</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#110526] p-3 rounded-2xl border border-purple-500/25">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Payment ID, Name, Mobile, TRX..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#1b0a3d] border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0d0422] border border-purple-500/25 rounded-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'under_review', label: 'Reviewing' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="bg-[#0d0422] border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-200 outline-none focus:border-pink-500"
          >
            <option value="all">All Methods</option>
            <option value="easypaisa">Easypaisa</option>
            <option value="jazzcash">JazzCash</option>
            <option value="bank">Bank Transfer</option>
            <option value="crypto">Crypto USDT</option>
          </select>

          {/* Export to CSV Button */}
          <button
            type="button"
            id="export-orders-csv-btn"
            onClick={handleExportCSV}
            disabled={filteredOrders.length === 0}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
            title={`Export ${filteredOrders.length} visible order record(s) to CSV`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export to CSV</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/30">
              {filteredOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="p-16 text-center text-purple-300 text-xs">
          <div className="w-9 h-9 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading orders and payment receipts...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 bg-[#14082e] border border-purple-500/30 rounded-3xl text-center space-y-2">
          <ShoppingCart className="w-10 h-10 text-purple-400 mx-auto opacity-40" />
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-purple-300/80">No hen purchase transactions match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isPending = order.paymentStatus === 'pending' || order.status === 'pending';
            const isReview = order.paymentStatus === 'under_review' || order.status === 'under_review';
            const isApproved = order.paymentStatus === 'approved' || order.status === 'approved' || order.status === 'verified';
            const isRejected = order.paymentStatus === 'rejected' || order.status === 'rejected' || order.status === 'failed';

            const hasImageProof =
              order.paymentProofUrl &&
              (order.paymentProofUrl.startsWith('data:image') ||
                order.paymentProofUrl.startsWith('http://') ||
                order.paymentProofUrl.startsWith('https://'));

            return (
              <div
                key={order.id}
                className={`bg-[#14082e] border rounded-3xl p-5 sm:p-6 transition-all duration-200 ease-out origin-center hover:scale-[1.006] sm:hover:scale-[1.008] hover:z-10 relative space-y-4 shadow-sm ${
                  isPending
                    ? 'border-amber-500/40 hover:border-amber-500/70 bg-gradient-to-b from-[#190a36] to-[#14082e] hover:shadow-[0_10px_30px_rgba(245,158,11,0.22)]'
                    : isReview
                    ? 'border-blue-500/40 hover:border-blue-500/70 hover:shadow-[0_10px_30px_rgba(59,130,246,0.22)]'
                    : isApproved
                    ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_10px_30px_rgba(16,185,129,0.22)]'
                    : 'border-red-500/30 hover:border-red-500/60 hover:shadow-[0_10px_30px_rgba(239,68,68,0.22)]'
                }`}
              >
                {/* Header row: Order ID, Payment ID, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-300">
                      {order.orderNumber || order.id}
                    </span>
                    {order.paymentId && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30">
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
                      {isReview && <Search className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5" />}
                      <span>{order.paymentStatus || order.status}</span>
                    </span>

                    {/* Hen Status Badge */}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-200 border border-purple-500/20">
                      {order.henStatus || (isApproved ? 'Flock Active' : isPending ? 'Awaiting Approval' : 'Not Assigned')}
                    </span>
                  </div>
                </div>

                {/* Main Grid: Customer info, Hen details, Payment info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Customer Details */}
                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-purple-500/20 space-y-1.5">
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">
                      Investor Profile
                    </span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-pink-400" />
                      <span>{order.userName || 'Investor Account'}</span>
                    </div>
                    {order.userEmail && (
                      <div className="text-purple-300 flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-purple-400" />
                        <span className="truncate">{order.userEmail}</span>
                      </div>
                    )}
                    {order.userPhone && (
                      <div className="text-purple-300 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-purple-400" />
                        <span>{order.userPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Order & Flock Details */}
                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-purple-500/20 space-y-1.5">
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">
                      Hen Order Specification
                    </span>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Quantity:</span>
                      <span className="font-bold text-white">{order.quantity} Hens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Production Rate:</span>
                      <span className="font-bold text-amber-400">+{order.dailyProduction || order.quantity} Eggs/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Cycle Duration:</span>
                      <span className="font-bold text-white">120 Days ({order.maxProduction || order.quantity * 120} Eggs)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-purple-500/15">
                      <span className="text-purple-300 font-bold">Total Amount:</span>
                      <span className="font-mono font-bold text-pink-400 text-sm">
                        {currency} {order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Payment Transfer Details */}
                  <div className="p-3 bg-[#0d0422] rounded-2xl border border-purple-500/20 space-y-1.5">
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">
                      Payment Verification Data
                    </span>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Method:</span>
                      <span className="font-bold text-white uppercase">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300">Transaction ID:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-amber-300">
                          {order.paymentReference || 'N/A'}
                        </span>
                        {order.paymentReference && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(order.paymentReference, `ref-${order.id}`)}
                            className="p-0.5 text-purple-400 hover:text-white"
                            title="Copy TRX"
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
                    {order.senderAccount && (
                      <div className="flex justify-between">
                        <span className="text-purple-300">Sender Account:</span>
                        <span className="font-mono text-purple-200">{order.senderAccount}</span>
                      </div>
                    )}
                    {order.submittedAmount && order.submittedAmount !== order.totalAmount && (
                      <div className="flex justify-between text-amber-400 font-bold">
                        <span>Submitted:</span>
                        <span>{currency} {order.submittedAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Screenshot & Notes Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#0d0422]/90 rounded-2xl border border-purple-500/20 text-xs">
                  {/* Screenshot Thumbnail */}
                  <div className="flex items-center gap-3">
                    {hasImageProof ? (
                      <div
                        onClick={() =>
                          setActiveProofImage({
                            url: order.paymentProofUrl!,
                            title: `Order #${order.orderNumber || order.id} Proof - ${order.userName}`,
                          })
                        }
                        className="w-14 h-14 rounded-xl overflow-hidden bg-purple-950 border border-purple-500/40 relative cursor-pointer group shrink-0"
                      >
                        <img
                          src={order.paymentProofUrl}
                          alt="Payment Receipt"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-purple-950/60 border border-purple-500/20 flex flex-col items-center justify-center text-purple-400 shrink-0 text-[9px] text-center p-1">
                        <FileText className="w-4 h-4 mb-0.5 opacity-60" />
                        <span>No image</span>
                      </div>
                    )}

                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-purple-400 uppercase block">
                        Payment Proof Receipt:
                      </span>
                      {hasImageProof ? (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveProofImage({
                              url: order.paymentProofUrl!,
                              title: `Order #${order.orderNumber || order.id} Proof - ${order.userName}`,
                            })
                          }
                          className="text-pink-400 hover:text-pink-300 font-bold text-xs flex items-center gap-1 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Fullscreen Screenshot</span>
                        </button>
                      ) : (
                        <p className="text-[11px] text-purple-300/80 font-mono truncate max-w-sm">
                          {order.paymentProofUrl || 'No digital receipt attached'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes / Reason display if rejected or approved */}
                  {(order.adminNotes || order.rejectionReason) && (
                    <div className="sm:max-w-xs text-right">
                      <span className="text-[10px] text-purple-400 uppercase font-bold block">
                        {isRejected ? 'Rejection Reason:' : 'Admin Notes:'}
                      </span>
                      <p className={`text-[11px] font-medium ${isRejected ? 'text-red-300' : 'text-purple-200'}`}>
                        {order.rejectionReason || order.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                {(isPending || isReview) && (
                  <div className="pt-2 border-t border-purple-500/20 flex flex-wrap items-center justify-end gap-2">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleMarkUnderReview(order.id)}
                        disabled={actionLoadingId === order.id}
                        className="py-2 px-3.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-xs font-bold text-blue-300 transition-colors"
                      >
                        Mark Under Review
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setRejectingOrder(order)}
                      disabled={actionLoadingId === order.id}
                      className="py-2 px-4 rounded-xl bg-red-950/70 hover:bg-red-900/70 border border-red-500/40 text-xs font-bold text-red-300 transition-colors"
                    >
                      Reject Payment
                    </button>

                    <button
                      type="button"
                      onClick={() => setApprovingOrder(order)}
                      disabled={actionLoadingId === order.id}
                      className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5 active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Activate {order.quantity} Hens</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= LIGHTBOX IMAGE MODAL ================= */}
      {activeProofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-3xl w-full bg-[#14082e] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl">
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
                alt="Payment Screenshot Fullscreen"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-purple-500/20"
              />
            </div>
            <div className="p-3 bg-[#110526] border-t border-purple-500/20 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveProofImage(null)}
                className="py-1.5 px-4 rounded-xl bg-purple-900/50 hover:bg-purple-900 text-xs font-bold text-white transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= APPROVAL CONFIRMATION MODAL ================= */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-[#14082e] border border-emerald-500/50 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 to-[#14082e] border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-black text-sm text-white">Approve Payment & Allocate Hens</h3>
              </div>
              <button
                type="button"
                onClick={() => setApprovingOrder(null)}
                className="w-7 h-7 rounded-full bg-purple-900/40 text-purple-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-purple-200">
                You are approving Order <strong className="text-white">#{approvingOrder.orderNumber || approvingOrder.id}</strong> for investor <strong className="text-amber-300">{approvingOrder.userName}</strong>.
              </p>

              <div className="p-3.5 bg-[#0d0422] rounded-2xl border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-purple-300">Hens to Activate:</span>
                  <span className="font-bold text-white">{approvingOrder.quantity} Hens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Daily Egg Yield:</span>
                  <span className="font-bold text-amber-400">+{approvingOrder.quantity} Eggs/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Cycle Duration:</span>
                  <span className="font-bold text-white">120 Days Guaranteed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Amount Verified:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {currency} {approvingOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-purple-300 block">
                  Admin Verification Notes (Optional):
                </label>
                <input
                  type="text"
                  value={adminApprovalNotes}
                  onChange={e => setAdminApprovalNotes(e.target.value)}
                  placeholder="e.g. Verified via UBL IBFT statement"
                  className="w-full bg-[#0d0422] border border-purple-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingOrder(null)}
                  className="py-2.5 px-4 rounded-xl bg-purple-950 border border-purple-500/30 font-bold text-purple-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveOrder}
                  disabled={actionLoadingId === approvingOrder.id}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {actionLoadingId === approvingOrder.id ? (
                    <span>Activating Cycle...</span>
                  ) : (
                    <span>Confirm & Activate Flock</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECTION MODAL WITH REASONS ================= */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-[#14082e] border border-red-500/50 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <div className="px-6 py-4 bg-gradient-to-r from-red-950 to-[#14082e] border-b border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-sm text-white">Reject Payment Proof</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="w-7 h-7 rounded-full bg-purple-900/40 text-purple-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-purple-200">
                Specify the reason why Order <strong className="text-white">#{rejectingOrder.orderNumber || rejectingOrder.id}</strong> could not be approved. This reason will be sent to the investor.
              </p>

              {/* Preset buttons */}
              <div className="space-y-1">
                <span className="text-[10px] text-purple-400 font-bold uppercase block">
                  Quick Select Reason:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {presetReasons.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className={`w-full p-2 text-left rounded-xl border text-[11px] transition-all leading-tight ${
                        rejectReason === preset
                          ? 'bg-red-950/70 border-red-500 text-white font-bold'
                          : 'bg-[#0d0422] border-purple-500/20 text-purple-300 hover:bg-[#190835]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom reason text */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-purple-300 block">
                  Custom Rejection Message:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full bg-[#0d0422] border border-purple-500/30 rounded-xl p-2.5 text-white outline-none focus:border-red-500 resize-none"
                  placeholder="Explain why payment was declined..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="py-2.5 px-4 rounded-xl bg-purple-950 border border-purple-500/30 font-bold text-purple-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectOrder}
                  disabled={actionLoadingId === rejectingOrder.id}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {actionLoadingId === rejectingOrder.id ? (
                    <span>Rejecting Order...</span>
                  ) : (
                    <span>Confirm Rejection</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
