<template>
  <div>
    <!-- 方向与轴 -->
    <div class="ctrl-group">
      <div class="ctrl-header">
        📐 方向与轴
        <span class="badge badge-info" id="t0_dirBadge">{{ dirLabel }}</span>
        <span class="badge badge-muted" id="t0_axisBadge">{{ axisLabel }}</span>
      </div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <button @click="toggleDir">{{ btnDirText }}</button>
          <button @click="toggleAxis">{{ btnAxisText }}</button>
          <span class="ctrl-sep"></span>
          <label v-show="isShared">
            共享
            <input type="text" v-model.number="sharedS" style="width:26px" @input="setShared">
            ~
            <input type="text" v-model.number="sharedE" style="width:26px" @input="setShared">
          </label>
        </div>
      </div>
    </div>

    <!-- 轨道管理 -->
    <div class="ctrl-group">
      <div class="ctrl-header">🎯 轨道管理</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <select v-model="selectedTrackIdx" style="max-width:110px">
            <option v-for="(t, i) in trackList" :key="i" :value="i">{{ t.label || '轨道 '+(i+1) }}</option>
          </select>
          <button class="primary" @click="addTrack">＋ 轨道</button>
          <span class="ctrl-sep"></span>
          <button class="danger" @click="clearSegs">清空段</button>
          <button @click="resetDemo">重置</button>
        </div>
      </div>
    </div>

    <!-- 外观 -->
    <div class="ctrl-group">
      <div class="ctrl-header">🎨 外观</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label>圆角
            <select v-model="radiusVal" @change="setRadius" style="max-width:72px">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
          <span class="ctrl-sep"></span>
          <label v-show="!isVertical">横轴
            <select v-model="labelHVal" @change="setLabel('label-h', labelHVal)" style="max-width:60px">
              <option value="top">上</option>
              <option value="bottom">下</option>
            </select>
          </label>
          <label v-show="isVertical">纵轴
            <select v-model="labelVVal" @change="setLabel('label-v', labelVVal)" style="max-width:60px">
              <option value="right">右</option>
              <option value="left">左</option>
            </select>
          </label>
          <span class="ctrl-sep"></span>
          <label>高 <input type="text" v-model="heightVal" @input="setSize" placeholder="auto" style="width:48px"></label>
          <label>宽 <input type="text" v-model="widthVal" @input="setSize" placeholder="auto" style="width:48px"></label>
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

// ── 状态 ──
const selectedTrackIdx = ref(0)
const radiusOpts = ['0', '3px', '5px', '8px', '12px', '20px']
const radiusVal = ref('0')
const labelHVal = ref('top')
const labelVVal = ref('left')
const heightVal = ref('')
const widthVal = ref('')
const tipSide = ref('top')
const tipAlign = ref('center')

// 版本计数器：DOM 属性每变更一次 +1，让依赖 DOM 的 computed 重新求值
const _attrRev = ref(0)
function bumpAttr() { _attrRev.value++ }

// ── 计算 ──
const c = () => props.container
const trackList = computed(() => {
  _attrRev.value // 追踪 DOM 变化（新增/删除轨道后 bumpAttr 触发重算）
  return c() ? c().allTracks() : []
})
const dir = computed(() => {
  _attrRev.value // 追踪版本变化
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

// ── 方法 ──
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
  // v-model.number handles the parsing
}

function addTrack() {
  if (!c()) return
  const idx = c().allTracks().length + 1
  const t = c().addTrack('摄像头-' + String.fromCharCode(64 + idx) + ' (新增)', 0, 24, { step: 0.5 })
  selectedTrackIdx.value = c().allTracks().length - 1
  bumpAttr() // 通知 trackList computed 重新求值
  addLog('track-add', t.label)
}

function clearSegs() {
  if (!c()) return
  const all = c().querySelectorAll('time-line-segment')
  if (!all.length) return
  all.forEach(s => s.remove())
}

function resetDemo() {
  if (!c()) return
  c().setAttribute('direction', 'horizontal')
  c().removeAttribute('axis-mode')
  c().removeAttribute('shared-start')
  c().removeAttribute('shared-end')
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
  tipSide.value = 'top'
  tipAlign.value = 'center'
  c().innerHTML = `
    <time-line-track label="摄像头-A（前门）" start="0" end="24" step="0.25">
      <time-line-segment start="6"  end="9"  label="早班值守" color="#27ae60"></time-line-segment>
      <time-line-segment start="14" end="15" label="超短时段" color="#e67e22" tooltip="always"></time-line-segment>
    </time-line-track>
    <time-line-track label="摄像头-B（后门）" start="0" end="24" step="0.5">
      <time-line-segment start="8"  end="12" label="上午录像" color="#2980b9"></time-line-segment>
      <time-line-segment start="13" end="17" label="中班录像一段较长名称" color="#8e44ad" tooltip="auto"></time-line-segment>
      <time-line-segment start="20" end="23" label="夜间录像" color="#c0392b" tooltip="none"></time-line-segment>
    </time-line-track>
    <time-line-track label="摄像头-C（车库）" start="0" end="24">
      <time-line-segment start="0"  end="6"  label="凌晨巡检" color="#16a085"></time-line-segment>
      <time-line-segment start="18" end="24" label="夜间巡检" color="#2c3e50"></time-line-segment>
    </time-line-track>`
  selectedTrackIdx.value = 0
  addLog('dir', 'horizontal (reset)')
  bumpAttr()
}

function setRadius() {
  if (c()) c().setGlobalRadius(radiusVal.value)
}

function setLabel(attr, val) {
  if (c()) { c().setAttribute(attr, val); bumpAttr() }
}

function setSize() {
  if (!c()) return
  c().style.height = heightVal.value || ''
  c().style.width = widthVal.value || ''
}

function updateTip() {
  if (!c()) return
  c().tooltipPos = tipSide.value + '-' + tipAlign.value
  bumpAttr()
  addLog("api", "tooltip-pos = " + c().tooltipPos)
}
</script>
