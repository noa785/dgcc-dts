'use client';
// src/app/(protected)/dashboard/DashboardClient.tsx

import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
interface StatCardProps { label: string; value: number | string; sub?: string; color: string; icon: string; href?: string; }
interface StatusDist    { label: string; count: number; color: string; }
interface UnitDist      { code: string; count: number; color: string | null; }
interface ProjectHealth { name: string; rollup: number; health: 'RED' | 'AMBER' | 'GREEN'; taskCount: number; }
interface OrderRow      { id: string; orderCode: string; name: string; unitCode?: string; unitColor?: string; status: string; percentComplete: number; priority: string; dueDate?: string; isOverdue: boolean; }

interface Props {
  stats: {
    total: number; done: number; active: number; review: number;
    blocked: number; completionRate: number;
    govItems: number; openGovTasks: number; pendingChanges: number;
  };
  statusDist: StatusDist[];
  unitDist: UnitDist[];
  overdueOrders: OrderRow[];
  activeOrders: OrderRow[];
  projectHealth: ProjectHealth[];
  userName: string;
}

// ── Main ───────────────────────────────────────────────────────
export default function DashboardClient({ stats, statusDist, unitDist, overdueOrders, activeOrders, projectHealth, userName }: Props) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back, {userName.split(' ')[0]} — DGCC Enterprise Command Overview</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Total Orders"      value={stats.total}          sub={`${stats.completionRate}% completion rate`} color="#3b82f6" icon="📋" href="/orders" />
        <StatCard label="Completed"         value={stats.done}           sub={`${stats.total - stats.done} remaining`}    color="#10b981" icon="✅" href="/orders?status=DONE" />
        <StatCard label="In Progress"       value={stats.active}         sub={`${stats.review} under review`}             color="#60a5fa" icon="⚡" href="/orders?status=IN_PROGRESS" />
        <StatCard label="Overdue / At Risk" value={overdueOrders.length} sub={`${stats.blocked} blocked`}                 color="#ef4444" icon="🔴" href="/orders?overdue=1" />
      </div>

      {/* Governance quick stats */}
      <div className="grid grid-cols-3 gap-3.5">
        <StatCard label="Governance Items"  value={stats.govItems}       color="#8b5cf6" icon="🛡"  href="/governance" />
        <StatCard label="Open Gov. Tasks"   value={stats.openGovTasks}   color="#f59e0b" icon="✅"  href="/gov-tasks" />
        <StatCard label="Pending Gov. Review" value={stats.pendingChanges} color="#ef4444" icon="🔄" href="/changes" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Status bar chart */}
        <div className="pes-card p-5 lg:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">Orders by Status</div>
          <div className="flex items-end gap-2 h-[90px]">
            {statusDist.map(s => {
              const max = Math.max(...statusDist.map(x => x.count), 1);
              const h = Math.round((s.count / max) * 80);
              return (
                <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-400">{s.count}</span>
                  <div className="w-full rounded-t transition-all" style={{ height: `${Math.max(h, 2)}px`, background: s.color }} />
                  <span className="text-[9px] text-slate-600 text-center leading-tight">{s.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unit distribution */}
        <div className="pes-card p-5 lg:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">Active Units</div>
          <div className="space-y-2">
            {unitDist.map(u => {
              const max = unitDist[0]?.count || 1;
              const pct = Math.round((u.count / max) * 100);
              const color = u.color && u.color.length <= 9 ? u.color : '#3b82f6';
              return (
                <div key={u.code} className="flex items-center gap-2">
                  <a href={`/units/${u.code}`} className="text-[11px] text-slate-400 hover:text-blue-400 w-16 flex-shrink-0">{u.code}</a>
                  <div className="flex-1 h-1.5 bg-[#1c2540] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="text-[11px] text-slate-500 w-6 text-right">{u.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project health */}
        <div className="pes-card p-5 lg:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">Project Health</div>
          <div className="space-y-2.5">
            {projectHealth.map(p => {
              const hc = { RED: '#ef4444', AMBER: '#f59e0b', GREEN: '#10b981' }[p.health];
              return (
                <div key={p.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300 truncate max-w-[140px]">{p.name}</span>
                    <span className="font-semibold" style={{ color: hc }}>{p.rollup}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1c2540] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.rollup}%`, background: hc }} />
                  </div>
                </div>
              );
            })}
            {projectHealth.length === 0 && (
              <p className="text-slate-600 text-xs">No projects yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Overdue + Active lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="pes-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2d45]">
            <span className="font-display font-semibold text-[13.5px]">🔴 Overdue / At Risk</span>
            <Link href="/orders?overdue=1" className="text-[11px] text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div>
            {overdueOrders.length === 0
              ? <p className="px-5 py-4 text-slate-600 text-sm">✅ No overdue tasks</p>
              : overdueOrders.map(o => <OrderMiniRow key={o.id} order={o} />)
            }
          </div>
        </div>

        <div className="pes-card">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2d45]">
            <span className="font-display font-semibold text-[13.5px]">⚡ In Progress</span>
            <Link href="/orders?status=IN_PROGRESS" className="text-[11px] text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div>
            {activeOrders.length === 0
              ? <p className="px-5 py-4 text-slate-600 text-sm">No active tasks</p>
              : activeOrders.map(o => <OrderMiniRow key={o.id} order={o} />)
            }
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon, href }: StatCardProps) {
  const content = (
    <div
      className="pes-card p-4 cursor-pointer hover:border-[#263350] transition-colors relative overflow-hidden"
      style={{ borderTop: `2px solid ${color}` }}
    >
      <div className="text-[22px] mb-2">{icon}</div>
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</div>
      <div className="font-display font-black text-[28px] leading-none text-white">{value}</div>
      {sub && <div className="text-[11.5px] text-slate-500 mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : <>{content}</>;
}

function OrderMiniRow({ order }: { order: OrderRow }) {
  const prio = { CRITICAL: '#ef4444', HIGH: '#f87171', MEDIUM: '#f59e0b', LOW: '#6b7280' };
  const prioColor = prio[order.priority as keyof typeof prio] ?? '#6b7280';
  const color = order.unitColor && order.unitColor.length <= 9 ? order.unitColor : '#3b82f6';

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#1f2d45]/50 hover:bg-[#161d2e] transition-colors">
        {order.unitCode && (
          <span
            className="text-[10.5px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ borderLeft: `2px solid ${color}`, background: `${color}18`, color: color }}
          >
            {order.unitCode}
          </span>
        )}
        <span className="text-[12.5px] text-slate-200 flex-1 truncate">{order.name}</span>
        <div className="flex-shrink-0 w-[72px]">
          <div className="h-1.5 bg-[#1c2540] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${order.percentComplete}%`,
                background: order.percentComplete === 100 ? '#10b981' : order.percentComplete >= 70 ? '#3b82f6' : '#f59e0b',
              }}
            />
          </div>
          <div className="text-[10px] text-slate-600 text-right mt-0.5">{order.percentComplete}%</div>
        </div>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: prioColor }} />
      </div>
    </Link>
  );
}
