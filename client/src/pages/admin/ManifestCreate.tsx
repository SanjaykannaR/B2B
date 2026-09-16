import React from 'react';
import { WizardContainer } from '../../components/admin/ManifestWizard/WizardContainer';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';

export const ManifestCreate: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden"
      style={{ background: 'var(--color-surface)' }}>
      {/* Ambient gradient blobs */}
      <div className="absolute top-0 inset-x-0 h-72 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.04), transparent)' }} />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(139,92,246,0.06)' }} />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(59,130,246,0.06)' }} />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto">
        <AnimatedCard>
          <WizardContainer />
        </AnimatedCard>
      </div>
    </div>
  );
};
