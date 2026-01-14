// src/features/note_analysis/services/KptPromptBuilder.ts

import { i18n } from 'src/i18n';
import { KptSource } from '../models/KptSource';
import { buildKptSystemPrompt } from './kpt_prompt';

export interface KptPrompt {
  system: string;
  user: string;
}

export class KptPromptBuilder {
  static build(source: KptSource): KptPrompt {
    const system = buildKptSystemPrompt();
    const ui = i18n.ui.noteAnalysis;

    // ## タスクの振り返り要約
    // ## ノートの振り返り要約
    const user = `
${ui.prompt.kpt.taskReviewTitle}
${source.taskReviewSummary}

${ui.prompt.kpt.noteReviewTitle}
${source.noteReviewSummary}
`.trim();

    return { system, user };
  }
}
