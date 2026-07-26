export function timeAgo(date: Date | null): string {
  if (!date) return "never";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function humanPeriod(seconds: number): string {
  if (seconds % 604800 === 0)
    return seconds === 604800 ? "weekly" : `every ${seconds / 604800}w`;
  if (seconds % 86400 === 0)
    return seconds === 86400 ? "daily" : `every ${seconds / 86400}d`;
  if (seconds % 3600 === 0)
    return seconds === 3600 ? "hourly" : `every ${seconds / 3600}h`;
  return `every ${Math.round(seconds / 60)}m`;
}
