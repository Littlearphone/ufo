<template>
  <div class="ctrl-group">
    <div class="ctrl-header" :class="{ collapsed: !state[0] }" @click="toggle(0)">
      💡 集成模式
    </div>
    <div class="ctrl-body" v-show="state[0]">
      <p class="ctrl-desc">
        <strong>Data-Owner Pattern</strong> — Vue 拥有数据层，Custom Elements 负责渲染层。
      </p>
      <div class="ctrl-code ctrl-code-wrap"><code>// 1. 引入 composable
import { useTimelineSync } from '@ufo/timeline-track/composables/useTimelineSync'

// 2. 容器 ref + 响应式数据（含 id）
const containerRef = ref(null)
const tracks = ref([ ... ])

// 3. 一行建立双向同步
useTimelineSync(containerRef, tracks)</code></div>
      <p class="ctrl-desc" style="margin-top:6px">
        ⚠️ <strong>不要用 v-for</strong> 渲染轨道和段。
        CE 管理自身子 DOM，composable 通过 CE API 驱动。
      </p>
    </div>
  </div>

  <div class="ctrl-group">
    <div class="ctrl-header" :class="{ collapsed: !state[1] }" @click="toggle(1)">
      🔄 数据流
    </div>
    <div class="ctrl-body" v-show="state[1]">
      <div class="ctrl-row">
        <p style="font-size:10px;color:#546e7a;line-height:1.6">
          <strong>CE → Vue</strong><br>
          拖拽创建段 · 移动/调整 · 删除段 → CE 事件 → composable 更新 Vue 数据
        </p>
      </div>
      <div class="ctrl-row" style="margin-top:6px">
        <p style="font-size:10px;color:#546e7a;line-height:1.6">
          <strong>Vue → CE</strong><br>
          修改 tracks 数据 → deep watch → composable 调用 CE API 同步 DOM
        </p>
      </div>
      <div class="ctrl-row" style="margin-top:6px">
        <p style="font-size:10px;color:#546e7a;line-height:1.6">
          <strong>右侧面板</strong><br>
          显示与 CE 实时同步的 Vue 数据状态，拖拽段后可观察变化
        </p>
      </div>
    </div>
  </div>

  <div class="ctrl-group">
    <div class="ctrl-header" :class="{ collapsed: !state[2] }" @click="toggle(2)">
      📋 API 方法
    </div>
    <div class="ctrl-body" v-show="state[2]">
      <div class="ctrl-code ctrl-code-wrap"><code>// 添加轨道
tracks.value.push({
  id: crypto.randomUUID(),
  label: '新轨道',
  start: '0', end: '24',
  segments: [],
})

// 添加段
const track = tracks.value[0]
track.segments.push({
  id: crypto.randomUUID(),
  start: 6, end: 10,
  label: '新段',
  color: '#4285f4',
})</code></div>
      <p style="font-size:10px;color:#90a4ae;margin-top:4px">
        composable 会通过 deep watch 自动同步到 CE
      </p>
    </div>
  </div>
</template>

<script setup>
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(3, 0)
</script>
