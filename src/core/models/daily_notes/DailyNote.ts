import { NoteReview } from './reviews/entities/note_review/NoteReview';
import { TaskReview } from './reviews/entities/task_review/TaskReview';

export class DailyNote {
  constructor(
    public readonly taskReview: TaskReview,
    public readonly noteReview: NoteReview
  ) {}
}
