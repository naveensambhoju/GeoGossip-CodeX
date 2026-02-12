export function formatFreshness(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.valueOf())) {
    return dateString;
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);
  const diffMs = startOfToday.getTime() - startOfTarget.getTime();
  const isToday = diffMs === 0;
  const isYesterday = diffMs === 24 * 60 * 60 * 1000;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = hours.toString().padStart(2, '0');

  if (isToday) {
    return `Today ${hourStr}:${minutes} ${ampm}`;
  }

  if (isYesterday) {
    return `Yesterday ${hourStr}:${minutes} ${ampm}`;
  }

  return `${day}-${month}-${year} ${hourStr}:${minutes} ${ampm}`;
}

export function formatExpiryCountdown(dateString?: string | null): string | null {
  if (!dateString) return null;

  const expiry = new Date(dateString);
  if (Number.isNaN(expiry.valueOf())) {
    return null;
  }

  const diffMs = expiry.getTime() - Date.now();
  if (diffMs <= 0) {
    return 'Exp - expired';
  }

  const totalMinutes = Math.max(1, Math.round(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `Exp - ${hours}h ${minutes.toString().padStart(2, '0')}m left`;
  }

  return `Exp - ${minutes}m left`;
}
