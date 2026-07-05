<template>
  <div>
    <!-- addTrack -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[0] }" @click="toggle(0)"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">addTrack</code> 添加轨道</div>
      <div class="ctrl-body" v-show="state[0]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">label</span> <input type="text" v-model="apiLabel"></label>
          <label><span class="ctrl-label">start</span> <input type="text" v-model="apiStart"></label>
          <label><span class="ctrl-label">end</span> <input type="text" v-model="apiEnd"></label>
          <label><span class="ctrl-label">step</span> <input type="text" v-model="apiStep"></label>
          <label><span class="ctrl-label">上限</span> <input type="text" v-model="apiMaxSeg" title="max-segments，0=无限制"></label>
          <button class="primary" @click="doAddTrack">执行</button>
        </div>
      </div>
    </div>

    <!-- addSegment -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[1] }" @click="toggle(1)"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">addSegment</code> 添加时间段</div>
      <div class="ctrl-body" v-show="state[1]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">轨道</span>
            <select v-model="addSegTrackIdx">
              <option v-for="(t, i) in trackList" :key="i" :value="i">{{ t.label || '轨道 '+(i+1) }}</option>
            </select>
          </label>
          <label><span class="ctrl-label">start</span> <input type="text" v-model="segStart"></label>
          <label><span class="ctrl-label">end</span> <input type="text" v-model="segEnd"></label>
          <label><span class="ctrl-label">label</span> <input type="text" v-model="segLabel"></label>
          <label><span class="ctrl-label">color</span> <input type="text" v-model="segColor"></label>
          <button class="primary" @click="doAddSeg">执行</button>
        </div>
      </div>
    </div>

    <!-- removeTrack -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[2] }" @click="toggle(2)"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">removeTrack</code> 删除与清理</div>
      <div class="ctrl-body" v-show="state[2]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">轨道</span>
            <select v-model="delTrackIdx">
              <option v-for="(t, i) in trackList" :key="i" :value="i">{{ t.label || '轨道 '+(i+1) }}</option>
            </select>
          </label>
          <button class="danger" @click="doDelTrack">删除</button>
          <button class="danger" @click="doClearSegs">清空所有段</button>
        </div>
      </div>
    </div>

    <!-- max-segments / segment-limit-reached -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[3] }" @click="toggle(3)"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">max-segments</code> 段数上限测试</div>
      <div class="ctrl-body" v-show="state[3]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">当前轨道</span>
            <select v-model="limitTrackIdx">
              <option v-for="(t, i) in trackList" :key="i" :value="i">{{ t.label || '轨道 '+(i+1) }}</option>
            </select>
          </label>
          <label><span class="ctrl-label">上限</span> <input type="number" v-model.number="limitVal" min="0" max="999" title="0=无限制"></label>
          <button @click="doSetLimit">设置</button>
          <button @click="doTestLimit">追加段（测上限）</button>
        </div>
      </div>
    </div>

    <!-- setGlobalRadius -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[4] }" @click="toggle(4)"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">setGlobalRadius</code> 设置</div>
      <div class="ctrl-body" v-show="state[4]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">圆角</span>
            <select v-model="radiusVal" @change="doSetRadius">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- reset -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[5] }" @click="toggle(5)">🔄 重置</div>
      <div class="ctrl-body" v-show="state[5]">
        <div class="ctrl-row">
          <button @click="doReset">重置组件</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { COLORS, pick } from '../../composables/constants.js'
import { addLog } from '../../stores/eventLog.js'
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(6, 0)

const props = defineProps({
  container: { type: Object, default: null }
})

const c = () => props.container
const trackList = computed(() => {
  _attrRev.value // 追踪 DOM 变化
  return c() ? c().allTracks() : []
})

// DOM 属性版本计数器：轨道/段增删时 +1，让依赖 DOM 的 computed 重新求值
const _attrRev = ref(0)
function bumpAttr() { _attrRev.value++ }

const radiusOpts = ['0', '3px', '5px', '8px', '12px', '20px']
const radiusVal = ref('0')

// addTrack
const apiLabel = ref('新轨道')
const apiStart = ref('0')
const apiEnd = ref('24')
const apiStep = ref('0.5')
const apiMaxSeg = ref('0')

// addSegment
const addSegTrackIdx = ref(0)
const segStart = ref('8')
const segEnd = ref('12')
const segLabel = ref('新段')
const segColor = ref('#27ae60')

// delTrack
const delTrackIdx = ref(0)

// max-segments test
const limitTrackIdx = ref(0)
const limitVal = ref(0)

function doAddTrack() {
  if (!c()) return
  const label = apiLabel.value || '新轨道'
  const start = parseFloat(apiStart.value) || 0
  const end = parseFloat(apiEnd.value) || 24
  const step = parseFloat(apiStep.value) || 0.5
  const maxSegN = parseInt(apiMaxSeg.value, 10) || 0
  const opts = { step }
  if (maxSegN > 0) opts.maxSegments = maxSegN
  c().addTrack(label, start, end, opts)
  bumpAttr() // 通知 trackList 重新求值
  let extras = ''
  if (maxSegN > 0) extras = `, maxSegments: ${maxSegN}`
  const cmd = `addTrack("${label}", ${start}, ${end}, { step: ${step}${extras} })`
  addLog('api', cmd, '→ 轨道 "' + label + '" 已添加')
}

function doAddSeg() {
  if (!c()) return
  const tracks = c().allTracks()
  const track = tracks[addSegTrackIdx.value]
  if (!track) { return }
  const start = parseFloat(segStart.value) || 8
  const end = parseFloat(segEnd.value) || 12
  const label = segLabel.value || '新段'
  const color = segColor.value || pick(COLORS)
  // 检查段数上限
  const max = track.maxSegments
  if (max > 0 && track.sortedSegs().length >= max) {
    addLog('api', 'addSegment 被拒', '⚠ 已达上限 ' + max + ' 段')
    return
  }
  try {
    track.addSegment(start, end, { label, color })
  } catch (e) {
    addLog('api', 'addSegment 被拒', '⚠ ' + e.message)
    return
  }
  // 自动偏移起始值以便下次追加
  const dur = end - start
  const tEnd = track.tEnd
  let ns = Math.round((start + dur) * 100) / 100
  let ne = Math.round((end + dur) * 100) / 100
  if (ne > tEnd) { ns = track.tStart + dur; ne = Math.min(ns + dur, tEnd) }
  segStart.value = String(ns)
  segEnd.value = String(ne)
  bumpAttr()
  const cmd = `addSegment(${start}, ${end}, { label: "${label}", color: "${color}" })`
  addLog('api', cmd, '→ 段已添加 于「' + track.label + '」')
}

function doSetLimit() {
  if (!c()) return
  const tracks = c().allTracks()
  const track = tracks[limitTrackIdx.value]
  if (!track) { return }
  const n = limitVal.value
  track.setAttribute('max-segments', n > 0 ? String(n) : '')
  const label = track.label
  const cmd = n > 0
    ? `max-segments="${n}" — 轨道: "${label}"`
    : `移除 max-segments — 轨道: "${label}"`
  addLog('api', cmd, n > 0 ? '→ 每轨道上限 = ' + n : '→ 已移除限制')
}

function doTestLimit() {
  if (!c()) return
  const tracks = c().allTracks()
  const track = tracks[limitTrackIdx.value]
  if (!track) { return }
  const before = track.sortedSegs().length
  let max = track.maxSegments
  // 未设上限时自动设一个（当前数量+2），让"追加段"能直接工作
  if (max <= 0) {
    max = before + 2
    track.setAttribute('max-segments', String(max))
    limitVal.value = max
    addLog('api', 'max-segments 自动设为 ' + max)
  }
  const seg = track.addSegment(0, 1, { label: '测试', color: '#e74c3c' })
  if (seg) {
    addLog('api', 'addSegment(0,1) 测试上限', '→ 已添加（原 ' + before + ' → ' + track.sortedSegs().length + ' 段，上限 ' + max + '）')
  } else {
    addLog('api', 'addSegment(0,1) 测试上限', '⚠ 被拒绝（已达上限 ' + max + '）')
  }
}

function doDelTrack() {
  if (!c()) return
  const tracks = c().allTracks()
  if (tracks.length <= 1) { return }
  const track = tracks[delTrackIdx.value]
  if (!track) { return }
  const label = track.label
  c().removeTrack(track)
  bumpAttr() // 通知 trackList 重新求值
  const cmd = 'removeTrack("' + label + '")'
  addLog('api', cmd, '→ 轨道 "' + label + '" 已删除')
  if (delTrackIdx.value >= c().allTracks().length) {
    delTrackIdx.value = c().allTracks().length - 1
  }
}

function doClearSegs() {
  if (!c()) return
  const all = c().querySelectorAll('time-line-segment')
  if (!all.length) { return }
  all.forEach(s => s.remove())
  addLog('api', 'clearAllSegments()', '→ 已清空 ' + all.length + ' 个段')
}

function doSetRadius() {
  if (!c()) return
  c().setGlobalRadius(radiusVal.value)
  const cmd = 'setGlobalRadius("' + radiusVal.value + '")'
  addLog('api', cmd, '→ 全局圆角 = ' + radiusVal.value)
}

function doReset() {
  if (!c()) return
  c().innerHTML = ''
  c().addTrack('空轨道-A', 0, 24)
  c().addTrack('空轨道-B', 0, 24)
  addLog('api', 'reset()', '→ 已重置为 2 条空轨道')
}
</script>
