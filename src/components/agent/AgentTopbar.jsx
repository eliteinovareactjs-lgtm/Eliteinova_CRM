import { useState } from 'react';
import { Menu, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AgentTopbar({ onMenuClick }) {
  const { user, logout, activeWebsite } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-brand-lilac bg-white/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-brand-ink/60 hover:bg-brand-lilac md:hidden">
          <Menu size={20} />
        </button>
        <div className="hidden text-sm text-brand-ink/60 sm:block">
          <span className="font-semibold text-brand-ink">IVR:</span> {activeWebsite?.ivrNumber}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-brand-ink/60 hover:bg-brand-lilac">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-magenta text-[9px] font-bold text-white">3</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-brand-lilac"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-button text-xs font-bold text-white">
              {user?.avatar}
            </span>
            <span className="hidden text-sm font-semibold text-brand-ink sm:block">{user?.name}</span>
            <ChevronDown size={16} className="hidden text-brand-ink/40 sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-xl border border-brand-lilac bg-white p-2 shadow-panel">
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}