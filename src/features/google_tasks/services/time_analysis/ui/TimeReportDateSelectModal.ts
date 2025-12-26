// File: src/features/google_tasks/services/time_analysis/ui/TimeReportDateSelectModal.ts

import { App, SuggestModal } from 'obsidian';
import { DateUtil } from 'src/core/utils/date/DateUtil';

export class TimeReportDateSelectModal extends SuggestModal<string> {
  private readonly dates: string[];

  constructor(app: App, private readonly onSelect: (date: Date) => void) {
    super(app);
    this.dates = this.buildDates();
  }

  private buildDates(): string[] {
    const out: string[] = [];
    const base = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      out.push(DateUtil.localDate(d));
    }
    return out;
  }

  getSuggestions(query: string): string[] {
    return this.dates.filter((d) => d.includes(query));
  }

  renderSuggestion(value: string, el: HTMLElement): void {
    el.createEl('div', { text: value });
  }

  onChooseSuggestion(value: string): void {
    this.onSelect(new Date(value));
  }
}
