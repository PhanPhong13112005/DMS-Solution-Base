import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'; // THÊM DÒNG NÀY

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // THÊM DÒNG NÀY
  ],
});