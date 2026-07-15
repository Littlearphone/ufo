/**
 * Locale 配置系统 — Vue 组件与 CE 共享
 *
 * 纯数据 + 字符串替换 + DOM 查找（resolveLocale 使用 closest）。
 *
 * @module shared/locale
 */
export {
  DEFAULT_LOCALE,
  formatLocale,
  resolveLocale,
  LOCALE_ATTRS,
} from '../../lib/locale.js'
