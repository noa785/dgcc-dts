import { Metadata } from 'next';
import { requireAuth, can } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Units - DGCC PES' };
export default async function UnitsPage() {
  const user = await requireAuth();
  if (!can(user, 'admin:units')) redirect('/dashboard');
  const units = await prisma.unit.findMany({
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { code: 'asc' },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Units</h1>
        <p className="text-sm text-slate-500 mt-0.5">{units.length} units</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {units.map(u => (
          <Link key={u.id} href={'/units/' + u.code}>
            <div className="pes-card p-4 hover:border-slate-600 transition group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: u.colorHex || '#3b82f6' }} />
                <span className="font-mono text-[13px] font-bold" style={{ color: u.colorHex || '#3b82f6' }}>{u.code}</span>
              </div>
              <h3 className="text-white text-[13px] font-medium mb-2 line-clamp-2">{u.name}</h3>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-[#1f2d45]/50">
                {u._count.orders} orders
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}