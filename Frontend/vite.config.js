import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Thay "DATN2025web" bằng đúng tên repo GitHub của bạn
export default defineConfig({
    base: '/DATN2025web/', // 👈 Dòng quan trọng giúp GitHub Pages hoạt động
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'http://localhost:9000',
        },
    },
});
