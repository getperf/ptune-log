// File: src/core/services/llm/note_analysis/NoteLLMAnalyzer.ts
import { parseYaml } from 'obsidian';
import { LLMYamlExtractor } from './LLMYamlExtractor';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';

export type NoteAnalysisResult = {
  summary?: string;
  tags?: string[];
  raw: Record<string, unknown>;
};

export class NoteLLMAnalyzer {
  constructor(
    private readonly client: LLMClient,
    private readonly extractor: LLMYamlExtractor
  ) { }

  async analyze(content: string, prompt: string): Promise<NoteAnalysisResult> {
    const llmText = await this.client.complete(prompt, content);
    if (!llmText) throw new Error('LLM応答が空');

    const yamlText = this.extractor.extract(llmText);
    const parsed = parseYaml(yamlText);
    if (!parsed) throw new Error('YAML解析失敗');

    return {
      summary: parsed.summary,
      tags: Array.isArray(parsed.tags) ? parsed.tags : undefined,
      raw: parsed,
    };
  }
}

