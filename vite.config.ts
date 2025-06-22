import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: [
      'passkey-kit',
      '@stellar/stellar-sdk'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/passkey-kit/, /node_modules/]
    }
  }
}) 