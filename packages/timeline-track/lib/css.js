/**
 * 默认样式定义与注入（Vite 库模式自动内联）
 * @module css
 */

// 导入 CSS——Vite 在 UMD 构建中会自动注入 <style> 元素
import './base.css'

/** 兼容旧版导入，当前由 Vite 自动注入，不再需要手动调用 */
export function ensureCSS() {
  // no-op: CSS 已由 Vite 在模块加载时自动注入
}
