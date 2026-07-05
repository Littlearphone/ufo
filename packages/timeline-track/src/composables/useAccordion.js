/**
 * 手风琴折叠 composable
 * 为控制面板的 ctrl-group 提供折叠展开状态管理
 * @module useAccordion
 */
import { reactive } from 'vue'

/**
 * @param {number} count - 分组数量
 * @param {number} [defaultOpen=0] - 默认展开的分组索引（-1 = 全部折叠）
 */
export function useAccordion(count, defaultOpen = 0) {
  const state = reactive({})
  for (let i = 0; i < count; i++) state[i] = i === defaultOpen

  function toggle(i) {
    state[i] = !state[i]
  }

  return { state, toggle }
}
