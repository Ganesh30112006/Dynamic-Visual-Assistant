import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rawPort = process.env.PORT ?? '5173';
const port = Number(rawPort);
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
