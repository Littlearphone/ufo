<template>
  <h1>⏱ 时间线轨道组件</h1>
  <p class="subtitle">原生 Custom Elements · Vue 3 演示 · 零依赖</p>

  <TabBar
    :activeTab="activeTab"
    @select="switchTab"
  />

  <div class="layout">

    <!-- 左栏：演示区域 -->
    <div class="col-left">
      <div class="panel demo-panel">
        <h2>📺 演示 · <span id="tabName">{{ TAB_NAMES[activeTab] }}</span></h2>
        <p class="desc" v-html="TAB_DESCS[activeTab]"></p>

        <div class="tab-content-wrap">
          <!-- Tab 0: 基础操作 -->
          <time-line-container ref="c0" id="demo0" direction="horizontal" :class="{ active: activeTab === 0 }">
            <time-line-track label="摄像头-A（前门）" start="0" end="24" step="0.25">
              <time-line-segment start="6"  end="9"  label="早班值守" color="#27ae60"></time-line-segment>
              <time-line-segment start="14" end="15" label="超短时段" color="#e67e22" tooltip="always"></time-line-segment>
            </time-line-track>
            <time-line-track label="摄像头-B（后门）" start="0" end="24" step="0.5">
              <time-line-segment start="8"  end="12" label="上午录像" color="#2980b9"></time-line-segment>
              <time-line-segment start="13" end="17" label="中班录像一段较长名称" color="#8e44ad" tooltip="auto"></time-line-segment>
              <time-line-segment start="20" end="23" label="夜间录像" color="#c0392b" tooltip="none"></time-line-segment>
            </time-line-track>
            <time-line-track label="摄像头-C（车库）" start="0" end="24">
              <time-line-segment start="0"  end="6"  label="凌晨巡检" color="#16a085"></time-line-segment>
              <time-line-segment start="18" end="24" label="夜间巡检" color="#2c3e50"></time-line-segment>
            </time-line-track>
          </time-line-container>

          <!-- Tab 1: 海量数据 -->
          <time-line-container ref="c1" id="demo1" direction="horizontal" :class="{ active: activeTab === 1 }"></time-line-container>

          <!-- Tab 2: API 调用 -->
          <time-line-container ref="c2" id="demo2" direction="horizontal" :class="{ active: activeTab === 2 }">
            <time-line-track label="空轨道-A" start="0" end="24"></time-line-track>
            <time-line-track label="空轨道-B" start="0" end="24"></time-line-track>
          </time-line-container>

          <!-- Tab 3: 布局 / 共用轴 -->
          <time-line-container ref="c3" id="demo3" direction="horizontal" axis-mode="shared" shared-start="0" shared-end="24" :class="{ active: activeTab === 3 }">
            <time-line-track label="早班段" start="0" end="12" step="0.5">
              <time-line-segment start="1"  end="5"  label="早高峰" color="#e67e22"></time-line-segment>
              <time-line-segment start="7"  end="10" label="上午时段" color="#f39c12"></time-line-segment>
            </time-line-track>
            <time-line-track label="中班段" start="6" end="20" step="0.5">
              <time-line-segment start="8"  end="12" label="核心时段" color="#2980b9"></time-line-segment>
              <time-line-segment start="14" end="18" label="下午班" color="#3498db"></time-line-segment>
            </time-line-track>
            <time-line-track label="全天段" start="0" end="24" step="1">
              <time-line-segment start="3"  end="7"  label="凌晨" color="#16a085"></time-line-segment>
              <time-line-segment start="12" end="14" label="午休" color="#1abc9c"></time-line-segment>
              <time-line-segment start="19" end="23" label="晚间" color="#27ae60"></time-line-segment>
            </time-line-track>
          </time-line-container>
        </div>

        <!-- 图例 -->
        <div class="legend" :class="{ active: activeTab === 0 }">
          <span><i style="background:#27ae60"></i> 早班值守</span>
          <span><i style="background:#e67e22"></i> 超短 <code>tooltip=always</code></span>
          <span><i style="background:#2980b9"></i> 上午录像</span>
          <span><i style="background:#8e44ad"></i> 中班 <code>tooltip=auto</code></span>
          <span><i style="background:#c0392b"></i> 夜间 <code>tooltip=none</code></span>
          <span><i style="background:#16a085"></i> 凌晨巡检</span>
          <span><i style="background:#2c3e50"></i> 夜间巡检</span>
          <span><code>color</code> 自由指定 · <code>tooltip</code>: auto | always | none</span>
        </div>
        <div class="legend" :class="{ active: activeTab === 1 }">
          <span>拖动滑块调节数据量后点击<strong>「生成数据」</strong>按钮</span>
          <span>颜色随机分配 · 段自动分布避免重叠</span>
          <span>用于测试组件在大量段下的渲染与交互性能</span>
        </div>
        <div class="legend" :class="{ active: activeTab === 2 }">
          <span>在控制台调用组件 <strong>API</strong> 方法，观察轨道变化</span>
          <span>左侧演示区域初始为 2 条空轨道</span>
        </div>
        <div class="legend" :class="{ active: activeTab === 3 }">
          <span><i style="background:#e67e22"></i> 早班段 0-12</span>
          <span><i style="background:#2980b9"></i> 中班段 6-20</span>
          <span><i style="background:#16a085"></i> 全天段 0-24</span>
          <span>共用轴 <code>axis-mode="shared"</code> 统一时间范围</span>
          <span>不同范围轨道自动对齐</span>
        </div>

        <!-- 代码框 -->
        <div class="code-toggle-bar">
          <button :class="{ active: codeVisible }" @click="toggleCode">
            {{ codeVisible ? '📄 隐藏代码' : '📄 显示代码' }}
          </button>
        </div>
        <div class="code-block" :class="{ open: codeVisible }">
          <div class="code-block-header">
            <span>{{ activeTab === 1 ? '📄 JavaScript 源码' : '📄 HTML 源码' }}</span>
            <button :class="{ copied: codeCopied }" @click="copyCode">
              {{ codeCopied ? '✅ 已复制' : '📋 复制' }}
            </button>
          </div>
          <pre><code>{{ currentCode }}</code></pre>
        </div>
      </div>
    </div>

    <!-- 右栏：控制台 + 日志 -->
    <div class="col-right">
      <ControlsPanel :activeTab="activeTab" :containers="containers" />
      <EventLog />
    </div>

  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { TAB_DESCS, TAB_NAMES } from './composables/constants.js'
import { addLog } from './stores/eventLog.js'
import TabBar from './components/TabBar.vue'
import ControlsPanel from './components/ControlsPanel.vue'
import EventLog from './components/EventLog.vue'

const activeTab = ref(0)
const codeVisible = ref(false)
const codeCopied = ref(false)

// 容器 template ref
const c0 = ref(null)
const c1 = ref(null)
const c2 = ref(null)
const c3 = ref(null)
const containers = computed(() => [c0.value, c1.value, c2.value, c3.value])

// 各标签页内部源码模板
const TAB_INNER = [
  // Tab 0 — 基础操作
  `  <time-line-track label="摄像头-A（前门）" start="0" end="24" step="0.25">
    <time-line-segment start="6"  end="9"  label="早班值守" color="#27ae60"></time-line-segment>
    <time-line-segment start="14" end="15" label="超短时段" color="#e67e22" tooltip="always"></time-line-segment>
  </time-line-track>
  <time-line-track label="摄像头-B（后门）" start="0" end="24" step="0.5">
    <time-line-segment start="8"  end="12" label="上午录像" color="#2980b9"></time-line-segment>
    <time-line-segment start="13" end="17" label="中班录像一段较长名称" color="#8e44ad" tooltip="auto"></time-line-segment>
    <time-line-segment start="20" end="23" label="夜间录像" color="#c0392b" tooltip="none"></time-line-segment>
  </time-line-track>
  <time-line-track label="摄像头-C（车库）" start="0" end="24">
    <time-line-segment start="0"  end="6"  label="凌晨巡检" color="#16a085"></time-line-segment>
    <time-line-segment start="18" end="24" label="夜间巡检" color="#2c3e50"></time-line-segment>
  </time-line-track>`,
  // Tab 1 — JS 生成数据
  `// 海量数据由 JavaScript 动态生成
// 可通过滑块控制轨道数和每轨道段数

const trackN = 5, segN = 20;
for (let t = 0; t < trackN; t++) {
  const track = document.createElement('time-line-track');
  track.setAttribute('label', '海量轨道-' + (t + 1));
  track.setAttribute('start', '0');
  track.setAttribute('end', '24');
  container.appendChild(track);
  for (let s = 0; s < segN; s++) {
    const seg = document.createElement('time-line-segment');
    const start = s * (24 / segN) + Math.random() * 0.15;
    const end = start + (24 / segN) * 0.3 + Math.random() * 0.1;
    seg.setAttribute('start', String(start));
    seg.setAttribute('end', String(end));
    seg.setAttribute('label', 'S' + (s + 1));
    seg.setAttribute('color', pick(colors));
    track.appendChild(seg);
  }
}`,
  // Tab 2 — API 空轨道
  `  <time-line-track label="空轨道-A" start="0" end="24">
  </time-line-track>
  <time-line-track label="空轨道-B" start="0" end="24">
  </time-line-track>`,
  // Tab 3 — 布局 / 共用轴
  `  <time-line-track label="早班段" start="0" end="12" step="0.5">
    <time-line-segment start="1"  end="5"  label="早高峰" color="#e67e22"></time-line-segment>
    <time-line-segment start="7"  end="10" label="上午时段" color="#f39c12"></time-line-segment>
  </time-line-track>
  <time-line-track label="中班段" start="6" end="20" step="0.5">
    <time-line-segment start="8"  end="12" label="核心时段" color="#2980b9"></time-line-segment>
    <time-line-segment start="14" end="18" label="下午班" color="#3498db"></time-line-segment>
  </time-line-track>
  <time-line-track label="全天段" start="0" end="24" step="1">
    <time-line-segment start="3"  end="7"  label="凌晨" color="#16a085"></time-line-segment>
    <time-line-segment start="12" end="14" label="午休" color="#1abc9c"></time-line-segment>
    <time-line-segment start="19" end="23" label="晚间" color="#27ae60"></time-line-segment>
  </time-line-track>`
]

// 从当前 DOM 读取容器标签的动态属性
function buildAttrs(idx) {
  const c = containers.value[idx]
  if (!c) return ''
  const ATTRS = ['direction', 'axis-mode', 'shared-start', 'shared-end', 'label-h', 'label-v', 'tooltip-pos']
  const parts = ATTRS
    .map(a => { const v = c.getAttribute(a); return (v !== null && v !== '') ? `${a}="${v}"` : '' })
    .filter(Boolean)
  return `<time-line-container${parts.length ? ' ' + parts.join(' ') : ''}>`
}

const currentCode = computed(() => {
  const idx = activeTab.value
  if (idx === 1) return TAB_INNER[1]
  const inner = TAB_INNER[idx]
  if (inner == null) return ''
  return buildAttrs(idx) + '\n' + inner + '\n</time-line-container>'
})

function toggleCode() { codeVisible.value = !codeVisible.value }

function copyCode() {
  navigator.clipboard.writeText(currentCode.value).then(() => {
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 1500)
  }).catch(() => {})
}

function switchTab(idx) {
  if (idx === activeTab.value) return
  activeTab.value = idx
  codeVisible.value = false
  codeCopied.value = false

  // 容器切换后刷新网格和段定位
  nextTick(() => {
    const c = containers.value[idx]
    if (!c) return
    requestAnimationFrame(() => {
      c.allTracks().forEach(t => {
        if (t._drawGrid) t._drawGrid()
        if (t._refreshPositions) t._refreshPositions()
      })
    })
  })
}

// 初始化：设置默认圆角 & 注册全局事件监听
onMounted(() => {
  nextTick(() => {
    containers.value.forEach(c => {
      if (c && c.setGlobalRadius) c.setGlobalRadius('0')
    })
  })

  // 监听所有容器的事件（冒泡到 document）
  document.addEventListener('segment-created', e => addLog('create', e.detail.segment))
  document.addEventListener('segment-change',  e => addLog('change', e.detail))
  document.addEventListener('segment-changed', e => addLog('changed', e.detail))
  document.addEventListener('segment-deleted', e => addLog('deleted', e.detail))
})
</script>
