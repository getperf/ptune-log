import { NoteReview } from "./reviews/entities/NoteReview";
import { TaskReview } from "./reviews/entities/TaskReview";

export class DailyNote {
  constructor(
    public readonly taskReview: TaskReview,
    public readonly noteReview: NoteReview
  ) { }
}
