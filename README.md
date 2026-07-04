# 🛸 UFO — 自定义元素组件库

基于 **Custom Elements v1** + **Pointer Events** 的原生 Web 组件库，零框架依赖。

采用 **pnpm workspace monorepo** 结构，每个组件独立构建发布。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-在线演示-4285f4?logo=githubpages&logoColor=white)](https://littlearphone.github.io/ufo/) [![AI Development](https://img.shields.io/badge/AI-Development%20Assistant-7c3aed?logo=openai&logoColor=white)](https://claude.ai)

---

## AI 开发声明

本项目在开发过程中使用了 **Claude（Anthropic）** 作为 AI 编程助手，通过 [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) 命令行工具生成部分代码，包括但不限于：

- 组件骨架代码与配置流程
- 工作流与 CI/CD 配置
- 文档编写与重构

所有 AI 生成代码均经过人工审核和测试验证，开发者对代码质量与安全性承担全部责任。

---

## 组件列表

| 组件 | 描述 | 演示 | 版本 |
|---|---|---|---|
| `@ufo/timeline-track` | 时间线轨道（拖拽创建/移动/缩放时间段） | [![Live Demo](https://img.shields.io/badge/演示-时间线轨道-34a853)](https://littlearphone.github.io/ufo/timeline-track/) | [![timeline-track](https://img.shields.io/github/v/tag/Littlearphone/ufo?filter=timeline-track*&label=)](https://github.com/Littlearphone/ufo/releases) |

---

## 快速开始

**环境要求：** Node.js ≥ 22.13、pnpm 11.6（项目通过 `packageManager` 字段锁定版本）

```bash
# 安装依赖（根目录）
pnpm install

# 开发单个组件（HMR 热更新）
cd packages/timeline-track && pnpm run dev

# 构建全部（demo + 库）
cd packages/timeline-track && pnpm run build:all

# 或从根目录构建所有组件
pnpm -r run build:all
```

### 构建产物

每个组件构建后产出两个文件：

| 文件 | 说明 | 用途 |
|---|---|---|
| `dist/<组件名>.js` | UMD 独立库 | 外部项目引入、npm 发布 |
| `dist/index.html` | 自包含演示页 | GitHub Pages 展示、浏览器直接打开 |

---

## GitHub Pages

每次推送到 `master`，Actions 自动将各组件演示部署到：

```
https://littlearphone.github.io/ufo/<组件名>/
```

点击组件名旁边的 **演示** 徽章即可一键打开。

---

## 发布流程

每个组件独立版本化，由 GitHub Actions 自动构建发布：

```bash
# 1. 打标签
git tag timeline-track@2.1.0

# 2. 推送
git push --tags

# 3. Actions 自动构建并创建 Draft Release → 审核后发布
```

Release 附件包含 `dist/*.js`（库文件）和 `dist/index.html`（演示页），可直接下载使用。

> 构建产物由 Actions 构建并附加到 Release，不提交到 git。

---

## 项目结构

```
ufo/
├── .github/
│   ├── workflows/
│   │   ├── deploy-pages.yml     # Pages 自动部署
│   │   └── release.yml          # Release 自动发布
│   └── scripts/
│       └── generate-root-index.mjs  # Pages 根索引生成
├── packages/
│   └── timeline-track/          # 时间线轨道组件
│       ├── src/lib/             #   Custom Elements 源码
│       ├── src/components/      #   Vue 3 演示组件
│       ├── index.html           #   唯一入口（开发/构建共用）
│       ├── vite.config.js       #   构建配置
│       ├── package.json         #   @ufo/timeline-track
│       └── dist/                #   构建产物（gitignored）
│           ├── TimelineTrack.js #   UMD 库
│           └── index.html       #   自包含 demo
├── pnpm-workspace.yaml
└── package.json
```

## 组件开发规范

- 所有用户可见文本支持中英文属性名（如 `direction` / `方向`）
- CSS 变量以 `--tlc-`（Container）、`--tlt-`（Track）、`--tls-`（Segment）为前缀
- 事件命名 kebab-case，统一冒泡到 `document`
- 新增组件时复制现有 `packages/*` 目录结构作为模板
