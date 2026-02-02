// File: src/features/daily_review/ui/DailyReviewModal.ts

import { App, Modal, Setting, TFile } from 'obsidian';
import { IProgressReporter } from 'src/core/services/llm/note_analysis/IProgressReporter';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { i18n } from 'src/i18n';
import {
  DailyReviewRunOptions,
  NoteSummaryOutputFormat,
  SentenceMode,
} from '../application/DailyReviewRunOptions';

export class DailyReviewModal extends Modal implements IProgressReporter {
  private isRunning = false;
  private messageEl!: HTMLDivElement;
  private countTextEl!: HTMLParagraphElement;
  private progressBarEl!: HTMLProgressElement;

  private files: TFile[] = [];
  private selectedDate: Date;

  /** 実行オプション（集約） */
  private runOptions: DailyReviewRunOptions = {
    forceRegenerate: false,
    sentenceMode: 'raw',
    outputFormat: 'xmind',
  };

  constructor(
    app: App,
    private options: {
      mode: 'folder' | 'date';
      initialFiles?: TFile[];
      initialDate?: Date;
      onDateChange?: (date: Date) => Promise<TFile[]>;
      onConfirm: (
        modal: DailyReviewModal,
        files: TFile[],
        selectedDate: Date,
        options: DailyReviewRunOptions,
      ) => void;
    },
  ) {
    super(app);
    this.files = options.initialFiles ?? [];
    this.selectedDate = options.initialDate ?? new Date();
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('llm-tag-generate-modal');

    // i18n置換：「今日の振り返り（日付指定）」/「記録ノートの要約生成」
    const title =
      this.options.mode === 'date'
        ? i18n.ui.dailyReview.modal.title.date
        : i18n.ui.dailyReview.modal.title.folder;
    contentEl.createEl('h2', { text: title });

    if (this.options.mode === 'date') {
      this.buildDateSelector(contentEl);
      this.countTextEl = contentEl.createEl('p');
      this.updateCountText();
    } else {
      contentEl.createEl('p', {
        text: i18n.ui.dailyReview.modal.confirm.withCount.replace(
          '{count}',
          String(this.files.length),
        ),
      });
    }

    this.progressBarEl = contentEl.createEl('progress');
    this.progressBarEl.max = this.files.length;
    this.progressBarEl.value = 0;

    this.messageEl = contentEl.createEl('div', { text: '' });

    // --- options ---
    this.buildForceRegenerateSetting(contentEl);
    this.buildSentenceModeSetting(contentEl);
    this.buildOutputFormatSetting(contentEl);

    // --- actions ---
    this.buildActionButtons(contentEl);
  }

  // -------------------------
  // Settings builders
  // -------------------------

  private buildDateSelector(container: HTMLElement): void {
    new Setting(container)
      // i18n置換：「対象日（タグ抽出＆保存）」
      .setName(i18n.ui.dailyReview.modal.dateSelect.label)
      // i18n置換：「過去7日間から選択してください」
      .setDesc(i18n.ui.dailyReview.modal.dateSelect.description)
      .addDropdown((drop) => {
        const opts: Record<string, string> = {};
        for (let i = 0; i < 7; i++) {
          const d = DateUtil.mNow().subtract(i, 'days');
          const s = d.format('YYYY-MM-DD');
          opts[s] = s;
        }
        const selected = DateUtil.m(this.selectedDate).format('YYYY-MM-DD');
        drop.addOptions(opts);
        drop.setValue(selected);

        drop.onChange(async (value) => {
          this.selectedDate = new Date(value);
          if (this.options.onDateChange) {
            this.files = await this.options.onDateChange(this.selectedDate);
            this.updateCountText();
            this.progressBarEl.max = this.files.length;
          }
        });
      });
  }

  private buildForceRegenerateSetting(container: HTMLElement): void {
    new Setting(container)
      // i18n置換：「解析済みノートも再実行する」

      .setName(i18n.ui.dailyReview.modal.option.forceRegenerate.label)

      // i18n置換：「summary/tags があるノートも LLM で再解析します」
      .setDesc(i18n.ui.dailyReview.modal.option.forceRegenerate.description)
      .addToggle((toggle) => {
        toggle.setValue(this.runOptions.forceRegenerate);
        toggle.onChange((value) => (this.runOptions.forceRegenerate = value));
      });
  }

  private buildSentenceModeSetting(container: HTMLElement): void {
    new Setting(container)
      .setName(i18n.ui.dailyReview.modal.option.sentenceMode.label)
      .setDesc(i18n.ui.dailyReview.modal.option.sentenceMode.description)
      .addDropdown((drop) => {
        drop.addOptions({
          raw: i18n.ui.dailyReview.modal.option.sentenceMode.raw,
          llm: i18n.ui.dailyReview.modal.option.sentenceMode.llm,
        });
        drop.setValue(this.runOptions.sentenceMode);
        drop.onChange(
          (value) => (this.runOptions.sentenceMode = value as SentenceMode),
        );
      });
  }

  private buildOutputFormatSetting(container: HTMLElement): void {
    new Setting(container)
      .setName(i18n.ui.dailyReview.modal.option.outputFormat.label)
      .setDesc(i18n.ui.dailyReview.modal.option.outputFormat.description)
      .addDropdown((drop) => {
        drop.addOptions({
          xmind: 'XMind',
          outliner: 'Outliner',
        });
        drop.setValue(this.runOptions.outputFormat);
        drop.onChange(
          (value) =>
            (this.runOptions.outputFormat = value as NoteSummaryOutputFormat),
        );
      });
  }

  private buildActionButtons(container: HTMLElement): void {
    new Setting(container)
      .addButton((btn) =>
        btn
          // i18n置換：「実行する」
          .setButtonText(`✅ ${i18n.ui.shared.action.confirm}`)
          .setCta()
          .onClick(() => {
            if (this.isRunning) return;
            this.isRunning = true;
            btn.setDisabled(true);
            this.progressBarEl.max = this.files.length;

            this.options.onConfirm(this, this.files, this.selectedDate, {
              ...this.runOptions,
            });
          }),
      )
      .addButton((btn) =>
        // i18n置換：「キャンセル」
        btn
          .setButtonText(i18n.ui.shared.action.cancel)
          .onClick(() => this.close()),
      );
  }

  // -------------------------
  // helpers / progress
  // -------------------------

  private updateCountText(): void {
    // i18n置換：「{count} 件の記録ノートに要約とタグを追加します。実行しますか？」
    this.countTextEl.setText(
      i18n.ui.dailyReview.modal.confirm.withCount.replace(
        '{count}',
        String(this.files.length),
      ),
    );
  }

  showCompletionMessage(text: string) {
    this.messageEl.setText(`✅ ${text}`);
  }

  onStart(total: number): void {
    this.progressBarEl.max = total;
    this.progressBarEl.value = 0;
    // i18n置換：「処理開始 ({total} 件)」
    this.messageEl.setText(
      `⏳ ${i18n.ui.dailyReview.modal.progress.start.replace(
        '{total}',
        String(total),
      )}`,
    );
  }

  onProgress(index: number, file: TFile): void {
    this.progressBarEl.value = index + 1;
    // i18n置換：「処理中: {path}」
    this.messageEl.setText(
      `⏳ ${i18n.ui.dailyReview.modal.progress.processing.replace(
        '{path}',
        file.path,
      )}`,
    );
  }

  onFinish(success: number, errors: number): void {
    // i18n置換：「完了: 成功 {success} 件 / エラー {errors} 件」
    this.messageEl.setText(
      i18n.ui.dailyReview.modal.progress.finished
        .replace('{success}', String(success))
        .replace('{errors}', String(errors)),
    );
  }

  onPhaseDone(name: string): void {
    this.messageEl.setText(name);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
