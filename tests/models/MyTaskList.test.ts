import { MyTaskList } from 'src/core/models/tasks/MyTaskList';

describe('MyTaskList', () => {
  it('toString returns title and ID', () => {
    const list = new MyTaskList('abc123', 'Today');
    expect(list.toString()).toBe('Today (abc123)');
  });
});
