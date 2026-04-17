import { summarizeMessages } from '../claude';
import { takeDailyMessages, peekDailyMessages } from '../storage';

export async function runSummary(chatId: string): Promise<string> {
  const messages = takeDailyMessages(chatId);
  if (messages.length === 0) {
    return '📭 אין הודעות חדשות לסכם.';
  }
  const body = await summarizeMessages(messages);
  return `📝 *סיכום הקבוצה (${messages.length} הודעות):*\n\n${body}`;
}

export async function runAutoSummary(chatId: string): Promise<string | null> {
  const messages = peekDailyMessages(chatId);
  if (messages.length < 5) return null;
  const body = await summarizeMessages(messages);
  takeDailyMessages(chatId);
  return `🌙 *סיכום יומי אוטומטי (${messages.length} הודעות):*\n\n${body}`;
}
