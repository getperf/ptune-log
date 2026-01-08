// src/core/services/daily_notes/parse/DailyNoteParser.ts

import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { Section } from 'src/core/models/daily_notes/Section';
import { SectionList } from 'src/core/models/daily_notes/SectionList';
import { HeadingSpecResolver } from './HeadingSpecResolver';
import { logger } from '../../logger/loggerInstance';

type CurrentSection =
  | { kind: 'single'; ref: 'planned' | 'reviewMemo' | 'reviewed' }
  | { kind: 'list'; ref: 'timelog' | 'kpt'; suffix?: string }
  | null;

export class DailyNoteParser {
  static parse(raw: string): DailyNote {
    const lines = raw.split('\n');

    // --- 初期（空定義） ---
    let plannedTask = Section.empty('task.planned');
    let reviewMemo = Section.empty('note.review.memo');
    let reviewedNote = Section.empty('note.report');
    let timeLogs = new SectionList();
    let kpts = new SectionList();

    let current: CurrentSection = null;
    let buffer: string[] = [];

    const flush = () => {
      if (!current) return;

      const body = buffer.join('\n').trimEnd();
      buffer = [];

      if (current.kind === 'single') {
        switch (current.ref) {
          case 'planned':
            plannedTask = plannedTask.withBody(body);
            break;
          case 'reviewMemo':
            reviewMemo = reviewMemo.withBody(body);
            break;
          case 'reviewed':
            reviewedNote = reviewedNote.withBody(body);
            break;
        }
      } else {
        if (current.ref === 'timelog') {
          timeLogs = timeLogs.append(
            Section.fromBody('task.timelog', body, current.suffix)
          );
        } else {
          kpts = kpts.append(
            Section.fromBody('note.kpt', body, current.suffix)
          );
        }
      }
    };

    for (const line of lines) {
      const { spec, suffix } = HeadingSpecResolver.resolve(line);
      if (spec?.kind === 'section') {
        // --- 新セクション開始 ---
        flush();

        switch (spec.key) {
          case 'task.planned':
            current = { kind: 'single', ref: 'planned' };
            plannedTask = Section.start('task.planned');
            break;

          case 'note.review.memo':
            current = { kind: 'single', ref: 'reviewMemo' };
            reviewMemo = Section.start('note.review.memo');
            break;

          case 'note.report':
            current = { kind: 'single', ref: 'reviewed' };
            reviewedNote = Section.start('note.report');
            break;

          case 'task.timelog':
            current = { kind: 'list', ref: 'timelog', suffix };
            break;

          case 'note.kpt':
            current = { kind: 'list', ref: 'kpt', suffix };
            break;

          default:
            current = null;
        }
        continue;
      }

      // fragment / 非見出しは body として保持
      buffer.push(line);
    }

    flush();

    return new DailyNote({
      raw,
      plannedTask,
      reviewMemo,
      reviewedNote,
      timeLogs,
      kpts,
    });
  }
}
