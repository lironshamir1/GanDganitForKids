import type { Message } from 'whatsapp-web.js';

export function resolveChatId(msg: Pick<Message, 'fromMe' | 'from' | 'to'>): string {
  return msg.fromMe ? msg.to : msg.from;
}

export interface ParsedCommand {
  command: string;
  args: string;
}

export function stripPrefix(body: string, prefix: string): ParsedCommand | null {
  if (!body.startsWith(prefix)) return null;
  const rest = body.slice(prefix.length).trimStart();
  const spaceIdx = rest.indexOf(' ');
  if (spaceIdx === -1) return { command: rest, args: '' };
  return {
    command: rest.slice(0, spaceIdx),
    args: rest.slice(spaceIdx + 1),
  };
}

export function isAllowedChat(chatId: string, familyGroupId: string): boolean {
  if (!familyGroupId) return true;
  return chatId === familyGroupId;
}
