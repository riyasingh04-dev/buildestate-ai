import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected':
      case 'blocked':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'verified':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      getStyles()
    )}>
      {status.charAt(0)?.toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
