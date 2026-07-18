/**
 * 应用入口
 * 1. 导入并注册自定义元素组件库
 * 2. 挂载 Vue 3 演示 SPA
 *
 * Tab 切换通过 App 组件内部 ref + hash 手动同步，
 * 不引入 vue-router 以避免与 VTimelineContainer 响应式链产生递归更新。
 */
import { createApp } from 'vue'
import App from './App.vue'

// 导入自定义元素库（自动注册三个 Custom Element）
import '../lib/index.js'

import './style.css'
import '../vue/portal.css'
import '../vue/variables.css'

createApp(App).mount('#app')
