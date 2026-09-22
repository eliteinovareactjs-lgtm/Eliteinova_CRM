// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Headphones, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'superadmin', label: 'Super Admin' },
  { key: 'admin', label: 'Admin' },
  { key: 'agent', label: 'Agent' },
];

const PLACEHOLDER_ID = {
  superadmin: 'Owner ID e.g. 900001',
  admin: 'Admin ID e.g. 620472',
  agent: 'Agent ID e.g. 69793@123',
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
        {/* Left hero panel */}
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

        {/* Right form panel */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-12">
          <p className="font-display text-2xl font-semibold text-brand-ink">
            Hey, welcome!
          </p>
          <p className="mt-1 text-sm text-brand-ink/50">
            Sign in to your account to continue
          </p>

          <div className="mt-6 flex gap-2 rounded-full bg-brand-lilac/60 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setError('');
                }}
                className={`pill-tab ${tab === t.key ? 'pill-tab-active' : 'pill-tab-inactive'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/40 hover:text-brand-purple"
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