/**
 * 演示页共享常量与工具函数
 */

export const COLORS = [
  '#27ae60', '#e67e22', '#2980b9', '#8e44ad', '#c0392b',
  '#16a085', '#f39c12', '#1abc9c', '#e74c3c', '#2c3e50',
  '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#ff5722'
]

export const TAB_NAMES = ['基础操作', '密集数据', 'API 调用', '布局 / 共用轴']
export const TAB_DESCS = [
  '空白处<strong>拖拽</strong>创建段 · 拖拽段体<strong>移动</strong> · 拖拽两端<strong>调长度</strong> · 悬停 <strong>×</strong> 删除',
  '调节下方滑块，点击「生成数据」快速创建大量时间段，测试组件渲染与交互性能',
  '在右侧控制台调用组件编程 API：addTrack / addSegment / removeTrack 等',
  '多轨道使用<strong>共用时间轴</strong>对齐不同范围，切换方向与轴标签位置',
]

export function rand(min, max) { return min + Math.random() * (max - min) }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
