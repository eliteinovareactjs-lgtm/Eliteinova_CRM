// src/components/marketing/MarketingSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, Target, Share2, Globe, BarChart3,
  Users, CheckSquare, MessageSquare, FileText, User, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/marketing/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Campaigns',
    items: [
      { to: '/marketing/campaigns', label: 'Marketing Campaigns', icon: Megaphone },
    ],
  },
  {
    label: 'Lead Generation',
    items: [
      { to: '/marketing/leads', label: 'All Marketing Leads', icon: Target },
      { to: '/marketing/sources', label: 'Lead Sources', icon: Share2 },
    ],
  },
  {
    label: 'Channels',
    items: [
      { to: '/marketing/social-media', label: 'Social Media', icon: Globe },
    ],
  },
  {
    label: 'Performance',
    items: [
      { to: '/marketing/performance', label: 'Campaign Performance', icon: BarChart3 },
      { to: '/marketing/handover', label: 'Lead Handover', icon: Users },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/marketing/tasks', label: 'Marketing Tasks', icon: CheckSquare },
      { to: '/marketing/communication', label: 'Communication', icon: MessageSquare },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/marketing/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/marketing/account', label: 'My Account', icon: User },
    ],
  },
];

export default function MarketingSidebar({ open, onClose }) {
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
              {activeWebsite?.name || 'MARKETING'}
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