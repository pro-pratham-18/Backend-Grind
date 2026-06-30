export const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  let date;
  if (timestamp instanceof Date) date = timestamp;
  else if (timestamp.toDate) date = timestamp.toDate();
  else if (typeof timestamp === 'number') date = new Date(timestamp);
  else date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (totalSeconds) => {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

export const calculatePercentage = (score, max) => {
  if (!max || max <= 0) return 0;
  return Math.round((score / max) * 100);
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const getScoreColor = (percentage) => {
  if (percentage >= 70) return 'text-success';
  if (percentage >= 40) return 'text-warning';
  return 'text-error';
};

export const getScoreRingColor = (percentage) => {
  if (percentage >= 70) return '#10b981';
  if (percentage >= 40) return '#f59e0b';
  return '#ef4444';
};

// Re-export scoring limits for convenience
export { SCORING } from './constants.js';
