# UFO — 自定义元素组件库

## 项目概览

基于 **Custom Elements v1** + **Pointer Events** 的原生 Web 组件库。采用 **pnpm workspace monorepo** 结构，每个组件独立构建发布。

- **Node.js** ≥ 22.13
- **pnpm** 11.6.0（通过 `package.json` 的 `packageManager` 字段锁定）

## 项目结构

```
ufo/                              # GitHub repo 根
├── pnpm-workspace.yaml           # 工作空间定义
├── package.json                  # 根 workspace
│
└── packages/
    ├── timeline-track/           # ▸ 时间线轨道组件
    │   ├── src/lib/              #   Custom Elements 源码（框架无关）
    │   │   ├── index.js          #   入口 & 注册
    │   │   ├── TimeContainer.js  #   <time-line-container>
    │   │   ├── TimeTrack.js      #   <time-line-track>
    │   │   ├── TimeSegment.js    #   <time-line-segment>
    │   │   ├── css.js            #   样式注入
    │   │   ├── tooltip.js        #   全局 Tooltip
    │   │   └── utils.js          #   工具函数
    │   ├── src/components/       #   Vue 3 演示组件
    │   ├── dist/
    │   │   ├── TimelineTrack.js  #   构建产物（UMD 库）
    │   │   └── index.html        #   构建产物（自包含 demo）
    │   ├── index.html            #   Vite 唯一入口（开发/构建共用）
    │   ├── vite.config.js        #   构建配置
    │   └── package.json          #   @ufo/timeline-track
    │
    └── 其他组件/                   # ▸ 未来新增组件（相同结构）
        ├── src/lib/
        ├── dist/
        │   ├── OtherModule.js    #   构建产物（UMD 库）
        │   └── index.html        #   构建产物（自包含 demo）
        ├── index.html
        ├── vite.config.js
        └── package.json
```

## 包管理（pnpm）

```bash
# 安装全部依赖（根目录执行）
pnpm install

# 开发单个组件
cd packages/timeline-track && pnpm run dev

# 构建单个组件的独立库
cd packages/timeline-track && pnpm run build:lib

# 构建单文件 demo（自包含 HTML）
cd packages/timeline-track && pnpm run build

# 构建全部（demo + 库）
cd packages/timeline-track && pnpm run build:all

# 构建所有组件
pnpm -r run build:all
```

## 组件开发规范

每个组件包遵循同一结构：

| 目录/文件 | 说明 |
|---|---|
| `src/lib/` | Custom Elements 源码，纯原生、零框架依赖 |
| `dist/TimelineTrack.js` | 构建产出的 UMD 独立库，**由 Actions 构建发布** |
| `dist/index.html` | 构建产出的自包含 demo 页面，**可 GH Pages / 直接打开** |
| `index.html` | Vite 唯一入口（开发 HMR + 构建共用） |
| `src/` (除 lib) | Vue 3 演示组件源码 |
| `vite.config.js` | `mode=lib` 输出 UMD 库；默认模式输出单文件 demo |
| `package.json` | 独立版本号，`build:all` 一次产出库 + demo |

### 自定义元素约定

- 所有用户可见文本支持中英文属性名（如 `direction` / `方向`）
- CSS 变量以 `--tlc-`（Container）、`--tlt-`（Track）、`--tls-`（Segment）为前缀
- 事件命名 kebab-case，统一冒泡到 document

## GitHub Release 策略

每个组件包独立版本化：

1. **打标签**：`git tag <name>@<version>`（如 `timeline-track@2.1.0`）
2. **推送**：`git push --tags`
3. **自动发布**：GitHub Actions 检测到 tag 后自动构建对应组件，在 Releases 页创建 Draft Release
4. **检查发布**：在 GitHub Releases 页面审核 Draft，确认后点击发布
5. **（可选）发布 npm**：`cd packages/<name> && npm publish`

> 构建产物 `dist/<name>.js` + `dist/index.html` 由 Actions 自动构建并附加到 Release，无需提交到 git。

新增组件时，复制现有组件包的结构模板即可。

## locale 配置系统

所有用户可见文本（按钮、弹窗标题、表单标签、提示文字等）集中定义在 `locale.js` 中，**不硬编码在业务代码里**。通过自定义元素的 `loc-*` 属性可覆盖任意文字（类似 Element Plus 的 `element-loading-text` 模式）。

### 用法

```html
<time-line-container
  loc-unnamed="Untitled"
  loc-modify-props="Edit"
  loc-delete-track="Delete Track"
  loc-cancel="Cancel"
  loc-confirm="OK"
>
  <time-line-track label="" start="0" end="24"></time-line-track>
</time-line-container>
```

所有 `loc-*` 属性均为可选，不设置时使用 `DEFAULT_LOCALE` 中的默认中文值。

### 完整配置项列表

属性名 = locale key 的驼峰转 kebab-case + `loc-` 前缀（如 `confirmDeleteTrack` → `loc-confirm-delete-track`）。

| locale key | 属性名 | 默认值 | 说明 |
|---|---|---|---|
| `unnamed` | `loc-unnamed` | `未命名` | 轨道/段无标签时的回退显示名 |
| `invalidTime` | `loc-invalid-time` | `--:--` | 无效时间回退文字 |
| `deleteBtnTitle` | `loc-delete-btn-title` | `删除` | 段上删除按钮的 title 提示 |
| `modifyProps` | `loc-modify-props` | `修改属性` | 右键菜单项 |
| `deleteTrack` | `loc-delete-track` | `删除轨道` | 右键菜单项 |
| `confirmDeleteTrack` | `loc-confirm-delete-track` | `确定要删除轨道「{name}」({range}) 吗？` | 删除轨道确认模板，支持 `{name}`/`{range}` 占位符 |
| `confirmDeleteSegment` | `loc-confirm-delete-segment` | `确定要删除时间段「{name}」({range}) 吗？` | 删除段确认模板 |
| `segmentEditTitle` | `loc-segment-edit-title` | `修改时间段属性` | 编辑段弹窗标题 |
| `trackEditTitle` | `loc-track-edit-title` | `修改轨道属性` | 编辑轨道弹窗标题 |
| `labelField` | `loc-label` | `标签` | 表单字段名 |
| `startTime` | `loc-start-time` | `开始时间` | 表单字段名 |
| `endTime` | `loc-end-time` | `结束时间` | 表单字段名 |
| `color` | `loc-color` | `颜色` | 表单字段名 |
| `name` | `loc-name` | `名称` | 表单字段名 |
| `step` | `loc-step` | `步长` | 表单字段名 |
| `maxSegmentsField` | `loc-max-segments` | `最大段数` | 表单字段名 |
| `zeroUnlimited` | `loc-zero-unlimited` | `0=无限制` | placeholder 文字 |
| `cancel` | `loc-cancel` | `取消` | 按钮文字 |
| `confirm` | `loc-confirm` | `确定` | 按钮文字 |
| `confirmDelete` | `loc-confirm-delete` | `确定删除` | 按钮文字 |
| `confirmDeleteTitle` | `loc-confirm-delete-title` | `确认删除` | 删除确认弹窗标题 |

### 设计要点

- locale key 驼峰命名，属性名自动映射为 `loc-` + kebab-case
- 模板字符串（`confirmDeleteTrack`/`confirmDeleteSegment`）使用 `{name}` 和 `{range}` 占位符
- 属性设置在 `time-line-container` 上，通过 `resolveLocale(el)` 函数向上查找容器并合并覆盖
- 运行时变更 `loc-*` 属性会触发子元素自动刷新文字（`_onLocaleChange()`）
