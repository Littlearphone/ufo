/**
 * 应用入口
 * 1. 导入并注册自定义元素组件库
 * 2. 挂载 Vue 3 演示 SPA
 */

import { createApp } from 'vue'
import App from './App.vue'

// 导入自定义元素库（自动注册三个 Custom Element）
import '../lib/index.js'

import './style.css'

createApp(App).mount('#app')
