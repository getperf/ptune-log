// src/features/note_creator/strategies/ITagSuggestionStrategy.ts

import { NoteSummary } from 'src/core/models/notes/NoteSummary';

export interface SuggestedTag {
  name: string;
  score: number;
}

export interface ITagSuggestionStrategy {
  suggest(notes: NoteSummary[], folderName: string): Promise<SuggestedTag[]>;
}
