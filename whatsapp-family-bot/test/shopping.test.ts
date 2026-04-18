import { describe, it, expect, beforeEach } from 'vitest';
import { handleShopping } from '../src/commands/shopping';
import { clearShoppingList } from '../src/storage';

const CHAT = 'test-chat@g.us';

describe('handleShopping', () => {
  beforeEach(() => {
    clearShoppingList(CHAT);
  });

  it('shows an empty-list message when no items exist', () => {
    const out = handleShopping(CHAT, '');
    expect(out).toMatch(/הרשימה ריקה/);
  });

  it('treats an unknown subcommand as an add', () => {
    const out = handleShopping(CHAT, 'חלב');
    expect(out).toMatch(/חלב/);
    expect(handleShopping(CHAT, '')).toMatch(/1\. חלב/);
  });

  it('adds with the explicit הוסף subcommand and increments count', () => {
    handleShopping(CHAT, 'הוסף חלב');
    const reply = handleShopping(CHAT, 'הוסף לחם');
    expect(reply).toMatch(/2 פריטים/);
  });

  it('removes by exact case-insensitive match', () => {
    handleShopping(CHAT, 'Milk');
    const reply = handleShopping(CHAT, 'מחק milk');
    expect(reply).toMatch(/הסרתי/);
    expect(handleShopping(CHAT, '')).toMatch(/הרשימה ריקה/);
  });

  it('falls back to substring match when exact match fails', () => {
    handleShopping(CHAT, 'חלב 3%');
    const reply = handleShopping(CHAT, 'מחק חלב');
    expect(reply).toMatch(/הסרתי "חלב 3%"/);
  });

  it('reports when target is not found', () => {
    handleShopping(CHAT, 'גבינה');
    const reply = handleShopping(CHAT, 'מחק שוקולד');
    expect(reply).toMatch(/לא מצאתי/);
  });

  it('clears the entire list with נקה', () => {
    handleShopping(CHAT, 'a');
    handleShopping(CHAT, 'b');
    expect(handleShopping(CHAT, 'נקה')).toMatch(/נמחקה/);
    expect(handleShopping(CHAT, '')).toMatch(/הרשימה ריקה/);
  });

  it('errors gracefully when add has no item', () => {
    expect(handleShopping(CHAT, 'הוסף')).toMatch(/מה להוסיף/);
  });

  it('errors gracefully when remove has no target', () => {
    expect(handleShopping(CHAT, 'מחק')).toMatch(/מה למחוק/);
  });
});
