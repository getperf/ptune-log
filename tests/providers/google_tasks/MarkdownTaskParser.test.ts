import { MarkdownTaskParser } from 'src/features/google_tasks/services/MarkdownTaskParser';

describe('MarkdownTaskParser', () => {
  it('parses flat task list', () => {
    const lines = ['- [ ] task A 🍅x2', '- [ ] task B'];

    const result = MarkdownTaskParser.parse(lines);
    expect(result).toEqual([
      {
        index: 0,
        title: 'task A',
        pomodoro: 2,
        rawLine: '- [ ] task A 🍅x2',
      },
      {
        index: 1,
        title: 'task B',
        pomodoro: 0,
        rawLine: '- [ ] task B',
      },
    ]);
  });

  it('parses nested subtasks', () => {
    const lines = ['- [ ] parent', '  - [ ] child 🍅x1'];

    const result = MarkdownTaskParser.parse(lines);
    expect(result).toEqual([
      {
        index: 0,
        title: 'parent',
        pomodoro: 0,
        rawLine: '- [ ] parent',
      },
      {
        index: 1,
        title: 'child',
        pomodoro: 1,
        rawLine: '  - [ ] child 🍅x1',
        parent_index: 0,
      },
    ]);
  });

  it('returns empty array for no matches', () => {
    const lines = ['# Heading', 'Some text', 'Not a task'];

    const result = MarkdownTaskParser.parse(lines);
    expect(result).toEqual([]);
  });
});
