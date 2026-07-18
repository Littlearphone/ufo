/**
 * useModal.js — 模态框控制器
 *
 * 模块级单例状态，由 ModalPortal.vue 渲染（Teleport 到 body）。
 * 提供编辑属性弹窗、删除确认框等功能。
 * 功能与 lib/contextmenu.js 兼容。
 *
 * @module vue/useModal
 */

import { nextTick, reactive } from 'vue'

const _state = reactive({
  visible: false,
  type: '',
  title: '',
  message: '',
  onConfirm: null,
  onCancel: null,
  // 编辑模式用
  formData: {},
  formFields: [],
  // 删除确认用
  danger: false,
  // 展开动效源元素（从该元素位置展开到窗口中央）
  originEl: null,
})

export function useModal() {
  function show(config) {
    hide()
    _state.visible = true

    // 先设置状态（让 v-show 显示元素），nextTick 后加 .show 触发进场动画
    _state.type = config.type || 'custom'
    _state.title = config.title || ''
    _state.message = config.message || ''
    _state.onConfirm = config.onConfirm || null
    _state.onCancel = config.onCancel || hide
    _state.danger = config.danger || false
    _state.formData = config.formData || {}
    _state.formFields = config.formFields || []
    _state.data = config.data || {}
    _state.originEl = config.originEl || null

    nextTick(() => {
      const overlay = document.querySelector('.tlc-modal-overlay')
      if (!overlay) return
      // 清除前一次的 closing 状态（防止 animationend 回调误操作）
      overlay.classList.remove('closing')

      // 设为 CSS 自定义属性，@keyframes 中的 var() 会在动画启动时读取
      // 计算从源元素到弹窗的精确 transform（配合 transform-origin: 0 0），
      // 使弹窗看起来从标签块放大展开
      const originEl = _state.originEl
      if (originEl && typeof originEl.getBoundingClientRect === 'function') {
        const modalEl = overlay.querySelector('.tlc-modal')
        if (modalEl) {
          const modalRect = modalEl.getBoundingClientRect()
          const srcRect = originEl.getBoundingClientRect()
          if (modalRect.width > 0 && modalRect.height > 0 && srcRect.width > 0 && srcRect.height > 0) {
            modalEl.style.setProperty('--tlc-modal-tx', `${(srcRect.left - modalRect.left).toFixed(1)}px`)
            modalEl.style.setProperty('--tlc-modal-ty', `${(srcRect.top - modalRect.top).toFixed(1)}px`)
            modalEl.style.setProperty('--tlc-modal-sx', (srcRect.width / modalRect.width).toFixed(4))
            modalEl.style.setProperty('--tlc-modal-sy', (srcRect.height / modalRect.height).toFixed(4))
          }
        }
      }

      overlay.classList.add('show')
    })
  }

  function hide() {
    const overlay = document.querySelector('.tlc-modal-overlay')
    if (overlay && _state.visible) {
      // 已在退场动画中则不重复执行
      if (overlay.classList.contains('closing')) return
      overlay.classList.remove('show')
      overlay.classList.add('closing')
      overlay.addEventListener('animationend', () => {
        overlay.classList.remove('closing')
        // 检查 modal 是否已被重新展示（关闭 + 快速打开时）
        if (!overlay.classList.contains('show')) {
          _state.visible = false
        }
      }, { once: true })
    } else {
      _state.visible = false
    }
  }

  return { state: _state, show, hide }
}
