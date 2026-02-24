// src/app/(protected)/weekly-briefs/page.tsx
import { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Weekly Briefs — DGCC PES' };

const STATUS_C: Record<string, string> = {
  DRAFT: '#6b7280', UNDER_REVIEW: '#f59e0b', APPROVED: '#3b82f6',
  PUBLISHED: '#10b981', ARCHIVED: '#374151',
};

export default async function WeeklyBriefsPage() {
  await requireAuth();

  const briefs = await prisma.weeklyBrief.findMany({
    where: { isDeleted: false },
    include: {
      unit: { select: { code: true, name: true, colorHex: true } },
      preparedBy: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">📰 Weekly Briefs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{briefs.length} brief{briefs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {briefs.length === 0 ? (
        <div className="pes-card p-16 text-center">
          <div className="text-5xl mb-4 opacity-20">📰</div>
          <div className="text-lg text-slate-500 mb-2">No weekly briefs yet</div>
          <p className="text-sm text-slate-600">Weekly briefs will appear here once created.</p>
        </div>
      ) : (
        <div className="pes-card overflow-hidden overflow-x-auto">
          <table className="w-full text-[13px] border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#1f2d45] bg-[#0d1424]">
                {['Code','Title','Unit','Status','Week','Prepared By','Reviewed By','Published'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {briefs.map(b => {
                const sc = STATUS_C[b.status] ?? '#6b7280';
                return (
                  <tr key={b.id} className="border-b border-[#1f2d45]/50 hover:bg-[#161d2e] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11.5px] text-blue-400 font-semibold">{b.briefCode}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-200 max-w-[250px] truncate">{b.title}</td>
                    <td className="px-4 py-2.5">
                      {b.unit ? (
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded"
                          style={{ background: b.unit.colorHex ? `${b.unit.colorHex}20` : '#3b82f620', color: b.unit.colorHex || '#3b82f6' }}>
                          {b.unit.code}
                        </span>
                      ) : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: `${sc}18`, color: sc }}>
                        {b.status.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[11.5px] text-slate-400">
                      {b.weekStart && b.weekEnd
                        ? `${new Date(b.weekStart).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})} – ${new Date(b.weekEnd).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-400">{b.preparedBy?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-400">{b.reviewedBy?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-[11.5px] text-slate-500">
                      {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'}) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
