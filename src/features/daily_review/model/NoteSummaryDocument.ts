// src/model/note_summary/NoteSummaryDocument.ts

export type Sentence = {
  text: string;
};

export type NoteNode = {
  notePath: string;
  noteLink: string; // [[path|title]]
  sentences: Sentence[];
};

export type ProjectNode = {
  projectPath: string;
  notes: NoteNode[];
};

export type NoteSummaryDocument = {
  projects: ProjectNode[];
};
