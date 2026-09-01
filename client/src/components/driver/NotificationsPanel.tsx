import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiBell, FiArrowLeft, FiChevronDown, FiSend, FiX } from 'react-icons/fi';
import {
  getNotifications,
  replyToNotification,
  toggleReaction,
  markRead,
  markAllRead,
  type DriverNotification,
} from '../../services/notificationService';

const QUICK_REPLIES = ['Noted', 'On my way', 'Taking a break', 'Need more time', 'Understood'];
const QUICK_REACTIONS = ['👍', '👌', '💪', '🙏', '✔️'];

const TYPE_COLORS: Record<DriverNotification['type'], string> = {
  info: '#3B82F6',
  warning: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
};

const TYPE_LABELS: Record<DriverNotification['type'], string> = {
  info: 'Info',
  warning: 'Update',
  success: 'Assigned',
  error: 'Alert',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

interface NotificationsPanelProps {
  open?: boolean;
  onClose?: () => void;
  onUnreadChange?: (count: number) => void;
  variant?: 'sheet' | 'page';
}

export default function NotificationsPanel({ open = false, onClose = () => {}, onUnreadChange, variant = 'sheet' }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<DriverNotification[]>(() => getNotifications());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!open && variant !== 'page') return null;

  const refresh = (list: DriverNotification[]) => {
    setNotifications(list);
    onUnreadChange?.(list.filter((n) => !n.isRead).length);
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleToggle = (id: string) => {
    refresh(markRead(id));
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleQuickReply = (id: string, text: string) => {
    refresh(replyToNotification(id, text));
    toast.success(`Sent: ${text}`);
  };

  const handleSendCustomReply = (id: string) => {
    const text = (drafts[id] ?? '').trim();
    if (!text) return;
    refresh(replyToNotification(id, text));
    setDrafts((d) => ({ ...d, [id]: '' }));
    toast.success('Reply sent');
  };

  const handleReaction = (id: string, emoji: string) => {
    refresh(toggleReaction(id, emoji));
  };

  const handleMarkAllRead = () => {
    refresh(markAllRead());
    toast.success('All notifications marked as read');
  };

  const listBody = () => (
    <>
      {notifications.length === 0 && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <FiBell size={36} color="#94A3B8" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.25rem 0' }}>You're all caught up</div>
          <div style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>New messages from dispatch will show up here.</div>
        </div>
      )}

      {notifications.map((n) => {
        const expanded = expandedId === n.id;
        const accent = TYPE_COLORS[n.type];
        return (
          <div
            key={n.id}
            className="b2b-tap"
            onClick={() => handleToggle(n.id)}
            style={{
              cursor: 'pointer',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: `4px solid ${accent}`,
              borderRadius: '0.875rem',
              boxShadow: '0 1px 3px rgba(26, 29, 38, 0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: `${accent}1A`,
                    color: accent,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.6875rem',
                    flexShrink: 0,
                  }}
                >
                  {n.sender.charAt(0)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#1E293B' }}>{n.sender}</span>
                    <span style={{ fontSize: '0.625rem', color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {TYPE_LABELS[n.type]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>{formatTime(n.time)}</div>
                </div>
                {!n.isRead && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF6B2C', flexShrink: 0 }} />
                )}
                <FiChevronDown
                  size={14}
                  style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', color: '#94A3B8' }}
                />
              </div>

              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1B2A4A', lineHeight: 1.3 }}>{n.title}</div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.45 }}>{n.message}</div>
              {n.relatedManifest && (
                <span
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    padding: '2px 8px',
                    fontSize: '0.6875rem',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 700,
                    color: '#1B2A4A',
                  }}
                >
                  #{n.relatedManifest}
                </span>
              )}

              {n.replies.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {n.replies.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        alignSelf: r.author === 'You' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: r.author === 'You' ? '#EDE9FE' : '#F1F5F9',
                        color: r.author === 'You' ? '#5B21B6' : '#334155',
                        borderRadius: '0.75rem',
                        padding: '0.375rem 0.625rem',
                        fontSize: '0.75rem',
                        lineHeight: 1.35,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{r.author}</div>
                      <div>{r.text}</div>
                      <div style={{ fontSize: '0.625rem', color: '#94A3B8', marginTop: '2px' }}>{formatTime(r.time)}</div>
                    </div>
                  ))}
                </div>
              )}

              {n.reactions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {n.reactions.map((r) => (
                    <span
                      key={r.emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(n.id, r.emoji);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#FFF7ED',
                        border: '1px solid #FFEDD5',
                        borderRadius: '9999px',
                        padding: '2px 8px',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{r.emoji}</span>
                      <span style={{ fontSize: '0.6875rem', color: '#C2410C', fontWeight: 700 }}>{r.count}</span>
                    </span>
                  ))}
                </div>
              )}

              {expanded && (
                <div style={{ borderTop: '1px solid #EDF0F7', paddingTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {QUICK_REACTIONS.map((emoji) => {
                      const reacted = n.reactions.some((r) => r.emoji === emoji);
                      return (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(n.id, emoji);
                          }}
                          aria-label={`React ${emoji}`}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '0.625rem',
                            border: reacted ? '1px solid #FDBA74' : '1px solid #E2E8F0',
                            backgroundColor: reacted ? '#FFF7ED' : '#F8FAFC',
                            fontSize: '1.0625rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {QUICK_REPLIES.map((text) => (
                      <button
                        key={text}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickReply(n.id, text);
                        }}
                        style={{
                          backgroundColor: '#EDE9FE',
                          color: '#5B21B6',
                          border: '1px solid #DDD6FE',
                          borderRadius: '9999px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {text}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={drafts[n.id] ?? ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [n.id]: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          handleSendCustomReply(n.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0.75rem',
                        fontSize: '0.8125rem',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendCustomReply(n.id);
                      }}
                      disabled={!(drafts[n.id] ?? '').trim()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 38,
                        height: 38,
                        borderRadius: '0.75rem',
                        border: 'none',
                        backgroundColor: '#FF6B2C',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        flexShrink: 0,
                        opacity: (drafts[n.id] ?? '').trim() ? 1 : 0.4,
                      }}
                    >
                      <FiSend size={16} />
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );

  if (variant === 'page') {
    return (
      <div style={{ flex: 1, minHeight: 0, backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button
            onClick={onClose}
            aria-label="Back"
            className="b2b-tap"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid #E2E8F0', borderRadius: '0.75rem', backgroundColor: '#F8FAFC', color: '#1B2A4A', cursor: 'pointer', flexShrink: 0 }}
          >
            <FiArrowLeft size={18} strokeWidth={2.5} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#1B2A4A' }}>Notifications</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {unread > 0 ? `${unread} unread message${unread === 1 ? '' : 's'}` : "You're all caught up"}
            </div>
          </div>

          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                backgroundColor: '#EDE9FE',
                color: '#7C3AED',
                border: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {listBody()}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 27, 51, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          alignSelf: 'center',
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          boxShadow: '0 -12px 32px rgba(15, 27, 51, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '82%',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1rem 1.25rem 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: '9999px', backgroundColor: '#CBD5E1', margin: '0 auto 0.875rem' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>Notifications</h3>
              {unread > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>{unread} unread message{unread === 1 ? '' : 's'}</div>
              )}
            </div>

            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  backgroundColor: '#EDE9FE',
                  color: '#7C3AED',
                  border: 'none',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Mark all read
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close notifications"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '0.75rem',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <FiX size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {listBody()}
        </div>
      </div>
    </div>
  );
}