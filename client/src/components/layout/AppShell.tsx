import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { RootState } from '../../store/store';

/**
 * AppShell — main authenticated layout (sidebar + topbar + content outlet).
 * Role-aware sidebar; admin sees every section (full access to all pages).
 */
export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((s: RootState) => s.auth);
  const role = user?.role || 'admin';

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
    >
      <Sidebar role={role} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden relative z-0"
          style={{
            marginLeft: 0,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
