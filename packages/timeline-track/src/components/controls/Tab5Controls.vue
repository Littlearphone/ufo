<template>
  <div>
    <!-- ════ 方向与轴 ════ -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[0] }" @click="toggle(0)">
        📐 方向与轴
      </div>
      <div class="ctrl-body" v-show="state[0]">
        <div class="ctrl-row">
          <button class="primary" @click="$emit('addTrack')">＋ 轨道</button>
        </div>
        <div class="ctrl-row">
          <button @click="toggleDir">{{ btnDirText }}</button>
          <button @click="toggleAxis">{{ btnAxisText }}</button>
          <label v-show="isShared">
            <span class="ctrl-label">共享</span>
            <span style="display:flex;align-items:center;gap:4px;width:100%">
              <input type="text" :value="sharedS" @input="setSharedS" style="flex:1;min-width:0">
              <span style="flex-shrink:0">~</span>
              <input type="text" :value="sharedE" @input="setSharedE" style="flex:1;min-width:0">
            </span>
          </label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">类型</span>
            <select :value="typeVal" @change="setType">
              <option value="time">time（时间）</option>
              <option value="number">number（数值）</option>
            </select>
          </label>
          <label><span class="ctrl-label">单位</span>
            <select :value="unitVal" @change="setUnit">
              <option value="hour">hour（小时）</option>
              <option value="minute">minute（分钟）</option>
              <option value="second">second（秒）</option>
              <option value="%">%（百分比）</option>
              <option value="px">px（像素）</option>
              <option value="°C">°C（摄氏度）</option>
            </select>
          </label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">步长</span>
            <select :value="stepVal" @change="setStep">
              <option value="0">无</option>
              <option value="900">900（15分）</option>
              <option value="1800">1800（30分）</option>
              <option value="3600">3600（1时）</option>
              <option value="7200">7200（2时）</option>
              <option value="14400">14400（4时）</option>
            </select>
          </label>
          <label v-show="isShared" style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">范围裁剪</span>
            <input type="checkbox" :checked="sharedClipVal" @change="toggleClip" />
          </label>
          <label v-show="isShared" style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">无边框</span>
            <input type="checkbox" :checked="borderlessVal" @change="toggleBorderless" />
          </label>
        </div>
        <div class="ctrl-row">
          <label v-show="isShared"><span class="ctrl-label">轴标签</span>
            <input type="text" :value="axisLabelVal" @input="setAxisLabel" placeholder="例如：我的日程" style="flex:1;min-width:0" />
          </label>
        </div>
        <div class="ctrl-row">
          <label style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">选中模式（点击选中段，流动边框）</span>
            <input type="checkbox" :checked="selModeVal" @change="toggleSelMode" />
          </label>
        </div>
      </div>
    </div>

    <!-- ════ 外观 ════ -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[1] }" @click="toggle(1)">🎨 外观</div>
      <div class="ctrl-body" v-show="state[1]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">圆角</span>
            <select :value="radiusVal" @change="setRadius">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
          <label v-show="!isVertical"><span class="ctrl-label">横轴</span>
            <select :value="labelHVal" @change="setLabelH">
              <option value="top">上</option>
              <option value="bottom">下</option>
            </select>
          </label>
          <label v-show="isVertical"><span class="ctrl-label">纵轴</span>
            <select :value="labelVVal" @change="setLabelV">
              <option value="right">右</option>
              <option value="left">左</option>
            </select>
          </label>
          <label><span class="ctrl-label">高</span> <input type="text" :value="heightVal" @input="setHeight" placeholder="auto"></label>
          <label><span class="ctrl-label">宽</span> <input type="text" :value="widthVal" @input="setWidth" placeholder="auto"></label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">默认颜色</span>
            <input type="color" :value="defaultColorVal" @change="setDefaultColor" style="width:100%;height:26px;padding:2px;border:1px solid #d0d4da;border-radius:3px;cursor:pointer;box-sizing:border-box" />
          </label>
          <label v-show="isShared"><span class="ctrl-label">轴尺背景</span>
            <input type="color" :value="axisBgVal" @change="setAxisBg" style="width:100%;height:26px;padding:2px;border:1px solid #d0d4da;border-radius:3px;cursor:pointer;box-sizing:border-box" />
          </label>
          <label v-show="!isVertical"><span class="ctrl-label">段高</span>
            <input type="text" :value="segHeightVal" @input="setSegHeight" placeholder="100%" />
          </label>
          <label v-show="isVertical"><span class="ctrl-label">段宽</span>
            <input type="text" :value="segWidthVal" @input="setSegWidth" placeholder="100%" />
          </label>
        </div>
        <div class="ctrl-row">
          <label v-show="!isVertical"><span class="ctrl-label">轨道高</span>
            <input type="text" :value="trackHeightVal" @input="setTrackHeight" placeholder="70px" />
          </label>
          <label v-show="isVertical"><span class="ctrl-label">轨道宽</span>
            <input type="text" :value="trackWidthVal" @input="setTrackWidth" placeholder="150px" />
          </label>
        </div>
      </div>
    </div>

    <!-- ════ Tooltip 位置 ════ -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[2] }" @click="toggle(2)">💬 Tooltip 位置</div>
      <div class="ctrl-body" v-show="state[2]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">弹出方向</span>
            <select :value="tipSide" @change="updateTipSide">
              <option value="top">上方 top</option>
              <option value="bottom">下方 bottom</option>
              <option value="left">左方 left</option>
              <option value="right">右方 right</option>
            </select>
          </label>
          <label><span class="ctrl-label">对齐</span>
            <select :value="tipAlign" @change="updateTipAlign">
              <option value="start">起始 start</option>
              <option value="center">居中 center</option>
              <option value="end">末尾 end</option>
            </select>
          </label>
          <span style="font-size:10px;color:#8d9ba9">当前：<code>{{ tipSide }}-{{ tipAlign }}</code></span>
        </div>
      </div>
    </div>

    <!-- ════ 缩放 ════ -->
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

    <!-- ════ CRUD 权限 ════ -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[4] }" @click="toggle(4)">🔒 CRUD 权限</div>
      <div class="ctrl-body" v-show="state[4]">
        <div class="ctrl-row">
          <label style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">creatable（可创建）</span>
            <input type="checkbox" :checked="crudCreatable" @change="setCRUD('creatable', $event.target.checked)">
          </label>
          <label style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">editable（可编辑）</span>
            <input type="checkbox" :checked="crudEditable" @change="setCRUD('editable', $event.target.checked)">
          </label>
          <label style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">deletable（可删除）</span>
            <input type="checkbox" :checked="crudDeletable" @change="setCRUD('deletable', $event.target.checked)">
          </label>
        </div>
        <div class="ctrl-row">
          <label style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">clearable（可清空）</span>
            <input type="checkbox" :checked="crudClearable" @change="setCRUD('clearable', $event.target.checked)">
          </label>
          <label style="cursor:pointer;gap:4px">
            <span style="font-size:11px;color:#555">copyable（可复制）</span>
            <input type="checkbox" :checked="crudCopyable" @change="setCRUD('copyable', $event.target.checked)">
          </label>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
/**
 * Tab5Controls.vue — Vue 3 集成面板控制台
 *
 * 一对一复刻 Tab0Controls（基础操作）的功能，但操作的是 Vue 响应式 props
 * 而非 Custom Elements 的 DOM 属性。
 * 所有修改通过 config 和 cssVars 两个响应式对象直接驱动 VTimelineContainer 更新。
 *
 * @module controls/Tab5Controls
 */
import { computed } from 'vue'
import { addLog } from '../../stores/eventLog.js'
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(5, 0)

const props = defineProps({
  config: { type: Object, default: null },
  cssVars: { type: Object, default: null },
})
const emit = defineEmits(['addTrack'])

/* =============================== 方向与轴 =============================== */

const isVertical = computed(() => props.config?.direction === 'vertical')
const isShared = computed(() => props.config?.axisMode === 'shared')
const btnDirText = computed(() => isVertical.value ? '切换为横向' : '切换为纵向')
const btnAxisText = computed(() => isShared.value ? '切换为独立轴' : '切换为共享轴')

function toggleDir() {
  if (!props.config) return
  const next = isVertical.value ? 'horizontal' : 'vertical'
  props.config.direction = next
  addLog('dir', next)
}

function toggleAxis() {
  if (!props.config) return
  const next = isShared.value ? 'per-track' : 'shared'
  props.config.axisMode = next
  addLog('axis-mode', next)
}

const sharedS = computed(() => props.config?.sharedStart ?? 0)
const sharedE = computed(() => props.config?.sharedEnd ?? 24)

function setSharedS(e) {
  if (!props.config) return
  const v = parseFloat(e.target.value) || 0
  props.config.sharedStart = v
  addLog('shared-start', v)
}

function setSharedE(e) {
  if (!props.config) return
  const v = parseFloat(e.target.value) || 0
  props.config.sharedEnd = v
  addLog('shared-end', v)
}

const stepVal = computed(() => String(props.config?.step ?? '0'))

function setStep(e) {
  if (!props.config) return
  const v = e.target.value
  props.config.step = v
  addLog('step', v)
}

const typeVal = computed(() => props.config?.type ?? 'time')
const unitVal = computed(() => props.config?.unit ?? 'second')

function setType(e) {
  if (!props.config) return
  props.config.type = e.target.value
  addLog('type', e.target.value)
}

function setUnit(e) {
  if (!props.config) return
  props.config.unit = e.target.value
  addLog('unit', e.target.value)
}

const sharedClipVal = computed(() => !!props.config?.sharedClipRange)

function toggleClip() {
  if (!props.config) return
  props.config.sharedClipRange = !props.config.sharedClipRange
  addLog('shared-clip-range', props.config.sharedClipRange)
}

const borderlessVal = computed(() => !!props.config?.borderless)

function toggleBorderless() {
  if (!props.config) return
  props.config.borderless = !props.config.borderless
  addLog('borderless', props.config.borderless)
}

const selModeVal = computed(() => !!props.config?.selectionMode)

function toggleSelMode() {
  if (!props.config) return
  props.config.selectionMode = !props.config.selectionMode
  addLog('selection-mode', props.config.selectionMode)
}

const axisLabelVal = computed(() => props.config?.axisLabel ?? '')

function setAxisLabel(e) {
  if (!props.config) return
  const v = e.target.value
  props.config.axisLabel = v || undefined
  addLog('axis-label', v || '(default)')
}

/* =============================== 外观 =============================== */

const radiusOpts = ['0', '3px', '5px', '8px', '12px', '20px']
const radiusVal = computed(() => props.config?.globalRadius ?? '0')

function setRadius(e) {
  if (!props.config) return
  props.config.globalRadius = e.target.value
  addLog('radius', e.target.value)
}

const labelHVal = computed(() => props.config?.labelH ?? 'top')
const labelVVal = computed(() => props.config?.labelV ?? 'left')

function setLabelH(e) {
  if (!props.config) return
  props.config.labelH = e.target.value
  addLog('label-h', e.target.value)
}

function setLabelV(e) {
  if (!props.config) return
  props.config.labelV = e.target.value
  addLog('label-v', e.target.value)
}

const heightVal = computed(() => props.cssVars?.containerHeight ?? '')
const widthVal = computed(() => props.cssVars?.containerWidth ?? '')

function setHeight(e) {
  if (!props.cssVars) return
  props.cssVars.containerHeight = e.target.value
  addLog('height', e.target.value || '(auto)')
}

function setWidth(e) {
  if (!props.cssVars) return
  props.cssVars.containerWidth = e.target.value
  addLog('width', e.target.value || '(auto)')
}

const defaultColorVal = computed(() => props.config?.defaultColor ?? '#5c9ce6')

function setDefaultColor(e) {
  if (!props.config) return
  props.config.defaultColor = e.target.value
  addLog('default-color', e.target.value)
}

const axisBgVal = computed(() => props.cssVars?.axisBg ?? '')

function setAxisBg(e) {
  if (!props.cssVars) return
  props.cssVars.axisBg = e.target.value
  addLog('axis-bg', e.target.value)
}

const segHeightVal = computed(() => props.cssVars?.segHeight ?? '')
const segWidthVal = computed(() => props.cssVars?.segWidth ?? '')

function setSegHeight(e) {
  if (!props.cssVars) return
  props.cssVars.segHeight = e.target.value || ''
  addLog('seg-height', e.target.value || '100%')
}
function setSegWidth(e) {
  if (!props.cssVars) return
  props.cssVars.segWidth = e.target.value || ''
  addLog('seg-width', e.target.value || '100%')
}

const trackHeightVal = computed(() => props.cssVars?.trackHeight ?? '')
const trackWidthVal = computed(() => props.cssVars?.trackWidth ?? '')

function setTrackHeight(e) {
  if (!props.cssVars) return
  props.cssVars.trackHeight = e.target.value || ''
  addLog('track-height', e.target.value || 'default')
}
function setTrackWidth(e) {
  if (!props.cssVars) return
  props.cssVars.trackWidth = e.target.value || ''
  addLog('track-width', e.target.value || 'default')
}

/* =============================== Tooltip 位置 =============================== */

/** 从 tooltipPos 解析侧边和对齐 */
const tipSide = computed(() => {
  const p = props.config?.tooltipPos || 'top-center'
  return p.split('-')[0] || 'top'
})
const tipAlign = computed(() => {
  const p = props.config?.tooltipPos || 'top-center'
  return p.split('-')[1] || 'center'
})

function updateTipSide(e) {
  if (!props.config) return
  props.config.tooltipPos = e.target.value + '-' + tipAlign.value
  addLog('tooltip-pos', props.config.tooltipPos)
}
function updateTipAlign(e) {
  if (!props.config) return
  props.config.tooltipPos = tipSide.value + '-' + e.target.value
  addLog('tooltip-pos', props.config.tooltipPos)
}

/* =============================== 缩放 =============================== */

/** 缩放基准范围：sharedStart/End 或 0–24 */
function _baseRange() {
  const s = props.config?.sharedStart != null ? Number(props.config.sharedStart) : 0
  const e = props.config?.sharedEnd != null ? Number(props.config.sharedEnd) : 24
  return { start: s, end: e, range: e - s }
}

/** 当前视图范围：zoomStart/zoomEnd 或基准范围 */
function _viewRange() {
  const base = _baseRange()
  const zs = props.config?.zoomStart
  const ze = props.config?.zoomEnd
  if (zs != null && ze != null) return { start: Number(zs), end: Number(ze), range: Number(ze) - Number(zs) }
  return base
}

const zoomLevel = computed(() => {
  const vr = _viewRange()
  const br = _baseRange()
  if (!vr.range || !br.range) return 100
  return Math.round((br.range / vr.range) * 100)
})

const zoomRangeText = computed(() => {
  const vr = _viewRange()
  if (props.config?.zoomStart == null) return '全部视图'
  return vr.start.toFixed(1) + ' — ' + vr.end.toFixed(1)
})

function zoomIn() {
  if (!props.config) return
  const vr = _viewRange()
  const center = (vr.start + vr.end) / 2
  let newRange = vr.range * 0.7

  // 最小/最大范围约束（与 CE _zoomAtRatio 一致）
  const base = _baseRange()
  const minR = Math.max(base.range * 0.003, 0.01)
  const maxR = base.range * 1.2
  if (newRange < minR || newRange >= maxR) return

  // 边界钳制到内容范围内
  const ss = base.start; const se = base.end
  let newStart = center - newRange / 2
  let newEnd = center + newRange / 2
  if (newStart < ss) { newEnd = Math.min(newEnd + (ss - newStart), se); newStart = ss }
  if (newEnd > se) { newStart = Math.max(newStart - (newEnd - se), ss); newEnd = se }

  props.config.zoomStart = newStart
  props.config.zoomEnd = newEnd
  addLog('zoom', 'in')
}

function zoomOut() {
  if (!props.config) return
  const vr = _viewRange()
  const center = (vr.start + vr.end) / 2
  let newRange = vr.range / 0.7

  // 最小/最大范围约束（与 CE _zoomAtRatio 一致）
  const base = _baseRange()
  const minR = Math.max(base.range * 0.003, 0.01)
  const maxR = base.range * 1.2
  if (newRange < minR || newRange >= maxR) return

  // 边界钳制到内容范围内
  const ss = base.start; const se = base.end
  let newStart = center - newRange / 2
  let newEnd = center + newRange / 2
  if (newStart < ss) { newEnd = Math.min(newEnd + (ss - newStart), se); newStart = ss }
  if (newEnd > se) { newStart = Math.max(newStart - (newEnd - se), ss); newEnd = se }

  props.config.zoomStart = newStart
  props.config.zoomEnd = newEnd
  addLog('zoom', 'out')
}

function zoomReset() {
  if (!props.config) return
  props.config.zoomStart = undefined
  props.config.zoomEnd = undefined
  addLog('zoom', 'reset')
}

/* =============================== CRUD 权限 =============================== */

const crudCreatable = computed(() => props.config?.creatable !== false)
const crudEditable = computed(() => props.config?.editable !== false)
const crudDeletable = computed(() => props.config?.deletable !== false)
const crudClearable = computed(() => props.config?.clearable !== false)
const crudCopyable = computed(() => props.config?.copyable !== false)

function setCRUD(key, val) {
  if (!props.config) return
  props.config[key] = val
  addLog(key, val)
}
</script>
