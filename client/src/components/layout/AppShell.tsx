import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MOBILE_BREAKPOINT = 900;
const SIDEBAR_STORAGE_KEY = 'b2b_sidebar_collapsed';

export default function AppShell() {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      if (!event.matches) {
        setMobileMenuOpen(false);
      }
    };
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
      return;
    }
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FC' }}>
      {!isMobile && <Sidebar collapsed={collapsed} />}

      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 27, 51, 0.6)',
            zIndex: 50,
          }}
        />
      )}

      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 60,
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s ease',
            boxShadow: mobileMenuOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          <Sidebar onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onMenuClick={handleToggleSidebar} />
        <main style={{ flex: 1, minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
