import React, { useState, useEffect } from 'react';
import { HenOwnership, User, Package } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Egg,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Plus,
  Search,
  X,
  ShieldCheck,
  Calendar,
  Layers,
  Clock,
} from 'lucide-react';

export const AdminHenOwnershipPage: React.FC = () => {
  const { settings } = useAuth();
  const [hens, setHens] = useState<HenOwnership[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Manual allocation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [manualQuantity, setManualQuantity] = useState(5);
  const [isAssigning, setIsAssigning] = useState(false);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadAll = async () => {
    try {
      const [hensData, custData, pkgsData] = await Promise.all([
        api.getAdminHens(),
        api.getAdminCustomers(),
        api.getPackages(),
      ]);
      setHens(hensData);
      setCustomers(custData);
      setPackages(pkgsData);
      if (custData[0]) setSelectedUserId(custData[0].id);
      if (pkgsData[0]) setSelectedPackageId(pkgsData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'paused' | 'completed') => {
    try {
      await api.updateAdminHenStatus(id, newStatus);
      setFeedback(`Ownership ${id} updated to ${newStatus}.`);
      setHens(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleManualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedPackageId) return;

    setIsAssigning(true);
    try {
      await api.createAdminHenAllocation({
        userId: selectedUserId,
        packageId: selectedPackageId,
        quantity: manualQuantity,
      });
      setIsModalOpen(false);
      setFeedback(`Successfully assigned ${manualQuantity} hens to customer.`);
      await loadAll();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to allocate hens');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredHens = hens.filter(h => {
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    const matchesSearch =
      (h.userName && h.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.ownershipId && h.ownershipId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.id && h.id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-amber-400">
              <Egg className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Flock & 120-Day Cycle Monitor
              </h1>
              <p className="text-xs text-purple-300">
                All assigned layer lots, day-by-day progress (Day X / 120), and status control
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Hen Allocation</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Cycle Ref, User Name, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#14082e] border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0d0422] border border-purple-500/25 rounded-xl self-start sm:self-auto">
          {['all', 'active', 'completed', 'paused'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all ${
                statusFilter === tab
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cycles Table */}
      {isLoading ? (
        <div className="p-12 text-center text-purple-300 text-xs">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading hen ownership cycles...</span>
        </div>
      ) : filteredHens.length === 0 ? (
        <div className="p-8 bg-[#14082e] border border-purple-500/30 rounded-3xl text-center text-xs text-purple-300/80">
          No hen ownership records found matching criteria.
        </div>
      ) : (
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.12)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#1a0a3d] text-purple-400 text-[10px] font-bold uppercase tracking-wider border-b border-purple-500/20">
                <tr>
                  <th className="py-3.5 px-4">Cycle Ref</th>
                  <th className="py-3.5 px-4">Investor Name</th>
                  <th className="py-3.5 px-4">Flock Size</th>
                  <th className="py-3.5 px-4">Daily Yield</th>
                  <th className="py-3.5 px-4">Cycle Progress (Day / 120)</th>
                  <th className="py-3.5 px-4">Eggs Earned</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/15 font-mono">
                {filteredHens.map(cycle => {
                  const percent = Math.min(100, Math.round((cycle.daysCompleted / 120) * 100));
                  const isCompleted = cycle.status === 'completed' || cycle.daysCompleted >= 120;

                  return (
                    <tr key={cycle.id} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-3.5 px-4 font-black text-amber-300">
                        {cycle.ownershipId || cycle.id}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white">
                        {cycle.userName || 'Investor'}
                      </td>
                      <td className="py-3.5 px-4">{cycle.numberOfHens} Hens</td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">
                        +{cycle.dailyEggs || cycle.numberOfHens} Eggs/d
                      </td>
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white font-bold">Day {cycle.daysCompleted} / 120</span>
                            <span className="text-purple-300">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-purple-950 rounded-full overflow-hidden border border-purple-500/30">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        {cycle.eggsEarned} Eggs
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                              : cycle.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          {isCompleted ? 'COMPLETED (120d)' : cycle.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          {cycle.status === 'active' && !isCompleted ? (
                            <button
                              onClick={() => handleUpdateStatus(cycle.id, 'paused')}
                              className="p-1.5 text-amber-400 hover:bg-purple-900/40 rounded-lg"
                              title="Pause Production"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          ) : cycle.status === 'paused' ? (
                            <button
                              onClick={() => handleUpdateStatus(cycle.id, 'active')}
                              className="p-1.5 text-emerald-400 hover:bg-purple-900/40 rounded-lg"
                              title="Resume Production"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          ) : null}

                          {!isCompleted && (
                            <button
                              onClick={() => handleUpdateStatus(cycle.id, 'completed')}
                              className="p-1.5 text-purple-400 hover:text-white hover:bg-purple-900/40 rounded-lg"
                              title="Conclude Cycle"
                            >
                              <CheckCircle className="w-4 h-4" />
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
        </div>
      )}

      {/* MANUAL ALLOCATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-white animate-fade-in">
          <div className="bg-[#14082e] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-bold text-base text-white">Manual Hen Allocation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAssign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">Select Customer</label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email || c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">Select Hen Package</label>
                <select
                  value={selectedPackageId}
                  onChange={e => setSelectedPackageId(e.target.value)}
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Rs. {p.pricePerHen} / Hen
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300 block mb-1">Number of Hens</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={manualQuantity}
                  onChange={e => setManualQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#0d0422] border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
                />
              </div>

              <div className="p-3 bg-[#0d0422] rounded-xl border border-purple-500/20 text-xs space-y-1">
                <div className="flex justify-between text-purple-300">
                  <span>Cycle Duration:</span>
                  <span className="text-white font-bold">120 Days</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Daily Harvest:</span>
                  <span className="text-amber-400 font-bold">+{manualQuantity} Eggs / day</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-[#1b0a3d] rounded-xl text-xs font-bold text-purple-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {isAssigning ? 'Allocating...' : 'Allocate Flock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
