// src/features/note_analysis/services/KptPromptBuilder.ts

import { KptSource } from '../models/KptSource';
import { buildKptSystemPrompt } from './kpt_prompt';

export interface KptPrompt {
  system: string;
  user: string;
}

export class KptPromptBuilder {
  static build(source: KptSource): KptPrompt {
    const system = buildKptSystemPrompt();

    const user = `
## タスクの振り返り要約
${source.taskReviewSummary}

## ノートの振り返り要約
${source.noteReviewSummary}
`.trim();

    return { system, user };
  }
}
