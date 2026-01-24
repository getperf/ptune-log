// src/core/models/tasks/review_flags/ReviewFlag.ts
export enum ReviewFlag {
  stuckUnknown = 'stuckUnknown',
  toolOrEnvIssue = 'toolOrEnvIssue',
  decisionPending = 'decisionPending',
  scopeExpanded = 'scopeExpanded',
  unresolved = 'unresolved',
  newIssueFound = 'newIssueFound',
}
