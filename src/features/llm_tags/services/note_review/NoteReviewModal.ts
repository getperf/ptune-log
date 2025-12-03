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

export class NoteReviewModal extends Modal {
  private editable?: EditableNoteSummary;
  private loading = false;
  private promptService: LLMPromptService;

  /** ExportTasks から読み込んだタスク一覧（NoteCreatorModal と同等） */
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

  /**
   * 初期画面（LLMボタンのみ）
   */
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

  /**
   * LLM解析本体
   */
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

      // LLM解析後にタスク一覧を読み込んでおく
      await this.loadTaskTitles();
    } catch (e) {
      logger.error('[NoteReviewModal] LLM解析エラー', e);
      new Notice('LLM解析に失敗しました');
    } finally {
      this.loading = false;
      await this.render();
    }
  }

  /**
   * ExportTasks からタスク一覧を読み込む
   * - export_tasks.json がなければ空配列
   */
  private async loadTaskTitles(): Promise<void> {
    try {
      const tasks = await ExportTasks.load(this.app);
      if (!tasks) {
        logger.info('[NoteReviewModal] export_tasks.json not found');
        this.taskOptions = [];
        return;
      }
      this.taskOptions = tasks.toDisplayList();
      logger.debug(
        `[NoteReviewModal] loaded taskTitles=${this.taskOptions.length}`
      );
    } catch (err) {
      logger.error('[NoteReviewModal] failed to load ExportTasks', err);
      this.taskOptions = [];
    }
  }

  /**
   * タグ編集ダイアログの呼び出し
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

  /**
   * LLM解析後の UI
   */
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

    // --- デイリーノート更新トグル ---
    new Setting(contentEl)
      .setName('今日のデイリーノートとして扱う')
      .setDesc(
        '有効にすると frontmatter の dailynote が今日のデイリーノートリンクに更新されます。'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.editable!.updateDailyNote)
          .onChange((v) => (this.editable!.updateDailyNote = v))
      );

    // --- タスク割り当て（ExportTasks が存在する場合のみ） ---
    if (this.taskOptions.length > 0) {
      new Setting(contentEl)
        .setName('タスクを割り当て')
        .setDesc(
          'エクスポート済みタスクから、このノートに紐づけるタスクを選択します。'
        )
        .addDropdown((dropdown) => {
          dropdown.addOption('', '(選択なし)');
          for (const task of this.taskOptions) {
            dropdown.addOption(task.taskKey, task.title);
          }
          dropdown.setValue(this.editable!.taskKey ?? '');
          dropdown.onChange((value) => {
            this.editable!.taskKey = value || undefined;
            logger.debug(
              `[NoteReviewModal] task assigned: key=${this.editable!.taskKey}`
            );
          });
        });
    }

    // --- タグ一覧（リンク＋チェックボックス） ---
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

    // --- 保存ボタン ---
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
