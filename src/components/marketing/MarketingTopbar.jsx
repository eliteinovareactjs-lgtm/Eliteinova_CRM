// src/components/marketing/MarketingTopbar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Bell, ChevronDown, LogOut, Search, Settings, User,
  Building2, AlertTriangle, Phone, Users, Megaphone, FileText,
  Target, Command, Zap, Bookmark, BarChart3, Share2, Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MarketingTopbar({ onMenuClick }) {
  const { user, logout, activeWebsite } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ================= CLOSE MENUS ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ================= KEYBOARD SHORTCUT ================= */
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* ================= NOTIFICATIONS ================= */
  const notifications = [
    { id: 1, icon: AlertTriangle, color: 'bg-rose-50 text-rose-500', title: '3 campaigns are pending review', time: '2 min ago', to: '/marketing/campaigns' },
    { id: 2, icon: Users, color: 'bg-violet-50 text-brand-purple', title: '5 new marketing leads captured', time: '15 min ago', to: '/marketing/leads' },
    { id: 3, icon: Megaphone, color: 'bg-amber-50 text-amber-500', title: 'Campaign "Q3 Outreach" started', time: '1 hr ago', to: '/marketing/campaigns' },
  ];
  const unreadCount = notifications.length;

  /* ================= SEARCH ================= */
  const searchResults = [
    { icon: Building2, label: 'Dashboard', to: '/marketing/dashboard' },
    { icon: Megaphone, label: 'Campaigns', to: '/marketing/campaigns' },
    { icon: Target, label: 'Lead Generation', to: '/marketing/leads' },
    { icon: Share2, label: 'Lead Sources', to: '/marketing/sources' },
    { icon: Users, label: 'Lead Handover', to: '/marketing/handover' },
    { icon: Globe, label: 'Social Media', to: '/marketing/social-media' },
    { icon: BarChart3, label: 'Campaign Performance', to: '/marketing/performance' },
    { icon: Bookmark, label: 'Marketing Tasks', to: '/marketing/tasks' },
    { icon: FileText, label: 'Reports', to: '/marketing/reports' },
    { icon: Settings, label: 'My Account', to: '/marketing/account' },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-brand-lilac bg-white/95 px-4 py-3 backdrop-blur-md md:px-8">
        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-brand-ink/60 transition-colors hover:bg-brand-lilac md:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-magenta text-[10px] font-bold text-white">
              {(activeWebsite?.name || user?.name || 'MK').slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="font-display text-sm font-bold leading-tight text-brand-ink">
                {activeWebsite?.name || user?.name || 'Marketing Executive'}
              </p>
              <p className="text-[10px] leading-tight text-brand-ink/50">
                <span className="font-semibold">Role:</span> Marketing
                <span className="mx-1.5">•</span>
                <span className="font-semibold">Status:</span> Active
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => {
                setSearchOpen((s) => !s);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="hidden items-center gap-2 rounded-xl border border-brand-lilac bg-white px-3 py-2 text-xs text-brand-ink/50 transition-all hover:border-brand-purple/40 hover:text-brand-ink md:flex"
            >
              <Search size={14} />
              <span>Search...</span>
              <span className="ml-4 flex items-center gap-0.5 rounded border border-brand-lilac bg-brand-mist/60 px-1.5 py-0.5 text-[9px] font-bold text-brand-ink/50">
                <Command size={8} />K
              </span>
            </button>

            <button
              onClick={() => {
                setSearchOpen((s) => !s);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="rounded-lg p-2 text-brand-ink/60 transition-colors hover:bg-brand-lilac md:hidden"
            >
              <Search size={20} />
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-brand-lilac bg-white shadow-panel animate-dropdown">
                <div className="border-b border-brand-lilac/60 p-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" />
                    <input
                      ref={searchInputRef}
                      placeholder="Search pages, campaigns, leads..."
                      className="w-full rounded-lg border border-brand-lilac/60 bg-brand-mist/40 py-2 pl-9 pr-8 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/15"
                    />
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto p-1">
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                    Quick Navigate
                  </p>
                  {searchResults.map(({ icon: Icon, label, to }) => (
                    <button
                      key={label}
                      onClick={() => {
                        navigate(to);
                        setSearchOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-brand-ink/70 transition-colors hover:bg-brand-lilac/40 hover:text-brand-purple"
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((n) => !n);
                setProfileOpen(false);
              }}
              className="relative rounded-full p-2 text-brand-ink/60 transition-colors hover:bg-brand-lilac"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-magenta text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                  <span className="absolute -right-0.5 -top-0.5 h-4 w-4 animate-ping rounded-full bg-brand-magenta/60" />
                </>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-brand-lilac bg-white shadow-panel animate-dropdown">
                <div className="flex items-center justify-between border-b border-brand-lilac/60 px-4 py-3">
                  <h3 className="font-display text-sm font-semibold text-brand-ink">
                    Notifications
                  </h3>
                  <span className="rounded-full bg-brand-lilac px-2 py-0.5 text-[10px] font-semibold text-brand-purple">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => {
                          navigate(n.to);
                          setNotifOpen(false);
                        }}
                        className="flex w-full items-start gap-3 border-b border-brand-lilac/40 px-4 py-3 text-left transition-colors hover:bg-brand-mist/60"
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                          <Icon size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug text-brand-ink">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-brand-ink/40">
                            {n.time}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-brand-lilac/60 p-2">
                  <button
                    onClick={() => {
                      navigate('/marketing/communication');
                      setNotifOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-brand-purple hover:bg-brand-lilac/40"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen((p) => !p);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-brand-lilac"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-xs font-bold text-white shadow-sm">
                {user?.avatar || 'MK'}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-tight text-brand-ink">
                  {user?.name || 'Marketing'}
                </p>
                <p className="text-[10px] leading-tight text-brand-ink/50">
                  Marketing Executive
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`hidden text-brand-ink/40 transition-transform duration-300 sm:block ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-brand-lilac bg-white shadow-panel animate-dropdown">
                <div className="border-b border-brand-lilac/60 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-sm font-bold text-white">
                      {user?.avatar || 'MK'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">
                        {user?.name || 'Marketing'}
                      </p>
                      <p className="truncate text-[10px] text-brand-ink/50">
                        {user?.username || 'marketing'}
                      </p>
                      <span className="mt-0.5 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-brand-purple">
                        MARKETING
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-1">
                  {[
                    { icon: User, label: 'My Account', to: '/marketing/account' },
                    { icon: Settings, label: 'Preferences', to: '/marketing/account' },
                  ].map(({ icon: Icon, label, to }) => (
                    <button
                      key={label}
                      onClick={() => {
                        navigate(to);
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-ink/70 transition-colors hover:bg-brand-lilac/40"
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-brand-lilac/60 p-1">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <style>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown { animation: dropdown 0.18s ease-out forwards; }
      `}</style>
    </>
  );
}