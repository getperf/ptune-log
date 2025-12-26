// File: src/i18n/ja/settings_google_auth.ts

export const settingsGoogleAuthJa = {
  sectionTitle: 'Google 認証設定',

  useWinApp: {
    name: 'Windowsアプリで認証を行う',
    desc: 'Windows 版の外部認証アプリを使用します。',
  },

  clientId: {
    name: 'Client ID',
    desc: 'Google Cloud Console の OAuth2 Client ID',
    placeholder: 'xxxxxxxx.apps.googleusercontent.com',
  },

  clientSecret: {
    name: 'Client secret',
    desc: 'Google Cloud Console の OAuth2 Client secret',
    placeholder: 'xxxxxxxxxxxxxxx',
  },
} as const;
