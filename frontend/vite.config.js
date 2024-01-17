import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 1500,
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                origin: ['http://localhost:3000', 'https://the-chat-app-zas7.onrender.com'],
            },
        },
    },
    plugins: [react()],
})