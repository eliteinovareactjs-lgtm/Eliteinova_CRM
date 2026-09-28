// src/pages/admin/LeadConfig.jsx
import { useEffect, useState, useRef } from 'react';
import {
  Tag, Layers, ListFilter, GitBranch, Plus, X, Trash2, Save, Pencil,
  AlertCircle, CheckCircle2, Database, Info, Check, Sparkles, Hash,
  Type, Calendar, ListChecks, Mail, Phone, ToggleLeft, RotateCcw,
  TrendingUp, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  LEAD_SOURCES as INITIAL_SOURCES,
  LEAD_CATEGORIES as INITIAL_CATEGORIES,
  LEAD_STATUSES as INITIAL_STATUSES,
  LEAD_STAGES as INITIAL_STAGES,
  CUSTOM_FIELDS as INITIAL_FIELDS,
  LEADS,
} from '../../data/mockData';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'sources',    label: 'Sources',       icon: Tag },
  { key: 'categories', label: 'Categories',    icon: Layers },
  { key: 'statuses',   label: 'Statuses',      icon: ListFilter },
  { key: 'stages',     label: 'Stages',        icon: GitBranch },
  { key: 'fields',     label: 'Custom Fields', icon: Database },
];

const STATUS_COLORS = {
  violet:  { chip: 'bg-violet-100 text-brand-purple border-violet-200', dot: 'bg-violet-500' },
  blue:    { chip: 'bg-blue-100 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  emerald: { chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  amber:   { chip: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  rose:    { chip: 'bg-rose-100 text-brand-magenta border-rose-200',     dot: 'bg-brand-magenta' },
  slate:   { chip: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-500' },
  cyan:    { chip: 'bg-cyan-100 text-cyan-700 border-cyan-200',          dot: 'bg-cyan-500' },
};

const FIELD_TYPES = [
  { key: 'Text',     label: 'Text',     icon: Type },
  { key: 'Number',   label: 'Number',   icon: Hash },
  { key: 'Date',     label: 'Date',     icon: Calendar },
  { key: 'Dropdown', label: 'Dropdown', icon: ListChecks },
  { key: 'Checkbox', label: 'Checkbox', icon: ToggleLeft },
  { key: 'Email',    label: 'Email',    icon: Mail },
  { key: 'Phone',    label: 'Phone',    icon: Phone },
];

const STORAGE_PREFIX = 'leadConfig:';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
};

const clearState = (key) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch { /* ignore */ }
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LeadConfig() {
  const { activeWebsiteId, activeWebsite } = useAuth();
  const [tab, setTab] = useState('sources');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  /* Defaults per website */
  const defaults = {
    sources:    INITIAL_SOURCES.filter((s) => s.projectId === activeWebsiteId),
    categories: INITIAL_CATEGORIES.filter((c) => c.projectId === activeWebsiteId),
    statuses:   INITIAL_STATUSES.filter((s) => s.projectId === activeWebsiteId),
    stages:     INITIAL_STAGES.filter((s) => s.projectId === activeWebsiteId),
    fields:     INITIAL_FIELDS.filter((f) => f.projectId === activeWebsiteId),
  };

  /* State */
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [stages, setStages] = useState([]);
  const [fields, setFields] = useState([]);

  /* Load on mount + when website changes */
  useEffect(() => {
    setSources(loadState(`sources:${activeWebsiteId}`, defaults.sources));
    setCategories(loadState(`categories:${activeWebsiteId}`, defaults.categories));
    setStatuses(loadState(`statuses:${activeWebsiteId}`, defaults.statuses));
    setStages(loadState(`stages:${activeWebsiteId}`, defaults.stages));
    setFields(loadState(`fields:${activeWebsiteId}`, defaults.fields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWebsiteId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  const leadCountBy = (field, value) =>
    LEADS.filter((l) => l.websiteId === activeWebsiteId && l[field] === value).length;

  /* Save all */
  const handleSaveAll = () => {
    saveState(`sources:${activeWebsiteId}`, sources);
    saveState(`categories:${activeWebsiteId}`, categories);
    saveState(`statuses:${activeWebsiteId}`, statuses);
    saveState(`stages:${activeWebsiteId}`, stages);
    saveState(`fields:${activeWebsiteId}`, fields);
    showToast('All changes saved');
  };

  /* Reset all */
  const handleResetAll = () => {
    setSources(defaults.sources);
    setCategories(defaults.categories);
    setStatuses(defaults.statuses);
    setStages(defaults.stages);
    setFields(defaults.fields);
    ['sources', 'categories', 'statuses', 'stages', 'fields'].forEach((k) =>
      clearState(`${k}:${activeWebsiteId}`)
    );
    setConfirmReset(false);
    showToast('Reset to defaults');
  };

  /* Delete */
  const performDelete = () => {
    if (!confirmDelete) return;
    const { kind, id, name } = confirmDelete;
    if (kind === 'source')   setSources((p) => p.filter((x) => x.id !== id));
    if (kind === 'category') setCategories((p) => p.filter((x) => x.id !== id));
    if (kind === 'status')   setStatuses((p) => p.filter((x) => x.id !== id));
    if (kind === 'stage')    setStages((p) => p.filter((x) => x.id !== id));
    if (kind === 'field')    setFields((p) => p.filter((x) => x.id !== id));
    setConfirmDelete(null);
    showToast(`"${name}" removed`, 'error');
  };

  const counts = {
    sources: sources.length,
    categories: categories.length,
    statuses: statuses.length,
    stages: stages.length,
    fields: fields.length,
  };

  return (
    /* ✨ Ambient background like other pages */
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FDF8FE] via-white to-[#FBF3FF]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-magenta/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-purple/[0.05] blur-3xl" />

      <div className="relative space-y-5 px-1 py-1">
        {/* ═══════════ HEADER ═══════════ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-ink">
              Lead Configuration
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-brand-ink/50">
              <Info size={13} className="text-brand-magenta" />
              Configure pipeline for{' '}
              <span className="font-semibold text-brand-magenta">{activeWebsite?.name}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setConfirmReset(true)}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-magenta/40 hover:shadow-md"
            >
              <RotateCcw size={13} className="transition-transform group-hover:-rotate-90" /> Reset
            </button>
            <button
              onClick={handleSaveAll}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(227,28,121,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              <Save size={14} className="transition-transform group-hover:scale-110" /> Save Changes
            </button>
          </div>
        </div>

        {/* ═══════════ ENHANCED KPI SUMMARY CARDS ═══════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-magenta to-brand-purple" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-magenta">
                  Configuration
                </p>
                <h2 className="font-display text-sm font-semibold text-brand-ink">Overview</h2>
              </div>
            </div>
            <p className="text-[11px] text-brand-ink/40">Click a card to switch tab</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <ConfigKpiCard
              icon={Tag}
              label="Sources"
              value={counts.sources}
              sub={`${leadCountBy('leadSource', sources[0]?.name) || 0} top source leads`}
              color="rose"
              active={tab === 'sources'}
              onClick={() => setTab('sources')}
              delay={0}
            />
            <ConfigKpiCard
              icon={Layers}
              label="Categories"
              value={counts.categories}
              sub="Lead types"
              color="purple"
              active={tab === 'categories'}
              onClick={() => setTab('categories')}
              delay={40}
            />
            <ConfigKpiCard
              icon={ListFilter}
              label="Statuses"
              value={counts.statuses}
              sub="Pipeline stages"
              color="emerald"
              active={tab === 'statuses'}
              onClick={() => setTab('statuses')}
              delay={80}
            />
            <ConfigKpiCard
              icon={GitBranch}
              label="Stages"
              value={counts.stages}
              sub="Sales journey"
              color="amber"
              active={tab === 'stages'}
              onClick={() => setTab('stages')}
              delay={120}
            />
            <ConfigKpiCard
              icon={Database}
              label="Custom Fields"
              value={counts.fields}
              sub={`${fields.filter((f) => f.required).length} required`}
              color="cyan"
              active={tab === 'fields'}
              onClick={() => setTab('fields')}
              delay={160}
            />
          </div>
        </div>

        {/* ═══════════ TABS ═══════════ */}
        <div className="card !p-2">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)] scale-[1.02]'
                      : 'text-brand-ink/60 hover:bg-brand-lilac/50 hover:text-brand-magenta'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/25 text-white' : 'bg-brand-lilac/70 text-brand-purple'}`}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════ TAB CONTENT ═══════════ */}
        {tab === 'sources' && (
          <SourcesTab
            sources={sources}
            setSources={setSources}
            leadCountBy={leadCountBy}
            onDelete={(s) =>
              setConfirmDelete({
                kind: 'source', id: s.id, name: s.name,
                message: `This will remove "${s.name}". Leads using it keep their value but new leads can't select it.`,
              })
            }
          />
        )}

        {tab === 'categories' && (
          <CategoriesTab
            categories={categories}
            setCategories={setCategories}
            leadCountBy={leadCountBy}
            onDelete={(c) =>
              setConfirmDelete({
                kind: 'category', id: c.id, name: c.name,
                message: `This will remove "${c.name}". Leads using it keep their value but new leads can't select it.`,
              })
            }
          />
        )}

        {tab === 'statuses' && (
          <StatusesTab
            statuses={statuses}
            setStatuses={setStatuses}
            leadCountBy={leadCountBy}
            onDelete={(s) =>
              setConfirmDelete({
                kind: 'status', id: s.id, name: s.name,
                message: `This will remove "${s.name}". Leads currently in this status keep their value.`,
              })
            }
          />
        )}

        {tab === 'stages' && (
          <StagesTab
            stages={stages}
            setStages={setStages}
            leadCountBy={leadCountBy}
            onDelete={(s) =>
              setConfirmDelete({
                kind: 'stage', id: s.id, name: s.name,
                message: `This will remove "${s.name}" from your pipeline.`,
              })
            }
          />
        )}

        {tab === 'fields' && (
          <FieldsTab
            fields={fields}
            setFields={setFields}
            onDelete={(f) =>
              setConfirmDelete({
                kind: 'field', id: f.id, name: f.name,
                message: `This will remove "${f.name}". Existing lead values are kept but the field no longer appears on new leads.`,
              })
            }
          />
        )}

        {/* ═══════════ MODALS ═══════════ */}
        {confirmDelete && (
          <ConfirmDialog
            title={`Remove ${confirmDelete.kind}?`}
            message={confirmDelete.message}
            confirmLabel={`Remove ${confirmDelete.kind}`}
            onCancel={() => setConfirmDelete(null)}
            onConfirm={performDelete}
          />
        )}

        {confirmReset && (
          <ConfirmDialog
            title="Reset all configuration?"
            message="This will restore all sources, categories, statuses, stages, and custom fields to their defaults. Any unsaved changes will be lost."
            confirmLabel="Reset everything"
            onCancel={() => setConfirmReset(false)}
            onConfirm={handleResetAll}
          />
        )}

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ✨ ENHANCED CONFIG KPI CARD
   ═══════════════════════════════════════════════════════════════ */
function ConfigKpiCard({ icon: Icon, label, value, sub, color = 'rose', active, onClick, delay = 0 }) {
  const displayValue = useAnimatedCount(value);

  const themes = {
    rose:    {
      border: 'border-rose-200 hover:border-rose-400',
      bg: 'from-rose-50 via-rose-50/30 to-white',
      iconBg: 'bg-rose-100 text-brand-magenta border-rose-200',
      bar: 'from-brand-magenta to-brand-purple',
      glow: 'bg-brand-magenta/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(227,28,121,0.45)]',
      valueColor: 'text-brand-magenta',
      ring: 'ring-rose-300',
    },
    purple:  {
      border: 'border-violet-200 hover:border-violet-400',
      bg: 'from-violet-50 via-violet-50/30 to-white',
      iconBg: 'bg-violet-100 text-brand-purple border-violet-200',
      bar: 'from-brand-purple to-brand-magenta',
      glow: 'bg-brand-purple/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(139,47,214,0.45)]',
      valueColor: 'text-brand-purple',
      ring: 'ring-violet-300',
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      bg: 'from-emerald-50 via-emerald-50/30 to-white',
      iconBg: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      bar: 'from-emerald-500 to-emerald-400',
      glow: 'bg-emerald-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(16,185,129,0.4)]',
      valueColor: 'text-emerald-600',
      ring: 'ring-emerald-300',
    },
    amber:   {
      border: 'border-amber-200 hover:border-amber-400',
      bg: 'from-amber-50 via-amber-50/30 to-white',
      iconBg: 'bg-amber-100 text-amber-600 border-amber-200',
      bar: 'from-amber-500 to-orange-400',
      glow: 'bg-amber-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(245,158,11,0.4)]',
      valueColor: 'text-amber-600',
      ring: 'ring-amber-300',
    },
    cyan:    {
      border: 'border-cyan-200 hover:border-cyan-400',
      bg: 'from-cyan-50 via-cyan-50/30 to-white',
      iconBg: 'bg-cyan-100 text-cyan-600 border-cyan-200',
      bar: 'from-cyan-500 to-blue-400',
      glow: 'bg-cyan-500/25',
      shadow: 'hover:shadow-[0_15px_40px_-15px_rgba(6,182,212,0.4)]',
      valueColor: 'text-cyan-600',
      ring: 'ring-cyan-300',
    },
  };

  const t = themes[color];

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white via-white to-brand-mist/30 p-4 text-left shadow-[0_4px_16px_-8px_rgba(139,47,214,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 animate-fade-slide-in ${
        active ? `${t.border} ring-2 ${t.ring} ${t.shadow}` : `${t.border} ${t.shadow}`
      }`}
    >
      {/* Top gradient bar */}
      <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${t.bar} transition-transform duration-500 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`} />

      {/* Gradient wash on hover */}
      <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`} />

      {/* Corner glow */}
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.glow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${active ? 'opacity-100' : ''}`} />

      {/* Diagonal sheen sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${t.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={18} />
        </span>

        {active && (
          <span className="flex items-center gap-1 rounded-full bg-brand-magenta/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-magenta ring-1 ring-brand-magenta/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-magenta opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-magenta" />
            </span>
            Active
          </span>
        )}

        {!active && (
          <ArrowRight size={14} className="mt-1 -translate-x-2 text-brand-ink/30 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-brand-magenta group-hover:opacity-100" />
        )}
      </div>

      <div className="relative z-10 w-full">
        <p className={`font-display text-3xl font-bold leading-tight tabular-nums ${t.valueColor}`}>
          {displayValue}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-brand-ink/75">{label}</p>
        {sub && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-ink/50">{sub}</p>}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════════════════════ */
function useAnimatedCount(target, duration = 600) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;

    const tick = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return display.toLocaleString();
}

/* ═══════════════════════════════════════════════════════════════
   SOURCES TAB
   ═══════════════════════════════════════════════════════════════ */
function SourcesTab({ sources, setSources, leadCountBy, onDelete }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const name = input.trim();
    if (!name) { setError('Please enter a name'); return; }
    if (sources.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError('This source already exists');
      return;
    }
    setSources((p) => [...p, { id: uid('src'), name, projectId: null, active: true }]);
    setInput('');
    setError('');
  };

  const startEdit = (s) => { setEditingId(s.id); setEditValue(s.name); setError(''); };

  const commitEdit = (id) => {
    const name = editValue.trim();
    if (!name) { setEditingId(null); return; }
    if (sources.some((s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) {
      setError('Name already used');
      return;
    }
    setSources((p) => p.map((s) => (s.id === id ? { ...s, name } : s)));
    setEditingId(null);
    setEditValue('');
    setError('');
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <Header icon={Tag} iconClass="bg-rose-50 text-brand-magenta" title="Lead Sources" subtitle="Where your leads come from" count={sources.length} />

      <div className="border-b border-brand-lilac/40 bg-brand-mist/30 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add new source (e.g. Google Ads, WhatsApp, Referral)…"
            className="min-w-[220px] flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {error && <p className="mt-2 text-[11px] font-medium text-rose-500">{error}</p>}
      </div>

      {sources.length === 0 ? (
        <EmptyState message="No sources yet. Add your first source above." />
      ) : (
        <ul className="divide-y divide-brand-lilac/40">
          {sources.map((s) => {
            const count = leadCountBy('leadSource', s.name);
            const editing = editingId === s.id;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-brand-magenta">
                  <Tag size={14} />
                </span>

                {editing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(s.id);
                      if (e.key === 'Escape') { setEditingId(null); setError(''); }
                    }}
                    className="flex-1 rounded-lg border border-brand-magenta bg-white px-2.5 py-1.5 text-sm outline-none"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{s.name}</p>
                    <p className="truncate text-[11px] text-brand-ink/50">
                      {count} {count === 1 ? 'lead' : 'leads'} use this source
                    </p>
                  </div>
                )}

                {count > 0 && !editing && (
                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    In use
                  </span>
                )}

                <RowActions
                  editing={editing}
                  onEdit={() => startEdit(s)}
                  onSave={() => commitEdit(s.id)}
                  onCancel={() => { setEditingId(null); setError(''); }}
                  onDelete={() => onDelete(s)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORIES TAB
   ═══════════════════════════════════════════════════════════════ */
function CategoriesTab({ categories, setCategories, leadCountBy, onDelete }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const name = input.trim();
    if (!name) { setError('Please enter a name'); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError('This category already exists');
      return;
    }
    setCategories((p) => [...p, { id: uid('cat'), name, projectId: null, active: true }]);
    setInput('');
    setError('');
  };

  const startEdit = (c) => { setEditingId(c.id); setEditValue(c.name); setError(''); };

  const commitEdit = (id) => {
    const name = editValue.trim();
    if (!name) { setEditingId(null); return; }
    if (categories.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
      setError('Name already used');
      return;
    }
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, name } : c)));
    setEditingId(null);
    setEditValue('');
    setError('');
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <Header icon={Layers} iconClass="bg-violet-50 text-brand-purple" title="Lead Categories" subtitle="Classify leads by type" count={categories.length} />

      <div className="border-b border-brand-lilac/40 bg-brand-mist/30 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add new category (e.g. New Registration, Premium Enquiry)…"
            className="min-w-[220px] flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {error && <p className="mt-2 text-[11px] font-medium text-rose-500">{error}</p>}
      </div>

      {categories.length === 0 ? (
        <EmptyState message="No categories yet. Add your first category above." />
      ) : (
        <ul className="divide-y divide-brand-lilac/40">
          {categories.map((c) => {
            const count = leadCountBy('category', c.name);
            const editing = editingId === c.id;
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                  <Layers size={14} />
                </span>

                {editing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(c.id);
                      if (e.key === 'Escape') { setEditingId(null); setError(''); }
                    }}
                    className="flex-1 rounded-lg border border-brand-magenta bg-white px-2.5 py-1.5 text-sm outline-none"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{c.name}</p>
                    <p className="truncate text-[11px] text-brand-ink/50">
                      {count} {count === 1 ? 'lead' : 'leads'} in this category
                    </p>
                  </div>
                )}

                {count > 0 && !editing && (
                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    In use
                  </span>
                )}

                <RowActions
                  editing={editing}
                  onEdit={() => startEdit(c)}
                  onSave={() => commitEdit(c.id)}
                  onCancel={() => { setEditingId(null); setError(''); }}
                  onDelete={() => onDelete(c)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATUSES TAB
   ═══════════════════════════════════════════════════════════════ */
function StatusesTab({ statuses, setStatuses, leadCountBy, onDelete }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('violet');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('violet');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter a name'); return; }
    if (statuses.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('This status already exists');
      return;
    }
    setStatuses((p) => [
      ...p,
      { id: uid('st'), name: trimmed, color, projectId: null, order: p.length + 1 },
    ]);
    setName('');
    setColor('violet');
    setError('');
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditValue(s.name);
    setEditColor(s.color);
    setError('');
  };

  const commitEdit = (id) => {
    const trimmed = editValue.trim();
    if (!trimmed) { setEditingId(null); return; }
    if (statuses.some((s) => s.id !== id && s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Name already used');
      return;
    }
    setStatuses((p) => p.map((s) => (s.id === id ? { ...s, name: trimmed, color: editColor } : s)));
    setEditingId(null);
    setEditValue('');
    setEditColor('violet');
    setError('');
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <Header icon={ListFilter} iconClass="bg-emerald-50 text-emerald-600" title="Lead Status" subtitle="Pipeline stage a lead is currently in" count={statuses.length} />

      <div className="border-b border-brand-lilac/40 bg-brand-mist/30 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add new status (e.g. Call Back, Interested)…"
            className="min-w-[220px] flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <ColorPicker value={color} onChange={setColor} />
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {error && <p className="mt-2 text-[11px] font-medium text-rose-500">{error}</p>}
      </div>

      {statuses.length === 0 ? (
        <EmptyState message="No statuses yet. Add your first status above." />
      ) : (
        <ul className="divide-y divide-brand-lilac/40">
          {statuses.map((s, i) => {
            const count = leadCountBy('status', s.name);
            const editing = editingId === s.id;
            const style = STATUS_COLORS[s.color] || STATUS_COLORS.violet;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lilac/50 text-xs font-bold text-brand-purple tabular-nums">
                  {i + 1}
                </span>

                {editing ? (
                  <>
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(s.id);
                        if (e.key === 'Escape') { setEditingId(null); setError(''); }
                      }}
                      className="flex-1 rounded-lg border border-brand-magenta bg-white px-2.5 py-1.5 text-sm outline-none"
                    />
                    <ColorPicker value={editColor} onChange={setEditColor} />
                  </>
                ) : (
                  <>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${style.chip}`}>
                      {s.name}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-brand-ink/50">
                        {count} {count === 1 ? 'lead' : 'leads'} currently here
                      </p>
                    </div>
                  </>
                )}

                {count > 0 && !editing && (
                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    In use
                  </span>
                )}

                <RowActions
                  editing={editing}
                  onEdit={() => startEdit(s)}
                  onSave={() => commitEdit(s.id)}
                  onCancel={() => { setEditingId(null); setError(''); }}
                  onDelete={() => onDelete(s)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAGES TAB
   ═══════════════════════════════════════════════════════════════ */
function StagesTab({ stages, setStages, onDelete }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const name = input.trim();
    if (!name) { setError('Please enter a name'); return; }
    if (stages.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError('This stage already exists');
      return;
    }
    setStages((p) => [...p, { id: uid('stage'), name, projectId: null, order: p.length + 1 }]);
    setInput('');
    setError('');
  };

  const startEdit = (s) => { setEditingId(s.id); setEditValue(s.name); setError(''); };

  const commitEdit = (id) => {
    const name = editValue.trim();
    if (!name) { setEditingId(null); return; }
    if (stages.some((s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) {
      setError('Name already used');
      return;
    }
    setStages((p) => p.map((s) => (s.id === id ? { ...s, name } : s)));
    setEditingId(null);
    setEditValue('');
    setError('');
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <Header icon={GitBranch} iconClass="bg-amber-50 text-amber-600" title="Sales Pipeline Stages" subtitle="Ordered journey a lead progresses through" count={stages.length} />

      <div className="border-b border-brand-lilac/40 bg-brand-mist/30 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add new stage (e.g. Qualified, Negotiation, Closed)…"
            className="min-w-[220px] flex-1 rounded-xl border border-brand-lilac bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        {error && <p className="mt-2 text-[11px] font-medium text-rose-500">{error}</p>}
      </div>

      {stages.length === 0 ? (
        <EmptyState message="No stages yet. Add your first stage above." />
      ) : (
        <ul className="divide-y divide-brand-lilac/40">
          {stages.map((s, i) => {
            const editing = editingId === s.id;
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-magenta to-brand-purple text-xs font-bold text-white shadow-sm">
                  {i + 1}
                </span>

                {editing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(s.id);
                      if (e.key === 'Escape') { setEditingId(null); setError(''); }
                    }}
                    className="flex-1 rounded-lg border border-brand-magenta bg-white px-2.5 py-1.5 text-sm outline-none"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{s.name}</p>
                    <p className="truncate text-[11px] text-brand-ink/50">
                      Stage {i + 1} of {stages.length}
                    </p>
                  </div>
                )}

                <RowActions
                  editing={editing}
                  onEdit={() => startEdit(s)}
                  onSave={() => commitEdit(s.id)}
                  onCancel={() => { setEditingId(null); setError(''); }}
                  onDelete={() => onDelete(s)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FIELDS TAB
   ═══════════════════════════════════════════════════════════════ */
function FieldsTab({ fields, setFields, onDelete }) {
  const [form, setForm] = useState({ name: '', type: 'Text', options: '', required: false });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setForm({ name: '', type: 'Text', options: '', required: false });
    setError('');
  };

  const handleAdd = () => {
    const name = form.name.trim();
    if (!name) { setError('Please enter a field name'); return; }
    if (fields.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setError('This field already exists');
      return;
    }
    setFields((p) => [
      ...p,
      {
        id: uid('cf'),
        name,
        type: form.type,
        options:
          form.type === 'Dropdown'
            ? form.options.split(',').map((o) => o.trim()).filter(Boolean)
            : undefined,
        required: form.required,
        projectId: null,
      },
    ]);
    resetForm();
  };

  const startEdit = (f) => {
    setEditingId(f.id);
    setForm({
      name: f.name,
      type: f.type,
      options: f.options ? f.options.join(', ') : '',
      required: !!f.required,
    });
    setError('');
  };

  const commitEdit = () => {
    const name = form.name.trim();
    if (!name) { setError('Please enter a field name'); return; }
    if (fields.some((f) => f.id !== editingId && f.name.toLowerCase() === name.toLowerCase())) {
      setError('Name already used');
      return;
    }
    setFields((p) =>
      p.map((f) =>
        f.id === editingId
          ? {
              ...f,
              name,
              type: form.type,
              options:
                form.type === 'Dropdown'
                  ? form.options.split(',').map((o) => o.trim()).filter(Boolean)
                  : undefined,
              required: form.required,
            }
          : f
      )
    );
    setEditingId(null);
    resetForm();
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-4">
      {/* Add / Edit Form */}
      <div className="card !p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-brand-purple">
            <Database size={16} />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold text-brand-ink">
              {editingId ? 'Edit Custom Field' : 'Add Custom Field'}
            </h2>
            <p className="text-[11px] text-brand-ink/50">
              {editingId ? 'Update field details' : 'Create a business-specific field for this project'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
          <input
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(''); }}
            placeholder="Field name (e.g. Age, Religion, Budget, BHK)"
            className="rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>

        {form.type === 'Dropdown' && (
          <input
            value={form.options}
            onChange={(e) => setForm({ ...form, options: e.target.value })}
            placeholder="Comma-separated options (e.g. Male, Female, Other)"
            className="mt-3 w-full rounded-xl border border-brand-lilac bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/15"
          />
        )}

        {error && <p className="mt-2 text-[11px] font-medium text-rose-500">{error}</p>}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-brand-ink/70">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
              className="h-4 w-4 rounded border-brand-lilac text-brand-magenta focus:ring-brand-magenta/30"
            />
            Required field
          </label>

          <div className="flex gap-2">
            {editingId && (
              <button
                onClick={cancelEdit}
                className="rounded-xl border border-brand-lilac bg-white px-4 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-lilac/40"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => (editingId ? commitEdit() : handleAdd())}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-4 py-2 text-xs font-semibold text-white shadow-card hover:brightness-110"
            >
              {editingId ? <><Check size={13} /> Save</> : <><Plus size={13} /> Add Field</>}
            </button>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="card !p-0 overflow-hidden">
        <Header icon={ListChecks} iconClass="bg-violet-50 text-brand-purple" title="Existing Fields" subtitle="Fields currently on every lead form" count={fields.length} />

        {fields.length === 0 ? (
          <EmptyState message="No custom fields yet. Add your first field above." />
        ) : (
          <ul className="divide-y divide-brand-lilac/40">
            {fields.map((f) => {
              const Icon = FIELD_TYPES.find((t) => t.key === f.type)?.icon || Type;
              return (
                <li key={f.id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-mist/30">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-brand-purple">
                    <Icon size={14} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-brand-ink">{f.name}</p>
                      {f.required && (
                        <span className="shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                          REQUIRED
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-brand-ink/50">
                      Type: {f.type}
                      {f.options && f.options.length > 0 && ` · ${f.options.join(', ')}`}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-brand-lilac px-2.5 py-0.5 text-[10px] font-bold text-brand-purple">
                    {f.type}
                  </span>

                  <RowActions
                    editing={false}
                    onEdit={() => startEdit(f)}
                    onDelete={() => onDelete(f)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Header({ icon: Icon, iconClass, title, subtitle, count }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-brand-lilac/60 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={16} />
        </span>
        <div>
          <h2 className="font-display text-sm font-bold text-brand-ink">{title}</h2>
          <p className="text-[11px] text-brand-ink/50">{subtitle}</p>
        </div>
      </div>
      <span className="rounded-full bg-brand-lilac/60 px-3 py-1 text-[10px] font-bold text-brand-purple">
        {count} total
      </span>
    </div>
  );
}

function RowActions({ editing, onEdit, onSave, onCancel, onDelete }) {
  if (editing) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onSave}
          className="flex h-8 items-center gap-1 rounded-lg bg-emerald-500 px-3 text-[11px] font-semibold text-white hover:bg-emerald-600"
        >
          <Check size={12} /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-brand-lilac"
          title="Cancel"
        >
          <X size={14} />
        </button>
      </div>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        onClick={onEdit}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-purple"
        title="Edit"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
        title="Delete"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  const COLORS = Object.keys(STATUS_COLORS);
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-brand-lilac bg-white px-2 py-1.5">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`h-5 w-5 rounded-full border-2 transition-all ${
            value === c ? 'ring-2 ring-brand-magenta ring-offset-1 border-white scale-110' : 'border-white hover:scale-110'
          } ${STATUS_COLORS[c].dot}`}
          title={c}
        />
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lilac/50 text-brand-magenta">
        <Sparkles size={20} />
      </span>
      <p className="text-xs text-brand-ink/50">{message}</p>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
            <AlertCircle size={18} />
          </div>
          <h3 className="font-display text-base font-semibold text-brand-ink">{title}</h3>
        </div>
        <p className="mb-5 text-sm text-brand-ink/60">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-brand-lilac py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-lilac/40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-panel ${
          type === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-600'
            : 'border-emerald-200 bg-emerald-50 text-emerald-600'
        }`}
      >
        {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        {message}
      </div>
    </div>
  );
}