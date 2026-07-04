import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // 库模式：生成独立的 TimelineTrack.js
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.js'),
          name: 'TimelineTrack',
          fileName: () => 'TimelineTrack.js',
          formats: ['umd']
        },
        outDir: 'dist',
        emptyOutDir: true
      },
      esbuild: { charset: 'utf8' }
    }
  }

  // 默认模式：演示 SPA（开发用）
  return {
    plugins: [vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('time-line-')
        }
      }
    })],
    esbuild: { charset: 'utf8' }
  }
})
