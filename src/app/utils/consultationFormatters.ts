export function formatDateTime(value?: string): string {
  if (!value) return 'TBD';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';

  const weekday = date.toLocaleDateString('en-IN', { weekday: 'short' });
  const dayMonthYear = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${weekday}, ${dayMonthYear} at ${time}`;
}

export function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return 'Duration not set';
  return `${minutes} minutes`;
}

export function formatCurrencyINR(amount?: number): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name?: string): string {
  if (!name) return 'NA';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'NA';
}

export function getStatusStyle(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('scheduled') || normalized.includes('upcoming')) {
    return 'bg-blue-100 text-blue-700';
  }
  if (normalized.includes('completed')) {
    return 'bg-violet-100 text-violet-700';
  }
  if (normalized.includes('cancelled')) {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-gray-100 text-gray-700';
}

export function getPaymentStyle(status?: string): string {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'paid' || normalized === 'completed') {
    return 'bg-green-100 text-green-700';
  }
  if (normalized === 'pending') {
    return 'bg-amber-100 text-amber-700';
  }
  if (normalized === 'failed') {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-gray-100 text-gray-700';
}
