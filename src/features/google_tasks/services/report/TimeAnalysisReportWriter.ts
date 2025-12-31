import { TimeReportTableWriter } from './TimeReportTableWriter';
import { TimeReport } from '../time_analysis/models/TimeReport';
import { TimeReportBacklogWriter } from './TimeReportBacklogWriter';

export class TimeAnalysisReportWriter {
  private readonly tableWriter = new TimeReportTableWriter();
  private readonly backlogWriter = new TimeReportBacklogWriter();

  write(report: TimeReport, llmResult?: string | null): string {
    const sections: string[] = [];

    // 1) 実績表
    sections.push(this.tableWriter.writeMarkdown(report));

    // 2) 未完了（Backlog）
    const backlog = this.backlogWriter.writeMarkdown(report);
    if (backlog) {
      sections.push('');
      sections.push(backlog);
    }

    // 3) LLM
    if (llmResult) {
      sections.push('');
      sections.push('## ⏱ 時間分析サマリ（LLM）');
      sections.push('');
      sections.push(llmResult);
    }

    return sections.join('\n');
  }
}
