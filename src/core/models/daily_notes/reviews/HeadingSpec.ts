// src/core/models/daily_notes/reviews/HeadingSpec.ts
import { SectionKey } from './SectionKey';

export type HeadingSpec = {
  key: SectionKey;
  level: number;
  emoji?: string;
  parent?: SectionKey;
  repeatable?: boolean;
};

export const TASK_HEADING_SPECS: HeadingSpec[] = [
  {
    key: 'task.planned',
    level: 2,
    emoji: '📋',
  },
  {
    key: 'task.timelog',
    level: 2,
    emoji: '⏱',
  },
  {
    key: 'task.timelog.table',
    level: 3,
    parent: 'task.timelog',
    emoji: '🧮',
  },
  {
    key: 'task.timelog.backlog',
    level: 3,
    parent: 'task.timelog',
    emoji: '📌',
  },
  {
    key: 'task.timelog.analysis',
    level: 3,
    parent: 'task.timelog',
    emoji: '🤖',
  },
];

export const NOTE_HEADING_SPECS: HeadingSpec[] = [
  {
    key: 'note.tags.daily',
    level: 2,
    emoji: '🏷',
  },
  {
    key: 'note.tags.unregistered',
    level: 2,
    emoji: '⚠',
  },
  {
    key: 'note.report',
    level: 2,
    emoji: '📝',
  },
  {
    key: 'note.kpt',
    level: 2,
    emoji: '🔁',
    repeatable: true,
  },
];

