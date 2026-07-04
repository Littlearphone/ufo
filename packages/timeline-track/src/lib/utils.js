/**
 * 工具函数集
 * @module utils
 */

/** 将值限制在 [lo, hi] 区间内 */
export const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v

/** 按步长对齐数值 */
export const snap = (v, step) => step ? Math.round(v / step) * step : v

/**
 * 将小时数格式化为 HH:MM 时间字符串
 * @param {number} th - 小时数（如 14.5 → "14:30"）
 * @param {boolean} [showMin] - 是否显示分钟，默认 true
 * @returns {string}
 */
export function fmtTime(th, showMin) {
  if (th == null || isNaN(th)) return '--:--'
  const neg = th < 0
  if (neg) th = -th
  const h = Math.floor(th)
  const m = Math.round((th - h) * 60)
  if (m === 60) return `${neg ? '-' : ''}${String(h + 1).padStart(2, '0')}:00`
  return `${neg ? '-' : ''}${String(h).padStart(2, '0')}:${showMin === false ? '00' : String(m).padStart(2, '0')}`
}

/** HTML 转义 */
export function esc(s) {
  const d = document.createElement('div')
  d.textContent = s != null ? String(s) : ''
  return d.innerHTML
}
