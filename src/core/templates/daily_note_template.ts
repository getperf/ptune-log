import { HEADER_TIME_LOG } from 'src/features/google_tasks/services/TaskSummaryReportBuilder';
import { HEADER_REVIEW_LOG } from 'src/core/services/notes/DailyNoteUpdater';

export const DAILY_NOTE_TEMPLATE = `---
tags:
  - 用途/日誌
---

## ✅ 今日の予定タスク（手動で追記OK）

<!-- 作業開始時に1日のタスクリストを記入してください。記入後、エクスポートコマンドでGoogle Tasks経由で ptune スマホアプリと連携します -->

- [ ] <朝>くすり🚫
- [ ] <夜>プール🚫

---

${HEADER_TIME_LOG}

---

${HEADER_REVIEW_LOG}

- 
`;
