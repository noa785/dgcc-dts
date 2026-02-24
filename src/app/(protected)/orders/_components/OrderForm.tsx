'use client';
// src/app/(protected)/orders/_components/OrderForm.tsx
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  OrderFormSchema, DescriptionFormSchema,
  ORDER_FORM_DEFAULTS,
  type OrderFormValues, type DescriptionFormValues,
} from '@/lib/validation/order.schemas';
import {
  TextInput, TextArea, Select, DateInput, PercentSlider,
} from '@/components/ui/form-fields';

const TYPE_OPTS = [
  { value: 'PROGRAM', label: 'Program' }, { value: 'PROJECT', label: 'Project' },
  { value: 'DELIVERABLE', label: 'Deliverable' }, { value: 'TASK', label: 'Task' },
  { value: 'SUBTASK', label: 'Subtask' },
];
const STATUS_OPTS = [
  { value: 'NOT_STARTED', label: 'Not Started' }, { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'UNDER_REVIEW', label: 'Under Review' }, { value: 'BLOCKED', label: 'Blocked' },
  { value: 'ON_HOLD', label: 'On Hold' }, { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];
const PRIORITY_OPTS = [
  { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }, { value: 'CRITICAL', label: 'Critical' },
];
const RAG_OPTS = [
  { value: '', label: '— Auto (no override)' }, { value: 'RED', label: '🔴 Red — At Risk' },
  { value: 'AMBER', label: '🟡 Amber — Watch' }, { value: 'GREEN', label: '🟢 Green — On Track' },
  { value: 'BLUE', label: '🔵 Blue — On Hold' }, { value: 'GREY', label: '⚫ Grey — Done/Cancelled' },
];

type FormTab = 'core' | 'dates' | 'description' | 'links';
const TABS: { id: FormTab; label: string; icon: string }[] = [
  { id: 'core', label: 'Core Details', icon: '📋' },
  { id: 'dates', label: 'Dates & Status', icon: '📅' },
  { id: 'description', label: 'Description', icon: '📝' },
  { id: 'links', label: 'Links & Notes', icon: '🔗' },
];

interface SelectOpt { id: string; label: string; }
interface Props {
  mode: 'create' | 'edit';
  orderId?: string; orderCode?: string;
  initialValues?: Partial<OrderFormValues>;
  initialDescription?: Partial<DescriptionFormValues>;
  units: SelectOpt[]; projects: SelectOpt[]; users: SelectOpt[];
  defaultTab?: FormTab;
}

const DESC_DEFAULTS: DescriptionFormValues = {
  objective: '', scope: '', rationale: '', governanceImpact: '',
  affectedUnit: '', relatedPolicies: '', requiredEvidence: '', risks: '',
};

export default function OrderForm({
  mode, orderId, orderCode, initialValues, initialDescription,
  units, projects, users, defaultTab,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<FormTab>(defaultTab ?? 'core');
  const [form, setForm] = useState<OrderFormValues>({ ...ORDER_FORM_DEFAULTS, ...initialValues });
  const [desc, setDesc] = useState<DescriptionFormValues>({ ...DESC_DEFAULTS, ...initialDescription });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function f<K extends keyof OrderFormValues>(k: K, v: OrderFormValues[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }
  function d<K extends keyof DescriptionFormValues>(k: K, v: DescriptionFormValues[K]) {
    setDesc(prev => ({ ...prev, [k]: v }));
  }

  const descFilled = Object.values(desc).filter(v => v && String(v).trim()).length;

  async function handleSubmit() {
    setServerError(null);
    setSuccessMsg(null);
    const parsed = OrderFormSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      if (errs.name || errs.type) setActiveTab('core');
      else if (errs.status || errs.priority || errs.dueDate) setActiveTab('dates');
      return;
    }
    startTransition(async () => {
      try {
        const url = mode === 'create' ? '/api/orders' : `/api/orders/${orderId}`;
        const r = await fetch(url, {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error ?? `HTTP ${r.status}`);
        }
        const json = await r.json();
        const savedId = mode === 'create' ? json.data.id : orderId!;
        // Save description
        const dp = DescriptionFormSchema.safeParse(desc);
        if (dp.success) {
          await fetch(`/api/orders/${savedId}/description`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dp.data),
          }).catch(() => {});
        }
        setSuccessMsg(mode === 'create' ? `Created ${json.data.orderCode}` : 'Saved successfully');
        setTimeout(() => router.push(`/orders/${savedId}`), 1100);
      } catch (e: any) {
        setServerError(e.message ?? 'Save failed');
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 mb-1">
            <Link href="/orders" className="hover:text-slate-300">All Orders</Link>
            <span>›</span>
            <span className="text-white">{mode === 'create' ? 'New Order' : `Edit ${orderCode}`}</span>
          </div>
          <h1 className="font-display font-bold text-[22px] text-white">
            {mode === 'create' ? '+ New Order' : `Edit ${orderCode}`}
          </h1>
        </div>
        {mode === 'edit' && orderId && (
          <Link href={`/orders/${orderId}`}>
            <button className="pes-btn-ghost text-xs">← Back</button>
          </Link>
        )}
      </div>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-[13px] text-red-300">✕ {serverError}</div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-[13px] text-green-300">✓ {successMsg}</div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#1f2d45]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-all
              ${activeTab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.id === 'description' && descFilled > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold">{descFilled}/8</span>
            )}
          </button>
        ))}
      </div>

      <div className="pes-card p-6">

        {/* CORE */}
        {activeTab === 'core' && (
          <div className="space-y-5">
            <TextInput label="Name / Task Title" required value={form.name}
              onChange={e => f('name', e.target.value)} error={errors.name}
              placeholder="e.g. Update ELI Timetable Scheduling System" />
            <Select label="Order Type" required value={form.type}
              onChange={v => f('type', v as any)} options={TYPE_OPTS} error={errors.type} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Unit" value={form.unitId ?? ''}
                onChange={v => f('unitId', v || null)}
                options={units.map(u => ({ value: u.id, label: u.label }))} placeholder="Select unit…" />
              <Select label="Project (optional)" value={form.projectId ?? ''}
                onChange={v => f('projectId', v || null)}
                options={projects.map(p => ({ value: p.id, label: p.label }))} placeholder="Select project…" />
            </div>
            <Select label="Owner / Responsible" value={form.ownerId ?? ''}
              onChange={v => f('ownerId', v || null)}
              options={users.map(u => ({ value: u.id, label: u.label }))} placeholder="Assign to…" />
          </div>
        )}

        {/* DATES */}
        {activeTab === 'dates' && (
          <div className="space-y-5">
            <Select label="Status" required value={form.status}
              onChange={v => f('status', v as any)} options={STATUS_OPTS} error={errors.status} />
            <Select label="Priority" required value={form.priority}
              onChange={v => f('priority', v as any)} options={PRIORITY_OPTS} error={errors.priority} />
            <PercentSlider label="% Complete" value={form.percentComplete}
              onChange={v => f('percentComplete', v)} error={errors.percentComplete} />
            <div className="grid grid-cols-2 gap-4">
              <DateInput label="Start Date" value={form.startDate ?? null}
                onChange={v => f('startDate', v)} error={errors.startDate} />
              <DateInput label="Due Date" value={form.dueDate ?? null}
                onChange={v => f('dueDate', v)} error={errors.dueDate} />
            </div>
            <div className="p-4 bg-[#0d1118] rounded-lg border border-[#1f2d45] space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">RAG Override (optional)</div>
              <p className="text-[12px] text-slate-600">Leave blank to use auto-calculated RAG.</p>
              <div className="grid grid-cols-2 gap-3">
                <Select label="RAG Override" value={form.ragOverride ?? ''}
                  onChange={v => f('ragOverride', (v || null) as any)}
                  options={RAG_OPTS.map(r => ({ value: r.value, label: r.label }))} placeholder="— Auto" />
                {form.ragOverride && (
                  <TextInput label="Override Reason" value={form.ragOverrideNote ?? ''}
                    onChange={e => f('ragOverrideNote', e.target.value || null)}
                    placeholder="Why are you overriding the RAG?" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* DESCRIPTION */}
        {activeTab === 'description' && (
          <div className="space-y-5">
            <div className="bg-[#0d1118] rounded-lg border border-[#1f2d45] px-4 py-3 text-[12.5px] text-slate-400">
              <span className="text-blue-400 font-semibold">🛡 Governance-Ready Description</span>
              <span className="mx-2 text-slate-600">·</span>
              Helps the Governance team understand purpose, scope, impact, and evidence requirements.
            </div>
            <TextArea label="🎯 Objective" value={desc.objective ?? ''} onChange={e => d('objective', e.target.value)}
              placeholder="What is the goal? What outcome is expected?" autoGrow rows={3} />
            <TextArea label="🗺 Scope" value={desc.scope ?? ''} onChange={e => d('scope', e.target.value)}
              placeholder="What is in scope? What is out of scope?" autoGrow rows={3} />
            <TextArea label="💡 Rationale" value={desc.rationale ?? ''} onChange={e => d('rationale', e.target.value)}
              placeholder="Why is this being done? What triggered it?" autoGrow rows={3} />
            <TextArea label="🛡 Governance Impact" value={desc.governanceImpact ?? ''} onChange={e => d('governanceImpact', e.target.value)}
              placeholder="Effect on policies, procedures, or compliance…" autoGrow rows={3}
              hint="Fill this if the task changes any process or policy." />
            <div className="grid grid-cols-2 gap-4">
              <TextInput label="🏢 Affected Unit(s)" value={desc.affectedUnit ?? ''} onChange={e => d('affectedUnit', e.target.value)}
                placeholder="e.g. ELI, HR, PMO" />
              <TextInput label="📄 Related Policies" value={desc.relatedPolicies ?? ''} onChange={e => d('relatedPolicies', e.target.value)}
                placeholder="e.g. Policy-12, SOP-Scheduling" hint="Comma-separated" />
            </div>
            <TextArea label="📎 Required Evidence" value={desc.requiredEvidence ?? ''} onChange={e => d('requiredEvidence', e.target.value)}
              placeholder="What documentation, approvals, or evidence must be provided?" autoGrow rows={2} />
            <TextArea label="⚠ Risks / Flags" value={desc.risks ?? ''} onChange={e => d('risks', e.target.value)}
              placeholder="Risks, dependencies, or flags for governance…" autoGrow rows={2} />
          </div>
        )}

        {/* LINKS */}
        {activeTab === 'links' && (
          <div className="space-y-5">
            <TextArea label="Notes" value={form.notes ?? ''} onChange={e => f('notes', e.target.value || null)}
              placeholder="General notes, context, or comments…" autoGrow rows={4} />
            <TextInput label="Links / References" value={form.links ?? ''} onChange={e => f('links', e.target.value || null)}
              placeholder="https://docs.example.com/project" hint="Comma-separated URLs" />
            <TextInput label="Dependencies" value={form.dependencies ?? ''} onChange={e => f('dependencies', e.target.value || null)}
              placeholder="e.g. ORD-0001, ORD-0042" hint="Order codes this task depends on" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex gap-2">
          {activeTab !== 'core' && (
            <button type="button" onClick={() => {
              const idx = TABS.findIndex(t => t.id === activeTab);
              if (idx > 0) setActiveTab(TABS[idx - 1].id);
            }} className="pes-btn-ghost text-sm">← Previous</button>
          )}
          {activeTab !== 'links' && (
            <button type="button" onClick={() => {
              const idx = TABS.findIndex(t => t.id === activeTab);
              setActiveTab(TABS[idx + 1].id);
            }} className="pes-btn-ghost text-sm">Next →</button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={mode === 'edit' && orderId ? `/orders/${orderId}` : '/orders'}>
            <button type="button" className="pes-btn-ghost text-sm">Cancel</button>
          </Link>
          <button type="button" onClick={handleSubmit}
            disabled={isPending || !form.name.trim()}
            className="pes-btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
            {mode === 'create' ? 'Create Order' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
