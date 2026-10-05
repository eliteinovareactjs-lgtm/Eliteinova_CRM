// src/components/marketing/MarketingLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MarketingSidebar from './MarketingSidebar';
import MarketingTopbar from './MarketingTopbar';

export default function MarketingLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-mist/40">
      <MarketingSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MarketingTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}