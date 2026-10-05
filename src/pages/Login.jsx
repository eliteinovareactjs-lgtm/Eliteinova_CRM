// src/pages/Login.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Eye, EyeOff, Headphones, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ================================================================
   ROLES — 5 total
   ================================================================ */
const ROLES = [
  { key: 'superadmin',  label: 'Super Admin' },
  { key: 'admin',       label: 'Admin' },
  { key: 'marketing',   label: 'Marketing Executive' },
  { key: 'leadmanager', label: 'Lead Manager' },
  { key: 'agent',       label: 'Agent' },
];

const PLACEHOLDER_ID = {
  superadmin:  'Owner ID e.g. 900001',
  admin:       'Admin ID e.g. 620472',
  marketing:   'Marketing ID e.g. 331045',
  leadmanager: 'Lead Manager ID e.g. 512078',
  agent:       'Agent ID e.g. 69793@123',
};

/* Auto-fill credentials per role (must match mockData USERS) */
const DEMO_CREDS = {
  superadmin:  { id: '900001',    password: 'super@123' },
  admin:       { id: '620472',    password: 'admin@123' },
  marketing:   { id: '331045',    password: 'marketing@123' },
  leadmanager: { id: '512078',    password: 'leadmanager@123' },
  agent:       { id: '69793@123', password: 'agent@123' },
};

/* One-line role descriptions shown under the pill row */
const ROLE_DESC = {
  superadmin:  'Full system access · owners only',
  admin:       'Manage agents, leads and campaigns',
  marketing:   'Run campaigns, ads and creative',
  leadmanager: 'Assign, route and qualify leads',
  agent:       'Dial, connect and convert leads',
};

export default function Login() {
  const [tab, setTab] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const pillsRef = useRef(null);

  /* ============================================================
     Role switching — auto-fills demo creds + clears error
     ============================================================ */
  const handleTabChange = (key) => {
    setTab(key);
    setError('');
    const creds = DEMO_CREDS[key];
    if (creds) {
      setUsername(creds.id);
      setPassword(creds.password);
    } else {
      setUsername('');
      setPassword('');
    }
  };

  /* Auto-fill on first mount so the demo is one-click ready */
  useEffect(() => {
    const creds = DEMO_CREDS[tab];
    if (creds) {
      setUsername(creds.id);
      setPassword(creds.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================================================
     Arrow-key navigation across the pill row
     ============================================================ */
  const handlePillsKeyDown = (e) => {
    const idx = ROLES.findIndex((r) => r.key === tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = ROLES[(idx + 1) % ROLES.length];
      handleTabChange(next.key);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = ROLES[(idx - 1 + ROLES.length) % ROLES.length];
      handleTabChange(prev.key);
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleTabChange(ROLES[0].key);
    } else if (e.key === 'End') {
      e.preventDefault();
      handleTabChange(ROLES[ROLES.length - 1].key);
    }
  };

  /* ============================================================
     Submit
     ============================================================ */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(username.trim(), password.trim(), tab);
      setLoading(false);
      if (result.ok) {
        navigate(`/${tab}/dashboard`);
      } else {
        setError(result.message);
      }
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-gradient p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-xl2 bg-white/60 shadow-panel backdrop-blur md:grid-cols-2">
        {/* ============================================================
            LEFT HERO PANEL
           ============================================================ */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-10 md:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-brand-purple/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-button text-white shadow-card">
              <Headphones size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-brand-ink">
                ELITEINOVA <span className="text-brand-magenta">CRM</span>
              </p>
              <p className="text-[10px] font-semibold tracking-wide text-brand-ink/50">
                CALL &nbsp;|&nbsp; CONNECT &nbsp;|&nbsp; CONVERT
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="font-display text-4xl font-semibold leading-tight text-brand-ink">
              Better
              <br />
              Conversations
              <br />
              Brighter Business
            </h1>
            <div className="mt-4 h-1 w-16 rounded-full bg-brand-button" />
          </div>

          <div className="relative z-10 flex justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/50 shadow-card">
              <Headphones size={64} className="text-brand-purple" strokeWidth={1.4} />
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT FORM PANEL
           ============================================================ */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-12">
          <p className="font-display text-2xl font-semibold text-brand-ink">
            Hey, welcome!
          </p>
          <p className="mt-1 text-sm text-brand-ink/50">
            Sign in to your account to continue
          </p>

          {/* ================= ROLE SELECTOR (wrapping row) ================= */}
          <div className="mt-6">
            <div className="rounded-2xl bg-brand-lilac/50 p-1.5">
              <div
                ref={pillsRef}
                role="tablist"
                aria-label="Select your role"
                tabIndex={0}
                onKeyDown={handlePillsKeyDown}
                className="flex flex-wrap gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-magenta/40 focus-visible:ring-offset-1"
              >
                {ROLES.map((r) => {
                  const active = tab === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleTabChange(r.key)}
                      className={`min-w-fit flex-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[11px] font-bold transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-brand-magenta to-brand-purple text-white shadow-[0_4px_14px_-4px_rgba(227,28,121,0.5)]'
                          : 'bg-white/70 text-brand-ink/60 hover:bg-white hover:text-brand-magenta'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role description helper */}
            <p className="mt-2 text-center text-[11px] text-brand-ink/50">
              {ROLE_DESC[tab]}
            </p>
          </div>

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
            <div className="relative">
              <User
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/60"
                size={18}
              />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={PLACEHOLDER_ID[tab]}
                className="input-field"
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/60"
                size={18}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-purple"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Please wait…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-xs text-brand-ink/40">
            <ShieldCheck size={14} />
            <span>Demo credentials are pre-loaded in the mock data layer for each role.</span>
          </div>
        </div>
      </div>
    </div>
  );
}