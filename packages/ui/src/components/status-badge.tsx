'use client';

import type { ReactNode } from 'react';

interface StatusBadgeProps {
  status: string;
  children?: ReactNode;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  enabled: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  draft: { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
  maintenance: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  deprecated: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  suspended: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  blocked: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  disabled: { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
  invited: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
};

const defaultColor = { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' };

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const colors = statusColors[status] ?? defaultColor;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {children ?? status}
    </span>
  );
}
