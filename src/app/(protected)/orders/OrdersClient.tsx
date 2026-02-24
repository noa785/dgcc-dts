'use client';
// src/app/(protected)/orders/OrdersClient.tsx

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { StatusBadge, PriorityBadge, RAGDot, ProgressBar, EmptyState, Spinner } from '@/components/ui/badges';
import type { OrderStatus, Priority, RAGStatus } from '@/types';

// ── Types ──────────────────────────────────────────────────────
interface OrderRow {
  id: string; orderCode: string; type: string; name: string;
  unitCode: string | null; unitName: string | null; unitColor: string | null;
  projectName: string | null; ownerName: string | null;
  priority: string; status: string;
  startDate: string | null; dueDate: string | null;
  percentComplete: number; rescheduleCount: number;
  createdAt: string; updatedAt: string;
  effectiveRAG: RAGStatus; isOverdue: boolean;
}

interface Props {
  orders: OrderRow[];
  total: number; page: number; pageSize: number;
  units: { id: string; code: string; name: string }[];
  projects: { id: string; code: string; name: string }[];
}

type SortKey = 'orderCode' | 'name' | 'status' | 'priority' | 'percentComplete' | 'dueDate' | 'unitCode';

// ── Component ──────────────────────────────────────────────────
export default function OrdersClient({ orders, total, page, pageSize, units, projects }: Props) {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local filter state (filters beyond URL params)
  const [search, setSearch]     = useState('');
  const [sortKey, setSortKey]   = useState<SortKey>('updatedAt' as any);
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filter + sort locally
  const visible = useMemo(() => {
    let rows = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.orderCode.toLowerCase().includes(q) ||
        (o.ownerName ?? '').toLowerCase().includes(q) ||
        (o.unitCode ?? '').toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      const av = String((a as any)[sortKey] ?? '');
      const bv = String((b as any)[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [orders, search, sortKey, sortDir]);

  function setURLParam(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  }

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    setSelected(s => s.size === visible.length ? new Set() : new Set(visible.map(o => o.id)));
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">All Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total • {visible.length} shown</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button className="pes-btn-ghost text-xs">
              Bulk Edit ({selected.size})
            </button>
          )}
          <Link href="/orders/grid">
            <button className="pes-btn-ghost text-xs">⚡ Grid Editor</button>
          </Link>
          <Link href="/orders/new">
            <button className="pes-btn-primary text-xs">+ New Order</button>
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="pes-card px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, code, owner, unit…"
            className="pes-input pl-7 py-1.5 text-[13px] w-full"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">🔍</span>
        </div>

        {/* Status filter */}
        <select
          value={searchParams.get('status') ?? ''}
          onChange={e => setURLParam('status', e.target.value || null)}
          className="pes-input py-1.5 text-[13px] w-[145px]"
        >
          <option value="">All Statuses</option>
          {(['NOT_STARTED','IN_PROGRESS','UNDER_REVIEW','BLOCKED','ON_HOLD','DONE','CANCELLED'] as OrderStatus[]).map(s => (
            <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={searchParams.get('priority') ?? ''}
          onChange={e => setURLParam('priority', e.target.value || null)}
          className="pes-input py-1.5 text-[13px] w-[130px]"
        >
          <option value="">All Priorities</option>
          {(['LOW','MEDIUM','HIGH','CRITICAL'] as Priority[]).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Unit filter */}
        <select
          value={searchParams.get('unit') ?? ''}
          onChange={e => setURLParam('unit', e.target.value || null)}
          className="pes-input py-1.5 text-[13px] w-[130px]"
        >
          <option value="">All Units</option>
          {units.map(u => <option key={u.id} value={u.code}>{u.code}</option>)}
        </select>

        {/* Clear filters */}
        {(searchParams.get('status') || searchParams.get('priority') || searchParams.get('unit') || search) && (
          <button
            onClick={() => { setSearch(''); setURLParam('status', null); setURLParam('priority', null); setURLParam('unit', null); }}
            className="text-[12px] text-slate-500 hover:text-red-400 transition-colors"
          >
            ✕ Clear
          </button>
        )}

        {isPending && <Spinner size={14} />}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="pes-card px-4 py-2 flex items-center gap-3 border-blue-500/20 bg-blue-500/5">
          <span className="text-[12.5px] text-blue-300 font-medium">{selected.size} selected</span>
          <select className="pes-input py-1 text-[12px] w-[140px]">
            <option>Change Status…</option>
            {(['NOT_STARTED','IN_PROGRESS','DONE','CANCELLED'] as OrderStatus[]).map(s => (
              <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
            ))}
          </select>
          <button className="pes-btn-ghost text-xs py-1">Apply</button>
          <button className="pes-btn-ghost text-xs py-1 text-red-400 hover:text-red-300">🗑 Delete</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-500 text-xs hover:text-slate-300">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="pes-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[#1f2d45]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === visible.length && visible.length > 0}
                    onChange={toggleAll}
                    className="accent-blue-500 cursor-pointer"
                  />
                </th>
                <Th label="ID"       sKey="orderCode"       current={sortKey} dir={sortDir} onSort={sort} />
                <Th label="Name"     sKey="name"            current={sortKey} dir={sortDir} onSort={sort} />
                <Th label="Unit"     sKey="unitCode"        current={sortKey} dir={sortDir} onSort={sort} />
                <Th label="Status"   sKey="status"          current={sortKey} dir={sortDir} onSort={sort} />
                <Th label="Priority" sKey="priority"        current={sortKey} dir={sortDir} onSort={sort} />
                <Th label="Progress" sKey="percentComplete" current={sortKey} dir={sortDir} onSort={sort} />
                <Th label="RAG"      sKey="status"          current={sortKey} dir={sortDir} onSort={sort} />
                <Th label="Due"      sKey="dueDate"         current={sortKey} dir={sortDir} onSort={sort} />
                <th className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Owner</th>
                <th className="w-10 px-2" />
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-0">
                    <EmptyState icon="📋" title="No orders found" sub="Adjust filters or create a new order" />
                  </td>
                </tr>
              ) : (
                visible.map(o => (
                  <OrderTableRow
                    key={o.id}
                    order={o}
                    checked={selected.has(o.id)}
                    onCheck={() => toggleSelect(o.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[#1f2d45] flex items-center justify-between">
            <span className="text-[12px] text-slate-500">
              Page {page} of {totalPages} — {total} records
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setURLParam('page', String(p))}
                  className={`
                    w-7 h-7 rounded text-[12px] transition-colors
                    ${p === page ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-[#161d2e]'}
                  `}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function Th({ label, sKey, current, dir, onSort }: {
  label: string; sKey: SortKey;
  current: SortKey; dir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
}) {
  const active = current === sKey;
  return (
    <th
      className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-300 transition-colors whitespace-nowrap"
      onClick={() => onSort(sKey)}
    >
      {label} {active ? (dir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );
}

function OrderTableRow({
  order, checked, onCheck,
}: { order: OrderRow; checked: boolean; onCheck: () => void }) {
  const color = order.unitColor && order.unitColor.length <= 9 ? order.unitColor : '#3b82f6';

  const dueStr = order.dueDate
    ? new Date(order.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
    : '—';

  return (
    <tr className={`border-b border-[#1f2d45]/50 hover:bg-[#161d2e]/60 transition-colors ${order.isOverdue ? 'bg-red-500/3' : ''}`}>
      {/* Checkbox */}
      <td className="w-10 px-4 py-2.5">
        <input type="checkbox" checked={checked} onChange={onCheck} className="accent-blue-500 cursor-pointer" />
      </td>

      {/* Code */}
      <td className="px-4 py-2.5 whitespace-nowrap">
        <Link href={`/orders/${order.id}`} className="font-display text-[12px] text-blue-400 hover:text-blue-300 font-semibold">
          {order.orderCode}
        </Link>
      </td>

      {/* Name */}
      <td className="px-4 py-2.5 max-w-[280px]">
        <Link href={`/orders/${order.id}`} className="text-slate-200 hover:text-white transition-colors line-clamp-1">
          {order.name}
        </Link>
        {order.projectName && (
          <div className="text-[11px] text-slate-600 truncate">{order.projectName}</div>
        )}
      </td>

      {/* Unit */}
      <td className="px-4 py-2.5">
        {order.unitCode ? (
          <span
            className="text-[10.5px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
            style={{ borderLeft: `2px solid ${color}`, background: `${color}18`, color }}
          >
            {order.unitCode}
          </span>
        ) : '—'}
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <StatusBadge status={order.status as any} />
      </td>

      {/* Priority */}
      <td className="px-4 py-2.5">
        <PriorityBadge priority={order.priority as any} />
      </td>

      {/* Progress */}
      <td className="px-4 py-2.5 w-[90px]">
        <div className="space-y-1">
          <ProgressBar value={order.percentComplete} size="sm" />
          <div className="text-[10.5px] text-slate-500 text-right">{order.percentComplete}%</div>
        </div>
      </td>

      {/* RAG */}
      <td className="px-4 py-2.5">
        <RAGDot rag={order.effectiveRAG} showLabel />
      </td>

      {/* Due */}
      <td className={`px-4 py-2.5 whitespace-nowrap text-[12.5px] ${order.isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
        {order.isOverdue && <span className="mr-1">⚠</span>}
        {dueStr}
      </td>

      {/* Owner */}
      <td className="px-4 py-2.5 text-[12.5px] text-slate-400 whitespace-nowrap">
        {order.ownerName ?? '—'}
      </td>

      {/* Actions */}
      <td className="px-2 py-2.5">
        <Link href={`/orders/${order.id}`}>
          <button className="w-7 h-7 rounded text-slate-500 hover:bg-[#1c2540] hover:text-blue-400 transition-colors text-[13px]">
            →
          </button>
        </Link>
      </td>
    </tr>
  );
}
