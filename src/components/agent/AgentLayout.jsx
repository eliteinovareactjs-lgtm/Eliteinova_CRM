// src/components/agent/AgentLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AgentSidebar from './AgentSidebar';
import AgentTopbar from './AgentTopbar';

export default function AgentLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-mist">
      <AgentSidebar
        open={open}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onClose={() => setOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <AgentTopbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}