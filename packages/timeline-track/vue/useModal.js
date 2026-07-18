/**
 * useModal.js — 模态框控制器
 *
 * 模块级单例状态，由 ModalPortal.vue 渲染（Teleport 到 body）。
 * 提供编辑属性弹窗、删除确认框等功能。
 * 功能与 lib/contextmenu.js 兼容。
 *
 * @module vue/useModal
 */

import { reactive } from 'vue'

/**
 * @typedef {object} ModalConfig
 * @property {string} title - 弹窗标题
 * @property {'edit-segment'|'edit-track'|'delete-confirm'|'copy-to-tracks'|'custom'} type
 * @property {object} [data] - 额外数据
 * @property {string} [message] - 确认消息（delete-confirm 用）
 * @property {Function} [onConfirm] - 确认回调
 * @property {Function} [onCancel] - 取消回调
 * @property {Array<{label:string, value:string}>} [formFields] - 表单字段
 */

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
})

/**
 * 使用模态框
 */
export function useModal() {
  function show(config) {
    hide()
    _state.visible = true
    _state.type = config.type || 'custom'
    _state.title = config.title || ''
    _state.message = config.message || ''
    _state.onConfirm = config.onConfirm || null
    _state.onCancel = config.onCancel || null
    _state.danger = config.danger || false
    _state.formData = config.formData || {}
    _state.formFields = config.formFields || []
    _state.data = config.data || {}
  }

  function hide() {
    _state.visible = false
  }

  return { state: _state, show, hide }
}
