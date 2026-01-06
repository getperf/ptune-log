import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';

export class NoteTagListMarkdownBuilder {
  static build(summaries: NoteSummaries): string {
    const tags = summaries.getAllTags();
    const unregistered = summaries.getAllUnregisteredTags();

    const lines: string[] = [
      HeadingBuilder.create('note.tags.daily'),
      '',
      tags.map((t) => `#${t}`).join(' '),
    ];

    if (unregistered.length > 0) {
      lines.push(
        '',
        HeadingBuilder.create('note.tags.unregistered'),
        '',
        unregistered.map((t) => `#${t}`).join(' ')
      );
    }

    return lines.join('\n') + '\n';
  }
}
