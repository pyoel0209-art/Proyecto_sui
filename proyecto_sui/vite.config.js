import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración básica sin puerto fijo
export default defineConfig({
  plugins: [react()],
})