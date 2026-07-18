<template>
  <div class="panel controls-panel">
    <div class="log-head">
      <h2>🔧 控制台</h2>
      <button @click="handleReset">重置</button>
    </div>
    <div class="controls-scroll">

      <!-- ════ Tab 0: 基础操作 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 0 }">
        <Tab0Controls ref="tab0" :container="containers[0]" />
      </div>

      <!-- ════ Tab 1: 密集数据 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 1 }">
        <Tab1Controls :container="containers[1]" />
      </div>

      <!-- ════ Tab 2: API 调用 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 2 }">
        <Tab2Controls ref="tab2" :container="containers[2]" />
      </div>

      <!-- ════ Tab 3: 模式示例 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 3 }">
        <Tab3Controls :container="containers[3]" />
      </div>

      <!-- ════ Tab 4: Vue 3 集成 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 4 }">
        <Tab5Controls :config="vueConfig" :css-vars="vueCssVars" @add-track="$emit('addTrack', $event)" />
      </div>

      <!-- ════ Tab 5: CRUD 权限 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 5 }">
        <Tab6Controls :container="containers[5]" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Tab0Controls from './controls/Tab0Controls.vue'
import Tab1Controls from './controls/Tab1Controls.vue'
import Tab2Controls from './controls/Tab2Controls.vue'
import Tab3Controls from './controls/Tab3Controls.vue'
import Tab5Controls from './controls/Tab5Controls.vue'
import Tab6Controls from './controls/Tab6Controls.vue'

const props = defineProps({
  activeTab: { type: Number, required: true },
  containers: { type: Array, required: true },
  vueConfig: { type: Object, default: null },
  vueCssVars: { type: Object, default: null },
})
const emit = defineEmits(['addTrack', 'reset'])

const tab0 = ref(null)
const tab2 = ref(null)

function handleReset() {
  const idx = props.activeTab
  // Tab 0/2：有本地状态（下拉框等），通过 defineExpose 自处理
  const selfReset = { 0: tab0, 2: tab2 }
  const tab = selfReset[idx]?.value
  if (tab?.reset) { tab.reset(); return }
  // Tab 1/4/5：无本地状态，交由 App.vue 处理容器/数据重置
  emit('reset', idx)
}
</script>
