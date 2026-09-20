import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = status.charAt(0).toUpperCase() + status.slice(1);

  if (['approved', 'active', 'paid', 'completed', 'credited'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
    if (normalized === 'active') label = 'Active';
    if (normalized === 'approved') label = 'Approved';
    if (normalized === 'paid') label = 'Paid Out';
    if (normalized === 'credited') label = 'Credited';
  } else if (['pending', 'verified', 'processing'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500 animate-pulse';
    if (normalized === 'pending') label = 'Pending';
    if (normalized === 'verified') label = 'Payment Verified';
  } else if (['rejected', 'cancelled', 'suspended', 'inactive'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
    if (normalized === 'rejected') label = 'Rejected';
    if (normalized === 'cancelled') label = 'Cancelled';
  } else if (['paused'].includes(normalized)) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    dotColor = 'bg-indigo-500';
    label = 'Paused';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
