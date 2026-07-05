<template>
  <div>
    <!-- 数据量配置 -->
    <div class="ctrl-group">
      <div class="ctrl-header">📊 数据量配置</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label><span class="ctrl-label">轨道</span>
            <input type="range" v-model.number="trackCount" min="1" max="15">
            <span class="range-val">{{ trackCount }}</span>
          </label>
          <label><span class="ctrl-label">每轨道段数</span>
            <input type="range" v-model.number="segCount" min="1" max="300">
            <span class="range-val">{{ segCount }}</span>
          </label>
        </div>
        <div class="ctrl-row">
          <label><span class="ctrl-label">步长</span>
            <select v-model="stepVal">
              <option value="0">无</option>
              <option value="0.01">0.01</option>
              <option value="0.05">0.05</option>
              <option value="0.1">0.1</option>
              <option value="0.25">0.25</option>
              <option value="0.5">0.5</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
            </select>
          </label>
          <label><span class="ctrl-label">每轨道上限</span>
            <input type="number" v-model.number="maxSeg" min="0" max="999" title="0=无限制">
          </label>
          <label style="gap:4px">
            <input type="checkbox" v-model="packed">
            <span>完全铺满（无间隙）</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 操作 -->
    <div class="ctrl-group">
      <div class="ctrl-header">⚡ 操作</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <button class="primary" @click="generate">⚡ 生成数据</button>
          <button class="danger" @click="clearAll">清空</button>
          <button @click="toggleDir">{{ btnDirText }}</button>
        </div>
      </div>
    </div>

    <!-- 外观 -->
    <div class="ctrl-group">
      <div class="ctrl-header">🎨 外观</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label><span class="ctrl-label">圆角</span>
            <select v-model="radiusVal" @change="setRadius">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { COLORS, pick, rand } from '../../composables/constants.js'
import { addLog } from '../../stores/eventLog.js'

const props = defineProps({
  container: { type: Object, default: null }
})

const trackCount = ref(5)
const segCount = ref(20)
const stepVal = ref('0')
const maxSeg = ref(0)
const packed = ref(false)
const radiusOpts = ['0', '3px', '5px', '8px', '12px', '20px']
const radiusVal = ref('0')

const c = () => props.container

// 版本计数器：DOM 属性每变更一次 +1，强制依赖 DOM 的 computed 重算
const _attrRev = ref(0)
function bumpAttr() { _attrRev.value++ }

const dir = computed(() => {
  _attrRev.value // 追踪版本变化
  if (!c()) return 'horizontal'
  const d = c().getAttribute('direction') || ''
  return d === 'vertical' ? 'vertical' : 'horizontal'
})
const isVertical = computed(() => dir.value === 'vertical')
const btnDirText = computed(() => isVertical.value ? '切换为横向' : '切换为纵向')

function generate() {
  if (!c()) return
  const trackN = trackCount.value
  const segN = Math.min(segCount.value, maxSeg.value > 0 ? maxSeg.value : segCount.value)
  const step = parseFloat(stepVal.value) || 0
  const totalRange = 24
  const isPacked = packed.value
  const limit = maxSeg.value > 0 ? maxSeg.value : 0

  c().innerHTML = ''
  const t0 = performance.now()

  for (let t = 0; t < trackN; t++) {
    const track = document.createElement('time-line-track')
    track.setAttribute('label', '密集轨道-' + (t + 1))
    track.setAttribute('start', '0')
    track.setAttribute('end', String(totalRange))
    if (step) track.setAttribute('step', String(step))
    if (limit) track.setAttribute('max-segments', String(limit))

    if (isPacked) {
      // 完全铺满模式：时间段无间隙，首尾相接填满整个时间轴
      const segLen = totalRange / segN
      for (let s = 0; s < segN; s++) {
        const seg = document.createElement('time-line-segment')
        const start = s * segLen
        const end = (s + 1) * segLen
        seg.setAttribute('start', String(Math.round(start * 1e4) / 1e4))
        seg.setAttribute('end', String(Math.round(end * 1e4) / 1e4))
        seg.setAttribute('label', '' + (s + 1))
        seg.setAttribute('color', pick(COLORS))
        track.appendChild(seg)
      }
    } else {
      const segLen = totalRange / segN
      for (let s = 0; s < segN; s++) {
        const seg = document.createElement('time-line-segment')
        const start = s * segLen + rand(0, segLen * 0.15)
        const end = start + segLen * 0.3 + rand(0, segLen * 0.25)
        seg.setAttribute('start', String(Math.min(Math.max(start, 0), totalRange - 0.05)))
        seg.setAttribute('end', String(Math.min(end, totalRange)))
        seg.setAttribute('label', 'S' + (s + 1))
        seg.setAttribute('color', pick(COLORS))
        track.appendChild(seg)
      }
    }
    c().appendChild(track)
  }

  requestAnimationFrame(() => {
    const r = radiusVal.value
    if (r && c()) c().setGlobalRadius(r)
  })

  const elapsed = (performance.now() - t0).toFixed(0)
  const label = isPacked ? '铺满' : '随机间隙'
  const limitNote = limit ? ' 上限' + limit + '/轨道' : ''
  addLog('gen', trackN + ' 轨道 × ' + segN + ' 段 [' + label + ']' + limitNote + ' = ' + (trackN * segN) + ' 个段（' + elapsed + 'ms）')
}

function clearAll() {
  if (c()) c().innerHTML = ''
  addLog('api', '清空全部数据')
}

function toggleDir() {
  if (!c()) return
  const next = isVertical.value ? 'horizontal' : 'vertical'
  c().setAttribute('direction', next)
  bumpAttr()
  addLog('dir', next)
}

function setRadius() {
  if (c()) c().setGlobalRadius(radiusVal.value)
}

// 页面加载后自动生成一次示例数据
onMounted(() => {
  setTimeout(generate, 300)
})
</script>
