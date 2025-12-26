// File: src/i18n/ja/settings_llm.ts

export const settingsLlmJa = {
  sectionTitle: 'LLM タグ生成設定',

  provider: {
    name: 'プロバイダー',
    desc: '使用する LLM プロバイダー',
    options: {
      'OpenAI Chat': 'OpenAI Chat',
      'Anthropic Claude': 'Anthropic Claude',
      Gemini: 'Gemini',
      Custom: 'Custom',
    },
  },

  apiKey: {
    name: 'API Key',
    desc: 'プロバイダーの API キーを入力してください',
    placeholder: 'sk-...',
  },

  baseUrl: {
    name: 'Base URL',
    desc: 'API のベース URL',
  },

  model: {
    name: 'モデル',
    desc: '使用するモデル名',
  },

  embeddingModel: {
    name: 'Embeddingモデル',
    desc: 'タグ類似度検索・ベクトル生成で使用するモデル。使用しない場合は未使用を選択 ※ OpenAI のみ有効',
    options: {
      '': '未使用',
      'text-embedding-3-small': 'text-embedding-3-small',
      'text-embedding-3-large': 'text-embedding-3-large',
    },
  },

  temperature: {
    name: '温度 (temperature)',
    desc: '出力の多様性（0.0 = 確定的、1.0 = 創造的）',
  },

  maxTokens: {
    name: '最大トークン数',
    desc: '出力されるトークンの最大数',
    placeholder: '512',
  },

  minSimilarityScore: {
    name: '類似スコア閾値（minSimilarityScore）',
    desc: '類似タグ検索で許可するスコア下限値。0.0〜1.0。値を上げるほど厳しくフィルタします。',
  },

  enableChecklist: {
    name: '振り返りレポートでチェックリストを使用',
    desc: '要約・目標をチェックボックス表示にして、チェックしない場合は分析対象から除外します。',
  },

  promptTemplate: {
    name: 'プロンプトテンプレート選択',
    desc: (notePath: string) =>
      `LLMタグ生成プロンプトについて登録済みのテンプレートを選択して保存します。\n` +
      `保存先は ${notePath}です。\n` +
      `内容を参照・編集したい場合は、右記のボタンから開いてください。`,
    buttons: {
      select: 'テンプレートを選択',
      open: 'テンプレートを開く',
    },
    noticeNotFound: (notePath: string) => `ノートが見つかりません: ${notePath}`,
  },

  promptPreview: {
    name: 'プロンプトプレビュー実行',
    desc: 'テンプレート編集後、LLMに送信される最終プロンプト内容を確認します（開発者向け機能）。',
    button: 'プレビュー表示',
    noticeOpen: 'プロンプトプレビューを開きます',
    noticeFail: '⚠️ プロンプトプレビューの実行に失敗しました',
  },
} as const;
