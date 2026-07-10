<template>
  <div>
    <!-- 方向与轴 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[0] }" @click="toggle(0)">
        📐 方向与轴
      </div>
      <div class="ctrl-body" v-show="state[0]">
        <div class="ctrl-row">
          <button class="primary" @click="addTrack">＋ 轨道</button>
        </div>
        <div class="ctrl-row">
          <button @click="toggleDir">{{ btnDirText }}</button>
          <button @click="toggleAxis">{{ btnAxisText }}</button>
          <label v-show="isShared">
            <span class="ctrl-label">共享</span>
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
              <option value="0">无</option>
              <option value="0.25">0.25</option>
              <option value="0.5">0.5</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
            </select>
          </label>
          <label v-show="isShared" style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">范围裁剪</span>
            <input type="checkbox" :checked="sharedClip" @change="toggleClip" />
          </label>
        </div>
      </div>
    </div>

    <!-- 外观 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[1] }" @click="toggle(1)">🎨 外观</div>
      <div class="ctrl-body" v-show="state[1]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">圆角</span>
            <select v-model="radiusVal" @change="setRadius">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
          <label v-show="!isVertical"><span class="ctrl-label">横轴</span>
            <select v-model="labelHVal" @change="setLabel('label-h', labelHVal)">
              <option value="top">上</option>
              <option value="bottom">下</option>
            </select>
          </label>
          <label v-show="isVertical"><span class="ctrl-label">纵轴</span>
            <select v-model="labelVVal" @change="setLabel('label-v', labelVVal)">
              <option value="right">右</option>
              <option value="left">左</option>
            </select>
          </label>
          <label><span class="ctrl-label">高</span> <input type="text" v-model="heightVal" @input="setSize" placeholder="auto"></label>
          <label><span class="ctrl-label">宽</span> <input type="text" v-model="widthVal" @input="setSize" placeholder="auto"></label>
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

    <!-- 缩放 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[3] }" @click="toggle(3)">🔍 缩放</div>
      <div class="ctrl-body" v-show="state[3]">
        <div class="ctrl-row">
          <span style="font-size:11px;color:#666;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            {{ zoomRangeText }}
          </span>
          <span style="font-size:13px;font-weight:600;min-width:50px;text-align:right">
            {{ zoomLevel }}%
          </span>
        </div>
        <div class="ctrl-row" style="gap:4px">
          <button @click="zoomOut" title="缩小" style="flex:1">−</button>
          <button @click="zoomIn" title="放大" style="flex:1">＋</button>
          <button @click="zoomReset" title="重置缩放" style="flex:2">适应</button>
        </div>
        <div class="ctrl-row">
          <span style="font-size:10px;color:#999">⌘/Ctrl + 滚轮 缩放</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { addLog } from '../../stores/eventLog.js'
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(4, 0)

const props = defineProps({
  container: { type: Object, default: null }
})

// ── 状态 ──
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

const stepVal = computed({
  get: () => {
    _attrRev.value
    if (!c()) return '0'
    // 只读容器步长，不影响各轨道自身属性
    const cs = c().getAttribute('step')
    return cs || '0'
  },
  set: (v) => {
    if (!c()) return
    // 只设容器步长，不影响各轨道自身属性
    c().step = parseFloat(v) || 0
    bumpAttr()
  }
})

const sharedClip = computed(() => c() && c().sharedClipRange)

// ── 缩放 ──
const zoomLevel = computed(() => {
  _attrRev.value
  if (!c()) return 100
  const zs = c().zoomStart
  const ze = c().zoomEnd
  if (zs == null || ze == null) return 100
  const zoomRange = ze - zs
  if (!zoomRange) return 100
  const baseRange = c().sharedEnd - c().sharedStart
  if (!baseRange) return 100
  return Math.round((baseRange / zoomRange) * 100)
})

const zoomRangeText = computed(() => {
  _attrRev.value
  if (!c()) return ''
  const zs = c().zoomStart
  const ze = c().zoomEnd
  if (zs == null || ze == null) return '全部视图'
  const fmt = c().getFormatter()
  return fmt.format(zs, 'axis') + ' — ' + fmt.format(ze, 'axis')
})

function toggleClip() {
  if (c()) {
    c().sharedClipRange = !c().sharedClipRange
    addLog('shared-clip-range', c().sharedClipRange)
  }
}

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
  // 校验：确保共用范围的 start < end
  if (!c()) return
  const s = parseFloat(c().getAttribute('shared-start')) || 0
  const e = parseFloat(c().getAttribute('shared-end')) || 24
  if (s >= e) {
    c().setAttribute('shared-end', String(s + 1))
  }
}

function addTrack() {
  if (!c()) return
  const idx = c().allTracks().length + 1
  const t = c().addTrack('摄像头-' + String.fromCharCode(64 + idx) + ' (新增)', 0, 24)
  bumpAttr() // 通知 trackList computed 重新求值
  addLog('track-add', t.label)
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

// ── 缩放操作 ──
function zoomIn() {
  if (!c()) return
  c().zoomIn()
  bumpAttr()
  addLog('zoom', 'in')
}
function zoomOut() {
  if (!c()) return
  c().zoomOut()
  bumpAttr()
  addLog('zoom', 'out')
}
function zoomReset() {
  if (!c()) return
  c().zoomReset()
  bumpAttr()
  addLog('zoom', 'reset')
}

/** 观察容器 zoom 属性变化以刷新显示 */
let _zoomObs = null
function _startZoomObs() {
  _stopZoomObs()
  if (!c()) return
  _zoomObs = new MutationObserver(() => bumpAttr())
  _zoomObs.observe(c(), { attributes: true, attributeFilter: ['zoom-start', 'zoom-end'] })
}
function _stopZoomObs() {
  if (_zoomObs) { _zoomObs.disconnect(); _zoomObs = null }
}

/** 重置当前标签页演示到初始状态（从控制台标题栏调用） */
function reset() {
  if (!c()) return
  c().setAttribute('direction', 'horizontal')
  c().removeAttribute('axis-mode')
  c().removeAttribute('shared-start')
  c().removeAttribute('shared-end')
  c().removeAttribute('zoom-start')
  c().removeAttribute('zoom-end')
  c().removeAttribute('label-h')
  c().removeAttribute('label-v')
  c().removeAttribute('tooltip-pos')
  c().removeAttribute('shared-clip-range')
  c().setAttribute('step', '0.5')
  c().style.height = ''
  c().style.width = ''
  radiusVal.value = '0'
  c().setGlobalRadius('0')
  labelHVal.value = 'top'
  labelVVal.value = 'left'
  heightVal.value = ''
  widthVal.value = ''
  tipSide.value = 'top'
  tipAlign.value = 'center'
  c().innerHTML = `\
    <time-line-track label="摄像头-A（前门）" start="0" end="24" step="0.25">\
      <time-line-segment start="6"  end="9"  label="早班值守" color="#27ae60"></time-line-segment>\
      <time-line-segment start="14" end="15" label="超短时段" color="#e67e22" tooltip="always"></time-line-segment>\
    </time-line-track>\
    <time-line-track label="摄像头-B（后门）" start="0" end="24" step="0.5">\
      <time-line-segment start="8"  end="12" label="上午录像" color="#2980b9"></time-line-segment>\
      <time-line-segment start="13" end="17" label="中班录像一段较长名称" color="#8e44ad" tooltip="auto"></time-line-segment>\
      <time-line-segment start="20" end="23" label="夜间录像" color="#c0392b" tooltip="none"></time-line-segment>\
    </time-line-track>\
    <time-line-track label="摄像头-C（车库）" start="0" end="24">\
      <time-line-segment start="0"  end="6"  label="凌晨巡检" color="#16a085"></time-line-segment>\
      <time-line-segment start="18" end="24" label="夜间巡检" color="#2c3e50"></time-line-segment>\
    </time-line-track>\
    <time-line-track label="机房巡检" start="8" end="22" step="0.5">\
      <time-line-segment start="9"  end="12" label="上午巡检" color="#e67e22"></time-line-segment>\
      <time-line-segment start="13" end="17" label="下午维护" color="#2980b9"></time-line-segment>\
      <time-line-segment start="19" end="21" label="晚间值班" color="#8e44ad"></time-line-segment>\
    </time-line-track>`
  addLog('dir', 'horizontal (reset)')
  bumpAttr()
}

defineExpose({ reset })

// 启动 zoom 属性观察器，wheel 缩放时实时刷新百分比显示
onMounted(() => _startZoomObs())
onUnmounted(() => _stopZoomObs())
</script>
