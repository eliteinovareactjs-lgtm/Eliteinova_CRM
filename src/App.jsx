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

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import Websites from './pages/superadmin/Websites';
import SuperAdminAgents from './pages/superadmin/Agents';
import SuperAdminLeads from './pages/superadmin/Leads';
import SuperAdminLiveCalls from './pages/superadmin/LiveCalls';
import SuperAdminReports from './pages/superadmin/Reports';
import SuperAdminSettings from './pages/superadmin/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAgents from './pages/admin/Agents';
import AdminLeads from './pages/admin/Leads';
import AdminLiveCalls from './pages/admin/LiveCalls';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Agent Pages
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
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="websites" element={<Websites />} />
            <Route path="agents" element={<SuperAdminAgents />} />
            <Route path="leads" element={<SuperAdminLeads />} />
            <Route path="live-calls" element={<SuperAdminLiveCalls />} />
            <Route path="reports" element={<SuperAdminReports />} />
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