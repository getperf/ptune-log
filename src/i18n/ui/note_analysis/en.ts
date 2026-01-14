// src/i18n/domain/note_analysis/en.ts

export const noteAnalysisEn = {
  prompt: {
    user: {
      header: {
        taskReview: '## Task Review Summary',
        noteReview: '## Note Review Summary',
      },
      fallback: {
        noTaskReview: '(No task review found)',
        noDailySummary: '(No daily summary found)',
        noNoteReview: '(No note review found)',
        noValidNoteReview: '(No valid items in note review)',
      },
    },
  },
} as const;
