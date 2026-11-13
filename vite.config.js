import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es'
  },
  server: {
    port: 5180,
    strictPort: false,
    watch: {
      ignored: [
        '**/public/onnx/**',
        '**/public/mediapipe/**',
        '**/public/models/**',
        '**/public/signs/**',
        '**/scratch/**',
        '**/temp_*'
      ]
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
