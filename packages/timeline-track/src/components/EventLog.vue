<template>
  <div class="panel log-panel">
    <div class="log-head">
      <h2>📋 事件日志</h2>
      <button @click="clearLog">清空</button>
    </div>
    <div id="log" ref="logEl">
      <div v-for="(l, i) in logLines" :key="i" class="entry">
        <span class="ts">{{ l.ts }}</span>
        <span class="kind" :class="l.kind">{{ l.kind }}</span>
        {{ l.msg }}
        <span v-if="l.result" class="api-result">{{ l.result }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { clearLog, logLines } from '../stores/eventLog.js'

const logEl = ref(null)

// 自动滚动到底部
watch(logLines, () => {
  nextTick(() => {
    if (logEl.value) {
      logEl.value.scrollTop = logEl.value.scrollHeight
    }
  })
}, { deep: true })
</script>
