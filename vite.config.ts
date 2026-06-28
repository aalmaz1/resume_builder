import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {}
  },
  optimizeDeps: {
    include: ['html2pdf.js', 'html2canvas']
  }
});
