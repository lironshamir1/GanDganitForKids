import { describe, it, expect } from 'vitest';
import { buildPoll } from '../src/commands/poll';

describe('buildPoll', () => {
  it('returns help text when args are empty', () => {
    const { poll, error } = buildPoll('   ');
    expect(poll).toBeUndefined();
    expect(error).toMatch(/איך יוצרים סקר/);
  });

  it('errors when fewer than two options are given', () => {
    const { poll, error } = buildPoll('שאלה? | רק אחת');
    expect(poll).toBeUndefined();
    expect(error).toMatch(/שתי אופציות/);
  });

  it('builds a single-choice poll for a valid input', () => {
    const { poll, error } = buildPoll('מה אוכלים? | פיצה | סושי');
    expect(error).toBeUndefined();
    expect(poll).toBeDefined();
    expect(poll!.pollName).toBe('מה אוכלים?');
    expect(poll!.pollOptions.map((o) => o.name)).toEqual(['פיצה', 'סושי']);
    expect(poll!.options.allowMultipleAnswers).toBe(false);
  });

  it('honors the ++ multi-choice prefix', () => {
    const { poll } = buildPoll('++ מי מגיע? | אמא | אבא | יוני');
    expect(poll).toBeDefined();
    expect(poll!.options.allowMultipleAnswers).toBe(true);
    expect(poll!.pollOptions).toHaveLength(3);
  });

  it('caps options at 12', () => {
    const opts = Array.from({ length: 15 }, (_, i) => `opt${i}`).join(' | ');
    const { poll } = buildPoll(`q? | ${opts}`);
    expect(poll!.pollOptions).toHaveLength(12);
  });

  it('trims whitespace and skips empty pipe segments', () => {
    const { poll } = buildPoll('q? |  a  ||  b ');
    expect(poll!.pollOptions.map((o) => o.name)).toEqual(['a', 'b']);
  });
});
