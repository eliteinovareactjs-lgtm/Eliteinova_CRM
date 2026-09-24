// src/components/superadmin/SuperAdminSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Globe, Users, ClipboardList, BarChart3, Settings,
  Phone, UserCog, Megaphone, Calendar, MessageSquare, Coins, Plug,
  Lock, FileText, PhoneCall, Building2,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/superadmin/projects', label: 'Projects', icon: Globe },
      { to: '/superadmin/admins', label: 'Administrators', icon: UserCog },
      { to: '/superadmin/agents', label: 'Agents & Teams', icon: Users },
      { to: '/superadmin/customers', label: 'Customers', icon: Building2 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/superadmin/leads', label: 'Leads', icon: ClipboardList },
      { to: '/superadmin/calling', label: 'Calling', icon: Phone },
      { to: '/superadmin/ivr', label: 'IVR Management', icon: PhoneCall },
      { to: '/superadmin/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/superadmin/follow-ups', label: 'Follow-Ups', icon: Calendar },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/superadmin/communication', label: 'Communication', icon: MessageSquare },
      { to: '/superadmin/credits', label: 'Credits & Usage', icon: Coins },
      { to: '/superadmin/integrations', label: 'Integrations', icon: Plug },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/superadmin/reports', label: 'Reports', icon: BarChart3 },
      { to: '/superadmin/security', label: 'Security', icon: Lock },
      { to: '/superadmin/logs', label: 'System Logs', icon: FileText },
      { to: '/superadmin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function SuperAdminSidebar({ open, onClose }) {
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
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-button text-white shadow-card">
            <Globe size={18} />
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight text-brand-ink">
              ELITEINOVA <span className="text-brand-magenta">CRM</span>
            </p>
            <p className="text-[9px] font-semibold tracking-wide text-brand-ink/40">
              SUPER ADMIN
            </p>
          </div>
        </div>

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