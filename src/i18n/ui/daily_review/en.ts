// src/i18n/ui/daily_review/en.ts

export const dailyReviewEn = {
  command: {
    runOnFolder: 'Review: Run on folder',
    runOnDate: 'Review: Run by date',
  },

  notice: {
    noMarkdownFiles: 'No markdown files found',
    failed: 'An error occurred during review',
  },

  message: {
    completed: 'Daily review completed',
  },

  modal: {
    title: {
      date: 'Daily Review (Select Date)',
      folder: 'Generate note summaries',
    },

    dateSelect: {
      label: 'Target date',
      description: 'Select from the past 7 days',
    },

    confirm: {
      withCount:
        'Add summaries and tags to {count} notes. Do you want to continue?',
    },

    option: {
      forceRegenerate: {
        label: 'Re-run analysis on processed notes',
        description: 'Analyze notes with existing summary/tags again',
      },
    },

    progress: {
      start: 'Start ({total} items)',
      processing: 'Processing: {path}',
      finished: 'Finished: success {success} / error {errors}',
    },
  },
};
