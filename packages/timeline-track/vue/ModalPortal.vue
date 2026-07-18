<template>
  <Teleport to="body">
    <div v-show="state.visible" class="tlc-modal-overlay show" @pointerdown.self="onOverlayClick">
      <div class="tlc-modal" :class="{ 'tlc-modal-dropdown-open': _dropdownIndex >= 0 }"
        @keydown.esc="onCancel" @keydown.enter="onKeyEnter">
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

        <!-- 复制到其他轨道 -->
        <div v-else-if="state.type === 'copy-to-tracks'" class="tlc-modal-body">
          <template v-if="state.data?.targetTracks?.length">
            <div class="tlc-copy-track-header">
              <div class="tlc-copy-toggle-item" @click="toggleCopyAll">
                <span class="tlc-copy-track-name tlc-copy-toggle-label">全选</span>
                <span class="tlc-copy-track-meta"></span>
                <input type="checkbox" class="tlc-copy-toggle-cb" :checked="_allChecked" hidden />
                <span class="tlc-copy-track-check"></span>
              </div>
            </div>
            <div
              v-for="(t, i) in state.data.targetTracks"
              :key="t.id"
              class="tlc-copy-track-item"
              @click="onCopyToggle(i)"
            >
              <span class="tlc-copy-track-name">{{ t.label || state.data.unnamedText || '' }}</span>
              <span class="tlc-copy-track-meta">{{ (t.segments || []).length }} 段</span>
              <input type="checkbox" :checked="_fieldValues[i]" hidden />
              <span class="tlc-copy-track-check"></span>
            </div>
          </template>
          <p v-else style="color:#999;font-size:12px;padding:12px">{{ state.message || '没有可用的目标轨道' }}</p>
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

            <!-- 时间控件：分栏（时:分）+ ▲/▼ 步进 + 点击输入框下拉 -->
            <div v-else-if="field.type === 'time'" class="tlc-time-control">
              <div class="tlc-tf-row">
                <!-- 时 -->
                <div class="tlc-tf-col" data-part="h">
                  <input type="text" inputmode="numeric" class="tlc-tf-input"
                    :value="_getTimePart(_fieldValues[i], 'h')"
                    @input="onTimePartInput(i, $event, 'h')" autocomplete="off" maxlength="2"
                    @focus="onTimePartDropdown(i, $event, field, 'h')"
                    @click="onTimePartClick(i, field, 'h', $event)"
                    @blur="_closeDropdown" />
                  <span class="tlc-tf-suffix">时</span>
                  <div class="tlc-tf-steps">
                    <button type="button" class="tlc-tf-step up" tabindex="-1"
                      @pointerdown.prevent="onTimePartStepStart(i, 1, 'h')">▲</button>
                    <button type="button" class="tlc-tf-step down" tabindex="-1"
                      @pointerdown.prevent="onTimePartStepStart(i, -1, 'h')">▼</button>
                  </div>
                </div>
                <span class="tlc-tf-colon">:</span>
                <!-- 分 -->
                <div class="tlc-tf-col" data-part="m">
                  <input type="text" inputmode="numeric" class="tlc-tf-input"
                    :value="_getTimePart(_fieldValues[i], 'm')"
                    @input="onTimePartInput(i, $event, 'm')" autocomplete="off" maxlength="2"
                    @focus="onTimePartDropdown(i, $event, field, 'm')"
                    @click="onTimePartClick(i, field, 'm', $event)"
                    @blur="_closeDropdown" />
                  <span class="tlc-tf-suffix">分</span>
                  <div class="tlc-tf-steps">
                    <button type="button" class="tlc-tf-step up" tabindex="-1"
                      @pointerdown.prevent="onTimePartStepStart(i, 1, 'm')">▲</button>
                    <button type="button" class="tlc-tf-step down" tabindex="-1"
                      @pointerdown.prevent="onTimePartStepStart(i, -1, 'm')">▼</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 数值控件：手填 + ▲/▼ 步进 + 点击输入框下拉快选 -->
            <div v-else-if="field.type === 'number'" class="tlc-number-control">
              <div class="tlc-tf-row">
                <div class="tlc-tf-col">
                  <input type="text" inputmode="decimal" class="tlc-field-input tlc-text-left"
                    :value="_fieldValues[i]" @input="onFieldInput(i, $event)" autocomplete="off"
                    @focus="onDropdownToggle(i, field, $event)"
                    @click="onDropdownClick(i, field, $event)"
                    @blur="_closeDropdown" />
                </div>
                <div class="tlc-tf-steps">
                  <button type="button" class="tlc-tf-step up" tabindex="-1"
                    @pointerdown.prevent="onStepStart(i, $event, 1, field)">▲</button>
                  <button type="button" class="tlc-tf-step down" tabindex="-1"
                    @pointerdown.prevent="onStepStart(i, $event, -1, field)">▼</button>
                </div>
              </div>
            </div>

            <!-- 颜色选择器 + 预设色板 -->
            <div v-else-if="field.type === 'color'" class="tlc-color-control">
              <div class="tlc-color-presets">
                <button v-for="c in colorPresets" :key="c" class="tlc-color-swatch"
                  :class="{ 'tlc-swatch-active': _fieldValues[i] === c }"
                  :style="{ background: c }" :title="c" @click="onColorPreset(i, c)"></button>
              </div>
              <input type="color" :value="_fieldValues[i]" @input="onFieldInput(i, $event)" />
            </div>

            <!-- 复选框 -->
            <input v-else-if="field.type === 'checkbox'" type="checkbox"
              :checked="_fieldValues[i]" @change="onFieldInput(i, $event)" />
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="tlc-modal-footer">
          <button class="tlc-btn" data-action="cancel" @click="onCancel">{{ cancelText }}</button>
          <button class="tlc-btn" :class="state.danger ? 'tlc-btn-danger' : 'tlc-btn-primary'"
            data-action="confirm" @click="onConfirm">{{ confirmText }}</button>
        </div>
      </div>

      <!-- 下拉面板（在 .tlc-modal 外，避免 CSS transform 导致 fixed 定位偏移） -->
      <!-- 使用 Transition 实现 fadeIn+slideDown 进场 / fadeOut+slideUp 退场 -->
      <Transition name="tlc-dropdown">
        <div v-if="_dropdownIndex >= 0 && _dropdownOpts.length" class="tlc-tf-dropdown-panel"
          :class="{ 'tlc-time-dropdown-panel': _dropdownType === 'time' }"
          :style="_dropdownPanelStyle">
          <template v-if="_dropdownType === 'time'">
            <div v-for="opt in _dropdownOpts" :key="opt"
              class="tlc-tf-dropdown-item"
              :class="{ active: _getTimePart(_fieldValues[_dropdownIndex], _dropdownPart) === opt }"
              @pointerdown="onTimePartDropdownSelect(_dropdownIndex, opt)">{{ opt }}</div>
          </template>
          <template v-else>
            <div v-for="opt in _dropdownOpts" :key="opt.value"
              class="tlc-tf-dropdown-item"
              :class="{ active: _fieldValues[_dropdownIndex] === opt.label }"
              @pointerdown="onDropdownSelect(_dropdownIndex, opt.label)">{{ opt.label }}</div>
          </template>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * ModalPortal.vue — 模态框门户组件
 *
 * 使用 Teleport 到 body，由 useModal() 的 state 驱动。
 * 支持删除确认、自定义消息、表单编辑。
 * 时间/数值控件支持三种输入方式：
 *   1. 手填 — 直接键盘输入
 *   2. ▲/▼ 步进按钮（支持长按连续步进）
 *   3. ▾ 下拉快选 — 按步长生成常用值列表
 *
 * @module vue/ModalPortal
 */
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  state: { type: Object, required: true },
  formatter: { type: Object, default: null },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '确定' },
})

const emit = defineEmits(['confirm', 'cancel', 'field-input'])

/* ─────────── 预设色板 ─────────── */

const colorPresets = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
  '#3498db','#2980b9','#9b59b6','#8e44ad','#34495e',
  '#7f8c8d','#95a5a6',
]

/* ─────────── 表单字段值追踪 ─────────── */

const _fieldValues = ref([])
const _allChecked = ref(false)

watch(() => props.state.visible, (visible) => {
  if (visible && props.state.formFields) {
    _fieldValues.value = props.state.formFields.map(f =>
      f.type === 'checkbox' ? (f.value === true) : (f.value ?? '')
    )
    _syncAllChecked()
  }
})

function _syncAllChecked() {
  const targets = props.state.data?.targetTracks
  if (!targets || !targets.length) { _allChecked.value = false; return }
  _allChecked.value = _fieldValues.value.every(v => v === true)
}

function toggleCopyAll() {
  const newVal = !_allChecked.value
  const targets = props.state.data?.targetTracks
  if (!targets) return
  for (let i = 0; i < targets.length; i++) _fieldValues.value[i] = newVal
  _syncAllChecked()
}

function onCopyToggle(i) {
  _fieldValues.value[i] = !_fieldValues.value[i]
  _syncAllChecked()
}

function onOverlayClick() { onCancel() }

function onCancel() {
  if (props.state.onCancel) props.state.onCancel()
  props.state.visible = false
  emit('cancel')
}

function onConfirm() {
  const values = {}
  if (props.state.formFields) {
    props.state.formFields.forEach((f, i) => { values[f.name] = _fieldValues.value[i] })
  }
  if (props.state.onConfirm) props.state.onConfirm(values)
  props.state.visible = false
  emit('confirm', values)
}

function onKeyEnter(e) {
  if (e.target.tagName === 'INPUT' && e.target.type !== 'textarea') onConfirm()
}

function onFieldInput(index, event) {
  const target = event.target
  _fieldValues.value[index] = target.type === 'checkbox' ? target.checked : target.value
  emit('field-input', { index, value: _fieldValues.value[index] })
}

function onColorPreset(index, color) {
  _fieldValues.value[index] = color
  emit('field-input', { index, value: color })
}

/* ─────────── ▲/▼ 步进按钮（长按连续步进） ─────────── */

function _doStep(index, direction, field) {
  const fmt = props.formatter
  if (!fmt) return
  const str = String(_fieldValues.value[index] ?? '')
  let val = fmt.parse(str)
  if (isNaN(val)) return
  const step = field.step || 1
  val += direction * step
  if (field.min != null) val = Math.max(val, field.min)
  if (field.max != null) val = Math.min(val, field.max)
  _fieldValues.value[index] = fmt.format(val, 'editor')
}

let _stepTimer = null
let _stepInterval = null

function _clearStep() {
  if (_stepTimer != null) clearTimeout(_stepTimer)
  if (_stepInterval != null) clearInterval(_stepInterval)
  _stepTimer = null; _stepInterval = null
}

function onStepStart(index, event, direction, field) {
  _clearStep()
  _doStep(index, direction, field)
  _stepTimer = setTimeout(() => {
    _stepInterval = setInterval(() => _doStep(index, direction, field), 80)
  }, 300)
}

onMounted(() => {
  document.addEventListener('pointerup', _clearStep)
  document.addEventListener('pointercancel', _clearStep)
})
onUnmounted(() => {
  document.removeEventListener('pointerup', _clearStep)
  document.removeEventListener('pointercancel', _clearStep)
})

/* ─────────── ▾ 下拉快选 ─────────── */

const _dropdownIndex = ref(-1)       // 当前展开下拉的字段索引，-1=关闭
const _dropdownOpts = ref([])        // 当前下拉选项 [{value, label}]
const _dropdownPanelStyle = ref({})  // 下拉面板 fixed 定位样式
const _dropdownPart = ref('h')       // 时间分栏下拉：当前列 'h'|'m'|'s'
const _dropdownType = ref('')        // 'time' | 'number' - 跟踪下拉类型，用于模板区分渲染
let _dropdownCloseHandler = null
let _dropdownTriggerEl = null        // 触发下拉的 input 元素，同元素点击不关闭（避免闪现）

/* ─────────── 时间分栏辅助 ─────────── */

/** 从 "HH:MM" 复合值中提取部分 */
function _getTimePart(composite, part) {
  const s = String(composite ?? '00:00')
  const parts = s.split(':')
  if (part === 'h') return parts[0]?.padStart(2, '0') ?? '00'
  if (part === 'm') return parts[1]?.padStart(2, '0') ?? '00'
  if (part === 's') return parts[2]?.padStart(2, '0') ?? '00'
  return '00'
}

/** 设置 "HH:MM" 复合值中的部分 */
function _setTimePart(i, part, val) {
  const cur = String(_fieldValues.value[i] ?? '00:00')
  const parts = cur.split(':')
  if (part === 'h') parts[0] = val.padStart(2, '0')
  else if (part === 'm') parts[1] = val.padStart(2, '0')
  else if (part === 's') parts[2] = val.padStart(2, '0')
  _fieldValues.value[i] = parts.slice(0, 3).join(':')
}

/** 分列键盘输入 */
function onTimePartInput(i, event, part) {
  const raw = event.target.value.replace(/\D/g, '').slice(0, 2)
  _setTimePart(i, part, raw || '00')
}

/** 分列步进（循环 0→max→0） */
function onTimePartStep(i, direction, part) {
  const cur = parseInt(_getTimePart(_fieldValues.value[i], part)) || 0
  const limits = { h: 24, m: 59, s: 59 }
  const max = limits[part] || 59
  let nv = cur + direction
  if (nv > max) nv = 0
  if (nv < 0) nv = max
  _setTimePart(i, part, String(nv).padStart(2, '0'))
  // 选 24 点时，分秒强制为 00
  if (part === 'h' && nv === 24) {
    _setTimePart(i, 'm', '00')
    _setTimePart(i, 's', '00')
  }
}

/** 分列步进 + 长按连续（复用已存在的全局 _stepTimer _stepInterval _clearStep） */
function onTimePartStepStart(i, direction, part) {
  _clearStep()
  onTimePartStep(i, direction, part)
  _stepTimer = setTimeout(() => {
    _stepInterval = setInterval(() => onTimePartStep(i, direction, part), 80)
  }, 300)
}

/** 分列聚焦 → 弹出该列下拉（时列 00-23，分/秒列按步进） */
function onTimePartDropdown(i, event, field, part) {
  if (_dropdownIndex.value === i && _dropdownPart.value === part) { _closeDropdown(); return }
  _dropdownType.value = 'time'
  _dropdownIndex.value = i
  _dropdownPart.value = part
  _dropdownTriggerEl = event?.target || null

  const opts = []
  if (part === 'h') {
    // 00-24（24:00 是有效终点，选中时自动清分秒）
    for (let v = 0; v <= 24; v++) opts.push(String(v).padStart(2, '0'))
  } else {
    for (let v = 0; v <= 59; v++) opts.push(String(v).padStart(2, '0'))
  }
  _dropdownOpts.value = opts

  // 下拉对齐到整列宽度（含 suffix 和步进），文字左对齐匹配 input padding
  const col = event.target.closest('.tlc-tf-col')
  const r = (col || event.target).getBoundingClientRect()
  _dropdownPanelStyle.value = {
    position: 'fixed',
    top: (r.bottom + 4) + 'px',
    left: r.left + 'px',
    width: r.width + 'px',
    zIndex: 200000,
  }
  _addDropdownCloseHandler()
}

/** 下拉选值 → 填入对应列 */
function onTimePartDropdownSelect(i, val) {
  _setTimePart(i, _dropdownPart.value, val)
  // 选 24 点时，分秒强制为 00
  if (_dropdownPart.value === 'h' && val === '24') {
    _setTimePart(i, 'm', '00')
    _setTimePart(i, 's', '00')
  }
  _closeDropdown()
}

/* ─────────── 数值控件下拉 ─────────── */

/** 按 field.step/range 生成数值常用值选项列表 */
function _buildDropdownOpts(field) {
  const fmt = props.formatter
  if (!fmt) return []
  const min = field.min != null ? field.min : 0
  const max = field.max != null ? field.max : 24
  const step = field.step || Math.max((max - min) / 24, 1)
  const range = max - min
  const effStep = range / Math.min(range / step, 48) || step
  const opts = []
  for (let v = min; v <= max + effStep / 2; v += effStep) {
    const clamped = Math.min(Math.max(v, min), max)
    const label = fmt.format(clamped, 'editor')
    if (!opts.length || opts[opts.length - 1].label !== label) {
      opts.push({ value: clamped, label })
    }
  }
  return opts
}

function onDropdownToggle(index, field, event) {
  if (_dropdownIndex.value === index) { _closeDropdown(); return }
  _dropdownType.value = 'number'
  _dropdownIndex.value = index
  _dropdownOpts.value = _buildDropdownOpts(field)
  _dropdownTriggerEl = event?.target || null
  const input = event?.target?.closest?.('input')
  if (input) {
    const r = input.getBoundingClientRect()
    _dropdownPanelStyle.value = {
      position: 'fixed',
      top: (r.bottom + 4) + 'px',
      left: r.left + 'px',
      width: r.width + 'px',
      zIndex: 200000,
    }
  }
  _addDropdownCloseHandler()
}

function onDropdownSelect(index, label) {
  _fieldValues.value[index] = label
  _closeDropdown()
}

function _closeDropdown() {
  _dropdownIndex.value = -1
  _dropdownOpts.value = []
  _dropdownType.value = ''
  _dropdownTriggerEl = null
  _removeDropdownCloseHandler()
}

/** 时间分列点击：已聚焦输入再次点击时重新打开（focus 事件不会重复触发） */
function onTimePartClick(i, field, part, event) {
  if (_dropdownIndex.value === -1) {
    onTimePartDropdown(i, event, field, part)
  }
}

/** 数值控件点击：已聚焦输入再次点击时重新打开 */
function onDropdownClick(i, field, event) {
  if (_dropdownIndex.value === -1) {
    onDropdownToggle(i, field, event)
  }
}

function _onDropdownOutside(e) {
  // 点击下拉面板内部不关闭
  if (e.target.closest('.tlc-tf-dropdown-panel') ) return
  // 点击触发下拉的同一输入框时不关闭（与 lib 行为一致，避免闪动）
  if (_dropdownTriggerEl && e.target === _dropdownTriggerEl) return
  _closeDropdown()
}

function _addDropdownCloseHandler() {
  _removeDropdownCloseHandler()
  _dropdownCloseHandler = _onDropdownOutside
  document.addEventListener('pointerdown', _dropdownCloseHandler, true)
}

function _removeDropdownCloseHandler() {
  if (_dropdownCloseHandler) {
    document.removeEventListener('pointerdown', _dropdownCloseHandler, true)
    _dropdownCloseHandler = null
  }
}

// 下拉打开时自动滚动到当前值位置
watch(_dropdownOpts, () => {
  if (_dropdownIndex.value >= 0 && _dropdownOpts.value.length) {
    nextTick(() => {
      const panel = document.querySelector('.tlc-tf-dropdown-panel')
      if (!panel) return
      const active = panel.querySelector('.tlc-tf-dropdown-item.active')
      if (active) active.scrollIntoView({ block: 'nearest' })
    })
  }
})

// 关闭 modal 时确保下拉关闭
watch(() => props.state.visible, (v) => { if (!v) _closeDropdown() })
</script>

<style>
@import '../lib/popup.css';

/* 下拉打开时 modal body 允许溢出，确保下拉不被裁剪 */
.tlc-modal-dropdown-open .tlc-modal-body {
  overflow: visible;
}

/* 时间分列输入框和下拉选项统一左对齐，padding-left 一致确保文字起始位置相同 */
.tlc-time-control .tlc-tf-input {
  text-align: left;
}
.tlc-time-dropdown-panel .tlc-tf-dropdown-item {
  text-align: left;
  padding-left: 9px;
}

/* ── Vue Transition: 下拉面板 fadeIn+slideDown / fadeOut+slideUp ── */
.tlc-dropdown-enter-active {
  animation: tlc-dropdown-in .15s ease-out;
}
.tlc-dropdown-leave-active {
  animation: tlc-dropdown-out .12s ease-in;
}
</style>
