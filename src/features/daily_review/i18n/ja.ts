// src/features/daily_review/i18n/ja.ts

export const jaTexts = {
  // --- コメント（複数行） ---
  'daily-review-comment': [
    '以下は、当日の作業内容をもとに LLM が生成した要約です。',
    '内容に誤りや補足がある行はチェックし、レビューコメントを追加してください。',
    'このレビュー内容は後続の KPT 分析に利用されます。',
  ],

  'kpt-action-comment': [
    '※ レビュー欄の内容が KPT分析に反映されます。',
    '　修正・追記後に KPT分析を実行してください。',
  ],

  // --- ラベル（単文） ---
  'kpt-action-execute': 'KPT分析実行',
} as const;
