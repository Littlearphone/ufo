/**
 * 可插拔的值格式化/解析/刻度系统 — Vue 组件与 CE 共享
 *
 * 纯逻辑模块，零 DOM 依赖。
 * 从 lib/formatter.js re-export 全部导出。
 *
 * @module shared/formatter
 */
export {
  ValueFormatter,
  TimeFormatter,
  NumberFormatter,
  createFormatter,
} from '../../lib/formatter.js'
