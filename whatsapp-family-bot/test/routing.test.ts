import { describe, it, expect } from 'vitest';
import { resolveChatId, stripPrefix, isAllowedChat } from '../src/routing';

describe('resolveChatId', () => {
  it('returns msg.from for incoming DM', () => {
    expect(resolveChatId({ fromMe: false, from: '5551@c.us', to: 'me@c.us' })).toBe('5551@c.us');
  });

  it('returns msg.to for outgoing DM', () => {
    expect(resolveChatId({ fromMe: true, from: 'me@c.us', to: '5551@c.us' })).toBe('5551@c.us');
  });

  it('returns msg.from (group jid) for incoming group message', () => {
    expect(resolveChatId({ fromMe: false, from: '123@g.us', to: 'me@c.us' })).toBe('123@g.us');
  });

  it('returns msg.to (group jid) for outgoing group message', () => {
    expect(resolveChatId({ fromMe: true, from: 'me@c.us', to: '123@g.us' })).toBe('123@g.us');
  });

  it('handles @lid group jids', () => {
    expect(resolveChatId({ fromMe: true, from: 'me@c.us', to: '148386892234785@lid' })).toBe(
      '148386892234785@lid',
    );
  });
});

describe('stripPrefix', () => {
  it('returns null when body has no prefix', () => {
    expect(stripPrefix('hello', '!')).toBeNull();
  });

  it('returns empty command for prefix-only body', () => {
    expect(stripPrefix('!', '!')).toEqual({ command: '', args: '' });
  });

  it('parses command without args', () => {
    expect(stripPrefix('!help', '!')).toEqual({ command: 'help', args: '' });
  });

  it('parses command and single arg', () => {
    expect(stripPrefix('!מזג ירושלים', '!')).toEqual({ command: 'מזג', args: 'ירושלים' });
  });

  it('preserves multi-word args verbatim', () => {
    expect(stripPrefix('!סקר what? | a | b', '!')).toEqual({
      command: 'סקר',
      args: 'what? | a | b',
    });
  });

  it('skips whitespace between prefix and command', () => {
    expect(stripPrefix('!  help me', '!')).toEqual({ command: 'help', args: 'me' });
  });

  it('supports multi-character prefixes', () => {
    expect(stripPrefix('//help', '//')).toEqual({ command: 'help', args: '' });
  });
});

describe('isAllowedChat', () => {
  it('allows any chat when no familyGroupId is configured', () => {
    expect(isAllowedChat('any@c.us', '')).toBe(true);
  });

  it('allows the matching chat', () => {
    expect(isAllowedChat('123@g.us', '123@g.us')).toBe(true);
  });

  it('blocks non-matching chats', () => {
    expect(isAllowedChat('999@c.us', '123@g.us')).toBe(false);
  });
});
