/**
 * 内部剪贴板 — 存储复制操作的数据
 * 模块级单例，同一页面内跨容器共享
 * 剪贴板有效期到下次复制或页面刷新
 * @module clipboard
 */

/** @type {{ type: string, data: object } | null} */
let _clipboard = null

/**
 * 复制数据到剪贴板
 * @param {'segment'|'track'} type - 数据类型
 * @param {object} data - 数据内容
 *   segment: { label, color, duration, start, end }
 *   track:   { label, segments: Array<{label,color,start,end,radius}> }
 */
export function copyToClipboard(type, data) {
  _clipboard = { type, data }
}

/**
 * 读取剪贴板
 * @returns {{ type: string, data: object } | null}
 */
export function getClipboard() {
  return _clipboard
}

/**
 * 清空剪贴板
 */
export function clearClipboard() {
  _clipboard = null
}

/**
 * 剪贴板中是否有指定类型的数据
 * @param {'segment'|'track'} type
 * @returns {boolean}
 */
export function hasClipboard(type) {
  return _clipboard != null && _clipboard.type === type
}
