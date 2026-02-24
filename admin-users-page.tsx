// src/app/(protected)/admin/users/page.tsx
import { Metadata } from 'next';
import { requireAuth, can } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Users & Roles — DGCC PES' };

const ROLE_C: Record<string, string> = {
  SUPER_ADMIN: '#ef4444', ADMIN: '#f59e0b', GOVERNANCE_ADMIN: '#8b5cf6',
  UNIT_MANAGER: '#3b82f6', PROJECT_OWNER: '#06b6d4', EDITOR: '#10b981', VIEWER: '#6b7280',
};

export default async function UsersPage() {
  const user = await requireAuth();
  if (!can(user, 'admin:units')) redirect('/dashboard');

  const users = await prisma.user.findMany({
    include: {
      unit: { select: { code: true, name: true } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });

  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">👥 Users & Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} users ({activeCount} active)</p>
        </div>
      </div>

      <div className="pes-card overflow-hidden overflow-x-auto">
        <table className="w-full text-[13px] border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#1f2d45] bg-[#0d1424]">
              {['Name','Email','Role','Unit','Active','Last Login'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const rc = ROLE_C[u.role] ?? '#6b7280';
              return (
                <tr key={u.id} className={`border-b border-[#1f2d45]/50 hover:bg-[#161d2e] transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                        style={{ background: rc }}>
                        {u.initials || u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-slate-200 font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-400">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: `${rc}18`, color: rc }}>
                      {u.role.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-400">{u.unit?.code ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    {u.isActive ? (
                      <span className="text-[10.5px] text-green-400 font-semibold">● Active</span>
                    ) : (
                      <span className="text-[10.5px] text-slate-600 font-semibold">● Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[11.5px] text-slate-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'}) : 'Never'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
