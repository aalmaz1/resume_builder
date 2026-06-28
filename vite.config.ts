import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['html2canvas', 'html2pdf.js']
    }
  }
});
