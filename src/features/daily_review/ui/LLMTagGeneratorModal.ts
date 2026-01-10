import { App, Modal, Setting, TFile } from 'obsidian';
import { IProgressReporter } from 'src/core/services/llm/workflow/IProgressReporter';
import { LLMTagGenerationRunner } from 'src/core/services/llm/workflow/LLMTagGenerationRunner';
import { DateUtil } from 'src/core/utils/date/DateUtil';

export class LLMTagGeneratorModal extends Modal implements IProgressReporter {
  private isRunning = false;
  private messageEl: HTMLDivElement;
  private countTextEl: HTMLParagraphElement;
  private progressBarEl: HTMLProgressElement;
  private files: TFile[] = [];
  private runner: LLMTagGenerationRunner;
  private selectedDate: Date;
  private forceRegenerate = false;

  constructor(
    app: App,
    private options: {
      mode: 'folder' | 'date';
      initialFiles?: TFile[];
      initialDate?: Date;
      onConfirm: (
        modal: LLMTagGeneratorModal,
        files: TFile[],
        selectedDate: Date,
        forceRegenerate: boolean
      ) => void;
    }
  ) {
    super(app);
    this.runner = new LLMTagGenerationRunner(app);
    this.files = options.initialFiles ?? [];

    // 初期値は今日
    this.selectedDate = options.initialDate ?? new Date();
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('llm-tag-generate-modal');

    const title =
      this.options.mode === 'date'
        ? '今日の振り返り（日付指定）'
        : '記録ノートの要約生成';
    contentEl.createEl('h2', { text: title });

    if (this.options.mode === 'date') {
      // 📅 日付選択（過去7日分）
      new Setting(contentEl)
        .setName('対象日（タグ抽出＆保存）')
        .setDesc('過去7日間から選択してください')
        .addDropdown((drop) => {
          // const today = DateUtil.mNow().startOf('day');
          const options: Record<string, string> = {};

          for (let i = 0; i < 7; i++) {
            const date = DateUtil.mNow().subtract(i, 'days'); // clone は不要
            const dateStr = date.format('YYYY-MM-DD');
            options[dateStr] = dateStr;
          }

          const selected = DateUtil.m(this.selectedDate).format('YYYY-MM-DD');

          drop.addOptions(options);
          drop.setValue(selected);

          drop.onChange(async (value) => {
            this.selectedDate = new Date(value);
            this.files = await this.runner.findFilesByDate(this.selectedDate);
            this.updateCountText();
          });
        });

      // 件数表示
      this.countTextEl = contentEl.createEl('p');
      this.files = await this.runner.findFilesByDate(this.selectedDate);
      this.updateCountText();
    } else {
      // フォルダ一括モード（そのまま実行）
      contentEl.createEl('p', {
        text: `${this.files.length} 件の記録ノートに要約とタグを追加します。実行しますか？`,
      });
    }

    // プログレスバー
    this.progressBarEl = contentEl.createEl('progress');
    this.progressBarEl.max = this.files.length;
    this.progressBarEl.value = 0;

    this.messageEl = contentEl.createEl('div', { text: '' });

    // 解析済みも再実行
    new Setting(contentEl)
      .setName('解析済みノートも再実行する')
      .setDesc('summary/tags があるノートも LLM で再解析します')
      .addToggle((toggle) => {
        toggle.setValue(false);
        toggle.onChange((value) => (this.forceRegenerate = value));
      });

    // 実行ボタン
    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('✅ 実行する')
          .setCta()
          .onClick(() => {
            if (this.isRunning) return;
            this.isRunning = true;
            btn.setDisabled(true);
            this.progressBarEl.max = this.files.length;
            this.options.onConfirm(
              this,
              this.files,
              this.selectedDate,
              this.forceRegenerate
            );
          })
      )
      .addButton((btn) =>
        btn.setButtonText('キャンセル').onClick(() => this.close())
      );
  }

  private updateCountText(): void {
    this.countTextEl.setText(
      `${this.files.length} 件の 記録ノートに要約とタグを追加します。実行しますか？`
    );
  }

  showCompletionMessage(text: string) {
    this.messageEl.setText(`✅ ${text}`);
  }

  reportProgress(index: number, file: TFile) {
    this.progressBarEl.value = index + 1;
    this.messageEl.setText(`⏳ 処理中: ${file.path}`);
  }

  onStart(total: number): void {
    this.progressBarEl.max = total;
    this.progressBarEl.value = 0;
    this.messageEl.setText(`⏳ 処理開始 (${total} 件)`);
  }

  onProgress(index: number, file: TFile): void {
    this.reportProgress(index, file);
  }

  onFinish(success: number, errors: number): void {
    this.messageEl.setText(`完了: 成功 ${success} 件 / エラー ${errors} 件`);
  }

  onPhaseDone(name: string): void {
    this.messageEl.setText(name);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
