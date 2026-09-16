// This file is for: Formatting utility functions
// Module: Frontend Utilities (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

/**
 * Formats a date string or object to "MMM DD, YYYY" (e.g. "Jul 23, 2026")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a date string or object to "MMM DD, YYYY h:mm A" (e.g. "Jul 23, 2026 3:30 PM")
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats currency amount to e.g. "$1,234.56"
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = 'USD'): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Formats weight to e.g. "4,000 kg"
 */
export const formatWeight = (kg: number | null | undefined): string => {
  if (kg === null || kg === undefined || isNaN(kg)) return '0 kg';
  return `${new Intl.NumberFormat('en-US').format(kg)} kg`;
};

/**
 * Formats volume to e.g. "60 m³"
 */
export const formatVolume = (m3: number | null | undefined): string => {
  if (m3 === null || m3 === undefined || isNaN(m3)) return '0 m³';
  return `${new Intl.NumberFormat('en-US').format(m3)} m³`;
};

/**
 * Formats distance to e.g. "432 km"
 */
export const formatDistance = (km: number | null | undefined): string => {
  if (km === null || km === undefined || isNaN(km)) return '0 km';
  return `${new Intl.NumberFormat('en-US').format(Math.round(km))} km`;
};

/**
 * Formats duration in minutes to e.g. "7h 12m"
 */
export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || isNaN(minutes) || minutes < 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

/**
 * Formats elapsed milliseconds to "HH:MM:SS" (trip timer)
 */
export const formatElapsedTime = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined || isNaN(ms) || ms < 0) return '00:00:00';
  const totalSecs = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};

/**
 * Formats tracking ID to uppercase with prefix e.g. TRK-123456
 */
export const formatTrackingId = (id: string | null | undefined): string => {
  if (!id) return 'N/A';
  if (id.startsWith('TRK-')) return id;
  return `TRK-${id.toUpperCase()}`;
};
