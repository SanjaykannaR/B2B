import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUnreadCount } from '../../services/notificationService';

const TRUCK_BG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="840" height="240" viewBox="0 0 840 240" fill="none" stroke="#FFFFFF" stroke-width="3">
  <rect x="16" y="64" width="470" height="108" rx="8" stroke-opacity="0.55"/>
  <path d="M498 172 V64 h82 c36 0 44 26 58 52 h40 v56 h-180 z" stroke-opacity="0.55"/>
  <line x1="514" y1="72" x2="588" y2="120" stroke-opacity="0.4"/>
  <rect x="500" y="38" width="16" height="26" rx="3" stroke-opacity="0.45"/>
  <circle cx="160" cy="182" r="22" stroke-opacity="0.5"/>
  <circle cx="600" cy="182" r="22" stroke-opacity="0.5"/>
  <circle cx="160" cy="182" r="8" stroke-opacity="0.35"/>
  <circle cx="600" cy="182" r="8" stroke-opacity="0.35"/>
  <rect x="240" y="86" width="120" height="64" rx="6" stroke-opacity="0.4"/>
  <path d="M-10 212 H850" stroke-dasharray="18 14" stroke-opacity="0.4"/>
</svg>`);

function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div
      style={{
        flexShrink: 0,
        height: 22,
        backgroundColor: '#0B1222',
        color: '#CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}
    >
      <span>{time}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <svg width="14" height="11" viewBox="0 0 24 24" fill="currentColor">
          <rect x="1" y="13" width="4" height="8" rx="1" />
          <rect x="7" y="9" width="4" height="12" rx="1" />
          <rect x="13" y="5" width="4" height="16" rx="1" />
          <rect x="19" y="1" width="4" height="20" rx="1" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 9.5 12 1l11 8.5v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="6" width="18" height="12" rx="2" />
          <line x1="23" y1="10" x2="23" y2="14" />
        </svg>
      </span>
    </div>
  );
}

export default function DriverMobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUnread(getUnreadCount());
  }, [location.pathname]);

  useEffect(() => {
    const onFocus = () => setUnread(getUnreadCount());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Driver';
  const initial = (user?.name?.charAt(0) ?? 'D').toUpperCase();

  return (
    <div className="b2b-phone-stage">
      <div className="b2b-phone-frame">
        <StatusBar />

        <header
          style={{
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1B2A4A 0%, #0F1B33 100%)',
            color: '#FFFFFF',
            padding: '0.875rem 1.25rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml;utf8,${TRUCK_BG}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.12,
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B2C 0%, #E55A1B 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  boxShadow: '0 4px 12px rgba(255, 107, 44, 0.4)',
                }}
              >
                {initial}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2px solid #0F1B33',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {firstName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                <span
                  className="animate-pulse"
                  style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0 }}
                />
                On duty
              </div>
            </div>

            <button
              onClick={() => navigate('/driver/notifications')}
              aria-label="Notifications"
              title="Notifications"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#CBD5E1',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unread > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    minWidth: 18,
                    height: 18,
                    padding: '0 4px',
                    borderRadius: '9999px',
                    backgroundColor: '#FF6B2C',
                    color: '#FFFFFF',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #1B2A4A',
                  }}
                >
                  {unread}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/driver/analytics')}
              aria-label="Analytics"
              title="Analytics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 107, 44, 0.4)',
                backgroundColor: 'rgba(255, 107, 44, 0.16)',
                color: '#FFB48A',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
          </div>
        </header>

        <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
