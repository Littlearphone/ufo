<template>
  <div class="tlt-row" :class="{ vertical: vertical }">
    <!-- 轨道头部 -->
    <div class="tlt-head">
      <span class="tlt-head-label" :title="label">{{ label }}</span>
      <span class="tlt-head-range">{{ rangeLabel }}</span>
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
          v-for="seg in sortedSegments"
          :key="seg.id"
          :segment="seg"
          :pixel-left="getSegPixelLeft(seg)"
          :pixel-width="getSegPixelWidth(seg)"
          :hidden="isSegHidden(seg)"
          :step="step"
          :min-duration="minDuration"
          :editable="editable"
          :deletable="deletable"
          :vertical="vertical"
          :range-start="rangeStart"
          :range-end="rangeEnd"
          :formatter="formatter"
          @change="onSegChange"
          @delete="onSegDelete"
        />
      </div>
    </div>

    <!-- 拖拽创建预览条 -->
    <div v-if="_creating" class="tlt-ghost" :style="ghostStyle"></div>
  </div>
</template>

<script setup>
/**
 * VTimelineTrack.vue — 轨道 Vue 组件
 *
 * 取代 <time-line-track> Custom Element。
 * 使用 v-for 渲染段、Canvas 绘制网格。
 *
 * 使用方式：
 * ```vue
 * <VTimelineTrack
 *   :track="track"
 *   :vertical="false"
 *   :step="0.5"
 *   :formatter="formatter"
 * />
 * ```
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { clamp, snap } from './shared/utils.js'
import VTimelineSegment from './VTimelineSegment.vue'

const props = defineProps({
  /** 轨道数据 */
  track: { type: Object, required: true },
  /** 是否纵向 */
  vertical: { type: Boolean, default: false },
  /** 步长 */
  step: { type: Number, default: 0 },
  /** 最小段持续长度 */
  minDuration: { type: Number, default: 0 },
  /** 是否可编辑 */
  editable: { type: Boolean, default: true },
  /** 是否可删除段 */
  deletable: { type: Boolean, default: true },
  /** 是否可创建新段 */
  creatable: { type: Boolean, default: true },
  /** 轨道范围起 */
  rangeStart: { type: Number, default: 0 },
  /** 轨道范围止 */
  rangeEnd: { type: Number, default: 24 },
  /** Formatter 实例 */
  formatter: { type: Object, default: null },
})

const emit = defineEmits([
  /** 段变更 { id, start, end } */
  'seg-change',
  /** 段删除 { id } */
  'seg-delete',
  /** 新增段 { start, end } */
  'seg-create',
])

const bodyRef = ref(null)
const canvasRef = ref(null)
const segAreaRef = ref(null)

/* ---- 标签 ---- */
const label = computed(() => props.track.label || '')
const rangeLabel = computed(() => {
  const fmt = props.formatter
  if (!fmt) return `${props.rangeStart} – ${props.rangeEnd}`
  return fmt.formatRange(props.rangeStart, props.rangeEnd, 'axis')
})

/* ---- 段排序 ---- */
const sortedSegments = computed(() => {
  const segs = [...(props.track.segments || [])]
  segs.sort((a, b) => a.start - b.start)
  return segs
})

/* ---- 段像素定位（等价 CE 的 _positionOne） ---- */
const _dimension = computed(() => {
  // 在 CSS 实际 layout 后获取 seg-area 尺寸
  // 将在 drawGrid 和段定位中更新
  return { w: 0, h: 0 }
})

/** 获取 seg-area 实际像素尺寸 */
function _getAreaDim() {
  const el = segAreaRef.value
  if (!el) return { w: 100, h: 100 }
  return { w: el.clientWidth, h: el.clientHeight }
}

/** 值 → 像素 */
function _val2Px(val) {
  const dim = _getAreaDim()
  const totalDim = props.vertical ? dim.h : dim.w
  const range = props.rangeEnd - props.rangeStart
  if (!range || !totalDim) return 0
  return ((val - props.rangeStart) / range) * totalDim
}

/** 像素 → 值 */
function _px2Val(px) {
  const dim = _getAreaDim()
  const totalDim = props.vertical ? dim.h : dim.w
  const range = props.rangeEnd - props.rangeStart
  if (!range || !totalDim) return 0
  return (px / totalDim) * range
}

function getSegPixelLeft(seg) {
  return _val2Px(seg.start)
}

function getSegPixelWidth(seg) {
  const p1 = _val2Px(seg.start)
  const p2 = _val2Px(seg.end)
  return Math.max(p2 - p1, 2)
}

/** 段是否完全在可视区外 */
function isSegHidden(seg) {
  const dim = _getAreaDim()
  const totalDim = props.vertical ? dim.h : dim.w
  const p1 = _val2Px(seg.start)
  const p2 = _val2Px(seg.end)
  return p1 >= totalDim || p2 <= 0
}

/* ---- 网格 Canvas 绘制（等价 CE 的 _drawGrid） ---- */
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

  const range = props.rangeEnd - props.rangeStart
  if (!range) return

  const dim = props.vertical ? rect.height : rect.width
  const step = fmt.niceStep(range, dim)

  // 计算 seg-area 偏移
  const segRect = segAreaRef.value?.getBoundingClientRect()
  const offX = segRect ? segRect.left - rect.left : 0
  const offY = segRect ? segRect.top - rect.top : (props.vertical ? 0 : 0)

  // 次刻度网格线
  ctx.strokeStyle = '#f0f2f5'
  ctx.lineWidth = 0.5
  for (let t = Math.floor(props.rangeStart / step) * step; t <= props.rangeEnd; t += step / 2) {
    _drawGridLine(ctx, t, dim, props.vertical, offX, offY)
  }

  // 主刻度网格线
  ctx.strokeStyle = '#dde0e4'
  ctx.lineWidth = 0.7
  for (let t = Math.floor(props.rangeStart / step) * step; t <= props.rangeEnd; t += step) {
    _drawGridLine(ctx, t, dim, props.vertical, offX, offY)
  }

  // 标签（仅在独立轴模式下）
  ctx.fillStyle = '#7a8591'
  ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
  if (props.vertical) {
    // 纵向标签待实现
  } else {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let t = Math.floor(props.rangeStart / step) * step; t <= props.rangeEnd; t += step) {
      const px = _val2Px(t)
      if (px > 24 && px < rect.width - 24) {
        ctx.fillText(fmt.format(t, 'axis'), px + offX, 4)
      }
    }
  }
}

function _drawGridLine(ctx, t, dim, vert, offX, offY) {
  const px = ((t - props.rangeStart) / (props.rangeEnd - props.rangeStart)) * dim
  if (vert) {
    ctx.beginPath(); ctx.moveTo(0, px + offY); ctx.lineTo(dim, px + offY); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.moveTo(px + offX, 0); ctx.lineTo(px + offX, dim); ctx.stroke()
  }
}

/* ---- 拖拽创建 ---- */
const _creating = ref(false)
const ghostStyle = ref({})
let _createStartVal = 0
let _createStartPx = 0

function onAreaDown(e) {
  if (e.button !== 0 || !props.creatable) return
  // 检查点击目标不是已有段
  if (e.target.closest('.tls-wrapper')) return

  const area = segAreaRef.value
  if (!area) return
  const rect = area.getBoundingClientRect()

  const cp = props.vertical ? e.clientY : e.clientX
  const orig = props.vertical ? rect.top : rect.left
  const dim = props.vertical ? rect.height : rect.width
  if (!dim) return

  _creating.value = true
  _createStartVal = props.rangeStart + ((cp - orig) / dim) * (props.rangeEnd - props.rangeStart)
  _createStartPx = cp

  // 创建预览条
  const v = props.vertical
  const sp = _val2Px(_createStartVal)
  ghostStyle.value = v
    ? { left: '0', right: '0', top: sp + 'px', height: '2px' }
    : { top: '0', bottom: '0', left: sp + 'px', width: '2px' }

  // 绑定移动/释放
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

  let t2 = props.rangeStart + ((cp - orig) / dim) * (props.rangeEnd - props.rangeStart)
  t2 = clamp(t2, props.rangeStart, props.rangeEnd)

  const lo = Math.min(_createStartVal, t2)
  const hi = Math.max(_createStartVal, t2)
  const p1 = _val2Px(lo)
  const p2 = _val2Px(hi)

  ghostStyle.value = v
    ? { left: '0', right: '0', top: p1 + 'px', height: Math.max(3, p2 - p1) + 'px' }
    : { top: '0', bottom: '0', left: p1 + 'px', width: Math.max(3, p2 - p1) + 'px' }
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

  const t2 = props.rangeStart + ((cp - orig) / dim) * (props.rangeEnd - props.rangeStart)
  let lo = Math.min(_createStartVal, t2)
  let hi = Math.max(_createStartVal, t2)

  if (props.step) {
    lo = snap(lo, props.step)
    hi = snap(hi, props.step)
  }

  lo = clamp(lo, props.rangeStart, props.rangeEnd)
  hi = clamp(hi, props.rangeStart, props.rangeEnd)

  // 检查最小长度
  if (hi - lo < props.minDuration) return

  emit('seg-create', { trackId: props.track.id, start: lo, end: hi })
}

/* ---- 段事件 ---- */
function onSegChange({ id, start, end }) {
  emit('seg-change', { trackId: props.track.id, id, start, end })
}

function onSegDelete(id) {
  emit('seg-delete', { trackId: props.track.id, id })
}

/* ---- 生命周期 ---- */
onMounted(() => {
  _resizeObs = new ResizeObserver(() => {
    drawGrid()
  })
  if (bodyRef.value) _resizeObs.observe(bodyRef.value)
  nextTick(() => drawGrid())
})

onUnmounted(() => {
  if (_resizeObs) _resizeObs.disconnect()
})

// 数据变化时重绘
watch(() => [props.rangeStart, props.rangeEnd, props.track.segments?.length], () => {
  nextTick(() => drawGrid())
})
</script>

<style scoped>
.tlt-row {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #e5e8ec;
  overflow: visible;
  min-height: 70px;
}
.tlt-row.vertical {
  flex-direction: column;
  flex: 1;
  width: 150px;
  min-width: 150px;
  min-height: 280px;
}

.tlt-head {
  flex: 0 0 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 10px;
  background: #f8f9fb;
  border-right: 1px solid #e5e8ec;
  min-width: 0;
  overflow: hidden;
}
.tlt-row.vertical .tlt-head {
  flex: 0 0 auto;
  border-right: none;
  border-bottom: 1px solid #e5e8ec;
  padding: 4px 10px;
}
.tlt-head-label {
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #37474f;
}
.tlt-head-range {
  font-size: 10px;
  color: #8d9ba9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tlt-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
.tlt-row.vertical .tlt-body {
  flex: 1;
}

.tlt-grid-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tlt-seg-area {
  position: absolute;
  inset: 18px 0 0 0;
}
.tlt-row.vertical .tlt-seg-area {
  inset: 0 0 0 36px;
}

.tlt-ghost {
  position: absolute;
  z-index: 5;
  background: rgba(66,133,244,.3);
  border: 1.5px dashed #4285f4;
  pointer-events: none;
}
</style>
