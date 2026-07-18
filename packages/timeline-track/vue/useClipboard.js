/**
 * Vue Clipboard 系统
 *
 * 模块级单例，与 lib/clipboard.js 兼容。
 * 同一页面内跨 Vue 组件共享剪贴板数据。
 * 剪贴板有效期到下次复制或页面刷新。
 *
 * @module vue/useClipboard
 */

import { readonly, ref } from 'vue'

/** @type {import('vue').Ref<{ type: string, data: object } | null>} */
const _clipboard = ref(null)

/**
 * 使用内部剪贴板
 * 返回 读/写/清空 接口
 */
export function useClipboard() {
  /**
   * 复制数据到剪贴板
   * @param {'segment'|'track'} type
   * @param {object} data
   */
  function copyToClipboard(type, data) {
    _clipboard.value = { type, data }
  }

  /**
   * 清空剪贴板
   */
  function clearClipboard() {
    _clipboard.value = null
  }

  /**
   * 检查剪贴板中是否有指定类型的数据
   * @param {'segment'|'track'} type
   * @returns {boolean}
   */
  function hasClipboard(type) {
    return _clipboard.value != null && _clipboard.value.type === type
  }

  return {
    /** 当前剪贴板内容（只读） */
    clipboard: readonly(_clipboard),
    copyToClipboard,
    clearClipboard,
    hasClipboard,
  }
}
