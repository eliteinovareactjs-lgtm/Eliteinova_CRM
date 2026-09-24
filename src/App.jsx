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
import AdminLiveCalls from './pages/admin/LiveCalls';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// ==================== AGENT PAGES ====================
import AgentDashboard from './pages/agent/AgentDashboard';
import MyLeads from './pages/agent/MyLeads';
import AgentLiveCalls from './pages/agent/LiveCalls';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login */}
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

            {/* Overview */}
            <Route path="dashboard" element={<SuperAdminDashboard />} />

            {/* Platform */}
            <Route path="projects" element={<Projects />} />
            <Route path="admins" element={<Admins />} />
            <Route path="agents" element={<SuperAdminAgents />} />
            <Route path="customers" element={<Customers />} />

            {/* Operations */}
            <Route path="leads" element={<SuperAdminLeads />} />
            <Route path="calling" element={<Calling />} />
            <Route path="live-calls" element={<SuperAdminLiveCalls />} />
            <Route path="ivr" element={<IVR />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="follow-ups" element={<FollowUps />} />

            {/* Communication */}
            <Route path="communication" element={<Communication />} />
            <Route path="credits" element={<Credits />} />
            <Route path="integrations" element={<Integrations />} />

            {/* System */}
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
            <Route path="live-calls" element={<AdminLiveCalls />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
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
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="leads" element={<MyLeads />} />
            <Route path="live-calls" element={<AgentLiveCalls />} />
          </Route>

          {/* 404 — redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}