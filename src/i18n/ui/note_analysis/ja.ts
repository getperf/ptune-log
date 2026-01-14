// src/i18n/domain/note_analysis/ja.ts

export const noteAnalysisJa = {
  prompt: {
    user: {
      header: {
        taskReview: '## タスクの振り返り要約',
        noteReview: '## ノートの振り返り要約',
      },
      fallback: {
        noTaskReview: '（タスク振り返りが存在しません）',
        noDailySummary: '（日次要約が見つかりませんでした）',
        noNoteReview: '（ノートレビューが存在しません）',
        noValidNoteReview: '（ノートレビューに有効な項目がありません）',
      },
    },
  },
} as const;
