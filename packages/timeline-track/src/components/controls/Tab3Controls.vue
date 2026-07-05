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
              <input type="text" v-model.number="sharedS" @input="setShared" style="flex:1;min-width:0">
              <span style="flex-shrink:0">~</span>
              <input type="text" v-model.number="sharedE" @input="setShared" style="flex:1;min-width:0">
            </span>
          </label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">步长</span>
            <select v-model="stepVal">
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
            <select v-model="labelHVal" @change="setLabel('label-h', labelHVal)">
              <option value="top">上</option>
              <option value="bottom">下</option>
            </select>
          </label>
          <label v-show="isVertical"><span class="ctrl-label">纵轴标签</span>
            <select v-model="labelVVal" @change="setLabel('label-v', labelVVal)">
              <option value="right">右</option>
              <option value="left">左</option>
            </select>
          </label>
          <label><span class="ctrl-label">圆角</span>
            <select v-model="radiusVal" @change="setRadius">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">容器高</span> <input type="text" v-model="heightVal" @input="setSize" placeholder="auto"></label>
          <label><span class="ctrl-label">容器宽</span> <input type="text" v-model="widthVal" @input="setSize" placeholder="auto"></label>
        </div>
      </div>
    </div>

    <!-- Tooltip 位置 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[2] }" @click="toggle(2)">💬 Tooltip 位置</div>
      <div class="ctrl-body" v-show="state[2]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">弹出方向</span>
            <select v-model="tipSide" @change="updateTip">
              <option value="top">上方 top</option>
              <option value="bottom">下方 bottom</option>
              <option value="left">左方 left</option>
              <option value="right">右方 right</option>
            </select>
          </label>
          <label><span class="ctrl-label">对齐</span>
            <select v-model="tipAlign" @change="updateTip">
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
import { computed, ref } from 'vue'
import { addLog } from '../../stores/eventLog.js'
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(3, 0)

const props = defineProps({
  container: { type: Object, default: null }
})

const c = () => props.container

// DOM 属性版本计数器，让依赖 DOM 的 computed 重新求值
const _attrRev = ref(0)
function bumpAttr() { _attrRev.value++ }

const radiusOpts = ['0', '3px', '5px', '8px', '12px', '20px']
const radiusVal = ref('0')
const labelHVal = ref('top')
const labelVVal = ref('left')
const heightVal = ref('')
const widthVal = ref('')
const stepVal = computed({
  get: () => {
    _attrRev.value
    if (!c()) return '1'
    const tracks = c().allTracks()
    if (tracks.length) {
      // 从首条轨道的 step 属性读取，保持与控制台实际步长同步
      const s = tracks[0].getAttribute('step')
      if (s) return s
    }
    return '1'
  },
  set: (v) => {
    if (c()) {
      c().allTracks().forEach(t => t.setAttribute('step', String(v)))
      bumpAttr()
    }
  }
})
const tipSide = ref('top')
const tipAlign = ref('center')

const dir = computed(() => {
  _attrRev.value
  if (!c()) return 'horizontal'
  const d = c().getAttribute('direction') || ''
  return d === 'vertical' ? 'vertical' : 'horizontal'
})
const isVertical = computed(() => dir.value === 'vertical')
const isShared = computed(() => {
  _attrRev.value
  return c() && c().axisMode === 'shared'
})
const btnDirText = computed(() => isVertical.value ? '切换为横向' : '切换为纵向')
const btnAxisText = computed(() => isShared.value ? '切换为独立轴' : '切换为共享轴')

const sharedS = computed({
  get: () => {
    _attrRev.value
    return c() ? parseFloat(c().getAttribute('shared-start')) || 0 : 0
  },
  set: (v) => { if (c()) { c().setAttribute('shared-start', String(v)); bumpAttr() } }
})
const sharedE = computed({
  get: () => {
    _attrRev.value
    return c() ? parseFloat(c().getAttribute('shared-end')) || 24 : 24
  },
  set: (v) => { if (c()) { c().setAttribute('shared-end', String(v)); bumpAttr() } }
})

function toggleDir() {
  if (!c()) return
  const next = isVertical.value ? 'horizontal' : 'vertical'
  c().setAttribute('direction', next)
  bumpAttr()
  addLog('dir', next)
}

function toggleAxis() {
  if (!c()) return
  const cur = c().axisMode
  const next = cur === 'shared' ? 'per-track' : 'shared'
  c().setAttribute('axis-mode', next)
  bumpAttr()
  addLog('axis-mode', next)
}

function setShared() {
  // 校验：确保共用范围的 start < end
  if (!c()) return
  const s = parseFloat(c().getAttribute('shared-start')) || 0
  const e = parseFloat(c().getAttribute('shared-end')) || 24
  if (s >= e) {
    c().setAttribute('shared-end', String(s + 1))
  }
  bumpAttr()
}

function setLabel(attr, val) {
  if (c()) { c().setAttribute(attr, val); bumpAttr() }
}

function setRadius() {
  if (c()) c().setGlobalRadius(radiusVal.value)
}

function setSize() {
  if (!c()) return
  c().style.height = heightVal.value || ''
  c().style.width = widthVal.value || ''
}

function updateTip() {
  if (!c()) return
  c().tooltipPos = tipSide.value + '-' + tipAlign.value
  addLog('api', 'tooltip-pos = ' + c().tooltipPos)
}

/** 重置当前标签页演示到初始状态（从控制台标题栏调用） */
function reset() {
  if (!c()) return
  c().innerHTML = `\
    <time-line-track label="早班段" start="0" end="12" step="0.5">\
      <time-line-segment start="1"  end="5"  label="早高峰" color="#e67e22"></time-line-segment>\
      <time-line-segment start="7"  end="10" label="上午时段" color="#f39c12"></time-line-segment>\
    </time-line-track>\
    <time-line-track label="中班段" start="6" end="20" step="0.5">\
      <time-line-segment start="8"  end="12" label="核心时段" color="#2980b9"></time-line-segment>\
      <time-line-segment start="14" end="18" label="下午班" color="#3498db"></time-line-segment>\
    </time-line-track>\
    <time-line-track label="全天段" start="0" end="24" step="0.5">\
      <time-line-segment start="3"  end="7"  label="凌晨" color="#16a085"></time-line-segment>\
      <time-line-segment start="12" end="14" label="午休" color="#1abc9c"></time-line-segment>\
      <time-line-segment start="19" end="23" label="晚间" color="#27ae60"></time-line-segment>\
    </time-line-track>`
  c().setAttribute('direction', 'horizontal')
  c().setAttribute('axis-mode', 'shared')
  c().setAttribute('shared-start', '0')
  c().setAttribute('shared-end', '24')
  c().removeAttribute('label-h')
  c().removeAttribute('label-v')
  c().removeAttribute('tooltip-pos')
  c().style.height = ''
  c().style.width = ''
  radiusVal.value = '0'
  c().setGlobalRadius('0')
  labelHVal.value = 'top'
  labelVVal.value = 'left'
  heightVal.value = ''
  widthVal.value = ''
  stepVal.value = '0.5'
  tipSide.value = 'top'
  tipAlign.value = 'center'
  bumpAttr()
  addLog('dir', 'horizontal (reset)')
}

defineExpose({ reset })
</script>
