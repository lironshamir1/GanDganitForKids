import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';

export interface Reminder {
  id: string;
  chatId: string;
  text: string;
  remindAt: number;
  createdBy: string;
}

export interface ActiveRiddle {
  chatId: string;
  riddle: string;
  createdAt: number;
}

interface Data {
  reminders: Reminder[];
  dailyMessages: Record<string, string[]>;
  activeRiddles: Record<string, ActiveRiddle>;
}

const DATA_FILE = path.join(config.dataDir, 'store.json');

function emptyData(): Data {
  return { reminders: [], dailyMessages: {}, activeRiddles: {} };
}

function load(): Data {
  try {
    if (!fs.existsSync(DATA_FILE)) return emptyData();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Data>;
    return {
      reminders: parsed.reminders ?? [],
      dailyMessages: parsed.dailyMessages ?? {},
      activeRiddles: parsed.activeRiddles ?? {},
    };
  } catch (err) {
    console.error('Failed to load store, starting fresh:', err);
    return emptyData();
  }
}

let data: Data = load();

function persist(): void {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function addReminder(r: Reminder): void {
  data.reminders.push(r);
  persist();
}

export function listReminders(chatId: string): Reminder[] {
  return data.reminders.filter((r) => r.chatId === chatId && r.remindAt > Date.now());
}

export function dueReminders(): Reminder[] {
  const now = Date.now();
  return data.reminders.filter((r) => r.remindAt <= now);
}

export function removeReminder(id: string): void {
  data.reminders = data.reminders.filter((r) => r.id !== id);
  persist();
}

export function appendDailyMessage(chatId: string, line: string): void {
  const key = chatId;
  if (!data.dailyMessages[key]) data.dailyMessages[key] = [];
  data.dailyMessages[key].push(line);
  if (data.dailyMessages[key].length > 500) {
    data.dailyMessages[key] = data.dailyMessages[key].slice(-500);
  }
  persist();
}

export function takeDailyMessages(chatId: string): string[] {
  const msgs = data.dailyMessages[chatId] ?? [];
  data.dailyMessages[chatId] = [];
  persist();
  return msgs;
}

export function peekDailyMessages(chatId: string): string[] {
  return data.dailyMessages[chatId] ?? [];
}

export function setActiveRiddle(r: ActiveRiddle): void {
  data.activeRiddles[r.chatId] = r;
  persist();
}

export function getActiveRiddle(chatId: string): ActiveRiddle | undefined {
  return data.activeRiddles[chatId];
}

export function clearActiveRiddle(chatId: string): void {
  delete data.activeRiddles[chatId];
  persist();
}
