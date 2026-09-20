import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { api } from '../../services/api';
import {
  FileText,
  Search,
  RefreshCw,
  Filter,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const actionTypes = ['all', ...Array.from(new Set(logs.map(l => l.action)))];

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('APPROVE') || act.includes('SUCCESS') || act.includes('PROVISION')) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    }
    if (act.includes('REJECT') || act.includes('FAIL') || act.includes('DENIED')) {
      return 'bg-red-950/80 text-red-300 border-red-500/40';
    }
    if (act.includes('PRODUCTION') || act.includes('DISTRIBUTE')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    }
    return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-pink-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                System Audit Trail & Security Ledger
              </h1>
              <p className="text-xs text-purple-300">
                Immutable records of administrative actions, payment verifications, and system events
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-200 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, administrator, or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#14082e] border border-purple-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/50 focus:border-pink-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-purple-400 shrink-0 font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-[#14082e] border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:border-pink-500 outline-none"
          >
            {actionTypes.map(act => (
              <option key={act} value={act}>
                {act === 'all' ? 'All System Actions' : act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#12072b] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        {isLoading ? (
          <div className="py-16 text-center text-purple-400">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading encrypted audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-purple-400/70">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-purple-500/40" />
            <p className="text-sm font-bold">No Audit Log Entries Found</p>
            <p className="text-xs text-purple-400/60 mt-1">Actions performed by administrators will appear here in chronological order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#1c0c42] text-purple-300 font-bold uppercase tracking-wider text-[10px] border-b border-purple-500/20">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action Code</th>
                  <th className="py-3.5 px-4">Operator / Admin</th>
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Target Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 font-sans">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-purple-950/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-purple-300 whitespace-nowrap text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-PK', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>{log.adminName}</span>
                      </div>
                      <span className="text-[10px] text-purple-400/60 font-mono">ID: {log.adminId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-white text-xs max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-purple-300">
                      {log.targetId ? (
                        <span className="bg-[#1b0c3f] px-2 py-0.5 rounded border border-purple-500/30 text-pink-300">
                          {log.targetId}
                        </span>
                      ) : (
                        <span className="text-purple-500/50">—</span>
                      )}
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
