import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import ossLicenses from './scripts/oss-licenses.mjs';

// 같은 코드로 웹(Vercel)과 토스 미니앱(.ait)을 함께 빌드해요.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), ossLicenses()],
  server: { port: 5173, host: '0.0.0.0' },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1200 },
});
