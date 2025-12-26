// File: src/i18n/en/settings_google_auth.ts

export const settingsGoogleAuthEn = {
  sectionTitle: 'Google Auth',

  useWinApp: {
    name: 'Authenticate with Windows app',
    desc: 'Use external Windows authentication app.',
  },

  clientId: {
    name: 'Client ID',
    desc: 'OAuth2 Client ID in Google Cloud Console',
    placeholder: 'xxxxxxxx.apps.googleusercontent.com',
  },

  clientSecret: {
    name: 'Client secret',
    desc: 'OAuth2 Client secret in Google Cloud Console',
    placeholder: 'xxxxxxxxxxxxxxx',
  },
} as const;
