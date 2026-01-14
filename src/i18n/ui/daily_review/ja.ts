// src/i18n/ui/daily_review/ja.ts

export const dailyReviewJa = {
  command: {
    runOnFolder: '振り返り: フォルダを指定して実行',
    runOnDate: '振り返り: 日付を指定して実行',
  },

  notice: {
    noMarkdownFiles: 'Markdownファイルが見つかりません',
    failed: '振り返り処理中にエラーが発生しました',
  },

  message: {
    completed: '今日の振り返りが完了しました',
  },

  modal: {
    title: {
      date: '今日の振り返り（日付指定）',
      folder: '記録ノートの要約生成',
    },

    dateSelect: {
      label: '対象日（タグ抽出＆保存）',
      description: '過去7日間から選択してください',
    },

    confirm: {
      withCount:
        '{count} 件の記録ノートに要約とタグを追加します。実行しますか？',
    },

    option: {
      forceRegenerate: {
        label: '解析済みノートも再実行する',
        description: 'summary/tags があるノートも LLM で再解析します',
      },
    },

    progress: {
      start: '処理開始 ({total} 件)',
      processing: '処理中: {path}',
      finished: '完了: 成功 {success} 件 / エラー {errors} 件',
    },
  },
};
