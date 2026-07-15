/**
 * 纯工具函数 — Vue 组件与 CE 共享
 *
 * 本文件仅包含纯函数，无任何 DOM 依赖。
 * CE 版 lib/utils.js 中的 h()/esc() 等 DOM 辅助函数不在此包含。
 *
 * @module shared/utils
 */

/** 将值限制在 [lo, hi] 区间内 */
export const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v

/** 按步长对齐数值 */
export const snap = (v, step) => step ? Math.round(v / step) * step : v
