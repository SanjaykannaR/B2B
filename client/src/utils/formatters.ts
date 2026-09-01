export function formatElapsedTime(totalSeconds: number): string {
  if (totalSeconds < 0 || isNaN(totalSeconds)) return '00:00:00';
  const capped = Math.min(totalSeconds, 99 * 3600 + 59 * 60 + 59);
  const hours = Math.floor(capped / 3600);
  const minutes = Math.floor((capped % 3600) / 60);
  const seconds = capped % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatWeight(kg?: number): string {
  if (kg === undefined || kg === null) return '0 kg';
  return `${Number(kg).toLocaleString()} kg`;
}

export function formatVolume(m3?: number): string {
  if (m3 === undefined || m3 === null) return '0 m³';
  return `${Number(m3).toLocaleString()} m³`;
}

export function formatDistance(km?: number): string {
  if (km === undefined || km === null) return '0 km';
  return `${Number(km).toLocaleString()} km`;
}
