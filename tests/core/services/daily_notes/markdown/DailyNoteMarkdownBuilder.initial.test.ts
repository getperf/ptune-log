// tests/core/services/daily_notes/markdown/DailyNoteMarkdownBuilder.initial.test.ts

import fs from 'fs';
import path from 'path';
import { DailyNoteParser } from 'src/core/services/daily_notes/parse/DailyNoteParser';
import { DailyNoteMarkdownBuilder } from 'src/core/services/daily_notes/markdown/DailyNoteMarkdownBuilder';
import { initLang } from '../parse/_helpers';

/**
 * 改行コード差分（CRLF / LF）と末尾改行を正規化
 */
function normalize(md: string): string {
  return md.replace(/\r\n/g, '\n').trimEnd() + '\n';
}

describe('DailyNoteMarkdownBuilder (daily_ja_initial)', () => {
  beforeAll(async () => {
    await initLang('ja');
  });

  it('parse -> build equals fixture', () => {
    const fixturePath = path.resolve(
      __dirname,
      '../parse/fixtures/daily_ja_initial.md'
    );

    const raw = fs.readFileSync(fixturePath, 'utf-8');

    const note = DailyNoteParser.parse(raw);
    const built = DailyNoteMarkdownBuilder.build(note);
    expect(normalize(built)).toBe(normalize(raw));
  });
});
