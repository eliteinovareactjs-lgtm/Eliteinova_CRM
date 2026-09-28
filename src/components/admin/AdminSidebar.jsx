// src/components/admin/AdminSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Tag, Users, Phone, Zap, Calendar,
  Megaphone, PhoneCall, Bookmark, MessageSquare, BarChart3, Plug,
  Settings, User, Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Lead Management',
    items: [
      { to: '/admin/leads', label: 'All Leads', icon: ClipboardList },
      { to: '/admin/lead-config', label: 'Lead Configuration', icon: Tag },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/agents', label: 'Agents & Employees', icon: Users },
      { to: '/admin/calling', label: 'Calling', icon: Phone },
      { to: '/admin/live-calls', label: 'Live Calls', icon: Zap },
      { to: '/admin/follow-ups', label: 'Follow-Ups', icon: Calendar },
      { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/admin/ivr', label: 'IVR Management', icon: PhoneCall },
      { to: '/admin/tasks', label: 'Tasks & Reminders', icon: Bookmark },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/admin/communication', label: 'Communication', icon: MessageSquare },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/integrations', label: 'Integrations', icon: Plug },
      { to: '/admin/project-settings', label: 'Project Settings', icon: Settings },
      { to: '/admin/account', label: 'My Account', icon: User },
    ],
  },
];

export default function AdminSidebar({ open, onClose }) {
  const { activeWebsite } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 flex h-screen w-64 flex-col border-r border-brand-lilac bg-white transition-transform md:sticky md:top-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* BRAND */}
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-button text-white shadow-card">
            <Globe size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold leading-tight text-brand-ink">
              ELITEINOVA <span className="text-brand-magenta">CRM</span>
            </p>
            <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-brand-ink/40">
              {activeWebsite?.name || 'ADMIN'}
            </p>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-brand-ink/40">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                  >
                    <Icon size={18} />
                    {label}
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