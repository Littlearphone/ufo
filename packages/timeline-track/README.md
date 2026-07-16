# ⏱ @ufo/timeline-track — 时间线轨道组件

原生 Web Component（Custom Elements v1 + Pointer Events），零框架依赖。
提供可拖拽的时间段轨道，支持**创建、移动、缩放、删除**时间段。支持时间/数值双模式。

## 快速体验

打开 `dist/index.html`（浏览器直接打开或部署到 GitHub Pages），包含 7 个标签页的多场景演示。

## 安装

```html
<script src="./dist/TimelineTrack.js"></script>
<!-- 或通过 npm -->
<!-- npm install @ufo/timeline-track -->
```

## 基本使用

```html
<time-line-container>
  <time-line-track label="摄像头-A" start="0" end="24" step="0.25">
    <time-line-segment start="6"  end="9"  label="早班值守" color="#27ae60"></time-line-segment>
    <time-line-segment start="14" end="15" label="超短时段" color="#e67e22"></time-line-segment>
  </time-line-track>
  <time-line-track label="摄像头-B" start="0" end="24" step="0.5">
    <time-line-segment start="8"  end="12" label="上午录像" color="#2980b9"></time-line-segment>
    <time-line-segment start="13" end="17" label="中班录像" color="#8e44ad"></time-line-segment>
  </time-line-track>
</time-line-container>
```

---

## `<time-line-container>` — 顶层容器

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `direction` | `horizontal` / `vertical` | `horizontal` | 轨道排列方向 |
| `axis-mode` | `per-track` / `shared` | `per-track` | 独立轴 / 共享轴 |
| `shared-start` | number | 各轨道最小 start | 共享轴范围起始 |
| `shared-end` | number | 各轨道最大 end | 共享轴范围结束 |
| `shared-clip-range` | 布尔 | — | 共享轴裁剪模式：段不超出自身轨道范围 |
| `borderless` | 布尔 | — | 共享轴模式下移除所有轨道边框 |
| `axis-label` | string | — | 轴尺标签文字（固定值，覆盖 loc-axis-range） |
| `type` | `time` / `number` | `time` | 值模式（时间 / 纯数值） |
| `unit` | `hour` / `minute` / `second` / `""` | `hour` | 显示单位和自然语言解析基准 |
| `step` | number | `0`（自由） | 全局默认吸附步长，各轨道可单独覆盖 |
| `default-color` | string | `#5c9ce6` | 新建段的默认颜色 |
| `max-segments` | number | `0`（无限制） | 全局默认最大段数 |
| `zoom-start` | number | — | 缩放视图起始 |
| `zoom-end` | number | — | 缩放视图结束 |
| `label-h` | `top` / `bottom` | `top` | 横向模式轴标签位置 |
| `label-v` | `left` / `right` | `left` | 纵向模式轴标签位置 |
| `tooltip-pos` | `<side>-<align>` | `top-center` | Tooltip 弹出位置 |
| `editable` | `false` | `true`（不设） | 是否允许编辑（拖拽修改属性） |
| `deletable` | `false` | `true`（不设） | 是否允许删除 |
| `creatable` | `false` | `true`（不设） | 是否允许创建新段 |
| `clearable` | `false` | `true`（不设） | 是否允许清空所有段 |
| `copyable` | `false` | `true`（不设） | 是否允许复制 |
| `loc-*` | string | 见 locale 默认值 | 覆盖用户可见文字（见下方 locale 表） |

### 方法

| 方法 | 说明 |
|---|---|
| `addTrack(label, start, end, opts?)` | 添加轨道，返回 `<time-line-track>` |
| `removeTrack(track)` | 删除轨道 |
| `allTracks()` | 获取所有轨道数组 |
| `getFormatter()` | 获取当前 ValueFormatter 实例 |
| `setGlobalRadius(radius)` | 设置所有段的圆角 |
| `zoomIn(centerRatio?)` | 放大 |
| `zoomOut(centerRatio?)` | 缩小 |
| `zoomTo(start, end)` | 缩放到指定范围 |
| `zoomReset()` | 重置缩放 |
| `zoomFit()` | 自适应缩放 |

### Tooltip 位置格式

`<side>-<align>`，共 12 种组合：
- `side`: `top` / `bottom` / `left` / `right`
- `align`: `start` / `center` / `end`
- 示例: `top-center`, `bottom-start`, `left-end`

---

## `<time-line-track>` — 单条轨道

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `label` | string | — | 轨道名称 |
| `start` | number | `0` | 时间范围起始 |
| `end` | number | `24` | 时间范围结束 |
| `step` | number | 继承容器 | 吸附步长（`0`=自由，不继承容器） |
| `min-duration` | number | 范围的 0.5% | 段最小持续时间 |
| `max-segments` | number | 继承容器 | 段数量上限 |
| `default-color` | string | 继承容器 | 新建段的默认颜色 |
| `editable` | `false` | 继承容器 | 是否允许编辑 |
| `deletable` | `false` | 继承容器 | 是否允许删除 |
| `creatable` | `false` | 继承容器 | 是否允许创建新段 |
| `clearable` | `false` | 继承容器 | 是否允许清空 |
| `copyable` | `false` | 继承容器 | 是否允许复制 |

> **步长 / CRUD 权限 / 默认颜色 均采用「轨道自身 → 容器」继承链。**
> 轨道未设属性时自动读取容器值，容器也未设时使用内置默认值。

### 方法

| 方法 | 说明 |
|---|---|
| `addSegment(start, end, opts?)` | 添加时间段，返回 `<time-line-segment>` |
| `sortedSegs()` | 按 start 排序的段数组 |
| `clearAllSegments()` | 清空本轨道所有段 |
| `px2Time(px)` | 像素值 → 值空间 |
| `time2Px(t)` | 值空间 → 像素值 |

---

## `<time-line-segment>` — 时间段

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `start` | number | — | 起始值 |
| `end` | number | — | 结束值 |
| `label` | string | — | 显示名称 |
| `color` | string | 轨道 `default-color` | 背景色 |
| `tooltip` | `auto` / `always` / `none` | `auto` | Tooltip 显示策略 |
| `editable` | `false` | 继承轨道 | 是否允许编辑（移动/调整大小） |
| `deletable` | `false` | 继承轨道 | 是否允许删除 |

### tooltip 属性说明

| 值 | 行为 |
|---|---|
| `auto`（默认） | 仅段内文字被截断时显示 tooltip |
| `always` | 始终显示 tooltip |
| `none` | 永不显示 tooltip |

### 交互行为

- 空白处拖拽 → 创建时间段
- 拖拽段体 → 移动位置（支持跨轨道拖拽）
- 拖拽段两端手柄 → 调整长度
- Ctrl + 拖拽段体 → 复制
- 悬停显示 × → 删除（段宽 < 28px 时自动隐藏）
- 太窄的段自动隐藏文字，hover 时 tooltip 查看完整内容
- 拖拽创建时 ghost 虚线框实时显示起止值

---

## 事件

所有事件冒泡到 `document`：

| 事件名 | 冒泡 | 可取消 | 说明 |
|---|---|---|---|
| `segment-created` | ✅ | — | 创建时间段 `detail: { segment }` |
| `segment-change` | ✅ | — | 拖拽移动/调整中（频繁触发） |
| `segment-changed` | ✅ | — | 拖拽完成 `detail: { segment, oldStart, oldEnd, oldTrack? }` |
| `segment-before-delete` | ✅ | ✅ | 段删除前（可阻止） `detail: { segment }` |
| `segment-deleted` | ✅ | — | 段已删除 `detail: { segment }` |
| `segment-limit-reached` | ✅ | — | 段数已达上限 `detail: { track, current, max }` |
| `segment-copy-error` | ✅ | — | Ctrl+拖拽复制失败 `detail: { message }` |
| `track-before-delete` | ✅ | ✅ | 轨道删除前（可阻止） `detail: { track }` |
| `track-deleted` | ✅ | — | 轨道已删除 `detail: { track }` |

---

## 共享轴模式

通过 `axis-mode="shared"` 启用，所有轨道共用同一轴尺和刻度，适合对比多个轨道的同一时段。

```html
<time-line-container axis-mode="shared" shared-start="0" shared-end="24">
  <time-line-track label="摄像头-A" start="0" end="24"></time-line-track>
  <time-line-track label="摄像头-B" start="0" end="24"></time-line-track>
</time-line-container>
```

### 裁剪模式

加 `shared-clip-range` 属性后，每个轨道的段只能在自身 `start~end` 范围内拖拽：

```html
<time-line-container axis-mode="shared" shared-start="0" shared-end="24" shared-clip-range>
  <time-line-track label="全天" start="0" end="24"><!-- 全范围 -->
  </time-line-track>
  <time-line-track label="机房" start="8" end="22"><!-- 仅 8~22 -->
  </time-line-track>
</time-line-container>
```

### 无边框模式

加 `borderless` 属性移除所有轨道边框，呈现无缝连续外观：

```html
<time-line-container axis-mode="shared" borderless>
```

### Hover 效果

共享轴模式下 hover 轨道时，整行（含头部 label）显示浅蓝背景 + 左侧蓝色高亮竖线。
可通过 `--tlc-axis-bg` 变量自定义轴尺行背景色。

---

## Locale 配置系统

所有用户可见文字通过 `loc-*` 属性在 `<time-line-container>` 上覆盖，未设置时使用内置默认值。

```html
<time-line-container loc-unnamed="Untitled" loc-modify-props="Edit">
```

| locale key | 属性名 | 默认值 | 说明 |
|---|---|---|---|
| `unnamed` | `loc-unnamed` | `未命名` | 轨道/段无标签时的回退名 |
| `invalidTime` | `loc-invalid-time` | `--:--` | 无效时间回退文字 |
| `deleteBtnTitle` | `loc-delete-btn-title` | `删除` | 删除按钮 title |
| `modifyProps` | `loc-modify-props` | `修改属性` | 右键菜单项 |
| `deleteTrack` | `loc-delete-track` | `删除轨道` | 右键菜单项 |
| `clearSegments` | `loc-clear-segments` | `清空时间段` | 右键菜单项 |
| `copySegment` | `loc-copy-segment` | `复制段` | 右键菜单项 |
| `copyTrack` | `loc-copy-track` | `复制轨道` | 右键菜单项 |
| `pasteSegment` | `loc-paste-segment` | `粘贴段` | 右键菜单项 |
| `pasteNewTrack` | `loc-paste-new-track` | `粘贴为新轨道` | 右键菜单项 |
| `pasteOverwrite` | `loc-paste-overwrite` | `覆盖粘贴到本轨道` | 右键菜单项 |
| `copyToTracks` | `loc-copy-to-tracks` | `复制到其他轨道…` | 右键菜单项 |
| `segmentEditTitle` | `loc-segment-edit-title` | `修改时间段属性` | 编辑弹窗标题 |
| `trackEditTitle` | `loc-track-edit-title` | `修改轨道属性` | 编辑弹窗标题 |
| `axisRange` | `loc-axis-range` | `{start} – {end}` | 共享轴尺标签模板 |
| `confirmDelete` | `loc-confirm-delete` | `确定删除` | 删除确认按钮 |
| `segmentOverlapError` | `loc-segment-overlap-error` | 见 CLAUDE.md | 段重叠异常消息 |
| …（完整列表见 [`CLAUDE.md`](../../CLAUDE.md#locale-配置系统)） | | | |

---

## 类型系统（type / unit）

通过 `type` 和 `unit` 属性切换时间/数值模式，支持自然语言输入：

```html
<!-- 百分比数值模式 -->
<time-line-container type="number" unit="%">
  <time-line-track label="进度" start="0%" end="100%">
    <time-line-segment start="0%" end="30%" label="需求" color="#3498db"></time-line-segment>
  </time-line-track>
</time-line-container>

<!-- 秒级精度 -->
<time-line-container type="time" unit="second">
  <time-line-track label="录制" start="0sec" end="3600sec">
    <time-line-segment start="0sec" end="600sec" label="开场" color="#27ae60"></time-line-segment>
  </time-line-track>
</time-line-container>
```

详见 [`DESIGN.md`](./DESIGN.md) 设计文档。

---

## CSS 变量

### 容器通用（`:root` 或 `time-line-container`）

| 变量 | 默认值 | 说明 |
|---|---|---|
| `--tlc-bg` | `#f8f9fb` | 容器背景色 |
| `--tlc-axis-bg` | `var(--tlc-bg)` | 共享轴尺行背景色 |
| `--tlc-border` | `#dfe3e8` | 容器边框色 |
| `--tlc-radius` | `0` | 容器圆角 |
| `--tlc-padding` | `14px 16px` | 容器内边距 |
| `--tlc-gap` | `10px` | 轨道间距 |
| `--tlc-primary` | `#4285f4` | 主色调（段默认色、hover 高亮） |
| `--tlc-danger` | `#e53935` | 危险色（删除按钮） |
| `--tlc-bg-card` | `#fff` | 轨道卡片背景 |
| `--tlc-bg-tooltip` | `rgba(30,35,42,.92)` | Tooltip 背景 |
| `--tlc-font` | `-apple-system, …` | 字体栈 |
| `--tlc-text` | `#333` | 文字颜色 |
| `--tlc-border-light` | `#e5e8ec` | 轨道分隔线色 |
| `--tlc-shadow-sm` | `0 1px 4px rgba(0,0,0,.2)` | 小阴影 |

### 轨道尺寸（`time-line-track`）

| 变量 | 默认值 | 模式 | 说明 |
|---|---|---|---|
| `--tlt-row-h` | `70px` | 横向 | 轨道最小高度 |
| `--tlt-row-w` | `150px` | 纵向 | 轨道宽度 |
| `--tlt-row-min-h` | `280px` | 纵向 | 轨道最小长度方向尺寸 |
| `--tlt-header-w` | `110px` | 横/纵向 | 头部 label 区宽度 |
| `--tlt-seg-top` | `18px` | 横向 | 段区顶部留白（轴标签） |
| `--tlt-seg-bottom` | `0px` | 横向 | 段区底部留白 |
| `--tlt-axis-gap` | `36px` | 纵向 | 段区左右边距（轴标签） |

### 段尺寸（`time-line-segment`）

| 变量 | 默认值 | 模式 | 说明 |
|---|---|---|---|
| `--tls-height` | `100%` | 横向 | 段高度（设 px 可控制条厚度） |
| `--tls-width` | `100%` | 纵向 | 段宽度（设 px 可控制条厚度） |

> 设 `--tls-height: 30px`（横向）或 `--tls-width: 24px`（纵向）可控制段条厚度，配合 `auto 0` / `0 auto` margin 自动居中。

---

## 开发

```bash
# 安装依赖（根目录）
pnpm install

# 开发服务器（HMR）
cd packages/timeline-track && pnpm run dev

# 构建库
pnpm run build:lib     # → dist/TimelineTrack.js

# 构建单文件 demo
pnpm run build         # → dist/index.html

# 构建全部
pnpm run build:all
```

## 构建产物

| 文件 | 格式 | 用途 |
|---|---|---|
| `dist/TimelineTrack.js` | UMD | 浏览器 / npm 发布 |
| `dist/index.html` | 自包含 HTML | GitHub Pages / 直接打开 |
