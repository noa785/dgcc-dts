// src/components/layout/AppShell.tsx
// Main authenticated shell: sidebar + topbar + content
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { AuthUser } from '@/types';
import { can } from '@/lib/auth/permissions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import { useRouter } from 'next/navigation';

// ── Nav structure ──────────────────────────────────────────────
const NAV = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard',     icon: '◻',  label: 'Dashboard' },
    ],
  },
  {
    group: 'Core Tracker',
    items: [
      { href: '/orders',        icon: '📋', label: 'All Orders' },
      { href: '/orders/grid',   icon: '⚡', label: 'Grid Editor',  badge: 'LIVE' },
      { href: '/projects',      icon: '📂', label: 'Projects' },
    ],
  },
  {
    group: 'Governance',
    items: [
      { href: '/governance',        icon: '🛡',  label: 'Gov. Registry' },
      { href: '/governance/review',  icon: '🏛',  label: 'Review Dashboard', perm: 'governance:view' as const },
      { href: '/gov-tasks',          icon: '✅',  label: 'Gov. Tasks' },
      { href: '/changes',            icon: '🔄',  label: 'Change Control' },
    ],
  },
  {
    group: 'Reports',
    items: [
      { href: '/weekly-briefs', icon: '📰', label: 'Weekly Briefs' },
      { href: '/analytics',     icon: '📈', label: 'Analytics' },
      { href: '/audit-log',     icon: '🕵', label: 'Audit Log',    perm: 'audit:view' as const },
      { href: '/reports', icon: '📋', label: 'Reports Center' },
    ],
  },
  {
    group: 'Admin',
    items: [
      { href: '/units',         icon: '🏢', label: 'Units',        perm: 'admin:units' as const },
      { href: '/admin/users',   icon: '👥', label: 'Users & Roles', perm: 'admin:users' as const },
      { href: '/admin/lookups', icon: '🗂',  label: 'Lookup Tables', perm: 'admin:lookups' as const },
      { href: '/import-export', icon: '↕',  label: 'Import / Export', perm: 'import:execute' as const },
    ],
  },
];

// ── Role color map ─────────────────────────────────────────────
const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN:      'text-red-400',
  ADMIN:            'text-amber-400',
  GOVERNANCE_ADMIN: 'text-purple-400',
  UNIT_MANAGER:     'text-blue-400',
  PROJECT_OWNER:    'text-cyan-400',
  EDITOR:           'text-green-400',
  VIEWER:           'text-slate-400',
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:      'Super Admin',
  ADMIN:            'Admin',
  GOVERNANCE_ADMIN: 'Gov. Admin',
  UNIT_MANAGER:     'Unit Manager',
  PROJECT_OWNER:    'Project Owner',
  EDITOR:           'Editor',
  VIEWER:           'Viewer',
};

// ── Component ──────────────────────────────────────────────────
export default function AppShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  const initials = user.initials ?? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#080b10]">

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-50
          flex flex-col
          bg-[#111620] border-r border-[#1f2d45]
          transition-all duration-200
          ${sidebarOpen ? 'w-[248px]' : 'w-[52px]'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#1f2d45] min-h-[58px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-display font-black text-white text-xs flex-shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.3)]">
            DG
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-display font-bold text-[13px] text-white whitespace-nowrap">DGCC Enterprise</div>
              <div className="text-[10px] text-slate-500 tracking-wide uppercase">PES v1.0</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 p-0.5"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '◁' : '▷'}
          </button>
        </div>

        {/* User chip */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#1f2d45]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-white truncate">{user.name}</div>
              <div className={`text-[10px] font-semibold truncate ${ROLE_COLOR[user.role] ?? 'text-slate-400'}`}>
                {ROLE_LABEL[user.role] ?? user.role}
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV.map(group => (
            <div key={group.group} className="mb-2">
              {sidebarOpen && (
                <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-600 px-2 py-1.5">
                  {group.group}
                </div>
              )}
              {group.items.map(item => {
                // Permission guard
                if (item.perm && !can(user, item.perm)) return null;

                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px]
                      transition-all duration-100 mb-0.5 relative group
                      ${isActive
                        ? 'bg-blue-500/12 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-[#161d2e] hover:text-slate-200'
                      }
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <span className="text-[14px] flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 truncate font-[450]">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {/* Tooltip when collapsed */}
                    {!sidebarOpen && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-[#1c2540] text-slate-200 text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-[#263350] z-50">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-[#1f2d45]">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg
              text-[13px] text-slate-500 hover:text-red-400 hover:bg-red-500/8
              transition-all
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
            title={!sidebarOpen ? 'Sign Out' : undefined}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-200
          ${sidebarOpen ? 'ml-[248px]' : 'ml-[52px]'}
        `}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-40 h-[58px] bg-[#080b10]/90 backdrop-blur-md border-b border-[#1f2d45] flex items-center px-6 gap-4">
          <Breadcrumb pathname={pathname} />
          <div className="flex-1" />
          <GlobalSearch />
            <NotificationBell />
          <Link href="/orders/new">
            <button className="pes-btn-primary text-xs py-1.5 px-3">+ New Order</button>
          </Link>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function Breadcrumb({ pathname }: { pathname: string }) {
  const LABELS: Record<string, string> = {
    '/dashboard':     'Dashboard',
    '/orders':        'All Orders',
    '/orders/grid':   'Grid Editor',
    '/projects':      'Projects',
    '/governance':    'Governance Registry',
    '/gov-tasks':     'Governance Tasks',
    '/changes':       'Change Control',
    '/weekly-briefs': 'Weekly Briefs',
    '/analytics':     'Analytics',
    '/audit-log':     'Audit Log',
    '/units':         'Units',
    '/admin/users':   'Users & Roles',
    '/admin/lookups': 'Lookup Tables',
    '/import-export': 'Import / Export',
  };

  const current = LABELS[pathname] ?? pathname.split('/').pop() ?? 'Page';

  return (
    <div className="flex items-center gap-2 text-[13px] text-slate-400 min-w-0">
      <span className="text-slate-600">DGCC</span>
      <span className="text-slate-700">›</span>
      <span className="text-white font-medium truncate">{current}</span>
    </div>
  );
}

function GlobalSearch() {
  return (
    <div className="relative hidden md:block">
      <input
        type="text"
        placeholder="Search orders, tasks, units…"
        className="pes-input w-[240px] pl-8 py-1.5 text-xs"
      />
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
        🔍
      </span>
    </div>
  );
}
