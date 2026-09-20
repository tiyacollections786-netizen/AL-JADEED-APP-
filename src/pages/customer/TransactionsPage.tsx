import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { History, ArrowDownToLine, TrendingUp, ShoppingCart, Filter, Egg } from 'lucide-react';

interface TransactionsPageProps {
  onNavigate?: (view: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = () => {
  const { settings } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const currency = settings?.currencySymbol || 'Rs.';

  useEffect(() => {
    api.getMyTransactions().then(data => {
      setTransactions(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const filtered = typeFilter === 'all'
    ? transactions
    : transactions.filter(t => t.type === typeFilter);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-5 space-y-6 text-white pb-24 lg:pb-12">
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Financial Transaction Ledger
              </h1>
              <p className="text-xs text-purple-300">
                Transparent records of egg sales, hen purchases, referral bonuses, and cash withdrawals
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0e0424] border border-purple-500/30 rounded-xl self-start sm:self-auto">
          {['all', 'egg_sale', 'purchase', 'withdrawal'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                typeFilter === t
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              {t === 'egg_sale' ? 'Egg Sales' : t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-purple-300">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading ledger records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 bg-[#14082e] border border-purple-500/30 rounded-3xl text-center text-xs text-purple-300/80">
          No transactions recorded matching filter.
        </div>
      ) : (
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.12)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#1a0a3d] text-purple-400 text-[10px] font-bold uppercase tracking-wider border-b border-purple-500/20">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/15">
                {filtered.map(tx => {
                  const isCredit = tx.type === 'earning' || tx.type === 'egg_sale' || tx.type === 'referral_bonus';
                  return (
                    <tr key={tx.id} className="hover:bg-purple-900/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-purple-300">{tx.id}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-bold text-white">
                          {tx.type === 'egg_sale' ? 'Egg Sale' : tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-purple-300">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-purple-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-pink-400'}>
                          {isCredit ? '+' : '-'} {currency} {tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
