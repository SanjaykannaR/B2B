import React from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const role = (JSON.parse(localStorage.getItem('user') || 'null') || {}).role;
  const home = role ? `/${role}` : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-surface)' }}>
      <div className="text-center max-w-sm">
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--color-primary-dark)', boxShadow: '0 8px 24px rgba(15,27,51,0.25)' }}
        >
          <PackageSearch size={28} style={{ color: 'var(--color-accent)' }} />
        </div>
        <p className="text-6xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>404</p>
        <h1 className="text-xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>Page not found</h1>
        <p className="text-sm mt-2 mb-6" style={{ color: 'var(--color-text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={home}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200"
          style={{ background: 'var(--color-accent)', boxShadow: '0 8px 20px rgba(255,107,44,0.3)' }}
        >
          <Home size={15} /> Go Home
        </Link>
      </div>
    </div>
  );
};
