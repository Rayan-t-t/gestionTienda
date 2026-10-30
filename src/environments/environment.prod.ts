export const environment = {
  production: true,
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'example-anon-key',
  firebaseConfig: {
    apiKey: 'example',
    authDomain: 'example.firebaseapp.com',
    projectId: 'example',
    storageBucket: 'example.appspot.com',
    messagingSenderId: '123456',
    appId: '1:123456:web:example'
  }
} as const;
