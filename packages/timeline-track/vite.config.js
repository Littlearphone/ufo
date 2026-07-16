import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // ─── 库模式 ───
    //   默认 → dist/TimelineTrack.js（压缩）
    //   TIMELINE_FORMAT=dev → dist/TimelineTrack.dev.js（保留注释 + 格式化）
    const isDev = process.env.TIMELINE_FORMAT === 'dev'
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'lib/index.js'),
          name: 'TimelineTrack',
          fileName: () => isDev ? 'TimelineTrack.dev.js' : 'TimelineTrack.js',
          formats: ['umd']
        },
        cssCodeSplit: true,  // 触发 UMD 格式的 CSS 内联注入
        outDir: 'dist',
        emptyOutDir: false,
        minify: isDev ? false : 'esbuild',
        // dev 版本保留注释和可读性
        rollupOptions: isDev ? {
          output: {
            // 保留注释、不压缩变量名
            compact: false,
            generatedCode: { constBindings: true },
          }
        } : undefined,
        esbuild: {
          legalComments: isDev ? 'inline' : 'none',
          minifyIdentifiers: !isDev,
          keepNames: isDev,
        }
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
