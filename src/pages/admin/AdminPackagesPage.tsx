import React, { useState, useEffect } from 'react';
import { Package } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  PackageCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Egg,
  Calendar,
  X,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminPackagesPage: React.FC = () => {
  const { settings } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPkg, setEditingPkg] = useState<Partial<Package> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadPackages = async () => {
    try {
      const data = await api.getPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPkg({
      name: '',
      breed: 'White Leghorn',
      pricePerHen: 3200,
      dailyReturnPerHen: 48,
      durationDays: 365,
      minQuantity: 1,
      maxQuantity: 50,
      availableQuantity: 500,
      description: 'Commercial layer flock with verified daily egg dividends.',
      benefits: [
        'Automated Biosecurity Vaccinations',
        'Daily Egg Harvest Revenue',
        '100% Replacement Insurance',
        'Zero Care or Labor Surcharges',
      ],
      image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPkg({ ...pkg });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg?.name || !editingPkg.pricePerHen || !editingPkg.dailyReturnPerHen) return;

    setIsSaving(true);
    try {
      if (editingPkg.id) {
        await api.updatePackage(editingPkg.id, editingPkg);
        setFeedback('Package updated successfully!');
      } else {
        await api.createPackage(editingPkg);
        setFeedback('New hen package created successfully!');
      }
      setIsModalOpen(false);
      await loadPackages();
    } catch (err: any) {
      alert(`Failed to save package: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (pkgId: string) => {
    if (!confirm('Are you sure you want to deactivate/delete this package?')) return;
    try {
      await api.deletePackage(pkgId);
      setFeedback('Package removed successfully.');
      await loadPackages();
    } catch (err: any) {
      alert(`Failed to delete package: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display">
            Hen Package Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure layer breeds, pricing per hen, daily return rates, duration, and stock allocation.
          </p>
        </div>

        <button
          type="button"
          id="admin-create-package-btn"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  {pkg.breed}
                </span>
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                  pkg.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-extrabold text-base text-slate-900">{pkg.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{pkg.description}</p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Price / Hen</span>
                    <span className="font-extrabold text-slate-900">{currency} {pkg.pricePerHen}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 block uppercase">Daily Return / Hen</span>
                    <span className="font-extrabold text-emerald-700">+{currency} {pkg.dailyReturnPerHen}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                    <span className="font-bold text-slate-800">{pkg.durationDays} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Stock Remaining</span>
                    <span className="font-bold text-slate-800">{pkg.availableQuantity} Hens</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(pkg)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pkg.id)}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / CREATE MODAL */}
      {isModalOpen && editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                {editingPkg.id ? 'Edit Hen Package' : 'Create New Hen Package'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={editingPkg.name || ''}
                    onChange={e => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Breed</label>
                  <input
                    type="text"
                    required
                    value={editingPkg.breed || ''}
                    onChange={e => setEditingPkg({ ...editingPkg, breed: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price Per Hen ({currency})</label>
                  <input
                    type="number"
                    required
                    value={editingPkg.pricePerHen || 0}
                    onChange={e => setEditingPkg({ ...editingPkg, pricePerHen: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Daily Return / Hen ({currency})</label>
                  <input
                    type="number"
                    required
                    value={editingPkg.dailyReturnPerHen || 0}
                    onChange={e => setEditingPkg({ ...editingPkg, dailyReturnPerHen: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={editingPkg.durationDays || 365}
                    onChange={e => setEditingPkg({ ...editingPkg, durationDays: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Min Qty</label>
                  <input
                    type="number"
                    required
                    value={editingPkg.minQuantity || 1}
                    onChange={e => setEditingPkg({ ...editingPkg, minQuantity: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={editingPkg.availableQuantity || 100}
                    onChange={e => setEditingPkg({ ...editingPkg, availableQuantity: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingPkg.image || ''}
                  onChange={e => setEditingPkg({ ...editingPkg, image: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPkg.description || ''}
                  onChange={e => setEditingPkg({ ...editingPkg, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pkg-active-checkbox"
                  checked={editingPkg.isActive !== false}
                  onChange={e => setEditingPkg({ ...editingPkg, isActive: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="pkg-active-checkbox" className="text-xs font-semibold text-slate-700">
                  Active (Display in public marketplace)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-2/3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
