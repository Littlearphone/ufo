<template>
  <div
    class="tlc-container"
    :class="[`tlc-dir-${direction}`, { 'tlc-shared': axisMode === 'shared' }]"
    :style="containerStyle"
    ref="containerRef"
  >
    <!-- 共享轴尺 -->
    <div v-if="axisMode === 'shared'" class="tlc-axis-ruler" ref="rulerRef">
      <div class="tlc-axis-spacer">
        <span class="tlc-axis-range">{{ axisRangeLabel }}</span>
      </div>
      <div class="tlc-axis-body">
        <canvas ref="rulerCanvasRef" class="tlc-axis-canvas" />
      </div>
    </div>

    <!-- 轨道列表 — 使用 v-for -->
    <VTimelineTrack
      v-for="track in tracks"
      :key="track.id"
      :track="track"
      :vertical="direction === 'vertical'"
      :step="resolveStep(track)"
      :min-duration="minDuration"
      :editable="resolveEditable(track)"
      :deletable="resolveDeletable(track)"
      :creatable="resolveCreatable(track)"
      :range-start="getTrackStart(track)"
      :range-end="getTrackEnd(track)"
      :formatter="formatter"
      @seg-change="onSegChange"
      @seg-delete="onSegDelete"
      @seg-create="onSegCreate"
    />
  </div>
</template>

<script setup>
/** VTimelineContainer.vue — 顶层容器 Vue 组件 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { createFormatter } from '../lib/formatter.js'
import VTimelineTrack from './VTimelineTrack.vue'

// v-model 支持
const props = defineProps({
  /** 轨道数据（v-model 绑定） */
  modelValue: { type: Array, default: () => [] },
  /** 方向：horizontal | vertical */
  direction: { type: String, default: 'horizontal' },
  /** 轴模式：per-track | shared */
  axisMode: { type: String, default: 'per-track' },
  /** 类型：time | number */
  type: { type: String, default: 'time' },
  /** 单位：hour | minute | second */
  unit: { type: String, default: 'hour' },
  /** 全局默认步长 */
  step: { type: [Number, String], default: undefined },
  /** 共享轴起止 */
  sharedStart: { type: [Number, String], default: undefined },
  sharedEnd: { type: [Number, String], default: undefined },
  /** 缩放起止 */
  zoomStart: { type: [Number, String], default: undefined },
  zoomEnd: { type: [Number, String], default: undefined },
  /** CRUD 权限（轨道继承） */
  editable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  creatable: { type: Boolean, default: true },
  clearable: { type: Boolean, default: true },
  copyable: { type: Boolean, default: true },
})

const emit = defineEmits([
  /** v-model 更新 */
  'update:modelValue',
  /** 段变更 */
  'seg-changed',
  /** 段新增 */
  'seg-created',
  /** 段删除 */
  'seg-deleted',
])

const containerRef = ref(null)
const rulerRef = ref(null)
const rulerCanvasRef = ref(null)

/** 模板中使用 tracks 而非 modelValue */
const tracks = computed(() => props.modelValue)

/* ---- Formatter ---- */
const formatter = computed(() => createFormatter(props.type, props.unit))

/* ---- 容器样式 ---- */
const containerStyle = computed(() => ({
  flexDirection: props.direction === 'vertical' ? 'row' : 'column',
}))

/* ---- 共享轴 ---- */
const _sharedStart = computed(() => {
  if (props.sharedStart != null) return formatter.value.parse(props.sharedStart, 0)
  const tracks = props.modelValue
  if (!tracks.length) return 0
  return Math.min(...tracks.map(t => formatter.value.parse(t.start, 0)))
})

const _sharedEnd = computed(() => {
  if (props.sharedEnd != null) return formatter.value.parse(props.sharedEnd, 24)
  const tracks = props.modelValue
  if (!tracks.length) return 24
  return Math.max(...tracks.map(t => formatter.value.parse(t.end, 24)))
})

const axisRangeLabel = computed(() => {
  const fmt = formatter.value
  return `${fmt.format(_sharedStart.value, 'axis')} – ${fmt.format(_sharedEnd.value, 'axis')}`
})

/* ---- 轨道范围解析 ---- */
function getTrackStart(track) {
  if (props.zoomStart != null && props.zoomEnd != null) {
    return formatter.value.parse(props.zoomStart, 0)
  }
  if (props.axisMode === 'shared') return _sharedStart.value
  return formatter.value.parse(track.start, 0)
}

function getTrackEnd(track) {
  if (props.zoomStart != null && props.zoomEnd != null) {
    return formatter.value.parse(props.zoomEnd, 24)
  }
  if (props.axisMode === 'shared') return _sharedEnd.value
  return formatter.value.parse(track.end, 24)
}

/* ---- 步长继承 ---- */
function resolveStep(track) {
  if (track.step != null) return formatter.value.parse(track.step, 0)
  if (props.step != null) return formatter.value.parse(props.step, 0)
  return 0
}

/* ---- CRUD 权限继承 ---- */
function resolveEditable(track) {
  return track.editable != null ? track.editable : props.editable
}
function resolveDeletable(track) {
  return track.deletable != null ? track.deletable : props.deletable
}
function resolveCreatable(track) {
  return track.creatable != null ? track.creatable : props.creatable
}

/* ---- 最小段长度 ---- */
const minDuration = computed(() => {
  return 0 // 默认无限制
})

/* ---- 段事件处理 ---- */
function onSegChange({ trackId, id, start, end }) {
  const tracks = [...props.modelValue]
  const tIdx = tracks.findIndex(t => t.id === trackId)
  if (tIdx < 0) return
  const segs = [...tracks[tIdx].segments]
  const sIdx = segs.findIndex(s => s.id === id)
  if (sIdx < 0) return
  segs[sIdx] = { ...segs[sIdx], start, end }
  tracks[tIdx] = { ...tracks[tIdx], segments: segs }
  emit('update:modelValue', tracks)
  emit('seg-changed', { trackId, id, start, end })
}

function onSegDelete({ trackId, id }) {
  const tracks = [...props.modelValue]
  const tIdx = tracks.findIndex(t => t.id === trackId)
  if (tIdx < 0) return
  const segs = tracks[tIdx].segments.filter(s => s.id !== id)
  tracks[tIdx] = { ...tracks[tIdx], segments: segs }
  emit('update:modelValue', tracks)
  emit('seg-deleted', { trackId, id })
}

function onSegCreate({ trackId, start, end }) {
  const tracks = [...props.modelValue]
  const tIdx = tracks.findIndex(t => t.id === trackId)
  if (tIdx < 0) return
  const newSeg = {
    id: crypto.randomUUID ? crypto.randomUUID() : `vseg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    start,
    end,
    label: '',
    color: '#4285f4',
  }
  const segs = [...tracks[tIdx].segments, newSeg]
  tracks[tIdx] = { ...tracks[tIdx], segments: segs }
  emit('update:modelValue', tracks)
  emit('seg-created', { trackId, segment: newSeg })
}

/* ---- 共享轴 Canvas 绘制 ---- */
function drawAxisRuler() {
  const canvas = rulerCanvasRef.value
  const ruler = rulerRef.value
  if (!canvas || !ruler) return

  const body = ruler.querySelector('.tlc-axis-body')
  if (!body) return
  const rect = body.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const fmt = formatter.value
  const { start, end } = props.axisMode === 'shared' ? { start: _sharedStart.value, end: _sharedEnd.value } : { start: 0, end: 24 }
  const range = end - start
  if (!range) return

  const isH = props.direction !== 'vertical'
  const dim = isH ? rect.width : rect.height
  const step = fmt.niceStep(range, dim)

  // 主刻度
  ctx.strokeStyle = '#c0c5cc'
  ctx.lineWidth = 1
  for (let t = Math.floor(start / step) * step; t <= end; t += step) {
    const px = ((t - start) / range) * dim
    if (px < 1 || px > dim - 1) continue
    if (isH) {
      ctx.beginPath()
      ctx.moveTo(px, rect.height - 0.5)
      ctx.lineTo(px, rect.height - 8)
      ctx.stroke()
    }
  }

  // 标签
  ctx.fillStyle = '#6b7d8e'
  ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  for (let t = Math.floor(start / step) * step; t <= end; t += step) {
    const px = ((t - start) / range) * dim
    if (px < 20 || px > dim - 20) continue
    ctx.fillText(fmt.format(t, 'axis'), px, rect.height - 9)
  }
}

/* ---- 生命周期 ---- */
let _rulerResObs = null

onMounted(() => {
  if (props.axisMode === 'shared') {
    const body = rulerRef.value?.querySelector('.tlc-axis-body')
    if (body) {
      _rulerResObs = new ResizeObserver(() => nextTick(() => drawAxisRuler()))
      _rulerResObs.observe(body)
      nextTick(() => drawAxisRuler())
    }
  }
})

onUnmounted(() => {
  if (_rulerResObs) _rulerResObs.disconnect()
})

watch(() => [props.axisMode, props.type, props.unit], () => {
  nextTick(() => drawAxisRuler())
})
</script>

<style scoped>
.tlc-container {
  display: flex;
  gap: 10px;
  background: #f8f9fb;
  border: 1px solid #dfe3e8;
  padding: 14px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #333;
  overflow: auto;
  min-height: 0;
}

.tlc-container.tlc-shared {
  gap: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 共享轴尺 */
.tlc-axis-ruler {
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  background: #f8f9fb;
  border-bottom: 1px solid #dfe3e8;
}
.tlc-axis-ruler .tlc-axis-spacer {
  flex: 0 0 110px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 10px;
  color: #6b7d8e;
  border-right: 1px solid #e5e8ec;
}
.tlc-axis-ruler .tlc-axis-body {
  flex: 1;
  position: relative;
  height: 28px;
}
.tlc-axis-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
