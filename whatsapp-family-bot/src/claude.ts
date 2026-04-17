import OpenAI from 'openai';
import { config } from './config';

const client = new OpenAI({
  apiKey: config.openrouterApiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/lironshamir1/gandganitforkids',
    'X-Title': 'WhatsApp Family Bot',
  },
});

const FAMILY_SYSTEM_PROMPT = `אתה עוזר משפחתי חברותי שמשתתף בקבוצת וואטסאפ משפחתית.
- ענה תמיד בעברית, בטון חם, קליל ונעים.
- תשובות קצרות ומתאימות להודעה בוואטסאפ (פסקה-שתיים לרוב).
- אל תשתמש ב-Markdown כבד; וואטסאפ תומך ב-*bold*, _italic_, ~strike~.
- אם מבקשים משחק או חידה לילדים - תתאים את הרמה לגיל.
- אם לא ברור לך מה ביקשו - שאל שאלה קצרה להבהרה.`;

export async function askClaude(
  prompt: string,
  systemOverride?: string,
): Promise<string> {
  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: 2048,
    messages: [
      { role: 'system', content: systemOverride ?? FAMILY_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? '';
  return text || 'סליחה, לא הצלחתי לייצר תשובה. נסו שוב.';
}

export async function summarizeMessages(messages: string[]): Promise<string> {
  if (messages.length === 0) {
    return 'לא היו הודעות היום בקבוצה.';
  }
  const joined = messages.slice(-200).join('\n');
  const prompt = `סכם את השיחה המשפחתית הבאה מהקבוצה בעברית, בצורה קצרה ונעימה.
הדגש את הנושאים המרכזיים, החלטות שהתקבלו, ואירועים או תאריכים שהוזכרו.
אם היו מטלות פתוחות - ציין אותן בסוף ברשימה קצרה.

--- ההודעות ---
${joined}
--- סוף ---`;

  return askClaude(prompt);
}

export async function generateKidRiddle(ageGroup = '5-10'): Promise<string> {
  const prompt = `חבר חידה אחת מתאימה לילדים בגילאי ${ageGroup}.
פורמט:
🧩 *חידה:*
<שאלה>

_שלחו את התשובה שלכם בהודעה._
(אל תכלול את התשובה - נחשוף אותה אחר כך)`;
  return askClaude(prompt);
}

export async function checkRiddleAnswer(
  riddle: string,
  answer: string,
): Promise<string> {
  const prompt = `זאת החידה ששאלתי:
${riddle}

המשתמש ענה: "${answer}"

ענה בקצרה (1-2 שורות):
- אם התשובה נכונה (גם בערך): תגיב בהתלהבות והסבר קצר.
- אם לא - רמז עדין בלי לחשוף את התשובה.`;
  return askClaude(prompt);
}
