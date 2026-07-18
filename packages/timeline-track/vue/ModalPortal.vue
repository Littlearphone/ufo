<template>
  <Teleport to="body">
    <div v-show="state.visible" class="tlc-modal-overlay show" @pointerdown.self="onOverlayClick">
      <div class="tlc-modal" @keydown.esc="onCancel" @keydown.enter="onKeyEnter">
        <!-- 头部 -->
        <div class="tlc-modal-header">{{ state.title }}</div>

        <!-- 删除确认消息 -->
        <div v-if="state.type === 'delete-confirm'" class="tlc-modal-body">
          <p>{{ state.message }}</p>
        </div>

        <!-- 自定义内容 -->
        <div v-else-if="state.type === 'custom' && state.message" class="tlc-modal-body">
          <p>{{ state.message }}</p>
        </div>

        <!-- 通用表单 -->
        <div v-else-if="state.formFields.length" class="tlc-modal-body">
          <div v-for="(field, i) in state.formFields" :key="i" class="tlc-field">
            <label class="tlc-field-label">{{ field.label }}</label>
            <!-- 文本 -->
            <input
              v-if="field.type === 'text' || !field.type"
              class="tlc-field-input"
              type="text"
              :value="_fieldValues[i]"
              :placeholder="field.placeholder"
              @input="onFieldInput(i, $event)"
            />
            <!-- 颜色选择器 + 预设色板 -->
            <div v-else-if="field.type === 'color'" class="tlc-color-control">
              <input
                type="color"
                :value="_fieldValues[i]"
                @input="onFieldInput(i, $event)"
              />
              <div class="tlc-color-presets">
                <button
                  v-for="c in colorPresets"
                  :key="c"
                  class="tlc-color-swatch"
                  :class="{ 'tlc-swatch-active': _fieldValues[i] === c }"
                  :style="{ background: c }"
                  :title="c"
                  @click="onColorPreset(i, c)"
                ></button>
              </div>
            </div>
            <!-- 复选框（复制到其他轨道 等） -->
            <input
              v-else-if="field.type === 'checkbox'"
              type="checkbox"
              :checked="_fieldValues[i]"
              @change="onFieldInput(i, $event)"
            />
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="tlc-modal-footer">
          <button class="tlc-btn" data-action="cancel" @click="onCancel">{{ cancelText }}</button>
          <button
            class="tlc-btn"
            :class="state.danger ? 'tlc-btn-danger' : 'tlc-btn-primary'"
            data-action="confirm"
            @click="onConfirm"
          >{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * ModalPortal.vue — 模态框门户组件
 *
 * 使用 Teleport 到 body，由 useModal() 的 state 驱动。
 * 支持删除确认、自定义消息、表单编辑（文本/颜色/复选框）、颜色预设色板。
 * 内部追踪表单字段值，确认时将当前值传递给 onConfirm 回调。
 *
 * @module vue/ModalPortal
 */
import { ref, watch } from 'vue'

const props = defineProps({
  state: { type: Object, required: true },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '确定' },
})

const emit = defineEmits(['confirm', 'cancel', 'field-input'])

/** 15 色预设色板（与 CE 调色板对齐） */
const colorPresets = [
  '#5c9ce6', '#27ae60', '#e67e22', '#e74c3c', '#8e44ad',
  '#3498db', '#2ecc71', '#f39c12', '#c0392b', '#16a085',
  '#2980b9', '#1abc9c', '#f1c40f', '#d35400', '#7f8c8d',
]

/** 内部追踪的表单字段当前值（关键：Modal 弹出时从 formFields 初始化） */
const _fieldValues = ref([])

// 每次 formFields 变化时重新初始化内部值（解决字段值为空字符串被忽略的问题）
watch(() => props.state.visible, (visible) => {
  if (visible && props.state.formFields) {
    _fieldValues.value = props.state.formFields.map(f =>
      f.type === 'checkbox' ? (f.value === true) : (f.value ?? '')
    )
  }
})

function onOverlayClick() {
  onCancel()
}

function onCancel() {
  if (props.state.onCancel) props.state.onCancel()
  emit('cancel')
}

/** 确认时传递以 field.name 为 key 的当前值对象（便于上层使用） */
function onConfirm() {
  const values = {}
  if (props.state.formFields) {
    props.state.formFields.forEach((f, i) => {
      values[f.name] = _fieldValues.value[i]
    })
  }
  if (props.state.onConfirm) props.state.onConfirm(values)
  emit('confirm', values)
}

function onKeyEnter(e) {
  if (e.target.tagName === 'INPUT' && e.target.type !== 'textarea') {
    onConfirm()
  }
}

function onFieldInput(index, event) {
  const target = event.target
  const val = target.type === 'checkbox' ? target.checked : target.value
  _fieldValues.value[index] = val
  emit('field-input', { index, value: val })
}

function onColorPreset(index, color) {
  _fieldValues.value[index] = color
  emit('field-input', { index, value: color })
}
</script>
