import { Notice, PluginSettingTab, Setting, TFile } from 'obsidian';
import type { PluginSettings, ConfigManager } from './ConfigManager';
import { providerDefaults } from './settings/LLMSettings';

/**
 * LLM設定セクションを描画
 * @param containerEl - 設定タブのコンテナ要素
 * @param config - 設定マネージャ（ConfigManagerインスタンス）
 * @param settings - 現在の設定状態（表示用）
 */

export function renderLLMSettings(
  containerEl: HTMLElement,
  config: ConfigManager,
  settings: PluginSettings,
  settingTab: PluginSettingTab // ← 追加
) {
  // containerEl.createEl("h3", { text: "LLM 設定" });
  const heading = containerEl.createEl('h3', { text: 'LLM タグ生成設定' });
  heading.id = 'llm-settings-title'; // ← スクロールターゲット

  // Provider
  const providerSetting = new Setting(containerEl)
    .setName('プロバイダー')
    .setDesc('使用する LLM プロバイダー');
  // const providerDropdownEl = providerSetting.controlEl; // ✅ DOMを保持
  providerSetting.addDropdown((drop) =>
    drop
      .addOptions({
        'OpenAI Chat': 'OpenAI Chat',
        'Anthropic Claude': 'Anthropic Claude',
        Gemini: 'Gemini',
        Custom: 'Custom',
      })
      .setValue(settings.llm.provider)
      .onChange(async (value) => {
        await config.update('llm.provider', value);
        const defaults = providerDefaults[value];
        if (defaults) {
          for (const [key, val] of Object.entries(defaults)) {
            await config.update(`llm.${key}`, val);
          }
          settingTab.display();
          setTimeout(() => {
            const target = document.getElementById('llm-settings-title');
            if (target)
              target.scrollIntoView({ behavior: 'auto', block: 'start' });
          }, 50);
        }
      })
  );

  // API Key
  new Setting(containerEl)
    .setName('API Key')
    .setDesc('プロバイダーの API キーを入力してください')
    .addText((text) =>
      text
        .setPlaceholder('sk-...')
        .setValue(settings.llm.apiKey)
        .onChange(async (value) => {
          await config.update('llm.apiKey', value.trim());
        })
    );

  // Base URL
  new Setting(containerEl)
    .setName('Base URL')
    .setDesc('API のベース URL')
    .addText((text) =>
      text
        // .setPlaceholder("https://api.openai.com/v1")
        .setPlaceholder(settings.llm.baseUrl)
        .setValue(settings.llm.baseUrl)
        .onChange(async (value) => {
          await config.update('llm.baseUrl', value.trim());
        })
    );

  // Model
  new Setting(containerEl)
    .setName('モデル')
    .setDesc('使用するモデル名')
    .addDropdown((drop) =>
      drop
        .addOptions({
          'gpt-3.5-turbo': 'gpt-3.5-turbo',
          'gpt-4o-mini': 'gpt-4o-mini',
          'claude-3-5-haiku-20241022': 'claude-3-5-haiku',
          'gemini-2.5-flash': 'gemini-2.5-flash',
          'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
        })
        .setValue(settings.llm.model)
        .onChange(async (value) => {
          await config.update('llm.model', value);
        })
    );

  // Embeddingモデル設定
  new Setting(containerEl)
    .setName('Embeddingモデル')
    .setDesc(
      'タグ類似度検索・ベクトル生成で使用するモデル。使用しない場合は未使用を選択 ※ OpenAI のみ有効'
    )
    .addDropdown((drop) =>
      drop
        .addOptions({
          '': '未使用',
          'text-embedding-3-small': 'text-embedding-3-small',
          'text-embedding-3-large': 'text-embedding-3-large',
        })
        .setValue(settings.llm.embeddingModel)
        .onChange(async (value) => {
          await config.update('llm.embeddingModel', value);
        })
    );

  // Temperature
  new Setting(containerEl)
    .setName('温度 (temperature)')
    .setDesc('出力の多様性（0.0 = 確定的、1.0 = 創造的）')
    .addSlider((slider) =>
      slider
        .setLimits(0, 1, 0.1)
        .setValue(settings.llm.temperature)
        .setDynamicTooltip()
        .onChange(async (value) => {
          await config.update('llm.temperature', value);
        })
    );

  // Max Tokens
  new Setting(containerEl)
    .setName('最大トークン数')
    .setDesc('出力されるトークンの最大数')
    .addText((text) =>
      text
        .setPlaceholder('512')
        .setValue(settings.llm.maxTokens.toString())
        .onChange(async (value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num)) {
            await config.update('llm.maxTokens', num);
          }
        })
    );

  // 類似スコア閾値
  new Setting(containerEl)
    .setName('類似スコア閾値（minSimilarityScore）')
    .setDesc(
      '類似タグ検索で許可するスコア下限値。0.0〜1.0。値を上げるほど厳しくフィルタします。'
    )
    .addSlider((slider) =>
      slider
        .setLimits(0, 1, 0.05)
        .setValue(settings.llm.minSimilarityScore ?? 0.2)
        .setDynamicTooltip()
        .onChange(async (value) => {
          await config.update('llm.minSimilarityScore', value);
        })
    );

  // 振り返りレポートのチェックリスト有効化
  new Setting(containerEl)
    .setName('振り返りレポートでチェックリストを使用')
    .setDesc(
      '要約・目標をチェックボックス表示にして、チェックしない場合は分析対象から除外します。'
    )
    .addToggle((toggle) =>
      toggle
        .setValue(settings.llm.enableChecklist ?? true)
        .onChange(async (value) => {
          await config.update('llm.enableChecklist', value);
        })
    );
  // コマンド実行ボタンの追加（セクションの最後に追記）
  const notePath = '_templates/llm/tag_generate.md';
  new Setting(containerEl)
    .setName('プロンプトテンプレート選択')
    .setDesc(
      `LLMタグ生成プロンプトについて登録済みのテンプレートを選択して保存します。\n` +
        `保存先は ${notePath}です。\n` +
        `内容を参照・編集したい場合は、右記のボタンから開いてください。`
    )
    .addButton((btn) =>
      btn
        .setButtonText('テンプレートを選択')
        .setCta()
        .onClick(() => {
          settingTab.app.commands.executeCommandById(
            'ptune-log:llm-select-template'
          );
        })
    )
    .addButton((btn) =>
      btn
        .setButtonText('テンプレートを開く')
        .setCta()
        .onClick(async () => {
          const file = settingTab.app.vault.getAbstractFileByPath(notePath);
          if (file instanceof TFile) {
            await settingTab.app.workspace.getLeaf(true).openFile(file);
          } else {
            new Notice(`ノートが見つかりません: ${notePath}`);
          }
        })
    );

  // プロンプトプレビュー実行ボタンを追加（開発者向け）
  new Setting(containerEl)
    .setName('プロンプトプレビュー実行')
    .setDesc(
      'テンプレート編集後、LLMに送信される最終プロンプト内容を確認します（開発者向け機能）。'
    )
    .addButton((btn) =>
      btn
        .setButtonText('プレビュー表示')
        .setCta()
        .onClick(() => {
          try {
            settingTab.app.commands.executeCommandById(
              'ptune-log:preview-llm-tag-prompt'
            );
            new Notice('プロンプトプレビューを開きます');
          } catch (e) {
            console.error(e);
            new Notice('⚠️ プロンプトプレビューの実行に失敗しました');
          }
        })
    );
}
