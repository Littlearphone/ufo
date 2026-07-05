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
        <!-- 视图切换段 -->
        <div class="demo-seg-bar">
          <button
            class="demo-seg"
            :class="{ active: demoView === 'demo' }"
            @click="switchDemoView('demo')"
          >📺 演示效果</button>
          <button
            class="demo-seg"
            :class="{ active: demoView === 'html' }"
            @click="switchDemoView('html')"
          >📄 HTML 源码</button>
          <button
            v-show="hasJsSource"
            class="demo-seg"
            :class="{ active: demoView === 'js' }"
            @click="switchDemoView('js')"
          >💻 JavaScript 源码</button>
          <span class="demo-seg-label">{{ TAB_NAMES[activeTab] }}</span>
        </div>
        <p class="desc" v-html="TAB_DESCS[activeTab]"></p>

        <!-- 演示效果视图 -->
        <div v-show="demoView === 'demo'" class="demo-view-wrap">
          <div class="tab-content-wrap" v-show="activeTab !== 4">
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

            <!-- Tab 1: 密集数据 -->
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

          <!-- Tab 4: 模式示例（type/unit 多模式） -->
          <div class="tab-content-stack" :class="{ active: activeTab === 4 }">
            <div class="mode-example">
              <div class="mode-example-header"><strong>自然时间输入</strong> <code>type="time" unit="hour"</code></div>
              <time-line-container class="mode-example-body">
                <time-line-track label="施工" start="09:00" end="17:00" step="30min">
                  <time-line-segment start="09:00" end="12:00" label="打桩" color="#e67e22"></time-line-segment>
                  <time-line-segment start="13:30" end="17:00" label="浇筑" color="#f39c12"></time-line-segment>
                </time-line-track>
              </time-line-container>
            </div>
            <div class="mode-example">
              <div class="mode-example-header"><strong>秒级精度</strong> <code>type="time" unit="second"</code></div>
              <time-line-container class="mode-example-body" type="time" unit="second">
                <time-line-track label="短时测试" start="00:00" end="00:30" step="5sec">
                  <time-line-segment start="00:00" end="00:12" label="前半段" color="#16a085"></time-line-segment>
                  <time-line-segment start="00:15" end="00:30" label="后半段" color="#1abc9c"></time-line-segment>
                </time-line-track>
              </time-line-container>
            </div>
            <div class="mode-example">
              <div class="mode-example-header"><strong>分钟模式</strong> <code>type="time" unit="minute"</code></div>
              <time-line-container class="mode-example-body" type="time" unit="minute">
                <time-line-track label="日程" start="0min" end="1440min">
                  <time-line-segment start="480min" end="720min" label="工作" color="#27ae60"></time-line-segment>
                  <time-line-segment start="720min" end="780min" label="午休" color="#e67e22"></time-line-segment>
                  <time-line-segment start="780min" end="1140min" label="下午" color="#2980b9"></time-line-segment>
                </time-line-track>
              </time-line-container>
            </div>
            <div class="mode-example">
              <div class="mode-example-header"><strong>百分比</strong> <code>type="number" unit="%"</code></div>
              <time-line-container class="mode-example-body" type="number" unit="%">
                <time-line-track label="开发进度" start="0%" end="100%" step="10%">
                  <time-line-segment start="0%"  end="30%"  label="需求" color="#3498db"></time-line-segment>
                  <time-line-segment start="30%" end="80%"  label="开发" color="#2ecc71"></time-line-segment>
                  <time-line-segment start="80%" end="100%" label="测试" color="#e74c3c"></time-line-segment>
                </time-line-track>
              </time-line-container>
            </div>
            <div class="mode-example">
              <div class="mode-example-header"><strong>像素坐标</strong> <code>type="number" unit="px"</code></div>
              <time-line-container class="mode-example-body" type="number" unit="px">
                <time-line-track label="图层位置" start="0px" end="800px">
                  <time-line-segment start="0px"   end="200px" label="头像" color="#9b59b6"></time-line-segment>
                  <time-line-segment start="250px" end="600px" label="正文" color="#2ecc71"></time-line-segment>
                  <time-line-segment start="600px" end="800px" label="侧栏" color="#e91e63"></time-line-segment>
                </time-line-track>
              </time-line-container>
            </div>
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
          <div class="legend" :class="{ active: activeTab === 4 }">
            <span>展示 <code>type</code> + <code>unit</code> 组合效果</span>
            <span>每个示例独立容器，互不影响</span>
            <span>右键编辑自动适配 time / number 输入框</span>
          </div>
        </div>

        <!-- 源码视图 -->
        <div v-show="demoView !== 'demo'" class="demo-view-wrap">
          <div class="code-view">
            <div class="code-view-header">
              <span class="code-view-lang">{{ demoView === 'html' ? '📄 HTML 源码' : '💻 JavaScript 源码' }}</span>
              <button :class="{ copied: codeCopied }" @click="copyCode">
                {{ codeCopied ? '✅ 已复制' : '📋 复制' }}
              </button>
            </div>
            <pre class="code-view-body"><code :class="demoView === 'html' ? 'language-html' : 'language-javascript'" v-html="demoView === 'html' ? currentHtmlCode : currentJsCode"></code></pre>
          </div>
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

// 语法高亮（Prism 核心已内置 markup / javascript 支持）
import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.css'

const activeTab = ref(0)
const demoView = ref('demo')  // 'demo' | 'html' | 'js'
const codeCopied = ref(false)

// 容器 template ref
const c0 = ref(null)
const c1 = ref(null)
const c2 = ref(null)
const c3 = ref(null)
const c4 = ref(null)
const containers = computed(() => [c0.value, c1.value, c2.value, c3.value, c4.value])

// ── 各标签页内部轨道/段 HTML（不含容器外层） ──
const TAB_INNER_HTML = [
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
  // Tab 1 — 密集数据（无静态内嵌内容）
  ``,
  // Tab 2 — API 调用
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
  </time-line-track>`,
  // Tab 4 — 模式示例（多个独立容器）
  `<!-- 自然时间输入 -->
  <div class="mode-example">
    <div class="mode-example-header"><strong>自然时间输入</strong> <code>type="time" unit="hour"</code></div>
    <time-line-container class="mode-example-body">
      <time-line-track label="施工" start="09:00" end="17:00" step="30min">
        <time-line-segment start="09:00" end="12:00" label="打桩" color="#e67e22"></time-line-segment>
        <time-line-segment start="13:30" end="17:00" label="浇筑" color="#f39c12"></time-line-segment>
      </time-line-track>
    </time-line-container>
  </div>
  <!-- 秒级精度 -->
  <div class="mode-example">
    <div class="mode-example-header"><strong>秒级精度</strong> <code>type="time" unit="second"</code></div>
    <time-line-container class="mode-example-body" type="time" unit="second">
      <time-line-track label="短时测试" start="00:00" end="00:30" step="5sec">
        <time-line-segment start="00:00" end="00:12" label="前半段" color="#16a085"></time-line-segment>
        <time-line-segment start="00:15" end="00:30" label="后半段" color="#1abc9c"></time-line-segment>
      </time-line-track>
    </time-line-container>
  </div>
  <!-- 分钟模式 -->
  <div class="mode-example">
    <div class="mode-example-header"><strong>分钟模式</strong> <code>type="time" unit="minute"</code></div>
    <time-line-container class="mode-example-body" type="time" unit="minute">
      <time-line-track label="日程" start="0min" end="1440min">
        <time-line-segment start="480min" end="720min" label="工作" color="#27ae60"></time-line-segment>
        <time-line-segment start="720min" end="780min" label="午休" color="#e67e22"></time-line-segment>
        <time-line-segment start="780min" end="1140min" label="下午" color="#2980b9"></time-line-segment>
      </time-line-track>
    </time-line-container>
  </div>
  <!-- 百分比 -->
  <div class="mode-example">
    <div class="mode-example-header"><strong>百分比</strong> <code>type="number" unit="%"</code></div>
    <time-line-container class="mode-example-body" type="number" unit="%">
      <time-line-track label="开发进度" start="0%" end="100%" step="10%">
        <time-line-segment start="0%"  end="30%"  label="需求" color="#3498db"></time-line-segment>
        <time-line-segment start="30%" end="80%"  label="开发" color="#2ecc71"></time-line-segment>
        <time-line-segment start="80%" end="100%" label="测试" color="#e74c3c"></time-line-segment>
      </time-line-track>
    </time-line-container>
  </div>
  <!-- 像素坐标 -->
  <div class="mode-example">
    <div class="mode-example-header"><strong>像素坐标</strong> <code>type="number" unit="px"</code></div>
    <time-line-container class="mode-example-body" type="number" unit="px">
      <time-line-track label="图层位置" start="0px" end="800px">
        <time-line-segment start="0px"   end="200px" label="头像" color="#9b59b6"></time-line-segment>
        <time-line-segment start="250px" end="600px" label="正文" color="#2ecc71"></time-line-segment>
        <time-line-segment start="600px" end="800px" label="侧栏" color="#e91e63"></time-line-segment>
      </time-line-track>
    </time-line-container>
  </div>`,
]

// ── JavaScript 生成代码（按标签页，无则为 null） ──
const TAB_JS_SOURCE = [
  null,  // Tab 0
  `// 密集数据由 JavaScript 动态生成
// 用户可通过滑块控制轨道数和每轨道段数
// 时间段自动非重叠分布，颜色随机分配

const container = document.querySelector('time-line-container');
const trackN = 5;   // 轨道数（滑块调节 1-15）
const segN  = 20;   // 每轨道段数（滑块调节 1-150）
const colors = ['#27ae60','#e67e22','#2980b9','#8e44ad','#c0392b','#16a085','#f39c12','#1abc9c','#e74c3c','#2c3e50','#3498db','#9b59b6','#e91e63','#00bcd4','#ff5722'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

for (let t = 0; t < trackN; t++) {
  const track = document.createElement('time-line-track');
  track.setAttribute('label', '密集轨道-' + (t + 1));
  track.setAttribute('start', '0');
  track.setAttribute('end', '24');
  container.appendChild(track);

  for (let s = 0; s < segN; s++) {
    const seg = document.createElement('time-line-segment');
    const start = s * (24 / segN) + Math.random() * 0.15;
    const end   = start + (24 / segN) * 0.3 + Math.random() * 0.1;
    seg.setAttribute('start', String(Math.max(start, 0)));
    seg.setAttribute('end', String(Math.min(end, 24)));
    seg.setAttribute('label', 'S' + (s + 1));
    seg.setAttribute('color', pick(colors));
    track.appendChild(seg);
  }
}`,  // Tab 1 — 密集数据
  null,  // Tab 2
  null,  // Tab 3
  null,  // Tab 4 — 纯模板渲染，无需 JS 生成
]

// 从当前 DOM 读取容器标签的动态属性
function buildContainerAttrs(idx) {
  const c = containers.value[idx]
  if (!c) return ''
  const ATTRS = ['direction', 'axis-mode', 'shared-start', 'shared-end', 'label-h', 'label-v', 'tooltip-pos']
  const parts = ATTRS
    .map(a => { const v = c.getAttribute(a); return (v !== null && v !== '') ? `${a}="${v}"` : '' })
    .filter(Boolean)
  return `<time-line-container${parts.length ? ' ' + parts.join(' ') : ''}>`
}

/** 获取当前标签页的 HTML 源码（容器 + 内部轨道/段） */
function getHtmlSource(idx) {
  // Tab 4 的 inner HTML 已包含完整的 time-line-container 元素
  if (idx === 4) {
    return TAB_INNER_HTML[4]
  }
  if (idx === 1) {
    return buildContainerAttrs(idx) + '\n  <!-- 内部轨道和段由 JavaScript 动态生成 -->\n</time-line-container>'
  }
  const inner = TAB_INNER_HTML[idx]
  if (inner == null) return ''
  return buildContainerAttrs(idx) + '\n' + inner + '\n</time-line-container>'
}

/** 获取当前标签页的 JavaScript 源码，无则返回 null */
function getJsSource(idx) { return TAB_JS_SOURCE[idx] }

/** 当前标签页是否有 JS 源码（控制 JS tab 显隐） */
const hasJsSource = computed(() => getJsSource(activeTab.value) !== null)

/** Prism 高亮后的 HTML 源码 */
const currentHtmlCode = computed(() =>
  Prism.highlight(getHtmlSource(activeTab.value), Prism.languages.html, 'html')
)

/** Prism 高亮后的 JS 源码 */
const currentJsCode = computed(() => {
  const src = getJsSource(activeTab.value)
  return src ? Prism.highlight(src, Prism.languages.javascript, 'javascript') : ''
})

function switchDemoView(view) {
  demoView.value = view
  codeCopied.value = false
}

function copyCode() {
  const src = demoView.value === 'html'
    ? getHtmlSource(activeTab.value)
    : getJsSource(activeTab.value) || ''
  navigator.clipboard.writeText(src).then(() => {
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 1500)
  }).catch(() => {})
}

function switchTab(idx) {
  if (idx === activeTab.value) return
  activeTab.value = idx
  demoView.value = 'demo'
  codeCopied.value = false

  // 容器切换后刷新网格和段定位
  nextTick(() => {
    // Tab 4 使用多个独立容器（stack 布局），需特殊处理
    if (idx === 4) {
      const containers4 = document.querySelectorAll('.tab-content-stack.active time-line-container')
      requestAnimationFrame(() => {
        containers4.forEach(c => {
          if (c.allTracks) c.allTracks().forEach(t => {
            if (t._drawGrid) t._drawGrid()
            if (t._refreshPositions) t._refreshPositions()
          })
        })
      })
      return
    }
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
  document.addEventListener('segment-limit-reached', e => addLog('limit', e.detail))
  document.addEventListener('track-deleted', e => addLog('track-deleted', e.detail))
})
</script>
