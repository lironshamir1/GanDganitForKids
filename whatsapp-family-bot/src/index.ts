import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import * as cron from 'node-cron';
import { config } from './config';
import { appendDailyMessage, dueReminders, removeReminder } from './storage';
import { helpText } from './commands/help';
import { setReminder, showReminders } from './commands/reminder';
import { runSummary, runAutoSummary } from './commands/summary';
import { startRiddle, tryAnswer } from './commands/game';
import { handleChat } from './commands/chat';
import { getWeather } from './commands/weather';
import { handleShopping } from './commands/shopping';
import { buildPoll } from './commands/poll';
import { resolveChatId, stripPrefix, isAllowedChat } from './routing';

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: config.wwebjsAuthDir }),
  puppeteer: {
    headless: true,
    executablePath: config.puppeteerExecutablePath,
    protocolTimeout: 300000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--no-first-run',
      '--no-zygote',
    ],
  },
});

client.on('qr', (qr) => {
  console.log('\n📱 סרוק את ה-QR מהטלפון (וואטסאפ > מכשירים מקושרים):\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('✅ אומת בהצלחה.');
});

client.on('ready', () => {
  console.log('🤖 הבוט מוכן ומחובר לוואטסאפ!');
  if (config.familyGroupId) {
    console.log(`   קבוצה מוגדרת: ${config.familyGroupId}`);
  }
});

client.on('disconnected', (reason) => {
  console.error('🔌 נותקתי:', reason);
});

async function route(msg: Message): Promise<void> {
  const body = msg.body ?? '';
  const chatId = resolveChatId(msg);

  try {
    const chat = await msg.getChat();
    console.log(
      `📨 from=${chatId} author=${msg.author ?? '-'} isGroup=${chat.isGroup} name=${JSON.stringify(chat.name)} body=${JSON.stringify(body)}`,
    );
  } catch {
    console.log(`📨 [${chatId}] body=${JSON.stringify(body)}`);
  }

  if (!isAllowedChat(chatId, config.familyGroupId)) return;

  const mentionsBot = /@קלוד|@claude/i.test(body);
  const parsed = stripPrefix(body, config.botPrefix);

  if (!parsed && !mentionsBot) {
    if (body.trim()) {
      const sender = (await msg.getContact()).pushname ?? 'מישהו';
      appendDailyMessage(chatId, `${sender}: ${body}`);
      const riddleReply = await tryAnswer(chatId, body);
      if (riddleReply) await msg.reply(riddleReply);
    }
    return;
  }

  if (mentionsBot && !parsed) {
    const cleaned = body.replace(/@קלוד|@claude/gi, '').trim();
    const reply = await handleChat(cleaned);
    await msg.reply(reply);
    return;
  }

  if (!parsed) return;

  const { command, args } = parsed;

  try {
    switch (command) {
      case 'עזרה':
      case 'help':
        await msg.reply(helpText());
        break;
      case 'שאל':
      case 'ask':
        await msg.reply(await handleChat(args));
        break;
      case 'סיכום':
      case 'summary':
        await msg.reply(await runSummary(chatId));
        break;
      case 'תזכורת':
      case 'remind':
        await msg.reply(setReminder(chatId, msg.author ?? msg.from, args));
        break;
      case 'תזכורות':
      case 'reminders':
        await msg.reply(showReminders(chatId));
        break;
      case 'חידה':
      case 'riddle':
        await msg.reply(await startRiddle(chatId));
        break;
      case 'מזג':
      case 'weather':
        await msg.reply(await getWeather(args));
        break;
      case 'קניות':
      case 'shopping':
        await msg.reply(handleShopping(chatId, args));
        break;
      case 'סקר':
      case 'poll': {
        const { poll, error } = buildPoll(args);
        if (error) await msg.reply(error);
        else if (poll) await client.sendMessage(chatId, poll);
        break;
      }
      default:
        await msg.reply(`🤷 לא מכיר "${command}". שלחו ${config.botPrefix}עזרה`);
    }
  } catch (err) {
    console.error('Error handling command:', err);
    await msg.reply('😵 קרתה תקלה. נסו שוב בעוד רגע.');
  }
}

client.on('message_create', (msg) => {
  route(msg).catch((err) => console.error('route error:', err));
});

async function deliverDueReminders(): Promise<void> {
  const due = dueReminders();
  for (const r of due) {
    try {
      await client.sendMessage(r.chatId, `⏰ *תזכורת:* ${r.text}`);
    } catch (err) {
      console.error('Failed to send reminder:', err);
    }
    removeReminder(r.id);
  }
}

async function deliverAutoSummaries(): Promise<void> {
  if (!config.familyGroupId) return;
  const summary = await runAutoSummary(config.familyGroupId);
  if (summary) {
    try {
      await client.sendMessage(config.familyGroupId, summary);
    } catch (err) {
      console.error('Failed to send auto summary:', err);
    }
  }
}

cron.schedule('* * * * *', () => {
  deliverDueReminders().catch((err) => console.error('reminder tick:', err));
});

cron.schedule(
  '0 21 * * *',
  () => {
    deliverAutoSummaries().catch((err) => console.error('summary tick:', err));
  },
  { timezone: config.timezone },
);

client.initialize().catch((err) => {
  console.error('Failed to initialize WhatsApp client:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n👋 סוגר...');
  await client.destroy();
  process.exit(0);
});
