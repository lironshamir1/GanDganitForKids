import { askClaude } from '../claude';

export async function handleChat(prompt: string): Promise<string> {
  const clean = prompt.trim();
  if (!clean) {
    return '🤔 כתבו שאלה אחרי הפקודה. למשל: `!שאל איך מכינים שקשוקה?`';
  }
  return askClaude(clean);
}
