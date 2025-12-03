import { App, Modal, Setting, TFile, Notice } from 'obsidian';
import { NoteReviewService } from './NoteReviewService';
import { EditableNoteSummary, EditableTagItem } from './EditableNoteSummary';
import { TagRankService } from '../tags/TagRankService';
import { LLMPromptService } from 'src/core/services/llm/LLMPromptService';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { TagEditDialog } from '../tags/TagEditDialog';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { ErrorUtils } from 'src/core/utils/common/ErrorUtils';

export class NoteReviewModal extends Modal {
  private editable?: EditableNoteSummary;
  private loading = false;
  private promptService: LLMPromptService;

  /**
   * LLMClient を追加で受け取る
   */
  constructor(
    app: App,
    private readonly reviewService: NoteReviewService,
    private readonly llmClient: LLMClient,
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

    const base = this.file.path.replace(/\.md$/, '');
    contentEl.createEl('div', {
      text: `📄 ${base}`,
      cls: 'ptune-review-note-header',
    });

    if (!this.editable) {
      this.renderInitial(contentEl);
      return;
    }

    this.renderEditor(contentEl);
  }

  /** 初期画面（LLMボタン） */
  private renderInitial(contentEl: HTMLElement) {
    if (this.loading) {
      contentEl.createEl('p', { text: 'LLM解析中です...' });
      return;
    }

    new Setting(contentEl)
      .setName('LLMを使用してノートをレビュー')
      .setDesc('ノート内容を解析してタグ・要約を生成します。')
      .addButton((btn) =>
        btn
          .setButtonText('LLMタグ生成')
          .setCta()
          .onClick(async () => {
            this.loading = true;
            await this.render();
            await this.runLLMAnalysis();
          })
      );
  }

  /** LLM解析 */
  private async runLLMAnalysis() {
    try {
      const topTags = await new TagRankService(this.app).getFormattedTopTags();

      const prompt = await this.promptService.loadAndApply(
        '_templates/llm/system/tag_generate_system.md',
        '_templates/llm/tag_generate.md',
        { TOP_TAGS: topTags }
      );
      const aliases = new TagAliases();
      await aliases.load(this.app.vault);

      const previewSummary = await this.reviewService.getPreview(
        this.file,
        prompt,
        aliases
      );

      this.editable = this.reviewService.createEditable(previewSummary);
    } catch (err) {
      const msg = ErrorUtils.toMessage(err);
      logger.error(`[NoteReviewModal] LLM解析エラー 詳細 ${msg}`);
      new Notice(`LLM解析に失敗しました: ${msg}`);
    } finally {
      this.loading = false;
      await this.render();
    }
  }

  /**
   * タグ編集ダイアログの呼び出し
   * llmClient は reviewService からではなく、modal が直接保持する
   */
  private openTagEditDialog(tag: EditableTagItem) {
    const dialog = new TagEditDialog(this.app, this.llmClient, {
      from: tag.name,
      to: tag.name,
      mode: 'rename',
      onSubmit: async (_from, to) => {
        tag.name = to;
        await this.render();
      },
    });
    dialog.open();
  }

  /** LLM解析後 UI */
  private renderEditor(contentEl: HTMLElement) {
    if (!this.editable) return;

    // --- Summary ---
    contentEl.createEl('h3', { text: 'サマリー' });

    const summaryEl = contentEl.createEl('textarea', {
      cls: 'ptune-review-summary-fullwidth',
    });

    summaryEl.value = this.editable.summary ?? '';
    summaryEl.addEventListener('input', (ev) => {
      this.editable!.summary = (ev.target as HTMLTextAreaElement).value;
    });

    // --- Daily Note トグル ---
    new Setting(contentEl)
      .setName('今日のデイリーノートとして扱う')
      .setDesc(
        '有効にすると frontmatter の dailynote が今日の日付に更新されます。'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.editable!.updateDailyNote)
          .onChange((v) => (this.editable!.updateDailyNote = v))
      );

    // --- Tags ---
    contentEl.createEl('h3', { text: 'タグ一覧' });

    const listEl = contentEl.createEl('div', { cls: 'ptune-tag-list' });

    this.editable.tags.forEach((t) => {
      const row = listEl.createEl('div', { cls: 'ptune-tag-row' });

      // タグ名リンク
      const link = row.createEl('a', {
        text: t.name,
        cls: 'ptune-tag-link',
        href: '#',
      });
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        this.openTagEditDialog(t);
      });

      // 有効／無効チェック
      const cb = row.createEl('input', { type: 'checkbox' });
      cb.checked = t.enabled;
      cb.addEventListener('change', () => {
        t.enabled = cb.checked;
      });
    });

    // --- 保存 ---
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
