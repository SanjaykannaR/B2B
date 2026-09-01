import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiAlertTriangle, FiPackage, FiClock, FiFileText, FiPlay, FiCheck } from 'react-icons/fi';
import StatusBadge from '../../components/shared/StatusBadge';
import ProgressStepper from '../../components/shared/ProgressStepper';
import TripTimer from '../../components/driver/TripTimer';
import { useRecovery } from '../../hooks/useRecovery';
import { getManifestById, updateManifestStatus, ManifestItem } from '../../services/driverService';
import { formatWeight, formatVolume, formatDateTime } from '../../utils/formatters';

interface ActiveDeliveryProps {
  manifestId?: string;
  onBack?: () => void;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ flexShrink: 0, minWidth: 0, width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(26, 29, 38, 0.06)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.875rem 1rem', borderBottom: '1px solid #EDF0F7' }}>
      <span style={{ display: 'inline-flex', color: '#FF6B2C' }}>{icon}</span>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>{title}</h3>
    </div>
  );
}

export default function ActiveDelivery({ manifestId = 'TRK-8902-NY', onBack }: ActiveDeliveryProps) {
  const navigate = useNavigate();
  const [manifest, setManifest] = useState<ManifestItem | null>(null);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [delayReason, setDelayReason] = useState('Traffic Congestion');
  const [customDelayNote, setCustomDelayNote] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const currentManifestId = manifestId || 'TRK-8902-NY';

  const { startTimer, clearTimer } = useRecovery(
    currentManifestId,
    manifest?.status === 'In-Transit'
  );

  useEffect(() => {
    const loaded = getManifestById(currentManifestId);
    if (loaded) {
      setManifest(loaded);
    } else {
      const fallback = getManifestById('TRK-8902-NY');
      setManifest(fallback);
    }
  }, [currentManifestId]);

  if (!manifest) {
    return (
      <div style={{ flex: 1, padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
        Loading manifest details...
      </div>
    );
  }

  const handleStartTrip = () => {
    startTimer();
    const updated = updateManifestStatus(manifest.id, 'In-Transit', 'Trip started by driver. Live timer initiated.');
    if (updated) setManifest(updated);
  };

  const handleReportDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const noteText = customDelayNote
      ? `${delayReason}: ${customDelayNote}`
      : `Delay reported: ${delayReason}`;

    const updated = updateManifestStatus(manifest.id, 'Delayed', noteText);
    if (updated) setManifest(updated);
    setShowDelayModal(false);
    setCustomDelayNote('');
  };

  const handleCompleteDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearTimer();
    const noteText = deliveryNotes
      ? `Delivery completed. Notes: ${deliveryNotes}`
      : 'Delivery completed successfully and verified.';

    const updated = updateManifestStatus(manifest.id, 'Delivered', noteText);
    if (updated) setManifest(updated);
    setShowCompleteModal(false);
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/driver');
    }
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <button
          onClick={handleBackClick}
          aria-label="Back"
          className="b2b-tap"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid #E2E8F0', borderRadius: '0.75rem', backgroundColor: '#F8FAFC', color: '#1B2A4A', cursor: 'pointer', flexShrink: 0 }}
        >
<FiArrowLeft size={18} strokeWidth={2.5} />
          </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: '0.9375rem', color: '#1B2A4A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {manifest.trackingId}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {manifest.clientName}
          </div>
        </div>

        <StatusBadge status={manifest.status} size="sm" />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '1rem 1rem 6.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {manifest.cargo.isHazmat && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', borderRadius: '0.75rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', fontWeight: 700 }}>
            <span style={{ display: 'inline-flex', color: '#B45309' }}><FiAlertTriangle size={16} strokeWidth={2.5} /></span>
            HAZMAT CLASS {manifest.cargo.hazmatClass ? manifest.cargo.hazmatClass.split(' ')[0] : '3'}
          </div>
        )}

        <Card style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.625rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Pickup · Origin</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1E293B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{manifest.origin}</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', color: '#FF6B2C', fontSize: '1.375rem', flexShrink: 0 }}><FiArrowRight size={24} /></div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '0.625rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Delivery · Destination</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1E293B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{manifest.destination}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 12px', marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid #EDF0F7', fontSize: '0.8125rem', color: '#475569' }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>{manifest.distanceKm} km</strong> · {manifest.estimatedDuration || '4h 30m'} est.</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: '#1B2A4A', flexShrink: 0 }}>V-102</span>
          </div>
        </Card>

        <TripTimer
          manifestId={manifest.id}
          status={manifest.status}
          initialStartTime={manifest.schedule.pickupTime}
        />

        <Card style={{ padding: '0.5rem 1rem 0.75rem' }}>
          <ProgressStepper currentStatus={manifest.status} />
        </Card>

        <Card>
          <CardHeader icon={<FiPackage size={16} />} title="Cargo Specifications" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', padding: '1rem' }}>
            <InfoItem label="Total Weight" value={formatWeight(manifest.cargo.weightKg)} />
            <InfoItem label="Total Volume" value={formatVolume(manifest.cargo.volumeM3)} />
            <InfoItem label="Item Count" value={`${manifest.cargo.itemCount} Units`} />
            <InfoItem
              label="HAZMAT"
              value={manifest.cargo.isHazmat ? 'Yes' : 'None'}
              valueColor={manifest.cargo.isHazmat ? '#DC2626' : '#059669'}
            />
          </div>
        </Card>

        <Card>
          <CardHeader icon={<FiClock size={16} />} title="Schedule & Windows" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
            <InfoItem label="Scheduled Pickup" value={formatDateTime(manifest.schedule.pickupTime)} />
            <InfoItem label="Delivery Window Close" value={formatDateTime(manifest.schedule.deliveryWindowClose)} valueColor="#DC2626" />
            <InfoItem
              label="Actual Delivery"
              value={manifest.schedule.actualDeliveryTime ? formatDateTime(manifest.schedule.actualDeliveryTime) : 'Not completed yet'}
              valueColor={manifest.schedule.actualDeliveryTime ? '#059669' : '#94A3B8'}
            />
          </div>
        </Card>

        <Card>
          <CardHeader icon={<FiFileText size={16} />} title="Activity Log" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1rem' }}>
            {manifest.activityLog.map((item, index) => (
              <div key={item.id || index} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#FF6B2C' : '#CBD5E1',
                      flexShrink: 0,
                      marginTop: '4px',
                    }}
                  />
                  {index !== manifest.activityLog.length - 1 && (
                    <div style={{ width: '2px', flex: 1, backgroundColor: '#E2E8F0', marginTop: '3px' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingBottom: index === manifest.activityLog.length - 1 ? 0 : '0.25rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '6px 8px' }}>
                    <div style={{ minWidth: 0 }}><StatusBadge status={item.status} size="sm" /></div>
                    <span style={{ fontSize: '0.6875rem', color: '#94A3B8', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap' }}>
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>
                  <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.8125rem', color: '#1E293B', fontWeight: 500, lineHeight: 1.4 }}>
                    {item.note}
                  </p>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '2px' }}>
                    by {item.actor || 'System'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '0.75rem 1rem', boxShadow: '0 -6px 16px rgba(15, 27, 51, 0.06)' }}>
        {manifest.status === 'Assigned' && (
          <button
            onClick={handleStartTrip}
            className="b2b-tap"
            style={{
              width: '100%',
              backgroundColor: '#FF6B2C',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.9375rem 1.5rem',
              borderRadius: '0.875rem',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 44, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <FiPlay size={18} fill="currentColor" />
            Start Trip
          </button>
        )}

        {(manifest.status === 'In-Transit' || manifest.status === 'Delayed') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setShowDelayModal(true)}
              className="b2b-tap"
              style={{
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
                padding: '0.9375rem 0.5rem',
                borderRadius: '0.875rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              Report Delay
            </button>
            <button
              onClick={() => setShowCompleteModal(true)}
              className="b2b-tap"
              style={{
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.9375rem 0.5rem',
                borderRadius: '0.875rem',
                fontWeight: 800,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              Complete Delivery
            </button>
          </div>
        )}

        {manifest.status === 'Delivered' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.9375rem 1rem', borderRadius: '0.875rem', fontWeight: 800, fontSize: '0.9375rem' }}>
            <FiCheck size={18} strokeWidth={3} />
            Delivery Completed & Verified
          </div>
        )}
      </div>

      {showDelayModal && (
        <BottomSheet title="Report Trip Delay" subtitle="Select a category and provide details for the dispatch log." onClose={() => setShowDelayModal(false)}>
          <form onSubmit={handleReportDelaySubmit}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.375rem' }}>
              Delay Reason Category
            </label>
            <select
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #CBD5E1',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                marginBottom: '1rem',
              }}
            >
              <option value="Traffic Congestion">Traffic Congestion / Highway Closure</option>
              <option value="Severe Weather">Severe Weather Conditions</option>
              <option value="Vehicle Mechanical Inspection">Vehicle Mechanical / Inspection</option>
              <option value="Warehouse Loading Delay">Warehouse Loading / Staging Hold</option>
              <option value="Route Detour">Police / Highway Detour</option>
            </select>

            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.375rem' }}>
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Expecting 45-minute delay due to lane closure on I-95..."
              value={customDelayNote}
              onChange={(e) => setCustomDelayNote(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #CBD5E1',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '1.25rem',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Submit Delay Report
              </button>
            </div>
          </form>
        </BottomSheet>
      )}

      {showCompleteModal && (
        <BottomSheet title="Confirm Delivery" subtitle="Completing delivery will stop and clear the active trip timer." onClose={() => setShowCompleteModal(false)}>
          <form onSubmit={handleCompleteDeliverySubmit}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.375rem' }}>
              Delivery / Offloading Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Delivered to Bay 3. Receiver signed digital manifest."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #CBD5E1',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '1.25rem',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Confirm & Clear Timer
              </button>
            </div>
          </form>
        </BottomSheet>
      )}
    </div>
  );
}

function InfoItem({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: valueColor || '#1B2A4A', marginTop: '2px', fontFamily: "'IBM Plex Mono', monospace" }}>
        {value}
      </div>
    </div>
  );
}

function BottomSheet({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(15, 27, 51, 0.7)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          padding: '1.5rem 1.25rem 1.75rem',
          boxShadow: '0 -12px 32px rgba(15, 27, 51, 0.3)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: '9999px', backgroundColor: '#CBD5E1', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1B2A4A', margin: '0 0 0.25rem 0' }}>{title}</h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
