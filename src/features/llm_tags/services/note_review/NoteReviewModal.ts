// File: src/features/llm_tags/services/note_review/NoteReviewModal.ts

import { App, Modal, Setting, TFile, Notice } from 'obsidian';
import { NoteReviewService } from './NoteReviewService';
import { EditableNoteSummary, EditableTagItem } from './EditableNoteSummary';
import { TagRankService } from '../tags/TagRankService';
import { LLMPromptService } from 'src/core/services/llm/LLMPromptService';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { TagEditDialog } from '../tags/TagEditDialog';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { ExportTask, ExportTasks } from 'src/core/models/tasks/ExportTasks';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagListSection } from './components/TagListSection';

export class NoteReviewModal extends Modal {
  private editable?: EditableNoteSummary;
  private loading = false;
  private promptService: LLMPromptService;
  private taskOptions: ExportTask[] = [];

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

    // ヘッダー
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

      await this.loadTaskTitles();
    } catch (e) {
      logger.error('[NoteReviewModal] LLM解析エラー', e);
      new Notice('LLM解析に失敗しました');
    } finally {
      this.loading = false;
      await this.render();
    }
  }

  private async loadTaskTitles() {
    try {
      const tasks = await ExportTasks.load(this.app);
      this.taskOptions = tasks ? tasks.toDisplayList() : [];
    } catch (err) {
      logger.error('[NoteReviewModal] failed to load ExportTasks', err);
      this.taskOptions = [];
    }
  }

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

    // --- Daily Note toggle ---
    new Setting(contentEl)
      .setName('今日のデイリーノートとして扱う')
      .addToggle((toggle) =>
        toggle
          .setValue(this.editable!.updateDailyNote)
          .onChange((v) => (this.editable!.updateDailyNote = v))
      );

    // --- Task assign ---
    if (this.taskOptions.length > 0) {
      new Setting(contentEl)
        .setName('タスクを割り当て')
        .addDropdown((dropdown) => {
          dropdown.addOption('', '(選択なし)');
          for (const t of this.taskOptions)
            dropdown.addOption(t.taskKey, t.title);

          dropdown.setValue(this.editable!.taskKey ?? '');
          dropdown.onChange((v) => (this.editable!.taskKey = v || undefined));
        });
    }

    // --- TagListSection ここに集約 ---
    TagListSection.render(
      contentEl,
      this.editable,
      (tag) => this.openTagEditDialog(tag),
      () => this.render()
    );

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
