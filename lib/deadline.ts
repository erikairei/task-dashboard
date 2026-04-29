export function getDeadlineStatus(deadline: string | null): { label: string; color: string; urgent: boolean } {
  if (!deadline) return { label: '期限なし', color: 'text-gray-400', urgent: false };
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) return { label: '期限切れ', color: 'text-red-600', urgent: true };
  if (diffDays <= 1) return { label: '今日中', color: 'text-red-500', urgent: true };
  if (diffDays <= 3) return { label: `${diffDays}日後`, color: 'text-orange-500', urgent: true };
  if (diffDays <= 7) return { label: `${diffDays}日後`, color: 'text-yellow-500', urgent: false };
  return { label: `${diffDays}日後`, color: 'text-green-600', urgent: false };
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return '—';
  return new Date(deadline).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}