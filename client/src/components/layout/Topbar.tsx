import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store/store';
import { logout } from '../../store/authSlice';
import { FiMenu, FiLogOut } from 'react-icons/fi';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, role } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 60,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              border: '1px solid #E2E8F0',
              borderRadius: '0.375rem',
              backgroundColor: '#F8FAFC',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <FiMenu size={18} color="#1B2A4A" strokeWidth={2.5} />
          </button>
        )}

        <span
          style={{
            backgroundColor: '#1B2A4A',
            color: '#FFFFFF',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '9999px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {role ?? '…'}
        </span>
        <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.name ?? 'Signed in'}
        </span>
      </div>

      <button
        onClick={handleLogout}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#F1F5F9',
          color: '#1B2A4A',
          border: '1px solid #CBD5E1',
          padding: '0.375rem 0.875rem',
          borderRadius: '0.375rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <FiLogOut size={15} strokeWidth={2.5} />
        Logout
      </button>
    </header>
  );
}
