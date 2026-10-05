// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Login
import Login from './pages/Login';

// Layouts
import SuperAdminLayout from './components/superadmin/SuperAdminLayout';
import AdminLayout from './components/admin/AdminLayout';
import AgentLayout from './components/agent/AgentLayout';
import MarketingLayout from './components/marketing/MarketingLayout';

// ==================== SUPER ADMIN PAGES ====================
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import Projects from './pages/superadmin/Projects';
import Admins from './pages/superadmin/Admins';
import SuperAdminAgents from './pages/superadmin/Agents';
import Customers from './pages/superadmin/Customers';
import SuperAdminLeads from './pages/superadmin/Leads';
import Calling from './pages/superadmin/Calling';
import SuperAdminLiveCalls from './pages/superadmin/LiveCalls';
import IVR from './pages/superadmin/IVR';
import Campaigns from './pages/superadmin/Campaigns';
import FollowUps from './pages/superadmin/FollowUps';
import Communication from './pages/superadmin/Communication';
import Credits from './pages/superadmin/Credits';
import Integrations from './pages/superadmin/Integrations';
import SuperAdminReports from './pages/superadmin/Reports';
import Security from './pages/superadmin/Security';
import Logs from './pages/superadmin/Logs';
import SuperAdminSettings from './pages/superadmin/Settings';

// ==================== ADMIN PAGES ====================
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAgents from './pages/admin/Agents';
import AdminLeads from './pages/admin/Leads';
import AdminCalling from './pages/admin/Calling';
import AdminCampaigns from './pages/admin/Campaigns';
import AdminCommunication from './pages/admin/Communication';
import AdminFollowUps from './pages/admin/FollowUps';
import AdminIntegrations from './pages/admin/Integrations';
import AdminIVR from './pages/admin/IVR';
import AdminLeadConfig from './pages/admin/LeadConfig';
import AdminLiveCalls from './pages/admin/LiveCalls';
import AdminProjectSettings from './pages/admin/ProjectSettings';
import AdminReports from './pages/admin/Reports';
import AdminTasks from './pages/admin/Tasks';
import AdminAccount from './pages/admin/Account';

// ==================== AGENT PAGES ====================
// Imported with "Agent" prefix to avoid name collisions with superadmin pages
import AgentDashboard from './pages/agent/AgentDashboard';
import MyLeads from './pages/agent/MyLeads';
import AgentCalls from './pages/agent/Calls';
import AgentFollowUps from './pages/agent/FollowUps';
import AgentCampaigns from './pages/agent/Campaigns';
import AgentReminders from './pages/agent/Reminders';
import AgentTasks from './pages/agent/Tasks';
import AgentCommunication from './pages/agent/Communication';
import AgentCallRecords from './pages/agent/CallRecords';
import AgentSearch from './pages/agent/Search';
import AgentPerformance from './pages/agent/Performance';
import AgentAccount from './pages/agent/Account';

// ==================== MARKETING EXECUTIVE PAGES ====================
import MarketingDashboard from './pages/marketing/MarketingDashboard';
import MarketingCampaigns from './pages/marketing/Campaigns';
import MarketingLeadGeneration from './pages/marketing/LeadGeneration';
import MarketingLeadSources from './pages/marketing/LeadSources';
import MarketingLeadHandover from './pages/marketing/LeadHandover';
import MarketingSocialMedia from './pages/marketing/SocialMedia';
import MarketingCampaignPerformance from './pages/marketing/CampaignPerformance';
import MarketingTasks from './pages/marketing/MarketingTasks';
import MarketingCommunication from './pages/marketing/MarketingCommunication';
import MarketingReports from './pages/marketing/MarketingReports';
import MarketingAccount from './pages/marketing/MyAccount';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* ==================== SUPER ADMIN ==================== */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allow={['superadmin']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="admins" element={<Admins />} />
            <Route path="agents" element={<SuperAdminAgents />} />
            <Route path="customers" element={<Customers />} />
            <Route path="leads" element={<SuperAdminLeads />} />
            <Route path="calling" element={<Calling />} />
            <Route path="live-calls" element={<SuperAdminLiveCalls />} />
            <Route path="ivr" element={<IVR />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="follow-ups" element={<FollowUps />} />
            <Route path="communication" element={<Communication />} />
            <Route path="credits" element={<Credits />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="reports" element={<SuperAdminReports />} />
            <Route path="security" element={<Security />} />
            <Route path="logs" element={<Logs />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>

          {/* ==================== ADMIN ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="calling" element={<AdminCalling />} />
            <Route path="campaigns" element={<AdminCampaigns />} />
            <Route path="communication" element={<AdminCommunication />} />
            <Route path="follow-ups" element={<AdminFollowUps />} />
            <Route path="integrations" element={<AdminIntegrations />} />
            <Route path="ivr" element={<AdminIVR />} />
            <Route path="lead-config" element={<AdminLeadConfig />} />
            <Route path="live-calls" element={<AdminLiveCalls />} />
            <Route path="project-settings" element={<AdminProjectSettings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="account" element={<AdminAccount />} />
          </Route>

          {/* ==================== AGENT ==================== */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute allow={['agent']}>
                <AgentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/agent/dashboard" replace />} />

            {/* -------- sidebar 1:1 -------- */}
            <Route path="dashboard"     element={<AgentDashboard />} />
            <Route path="leads"         element={<MyLeads />} />
            <Route path="calls"         element={<AgentCalls />} />
            <Route path="follow-ups"    element={<AgentFollowUps />} />
            <Route path="campaigns"     element={<AgentCampaigns />} />
            <Route path="reminders"     element={<AgentReminders />} />
            <Route path="tasks"         element={<AgentTasks />} />
            <Route path="communication" element={<AgentCommunication />} />
            <Route path="call-records"  element={<AgentCallRecords />} />
            <Route path="search"        element={<AgentSearch />} />
            <Route path="performance"   element={<AgentPerformance />} />
            <Route path="account"       element={<AgentAccount />} />

          </Route>

          <Route
            path="/marketing"
            element={
              <ProtectedRoute allow={['marketing', 'admin']}>
                <MarketingLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/marketing/dashboard" replace />} />
            <Route path="dashboard"     element={<MarketingDashboard />} />
            <Route path="campaigns"     element={<MarketingCampaigns />} />
            <Route path="leads"         element={<MarketingLeadGeneration />} />
            <Route path="sources"       element={<MarketingLeadSources />} />
            <Route path="handover"      element={<MarketingLeadHandover />} />
            <Route path="social-media"  element={<MarketingSocialMedia />} />
            <Route path="performance"   element={<MarketingCampaignPerformance />} />
            <Route path="tasks"         element={<MarketingTasks />} />
            <Route path="communication" element={<MarketingCommunication />} />
            <Route path="reports"       element={<MarketingReports />} />
            <Route path="account"       element={<MarketingAccount />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}