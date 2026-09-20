import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Building2,
  Phone,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface LocationItem {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  phone: string;
  timings: string;
  status: string;
}

export const AdminLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New location form
  const [name, setName] = useState('');
  const [type, setType] = useState('farm');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('+92 300 8476546');
  const [timings, setTimings] = useState('Mon - Sat: 08:00 AM - 05:00 PM');

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminLocations();
      setLocations(data || []);
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !city.trim()) {
      alert('Please fill name, address, and city.');
      return;
    }

    try {
      await api.createAdminLocation({
        name,
        type,
        address,
        city,
        phone,
        timings,
        status: 'active',
      });
      setFeedback('Location successfully added to system.');
      setIsAdding(false);
      setName('');
      setAddress('');
      setCity('');
      await loadLocations();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Failed to add location: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, locName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${locName}?`)) return;
    try {
      await api.deleteAdminLocation(id);
      setFeedback('Location removed.');
      await loadLocations();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Failed to delete location: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-pink-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Farm & Aviary Operations Facilities
              </h1>
              <p className="text-xs text-purple-300">
                Manage physical breeding farms, automated layer sheds, and regional distribution hubs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => (
          <div
            key={loc.id}
            className="bg-[#12072b] border border-purple-500/30 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] space-y-3 relative group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{loc.name}</h3>
                  <span className="text-[10px] text-pink-400 uppercase font-mono font-bold">
                    {loc.type === 'farm' ? 'Poultry Farm & Sheds' : 'Grading & Hub'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(loc.id, loc.name)}
                className="p-1.5 text-purple-400/60 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
                title="Delete Location"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-purple-300/80 pt-2 border-t border-purple-500/10">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  {loc.address}, {loc.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-mono">{loc.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-[11px]">{loc.timings}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14082e] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative text-white space-y-4">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white p-1 rounded-lg bg-purple-900/40"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-pink-400" />
              Add Aviary / Distribution Facility
            </h2>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-300 font-bold mb-1">Facility Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Al Jadeed Layer Aviary #3"
                  className="w-full bg-[#1c0c42] border border-purple-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Facility Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full bg-[#1c0c42] border border-purple-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-pink-500"
                >
                  <option value="farm">Production Farm / Layer Sheds</option>
                  <option value="center">Grading & Distribution Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Kasur, Sheikhupura, Lahore"
                  className="w-full bg-[#1c0c42] border border-purple-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Street / Farm Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Ferozepur Road Poultry Sector"
                  className="w-full bg-[#1c0c42] border border-purple-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#1c0c42] border border-purple-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-purple-900/50 text-purple-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
