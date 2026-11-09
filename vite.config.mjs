import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const meetingSource = fileURLToPath(new URL('./.analysis/source-data.reunion.json', import.meta.url));
  if (mode === 'reunion' && !existsSync(meetingSource)) {
    throw new Error('El modo reunión requiere los datos locales de la sesión original.');
  }
  return {
    plugins: [react()],
    resolve: {
      alias: mode === 'reunion' ? [{ find: /^\.\/source-data\.json$/, replacement: meetingSource }] : [],
    },
  };
});
