// Date and currency helpers extracted from the original application.

export const formatEpochToDate = (epochSeconds) => {
  if (!epochSeconds) return 'N/A';
  const d = new Date(epochSeconds * 1000);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const epochToInputString = (epochSeconds) => {
  if (!epochSeconds) return '';
  const d = new Date(epochSeconds * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const inputStringToEpoch = (dateStr) => {
  if (!dateStr) return Math.floor(Date.now() / 1000);
  const d = new Date(dateStr + 'T12:00:00');
  return Math.floor(d.getTime() / 1000);
};

export const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num);
};
