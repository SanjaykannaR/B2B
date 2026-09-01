import { Fragment } from 'react';

interface ProgressStepperProps {
  currentStatus?: string;
}

const STEPS = [
  { id: 'Pending', label: 'Pending', description: 'Order Placed' },
  { id: 'Assigned', label: 'Assigned', description: 'Driver Dispatched' },
  { id: 'In-Transit', label: 'In-Transit', description: 'On the Road' },
  { id: 'Delivered', label: 'Delivered', description: 'Completed' },
];

export default function ProgressStepper({ currentStatus = 'Assigned' }: ProgressStepperProps) {
  const getStepStatus = (index: number) => {
    const statusOrder = ['Pending', 'Assigned', 'In-Transit', 'Delivered'];
    
    let activeStatus = currentStatus;
    if (currentStatus === 'Delayed') {
      activeStatus = 'In-Transit';
    }

    const currentIndex = statusOrder.indexOf(activeStatus);

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return currentStatus === 'Delayed' ? 'delayed' : 'active';
    return 'upcoming';
  };

  return (
    <div style={{ width: '100%', padding: '1.25rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {STEPS.map((step, index) => {
          const stepState = getStepStatus(index);
          const isLast = index === STEPS.length - 1;

          let circleBg = '#E2E8F0';
          let circleColor = '#64748B';
          let borderColor = '#CBD5E1';
          let lineBg = '#E2E8F0';

          if (stepState === 'completed') {
            circleBg = '#10B981';
            circleColor = '#FFFFFF';
            borderColor = '#10B981';
            lineBg = '#10B981';
          } else if (stepState === 'active') {
            circleBg = '#1B2A4A';
            circleColor = '#FFFFFF';
            borderColor = '#FF6B2C';
            lineBg = '#E2E8F0';
          } else if (stepState === 'delayed') {
            circleBg = '#EF4444';
            circleColor = '#FFFFFF';
            borderColor = '#DC2626';
            lineBg = '#FEE2E2';
          }

          return (
            <Fragment key={step.id}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: circleBg,
                    color: circleColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    border: `2px solid ${borderColor}`,
                    boxShadow: stepState === 'active' ? '0 0 0 4px rgba(255, 107, 44, 0.2)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {stepState === 'completed' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: stepState !== 'upcoming' ? 700 : 500,
                      color: stepState === 'delayed' ? '#DC2626' : stepState !== 'upcoming' ? '#1B2A4A' : '#64748B',
                    }}
                  >
                    {stepState === 'delayed' ? 'Delayed' : step.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                    {step.description}
                  </div>
                </div>
              </div>

              {!isLast && (
                <div
                  style={{
                    height: '3px',
                    flex: 1,
                    backgroundColor: lineBg,
                    marginTop: '-24px',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
