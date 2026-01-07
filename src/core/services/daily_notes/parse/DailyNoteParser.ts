// src/core/services/daily_notes/parse/DailyNoteParser.ts

import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { Section } from 'src/core/models/daily_notes/Section';
import { SectionList } from 'src/core/models/daily_notes/SectionList';
import { HeadingSpecResolver } from './HeadingSpecResolver';
import { HeadingLabelResolver } from './HeadingLabelResolver';

export class DailyNoteParser {
  static parse(raw: string): DailyNote {
    HeadingLabelResolver.rebuild();
    const lines = raw.split('\n');

    // 初期（空定義）
    let plannedTask = new Section({ key: 'task.planned' });
    let reviewMemo = new Section({ key: 'note.review.memo' });
    let reviewedNote = new Section({ key: 'note.report' });
    let timeLogs = new SectionList();
    let kpts = new SectionList();

    let current:
      | { kind: 'single'; ref: 'planned' | 'reviewMemo' | 'reviewed' }
      | { kind: 'list'; ref: 'timelog' | 'kpt'; suffix?: string }
      | null = null;

    let buffer: string[] = [];

    const flush = () => {
      if (!current) return;
      const body = buffer.join('\n').trimEnd();
      buffer = [];

      if (current.kind === 'single') {
        if (current.ref === 'planned') {
          plannedTask = plannedTask.replaceBody(body);
        } else if (current.ref === 'reviewMemo') {
          reviewMemo = reviewMemo.replaceBody(body);
        } else if (current.ref === 'reviewed') {
          reviewedNote = reviewedNote.replaceBody(body);
        }
      } else {
        if (current.ref === 'timelog') {
          timeLogs = timeLogs.append(
            new Section({
              key: 'task.timelog',
              body,
              suffix: current.suffix,
              present: true,
            })
          );
        } else if (current.ref === 'kpt') {
          kpts = kpts.append(
            new Section({
              key: 'note.kpt',
              body,
              suffix: current.suffix,
              present: true,
            })
          );
        }
      }
    };

    for (const line of lines) {
      const { spec, suffix } = HeadingSpecResolver.resolve(line);

      if (spec?.kind === 'section') {
        // 新セクション開始
        flush();

        switch (spec.key) {
          case 'task.planned':
            current = { kind: 'single', ref: 'planned' };
            plannedTask = new Section({
              key: 'task.planned',
              present: true,
            });
            break;
          case 'note.review.memo':
            current = { kind: 'single', ref: 'reviewMemo' };
            reviewMemo = new Section({
              key: 'note.review.memo',
              present: true,
            });
            break;
          case 'note.report':
            current = { kind: 'single', ref: 'reviewed' };
            reviewedNote = new Section({
              key: 'note.report',
              present: true,
            });
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

      // fragment or 非見出しは body として保持
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
