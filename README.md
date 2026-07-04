# 🛸 UFO — 自定义元素组件库

基于 **Custom Elements v1** + **Pointer Events** 的原生 Web 组件库，零框架依赖。

采用 **pnpm workspace monorepo** 结构，每个组件独立构建发布。

## 项目结构

```
ufo/
├── packages/
│   └── timeline-track/        # 时间线轨道组件
│       ├── src/lib/           #   Custom Elements 源码
│       ├── demo/              #   静态示例页（浏览器直接打开）
│       ├── dist/              #   构建产物（gitignored）
│       ├── index.html         #   Vite 开发入口
│       └── README.md          #   组件文档
├── .github/workflows/         # GitHub Actions 自动发布
├── pnpm-workspace.yaml
└── package.json
```

## 快速开始

```bash
# 安装依赖（根目录）
pnpm install

# 开发单个组件
cd packages/timeline-track && pnpm run dev

# 构建单个组件的独立库
cd packages/timeline-track && pnpm run build:lib   # → dist/TimelineTrack.js

# 构建所有组件
pnpm -r run build:lib
```

## 组件列表

| 组件 | 描述 | 目录 |
|---|---|---|
| `@ufo/timeline-track` | 时间线轨道（拖拽创建/移动/缩放时间段） | `packages/timeline-track/` |

## 发布流程

每个组件独立版本化，由 GitHub Actions 自动构建发布：

```bash
# 1. 打标签
git tag timeline-track@2.1.0

# 2. 推送
git push --tags

# 3. Actions 自动构建并创建 Draft Release → 审核后发布
```

> 构建产物由 Actions 构建并附加到 Release，不提交到 git。

## 组件开发规范

- 所有用户可见文本支持中英文属性名
- CSS 变量以 `--tlc-`（Container）、`--tlt-`（Track）、`--tls-`（Segment）为前缀
- 事件命名 kebab-case，统一冒泡到 `document`
- 修改源码后刷新对应 `demo/` 页面即可验证
