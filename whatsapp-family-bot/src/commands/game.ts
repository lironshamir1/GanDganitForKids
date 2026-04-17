import { generateKidRiddle, checkRiddleAnswer } from '../claude';
import {
  setActiveRiddle,
  getActiveRiddle,
  clearActiveRiddle,
} from '../storage';

export async function startRiddle(chatId: string): Promise<string> {
  const riddle = await generateKidRiddle();
  setActiveRiddle({ chatId, riddle, createdAt: Date.now() });
  return riddle;
}

export async function tryAnswer(
  chatId: string,
  answer: string,
): Promise<string | null> {
  const active = getActiveRiddle(chatId);
  if (!active) return null;
  const response = await checkRiddleAnswer(active.riddle, answer);
  if (/נכון|צודק|מצוי|בדיוק|בול|כל הכבוד|יופי/i.test(response)) {
    clearActiveRiddle(chatId);
  }
  return response;
}
