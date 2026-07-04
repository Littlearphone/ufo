<template>
  <div>
    <!-- 方向与轴 -->
    <div class="ctrl-group">
      <div class="ctrl-header">
        📐 方向与轴
        <span class="badge badge-info">{{ dirLabel }}</span>
        <span class="badge badge-ok">{{ axisLabel }}</span>
      </div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <button @click="toggleDir">{{ btnDirText }}</button>
          <button @click="toggleAxis">{{ btnAxisText }}</button>
          <span class="ctrl-sep"></span>
          <label v-show="isShared">
            共用范围
            <input type="text" v-model.number="sharedS" style="width:26px" @input="setShared">
            ~
            <input type="text" v-model.number="sharedE" style="width:26px" @input="setShared">
          </label>
        </div>
        <div class="ctrl-row">
          <label>
            步长
            <select v-model="stepVal" @change="setStep" style="max-width:70px">
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
      <div class="ctrl-header">🎨 外观</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label v-show="!isVertical">
            横轴标签
            <select v-model="labelHVal" @change="setLabel('label-h', labelHVal)" style="max-width:60px">
              <option value="top">上</option>
              <option value="bottom">下</option>
            </select>
          </label>
          <label v-show="isVertical">
            纵轴标签
            <select v-model="labelVVal" @change="setLabel('label-v', labelVVal)" style="max-width:60px">
              <option value="right">右</option>
              <option value="left">左</option>
            </select>
          </label>
          <span class="ctrl-sep"></span>
          <label>
            圆角
            <select v-model="radiusVal" @change="setRadius" style="max-width:72px">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
        </div>
        <div class="ctrl-row">
          <label>容器高 <input type="text" v-model="heightVal" @input="setSize" placeholder="auto" style="width:48px"></label>
          <label>容器宽 <input type="text" v-model="widthVal" @input="setSize" placeholder="auto" style="width:48px"></label>
          <span class="ctrl-sep"></span>
          <button @click="resetDemo">重置</button>
        </div>
      </div>
    </div>

    <!-- Tooltip 位置 -->
    <div class="ctrl-group">
      <div class="ctrl-header">💬 Tooltip 位置 <span class="badge badge-info">可配置</span></div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label>弹出方向
            <select v-model="tipSide" @change="updateTip" style="max-width:82px">
              <option value="top">上方 top</option>
              <option value="bottom">下方 bottom</option>
              <option value="left">左方 left</option>
              <option value="right">右方 right</option>
            </select>
          </label>
          <label>对齐
            <select v-model="tipAlign" @change="updateTip" style="max-width:78px">
              <option value="start">起始 start</option>
              <option value="center">居中 center</option>
              <option value="end">末尾 end</option>
            </select>
          </label>
          <span class="ctrl-sep"></span>
          <span style="font-size:10px;color:#8d9ba9">当前：<code>{{ tipSide }}-{{ tipAlign }}</code></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { addLog } from '../../stores/eventLog.js'

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
const stepVal = ref('1')
const tipSide = ref('top')
const tipAlign = ref('center')

const dir = computed(() => {
  _attrRev.value
  if (!c()) return 'horizontal'
  const d = c().getAttribute('direction') || c().getAttribute('方向') || ''
  return (d === 'vertical' || d === '纵向') ? 'vertical' : 'horizontal'
})
const isVertical = computed(() => dir.value === 'vertical')
const isShared = computed(() => {
  _attrRev.value
  return c() && c().axisMode === 'shared'
})
const dirLabel = computed(() => isVertical.value ? '纵向' : '横向')
const axisLabel = computed(() => isShared.value ? '共享轴' : '独立轴')
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

function setShared() { bumpAttr() }

function setStep() {
  if (!c()) return
  const v = parseFloat(stepVal.value)
  c().allTracks().forEach(t => t.setAttribute('step', String(v)))
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

function resetDemo() {
  if (!c()) return
  // 先重建轨道内容（这会销毁旧轴尺 DOM）
  c().innerHTML = `
    <time-line-track label="早班段" start="0" end="12" step="0.5">
      <time-line-segment start="1"  end="5"  label="早高峰" color="#e67e22"></time-line-segment>
      <time-line-segment start="7"  end="10" label="上午时段" color="#f39c12"></time-line-segment>
    </time-line-track>
    <time-line-track label="中班段" start="6" end="20" step="0.5">
      <time-line-segment start="8"  end="12" label="核心时段" color="#2980b9"></time-line-segment>
      <time-line-segment start="14" end="18" label="下午班" color="#3498db"></time-line-segment>
    </time-line-track>
    <time-line-track label="全天段" start="0" end="24" step="1">
      <time-line-segment start="3"  end="7"  label="凌晨" color="#16a085"></time-line-segment>
      <time-line-segment start="12" end="14" label="午休" color="#1abc9c"></time-line-segment>
      <time-line-segment start="19" end="23" label="晚间" color="#27ae60"></time-line-segment>
    </time-line-track>`
  // 再设置属性（触发 attributeChangedCallback → _syncAxisRuler 自动重建轴尺）
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
  labelHVal.value = 'top'
  labelVVal.value = 'left'
  heightVal.value = ''
  widthVal.value = ''
  stepVal.value = '1'
  tipSide.value = 'top'
  tipAlign.value = 'center'
  bumpAttr()
  addLog('dir', 'horizontal (reset)')
}

function updateTip() {
  if (!c()) return
  c().tooltipPos = tipSide.value + '-' + tipAlign.value
  addLog('api', 'tooltip-pos = ' + c().tooltipPos)
}
</script>
