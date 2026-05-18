import { createLogger, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// @hpke/common has a Node <= v18 fallback that does `await import("crypto")`.
// It never executes in browsers (guarded by globalThis.crypto), but Vite logs an
// externalization warning at build time. The same package also ships misplaced
// /* @__PURE__ */ comments that Rollup can't attach. Both are noise; filter them.
const logger = createLogger()
const originalWarn = logger.warn
logger.warn = (msg, opts) => {
  if (msg.includes('has been externalized for browser compatibility')) return
  originalWarn(msg, opts)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  customLogger: logger,
  build: {
    outDir: '../kotlin/src/main/resources/static',
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          warning.id?.includes('@hpke/common')
        ) {
          return
        }
        warn(warning)
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
