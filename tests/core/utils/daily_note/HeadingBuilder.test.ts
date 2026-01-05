// tests/core/utils/daily_note/HeadingBuilder.test.ts
import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';
import { i18n, getI18n } from 'src/i18n';
import type { Lang } from 'src/i18n';

describe('HeadingBuilder', () => {
  const setupLang = (lang: Lang) => {
    i18n.init(lang, getI18n(lang));
  };

  describe('Japanese headings', () => {
    beforeEach(() => setupLang('ja'));

    test('task.planned', () => {
      const heading = HeadingBuilder.create('task.planned');
      expect(heading).toBe('## ✅ 今日の予定タスク（手動で追記OK）');
    });

    test('note.kpt (repeatable section)', () => {
      const heading = HeadingBuilder.create('note.kpt');
      expect(heading).toBe('### 🧠 KPT分析');
    });
  });

  describe('English headings', () => {
    beforeEach(() => setupLang('en'));

    test('task.planned', () => {
      const heading = HeadingBuilder.create('task.planned');
      expect(heading).toBe('## ✅ Planned Tasks');
    });

    test('note.kpt (repeatable section)', () => {
      const heading = HeadingBuilder.create('note.kpt');
      expect(heading).toBe('### 🧠 KPT Analysis');
    });
  });
});
