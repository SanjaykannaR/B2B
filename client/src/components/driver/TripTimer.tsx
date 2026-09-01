import { useRecovery } from '../../hooks/useRecovery';
import './TripTimer.css';

interface TripTimerProps {
  manifestId: string | number;
  status: string;
  initialStartTime?: string;
}

export default function TripTimer({ manifestId, status, initialStartTime }: TripTimerProps) {
  const { formattedTime, isRunning, startTime, isRecovered } = useRecovery(
    manifestId,
    status === 'In-Transit'
  );

  const getStatusText = () => {
    if (status === 'Delivered') return 'TRIP COMPLETED';
    if (status === 'Assigned') return 'TRIP NOT STARTED';
    if (status === 'Delayed') return 'TRIP DELAYED — TIMER RUNNING';
    if (isRunning) return 'LIVE TRIP TIMER (ACTIVE)';
    return 'ELAPSED TRIP TIME';
  };

  const formattedStartTime = startTime
    ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : initialStartTime || 'Not started';

  return (
    <div className="trip-timer">
      <div className="trip-timer__glow" />

      <div className="trip-timer__header">
        <div className="trip-timer__title">
          <span
            className={`trip-timer__title-dot${isRunning ? ' animate-pulse' : ''}`}
            style={{
              backgroundColor: isRunning ? '#10B981' : status === 'Delivered' ? '#60A5FA' : '#F59E0B',
              boxShadow: isRunning ? '0 0 8px #10B981' : 'none',
            }}
          />
          <span className="trip-timer__title-text">{getStatusText()}</span>
        </div>

        {isRecovered && isRunning && (
          <span className="trip-timer__badge">Timer restored</span>
        )}
      </div>

      <div className="trip-timer__time">
        <span className="trip-timer__time-value">{formattedTime}</span>
        <span className="trip-timer__time-label">HH:MM:SS</span>
      </div>

      <div className="trip-timer__footer">
        <div>
          <span style={{ color: '#CBD5E1' }}>Trip Started: </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#E2E8F0', fontWeight: 500 }}>
            {formattedStartTime}
          </span>
        </div>
        <div>
          <span style={{ color: '#CBD5E1' }}>Manifest: </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#818CF8', fontWeight: 600 }}>
            #{manifestId || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
