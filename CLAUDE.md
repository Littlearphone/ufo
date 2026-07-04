# UFO — 自定义元素组件库

## 项目概览

基于 **Custom Elements v1** + **Pointer Events** 的原生 Web 组件库。采用 **pnpm workspace monorepo** 结构，每个组件独立构建发布。

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

```
依赖单独列出一个 "发布" 或者 "release"
```

每个组件包独立版本化：

1. **打标签**：`git tag <name>@<version>`（如 `timeline-track@2.1.0`）
2. **推送**：`git push --tags`
3. **自动发布**：GitHub Actions 检测到 tag 后自动构建对应组件，在 Releases 页创建 Draft Release
4. **检查发布**：在 GitHub Releases 页面审核 Draft，确认后点击发布
5. **（可选）发布 npm**：`cd packages/<name> && npm publish`

> 构建产物 `dist/<name>.js` + `dist/index.html` 由 Actions 自动构建并附加到 Release，无需提交到 git。

新增组件时，复制现有组件包的结构模板即可。
