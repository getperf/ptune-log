// tests/core/utils/daily_note/HeadingBuilder.test.ts

import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/specs/HeadingSpecRegistry';
import { i18n } from 'src/i18n';
import { DailyNoteLabelKey } from 'src/core/models/daily_notes/SectionKey';

jest.mock('src/i18n', () => ({
  i18n: {
    domain: {
      // 空の Record を用意（実運用では init 後に埋まる想定）
      daily_note: {} as Record<DailyNoteLabelKey, string>,
    },
  },
}));

/**
 * テスト用ユーティリティ
 * - Record を維持したまま、指定キーのみ上書き
 * - as any 不使用
 */
function setDailyNoteLabels(
  labels: Partial<Record<DailyNoteLabelKey, string>>
): void {
  Object.assign(i18n.domain.daily_note, labels);
  HeadingSpecRegistry.rebuildLabels();
}

describe('HeadingBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Japanese labels', () => {
    beforeAll(() => {
      setDailyNoteLabels({
        'task.planned': '今日の予定タスク',
        'note.review.memo': '振り返りメモ',
      });
    });

    it('creates Japanese heading with emoji', () => {
      const heading = HeadingBuilder.create('task.planned');
      expect(heading).toBe('## ✅ 今日の予定タスク');
    });

    it('creates Japanese heading with suffix', () => {
      const heading = HeadingBuilder.create('note.review.memo', {
        suffix: '（手動入力）',
      });
      expect(heading).toBe('## 🙌 振り返りメモ（手動入力）');
    });
  });

  describe('English labels', () => {
    beforeAll(() => {
      setDailyNoteLabels({
        'task.planned': 'Planned Tasks',
        'note.review.memo': 'Review Memo',
      });
    });

    it('creates English heading', () => {
      const heading = HeadingBuilder.create('task.planned');
      expect(heading).toBe('## ✅ Planned Tasks');
    });

    it('creates English heading with suffix', () => {
      const heading = HeadingBuilder.create('note.review.memo', {
        suffix: ' (manual)',
      });
      expect(heading).toBe('## 🙌 Review Memo (manual)');
    });
  });

  describe('error cases', () => {
    beforeAll(() => {
      // 上書きしない = ラベル未定義状態
      Object.keys(i18n.domain.daily_note).forEach((k) => {
        delete (i18n.domain.daily_note as any)[k];
      });
      HeadingSpecRegistry.rebuildLabels();
    });

    it('throws if label is missing', () => {
      expect(() =>
        HeadingBuilder.create('task.planned')
      ).toThrow('DailyNote label not found: task.planned');
    });
  });
});
