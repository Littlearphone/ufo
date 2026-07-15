<template>
  <div>
    <!-- 逐行说明 -->
    <div class="ctrl-group" style="background:#f8f9fb;border-color:#e8eaed;">
      <div class="ctrl-body" style="padding:8px 12px;">
        <div style="font-size:10px;line-height:1.8;color:#5f6b7a;">
          <div>☑ <strong>creatable</strong> — 可拖拽空白区域<strong>创建新段</strong></div>
          <div>☑ <strong>editable</strong> — 可<strong>拖拽移动/调整</strong>已有段、右键<strong>修改属性</strong></div>
          <div>☑ <strong>deletable</strong> — 可删除段（×按钮/右键菜单）<strong>或删除轨道</strong></div>
          <div>☑ <strong>clearable</strong> — 右键菜单<strong>"清空时间段"</strong>（移除全部段但保留轨道）</div>
          <div>☑ <strong>copyable</strong> — 右键<strong>复制段/轨道</strong>、<strong>Ctrl+拖拽</strong>复制段</div>
          <div style="margin-top:4px;color:#90a4ae;font-size:9px;">下层未设属性时<strong>继承</strong>上层值。勾选 = 允许，不勾 = 禁止。</div>
        </div>
      </div>
    </div>

    <!-- 沙盒容器 -->
    <div class="ctrl-group">
      <div class="ctrl-header">📦 沙盒容器<span class="badge badge-info">交互沙盒</span></div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label><span class="ctrl-label">creatable</span>
            <input type="checkbox" :checked="c.creatable" @change="setContainer('creatable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">editable</span>
            <input type="checkbox" :checked="c.editable" @change="setContainer('editable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">deletable</span>
            <input type="checkbox" :checked="c.deletable" @change="setContainer('deletable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">clearable</span>
            <input type="checkbox" :checked="c.clearable" @change="setContainer('clearable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">copyable</span>
            <input type="checkbox" :checked="c.copyable" @change="setContainer('copyable', $event.target.checked)">
          </label>
        </div>
      </div>
    </div>

    <!-- 轨道级 -->
    <div class="ctrl-group" v-for="(t, i) in trackStates" :key="'t'+i">
      <div class="ctrl-header">🛤️ {{ t.label }}<span class="badge badge-muted">轨道</span></div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label><span class="ctrl-label">creatable</span>
            <input type="checkbox" :checked="t.creatable !== false" @change="setTrack(i, 'creatable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">editable</span>
            <input type="checkbox" :checked="t.editable !== false" @change="setTrack(i, 'editable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">deletable</span>
            <input type="checkbox" :checked="t.deletable !== false" @change="setTrack(i, 'deletable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">clearable</span>
            <input type="checkbox" :checked="t.clearable !== false" @change="setTrack(i, 'clearable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">copyable</span>
            <input type="checkbox" :checked="t.copyable !== false" @change="setTrack(i, 'copyable', $event.target.checked)">
          </label>
        </div>
      </div>
    </div>

    <!-- 片段级 -->
    <div class="ctrl-group" v-for="(s, i) in segStates" :key="'s'+i">
      <div class="ctrl-header">🧩 {{ s.label }}<span class="badge badge-muted">片段</span></div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label><span class="ctrl-label">editable</span>
            <input type="checkbox" :checked="s.editable !== false" @change="setSegment(i, 'editable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">deletable</span>
            <input type="checkbox" :checked="s.deletable !== false" @change="setSegment(i, 'deletable', $event.target.checked)">
          </label>
          <label><span class="ctrl-label">copyable</span>
            <input type="checkbox" :checked="s.copyable !== false" @change="setSegment(i, 'copyable', $event.target.checked)">
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  container: { type: Object, default: null }
})

const c = ref({ creatable: true, editable: true, deletable: true, clearable: true, copyable: true })
const trackStates = ref([])
const segStates = ref([])

/** 从 DOM 读取属性和轨道/段信息 */
function syncFromDOM() {
  const ct = props.container
  if (!ct) return

  c.value = {
    creatable: ct.getAttribute('creatable') !== 'false',
    editable: ct.getAttribute('editable') !== 'false',
    deletable: ct.getAttribute('deletable') !== 'false',
    clearable: ct.getAttribute('clearable') !== 'false',
    copyable: ct.getAttribute('copyable') !== 'false',
  }

  const tracks = ct.querySelectorAll(':scope > time-line-track')
  trackStates.value = Array.from(tracks).map(t => ({
    label: t.getAttribute('label') || '未命名',
    creatable: t.hasAttribute('creatable') ? t.getAttribute('creatable') !== 'false' : null,
    editable: t.hasAttribute('editable') ? t.getAttribute('editable') !== 'false' : null,
    deletable: t.hasAttribute('deletable') ? t.getAttribute('deletable') !== 'false' : null,
    clearable: t.hasAttribute('clearable') ? t.getAttribute('clearable') !== 'false' : null,
    copyable: t.hasAttribute('copyable') ? t.getAttribute('copyable') !== 'false' : null,
  }))

  // 片段 label 加上父轨道前缀
  const segs = ct.querySelectorAll('time-line-segment')
  segStates.value = Array.from(segs).map(s => {
    const track = s.closest('time-line-track')
    const trackLabel = track ? (track.getAttribute('label') || '未命名') : ''
    const segLabel = s.getAttribute('label') || s.getAttribute('start') + '–' + s.getAttribute('end')
    return {
      label: trackLabel + ' / ' + segLabel,
      editable: s.hasAttribute('editable') ? s.getAttribute('editable') !== 'false' : null,
      deletable: s.hasAttribute('deletable') ? s.getAttribute('deletable') !== 'false' : null,
      copyable: s.hasAttribute('copyable') ? s.getAttribute('copyable') !== 'false' : null,
    }
  })
}

function setContainer(attr, val) {
  const ct = props.container
  if (!ct) return
  if (val) ct.removeAttribute(attr)
  else ct.setAttribute(attr, 'false')
  c.value[attr] = val
  syncFromDOM()
}

function setTrack(idx, attr, val) {
  const ct = props.container
  if (!ct) return
  const t = ct.querySelectorAll(':scope > time-line-track')[idx]
  if (!t) return
  if (val) t.removeAttribute(attr)
  else t.setAttribute(attr, 'false')
  trackStates.value[idx][attr] = val === c.value[attr] ? null : val
  syncFromDOM()
}

function setSegment(idx, attr, val) {
  const ct = props.container
  if (!ct) return
  const segs = ct.querySelectorAll('time-line-segment')
  const s = segs[idx]
  if (!s) return
  if (val) s.removeAttribute(attr)
  else s.setAttribute(attr, 'false')
  segStates.value[idx][attr] = val
}

watch(() => props.container, ct => { if (ct) syncFromDOM() })
onMounted(() => { if (props.container) syncFromDOM() })
</script>
