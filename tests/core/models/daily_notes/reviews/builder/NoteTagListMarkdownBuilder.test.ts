import { NoteTagListMarkdownBuilder } from 'src/core/models/daily_notes/reviews/builder/NoteTagListMarkdownBuilder';
import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';
import { initI18n } from 'src/i18n';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

describe('NoteTagListMarkdownBuilder', () => {
  beforeAll(() => {
    // i18n 初期化（必須）
    initI18n('ja');
  });

  function mockSummaries(
    tags: string[],
    unregistered: string[] = []
  ): NoteSummaries {
    return {
      getAllTags: jest.fn().mockReturnValue(tags),
      getAllUnregisteredTags: jest.fn().mockReturnValue(unregistered),
    } as unknown as NoteSummaries;
  }

  test('builds tag list without unregistered tags', () => {
    const summaries = mockSummaries(['主題/設計', '用途/日誌']);

    const markdown = NoteTagListMarkdownBuilder.build(summaries);
    expect(markdown).toContain(HeadingBuilder.create('note.tags.daily'));
    expect(markdown).toContain('#主題/設計');
    expect(markdown).toContain('#用途/日誌');
    expect(markdown).not.toContain(
      HeadingBuilder.create('note.tags.unregistered')
    );
  });

  test('includes unregistered tag section when exists', () => {
    const summaries = mockSummaries(
      ['主題/設計'],
      ['未登録/タグA', '未登録/タグB']
    );

    const markdown = NoteTagListMarkdownBuilder.build(summaries);

    expect(markdown).toContain(HeadingBuilder.create('note.tags.unregistered'));
    expect(markdown).toContain('#未登録/タグA');
    expect(markdown).toContain('#未登録/タグB');
  });
});
