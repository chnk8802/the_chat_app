import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 1500,
    },
    server: {
        proxy: {
            '/api': {
                target: 'https://the-chat-app-zas7.onrender.com/',
                changeOrigin: true,
            },
        },
    },
    plugins: [react()],
})