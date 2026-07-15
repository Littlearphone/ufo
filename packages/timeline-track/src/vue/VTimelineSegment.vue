<template>
  <div
    class="tls-wrapper"
    :class="{ dragging: _dragging, resizing: _resizing }"
    :style="wrapperStyle"
    @pointerdown.prevent="onDown"
    @contextmenu.prevent="onCtxMenu"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    ref="wrapperRef"
  >
    <!-- 左手柄 -->
    <div
      v-if="editable && segWidth >= 28"
      class="tls-hdl tls-hdl-left"
      data-role="hdl-left"
      @pointerdown.stop="onHandleDown('resize-left')"
    >
      <div class="tls-hdl-bar"></div>
    </div>

    <!-- 段主体 -->
    <div
      class="tls-bar"
      :style="barStyle"
    >
      <div class="tls-inner">
        <span v-if="segment.label" class="tls-label">{{ segment.label }}</span>
        <span class="tls-time">{{ timeRange }}</span>
      </div>
    </div>

    <!-- 右手柄 -->
    <div
      v-if="editable && segWidth >= 28"
      class="tls-hdl tls-hdl-right"
      data-role="hdl-right"
      @pointerdown.stop="onHandleDown('resize-right')"
    >
      <div class="tls-hdl-bar"></div>
    </div>

    <!-- 删除按钮 -->
    <button
      v-if="deletable && segWidth >= 28"
      class="tls-del"
      data-role="del"
      @click.stop="emit('delete', segment.id)"
      title="删除"
    >×</button>
  </div>
</template>

<script setup>
/**
 * VTimelineSegment.vue — 时间段 Vue 组件
 *
 * 取代 <time-line-segment> Custom Element。
 * 渲染彩色段条、标签、拖拽手柄、删除按钮。
 * 支持拖拽移动和拖拽调整大小。
 *
 * 使用方式：
 * ```vue
 * <VTimelineSegment
 *   :segment="seg"
 *   :style="segStyle"
 *   :step="0.5"
 *   :editable="true"
 *   :deletable="true"
 *   @change="onChange"
 *   @delete="onDelete"
 * />
 * ```
 */
import { computed, ref } from 'vue'
import { clamp, snap } from './shared/utils.js'

const props = defineProps({
  /** 段数据 */
  segment: { type: Object, required: true },
  /** 像素定位：由父轨道计算的 left/top/width/height */
  pixelLeft: { type: Number, default: 0 },
  pixelTop: { type: Number, default: 0 },
  pixelWidth: { type: Number, default: 0 },
  pixelHeight: { type: Number, default: 0 },
  /** 视觉隐藏（段完全在可视区外） */
  hidden: { type: Boolean, default: false },
  /** 步长吸附 */
  step: { type: Number, default: 0 },
  /** 最小持续长度（值空间） */
  minDuration: { type: Number, default: 0 },
  /** 是否可编辑（拖拽移动/调整） */
  editable: { type: Boolean, default: true },
  /** 是否可删除 */
  deletable: { type: Boolean, default: true },
  /** 是否纵向模式 */
  vertical: { type: Boolean, default: false },
  /** 轨道起止（拖拽约束） */
  rangeStart: { type: Number, default: 0 },
  rangeEnd: { type: Number, default: 24 },
  /** 轨道 Formatter 实例 */
  formatter: { type: Object, default: null },
})

const emit = defineEmits([
  /** 拖拽结束后发射最终值 { id, start, end } */
  'change',
  /** 删除按钮点击时发射 id */
  'delete',
])

const wrapperRef = ref(null)

/* ---- 外观 ---- */
const segWidth = computed(() => props.vertical ? props.pixelHeight : props.pixelWidth)

const wrapperStyle = computed(() => {
  if (props.hidden) return { display: 'none' }
  if (props.vertical) {
    return { top: props.pixelLeft + 'px', left: '0', right: '0', height: props.pixelWidth + 'px' }
  }
  return { left: props.pixelLeft + 'px', top: '0', bottom: '0', width: props.pixelWidth + 'px' }
})

const barStyle = computed(() => ({
  background: props.segment.color || '#4285f4',
}))

const timeRange = computed(() => {
  const fmt = props.formatter
  if (!fmt) return `${props.segment.start} – ${props.segment.end}`
  return fmt.formatRange(props.segment.start, props.segment.end, 'segment')
})

/* ---- 拖拽状态 ---- */
const _dragging = ref(false)
const _resizing = ref(false)
let _mode = null           // 'move' | 'resize-left' | 'resize-right'
let _ptrStart = 0
let _s0 = 0
let _e0 = 0
let _segAreaRect = null    // segArea 的 getBoundingClientRect
let _lo = 0                // 左边界（相邻段或轨道起）
let _hi = 24               // 右边界（相邻段或轨道止）

/** 获取 seg-area 的 bounding rect（用于像素↔值转换） */
function _getAreaRect() {
  const el = wrapperRef.value
  if (!el) return null
  const area = el.closest('.tlt-seg-area')
  return area ? area.getBoundingClientRect() : null
}

/** 获取指针在当前方向下的坐标值 */
function _client(e) {
  return props.vertical ? e.clientY : e.clientX
}

/** 像素偏移 → 值偏移 */
function _px2Val(dpx) {
  const rect = _segAreaRect
  if (!rect) return 0
  const dim = props.vertical ? rect.height : rect.width
  if (!dim) return 0
  const range = props.rangeEnd - props.rangeStart
  return (dpx / dim) * range
}

/** 值 → 像素位置（用于手柄拖拽实时定位） */
function _val2Px(val) {
  const dim = props.vertical
    ? (_segAreaRect ? _segAreaRect.height : 100)
    : (_segAreaRect ? _segAreaRect.width : 100)
  return ((val - props.rangeStart) / (props.rangeEnd - props.rangeStart)) * dim
}

/** pointerdown — 段主体：开始拖拽移动 */
function onDown(e) {
  if (e.button !== 0 || !props.editable) return
  if (e.target.closest('[data-role]')) return
  _startDrag('move', e)
}

/** pointerdown — 手柄：开始调整大小 */
function onHandleDown(mode) {
  if (!props.editable) return
  // 需要真实 pointerdown event
}

/** 启动拖拽 */
function _startDrag(mode, e) {
  _mode = mode
  _dragging.value = mode === 'move'
  _resizing.value = mode.startsWith('resize')
  _ptrStart = _client(e)
  _s0 = props.segment.start
  _e0 = props.segment.end
  _segAreaRect = _getAreaRect()

  // 计算边界：相邻段或轨道范围
  _lo = props.rangeStart
  _hi = props.rangeEnd

  wrapperRef.value?.setPointerCapture(e.pointerId)

  const onMove = (ev) => _onMove(ev)
  const onUp = (ev) => { _onUp(ev); cleanup() }
  const cleanup = () => {
    wrapperRef.value?.removeEventListener('pointermove', onMove)
    wrapperRef.value?.removeEventListener('pointerup', onUp)
    wrapperRef.value?.removeEventListener('pointercancel', onUp)
  }
  wrapperRef.value?.addEventListener('pointermove', onMove)
  wrapperRef.value?.addEventListener('pointerup', onUp)
  wrapperRef.value?.addEventListener('pointercancel', onUp)
}

function _onMove(e) {
  const dp = _client(e) - _ptrStart
  const dt = _px2Val(dp)

  // Re-get area rect (in case of scroll/layout change)
  _segAreaRect = _getAreaRect()

  if (_mode === 'resize-left') {
    let s = snap(_s0 + dt, props.step)
    s = clamp(s, _lo, _e0 - props.minDuration)
    _applyTempPosition(s, props.segment.end)
  } else if (_mode === 'resize-right') {
    let e = snap(_e0 + dt, props.step)
    e = clamp(e, _s0 + props.minDuration, _hi)
    _applyTempPosition(props.segment.start, e)
  } else if (_mode === 'move') {
    const w = _e0 - _s0
    let s = snap(_s0 + dt, props.step)
    s = clamp(s, _lo, _hi - w)
    _applyTempPosition(s, s + w)
  }
}

function _onUp(e) {
  _dragging.value = false
  _resizing.value = false
  _mode = null
  wrapperRef.value?.releasePointerCapture(e.pointerId)

  // Emit final value
  emit('change', {
    id: props.segment.id,
    start: props.segment.start,
    end: props.segment.end,
  })
}

/** 直接在 DOM 上应用临时位置（拖拽中视觉反馈） */
function _applyTempPosition(s, e) {
  // 修改 DOM 样式直接定位，不触发 Vue 重渲染
  const el = wrapperRef.value
  if (!el) return

  // 在 DOM 上暂存起止（正式值在 pointerup 时 emit）
  el.dataset.dragS = String(s)
  el.dataset.dragE = String(e)

  const dim = _segAreaRect
  if (!dim) return
  const range = props.rangeEnd - props.rangeStart
  const totalDim = props.vertical ? dim.height : dim.width
  const p1 = ((s - props.rangeStart) / range) * totalDim
  const p2 = ((e - props.rangeStart) / range) * totalDim
  const w = Math.max(p2 - p1, 2)

  if (props.vertical) {
    el.style.top = p1 + 'px'
    el.style.height = w + 'px'
  } else {
    el.style.left = p1 + 'px'
    el.style.width = w + 'px'
  }
}

/* ---- 右键菜单 ---- */
function onCtxMenu(e) {
  // 由父组件处理
}

/* ---- Tooltip ---- */
function onEnter() {}
function onLeave() {}
</script>

<style scoped>
.tls-wrapper {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.tls-wrapper.dragging { z-index: 10; cursor: grabbing; }
.tls-wrapper.resizing { z-index: 10; }

.tls-bar {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 0;
  overflow: hidden;
}
.tls-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0;
  padding: 0 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 10px;
  line-height: 1.3;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,.3);
}
.tls-label {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.tls-time {
  font-size: 9px;
  opacity: .85;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 拖拽手柄 */
.tls-hdl {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  z-index: 3;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tls-hdl-left { left: 0; }
.tls-hdl-right { right: 0; }
.tls-hdl-bar {
  width: 3px;
  height: 50%;
  background: rgba(255,255,255,.5);
  border-radius: 2px;
  pointer-events: none;
}

/* 删除按钮 */
.tls-del {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: rgba(0,0,0,.35);
  color: #fff;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  border-radius: 0 0 0 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity .12s;
}
.tls-wrapper:hover .tls-del { opacity: 1; }
.tls-del:hover { background: rgba(200,0,0,.7); }
</style>
