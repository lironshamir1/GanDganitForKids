import { randomUUID } from 'crypto';
import { addReminder, listReminders } from '../storage';
import { parseDuration, formatTime } from '../parseTime';

export function setReminder(
  chatId: string,
  userId: string,
  args: string,
): string {
  const match = /^(\S+)\s+(.+)$/s.exec(args.trim());
  if (!match) {
    return '❌ צריך זמן וטקסט. למשל: `!תזכורת 30 דקות להוציא אוכל`';
  }
  const [, timeStr, text] = match;
  const remindAt = parseDuration(timeStr);
  if (remindAt === null) {
    return `❌ לא הבנתי את הזמן "${timeStr}". נסו 30 דקות / 2 שעות / 18:00`;
  }

  addReminder({
    id: randomUUID(),
    chatId,
    text: text.trim(),
    remindAt,
    createdBy: userId,
  });

  return `⏰ רשמתי. אזכיר ב-${formatTime(remindAt)}: "${text.trim()}"`;
}

export function showReminders(chatId: string): string {
  const reminders = listReminders(chatId);
  if (reminders.length === 0) {
    return '📭 אין תזכורות פעילות בקבוצה.';
  }
  const lines = reminders
    .sort((a, b) => a.remindAt - b.remindAt)
    .map((r, i) => `${i + 1}. ${formatTime(r.remindAt)} — ${r.text}`);
  return `⏰ *תזכורות פעילות:*\n${lines.join('\n')}`;
}
