export const environment = {
  production: true,
  supabase: {
    url: 'https://example.supabase.co',
    anonKey: 'example-anon-key',
    authUrl: 'https://example.supabase.co/auth/v1'
  },
  firebase: {
    apiKey: 'example',
    authDomain: 'example.firebaseapp.com',
    projectId: 'example',
    storageBucket: 'example.appspot.com',
    messagingSenderId: '123456',
    appId: '1:123456:web:example'
  }
} as const;
