import { Poll } from 'whatsapp-web.js';

export function buildPoll(args: string): { poll?: Poll; error?: string } {
  let text = args.trim();
  if (!text) {
    return {
      error:
        '📊 איך יוצרים סקר?\n' +
        'דוגמה: !סקר מה אוכלים הערב? | פיצה | המבורגר | סושי\n' +
        'לבחירה מרובה: !סקר ++ מי מגיע? | אמא | אבא | יוני | דנה',
    };
  }

  let allowMultiple = false;
  if (text.startsWith('++')) {
    allowMultiple = true;
    text = text.slice(2).trim();
  }

  const parts = text.split('|').map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length < 3) {
    return {
      error:
        '📊 צריך שאלה ולפחות שתי אופציות, מופרדות ב-|\n' +
        'דוגמה: !סקר מה אוכלים הערב? | פיצה | סושי',
    };
  }

  const question = parts[0];
  const options = parts.slice(1, 13);
  return {
    poll: new Poll(question, options, {
      allowMultipleAnswers: allowMultiple,
      messageSecret: undefined,
    }),
  };
}
