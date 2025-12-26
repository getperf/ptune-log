// File: src/i18n/en/settings.ts

export const settingsEn = {
  basic: {
    heading: 'Basic settings',
  },

  logLevel: {
    name: 'Log level',
    desc: 'Set the logging verbosity',
    options: {
      debug: 'Debug',
      info: 'Info',
      warn: 'Warn',
      error: 'Error',
      none: 'None',
    },
  },

  enableLogFile: {
    name: 'Enable log file',
    desc: 'Write logs to {vault config}/plugins/ptune-log/logs/ptune-log_YYYY-MM-DD.log',
  },
} as const;
