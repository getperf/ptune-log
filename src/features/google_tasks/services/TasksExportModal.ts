import { App, Modal, Setting } from 'obsidian';
import type { ParsedTask } from './TasksExporter';

export class TasksExportModal extends Modal {
  private statusEl!: HTMLElement;

  constructor(
    app: App,
    private tasks: ParsedTask[],
    private willReset: boolean,
    private onExecute: (modal: TasksExportModal) => Promise<void>
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h3', { text: 'タスクをエクスポートします' });

    contentEl.createEl('p', {
      text: `対象タスク数: ${this.tasks.length} 件`,
    });

    if (this.willReset) {
      contentEl.createEl('p', {
        text: '※ 既存のGoogle Tasksは削除されてから登録されます。',
        cls: 'tasks-export-warning',
      });
    }

    this.statusEl = contentEl.createEl('div', { text: '確認待ち…' });

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('実行')
          .setCta()
          .onClick(async () => {
            btn.setDisabled(true);
            await this.onExecute(this);
          })
      )
      .addButton((btn) =>
        btn.setButtonText('キャンセル').onClick(() => this.close())
      );
  }

  setProgress(msg: string) {
    this.statusEl.setText(`⏳ ${msg}`);
  }

  setCompleted(msg: string) {
    this.statusEl.setText(`✅ ${msg}`);
    setTimeout(() => this.close(), 1500);
  }

  setError(msg: string) {
    this.statusEl.setText(msg);
    this.statusEl.style.color = 'var(--text-error)'; // Obsidian風の赤色
  }
}
