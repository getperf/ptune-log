// src/core/models/daily_notes/reviews/SectionKey.ts
export type SectionKey =
  // --- TaskReview ---
  | 'task.planned'
  | 'task.timelog'
  | 'task.timelog.table'
  | 'task.timelog.backlog'
  | 'task.timelog.analysis'

  // --- NoteReview ---
  | 'note.tags.daily'
  | 'note.tags.unregistered'
  | 'note.report'
  | 'note.kpt';
