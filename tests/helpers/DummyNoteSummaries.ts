// tests/helpers/DummyNoteSummaries.ts
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

export function createDummySummaries(): NoteSummaries {
  return {
    summaryMarkdown: () =>
      [
        '##### [[_project/A]]',
        '- [x] done A',
        '',
        '###### ユーザレビュー',
        '- review A',
      ].join('\n'),
    getAllTags: () => ['tag1', 'tag2'],
    getAllUnregisteredTags: () => ['newtag'],
  } as unknown as NoteSummaries;
}
