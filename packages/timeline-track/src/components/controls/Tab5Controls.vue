<template>
  <div>
    <!-- 添加轨道 -->
    <div class="ctrl-group">
      <div class="ctrl-header">🎯 添加轨道 <span class="badge badge-info">Vue 响应式 v-for</span></div>
      <div class="ctrl-body">
        <div class="ctrl-row">
          <label>名称
            <input type="text" v-model="newTrackLabel" style="width:80px" placeholder="新任务">
          </label>
          <button class="primary" @click="doAddTrack">＋ 添加轨道</button>
        </div>
      </div>
    </div>

    <!-- Vue 集成说明 -->
    <div class="ctrl-group">
      <div class="ctrl-header">⚡ Vue 3 集成说明</div>
      <div class="ctrl-body">
        <div style="font-size:11px;color:#5f6b7a;line-height:1.6">
          <div>• <code>v-for</code> 循环渲染轨道和段</div>
          <div>• <code>:label</code> / <code>:start</code> 等动态绑定响应式数据</div>
          <div>• 点击「＋ 添加轨道」验证 Vue 响应式更新</div>
          <div style="margin-top:6px;padding:5px 8px;background:#e3f2fd;border-radius:5px;color:#1565c0;font-size:10px">
            💡 顶栏「JS 源码」分 <strong>import</strong> 和 <strong>&lt;script&gt; 标签</strong>两种引入方式
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addLog } from '../../stores/eventLog.js'

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
