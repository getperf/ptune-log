// src/features/daily_review/services/kpt/KptResultApplier.ts

import { App, parseYaml } from 'obsidian';
import { DailyNoteWriter } from 'src/core/services/daily_notes/file_io/DailyNoteWriter';
import { KPTResult } from 'src/core/models/daily_notes/KPTResult';
import { YamlCodeBlockExtractor } from 'src/core/utils/markdown/YamlCodeBlockExtractor';
import { KptMarkdownConverter } from './builders/KptMarkdownConverter';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DateUtil } from 'src/core/utils/date/DateUtil';

export function normalizeKptResult(raw: Partial<KPTResult>): KPTResult {
  return {
    Keep: raw.Keep ?? [],
    Problem: raw.Problem ?? [],
    Try: raw.Try ?? [],
  };
}

export class KptResultApplier {
  private readonly writer: DailyNoteWriter;
  constructor(private readonly app: App) {
    this.writer = new DailyNoteWriter(app);
  }
  async apply(dailyNote: DailyNote, llmMarkdown: string): Promise<void> {
    // 2. YAML 抽出
    const yamlText = YamlCodeBlockExtractor.extract(llmMarkdown);
    if (!yamlText) {
      throw new Error('KPT YAML block not found in LLM output.');
    }
    // 3. YAML → Model
    let parsed: Partial<KPTResult>;
    try {
      parsed = parseYaml(yamlText) as Partial<KPTResult>;
    } catch (e) {
      throw new Error('Failed to parse KPT YAML.');
    }
    const result = normalizeKptResult(parsed);

    // 4. Markdown 変換
    const markdown = KptMarkdownConverter.convert(result);

    // 5. モデルに append（サフィックス含む）
    const suffix = `(${DateUtil.localTime()})`;
    const updated = dailyNote.appendKpt(markdown, suffix, 'first');

    // 6. 保存
    await this.writer.writeToActive(updated);
  }
}
