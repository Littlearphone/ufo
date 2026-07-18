<template>
  <div class="tlt-row" :class="{ vertical: vertical, 'tlt-shared': axisMode === 'shared' }"
    @contextmenu.prevent="onTrackCtxMenu"
    :data-track-id="track.id"
    :data-editable="editable ? 'true' : 'false'"
    :data-eff-range-start="effRange.start"
    :data-eff-range-end="effRange.end"
    :data-drag-bounds-start="dragBounds.start"
    :data-drag-bounds-end="dragBounds.end">
    <!-- 轨道头部 -->
    <div class="tlt-head">
      <span class="tlt-head-label" :title="labelText">{{ labelText }}</span>
      <span v-if="_showRangeLabel" class="tlt-head-range">{{ rangeLabel }}</span>
    </div>

    <!-- 轨道主体 -->
    <div class="tlt-body" ref="bodyRef">
      <canvas ref="canvasRef" class="tlt-grid-canvas" />
      <div
        class="tlt-seg-area"
        ref="segAreaRef"
        @pointerdown.prevent="onAreaDown"
      >
        <VTimelineSegment
          v-for="seg in positionedSegments"
          :key="seg.id"
          :segment="seg"
          :pixel-left="seg.pxStart"
          :pixel-width="seg.pxWidth"
          :hidden="seg.pxHidden"
          :prev-seg-end="seg.prevSegEnd"
          :next-seg-start="seg.nextSegStart"
          :step="effectiveStep"
          :min-duration="minDuration"
          :editable="editable"
          :deletable="deletable"
          :copyable="copyable"
          :track-creatable="creatable"
          :vertical="vertical"
          :range-start="rangeStart"
          :range-end="rangeEnd"
          :eff-range-start="effRange.start"
          :eff-range-end="effRange.end"
          :formatter="formatter"
          :locale="locale"
          :tooltip-pos="tooltipPos"
          :global-radius="globalRadius"
          :selection-mode="selectionMode"
          :max-segments="maxSegments"
          @change="onSegChange"
          @delete="onSegDelete"
          @segment-change="onSegmentChanging"
          @context-menu="onSegCtxMenu"
        />

        <!-- 拖拽创建预览条（在 seg-area 内，与 CE 定位一致） -->
        <div v-if="_creating" class="tlt-ghost" :style="ghostStyle">
          <span class="tlt-ghost-label">{{ ghostLabel }}</span>
        </div>
      </div>

      <!-- 共享轴裁剪模式遮罩（放在 .tlt-body 内，与 seg-area 共享坐标系统） -->
      <div v-if="_clipOverlayVisible" class="tlt-clip-overlay">
        <div class="tlt-clip-block tlt-clip-left" :style="clipLeftStyle"></div>
        <div class="tlt-clip-block tlt-clip-right" :style="clipRightStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * VTimelineTrack.vue — 轨道 Vue 组件
 *
 * 完全兼容 lib/TimeTrack.js 的全部功能，使用 Vue 3 Composition API 实现。
 * 支持网格、拖拽创建、右键菜单、复制粘贴、locale 等完整功能。
 *
 * @module vue/VTimelineTrack
 */
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch, } from 'vue'
import { clamp, snap } from '../shared/utils.js'
import { AXIS_MODE_KEY } from './inject-keys.js'
import { formatLocale, useLocale } from './useLocale.js'
import { useTooltip } from './useTooltip.js'
import { useContextMenu } from './useContextMenu.js'
import { useClipboard } from './useClipboard.js'
import { useModal } from './useModal.js'
import VTimelineSegment from './VTimelineSegment.vue'

/* =============================== Props =============================== */

const props = defineProps({
  track: { type: Object, required: true },
  vertical: { type: Boolean, default: false },
  step: { type: Number, default: 0 },
  minDuration: { type: Number, default: 0 },
  editable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  creatable: { type: Boolean, default: true },
  clearable: { type: Boolean, default: true },
  copyable: { type: Boolean, default: true },
  rangeStart: { type: Number, default: 0 },
  rangeEnd: { type: Number, default: 24 },
  formatter: { type: Object, default: null },
  locale: { type: Object, default: null },
  maxSegments: { type: Number, default: 0 },
  defaultColor: { type: String, default: '#5c9ce6' },
  labelH: { type: String, default: 'top' },
  labelV: { type: String, default: 'left' },
  tooltipPos: { type: String, default: 'top-center' },
  globalRadius: { type: String, default: '0' },
  selectionMode: { type: Boolean, default: false },
  sharedClipRange: { type: Boolean, default: false },
  sharedStart: { type: Number, default: 0 },
  sharedEnd: { type: Number, default: 24 },
  zoomStart: { type: Number, default: null },
  zoomEnd: { type: Number, default: null },
})

const emit = defineEmits([
  'seg-change',
  'seg-delete',
  'seg-create',
  'context-menu',
  'segment-limit-reached',
])

/* =============================== 注入容器上下文 =============================== */

const axisMode = inject(AXIS_MODE_KEY, computed(() => 'per-track'))

/* =============================== Locale =============================== */

const _locale = computed(() => props.locale || useLocale())
const tooltipCtrl = useTooltip()
const ctxMenuCtrl = useContextMenu()
const clipboardCtrl = useClipboard()
const modalCtrl = useModal()

/* =============================== Refs =============================== */

const bodyRef = ref(null)
const canvasRef = ref(null)
const segAreaRef = ref(null)

/** 响应式段区域尺寸，ResizeObserver 更新后触发模板重渲染 */
const segAreaSize = ref({ w: 0, h: 0 })

/** 有效步长 — 透传容器解析后的 step 值 */
const effectiveStep = computed(() => props.step)

/* =============================== 标签 =============================== */

const labelText = computed(() => {
  const loc = _locale.value
  return props.track.label || loc.unnamed || ''
})

/** 共享模式时隐藏轨道头部时间范围（由轴尺统一显示，与 CE 对齐） */
const _showRangeLabel = computed(() => axisMode.value !== 'shared')

const rangeLabel = computed(() => {
  if (!_showRangeLabel.value) return ''
  const fmt = props.formatter
  if (!fmt) return `${props.rangeStart} – ${props.rangeEnd}`
  return fmt.formatRange(props.rangeStart, props.rangeEnd, 'axis')
})

/* =============================== 段排序 =============================== */

const sortedSegments = computed(() => {
  const segs = [...(props.track.segments || [])]
  segs.sort((a, b) => a.start - b.start)
  return segs
})

/* =============================== 有效范围 =============================== */

const effRange = computed(() => {
  // 缩放 > 共享轴 > 独立轴（与 CE _effRange 一致）
  if (props.zoomStart != null && props.zoomEnd != null) {
    return { start: props.zoomStart, end: props.zoomEnd }
  }
  if (axisMode.value === 'shared') {
    return { start: props.sharedStart, end: props.sharedEnd }
  }
  return { start: props.rangeStart, end: props.rangeEnd }
})

/** 拖拽约束范围（共享轴裁剪模式时限制到轨道自身范围，与 CE _dragBounds 一致） */
const dragBounds = computed(() => {
  if (props.sharedClipRange && axisMode.value === 'shared') {
    return { start: props.rangeStart, end: props.rangeEnd }
  }
  return effRange.value
})

/**
 * 批量段像素定位（与 CE _refreshPositions 逻辑对齐）
 * 一次性计算所有段的像素位置，实现相邻段重叠预防和最小宽度 6px 约束
 */
const positionedSegments = computed(() => {
  const segs = sortedSegments.value
  const dim = _getAreaDim()
  const totalDim = props.vertical ? dim.h : dim.w
  const range = effRange.value.end - effRange.value.start
  if (!totalDim || !range) return segs.map(s => ({ ...s, pxStart: 0, pxWidth: 2, pxHidden: false }))

  // 预计算所有左边界
  const lefts = segs.map(s => ((s.start - effRange.value.start) / range) * totalDim)

  return segs.map((seg, i) => {
    let p1 = lefts[i]
    let p2 = ((seg.end - effRange.value.start) / range) * totalDim
    // 安全 clamp
    if (p1 < 0) p1 = 0
    if (p2 > totalDim) p2 = totalDim
    const pxHidden = p1 >= totalDim || p2 <= 0

    // 计算右侧边界（受下一段约束）
    let rightBound = totalDim
    if (i < segs.length - 1) {
      const nStart = lefts[i + 1]
      if (nStart >= p2) rightBound = nStart
    }
    const avail = rightBound - p1
    const minW = Math.min(2, avail)
    const segW = Math.min(Math.max(p2 - p1, minW), avail)

    return { ...seg, pxStart: p1, pxWidth: segW, pxHidden,
      // 段间阻隔边界（与 CE _computeBounds 对齐）：前一段的 end、后一段的 start
      // 首/末段使用 dragBounds（共享模式下自动切换共享/轨道范围）
      prevSegEnd: i > 0 ? segs[i - 1].end : dragBounds.value.start,
      nextSegStart: i < segs.length - 1 ? segs[i + 1].start : dragBounds.value.end,
    }
  })
})

/* =============================== 像素↔值转换 =============================== */

function _getAreaDim() {
  // 优先使用响应式尺寸（ResizeObserver 驱动），确保段位置随容器尺寸变化自动更新
  if (segAreaSize.value.w > 0 || segAreaSize.value.h > 0) {
    return segAreaSize.value
  }
  // 兜底：初始渲染时 ref 可能尚未就绪
  const el = segAreaRef.value
  if (!el) return { w: 100, h: 100 }
  return { w: el.clientWidth, h: el.clientHeight }
}

function _val2Px(val) {
  const dim = _getAreaDim()
  const totalDim = props.vertical ? dim.h : dim.w
  const range = effRange.value.end - effRange.value.start
  if (!range || !totalDim) return 0
  return ((val - effRange.value.start) / range) * totalDim
}

function _px2Val(px) {
  const dim = _getAreaDim()
  const totalDim = props.vertical ? dim.h : dim.w
  const range = effRange.value.end - effRange.value.start
  if (!range || !totalDim) return 0
  return (px / totalDim) * range
}

function getSegPixelLeft(seg) { return _val2Px(seg.start) }
function getSegPixelWidth(seg) {
  const p1 = _val2Px(seg.start)
  const p2 = _val2Px(seg.end)
  return Math.max(p2 - p1, 2)
}

function isSegHidden(seg) {
  const dim = _getAreaDim()
  const totalDim = props.vertical ? dim.h : dim.w
  const p1 = _val2Px(seg.start)
  const p2 = _val2Px(seg.end)
  return p1 >= totalDim || p2 <= 0
}

/* =============================== 网格 Canvas 绘制 =============================== */

let _resizeObs = null

function drawGrid() {
  const canvas = canvasRef.value
  const body = bodyRef.value
  if (!canvas || !body) return

  const rect = body.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const fmt = props.formatter
  if (!fmt) return

  const er = effRange.value
  const range = er.end - er.start
  if (!range) return

  const dim = props.vertical ? rect.height : rect.width
  const step = fmt.niceStep(range, dim)

  const segRect = segAreaRef.value?.getBoundingClientRect()
  const offX = segRect ? segRect.left - rect.left : 0
  const offY = segRect ? segRect.top - rect.top : (props.vertical ? 0 : 0)

  // 次刻度
  ctx.strokeStyle = '#f0f2f5'
  ctx.lineWidth = 0.5
  for (let t = Math.floor(er.start / step) * step; t <= er.end; t += step / 2) {
    _drawGridLine(ctx, t, dim, offX, offY)
  }

  // 主刻度
  ctx.strokeStyle = '#dde0e4'
  ctx.lineWidth = 0.7
  for (let t = Math.floor(er.start / step) * step; t <= er.end; t += step) {
    _drawGridLine(ctx, t, dim, offX, offY)
  }

  // 共享模式有粘性轴尺时轨道不画标签（由轴尺统一绘制，与 CE 对齐）
  if (axisMode.value === 'shared') return

  // 标签
  ctx.fillStyle = '#7a8591'
  ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
  if (props.vertical) {
    ctx.textBaseline = 'middle'
    ctx.textAlign = props.labelV === 'left' ? 'left' : 'right'
    const labelX = props.labelV === 'left' ? 6 : rect.width - 6
    let _lastTLabel = ''
    for (let t = Math.floor(er.start / step) * step; t <= er.end; t += step) {
      const px = _val2Px(t)
      if (px > 14 && px < rect.height - 8) {
        const text = fmt.format(t, 'axis')
        if (text !== _lastTLabel) {
          ctx.fillText(text, labelX, px + offY)
          _lastTLabel = text
        }
      }
    }
    // 强制显示首尾（防重叠：相邻标签 < 28px 则跳过）
    const sp = _val2Px(er.start), ep = _val2Px(er.end)
    if (sp <= 14) {
      const tick = Math.floor(er.start / step) * step + step
      const nextPx = tick <= er.end ? _val2Px(tick) : rect.height
      const drawPx = Math.max(sp + offY, 10)
      if (nextPx - drawPx > 28) {
        if (tick > er.end || fmt.format(er.start, 'axis') !== fmt.format(tick, 'axis')) {
          ctx.fillText(fmt.format(er.start, 'axis'), labelX, drawPx)
        }
      }
    }
    if (ep >= rect.height - 8) {
      const lastTick = Math.floor(er.end / step) * step
      const prevPx = lastTick > er.start ? _val2Px(lastTick) : 0
      const drawPx = ep + offY - 10
      if (drawPx - prevPx > 28) {
        if (!_lastTLabel || fmt.format(er.end, 'axis') !== _lastTLabel) {
          ctx.fillText(fmt.format(er.end, 'axis'), labelX, drawPx)
        }
      }
    }
  } else {
    ctx.textAlign = 'center'
    ctx.textBaseline = props.labelH === 'bottom' ? 'bottom' : 'top'
    const labelY = props.labelH === 'bottom' ? rect.height - 4 : 4
    let _lastHLabel = ''
    for (let t = Math.floor(er.start / step) * step; t <= er.end; t += step) {
      const px = _val2Px(t)
      if (px > 24 && px < rect.width - 24) {
        const text = fmt.format(t, 'axis')
        if (text === _lastHLabel) continue
        ctx.fillText(text, px + offX, labelY)
        _lastHLabel = text
      }
    }
    // 强制显示首尾（防重叠：相邻标签 < 28px 则跳过）
    const sp = _val2Px(er.start), ep = _val2Px(er.end)
    ctx.textAlign = 'left'
    if (sp <= 24) {
      const tick = Math.floor(er.start / step) * step + step
      const nextPx = tick <= er.end ? _val2Px(tick) : rect.width
      const drawX = Math.max(sp + offX, 2)
      if (nextPx - drawX > 28) {
        if (tick > er.end || fmt.format(er.start, 'axis') !== fmt.format(tick, 'axis')) {
          ctx.fillText(fmt.format(er.start, 'axis'), drawX, labelY)
        }
      }
    }
    ctx.textAlign = 'right'
    if (ep >= rect.width - 24) {
      const lastTick = Math.floor(er.end / step) * step
      const prevPx = lastTick > er.start ? _val2Px(lastTick) : 0
      const drawX = Math.min(ep + offX, rect.width - 2)
      if (drawX - prevPx > 28) {
        if (!_lastHLabel || fmt.format(er.end, 'axis') !== _lastHLabel) {
          ctx.fillText(fmt.format(er.end, 'axis'), drawX, labelY)
        }
      }
    }
  }
}

function _drawGridLine(ctx, t, dim, offX, offY) {
  const px = _val2Px(t)
  if (props.vertical) {
    ctx.beginPath()
    ctx.moveTo(0, px + offY)
    ctx.lineTo(dim, px + offY)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(px + offX, 0)
    ctx.lineTo(px + offX, dim)
    ctx.stroke()
  }
}

/* =============================== 拖拽创建 =============================== */

const _creating = ref(false)
const ghostStyle = ref({})
const ghostLabel = ref('')
let _createStartVal = 0
let _createStartPx = 0

/* ---- 共享轴裁剪模式遮罩 ---- */
const _clipOverlayVisible = ref(false)
const clipLeftStyle = ref({})
const clipRightStyle = ref({})

/** 更新裁剪遮罩位置（与 CE _updateClipOverlay 对齐：仅共享轴 + clipRange 同时生效） */
function updateClipOverlay() {
  const active = props.sharedClipRange && axisMode.value === 'shared'
  if (!active) {
    _clipOverlayVisible.value = false
    return
  }
  _clipOverlayVisible.value = true

  const er = effRange.value
  const range = er.end - er.start
  if (!range) return

  const area = segAreaRef.value
  if (!area) return
  const dim = props.vertical ? area.offsetHeight : area.offsetWidth
  if (!dim) return

  const leftPx  = ((props.rangeStart - er.start) / range) * dim
  const rightPx = ((props.rangeEnd   - er.start) / range) * dim

  if (props.vertical) {
    clipLeftStyle.value  = { left: '0', right: '0', top: '0', height: leftPx + 'px', bottom: 'auto' }
    clipRightStyle.value = { left: '0', right: '0', top: rightPx + 'px', bottom: '0', height: 'auto' }
  } else {
    clipLeftStyle.value  = { top: '0', bottom: '0', left: '0', width: leftPx + 'px', right: 'auto' }
    clipRightStyle.value = { top: '0', bottom: '0', left: rightPx + 'px', right: '0', width: 'auto' }
  }
}

function onAreaDown(e) {
  if (e.button !== 0 || !props.creatable) return
  if (e.target.closest('.tls-wrapper, .tls-cross-ghost')) return

  const area = segAreaRef.value
  if (!area) return
  const rect = area.getBoundingClientRect()

  const cp = props.vertical ? e.clientY : e.clientX
  const orig = props.vertical ? rect.top : rect.left
  const dim = props.vertical ? rect.height : rect.width
  if (!dim) return

  // 检查段数上限
  if (!_checkSegmentLimit()) return

  _creating.value = true
  _createStartVal = effRange.value.start + ((cp - orig) / dim) * (effRange.value.end - effRange.value.start)
  _createStartPx = cp

  const v = props.vertical
  const sp = _val2Px(_createStartVal)
  // ghost 定位上下文为 .tlt-seg-area（position:absolute），与 CE 一致
  ghostStyle.value = v
    ? { left: '0', right: '0', top: sp + 'px', height: '2px' }
    : { top: '0', bottom: '0', left: sp + 'px', width: '2px' }

  const fmt = props.formatter
  ghostLabel.value = fmt ? fmt.format(_createStartVal, 'tooltip') : String(_createStartVal)

  const onMove = (ev) => _createMove(ev)
  const onUp = (ev) => { _createUp(ev); cleanup() }
  const cleanup = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
  }
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
}

function _createMove(e) {
  if (!_creating.value) return
  const v = props.vertical
  const cp = v ? e.clientY : e.clientX
  const area = segAreaRef.value
  if (!area) return
  const rect = area.getBoundingClientRect()
  const orig = v ? rect.top : rect.left
  const dim = v ? rect.height : rect.width

  let t2 = effRange.value.start + ((cp - orig) / dim) * (effRange.value.end - effRange.value.start)
  t2 = clamp(t2, dragBounds.value.start, dragBounds.value.end)

  const lo = Math.min(_createStartVal, t2)
  const hi = Math.max(_createStartVal, t2)
  const p1 = _val2Px(lo)
  const p2 = _val2Px(hi)

  // ghost 定位上下文为 .tlt-seg-area（position:absolute），与 CE 一致
  ghostStyle.value = v
    ? { left: '0', right: '0', top: p1 + 'px', height: Math.max(3, p2 - p1) + 'px' }
    : { top: '0', bottom: '0', left: p1 + 'px', width: Math.max(3, p2 - p1) + 'px' }

  // 更新 tooltip 显示起止范围
  const fmt = props.formatter
  ghostLabel.value = fmt ? fmt.formatRange(lo, hi, 'tooltip') : `${lo} – ${hi}`
}

function _createUp(e) {
  _creating.value = false
  const area = segAreaRef.value
  if (!area) return
  const rect = area.getBoundingClientRect()
  const v = props.vertical
  const cp = v ? e.clientY : e.clientX
  const orig = v ? rect.top : rect.left
  const dim = v ? rect.height : rect.width

  const t2 = effRange.value.start + ((cp - orig) / dim) * (effRange.value.end - effRange.value.start)
  let lo = Math.min(_createStartVal, t2)
  let hi = Math.max(_createStartVal, t2)

  // 步长吸附（与 CE 一致：使用 axisStep/2 缩小步长以免放大后偏离刻度）
  if (props.step) {
    let effStep = props.step
    const fmt = props.formatter
    if (fmt) {
      const visRange = effRange.value.end - effRange.value.start
      const axisStep = fmt.niceStep(visRange, dim)
      if (axisStep > 0) effStep = Math.min(props.step, axisStep / 2)
    }
    lo = snap(lo, effStep)
    hi = snap(hi, effStep)
  }

  lo = clamp(lo, dragBounds.value.start, dragBounds.value.end)
  hi = clamp(hi, dragBounds.value.start, dragBounds.value.end)

  if (hi - lo < props.minDuration) return

  // 检查重叠并调整范围以适合可用间隙（与 CE 一致：适应而非放弃）
  const exist = sortedSegments.value
  for (const seg of exist) {
    if (lo < seg.end && hi > seg.start) {
      if (_createStartVal < seg.start) hi = Math.min(hi, seg.start)
      else lo = Math.max(lo, seg.end)
    }
  }

  if (hi - lo > 0) {
    emit('seg-create', {
      trackId: props.track.id,
      start: lo,
      end: hi,
      color: props.defaultColor,
    })
  }
}

/** 检查当前段数是否已达上限 */
function _checkSegmentLimit() {
  const max = props.maxSegments
  if (max <= 0) return true
  const current = sortedSegments.value.length
  if (current < max) return true
  // 已超限：派发通知事件（fire-and-forget），始终阻止创建
  emit('segment-limit-reached', { trackId: props.track.id, current, max })
  return false
}

/* =============================== 段事件 =============================== */

function onSegChange({ id, start, end, copyFrom, targetTrackId }) {
  emit('seg-change', { trackId: props.track.id, id, start, end, copyFrom, targetTrackId })
}

function onSegDelete(id) {
  emit('seg-delete', { trackId: props.track.id, id })
}

function onSegmentChanging({ id, start, end }) {
  // 拖拽中实时事件
}

/** 段无法自行处理的事件（跨轨道拖放、编辑段属性）转发给 Container */
function onSegCtxMenu(e) {
  if (e.action === 'cross-track-drop') {
    // 直接转发段发起的跨轨道事件（含 targetTrackId/start/end），
    // 不再覆盖 targetTrackId，避免错误的设为源轨道 ID
    emit('context-menu', e)
    return
  }
  if (e.action === 'edit-segment') {
    // 段编辑属性：转发给 Container 打开编辑 Modal
    emit('context-menu', { action: 'edit-segment', segment: e.segment, trackId: props.track.id })
    return
  }
}

/* =============================== 轨道右键菜单 =============================== */

function onTrackCtxMenu(e) {
  // 如果点击在段上则不处理
  if (e.target.closest('.tls-wrapper')) return

  const loc = _locale.value
  const trackLabel = props.track.label || loc.unnamed || ''
  const clip = clipboardCtrl.clipboard.value
  const items = [
    { type: 'header', label: formatLocale(loc.trackMenuHeader || '📋 {name}', { name: trackLabel }) },
  ]

  if (props.editable) {
    items.push({
      label: loc.modifyProps || '修改属性',
      action: () => _editTrack(),
    })
  }

  // 粘贴
  if (clip && clip.type === 'segment' && props.creatable) {
    items.push({
      label: loc.pasteSegment || '粘贴段',
      action: () => _pasteSegment(clip.data, e.clientX, e.clientY),
    })
  }
  if (clip && clip.type === 'track' && props.creatable) {
    items.push({
      label: loc.pasteNewTrack || '粘贴为新轨道',
      action: () => _pasteNewTrack(clip.data),
    })
  }
  if (clip && clip.type === 'track' && props.deletable) {
    items.push({
      label: loc.pasteOverwrite || '覆盖粘贴到本轨道',
      action: () => _pasteOverwrite(clip.data),
    })
  }

  // 复制
  if (props.copyable) {
    items.push({
      label: loc.copyTrack || '复制轨道',
      action: () => _copyTrack(),
    })
    // "复制到其他轨道…"（与 CE copyToTracks 菜单项对齐）
    items.push({
      label: loc.copyToTracks || '复制到其他轨道…',
      action: () => _showCopyToTracksDialog(),
    })
  }

  // 清空
  if (props.clearable) {
    items.push({
      label: loc.clearSegments || '清空时间段',
      action: () => {
        const msg = formatLocale(loc.confirmClearSegments || '确定要清空轨道「{name}」的所有时间段吗？', { name: trackLabel })
        _showConfirm(msg, () => {
          const segs = sortedSegments.value
          segs.forEach(s => emit('seg-delete', { trackId: props.track.id, id: s.id }))
        })
      },
    })
  }

  // 删除轨道
  if (props.deletable) {
    items.push({
      label: loc.deleteTrack || '删除轨道',
      danger: true,
      action: () => {
        const fmt = props.formatter
        const rangeStr = fmt ? fmt.formatRange(props.rangeStart, props.rangeEnd, 'axis') : `${props.rangeStart} – ${props.rangeEnd}`
        const msg = formatLocale(loc.confirmDeleteTrack || '确定要删除轨道「{name}」({range}) 吗？', { name: trackLabel, range: rangeStr })
        _showConfirm(msg, () => {
          emit('context-menu', { action: 'delete-track', trackId: props.track.id })
        })
      },
    })
  }

  if (items.length > 1) {
    const labelEl = e.currentTarget.querySelector('.tlt-head-label')
    ctxMenuCtrl.show(items, e.clientX, e.clientY, labelEl)
  }
}

/* =============================== 轨道操作 =============================== */

/** 打开轨道编辑模态框（与 CE editTrack 行为对齐） */
function _editTrack() {
  const loc = _locale.value
  const fmt = props.formatter
  const isTime = fmt ? fmt.format(0, 'editor').includes(':') : true

  modalCtrl.show({
    type: 'edit-track',
    title: loc.trackEditTitle || '编辑轨道',
    formFields: [
      { name: 'label', type: 'text', label: loc.name || '名称', value: props.track.label || '' },
      { name: 'start', type: isTime ? 'time' : 'number', label: loc.rangeStart || '起始',
      value: fmt ? fmt.format(props.rangeStart, 'editor') : props.rangeStart,
      step: (props.step || (isTime ? 0.5 : 1)), min: props.rangeStart, max: props.rangeEnd },
      { name: 'end', type: isTime ? 'time' : 'number', label: loc.rangeEnd || '结束',
      value: fmt ? fmt.format(props.rangeEnd, 'editor') : props.rangeEnd,
      step: (props.step || (isTime ? 0.5 : 1)), min: props.rangeStart, max: props.rangeEnd },
      { name: 'step', type: 'text', label: loc.step || '步长', value: String(props.step || ''), placeholder: loc.zeroUnlimited || '0=无限制' },
      { name: 'maxSegments', type: 'text', label: loc.maxSegmentsField || '最大段数', value: props.track.maxSegments || '', placeholder: loc.zeroUnlimited || '0=无限制' },
    ],
    onConfirm: (values) => {
      emit('context-menu', { action: 'edit-track', trackId: props.track.id, values })
    },
  })
}

/** "复制到其他轨道…"对话框（向容器发送事件，由容器渲染多选 Modal） */
function _showCopyToTracksDialog() {
  emit('context-menu', { action: 'copy-to-tracks', trackId: props.track.id })
}

function _copyTrack() {
  const segs = sortedSegments.value.map(s => ({
    label: s.label,
    color: s.color,
    start: s.start,
    end: s.end,
  }))
  clipboardCtrl.copyToClipboard('track', {
    label: props.track.label,
    segments: segs,
  })
  _pulse()
}

function _pasteSegment(data, clientX, clientY) {
  const rect = segAreaRef.value?.getBoundingClientRect()
  if (!rect) return
  const v = props.vertical
  const cp = v ? clientY : clientX
  const orig = v ? rect.top : rect.left
  const dim = v ? rect.height : rect.width
  if (!dim) return

  const db = dragBounds.value
  const duration = data.end - data.start
  let start = db.start + ((cp - orig) / dim) * (db.end - db.start)
  if (props.step > 0) start = snap(start, props.step)
  let end = start + duration
  if (end > db.end) { start = db.end - duration; end = db.end }
  if (start < db.start) { start = db.start; end = db.start + duration }

  // 检查重叠
  const exist = sortedSegments.value
  for (const seg of exist) {
    if (start < seg.end && end > seg.start) return
  }
  if (!_checkSegmentLimit()) return

  emit('seg-create', {
    trackId: props.track.id,
    start,
    end,
    label: data.label,
    color: data.color,
  })
}

function _pasteNewTrack(data) {
  // 由父组件处理
  emit('context-menu', {
    action: 'paste-new-track',
    data,
  })
}

function _pasteOverwrite(data) {
  // 清空所有段
  sortedSegments.value.forEach(s => {
    emit('seg-delete', { trackId: props.track.id, id: s.id })
  })
  // 等待下次 tick 后重新创建
  nextTick(() => {
    for (const sd of data.segments) {
      emit('seg-create', {
        trackId: props.track.id,
        start: sd.start,
        end: sd.end,
        label: sd.label,
        color: sd.color,
      })
    }
    _pulse()
  })
}

/** 使用 ModalPortal 做删除确认（与 CE showDeleteConfirm 行为一致） */
function _showConfirm(message, onConfirm) {
  const loc = _locale.value
  modalCtrl.show({
    type: 'delete-confirm',
    title: loc.confirmDeleteTitle || '确认删除',
    message,
    danger: true,
    onConfirm: () => {
      modalCtrl.hide()
      onConfirm()
    },
  })
}

function _pulse() {
  const row = bodyRef.value?.parentElement
  if (!row) return
  row.classList.remove('tlt-copy-pulse')
  void row.offsetHeight
  row.classList.add('tlt-copy-pulse')
  setTimeout(() => row.classList.remove('tlt-copy-pulse'), 1200)
}

/* =============================== 暴露公共 API =============================== */

defineExpose({
  addSegment(start, end, opts = {}) {
    const db = dragBounds.value
    const s = clamp(start, db.start, db.end)
    const e = clamp(end, db.start, db.end)
    if (s >= e) return null

    const exist = sortedSegments.value
    for (const seg of exist) {
      if (s < seg.end && e > seg.start) return null
    }
    if (!_checkSegmentLimit()) return null

    const newSeg = {
      id: crypto.randomUUID ? crypto.randomUUID() : `seg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      start: s,
      end: e,
      label: opts.label || '',
      color: opts.color || props.defaultColor,
    }
    emit('seg-create', { trackId: props.track.id, start: s, end: e, ...opts })
    return newSeg
  },

  clearAllSegments() {
    sortedSegments.value.forEach(s => {
      emit('seg-delete', { trackId: props.track.id, id: s.id })
    })
  },

  copyTrack() { _copyTrack() },
  pasteSegment: _pasteSegment,
  pasteNewTrack: _pasteNewTrack,
  pasteOverwrite: _pasteOverwrite,
})

/* =============================== 生命周期 =============================== */

onMounted(() => {
  let _resizeRaf = null
  _resizeObs = new ResizeObserver(() => {
    // 使用 rAF 防抖：同一个动画帧内多次回调只执行一次，防止与 Vue 响应式形成更新循环
    if (_resizeRaf) cancelAnimationFrame(_resizeRaf)
    _resizeRaf = requestAnimationFrame(() => {
      _resizeRaf = null
      const area = segAreaRef.value
      if (area) {
        const w = area.clientWidth
        const h = area.clientHeight
        if (segAreaSize.value.w !== w || segAreaSize.value.h !== h) {
          segAreaSize.value = { w, h }
        }
      }
      drawGrid()
      updateClipOverlay()
    })
  })
  if (bodyRef.value) _resizeObs.observe(bodyRef.value)
  nextTick(() => {
    // 初始尺寸采集
    const area = segAreaRef.value
    if (area) {
      segAreaSize.value = { w: area.clientWidth, h: area.clientHeight }
    }
    drawGrid()
    updateClipOverlay()
  })
})

onUnmounted(() => {
  if (_resizeObs) _resizeObs.disconnect()
})

watch(() => [props.rangeStart, props.rangeEnd, props.zoomStart, props.zoomEnd, props.track.segments?.length], () => {
  nextTick(() => drawGrid())
})

watch(() => [props.sharedClipRange, props.rangeStart, props.rangeEnd], () => {
  nextTick(() => updateClipOverlay())
})
</script>

<style scoped>
/* 与 lib/base.css 的 time-line-track 样式完全对齐，使用 CSS 变量体系 */
.tlt-row {
  display: flex;
  align-items: stretch;
  background: var(--tlc-bg-card, #fff);
  border: 1px solid var(--tlc-border-light, #e5e8ec);
  border-radius: var(--tlc-radius, 0);
  overflow: visible;
  min-height: var(--tlt-row-h, 70px);
  position: relative;
}
.tlt-row.vertical {
  flex-direction: column;
  width: var(--tlt-row-w, 150px);
  min-width: var(--tlt-row-w, 150px);
  min-height: var(--tlt-row-min-h, 280px);
}

.tlt-head {
  flex: 0 0 var(--tlt-header-w, 110px);
  min-width: var(--tlt-header-w, 110px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 10px;
  background: #fafbfc;
  border-right: 1px solid var(--tlc-border-light, #e5e8ec);
  overflow: hidden;
}
.tlt-row.vertical .tlt-head {
  flex: 0 0 auto;
  min-width: auto;
  border-right: none;
  border-bottom: 1px solid var(--tlc-border-light, #e5e8ec);
  padding: 5px 8px;
}
.tlt-head-label {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #37474f;
}
.tlt-head-range {
  font-size: 10px;
  color: #90a4ae;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tlt-body {
  flex: 1;
  position: relative;
  overflow: visible;
  min-width: 0;
  background: #fdfdfd;
  touch-action: none;
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='1.8' fill='%23444'/%3E%3Cline x1='10' y1='2' x2='10' y2='6' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='10' y1='14' x2='10' y2='18' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='2' y1='10' x2='6' y2='10' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='14' y1='10' x2='18' y2='10' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 10 10, crosshair;
}
.tlt-row.vertical .tlt-body {
  flex: 1;
  min-width: auto;
  min-height: 0;
}

.tlt-grid-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tlt-seg-area {
  position: absolute;
  inset: var(--tlt-seg-top, 18px) 0 var(--tlt-seg-bottom, 0) 0;
}
.tlt-row.vertical .tlt-seg-area {
  inset: 0 0 0 var(--tlt-axis-gap, 36px);
}
/* 共享轴模式：seg-area 填满整个区域（轴尺已统一绘制刻度，与 CE _applyLabelPos 对齐） */
.tlt-row.tlt-shared .tlt-seg-area {
  inset: 0;
}

/* ghost — 拖拽创建预览条（与 CE base.css 完全对齐） */
.tlt-ghost {
  position: absolute;
  z-index: 9;
  background: rgba(66,133,244,.18);
  border: 2px dashed var(--tlc-primary, #4285f4);
  border-radius: var(--tlc-radius, 0);
  pointer-events: none;
}
.tlt-ghost-label {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 10px;
  line-height: 1.4;
  color: #fff;
  background: var(--tlc-bg-tooltip, rgba(30,35,42,.92));
  padding: 2px 7px;
  border-radius: var(--tlc-radius, 0);
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
  pointer-events: none;
}
/* 垂直模式 ghost label 定位 */
.tlt-row.vertical .tlt-ghost-label {
  top: 50%;
  left: auto;
  right: calc(100% + 8px);
  transform: translateY(-50%);
}

/* 复制脉冲动画 — 与 CE @keyframes tlt-copy-pulse 对齐 */
.tlt-copy-pulse {
  animation: tlt-copy-pulse .6s ease-out forwards;
}
@keyframes tlt-copy-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(66,133,244,.4); }
  50%  { box-shadow: 0 0 0 6px rgba(66,133,244,.15); }
  100% { box-shadow: 0 0 0 0 rgba(66,133,244,0); }
}
</style>
