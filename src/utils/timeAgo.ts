export function formatTimeAgo(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMins < 5) return 'agora há pouco';
        return `há ${diffMins} min`;
      }
      return `hoje, há ${diffHours}h`;
    }
    if (diffDays === 1) {
      return 'ontem';
    }
    if (diffDays < 7) {
      return `há ${diffDays} dias`;
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return 'recentemente';
  }
}
