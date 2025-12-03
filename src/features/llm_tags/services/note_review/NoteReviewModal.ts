import { App, Modal, Setting, TFile } from 'obsidian';
import { NoteReviewService } from './NoteReviewService';
import { EditableNoteSummary } from './EditableNoteSummary';
import { TagRankService } from '../tags/TagRankService';
import { LLMPromptService } from 'src/core/services/llm/LLMPromptService';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { logger } from 'src/core/services/logger/loggerInstance';

export class NoteReviewModal extends Modal {
  private editable?: EditableNoteSummary;
  private loading = false;

  private promptService: LLMPromptService;

  constructor(
    app: App,
    private readonly reviewService: NoteReviewService,
    private readonly file: TFile
  ) {
    super(app);
    this.promptService = new LLMPromptService(app.vault);
  }

  onOpen() {
    this.render();
  }

  private render() {
    const { contentEl } = this;
    contentEl.empty();

    // ノートパス or ノート名
    const base = this.file.path.replace(/\.md$/, '');
    contentEl.createEl('div', {
      text: `📄 ${base}`,
      cls: 'ptune-review-note-header',
    });

    // --- 初回は editable が無い → LLM未実行状態
    if (!this.editable) {
      this.renderInitial(contentEl);
      return;
    }

    // --- LLM解析後の編集UI
    this.renderEditor(contentEl);
  }

  /**
   * 初期画面（LLMボタンのみ）
   */
  private renderInitial(contentEl: HTMLElement) {
    if (this.loading) {
      contentEl.createEl('p', { text: 'LLM解析中です...' });
      return;
    }

    new Setting(contentEl)
      .setName('LLM解析を実行')
      .setDesc('ノート内容を解析してタグ・要約を生成します。')
      .addButton((btn) =>
        btn
          .setButtonText('LLMタグ生成')
          .setCta()
          .onClick(async () => {
            this.loading = true;
            await this.render(); // 処理中表示
            await this.runLLMAnalysis();
          })
      );
  }

  /**
   * LLM解析の実行（preview を呼ぶ）
   */
  private async runLLMAnalysis() {
    try {
      // --- プロンプト生成
      const topTags = await new TagRankService(this.app).getFormattedTopTags();
      const prompt = await this.promptService.loadAndApply(
        '_templates/llm/system/tag_generate_system.md',
        '_templates/llm/tag_generate.md',
        { TOP_TAGS: topTags }
      );

      // --- TagAliases
      const aliases = new TagAliases();
      await aliases.load(this.app.vault);

      // --- preview 実行（frontmatter更新なし）
      const previewSummary = await this.reviewService.getPreview(
        this.file,
        prompt,
        aliases
      );

      // --- 編集用モデルに変換
      this.editable = this.reviewService.createEditable(previewSummary);
    } catch (e) {
      logger.error('[NoteReviewModal] LLM解析エラー', e);
    } finally {
      this.loading = false;
      await this.render(); // LLM完了後に UI 再描画
    }
  }

  /**
   * LLM解析後の編集UI
   */
  private renderEditor(contentEl: HTMLElement) {
    if (!this.editable) return;

    // --- Summary 編集
    contentEl.createEl('h3', { text: 'サマリー' });

    // --- 横幅いっぱいの textarea（Setting を使わない）
    const summaryEl = contentEl.createEl('textarea', {
      cls: 'ptune-review-summary-fullwidth',
    });

    summaryEl.value = this.editable?.summary ?? '';
    summaryEl.addEventListener('input', (ev) => {
      if (this.editable) {
        this.editable.summary = (ev.target as HTMLTextAreaElement).value;
      }
    });

    // --- Tag チェックボックス
    contentEl.createEl('h3', { text: 'タグ一覧' });
    this.editable.tags.forEach((t) => {
      new Setting(contentEl)
        .setName(t.name)
        .addToggle((tg) =>
          tg.setValue(t.enabled).onChange((v) => (t.enabled = v))
        );
    });

    // --- 保存ボタン
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('保存')
        .setCta()
        .onClick(async () => {
          await this.reviewService.saveResult(this.file, this.editable!);
          this.close();
        })
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}
