export function daysUntil(deadline: string): number | null {
  const d = new Date(deadline + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(deadline: string): { text: string; cls: string } {
  const days = daysUntil(deadline);
  if (days === null) return { text: deadline, cls: 'text-spark-eggshell/60' };
  if (days < 0) return { text: 'Expired', cls: 'text-gray-400' };
  if (days === 0) return { text: 'Due today!', cls: 'text-red-400 font-semibold' };
  if (days <= 3) return { text: `${days}d left`, cls: 'text-red-400 font-semibold' };
  if (days <= 7) return { text: `${days}d left`, cls: 'text-orange-400 font-semibold' };
  if (days <= 30) return { text: `${days}d left`, cls: 'text-yellow-400' };
  return { text: `${days}d left`, cls: 'text-spark-eggshell/60' };
}
