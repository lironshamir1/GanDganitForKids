# 👨‍👩‍👧‍👦 בוט משפחתי לוואטסאפ

בוט לקבוצת וואטסאפ משפחתית, מבוסס [OpenRouter](https://openrouter.ai/) (מודלים חינמיים) + [whatsapp-web.js](https://wwebjs.dev/).

## יכולות

- 💬 **שיחה חכמה** — שאלו את קלוד כל דבר (`!שאל ...` או `@קלוד ...`)
- 📝 **סיכום יומי** — סיכום השיחה בקבוצה (`!סיכום`, וגם אוטומטית כל ערב ב-21:00)
- ⏰ **תזכורות** — `!תזכורת 30 דקות להוציא עוגה`, `!תזכורת 18:00 לאסוף את דני`
- 🧩 **חידות לילדים** — `!חידה`, והילדים עונים בקבוצה

## הקמה

### דרישות מוקדמות

- Node.js 18+
- מפתח API של OpenRouter — **חינמי** מ-[openrouter.ai/keys](https://openrouter.ai/keys) (הרשמה ב-Google, בלי כרטיס אשראי)
- טלפון עם וואטסאפ

### התקנה

```bash
cd whatsapp-family-bot
npm install
cp .env.example .env
# ערכו את .env והוסיפו OPENROUTER_API_KEY
```

### החלפת מודל

ברירת המחדל היא `meta-llama/llama-3.3-70b-instruct:free` (חינמי, תומך עברית).
ניתן להחליף למודל אחר דרך `.env`:

```
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
# או: deepseek/deepseek-chat-v3.1:free
# או: mistralai/mistral-small-3.1-24b-instruct:free
```

רשימת המודלים החינמיים: https://openrouter.ai/models?q=free

### הרצה

```bash
# פיתוח
npm run dev

# ייצור
npm run build
npm start
```

בהרצה ראשונה יודפס QR בטרמינל. פתחו בטלפון: **וואטסאפ → הגדרות → מכשירים מקושרים → קישור מכשיר** וסרקו.

ההתחברות נשמרת ב-`.wwebjs_auth/` — בפעמים הבאות לא צריך לסרוק שוב.

### הגבלה לקבוצה ספציפית (מומלץ)

כדי שהבוט יגיב רק בקבוצה המשפחתית:

1. הריצו את הבוט, שלחו הודעה כלשהי בקבוצה.
2. חפשו בלוג את ה-`from` של ההודעה (משהו כמו `1234567890-987654321@g.us`).
3. העתיקו ל-`.env`:
   ```
   FAMILY_GROUP_ID=1234567890-987654321@g.us
   ```
4. הפעילו מחדש.

## פקודות

| פקודה | מה זה עושה |
|------|------------|
| `!עזרה` | רשימת פקודות |
| `!שאל <שאלה>` | שואל את קלוד |
| `@קלוד <שאלה>` | אותו דבר, בלי פרפיקס |
| `!סיכום` | סיכום שיחות היום |
| `!תזכורת <זמן> <טקסט>` | קובע תזכורת |
| `!תזכורות` | מציג תזכורות פעילות |
| `!חידה` | חידה לילדים |

### פורמטים של זמן לתזכורות

- `30 דקות` / `2 שעות` / `1 יום`
- `18:00` (השעה הקרובה)
- באנגלית: `30m`, `2h`, `1d`

## מבנה הפרויקט

```
whatsapp-family-bot/
├── src/
│   ├── index.ts          # חיבור לוואטסאפ, ראוטר, crons
│   ├── config.ts         # טעינת env
│   ├── claude.ts         # עטיפה ל-OpenRouter (דרך OpenAI SDK)
│   ├── storage.ts        # JSON persistence
│   ├── parseTime.ts      # פרסר זמן בעברית
│   └── commands/
│       ├── chat.ts
│       ├── help.ts
│       ├── summary.ts
│       ├── reminder.ts
│       └── game.ts
├── data/                 # JSON store (לא בגיט)
├── package.json
├── tsconfig.json
└── .env.example
```

## הערות

- הבוט שולח הודעות *בשם המשתמש שמחובר לוואטסאפ* — כל בן משפחה יוכל לראות שזה הוא ששולח.
- whatsapp-web.js הוא *לא רשמי*. Meta עלולים לחסום חשבונות ששולחים ספאם — אל תעשו מסחר/שיווק דרך הבוט.
- מומלץ להריץ על Raspberry Pi / שרת ביתי / VPS זול כדי שהבוט יהיה online.

## בעיות נפוצות

**QR לא מופיע** — ודאו ש-puppeteer הורד בהצלחה (`npm install` רץ עד הסוף).

**הבוט לא מגיב** — בדקו בלוג שההודעה מגיעה, וש-`FAMILY_GROUP_ID` תואם.

**"OPENROUTER_API_KEY is required"** — העתיקו `.env.example` ל-`.env` והוסיפו מפתח מ-[openrouter.ai/keys](https://openrouter.ai/keys).

**מודל לא נמצא / rate limit** — מודלים חינמיים משתנים. נסו מודל אחר מ-`OPENROUTER_MODEL` או בדקו ב-https://openrouter.ai/models?q=free.
