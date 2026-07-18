<template>
  <div>
    <!-- 方向与轴 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[0] }" @click="toggle(0)">
        📐 方向与轴
      </div>
      <div class="ctrl-body" v-show="state[0]">
        <div class="ctrl-row">
          <button @click="toggleDir">{{ btnDirText }}</button>
          <button @click="toggleAxis">{{ btnAxisText }}</button>
          <label v-show="isShared">
            <span class="ctrl-label">共用范围</span>
            <span style="display:flex;align-items:center;gap:4px;width:100%">
              <input type="text" :value="sharedS" @input="setSharedS" style="flex:1;min-width:0">
              <span style="flex-shrink:0">~</span>
              <input type="text" :value="sharedE" @input="setSharedE" style="flex:1;min-width:0">
            </span>
          </label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">步长</span>
            <select :value="stepVal" @change="setStep">
              <option value="0.25">0.25</option>
              <option value="0.5">0.5</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- 外观 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[1] }" @click="toggle(1)">🎨 外观</div>
      <div class="ctrl-body" v-show="state[1]">
        <div class="ctrl-row">
          <label v-show="!isVertical"><span class="ctrl-label">横轴标签</span>
            <select :value="labelHVal" @change="setLabelH">
              <option value="top">上</option>
              <option value="bottom">下</option>
            </select>
          </label>
          <label v-show="isVertical"><span class="ctrl-label">纵轴标签</span>
            <select :value="labelVVal" @change="setLabelV">
              <option value="right">右</option>
              <option value="left">左</option>
            </select>
          </label>
          <label><span class="ctrl-label">圆角</span>
            <select :value="radiusVal" @change="setRadius">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">容器高</span> <input type="text" :value="heightVal" @input="setHeight" placeholder="auto"></label>
          <label><span class="ctrl-label">容器宽</span> <input type="text" :value="widthVal" @input="setWidth" placeholder="auto"></label>
        </div>
      </div>
    </div>

    <!-- Tooltip 位置 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[2] }" @click="toggle(2)">💬 Tooltip 位置</div>
      <div class="ctrl-body" v-show="state[2]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">弹出方向</span>
            <select :value="tipSide" @change="setTipSide">
              <option value="top">上方 top</option>
              <option value="bottom">下方 bottom</option>
              <option value="left">左方 left</option>
              <option value="right">右方 right</option>
            </select>
          </label>
          <label><span class="ctrl-label">对齐</span>
            <select :value="tipAlign" @change="setTipAlign">
              <option value="start">起始 start</option>
              <option value="center">居中 center</option>
              <option value="end">末尾 end</option>
            </select>
          </label>
          <span style="font-size:10px;color:#8d9ba9">当前：<code>{{ tipSide }}-{{ tipAlign }}</code></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Tab3Controls.vue — 模式示例控制台
 *
 * Tab 3 包含 6 个独立 time-line-container（不同 type/unit 模式），
 * 所有操作同时应用到面板内所有容器。
 *
 * @module controls/Tab3Controls
 */
import { computed, ref } from 'vue'
import { addLog } from '../../stores/eventLog.js'
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(3, 0)

const props = defineProps({
  container: { type: Object, default: null }
})

// DOM 属性版本计数器，让依赖 DOM 的 computed 重新求值
const _attrRev = ref(0)
function bumpAttr() { _attrRev.value++ }

/**
 * 获取当前活跃面板中的所有 time-line-container
 *（Tab 3 有多个独立容器，操作需应用到全部）
 */
function getContainers() {
  return document.querySelectorAll('.tab-pane--stack.active time-line-container') || []
}

/** 获取第一个容器用于读取属性值，无容器时返回 null */
function getFirst() {
  return getContainers()[0] || null
}

/** 对每个容器执行操作 */
function each(fn) {
  getContainers().forEach(c => fn(c))
}

const radiusOpts = ['0', '3px', '5px', '8px', '12px', '20px']
const radiusVal = ref('0')
const labelHVal = ref('top')
const labelVVal = ref('left')
const heightVal = ref('')
const widthVal = ref('')
const stepVal = computed({
  get: () => {
    _attrRev.value
    const fc = getFirst()
    if (!fc) return '1'
    const cs = fc.getAttribute('step')
    if (cs) return cs
    const tracks = fc.allTracks()
    if (tracks.length) {
      const s = tracks[0].getAttribute('step')
      if (s) return s
    }
    return '1'
  },
  set: (v) => {
    each(c => { c.setAttribute('step', String(parseFloat(v) || 0)) })
    bumpAttr()
  }
})
const tipSide = ref('top')
const tipAlign = ref('center')

const dir = computed(() => {
  _attrRev.value
  const fc = getFirst()
  if (!fc) return 'horizontal'
  const d = fc.getAttribute('direction') || ''
  return d === 'vertical' ? 'vertical' : 'horizontal'
})
const isVertical = computed(() => dir.value === 'vertical')
const isShared = computed(() => {
  _attrRev.value
  const fc = getFirst()
  return fc && fc.axisMode === 'shared'
})
const btnDirText = computed(() => isVertical.value ? '切换为横向' : '切换为纵向')
const btnAxisText = computed(() => isShared.value ? '切换为独立轴' : '切换为共享轴')

const sharedSVal = computed(() => {
  _attrRev.value
  const fc = getFirst()
  return fc ? parseFloat(fc.getAttribute('shared-start')) || 0 : 0
})
const sharedEVal = computed(() => {
  _attrRev.value
  const fc = getFirst()
  return fc ? parseFloat(fc.getAttribute('shared-end')) || 24 : 24
})

function setSharedS(e) {
  const v = parseFloat(e.target.value) || 0
  each(c => c.setAttribute('shared-start', String(v)))
  bumpAttr()
}

function setSharedE(e) {
  const v = parseFloat(e.target.value) || 0
  each(c => c.setAttribute('shared-end', String(v)))
  bumpAttr()
}

function toggleDir() {
  const next = isVertical.value ? 'horizontal' : 'vertical'
  each(c => c.setAttribute('direction', next))
  bumpAttr()
  addLog('dir', next)
}

function toggleAxis() {
  const fc = getFirst()
  if (!fc) return
  const cur = fc.axisMode
  const next = cur === 'shared' ? 'per-track' : 'shared'
  each(c => c.setAttribute('axis-mode', next))
  bumpAttr()
  addLog('axis-mode', next)
}

function setStep(e) {
  const v = e.target.value
  each(c => c.setAttribute('step', v))
  bumpAttr()
  addLog('step', v)
}

function setLabelH(e) {
  each(c => c.setAttribute('label-h', e.target.value))
  bumpAttr()
}

function setLabelV(e) {
  each(c => c.setAttribute('label-v', e.target.value))
  bumpAttr()
}

function setRadius() {
  each(c => { if (c.setGlobalRadius) c.setGlobalRadius(radiusVal.value) })
}

function setHeight(e) {
  each(c => { c.style.height = e.target.value || '' })
}

function setWidth(e) {
  each(c => { c.style.width = e.target.value || '' })
}

function setTipSide(e) {
  each(c => { c.tooltipPos = e.target.value + '-' + tipAlign.value })
  addLog('api', 'tooltip-pos = ' + e.target.value + '-' + tipAlign.value)
}

function setTipAlign(e) {
  each(c => { c.tooltipPos = tipSide.value + '-' + e.target.value })
  addLog('api', 'tooltip-pos = ' + tipSide.value + '-' + e.target.value)
}

/** 重置各容器属性到初始值（保持各自 type/unit 硬编码不变） */
function reset() {
  each(c => {
    c.setAttribute('direction', 'horizontal')
    c.setAttribute('axis-mode', 'shared')
    c.setAttribute('shared-start', '0')
    c.setAttribute('shared-end', '24')
    c.removeAttribute('step')
    c.removeAttribute('label-h')
    c.removeAttribute('label-v')
    c.removeAttribute('tooltip-pos')
    c.style.height = ''
    c.style.width = ''
    requestAnimationFrame(() => {
      if (c.allTracks) c.allTracks().forEach(t => {
        if (t._drawGrid) t._drawGrid()
        if (t._refreshPositions) t._refreshPositions()
      })
    })
  })
  radiusVal.value = '0'
  labelHVal.value = 'top'
  labelVVal.value = 'left'
  heightVal.value = ''
  widthVal.value = ''
  stepVal.value = '1'
  tipSide.value = 'top'
  tipAlign.value = 'center'
  addLog('dir', 'horizontal (reset)')
}

defineExpose({ reset })
</script>
