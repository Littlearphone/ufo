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

          <div class="tab-content-area">

            <!-- ════ Tab 0: 基础操作 + 共用轴 ════ -->

            <div class="tab-pane" :class="{ active: activeTab === 0 }">

              <time-line-container ref="c0" id="demo0" direction="horizontal" step="0.5">

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

              <time-line-track label="机房巡检" start="8" end="22" step="0.5">

                <time-line-segment start="9"  end="12" label="上午巡检" color="#e67e22"></time-line-segment>

                <time-line-segment start="13" end="17" label="下午维护" color="#2980b9"></time-line-segment>

                <time-line-segment start="19" end="21" label="晚间值班" color="#8e44ad"></time-line-segment>

              </time-line-track>

            </time-line-container>

            </div>



            <!-- ════ Tab 1: 密集数据 ════ -->

            <div class="tab-pane" :class="{ active: activeTab === 1 }">

              <time-line-container ref="c1" id="demo1" direction="horizontal"></time-line-container>

            </div>



            <!-- ════ Tab 2: API 调用 ════ -->

            <div class="tab-pane" :class="{ active: activeTab === 2 }">

              <time-line-container ref="c2" id="demo2" direction="horizontal">

                <time-line-track label="空轨道-A" start="0" end="24"></time-line-track>

                <time-line-track label="空轨道-B" start="0" end="24"></time-line-track>

              </time-line-container>

            </div>



            <!-- ════ Tab 3: 模式示例（type/unit 多模式） ════ -->

            <div class="tab-pane tab-pane--stack" :class="{ active: activeTab === 3 }">

              <div class="mode-example">

                <div class="mode-example-header"><strong>自然时间输入</strong> <code>type="time" unit="hour"</code> <span class="mode-desc">默认模式，支持 09:00 / 30min 等自然时间输入</span></div>

                <time-line-container class="mode-example-body">

                  <time-line-track label="施工" start="09:00" end="17:00" step="30min">

                    <time-line-segment start="09:00" end="12:00" label="打桩" color="#e67e22"></time-line-segment>

                    <time-line-segment start="13:30" end="17:00" label="浇筑" color="#f39c12"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>

              <div class="mode-example">

                <div class="mode-example-header"><strong>秒级精度</strong> <code>type="time" unit="second"</code> <span class="mode-desc">段标简化为 HH:MM，Tooltip 显示 HH:MM:SS</span></div>

                <time-line-container class="mode-example-body" type="time" unit="second">

                  <time-line-track label="短时测试" start="00:00" end="00:30" step="5sec">

                    <time-line-segment start="00:00" end="00:12" label="前半段" color="#16a085"></time-line-segment>

                    <time-line-segment start="00:15" end="00:30" label="后半段" color="#1abc9c"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>

              <div class="mode-example">

                <div class="mode-example-header"><strong>分钟模式</strong> <code>type="time" unit="minute"</code> <span class="mode-desc">归一化输入为分钟，轴显示为时间格式</span></div>

                <time-line-container class="mode-example-body" type="time" unit="minute">

                  <time-line-track label="日程" start="0min" end="1440min">

                    <time-line-segment start="480min" end="720min" label="工作" color="#27ae60"></time-line-segment>

                    <time-line-segment start="720min" end="780min" label="午休" color="#e67e22"></time-line-segment>

                    <time-line-segment start="780min" end="1140min" label="下午" color="#2980b9"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>

              <div class="mode-example">

                <div class="mode-example-header"><strong>百分比</strong> <code>type="number" unit="%"</code> <span class="mode-desc">纯数值模式，显示 0% ~ 100%</span></div>

                <time-line-container class="mode-example-body" type="number" unit="%">

                  <time-line-track label="开发进度" start="0%" end="100%" step="10%">

                    <time-line-segment start="0%"  end="30%"  label="需求" color="#3498db"></time-line-segment>

                    <time-line-segment start="30%" end="80%"  label="开发" color="#2ecc71"></time-line-segment>

                    <time-line-segment start="80%" end="100%" label="测试" color="#e74c3c"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>

              <div class="mode-example">

                <div class="mode-example-header"><strong>像素坐标</strong> <code>type="number" unit="px"</code> <span class="mode-desc">数值范围标尺，可拖拽操作</span></div>

                <time-line-container class="mode-example-body" type="number" unit="px">

                  <time-line-track label="图层位置" start="0px" end="800px">

                    <time-line-segment start="0px"   end="200px" label="头像" color="#9b59b6"></time-line-segment>

                    <time-line-segment start="250px" end="600px" label="正文" color="#2ecc71"></time-line-segment>

                    <time-line-segment start="600px" end="800px" label="侧栏" color="#e91e63"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>

              <div class="mode-example">

                <div class="mode-example-header"><strong>温度计（摄氏度）</strong> <code>type="number" unit="°C"</code> <span class="mode-desc">数值模式带单位后缀，-10°C ~ 40°C 范围</span></div>

                <time-line-container class="mode-example-body" type="number" unit="°C">

                  <time-line-track label="气温监测" start="-10°C" end="40°C" step="5°C">

                    <time-line-segment start="-10°C" end="0°C"   label="严寒" color="#3498db"></time-line-segment>

                    <time-line-segment start="0°C"   end="15°C"  label="凉爽" color="#2ecc71"></time-line-segment>

                    <time-line-segment start="15°C"  end="30°C"  label="温暖" color="#e67e22"></time-line-segment>

                    <time-line-segment start="30°C"  end="40°C"  label="炎热" color="#e74c3c"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>

            </div>



            <!-- ════ Tab 4: Vue 3 集成（composable 驱动） ════ -->

            <div class="tab-pane vue-tab4" :class="{ active: activeTab === 4 }">

              <div class="vue-tab4-layout">

                <!-- CE 容器：空壳，由 useTimelineSync 管理 -->

                <div class="vue-tab4-ce">

                  <time-line-container ref="c4" direction="horizontal"></time-line-container>

                </div>

                <!-- Vue 数据面板：实时显示与 CE 同步的轨道/段数据 -->

                <div class="vue-tab4-data">

                  <div class="vue-t4-actions">

                    <button class="demo-seg" @click="addVueTrack">＋ 添加轨道</button>

                    <button class="demo-seg" @click="resetVueDemo">↺ 重置</button>

                  </div>

                  <div class="vue-t4-scroll">

                    <div v-for="track in vueDemoTracks" :key="track.id" class="vue-t4-track">

                      <div class="vue-t4-th">

                        <span class="vue-t4-th-label">{{ track.label || '(未命名)' }}</span>

                        <span class="vue-t4-th-range">{{ track.start }} – {{ track.end }}</span>

                        <span class="vue-t4-th-count badge badge-muted">{{ track.segments.length }} 段</span>

                      </div>

                      <div class="vue-t4-segs">

                        <div v-for="seg in track.segments" :key="seg.id" class="vue-t4-seg">

                          <span class="vue-t4-seg-color" :style="{ background: seg.color || '#4285f4' }"></span>

                          <span class="vue-t4-seg-label">{{ seg.label || '(未命名)' }}</span>

                          <span class="vue-t4-seg-time">{{ _fmtSeg(seg) }}</span>

                        </div>

                        <div v-if="!track.segments.length" class="vue-t4-empty">拖拽创建时间段</div>

                      </div>

                    </div>

                    <div v-if="!vueDemoTracks.length" class="vue-t4-empty-all">暂无轨道，点击「添加轨道」或编程式添加</div>

                  </div>

                </div>

              </div>

            </div>



            <!-- ════ Tab 6: Vue 源码组件 ════ -->

            <div class="tab-pane" :class="{ active: activeTab === 6 }">

              <div class="vue-tab4-layout">

                <div class="vue-tab4-ce">

                  <VTimelineContainer

                    v-model:tracks="vueTracks"

                    direction="horizontal"

                    :step="0.5"

                  />

                </div>

                <div class="vue-tab4-data">

                  <div class="vue-t4-actions">

                    <span class="demo-seg" style="cursor:default;background:#e8f5e9;color:#2e7d32">

                      ✅ 原生 Vue 组件

                    </span>

                    <button class="demo-seg" @click="addVueTrack6">＋ 添加轨道</button>

                  </div>

                  <div class="vue-t4-scroll">

                    <div v-for="track in vueTracks" :key="track.id" class="vue-t4-track">

                      <div class="vue-t4-th">

                        <span class="vue-t4-th-label">{{ track.label || '(未命名)' }}</span>

                        <span class="vue-t4-th-count badge badge-muted">{{ track.segments.length }} 段</span>

                      </div>

                      <div class="vue-t4-segs">

                        <div v-for="seg in track.segments" :key="seg.id" class="vue-t4-seg">

                          <span class="vue-t4-seg-color" :style="{ background: seg.color || '#4285f4' }"></span>

                          <span class="vue-t4-seg-label">{{ seg.label || '(未命名)' }}</span>

                        </div>

                        <div v-if="!track.segments.length" class="vue-t4-empty">拖拽创建时间段</div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>



            <!-- ════ Tab 5: CRUD 权限 ════ -->

            <div class="tab-pane tab-pane--stack" :class="{ active: activeTab === 5 }">

              <!-- 交互沙盒 -->

              <div class="mode-example">

                <div class="mode-example-header">

                  <strong>🎮 交互沙盒</strong>

                  <code>在右侧控制台切换各项权限</code>

                  <span class="mode-desc">实时观察拖拽/菜单/按钮的变化</span>

                </div>

                <time-line-container ref="c5" class="mode-example-body" id="sandbox" style="height:170px">

                  <time-line-track label="轨道-A" start="0" end="24">

                    <time-line-segment start="8" end="12" label="段A" color="#3498db"></time-line-segment>

                    <time-line-segment start="14" end="17" label="段B" color="#2ecc71"></time-line-segment>

                  </time-line-track>

                  <time-line-track label="轨道-B" start="0" end="24">

                    <time-line-segment start="9" end="13" label="段C" color="#e67e22"></time-line-segment>

                    <time-line-segment start="15" end="18" label="段D" color="#9b59b6"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>



              <!-- 案例 1: 完全只读 -->

              <div class="mode-example">

                <div class="mode-example-header">

                  <strong>🔒 完全只读</strong>

                  <code>creatable="false" editable="false" deletable="false" clearable="false"</code>

                  <span class="mode-desc">拖拽、编辑、删除、清空全部禁止</span>

                </div>

                <time-line-container class="mode-example-body" creatable="false" editable="false" deletable="false" clearable="false">

                  <time-line-track label="只读轨道" start="0" end="24">

                    <time-line-segment start="8" end="12" label="不可操作" color="#95a5a6"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>



              <!-- 案例 2: 仅可创建 -->

              <div class="mode-example">

                <div class="mode-example-header">

                  <strong>➕ 仅创建</strong>

                  <code>creatable="true" editable="false" deletable="false" clearable="false"</code>

                  <span class="mode-desc">可拖拽添加新段，但不可编辑、删除或清空已有段</span>

                </div>

                <time-line-container class="mode-example-body" creatable="true" editable="false" deletable="false" clearable="false">

                  <time-line-track label="可添加段" start="0" end="24">

                    <time-line-segment start="9" end="12" label="已有段" color="#27ae60"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>



              <!-- 案例 3: 仅可编辑 -->

              <div class="mode-example">

                <div class="mode-example-header">

                  <strong>✏️ 仅编辑</strong>

                  <code>creatable="false" editable="true" deletable="false" clearable="false"</code>

                  <span class="mode-desc">可拖拽移动/调整/修改属性，不可添加、删除或清空</span>

                </div>

                <time-line-container class="mode-example-body" creatable="false" editable="true" deletable="false" clearable="false">

                  <time-line-track label="可编辑段" start="0" end="24">

                    <time-line-segment start="8" end="11" label="可移动/拉伸" color="#2980b9"></time-line-segment>

                    <time-line-segment start="13" end="16" label="可修改属性" color="#8e44ad"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>



              <!-- 案例 4: 仅可删除 -->

              <div class="mode-example">

                <div class="mode-example-header">

                  <strong>🗑️ 仅删除</strong>

                  <code>creatable="false" editable="false" deletable="true"</code>

                  <span class="mode-desc">仅可删除段/轨道、清空轨道，不可添加或编辑</span>

                </div>

                <time-line-container class="mode-example-body" creatable="false" editable="false" deletable="true">

                  <time-line-track label="可删除段" start="0" end="24">

                    <time-line-segment start="10" end="14" label="可删除" color="#e74c3c"></time-line-segment>

                    <time-line-segment start="16" end="19" label="也可删除" color="#e67e22"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>



              <!-- 案例 5: 轨道级覆盖 -->

              <div class="mode-example">

                <div class="mode-example-header">

                  <strong>🛤️ 轨道级覆盖</strong>

                  <code>轨道各自设置 creatable / editable / deletable / clearable</code>

                  <span class="mode-desc">同一容器内各轨道权限独立</span>

                </div>

                <time-line-container class="mode-example-body" style="height:160px">

                  <time-line-track label="普通轨道" start="0" end="24">

                    <time-line-segment start="8" end="12" label="全部可操作" color="#3498db"></time-line-segment>

                  </time-line-track>

                  <time-line-track label="只读轨道" start="0" end="24" creatable="false" editable="false" deletable="false" clearable="false">

                    <time-line-segment start="14" end="18" label="完全只读" color="#95a5a6"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>



              <!-- 案例 6: 片段级覆盖 -->

              <div class="mode-example">

                <div class="mode-example-header">

                  <strong>🧩 片段级覆盖</strong>

                  <code>各 segment 单独控制 editable / deletable，轨道禁用 clearable</code>

                  <span class="mode-desc">同一轨道内各段权限独立</span>

                </div>

                <time-line-container class="mode-example-body">

                  <time-line-track label="混合控制" start="0" end="24" deletable="false" clearable="false">

                    <time-line-segment start="8" end="10" label="可编辑" editable="true" color="#27ae60"></time-line-segment>

                    <time-line-segment start="11" end="13" label="只读" editable="false" deletable="false" color="#95a5a6"></time-line-segment>

                    <time-line-segment start="14" end="16" label="仅可删除" editable="false" deletable="true" color="#e74c3c"></time-line-segment>

                    <time-line-segment start="17" end="19" label="可编辑+删除" editable="true" deletable="true" color="#2980b9"></time-line-segment>

                  </time-line-track>

                </time-line-container>

              </div>

            </div>

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

      <ControlsPanel :activeTab="activeTab" :containers="containers" @add-track="addVueTrack" @reset="handleControlsReset" />

      <EventLog />

    </div>



  </div>

</template>



<script setup>

import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

import { TAB_DESCS, TAB_NAMES } from './composables/constants.js'

import { addLog } from './stores/eventLog.js'

import TabBar from './components/TabBar.vue'

import ControlsPanel from './components/ControlsPanel.vue'

import EventLog from './components/EventLog.vue'


import { useTimelineSync } from './composables/useTimelineSync.js'

import { VTimelineContainer } from '../vue/index.js'

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

const c3 = ref(null)   // 模式示例（stack，无单容器）

const c4 = ref(null)   // Vue 3 集成

const c5 = ref(null)   // CRUD 权限沙盒

const c6 = ref(null)   // （Tab 6 Vue 组件不使用 CE ref，占位用）

const containers = computed(() => [c0.value, c1.value, c2.value, c3.value, c4.value, c5.value, c6.value])



/** 版本计数器：每次切到 HTML 源码视图时 +1，迫使 currentHtmlCode 从真实 DOM 重新序列化 */

const htmlRev = ref(0)



// ── DOM 变化观察器（控制台修改时实时刷新 HTML 源码视图） ──

let _domObserveRaf = null

const _domObserver = new MutationObserver(() => {

  // 只有当前正在看 HTML 源码时才触发刷新

  if (demoView.value !== 'html') return

  if (_domObserveRaf) cancelAnimationFrame(_domObserveRaf)

  _domObserveRaf = requestAnimationFrame(() => { htmlRev.value++ })

})



// ── Tab 4（Vue 3 集成）响应式演示数据 ──

// 注意：每个 track 和 segment 必须包含 `id` 字段，供 useTimelineSync 追踪身份

let _vueId = 100

function _vid() { return `v4_${_vueId++}` }



const vueDemoTracks = ref([

  { id: _vid(), label: '前端开发', start: '0', end: '24', segments: [

    { id: _vid(), start: '2', end: '8', label: '框架搭建', color: '#3498db' },

    { id: _vid(), start: '9', end: '16', label: '功能开发', color: '#2ecc71' },

    { id: _vid(), start: '18', end: '22', label: '联调测试', color: '#e74c3c' },

  ]},

  { id: _vid(), label: '后端开发', start: '0', end: '24', segments: [

    { id: _vid(), start: '1', end: '7', label: 'API 设计', color: '#9b59b6' },

    { id: _vid(), start: '8', end: '18', label: '业务实现', color: '#e67e22' },

    { id: _vid(), start: '19', end: '23', label: '性能优化', color: '#16a085' },

  ]},

])



// ── useTimelineSync 桥接 CE ↔ Vue 响应式数据 ──

useTimelineSync(c4, vueDemoTracks, {

  events: {

    onSegmentCreated(seg, tIdx) { addLog('create', seg) },

    onSegmentChanged(seg, tIdx) { addLog('changed', seg) },

    onSegmentDeleted(seg, tIdx) { addLog('deleted', seg) },

    onTrackDeleted(track, tIdx) { addLog('track-deleted', track) },

  },

})



/** 添加 Vue 响应式轨道（从 Tab4Controls 通过事件触发，支持自定义标签） */

function addVueTrack(label) {

  const n = vueDemoTracks.value.length + 1

  vueDemoTracks.value.push({

    id: _vid(),

    label: label || `新任务 ${n}`,

    start: '0',

    end: '24',

    segments: [],

  })

}



/** 重置 Tab 4 演示数据 */

function resetVueDemo() {

  const reset = [

    { id: _vid(), label: '前端开发', start: '0', end: '24', segments: [

      { id: _vid(), start: '2', end: '8', label: '框架搭建', color: '#3498db' },

      { id: _vid(), start: '9', end: '16', label: '功能开发', color: '#2ecc71' },

      { id: _vid(), start: '18', end: '22', label: '联调测试', color: '#e74c3c' },

    ]},

    { id: _vid(), label: '后端开发', start: '0', end: '24', segments: [

      { id: _vid(), start: '1', end: '7', label: 'API 设计', color: '#9b59b6' },

      { id: _vid(), start: '8', end: '18', label: '业务实现', color: '#e67e22' },

      { id: _vid(), start: '19', end: '23', label: '性能优化', color: '#16a085' },

    ]},

  ]

  vueDemoTracks.value = reset

}



/** 格式化段起止显示 */

function _fmtSeg(seg) {

  const s = typeof seg.start === 'number' ? Math.round(seg.start * 100) / 100 : seg.start

  const e = typeof seg.end === 'number' ? Math.round(seg.end * 100) / 100 : seg.end

  return `${s} – ${e}`

}



// ── Tab 6（Vue 原生组件）演示数据 ──

const vueTracks = ref([

  { id: 'vt1', label: '功能开发', start: '0', end: '24', segments: [

    { id: 'vs1', start: 8, end: 12, label: '前端', color: '#3498db' },

    { id: 'vs2', start: 13, end: 17, label: '后端', color: '#2ecc71' },

  ]},

  { id: 'vt2', label: '设计工作', start: '0', end: '24', segments: [

    { id: 'vs3', start: 9, end: 12, label: 'UI 设计', color: '#e67e22' },

    { id: 'vs4', start: 14, end: 16, label: '评审', color: '#9b59b6' },

  ]},

])



function addVueTrack6() {

  const n = vueTracks.value.length + 1

  vueTracks.value.push({

    id: `vt_${Date.now()}`,

    label: `新轨道 ${n}`,

    start: '0', end: '24', segments: [],

  })

}



/**

 * 处理来自控制台标题栏的重置请求（Tab 1/4/5 由 App.vue 处理，Tab 0/2/3 由各自组件自处理）

 * @param {number} idx - 标签页索引

 */

function handleControlsReset(idx) {

  if (idx === 1) {

    // Tab 1 密集数据：移除所有轨道（保留容器内部结构），恢复默认属性

    const c = containers.value[1]

    if (c) {

      c.allTracks().forEach(t => t.remove())

      c.setAttribute('direction', 'horizontal')

      c.removeAttribute('axis-mode')

      c.removeAttribute('shared-start')

      c.removeAttribute('shared-end')

      c.removeAttribute('label-h')

      c.removeAttribute('label-v')

      c.style.height = ''

      c.style.width = ''

    }

  } else if (idx === 3) {

    // Tab 3 模式示例：重建所有容器 DOM

    const pane = document.querySelector('.tab-pane--stack')

    if (pane) pane.innerHTML = TAB_INNER_HTML[3]

  } else if (idx === 4) {

    // Tab 4 Vue 集成：恢复默认响应式数据

    resetVueDemo()

  } else if (idx === 5) {

    // Tab 5 CRUD 权限：重置沙盒容器属性到默认值（保留 Vue ref，不用 innerHTML）

    const ct = containers.value[5]

    if (ct) {

      ct.removeAttribute('creatable')

      ct.removeAttribute('editable')

      ct.removeAttribute('deletable')

      ct.removeAttribute('clearable')

      ct.removeAttribute('copyable')

      ct.querySelectorAll(':scope > time-line-track').forEach(t => {

        t.removeAttribute('creatable')

        t.removeAttribute('editable')

        t.removeAttribute('deletable')

        t.removeAttribute('clearable')

        t.removeAttribute('copyable')

      })

      ct.querySelectorAll('time-line-segment').forEach(s => {

        s.removeAttribute('editable')

        s.removeAttribute('deletable')

      })

    }

  }

  // 刷新 HTML 源码视图

  if (demoView.value === 'html') htmlRev.value++

}



// ── 各标签页内部轨道/段 HTML（不含容器外层） ──

const TAB_INNER_HTML = [

  // Tab 0 — 基础操作 + 共用轴（4 条轨道，含不同范围）

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

  </time-line-track>

  <time-line-track label="机房巡检" start="8" end="22" step="0.5">

    <time-line-segment start="9"  end="12" label="上午巡检" color="#e67e22"></time-line-segment>

    <time-line-segment start="13" end="17" label="下午维护" color="#2980b9"></time-line-segment>

    <time-line-segment start="19" end="21" label="晚间值班" color="#8e44ad"></time-line-segment>

  </time-line-track>`,

  // Tab 1 — 密集数据（无静态内嵌内容）

  ``,

  // Tab 2 — API 调用

  `  <time-line-track label="空轨道-A" start="0" end="24">

  </time-line-track>

  <time-line-track label="空轨道-B" start="0" end="24">

  </time-line-track>`,

  // Tab 3 — 模式示例（多个独立容器）

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

  </div>

  <!-- 温度计（摄氏度） -->

  <div class="mode-example">

    <div class="mode-example-header"><strong>温度计（摄氏度）</strong> <code>type="number" unit="°C"</code></div>

    <time-line-container class="mode-example-body" type="number" unit="°C">

      <time-line-track label="气温监测" start="-10°C" end="40°C" step="5°C">

        <time-line-segment start="-10°C" end="0°C"   label="严寒" color="#3498db"></time-line-segment>

        <time-line-segment start="0°C"   end="15°C"  label="凉爽" color="#2ecc71"></time-line-segment>

        <time-line-segment start="15°C"  end="30°C"  label="温暖" color="#e67e22"></time-line-segment>

        <time-line-segment start="30°C"  end="40°C"  label="炎热" color="#e74c3c"></time-line-segment>

      </time-line-track>

    </time-line-container>

  </div>`,

  // Tab 4 — Vue 3 集成（显示 useTimelineSync 数据驱动模式的 HTML）

  `  <!-- 使用 useTimelineSync composable 驱动，无需 v-for -->

  <time-line-container ref="containerRef" direction="horizontal">

    <!-- 轨道和段由 composable 通过 CE API 创建 -->

  </time-line-container>`,

  // Tab 5 — CRUD 权限（静态模板，各 demo case 的展示代码）
  // Tab 6 — Vue 组件（显示 VTimelineContainer 源码）
  `<VTimelineContainer
    v-model:tracks="tracks"
    direction="horizontal"
    :step="0.5"
  />`,


  `  <!-- 🎮 交互沙盒 -->

  <time-line-container style="height:170px">

    <time-line-track label="轨道-A" start="0" end="24">

      <time-line-segment start="8" end="12" label="段A" color="#3498db"></time-line-segment>

      <time-line-segment start="14" end="17" label="段B" color="#2ecc71"></time-line-segment>

    </time-line-track>

    <time-line-track label="轨道-B" start="0" end="24">

      <time-line-segment start="9" end="13" label="段C" color="#e67e22"></time-line-segment>

      <time-line-segment start="15" end="18" label="段D" color="#9b59b6"></time-line-segment>

    </time-line-track>

  </time-line-container>



  <!-- 🔒 完全只读 -->

  <time-line-container creatable="false" editable="false" deletable="false" clearable="false">

    <time-line-track label="只读轨道" start="0" end="24">

      <time-line-segment start="8" end="12" label="不可操作" color="#95a5a6"></time-line-segment>

    </time-line-track>

  </time-line-container>



  <!-- ➕ 仅创建 -->

  <time-line-container creatable="true" editable="false" deletable="false" clearable="false">

    <time-line-track label="可添加段" start="0" end="24">

      <time-line-segment start="9" end="12" label="已有段" color="#27ae60"></time-line-segment>

    </time-line-track>

  </time-line-container>



  <!-- ✏️ 仅编辑 -->

  <time-line-container creatable="false" editable="true" deletable="false" clearable="false">

    <time-line-track label="可编辑段" start="0" end="24">

      <time-line-segment start="8" end="11" label="可移动/拉伸" color="#2980b9"></time-line-segment>

      <time-line-segment start="13" end="16" label="可修改属性" color="#8e44ad"></time-line-segment>

    </time-line-track>

  </time-line-container>



  <!-- 🗑️ 仅删除 -->

  <time-line-container creatable="false" editable="false" deletable="true">

    <time-line-track label="可删除段" start="0" end="24">

      <time-line-segment start="10" end="14" label="可删除" color="#e74c3c"></time-line-segment>

      <time-line-segment start="16" end="19" label="也可删除" color="#e67e22"></time-line-segment>

    </time-line-track>

  </time-line-container>



  <!-- 🛤️ 轨道级覆盖 -->

  <time-line-container style="height:160px">

    <time-line-track label="普通轨道" start="0" end="24">

      <time-line-segment start="8" end="12" label="全部可操作" color="#3498db"></time-line-segment>

    </time-line-track>

    <time-line-track label="只读轨道" start="0" end="24" creatable="false" editable="false" deletable="false" clearable="false">

      <time-line-segment start="14" end="18" label="完全只读" color="#95a5a6"></time-line-segment>

    </time-line-track>

  </time-line-container>



  <!-- 🧩 片段级覆盖 -->

  <time-line-container>

    <time-line-track label="混合控制" start="0" end="24" deletable="false" clearable="false">

      <time-line-segment start="8" end="10" label="可编辑" editable="true" color="#27ae60"></time-line-segment>

      <time-line-segment start="11" end="13" label="只读" editable="false" deletable="false" color="#95a5a6"></time-line-segment>

      <time-line-segment start="14" end="16" label="仅可删除" editable="false" deletable="true" color="#e74c3c"></time-line-segment>

      <time-line-segment start="17" end="19" label="可编辑+删除" editable="true" deletable="true" color="#2980b9"></time-line-segment>

    </time-line-track>

  </time-line-container>`,

]



// ── JavaScript 生成代码（按标签页，无则为 null） ──

const TAB_JS_SOURCE = [

  null,  // Tab 0 — 基础操作 + 共用轴

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

  null,  // Tab 3 — 纯模板渲染，无需 JS 生成

  // Tab 4 — Vue 3 集成（useTimelineSync 数据驱动模式）

  `// ═══════════════════════════════════════════════

// 引入：Vite / Webpack / pnpm

// ═══════════════════════════════════════════════

//   import { ref } from 'vue'

//   import { useTimelineSync } from '@ufo/timeline-track/composables/useTimelineSync'

//   import '@ufo/timeline-track'

//

// ═══ 核心：Data-Owner Pattern + Composable Bridge ═══

// ═══════════════════════════════════════════════════════

//  - 不要用 v-for 渲染 CE 子元素，由 composable 通过 addTrack/addSegment 管理

//  - 用户拖拽创建/移动/删除段 → 事件 → composable 同步到 Vue 数据

//  - 外部修改 Vue 数据 → deep watch → composable 同步到 CE DOM

//

// ═══════════════════════════════════════════════════════



const containerRef = ref(null)



// 数据必须包含 id 字段供 composable 追踪身份

const tracks = ref([

  {

    id: 't1', label: '前端开发', start: '0', end: '24',

    segments: [

      { id: 's1', start: '2', end: '8',  label: '框架搭建', color: '#3498db' },

    ],

  },

])



// 一行建立双向同步

useTimelineSync(containerRef, tracks)



function addTrack() {

  tracks.value.push({

    id: crypto.randomUUID(),

    label: \`新任务 \${tracks.value.length + 1}\`,

    start: '0', end: '24', segments: [],

  })

`,



  null,  // Tab 5 — CRUD 权限



]



/**

 * 将自定义元素序列化为格式化 HTML 字符串

 * 仅序列化容器/轨道/段三层，跳过组件内部生成的非 custom element DOM

 */

const CUSTOM_TAGS = new Set(['time-line-container', 'time-line-track', 'time-line-segment'])

const ATTR_ALLOW = {

  'time-line-container': ['direction', 'axis-mode', 'shared-start', 'shared-end', 'shared-clip-range', 'label-h', 'label-v', 'tooltip-pos', 'type', 'unit', 'default-color', 'borderless', 'axis-label', 'creatable', 'editable', 'deletable', 'clearable', 'copyable'],

  'time-line-track': ['label', 'start', 'end', 'step', 'max-segments', 'default-color', 'creatable', 'editable', 'deletable', 'clearable', 'copyable'],

  'time-line-segment': ['start', 'end', 'label', 'color', 'tooltip', 'editable', 'deletable'],

}



function serializeCustomElement(el, indent = 0) {

  if (!el || el.nodeType !== 1) return ''

  const tag = el.tagName.toLowerCase()

  if (!CUSTOM_TAGS.has(tag)) return ''

  const pad = '  '.repeat(indent)

  const allowed = ATTR_ALLOW[tag] || []



  // 收集白名单属性 + loc-* / data-* 属性

  const attrParts = []

  for (const attr of el.attributes) {

    const n = attr.name

    if (n.startsWith('loc-') || n.startsWith('data-') || allowed.includes(n)) {

      // 布尔风格属性（值空）只输出属性名，不输出 =""
      attrParts.push(attr.value ? `${n}="${attr.value}"` : n)

    }

  }

  const attrStr = attrParts.length ? ' ' + attrParts.join(' ') : ''



  // 收集子自定义元素：

  // - time-line-track 的子 segment 在 .tlt-seg-area 中（_render 重新组织了 DOM）

  // - time-line-container 的子 track 是直接子元素

  const children = []

  if (tag === 'time-line-track') {

    // 段被组件移到了 .tlt-seg-area 内，反序列化时恢复为直接子元素

    const area = el.querySelector(':scope > .tlt-row > .tlt-body > .tlt-seg-area')

    if (area) {

      for (const child of area.children) {

        if (CUSTOM_TAGS.has(child.tagName.toLowerCase())) {

          children.push(serializeCustomElement(child, indent + 1))

        }

      }

    }

  } else {

    for (const child of el.children) {

      if (CUSTOM_TAGS.has(child.tagName.toLowerCase())) {

        children.push(serializeCustomElement(child, indent + 1))

      }

    }

  }



  if (children.length) {

    return `${pad}<${tag}${attrStr}>\n${children.join('\n')}\n${pad}</${tag}>`

  }

  return `${pad}<${tag}${attrStr}></${tag}>`

}



/** 获取当前标签页的 HTML 源码：Tab 0-2 从真实 DOM 序列化，Tab 3-4 使用模板字符串 */

function getHtmlSource(idx) {

  // Tab 3（模式示例）/ Tab 4（Vue 集成）使用静态模板

  if (idx === 3 || idx === 4 || idx === 6) return TAB_INNER_HTML[idx]



  // Tab 5（CRUD 权限）从真实 DOM 序列化，让控制台修改能反映到源码视图

  if (idx === 5) {

    const pane = document.querySelector('.tab-pane--stack.active')

    if (!pane) return TAB_INNER_HTML[idx]

    const containers_ = pane.querySelectorAll(':scope > .mode-example > time-line-container')

    return Array.from(containers_).map(c => serializeCustomElement(c)).join('\n\n')

  }



  const container = containers.value[idx]

  if (!container) return ''

  return serializeCustomElement(container)

}



/** 获取当前标签页的 JavaScript 源码，无则返回 null */

function getJsSource(idx) {
  // Tab 6 使用 VTimelineContainer 组件，JS 源码展示完整示例
  if (idx === 6) {
    return `// 引入 Vue 原生组件（非 Custom Elements）
import { ref } from 'vue'
import { VTimelineContainer } from '@ufo/timeline-track/vue'

const tracks = ref([
  {
    id: 't1', label: '功能开发', start: '0', end: '24',
    segments: [
      { id: 's1', start: 8, end: 12, label: '编码', color: '#3498db' },
    ],
  },
])

// 直接使用 v-model + v-for，无 Custom Elements 限制`
  }
  return TAB_JS_SOURCE[idx]
}



/** 当前标签页是否有 JS 源码（控制 JS tab 显隐） */

const hasJsSource = computed(() => getJsSource(activeTab.value) !== null)



/** Prism 高亮后的 HTML 源码（追踪 htmlRev，切视图时从真实 DOM 重新序列化） */

const currentHtmlCode = computed(() => {

  void htmlRev.value  // 依赖追踪：htmlRev +1 时计算属性失效、从真实 DOM 重算

  return Prism.highlight(getHtmlSource(activeTab.value), Prism.languages.html, 'html')

})



/** Prism 高亮后的 JS 源码 */

const currentJsCode = computed(() => {

  const src = getJsSource(activeTab.value)

  return src ? Prism.highlight(src, Prism.languages.javascript, 'javascript') : ''

})



function switchDemoView(view) {

  demoView.value = view

  codeCopied.value = false

  // 切到 HTML 视图时强制从真实 DOM 重新序列化，反映控制台修改

  if (view === 'html') htmlRev.value++

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

    // Tab 3 / Tab 5 使用多个独立容器（stack 布局），需特殊处理

    if (idx === 3 || idx === 5) {

      const containers3 = document.querySelectorAll('.tab-pane--stack.active time-line-container')

      requestAnimationFrame(() => {

        containers3.forEach(c => {

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



// 初始化：设置默认圆角 & 注册全局事件监听 & 启动 DOM 观察

onMounted(() => {

  nextTick(() => {

    containers.value.forEach(c => {

      if (c && c.setGlobalRadius) c.setGlobalRadius('0')

    })

    // 监听容器 DOM 变化（控制台修改实时同步到 HTML 源码视图）

    containers.value.forEach(c => {

      if (c) _domObserver.observe(c, { attributes: true, childList: true, subtree: true })

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



// 清理 DOM 观察器

onUnmounted(() => { _domObserver.disconnect() })

</script>

