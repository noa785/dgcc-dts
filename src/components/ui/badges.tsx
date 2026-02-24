// src/components/ui/badges.tsx
'use client';

import type { OrderStatus, Priority, RAGStatus } from '@/types';

// ── Status Badge ───────────────────────────────────────────────
const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  NOT_STARTED:  { bg: '#1c2540', text: '#6b7280', label: 'Not Started' },
  IN_PROGRESS:  { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', label: 'In Progress' },
  UNDER_REVIEW: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'Under Review' },
  BLOCKED:      { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', label: 'Blocked' },
  ON_HOLD:      { bg: 'rgba(107,114,128,0.12)',text: '#9ca3af', label: 'On Hold' },
  DONE:         { bg: 'rgba(16,185,129,0.12)', text: '#10b981', label: 'Done' },
  CANCELLED:    { bg: 'rgba(107,114,128,0.08)',text: '#6b7280', label: 'Cancelled' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.NOT_STARTED;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

// ── Priority Badge ─────────────────────────────────────────────
const PRIORITY_STYLES: Record<Priority, { dot: string; text: string }> = {
  LOW:      { dot: '#6b7280', text: '#9ca3af' },
  MEDIUM:   { dot: '#f59e0b', text: '#fbbf24' },
  HIGH:     { dot: '#f87171', text: '#f87171' },
  CRITICAL: { dot: '#ef4444', text: '#ef4444' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIORITY_STYLES[priority];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

// ── RAG Dot ────────────────────────────────────────────────────
const RAG_COLORS: Record<RAGStatus, { color: string; label: string }> = {
  RED:   { color: '#ef4444', label: 'Red'   },
  AMBER: { color: '#f59e0b', label: 'Amber' },
  GREEN: { color: '#10b981', label: 'Green' },
  BLUE:  { color: '#3b82f6', label: 'Blue'  },
  GREY:  { color: '#6b7280', label: 'Grey'  },
};

export function RAGDot({ rag, showLabel = false }: { rag: RAGStatus; showLabel?: boolean }) {
  const { color, label } = RAG_COLORS[rag] ?? RAG_COLORS.GREY;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
      />
      {showLabel && <span className="text-[11px]" style={{ color }}>{label}</span>}
    </span>
  );
}

// ── Progress Bar ───────────────────────────────────────────────
export function ProgressBar({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-1' : 'h-1.5';
  const color =
    value === 100 ? '#10b981' :
    value >= 70   ? '#3b82f6' :
    value >= 40   ? '#f59e0b' :
                    '#6b7280';
  return (
    <div className={`w-full ${h} bg-[#1c2540] rounded-full overflow-hidden`}>
      <div
        className={`${h} rounded-full transition-all duration-300`}
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin"
      style={{ color: '#3b82f6' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ icon, title, sub, action }: {
  icon: string; title: string; sub?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-3 opacity-50">{icon}</div>
      <div className="font-display font-bold text-[15px] text-slate-300 mb-1">{title}</div>
      {sub && <div className="text-sm text-slate-600 max-w-sm">{sub}</div>}
      {action && (
        <button onClick={action.onClick} className="pes-btn-primary mt-4 text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}
