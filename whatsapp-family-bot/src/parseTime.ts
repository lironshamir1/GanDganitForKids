const UNIT_MS: Record<string, number> = {
  'דקה': 60_000,
  'דקות': 60_000,
  'שעה': 3_600_000,
  'שעות': 3_600_000,
  'יום': 86_400_000,
  'ימים': 86_400_000,
  'm': 60_000,
  'min': 60_000,
  'h': 3_600_000,
  'hr': 3_600_000,
  'd': 86_400_000,
};

export function parseDuration(input: string): number | null {
  const trimmed = input.trim();

  const absolute = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (absolute) {
    const hh = parseInt(absolute[1], 10);
    const mm = parseInt(absolute[2], 10);
    if (hh > 23 || mm > 59) return null;
    const now = new Date();
    const target = new Date();
    target.setHours(hh, mm, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  const rel = /^(?:בעוד\s+)?(\d+)\s*([א-תA-Za-z]+)$/u.exec(trimmed);
  if (rel) {
    const amount = parseInt(rel[1], 10);
    const unit = rel[2];
    const ms = UNIT_MS[unit];
    if (!ms) return null;
    return Date.now() + amount * ms;
  }

  return null;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('he-IL', {
    timeZone: 'Asia/Jerusalem',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
