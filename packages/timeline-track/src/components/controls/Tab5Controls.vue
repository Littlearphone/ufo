<template>
  <div>
    <!-- 添加轨道 -->
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[0] }" @click="toggle(0)">🎯 添加轨道</div>
      <div class="ctrl-body" v-show="state[0]">
        <div class="ctrl-row">
          <label><span class="ctrl-label">名称</span>
            <input type="text" v-model="newTrackLabel" placeholder="新任务">
          </label>
          <button class="primary" @click="doAddTrack">＋ 添加轨道</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addLog } from '../../stores/eventLog.js'
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(1, 0)

const emit = defineEmits(['addTrack'])
const newTrackLabel = ref('')

/** 添加轨道：通过 emit 触发 App.vue 的 addVueTrack，驱动 Vue 响应式更新 */
function doAddTrack() {
  const label = newTrackLabel.value.trim()
  emit('addTrack', label || '')
  newTrackLabel.value = ''
  addLog('track-add', label || '新任务')
}
</script>
