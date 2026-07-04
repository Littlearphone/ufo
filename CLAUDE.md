# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

时间线轨道组件（Timeline Track）—— 一个零框架依赖的原生 Web 组件库，基于 **Custom Elements v1** + **Pointer Events**，用于在时间轴上展示和交互操作时间段。

## 代码架构

**单文件架构**：`timeline-track/TimelineTrack.js`（~60KB，自执行 IIFE）

### 三个自定义元素

| 元素 | 职责 |
|---|---|
| `<time-line-container>` | 顶层容器，管理方向布局（横向/纵向）、共享轴模式、全局圆角 |
| `<time-line-track>` | 单条轨道，管理独立时间范围（start/end）、网格刻度、段碰撞检测 |
| `<time-line-segment>` | 时间段，支持拖拽移动、两端手柄调长度、悬停删除 |

**嵌套约束**：Segment 必须位于 Track 内，Track 必须位于 Container 内。

### 内部结构

- **CSS**：在 IIFE 内定义字符串常量，运行时通过 `ensureCSS()` 一次性注入 `<head>`
- **Tooltip**：全局 portal 模式，将 tooltip DOM 追加到 `document.body` 并使用 `position:fixed` 避免祖先 `overflow` 裁剪
- **网格绘制**：使用 `<canvas>` 在轨道体内绘制网格线，`ResizeObserver` 监听尺寸变化自动重绘
- **交互**：基于 Pointer Events（`pointerdown/move/up/cancel`），`setPointerCapture` 确保拖拽过程中不会丢失事件

### 事件系统（全部冒泡至 document）

| 事件 | 触发时机 | detail 载荷 |
|---|---|---|
| `segment-change` | 拖动/缩放中连续触发 | `{ segment, start, end }` |
| `segment-changed` | 拖动/缩放结束 | `{ segment, start, end }` |
| `segment-created` | 新段创建完成 | `{ segment }` |
| `segment-before-delete` | 删除前（可取消） | `{ segment }` |
| `segment-deleted` | 删除后 | `{ segment }` |

### 关键 API

Container：
- `addTrack(label, start, end, opts)` — 编程式创建轨道
- `removeTrack(track)` — 移除轨道
- `setGlobalRadius(val)` — 设置全局段圆角
- `allTracks()` — 获取所有轨道

Track：
- `addSegment(start, end, opts)` — 编程式创建时间段
- `sortedSegs()` — 按时间排序的所有段
- `px2Time(px)`, `time2Px(t)` — 像素与时间互转

### 渲染模式

- **独立轴模式**（默认 `axis-mode="per-track"`）：每条轨道独立绘制自己的时间轴刻度
- **共享轴模式**（`axis-mode="shared"`）：所有轨道共享同一时间范围，顶部/左侧显示粘性轴尺（sticky ruler），各轨道只画网格线不画标签

## 开发与测试

- **无构建步骤**：纯浏览器端运行，无需 npm install/bundler
- **测试方式**：直接在浏览器中打开 `timeline-track/examples.html`
- **项目结构**：
  ```
  ufo/
  └── timeline-track/
      ├── TimelineTrack.js   # 主组件库（唯一源代码文件）
      └── examples.html      # 多标签测试/演示页
  ```
- **浏览器兼容**：依赖 Custom Elements v1、Pointer Events、ResizeObserver、Canvas，需现代浏览器

## 开发约定

- 修改 JS 文件后直接刷新 `examples.html` 即可验证效果
- `examples.html` 中的 tabs 按功能主题组织（横向基础、纵向、共享轴、无标签等），新增功能应添加对应的演示 tab
- 所有用户可见文本同时支持中英文属性名（如 `direction` / `方向`）
- CSS 变量以 `--tlc-`（Container）、`--tlt-`（Track）、`--tls-`（Segment）为前缀
