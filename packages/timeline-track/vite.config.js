import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // ─── 库模式：输出 TimelineTrack.js（UMD）───
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.js'),
          name: 'TimelineTrack',
          fileName: () => 'TimelineTrack.js',
          formats: ['umd']
        },
        cssCodeSplit: true,  // 触发 UMD 格式的 CSS 内联注入
        outDir: 'dist',
        emptyOutDir: false, // 保留上次 demo build 产出的 index.html
      },
      esbuild: { target: 'es2020', charset: 'utf8' }
    }
  }

  // ─── 默认模式：输出自包含的 single-file demo（index.html）───
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('time-line-')
          }
        }
      }),
      viteSingleFile(), // 将所有 JS / CSS 内联到 HTML
    ],
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,  // demo build 先跑，清空 dist/
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          inlineDynamicImports: true,
        }
      },
      // 排除库文件——demo 已内联组件代码，不再需要外部 UMD
      assetsInlineLimit: 100000,
    },
    esbuild: { charset: 'utf8' }
  }
})
