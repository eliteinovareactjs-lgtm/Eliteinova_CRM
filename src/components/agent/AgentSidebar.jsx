// src/components/agent/AgentSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Phone, CalendarCheck, Megaphone,
  Bell, CheckSquare, MessageSquare, PhoneCall, Search,
  BarChart3, User, Menu, Headphones,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/agent/leads',      label: 'My Leads',   icon: Users },
      { to: '/agent/calls',      label: 'Calls',      icon: Phone },
      { to: '/agent/follow-ups', label: 'Follow-Ups', icon: CalendarCheck },
      { to: '/agent/campaigns',  label: 'Campaigns',  icon: Megaphone },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { to: '/agent/reminders',     label: 'Reminders',     icon: Bell },
      { to: '/agent/tasks',         label: 'My Tasks',      icon: CheckSquare },
      { to: '/agent/communication', label: 'Communication', icon: MessageSquare },
      { to: '/agent/call-records',  label: 'Call Records',  icon: PhoneCall },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/agent/search',      label: 'Search',         icon: Search },
      { to: '/agent/performance', label: 'My Performance', icon: BarChart3 },
      { to: '/agent/account',     label: 'My Account',     icon: User },
    ],
  },
];

export default function AgentSidebar({ open, collapsed, onToggleCollapse, onClose }) {
  const { activeWebsite } = useAuth();
  const width = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 flex h-screen ${width} flex-col border-r border-brand-lilac bg-white transition-all duration-300 md:sticky md:top-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand + toggle */}
        <div className="flex items-center justify-between gap-2 border-b border-brand-lilac/60 px-4 py-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-magenta text-white shadow-card">
              <Headphones size={18} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold leading-tight text-brand-ink">
                  ELITEINOVA <span className="text-brand-magenta">CRM</span>
                </p>
                <p className="truncate text-[9px] font-semibold tracking-wide text-brand-ink/40">
                  {activeWebsite?.name?.toUpperCase() || 'AGENT'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-brand-ink/60 hover:bg-brand-lilac md:flex"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <Menu size={18} />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-ink/60 hover:bg-brand-lilac md:hidden"
            title="Close"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Grouped nav — now the only scrollable area, fills remaining height */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    title={collapsed ? label : ''}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-card'
                          : 'text-brand-ink/60 hover:bg-brand-lilac hover:text-brand-purple'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}