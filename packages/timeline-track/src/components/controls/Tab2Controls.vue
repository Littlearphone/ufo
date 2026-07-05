<template>
  <div>
    <!-- addTrack -->
    <div class="ctrl-group">
      <div class="ctrl-header"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">addTrack</code> 添加轨道</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label>label <input type="text" v-model="apiLabel" style="width:70px"></label>
          <label>start <input type="text" v-model="apiStart" style="width:30px"></label>
          <label>end <input type="text" v-model="apiEnd" style="width:30px"></label>
          <label>step <input type="text" v-model="apiStep" style="width:30px"></label>
          <label>上限 <input type="text" v-model="apiMaxSeg" style="width:30px" title="max-segments，0=无限制"></label>
          <button class="primary" style="font-size:10px" @click="doAddTrack">执行</button>
        </div>
      </div>
    </div>

    <!-- addSegment -->
    <div class="ctrl-group">
      <div class="ctrl-header"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">addSegment</code> 添加时间段</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label>轨道
            <select v-model="addSegTrackIdx" style="max-width:80px">
              <option v-for="(t, i) in trackList" :key="i" :value="i">{{ t.label || '轨道 '+(i+1) }}</option>
            </select>
          </label>
          <label>start <input type="text" v-model="segStart" style="width:30px"></label>
          <label>end <input type="text" v-model="segEnd" style="width:30px"></label>
          <label>label <input type="text" v-model="segLabel" style="width:50px"></label>
          <label>color <input type="text" v-model="segColor" style="width:60px"></label>
          <button class="primary" style="font-size:10px" @click="doAddSeg">执行</button>
        </div>
      </div>
    </div>

    <!-- removeTrack -->
    <div class="ctrl-group">
      <div class="ctrl-header"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">removeTrack</code> 删除与清理</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <select v-model="delTrackIdx" style="max-width:110px">
            <option v-for="(t, i) in trackList" :key="i" :value="i">{{ t.label || '轨道 '+(i+1) }}</option>
          </select>
          <button class="danger" style="font-size:10px" @click="doDelTrack">删除</button>
          <span class="ctrl-sep"></span>
          <button class="danger" style="font-size:10px" @click="doClearSegs">清空所有段</button>
        </div>
      </div>
    </div>

    <!-- max-segments / segment-limit-reached -->
    <div class="ctrl-group">
      <div class="ctrl-header"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">max-segments</code> 段数上限测试</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label>
            当前轨道
            <select v-model="limitTrackIdx" style="max-width:100px">
              <option v-for="(t, i) in trackList" :key="i" :value="i">{{ t.label || '轨道 '+(i+1) }}</option>
            </select>
          </label>
          <label>上限 <input type="number" v-model.number="limitVal" min="0" max="999" style="width:48px" title="0=无限制"></label>
          <button @click="doSetLimit">设置</button>
          <span class="ctrl-sep"></span>
          <button @click="doTestLimit">追加段（测上限）</button>
        </div>
      </div>
    </div>

    <!-- setGlobalRadius -->
    <div class="ctrl-group">
      <div class="ctrl-header"><code style="font-size:10px;background:#e3f2fd;padding:0 5px">setGlobalRadius</code> 设置与重置</div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label>
            圆角
            <select v-model="radiusVal" @change="doSetRadius" style="max-width:72px">
              <option v-for="r in radiusOpts" :key="r" :value="r">{{ r || '0' }}</option>
            </select>
          </label>
          <span class="ctrl-sep"></span>
          <button @click="doReset">重置组件</button>
        </div>
      </div>
    </div>

    <!-- API 调用记录 -->
    <div class="ctrl-group">
      <div class="ctrl-header">💻 API 调用记录</div>
      <div class="ctrl-body">
        <div class="ctrl-code">{{ apiCall || '&nbsp;' }}</div>
        <div class="ctrl-result" :class="{ err: apiResult && apiResult.includes('err') }">{{ apiResult || '&nbsp;' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { COLORS, pick } from '../../composables/constants.js'
import { addLog } from '../../stores/eventLog.js'

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

// API call display
const apiCall = ref('')
const apiResult = ref('')

function showApi(cmd, result) {
  apiCall.value = '> ' + cmd
  apiResult.value = result || '✓ ok'
}

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
  showApi(cmd, '→ 轨道 "' + label + '" 已添加')
  addLog('api', cmd)
}

function doAddSeg() {
  if (!c()) return
  const tracks = c().allTracks()
  const track = tracks[addSegTrackIdx.value]
  if (!track) { showApi('addSegment(...)', '请选择轨道'); return }
  const start = parseFloat(segStart.value) || 8
  const end = parseFloat(segEnd.value) || 12
  const label = segLabel.value || '新段'
  const color = segColor.value || pick(COLORS)
  // 检查段数上限
  const max = track.maxSegments
  if (max > 0 && track.sortedSegs().length >= max) {
    showApi('addSegment(...)', '⚠ 已达上限 ' + max + ' 段，阻止创建')
    addLog('api', 'addSegment 被拒：已达 max-segments=' + max)
    return
  }
  track.addSegment(start, end, { label, color })
  const cmd = `addSegment(${start}, ${end}, { label: "${label}", color: "${color}" }) — 轨道: "${track.label}"`
  showApi(cmd, '→ 段已添加')
  addLog('api', cmd)
}

function doSetLimit() {
  if (!c()) return
  const tracks = c().allTracks()
  const track = tracks[limitTrackIdx.value]
  if (!track) { showApi('setLimit(...)', '请选中轨道'); return }
  const n = limitVal.value
  track.setAttribute('max-segments', n > 0 ? String(n) : '')
  const label = track.label
  const cmd = n > 0
    ? `setAttribute("max-segments", "${n}") — 轨道: "${label}"`
    : `removeAttribute("max-segments") — 轨道: "${label}"`
  showApi(cmd, n > 0 ? '→ 每轨道上限 = ' + n : '→ 已移除限制')
  addLog('api', cmd)
}

function doTestLimit() {
  if (!c()) return
  const tracks = c().allTracks()
  const track = tracks[limitTrackIdx.value]
  if (!track) { showApi('testLimit(...)', '请选中轨道'); return }
  const before = track.sortedSegs().length
  const max = track.maxSegments
  const seg = track.addSegment(0, 1, { label: '测试', color: '#e74c3c' })
  if (seg) {
    showApi('addSegment(0,1) — ' + track.label, '→ 已添加（原 ' + before + ' → ' + track.sortedSegs().length + ' 段）')
    addLog('api', 'testLimit: addSegment 成功')
  } else {
    showApi('addSegment(0,1) — ' + track.label, '⚠ 被拒绝（已达上限 ' + max + '）')
    addLog('api', 'testLimit: addSegment 被拒（上限 ' + max + '）')
  }
}

function doDelTrack() {
  if (!c()) return
  const tracks = c().allTracks()
  if (tracks.length <= 1) { showApi('removeTrack(...)', '至少保留一条轨道'); return }
  const track = tracks[delTrackIdx.value]
  if (!track) { showApi('removeTrack(...)', '请选中轨道'); return }
  const label = track.label
  c().removeTrack(track)
  bumpAttr() // 通知 trackList 重新求值
  const cmd = 'removeTrack("' + label + '")'
  showApi(cmd, '→ 轨道 "' + label + '" 已删除')
  addLog('api', cmd)
  if (delTrackIdx.value >= c().allTracks().length) {
    delTrackIdx.value = c().allTracks().length - 1
  }
}

function doClearSegs() {
  if (!c()) return
  const all = c().querySelectorAll('time-line-segment')
  if (!all.length) { showApi('clearSegments()', '没有段可清'); return }
  all.forEach(s => s.remove())
  showApi('clearAllSegments()', '→ 已清空 ' + all.length + ' 个段')
  addLog('api', 'clearAllSegments()')
}

function doSetRadius() {
  if (!c()) return
  c().setGlobalRadius(radiusVal.value)
  const cmd = 'setGlobalRadius("' + radiusVal.value + '")'
  showApi(cmd, '→ 全局圆角 = ' + radiusVal.value)
  addLog('api', cmd)
}

function doReset() {
  if (!c()) return
  c().innerHTML = ''
  c().addTrack('空轨道-A', 0, 24)
  c().addTrack('空轨道-B', 0, 24)
  showApi('reset()', '→ 已重置为 2 条空轨道')
  addLog('api', 'reset → 2 条空轨道')
}
</script>
