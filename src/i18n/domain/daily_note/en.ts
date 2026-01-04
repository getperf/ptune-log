// src/core/i18n/domain/daily_note/en.ts
import { DailyNoteLabelKey } from 'src/core/models/daily_notes/reviews/specs/SectionKey';

export const en: Record<DailyNoteLabelKey, string> = {
  // --- TaskReview (section) ---
  'task.planned': 'Planned Tasks',
  'task.timelog': 'Time Log',
  'task.review': 'Time Table',

  // --- TaskReview (fragment) ---
  'task.timelog.backlog': 'Backlog',
  'task.timelog.analysis': 'Analysis',

  // --- NoteReview ---
  'note.review.memo': 'Review memo',

  // fragments
  'note.tags.daily': 'Daily Tags',
  'note.tags.unregistered': 'Unregistered Tags',

  // sections
  'note.report': 'Daily Report',
  'note.kpt': 'KPT',
};
