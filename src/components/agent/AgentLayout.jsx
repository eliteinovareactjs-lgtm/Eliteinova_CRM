// src/components/agent/AgentLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AgentSidebar from './AgentSidebar';
import AgentTopbar from './AgentTopbar';

export default function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  return (
    <div className="flex min-h-screen bg-brand-mist">
      <AgentSidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <AgentTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}