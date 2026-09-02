import React from 'react';
import { X, User, FileText, Phone, Mail, Package, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface ClientRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onContact?: (id: string) => void;
}

// Status pill rendered inline — avoids modifying shared StatusBadge
const STATUS_STYLE: Record<string, { text: string; bg: string; dot: string }> = {
  PENDING:   { text: '#D97706', bg: '#FEF3C7', dot: '#F59E0B' },
  APPROVED:  { text: '#059669', bg: '#D1FAE5', dot: '#10B981' },
  REJECTED:  { text: '#DC2626', bg: '#FEE2E2', dot: '#EF4444' },
  CONTACTED: { text: '#2563EB', bg: '#DBEAFE', dot: '#3B82F6' },
};

export const ClientRequestDetailModal: React.FC<ClientRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  onContact,
}) => {
  if (!isOpen || !request) return null;

  const id = request._id || request.id;
  const statusConf = (STATUS_STYLE[request.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.PENDING) as { text: string; bg: string; dot: string };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 animate-fade-in"
      style={{ background: 'var(--color-surface-modal)', zIndex: 10000 }}
    >
      <div
        className="w-full max-w-4xl max-h-[calc(100vh-8rem)] rounded-2xl flex flex-col overflow-hidden animate-scale-in"
        style={{ background: 'var(--color-surface-card)', boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Modal header — tracking ID + status badge + close button */}
        <div
          className="flex justify-between items-center p-5 border-b shrink-0"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          <div className="flex items-center gap-3">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
            >
              Client Request
            </h2>
            {/* Inline status pill */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
              style={{ color: statusConf.text, background: statusConf.bg }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusConf.dot }} />
              {request.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal body — two-column detail grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Left column — Client information */}
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}
            >
              <h3
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <User size={13} /> Client Information
              </h3>
              <div className="space-y-3">
                {/* Client name */}
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Name</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {request.clientName || '—'}
                  </p>
                </div>
                {/* Company name */}
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Company</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {request.companyName || '—'}
                  </p>
                </div>
                {/* GST number */}
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>GST Number</p>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {request.gstNumber || '—'}
                  </p>
                </div>
                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone size={12} style={{ color: 'var(--color-text-muted)' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Phone</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {request.phone || '—'}
                    </p>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-center gap-2">
                  <Mail size={12} style={{ color: 'var(--color-text-muted)' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Email</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {request.email || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — Goods / shipment details */}
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}
            >
              <h3
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Package size={13} /> Goods Details
              </h3>
              <div className="space-y-3">
                {/* Description */}
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Description</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {request.goodsDescription || '—'}
                  </p>
                </div>
                {/* Quantity + weight row */}
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Quantity</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {request.goodsQuantity ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Weight</p>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {request.goodsWeightKg ? `${request.goodsWeightKg.toLocaleString()} kg` : '—'}
                    </p>
                  </div>
                </div>
                {/* Origin city */}
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#3B82F6' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Origin</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {request.originCity || '—'}
                    </p>
                  </div>
                </div>
                {/* Destination city */}
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#10B981' }} />
                  <div>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Destination</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {request.destinationCity || '—'}
                    </p>
                  </div>
                </div>
                {/* Timestamp */}
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Submitted</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatDateTime(request.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional notes if present */}
          {request.notes && (
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}
            >
              <h3
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <FileText size={13} /> Notes
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                {request.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer — action buttons */}
        <div
          className="p-4 border-t flex flex-wrap justify-end gap-2 shrink-0"
          style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}
        >
          {/* Contact Client — always visible */}
          <button
            onClick={() => onContact?.(id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 min-h-[44px]"
            style={{
              background: 'var(--color-accent)',
              boxShadow: '0 4px 14px rgba(255,107,44,0.3)',
            }}
          >
            <MessageCircle size={14} /> Contact Client
          </button>

          {/* Reject — only for PENDING requests */}
          {request.status === 'PENDING' && (
            <button
              onClick={() => onReject?.(id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 min-h-[44px]"
              style={{
                background: 'var(--color-surface-card)',
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <XCircle size={14} /> Reject
            </button>
          )}

          {/* Approve — only for PENDING requests */}
          {request.status === 'PENDING' && (
            <button
              onClick={() => onApprove?.(id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 min-h-[44px]"
              style={{
                background: '#10B981',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              <CheckCircle size={14} /> Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
