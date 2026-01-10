// File: src/features/google_tasks/services/time_analysis/llm/prompt/en.ts

import { TimeAnalysisPromptParams } from ".";

export function buildTimeAnalysisPromptEn(params: TimeAnalysisPromptParams): string {
  const { yamlText, header } = params;

  return `
The following is one day's task execution data represented in YAML format.

# Rules (Required)
- Do not speculate or rely on general assumptions. Write only what can be derived from the data.
- Do not make definitive statements about causes; describe them briefly as possibilities.
- Exclude all daily-life tasks marked with 🚫 from all analysis (do not list or aggregate them).

# Numeric Rules (Required)
- planned / actual / delta are expressed in pomodoros.
- delta = actual - planned
- Interpretation of delta:
  - delta > 0 means "over plan (delay)".
  - delta < 0 means "under plan (ahead of schedule)".
- Important: Treat |delta| < 1.0 as noise and never include such tasks in "Tasks with Large Delta".
  - Only list tasks where |delta| >= 1.0 (boundary is strict).
- Display delta and actual values with one decimal place.
- Delta notation must always be in the form "+1.5" or "-1.5".

# Parent / Child Task Handling (Required)
- If parentTaskKey exists, the task is a child task.
- If both parent and child tasks have actual values:
  - Treat the parent task as a gross total.
  - When listing "Tasks with Large Delta", prioritize child tasks and do not flag the parent redundantly.
  - If the parent is mentioned, include it only as a supplemental note marked as "total (gross)".

# Unfinished Task Handling (Required)
- Tasks with status=needsAction are unfinished.
- For unfinished tasks, strictly follow these rules:
  - If delta < 0:
    - Treat the task as in progress.
    - Never include it in "Tasks with Large Delta".
    - Do not evaluate or comment on delay or ahead-of-schedule status.
  - If delta > 0:
    - Treat it as over plan and list it as a delay.

# Task Title Formatting (Most Important: Fixed)
- Task titles may include concatenation such as "Parent__Child".
- When outputting task titles, 반드시 convert them to the following format:
  - Child task (with parentTaskKey): "Parent Task: Child Task Name"
  - Parent task (without parentTaskKey): Use the task name as is (may be truncated if too long).

YAML:
\`\`\`yaml
${yamlText}
\`\`\`

# Required Output
1) Tasks with Large Delta (|delta| >= 1.1 only)
   - Bullet format: "Task Name: +1.5" or "Task Name: -1.5"

2) Summary by Work Type (based on tags)
   - Do not output counts
   - Show total actual per tag (one decimal place)

3) Daily Summary (2–3 lines)
   - Briefly describe trends of delay (delta > 0) / ahead of schedule (delta < 0)
   - If there are unfinished tasks (status=needsAction), mention them in one sentence without making definitive claims

Output must follow the Markdown structure below, be written in English, and be concise.

${header} Tasks with Large Delta

${header} Summary by Work Type

${header} Daily Summary
`.trim();
}
