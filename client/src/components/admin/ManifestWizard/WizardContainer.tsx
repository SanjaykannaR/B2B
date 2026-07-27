import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { StepPartner } from './StepPartner';
import { StepCargo } from './StepCargo';
import { StepRoute } from './StepRoute';
import * as manifestApi from '../../../services/manifestApi';

const STEPS = [
  { id: 1, name: 'Partner & Route' },
  { id: 2, name: 'Cargo Details' },
  { id: 3, name: 'Assign Vehicle' },
];

export const WizardContainer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    clientName: '',
    origin: { address: '', city: '', state: '', zipCode: '' },
    destination: { address: '', city: '', state: '', zipCode: '' },
    description: '',
    weight: 0,
    volume: 0,
    itemCount: 1,
    hazmat: false,
    assignedVehicle: null as string | null,
  });

  const next = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const update = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));

  const submit = async () => {
    try {
      setLoading(true);
      await manifestApi.createManifest(data as any);
      alert('Manifest created successfully!');
    } catch (e) {
      console.error(e);
      alert('Error creating manifest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
        Create Manifest
      </h1>

      {/* Progress Stepper */}
      <div className="relative flex items-center justify-between">
        {/* Background track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 rounded-full z-0"
          style={{ background: 'var(--color-surface-hover)' }} />
        {/* Active track */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            background: 'var(--color-accent)',
          }}
        />

        {STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isActive = step.id === currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                style={{
                  background: isActive ? 'var(--color-accent)' : isDone ? '#10B981' : 'var(--color-surface-card)',
                  color: isActive || isDone ? '#fff' : 'var(--color-text-muted)',
                  boxShadow: isActive ? '0 4px 14px rgba(255,107,44,0.35)' : 'none',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  border: isDone || isActive ? 'none' : '2px solid var(--color-border)',
                }}
              >
                {isDone ? <Check size={16} strokeWidth={3} /> : step.id}
              </div>
              <span
                className="absolute -bottom-6 text-[11px] font-semibold whitespace-nowrap"
                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div
        className="mt-12 rounded-2xl border p-6 sm:p-8 transition-all duration-300"
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)' }}
      >
        <div
          key={currentStep}
          className="animate-fade-in"
        >
          {currentStep === 1 && <StepPartner data={data} updateData={update} />}
          {currentStep === 2 && <StepCargo data={data} updateData={update} />}
          {currentStep === 3 && <StepRoute data={data} updateData={update} />}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-10 pt-6"
          style={{ borderTop: '1px solid var(--color-border-light)' }}>
          <button
            onClick={prev}
            disabled={currentStep === 1}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-0"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(255,107,44,0.3)' }}
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              style={{ background: '#10B981', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
            >
              {loading ? 'Creating...' : 'Create Manifest'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
