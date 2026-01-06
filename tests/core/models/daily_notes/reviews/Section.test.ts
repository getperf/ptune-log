// tests/core/models/daily_notes/reviews/entities/Section.test.ts
import { Section } from 'src/core/models/daily_notes/reviews/entities/Section';
import type { ParsedSection } from 'src/core/models/daily_notes/reviews';
import { createParsedSection } from '../../../../helpers/createParsedSection';

describe('Section entity', () => {
  describe('fromParsed()', () => {
    test('converts ParsedSection into Section', () => {
      const parsed = createParsedSection('note.review.memo', 'MEMO BODY');

      const section = Section.fromParsed(parsed);

      expect(section.key).toBe('note.review.memo');
      expect(section.heading).toBe('note.review.memo');
      expect(section.markdown).toBe('MEMO BODY');
      expect(section.isEmpty()).toBe(false);
    });
  });

  describe('fromParsedOrEmpty()', () => {
    test('returns Section from parsed when provided', () => {
      const parsed = createParsedSection('note.report', 'REPORT BODY');

      const section = Section.fromParsedOrEmpty(parsed, 'note.report');

      expect(section.markdown).toBe('REPORT BODY');
      expect(section.isEmpty()).toBe(false);
    });

    test('returns empty Section when parsed is undefined', () => {
      const section = Section.fromParsedOrEmpty(undefined, 'note.report');

      expect(section.key).toBe('note.report');
      expect(section.isEmpty()).toBe(true);
    });
  });

  describe('markdown mutation', () => {
    test('replace() overwrites markdown', () => {
      const section = Section.empty('test');

      section.replace('NEW CONTENT');

      expect(section.markdown).toBe('NEW CONTENT');
      expect(section.isEmpty()).toBe(false);
    });

    test('append() appends markdown with newline', () => {
      const section = Section.empty('test');

      section.append('LINE 1');
      section.append('LINE 2');

      expect(section.markdown).toBe('LINE 1\nLINE 2');
    });
  });

  describe('toMarkdown()', () => {
    test('renders markdown with heading level', () => {
      const section = new Section('note.report', 'デイリーレポート', 'BODY');

      const md = section.toMarkdown(3);

      expect(md).toBe('### デイリーレポート\n\nBODY');
    });

    test('renders heading even if body is empty', () => {
      const section = Section.empty('note.review.memo', '振り返りメモ');

      const md = section.toMarkdown(2);

      expect(md).toBe('## 振り返りメモ');
    });
  });
});
