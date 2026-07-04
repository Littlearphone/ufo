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
const trackList = computed(() => c() ? c().allTracks() : [])

const radiusOpts = ['0', '3px', '5px', '8px', '12px', '20px']
const radiusVal = ref('0')

// addTrack
const apiLabel = ref('新轨道')
const apiStart = ref('0')
const apiEnd = ref('24')
const apiStep = ref('0.5')

// addSegment
const addSegTrackIdx = ref(0)
const segStart = ref('8')
const segEnd = ref('12')
const segLabel = ref('新段')
const segColor = ref('#27ae60')

// delTrack
const delTrackIdx = ref(0)

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
  c().addTrack(label, start, end, { step })
  const cmd = `addTrack("${label}", ${start}, ${end}, { step: ${step} })`
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
  track.addSegment(start, end, { label, color })
  const cmd = `addSegment(${start}, ${end}, { label: "${label}", color: "${color}" }) — 轨道: "${track.label}"`
  showApi(cmd, '→ 段已添加')
  addLog('api', cmd)
}

function doDelTrack() {
  if (!c()) return
  const tracks = c().allTracks()
  if (tracks.length <= 1) { showApi('removeTrack(...)', '至少保留一条轨道'); return }
  const track = tracks[delTrackIdx.value]
  if (!track) { showApi('removeTrack(...)', '请选中轨道'); return }
  const label = track.label
  c().removeTrack(track)
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
