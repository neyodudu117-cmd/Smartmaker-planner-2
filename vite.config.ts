import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

import fs from 'fs';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  fs.writeFileSync('vite-env.json', JSON.stringify({
    gemini: process.env.GEMINI_API_KEY ? 'exists' : 'undefined',
    stringify: JSON.stringify(process.env.GEMINI_API_KEY),
    allKeys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('GEMINI'))
  }));
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
      'process.env': {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
