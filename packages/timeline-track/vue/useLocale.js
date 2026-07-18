/**
 * Vue Locale 系统
 *
 * 与 lib 中 locale.js 兼容，但使用 Vue provide/inject 而非 DOM 属性查找。
 * VTimelineContainer 将 loc-* props 解析为 locale 对象后 provide 给子组件。
 *
 * @module vue/useLocale
 */

import { computed, inject, provide } from 'vue'
import { DEFAULT_LOCALE } from '../shared/locale.js'
import { LOCALE_KEY } from './inject-keys.js'

/**
 * 将驼峰 locale key 转为 kebab-case loc-* 属性名
 * confirmDeleteTrack → loc-confirm-delete-track
 * @param {string} key
 * @returns {string}
 */
function keyToAttr(key) {
  return 'loc-' + key.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 从 props 中提取所有 loc-* 属性并合并到 DEFAULT_LOCALE
 * @param {Record<string, any>} props - 组件 props 对象
 * @returns {Record<string, string>} 合并后的 locale 对象
 */
export function resolveLocaleFromProps(props) {
  const locale = { ...DEFAULT_LOCALE }
  for (const key of Object.keys(DEFAULT_LOCALE)) {
    const attrKey = keyToAttr(key)
    // Vue 会把 kebab-case props 转为 camelCase，所以同时检查两种形式
    const val = props[attrKey] ?? props[key]
    if (val != null) {
      locale[key] = String(val)
    }
  }
  return locale
}

/**
 * 替换模板字符串中的 {key} 占位符
 * @param {string} tpl
 * @param {Record<string, string|number>} params
 * @returns {string}
 */
export function formatLocale(tpl, params) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => params[k] != null ? String(params[k]) : `{${k}}`)
}

/**
 * 容器组件调用：将 locale 对象 provide 给所有子组件
 * @param {Record<string, string>} locale - 经过 resolveLocaleFromProps 合并的 locale
 */
export function provideLocale(locale) {
  provide(LOCALE_KEY, locale)
}

/**
 * 子组件（Track/Segment）调用：注入 locale 对象
 * @returns {import('vue').ComputedRef<Record<string, string>>}
 */
export function useLocale() {
  return inject(LOCALE_KEY, computed(() => DEFAULT_LOCALE))
}
