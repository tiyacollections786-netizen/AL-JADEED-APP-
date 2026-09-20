import React, { useState, useEffect } from 'react';
import { Notification } from '../../types';
import { api } from '../../services/api';
import { Bell, CheckCheck, Clock, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 font-display">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Stay informed regarding daily harvest payouts, approvals, and order allocations.</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkOne(notif.id)}
              className={`p-4 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer ${
                notif.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-amber-50/70 border-amber-300/80 text-slate-900 shadow-xs'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                notif.type === 'earning' ? 'bg-emerald-100 text-emerald-700' :
                notif.type === 'order' ? 'bg-blue-100 text-blue-700' :
                notif.type === 'withdrawal' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
              </div>
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
