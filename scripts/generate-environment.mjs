import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outputPath = resolve('src/environments/environment.ts');
const environmentVariables = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
const configuredValues = Object.values(environmentVariables);
const noValuesConfigured = configuredValues.every((value) => !value);

if (existsSync(outputPath) && noValuesConfigured) {
  console.info('Se conserva el environment.ts local existente.');
  process.exit(0);
}

if (noValuesConfigured && existsSync(resolve('src/environments/environment.prod.ts'))) {
  writeFileSync(outputPath, "export { environment } from './environment.prod';\n", {
    encoding: 'utf8',
    mode: 0o600
  });
  console.info('Se usa environment.prod.ts como configuración de respaldo.');
  process.exit(0);
}

const missingVariables = Object.entries(environmentVariables)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno para generar environment.ts: ${missingVariables.join(', ')}`
  );
}

const generatedEnvironment = {
  production: true,
  supabaseUrl: environmentVariables.supabaseUrl,
  supabaseAnonKey: environmentVariables.supabaseAnonKey,
  firebaseConfig: {
    apiKey: environmentVariables.apiKey,
    authDomain: environmentVariables.authDomain,
    projectId: environmentVariables.projectId,
    storageBucket: environmentVariables.storageBucket,
    messagingSenderId: environmentVariables.messagingSenderId,
    appId: environmentVariables.appId
  }
};

writeFileSync(
  outputPath,
  `export const environment = ${JSON.stringify(generatedEnvironment, null, 2)} as const;\n`,
  { encoding: 'utf8', mode: 0o600 }
);
console.info('Se generó src/environments/environment.ts desde variables de entorno.');
