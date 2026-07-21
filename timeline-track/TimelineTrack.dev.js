(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.TimelineTrack = {}));
})(this, function(exports2) {
  "use strict";
  var __vite_style__ = document.createElement("style");
  __vite_style__.textContent = `/* ═══════════════════════════════════════════
   TimeLine 组件基本样式 + CSS 变量系统
   变量定义在 :root，用户可在 time-line-container 上覆盖
   ═══════════════════════════════════════════ */

/* ═══ CSS Variable Defaults ═══ */
:root {
  /* System (move from container) */
  --tlc-bg: #f8f9fb;
  --tlc-axis-bg: var(--tlc-bg);  /* 共享轴尺行背景，默认同容器背景 */
  --tlc-border: #dfe3e8;
  --tlc-radius: 0;
  --tlc-padding: 14px 16px;
  --tlc-gap: 10px;

  /* Brand */
  --tlc-primary: #4285f4;
  --tlc-primary-hover: #3b78e7;
  --tlc-primary-active: #3367d6;
  --tlc-danger: #e53935;
  --tlc-danger-hover: #d32f2f;
  --tlc-danger-active: #c62828;

  /* Surfaces */
  --tlc-bg-card: #fff;
  --tlc-bg-hover: #f0f2f5;
  --tlc-bg-active: #e8eaed;
  --tlc-bg-tooltip: rgba(30,35,42,.92);

  /* Text */
  --tlc-text: #333;
  --tlc-text-secondary: #555;
  --tlc-text-muted: #999;

  /* Borders */
  --tlc-border-input: #d0d4da;
  --tlc-border-light: #e5e8ec;

  /* Shadows */
  --tlc-shadow-sm: 0 1px 4px rgba(0,0,0,.2);
  --tlc-shadow-panel: 0 4px 20px rgba(0,0,0,.14);
  --tlc-shadow-modal: 0 12px 40px rgba(0,0,0,.18);

  /* Radii */
  --tlc-radius-sm: 3px;
  --tlc-radius-md: 4px;
  --tlc-radius-lg: 6px;

  /* Font */
  --tlc-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* Segment size defaults (defined here so container-level overrides inherit down correctly) */
  --tls-height: 100%;
  --tls-width: 100%;
}

/* ---- Container ---- */
time-line-container {
  display: flex;
  gap: var(--tlc-gap);
  background: var(--tlc-bg);
  border: 1px solid var(--tlc-border);
  border-radius: var(--tlc-radius);
  padding: var(--tlc-padding);
  font-family: var(--tlc-font);
  font-size: 13px;
  color: var(--tlc-text);
}
time-line-container[direction="vertical"] {
  flex-direction: row;
}
time-line-container:not([direction="vertical"]) {
  flex-direction: column;
}

/* ---- Track ---- */
time-line-track {
  display: block;
  --tlt-header-w: 110px;
  --tlt-row-h: 70px;
  --tlt-row-w: 150px;
  --tlt-row-min-h: 280px;
  --tlt-seg-top: 18px;
  --tlt-seg-bottom: 0px;
}
time-line-track .tlt-row {
  display: flex;
  align-items: stretch;
  background: var(--tlc-bg-card);
  border: 1px solid var(--tlc-border-light);
  border-radius: var(--tlc-radius);
  overflow: visible;
  min-height: var(--tlt-row-h);
}
time-line-track.vertical {
  display: flex;
  flex-direction: column;
}
time-line-track.vertical .tlt-row {
  flex-direction: column;
  flex: 1;
  width: var(--tlt-row-w);
  min-width: var(--tlt-row-w);
  min-height: var(--tlt-row-min-h);
}

time-line-track .tlt-head {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: var(--tlt-header-w);
  min-width: var(--tlt-header-w);
  padding: 6px 10px;
  background: #fafbfc;
  border-right: 1px solid var(--tlc-border-light);
  gap: 2px;
  user-select: none;
}
time-line-track.vertical .tlt-head {
  width: auto;
  min-width: auto;
  border-right: none;
  border-bottom: 1px solid var(--tlc-border-light);
  padding: 5px 8px;
}

time-line-track .tlt-head-label {
  font-weight: 600;
  font-size: 12px;
  color: #37474f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
time-line-track .tlt-head-range {
  font-size: 10px;
  color: #90a4ae;
}

time-line-track .tlt-body {
  position: relative;
  flex: 1;
  min-width: 0;
  background: #fdfdfd;
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='1.8' fill='%23444'/%3E%3Cline x1='10' y1='2' x2='10' y2='6' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='10' y1='14' x2='10' y2='18' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='2' y1='10' x2='6' y2='10' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='14' y1='10' x2='18' y2='10' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 10 10, crosshair;
  touch-action: none;
}
time-line-track.vertical .tlt-body {
  min-width: auto;
  min-height: 0;
}

time-line-track .tlt-grid-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
time-line-track .tlt-seg-area {
  position: absolute;
  top: var(--tlt-seg-top);
  bottom: var(--tlt-seg-bottom);
  left: 0;
  right: 0;
}
time-line-track.vertical .tlt-seg-area {
  --tlt-axis-gap: 36px;
  top: 0;
  bottom: 0;
  left: var(--tlt-axis-gap);
  right: 0;
}

/* ---- Segment ---- */
time-line-segment {
  position: absolute;
  display: block;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  z-index: 2;
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23fff' stroke-width='3.5' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23444' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3C/svg%3E") 10 10, grab;
  overflow: visible;
}
time-line-segment:hover { z-index: 4; }
time-line-segment.dragging { z-index: 12; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23fff' stroke-width='3.5' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' fill='%23444' stroke='none'/%3E%3C/svg%3E") 10 10, grabbing; }
time-line-segment.resizing { z-index: 12; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='6,12 11,5 11,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='18,12 13,5 13,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }
time-line-track.vertical time-line-segment.resizing { z-index: 12; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='12,6 5,11 19,11' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='12,18 5,13 19,13' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }

time-line-segment .tls-bar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--tlc-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: filter 0.12s, box-shadow 0.12s, border-radius 0.15s;
}
time-line-segment:hover .tls-bar       { filter: brightness(1.06); }
time-line-segment.dragging .tls-bar,
time-line-segment.resizing .tls-bar    { filter: brightness(1.10); box-shadow: 0 2px 14px rgba(0,0,0,.22); }

time-line-segment .tls-hdl {
  position: absolute;
  z-index: 3;
}
time-line-segment .tls-hdl-left  { left: -1.5px; top: 0; bottom: 0; width: 3px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='6,12 11,5 11,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='18,12 13,5 13,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }
time-line-segment .tls-hdl-right { right: -1.5px; top: 0; bottom: 0; width: 3px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='6,12 11,5 11,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='18,12 13,5 13,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }

time-line-segment .tls-hdl-bar {
  position: absolute;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: linear-gradient(to right, rgba(0,0,0,0.04), rgba(255,255,255,0.10));
  border-radius: var(--tlc-radius);
  opacity: 0;
  transition: opacity .14s;
  pointer-events: none;
}
time-line-segment .tls-hdl-left  .tls-hdl-bar { left: 0; width: 4px; border-right: 1px solid rgba(0,0,0,0.08); }
time-line-segment .tls-hdl-right .tls-hdl-bar { right: 0; width: 4px; border-left: 1px solid rgba(0,0,0,0.08); }
time-line-segment:hover .tls-hdl-bar              { opacity: 1; }
time-line-segment.dragging .tls-hdl-bar,
time-line-segment.resizing .tls-hdl-bar           { opacity: 0; }

time-line-track.vertical time-line-segment .tls-hdl-left  { left: 0; right: 0; top: -1.5px; bottom: auto; width: auto; height: 3px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='12,6 5,11 19,11' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='12,18 5,13 19,13' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }
time-line-track.vertical time-line-segment .tls-hdl-right { left: 0; right: 0; bottom: -1.5px; top: auto; width: auto; height: 3px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='12,6 5,11 19,11' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='12,18 5,13 19,13' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }

time-line-segment .tls-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  line-height: 1.25;
  text-shadow: 0 1px 2px rgba(0,0,0,.25);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 14px;
  min-width: 0;
}
time-line-segment .tls-label { font-weight: 600; }
time-line-segment .tls-time  { font-size: 10px; opacity: .82; }

time-line-segment .tls-del {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: rgba(0,0,0,.35);
  color: #fff;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  border-radius: 0 0 0 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity .12s;
}
time-line-segment .tls-del:hover {
  background: rgba(200,0,0,.7);
}
time-line-segment:hover .tls-del { opacity: 1; }
time-line-segment.dragging .tls-del,
time-line-segment.resizing .tls-del { opacity: 0; }
time-line-segment.tls-del-hidden .tls-del { display: none; }
time-line-segment.tls-text-hidden .tls-inner { visibility: hidden; }
time-line-segment.tls-selected .tls-bar { box-shadow: inset 0 0 0 2px rgba(255,255,255,.65); }

/* ── 选中模式：段表面扫光动画 ── */
/* 斜向亮条快速掠过段表面，模拟流水般的动态感 */
@keyframes tls-bar-shine {
  0%   { transform: translateX(-120%) skewX(-15deg); }
  100% { transform: translateX(320%) skewX(-15deg); }
}
time-line-segment.tls-active .tls-bar::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,.2) 35%,
    rgba(255,255,255,.45) 50%,
    rgba(255,255,255,.2) 65%,
    transparent
  );
  transform: translateX(-120%) skewX(-15deg);
  animation: tls-bar-shine 1.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

.tls-global-tip {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  opacity: 0;
  transition: opacity .15s;
  background: var(--tlc-bg-tooltip);
  color: #fff;
  padding: 5px 9px;
  border-radius: var(--tlc-radius);
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,.25);
}
.tls-global-tip.show { opacity: 1; }
.tls-global-tip::after {
  content: '';
  position: absolute;
  border: 5px solid transparent;
}
.tls-global-tip.top::after {
  top: 100%;
  border-top-color: var(--tlc-bg-tooltip);
  border-bottom: none;
  left: var(--tlc-arrow-left, 50%);
  transform: translateX(-50%);
}
.tls-global-tip.bottom::after {
  bottom: 100%;
  border-bottom-color: var(--tlc-bg-tooltip);
  border-top: none;
  left: var(--tlc-arrow-left, 50%);
  transform: translateX(-50%);
}
.tls-global-tip.left::after {
  left: 100%;
  border-left-color: var(--tlc-bg-tooltip);
  border-right: none;
  top: var(--tlc-arrow-top, 50%);
  transform: translateY(-50%);
}
.tls-global-tip.right::after {
  right: 100%;
  border-right-color: var(--tlc-bg-tooltip);
  border-left: none;
  top: var(--tlc-arrow-top, 50%);
  transform: translateY(-50%);
}
.tls-global-tip-label { font-weight: 600; }
.tls-global-tip-time  { opacity: .75; font-size: 10px; }

time-line-container { --tls-global-radius: 0; }

time-line-segment .tls-tip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--tlc-bg-tooltip);
  color: #fff;
  padding: 5px 9px;
  border-radius: var(--tlc-radius);
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity .15s;
  z-index: 20;
  box-shadow: 0 2px 8px rgba(0,0,0,.25);
}
time-line-segment .tls-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--tlc-bg-tooltip);
}
time-line-segment .tls-tip.show { opacity: 1; }
time-line-segment.dragging .tls-tip,
time-line-segment.resizing .tls-tip { opacity: 0 !important; }
time-line-segment .tls-tip-label { font-weight: 600; }
time-line-segment .tls-tip-time  { opacity: .75; font-size: 10px; }

.tlt-ghost {
  position: absolute;
  background: rgba(66,133,244,.18);
  border: 2px dashed var(--tlc-primary);
  border-radius: var(--tlc-radius);
  pointer-events: none;
  z-index: 20;
}

/* ── 拖拽创建段时 ghost 上的时间范围标签 ── */
.tlt-ghost-label {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tlc-bg-tooltip);
  color: #fff;
  padding: 2px 7px;
  border-radius: var(--tlc-radius);
  font-size: 10px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
}
time-line-track.vertical .tlt-ghost-label {
  top: 50%;
  left: auto;
  right: calc(100% + 8px);
  transform: translateY(-50%);
}

/* ── 跨轨道拖拽：目标轨道高亮 ── */
time-line-track.tlt-drag-over .tlt-row {
  box-shadow: inset 0 0 0 2px var(--tlc-primary);
  background: rgba(66,133,244,.04);
}
time-line-track.tlt-drag-over .tlt-body {
  background: rgba(66,133,244,.02);
}

/* ── 跨轨道拖拽浮层 ── */
.tlt-cross-ghost {
  transform: scale(0.92);
  opacity: 0;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease;
}
.tlt-cross-ghost.show {
  transform: scale(1);
  opacity: 0.7;
}
.tlt-cross-ghost.hide {
  transform: scale(0.88);
  opacity: 0;
  transition: transform 0.15s ease, opacity 0.12s ease;
}
.tlt-cross-ghost .tls-bar {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tlt-cross-ghost .tls-inner {
  color: #fff;
  font-size: 11px;
  line-height: 1.25;
  text-shadow: 0 1px 2px rgba(0,0,0,.25);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 14px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.tlt-cross-ghost .tls-label { font-weight: 600; }
.tlt-cross-ghost .tls-time  { font-size: 10px; opacity: .82; }

/* 成功落位闪光 */
@keyframes tlt-ghost-flash {
  0%   { filter: brightness(1); transform: scale(1); opacity: 0.92; }
  40%  { filter: brightness(1.25); transform: scale(1.04); opacity: 1; }
  100% { filter: brightness(1.6); transform: scale(0.7); opacity: 0; }
}
.tlt-cross-ghost.success {
  animation: tlt-ghost-flash 0.22s ease-out forwards;
  pointer-events: none;
}

.tlc-axis-ruler {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--tlc-axis-bg, var(--tlc-bg));
  border-radius: var(--tlc-radius);
  margin-bottom: 0;
}
.tlc-axis-ruler .tlc-axis-spacer {
  width: var(--tlt-header-w, 110px);
  min-width: var(--tlt-header-w, 110px);
  display: flex;
  align-items: center;
  padding: 0 10px;
}
.tlc-axis-ruler .tlc-axis-range {
  font-size: 10px;
  color: #90a4ae;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tlc-axis-ruler .tlc-axis-body {
  flex: 1;
  min-width: 0;
  position: relative;
  height: 22px;
}
.tlc-axis-ruler .tlc-axis-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;
}
time-line-container[direction="vertical"] .tlc-axis-ruler {
  top: auto;
  left: 0;
  flex-direction: column;
  width: 44px;
  min-width: 44px;
}
time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-spacer {
  width: auto;
  min-width: auto;
  height: 28px;
  min-height: 28px;
  padding: 0 4px;
  border-bottom: 1px solid #e0e3e8;
}
time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-range {
  display: none;
}
time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-body {
  height: auto;
  min-height: 0;
  flex: 1;
}
time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-canvas {
  width: 100%;
  height: 100%;
}

/* ── 共享轴模式：无边框模式（所有轨道边框完全去除） ── */
time-line-container[axis-mode="shared"][borderless] time-line-track .tlt-row {
  border: none !important;
  border-radius: 0 !important;
}
time-line-container[axis-mode="shared"][borderless] time-line-track .tlt-head {
  border-right: none !important;
}
time-line-container[axis-mode="shared"][borderless] time-line-track.vertical .tlt-head {
  border-bottom: none !important;
  border-right: none !important;
}
time-line-container[direction="vertical"][axis-mode="shared"][borderless] time-line-track .tlt-row {
  border: none !important;
}

/* ── 共享轴模式：轨道 hover 浮动框 ── */
/* 覆盖整行（含头部 label）的浅蓝半透明矩形 + 左侧蓝色高亮边框 */
.tlc-hover-float {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  background: rgba(66, 133, 244, 0.18);
  border-left: 3px solid var(--tlc-primary);
  pointer-events: none;
  z-index: 3;
  opacity: 0;
  transition: top 0.15s ease, height 0.15s ease, opacity 0.18s ease;
  box-sizing: border-box;
}
.tlc-hover-float.visible {
  opacity: 1;
}
time-line-container[direction="vertical"] .tlc-hover-float {
  left: 0;
  right: auto;
  top: 0;
  bottom: 0;
  width: 0;
  height: auto;
  border-left: 3px solid var(--tlc-primary);
  border-top: none;
  transition: left 0.15s ease, width 0.15s ease, opacity 0.18s ease;
}

/* ── 共享轴裁剪模式遮罩 ── */
time-line-track .tlt-clip-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
time-line-track .tlt-clip-overlay .tlt-clip-block {
  position: absolute;
  top: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    -45deg,
    rgba(160, 167, 175, 0.38) 0px,
    rgba(160, 167, 175, 0.38) 8px,
    rgba(180, 186, 192, 0.30) 8px,
    rgba(180, 186, 192, 0.30) 16px
  );
  border-right: 1px solid rgba(130, 138, 148, 0.5);
  pointer-events: none;
  transition: opacity 0.25s;
}
time-line-track .tlt-clip-overlay .tlt-clip-block + .tlt-clip-block {
  border-right: none;
  border-left: 1px solid rgba(130, 138, 148, 0.5);
}

/* ── 复制脉冲动画 ── */
@keyframes tlt-copy-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(66,133,244,.4); }
  50%  { box-shadow: 0 0 0 6px rgba(66,133,244,.15); }
  100% { box-shadow: 0 0 0 0 rgba(66,133,244,0); }
}
@keyframes tls-copy-pulse {
  0%   { box-shadow: inset 0 0 0 0 rgba(66,133,244,.5); }
  50%  { box-shadow: inset 0 0 0 3px rgba(66,133,244,.25); }
  100% { box-shadow: inset 0 0 0 0 rgba(66,133,244,0); }
}
time-line-track .tlt-row.tlt-copy-pulse {
  animation: tlt-copy-pulse .6s ease-out forwards;
}
time-line-segment.tls-copy-pulse .tls-bar {
  animation: tls-copy-pulse .6s ease-out forwards;
}
/* ═══════════════════════════════════════════
   右键菜单 & 模态框样式
   引用 :root 的 CSS 变量，用户可通过 time-line-container 覆盖
   ═══════════════════════════════════════════ */

/* ── Context Menu ── */
.tlc-context-menu {
  position: fixed;
  z-index: 100000;
  background: var(--tlc-bg-card);
  border: 1px solid var(--tlc-border);
  border-radius: var(--tlc-radius-md);
  box-shadow: var(--tlc-shadow-panel);
  padding: 4px 0;
  min-width: 148px;
  opacity: 0;
  pointer-events: none;
  font-family: var(--tlc-font);
  font-size: 12px;
  user-select: none;
}
.tlc-context-menu.show {
  opacity: 1;
  pointer-events: auto;
  animation: tlc-menu-in .18s cubic-bezier(.34, 1.4, .64, 1);
}
.tlc-context-menu.closing {
  animation: tlc-menu-out .12s ease-in forwards;
  pointer-events: none;
}

/* ── 右键菜单 Zoom Transition（类 iOS 启动 app 效果） ── */
/* 以 transform-origin 为锚点（JS 设为源元素中心），纯 scale 缩放 */
@keyframes tlc-menu-in {
  from { opacity: 0; transform: scale(0.2); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes tlc-menu-out {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.2); }
}
.tlc-context-item {
  padding: 7px 14px;
  cursor: pointer;
  color: var(--tlc-text);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background .09s;
  white-space: nowrap;
}
.tlc-context-item:hover {
  background: var(--tlc-bg-hover);
}
.tlc-context-item:active {
  background: var(--tlc-bg-active);
}
.tlc-context-header {
  padding: 7px 14px 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--tlc-text-muted);
  cursor: default;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
  white-space: nowrap;
  line-height: 1.4;
}
.tlc-context-item-danger {
  color: var(--tlc-danger);
}
.tlc-context-item-danger:hover {
  background: #fbe9e7;
}
.tlc-context-item-danger:active {
  background: #f5d0cc;
}
.tlc-context-divider {
  height: 1px;
  background: var(--tlc-bg-active);
  margin: 4px 0;
}

/* ── Modal Overlay ── */
.tlc-modal-overlay {
  position: fixed;
  z-index: 100001;
  inset: 0;
  background: rgba(0,0,0,.32);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
}
.tlc-modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}
.tlc-modal-overlay.closing {
  animation: tlc-overlay-out .13s ease-in forwards;
}
/* 无动效模式：动画禁用，直接显示/隐藏 */
.tlc-modal-overlay.tlc-modal-no-anim {
  transition: none;
}
.tlc-modal-overlay.tlc-modal-no-anim.closing {
  animation: none;
}

/* ── Modal Card ── */
.tlc-modal {
  background: var(--tlc-bg-card);
  border-radius: var(--tlc-modal-radius, 0);
  box-shadow: var(--tlc-shadow-modal);
  min-width: 300px;
  max-width: 420px;
  width: 90vw;
  font-family: var(--tlc-font);
  font-size: 13px;
  color: var(--tlc-text);
  transform-origin: 0 0;  /* 从左上角计算 transform，精确匹配源元素位置 */
}
.tlc-modal-overlay.show .tlc-modal {
  animation: tlc-modal-in .2s cubic-bezier(.34, 1.4, .64, 1) forwards;
}
.tlc-modal-overlay.closing .tlc-modal {
  animation: tlc-modal-out .2s ease-in forwards;
}
.tlc-modal-overlay.tlc-modal-no-anim.show .tlc-modal,
.tlc-modal-overlay.tlc-modal-no-anim.closing .tlc-modal {
  animation: none !important;
}

@keyframes tlc-overlay-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes tlc-modal-in {
  from { transform: translate(var(--tlc-modal-tx), var(--tlc-modal-ty)) scale(var(--tlc-modal-sx, .35), var(--tlc-modal-sy, .35)); }
  to { transform: translate(0, 0) scale(1, 1); }
}
@keyframes tlc-modal-out {
  from { transform: translate(0, 0) scale(1, 1); }
  to { transform: translate(var(--tlc-modal-tx), var(--tlc-modal-ty)) scale(var(--tlc-modal-sx, .35), var(--tlc-modal-sy, .35)); }
}
.tlc-modal-header {
  padding: 14px 18px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}
.tlc-modal-body {
  padding: 8px 18px 14px;
  max-height: 400px;
  overflow-y: auto;
}
.tlc-modal-body label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--tlc-text-secondary);
}
.tlc-modal-body label > span {
  min-width: 56px;
  flex-shrink: 0;
  text-align: right;
  color: #666;
}
.tlc-modal-body input {
  flex: 1;
  padding: 5px 9px;
  border: 1px solid var(--tlc-border-input);
  border-radius: var(--tlc-radius-sm);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color .12s, box-shadow .12s;
}
.tlc-modal-body input:focus {
  border-color: var(--tlc-primary);
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-modal-body input[type="color"] {
  min-height: 30px;
  padding: 2px 3px;
  cursor: pointer;
  flex: 0 0 48px;
}
.tlc-modal-body p {
  margin: 4px 0;
  font-size: 13px;
  color: #444;
  line-height: 1.5;
}
.tlc-modal-body .tlc-modal-hint {
  font-size: 11px;
  color: var(--tlc-text-muted);
  margin-top: -4px;
  margin-bottom: 8px;
}
.tlc-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 18px 14px;
}
.tlc-btn {
  padding: 6px 18px;
  border: 1px solid var(--tlc-border-input);
  border-radius: var(--tlc-radius-sm);
  background: var(--tlc-bg-card);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background .09s, border-color .09s;
  color: #444;
}
.tlc-btn:hover {
  background: #f5f6f8;
  border-color: #c0c5cc;
}
.tlc-btn:active {
  background: var(--tlc-bg-active);
}
.tlc-btn-primary {
  background: var(--tlc-primary);
  color: #fff;
  border-color: var(--tlc-primary);
}
.tlc-btn-primary:hover {
  background: var(--tlc-primary-hover);
  border-color: var(--tlc-primary-hover);
}
.tlc-btn-primary:active {
  background: var(--tlc-primary-active);
}
.tlc-btn-danger {
  background: var(--tlc-danger);
  color: #fff;
  border-color: var(--tlc-danger);
}
.tlc-btn-danger:hover {
  background: var(--tlc-danger-hover);
  border-color: var(--tlc-danger-hover);
}
.tlc-btn-danger:active {
  background: var(--tlc-danger-active);
}

/* ── Stepper Buttons ── */
.tlc-step-btns {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--tlc-border-input);
  border-radius: var(--tlc-radius-sm);
  flex-shrink: 0;
  overflow: hidden;
}
.tlc-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex: 1;
  min-height: 15px;
  border: none;
  border-radius: 0;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 7px;
  line-height: 1;
  padding: 0;
  color: var(--tlc-text-secondary);
  transition: background .09s;
  user-select: none;
  outline: none;
}
.tlc-step-btn:hover {
  background: var(--tlc-bg-active);
}
.tlc-step-btn:active {
  background: var(--tlc-border-input);
}
.tlc-step-btn + .tlc-step-btn {
  border-top: 1px solid #e0e3e8;
}

/* ── Stacked Form Fields ── */
.tlc-field {
  margin-bottom: 10px;
}
.tlc-field-label {
  display: block;
  margin-bottom: 3px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}
.tlc-field-input {
  display: block;
  width: 100%;
  padding: 5px 9px;
  border: 1px solid var(--tlc-border-input);
  border-radius: var(--tlc-radius-sm);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color .12s, box-shadow .12s;
  box-sizing: border-box;
}
.tlc-field-input:focus {
  border-color: var(--tlc-primary);
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-field-hint {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--tlc-text-muted);
}
.tlc-field-error {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--tlc-danger);
  line-height: 1.3;
  min-height: 0;
}
.tlc-field-error:empty {
  display: none;
}

/* ── Time Field Columns (per-unit, independent stepper) ── */
.tlc-tf-row {
  display: flex;
  align-items: stretch;
  gap: 3px;
  width: 100%;
}
.tlc-tf-col {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  position: relative;
}

/* ── Time Control: 各列统一外边框 ── */
.tlc-time-control .tlc-tf-col {
  border: 1px solid var(--tlc-border-input);
  border-radius: var(--tlc-radius-sm);
  overflow: hidden;
}
.tlc-time-control .tlc-tf-input {
  border: none;
  padding: 5px 9px;
  border-radius: 0;
  text-align: left;
}
.tlc-time-control .tlc-tf-steps {
  border: none;
  border-radius: 0;
}
.tlc-time-control .tlc-tf-col:focus-within {
  border-color: var(--tlc-primary);
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-time-control .tlc-tf-input:focus {
  box-shadow: none;
}
.tlc-time-control .tlc-tf-col.tlc-input-error {
  border-color: var(--tlc-danger);
  box-shadow: 0 0 0 2px rgba(229,57,53,.15);
}

.tlc-tf-input {
  width: 100%;
  min-width: 0;
  text-align: center;
  padding: 4px 22px 4px 2px;
  border: 1px solid var(--tlc-border-input);
  border-right: none;
  border-radius: var(--tlc-radius-sm) 0 0 var(--tlc-radius-sm);
  font-size: 15px;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  outline: none;
  box-sizing: border-box;
  -moz-appearance: textfield;
  transition: border-color .12s, box-shadow .12s;
  background: var(--tlc-bg-card);
}
.tlc-tf-input::-webkit-inner-spin-button,
.tlc-tf-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.tlc-tf-input:focus {
  border-color: var(--tlc-primary);
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
  z-index: 1;
  position: relative;
}
.tlc-tf-suffix {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 11px;
  color: var(--tlc-text-muted);
  user-select: none;
  pointer-events: none;
  line-height: 1;
  padding: 0 4px 0 4px;
}
.tlc-tf-colon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--tlc-text-secondary);
  user-select: none;
  padding: 0 1px;
}
.tlc-tf-steps {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--tlc-border-input);
  border-radius: 0 var(--tlc-radius-sm) var(--tlc-radius-sm) 0;
  overflow: hidden;
  flex-shrink: 0;
}
.tlc-tf-step {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 6px;
  line-height: 1;
  padding: 0 4px;
  min-height: 13px;
  color: var(--tlc-text-secondary);
  transition: background .09s;
  user-select: none;
  outline: none;
}
.tlc-tf-step:hover { background: var(--tlc-bg-active); }
.tlc-tf-step:active { background: var(--tlc-border-input); }
.tlc-tf-step + .tlc-tf-step { border-top: 1px solid #e0e3e8; }
.tlc-time-control .tlc-field-error { margin-top: 4px; }
.tlc-number-control .tlc-tf-steps { margin-left: 4px; }

/* ── Number Control: 输入框与步进统一外边框 ── */
.tlc-number-control .tlc-tf-row {
  border: 1px solid var(--tlc-border-input);
  border-radius: var(--tlc-radius-sm);
  overflow: hidden;
  gap: 0;
}
.tlc-number-control .tlc-tf-col {
  border: none;
  overflow: visible;
}
.tlc-number-control .tlc-field-input {
  border: none;
  border-radius: 0;
}
.tlc-number-control .tlc-tf-steps {
  border: none;
  border-radius: 0;
  margin-left: 0;
}
.tlc-number-control .tlc-tf-row:focus-within {
  border-color: var(--tlc-primary);
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-number-control .tlc-field-input:focus {
  box-shadow: none;
}
.tlc-number-control.tlc-input-error .tlc-tf-row,
.tlc-number-control .tlc-tf-row.tlc-input-error {
  border-color: var(--tlc-danger);
  box-shadow: 0 0 0 2px rgba(229,57,53,.15);
}

/* ── Color Picker with Presets ── */
.tlc-color-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tlc-color-control input[type="color"] {
  width: 36px;
  height: 26px;
  padding: 2px;
  border: 1px solid var(--tlc-border-input);
  border-radius: var(--tlc-radius-sm);
  cursor: pointer;
  box-sizing: border-box;
  flex-shrink: 0;
}
.tlc-color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}
.tlc-color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  border: 1.5px solid rgba(0,0,0,.10);
  cursor: pointer;
  padding: 0;
  outline: none;
  transition: transform .1s, box-shadow .1s;
  box-sizing: border-box;
}
.tlc-color-swatch:hover {
  transform: scale(1.25);
  box-shadow: 0 1px 5px rgba(0,0,0,.25);
  border-color: rgba(0,0,0,.2);
}
.tlc-color-swatch:active {
  transform: scale(1.08);
}

/* ── 输入框文字对齐切换（父元素添加 tlc-text-left / tlc-text-center）── */
.tlc-text-left .tlc-tf-input,
.tlc-text-left .tlc-field-input {
  text-align: left !important;
}
.tlc-text-center .tlc-tf-input,
.tlc-text-center .tlc-field-input {
  text-align: center !important;
}

/* ── 下拉快选面板 ── */
.tlc-tf-dropdown-panel {
  background: var(--tlc-bg-card, #fff);
  border: 1px solid var(--tlc-border, #dfe3e8);
  border-radius: var(--tlc-radius-sm, 4px);
  box-shadow: 0 4px 16px rgba(0,0,0,.15);
  max-height: 220px;
  overflow-y: auto;
  min-width: 90px;
  transform-origin: top center;
}

/* ── 下拉面板进场/退场动画 ── */
@keyframes tlc-dropdown-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tlc-dropdown-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-6px); }
}
/* 进场（lib 通过 panel-enter 类触发） */
.tlc-tf-dropdown-panel.panel-enter {
  animation: tlc-dropdown-in .15s ease-out;
}
/* 退场（lib 通过 closing 类触发） */
.tlc-tf-dropdown-panel.closing {
  animation: tlc-dropdown-out .12s ease-in forwards;
  pointer-events: none;
}
.tlc-tf-dropdown-item {
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  color: var(--tlc-text, #333);
  transition: background .09s;
  font-variant-numeric: tabular-nums;
}
.tlc-tf-dropdown-item:hover { background: #f0f4ff; }
.tlc-tf-dropdown-item.active,
.tlc-tf-dropdown-item:active {
  background: var(--tlc-primary, #4285f4);
  color: #fff;
}
/* 时间分列下拉居中，与 input text-align:center 对齐 */
.tlc-time-control .tlc-tf-dropdown-item {
  text-align: center;
}

/* ── 复制到其他轨道弹窗：轨道列表项 ── */
/* 用 .tlc-modal-body 前缀提升特异性，覆盖通用 .tlc-modal-body label > span 规则 */
.tlc-modal-body .tlc-copy-track-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  margin: 0;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
  border-radius: 6px;
  transition: background .09s;
  color: inherit;
}
.tlc-modal-body .tlc-copy-track-item:hover {
  background: #f5f7fa;
}
.tlc-modal-body .tlc-copy-track-item .tlc-copy-track-name,
.tlc-modal-body .tlc-copy-toggle-item .tlc-copy-track-name {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
  text-align: left;
  min-width: 0;
}
.tlc-modal-body .tlc-copy-track-item .tlc-copy-track-meta {
  font-size: 10px;
  color: #aab3bf;
  flex-shrink: 0;
  text-align: left;
  min-width: 0;
}
.tlc-modal-body .tlc-copy-track-item .tlc-copy-track-check,
.tlc-modal-body .tlc-copy-toggle-item .tlc-copy-track-check {
  width: 14px;
  height: 14px;
  min-width: 14px;
  border: 1.5px solid #cdd3db;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .1s;
  flex-shrink: 0;
  box-sizing: border-box;
}
.tlc-modal-body .tlc-copy-track-item:has(input:checked) .tlc-copy-track-check,
.tlc-modal-body .tlc-copy-toggle-item:has(input:checked) .tlc-copy-track-check {
  background: var(--tlc-primary);
  border-color: var(--tlc-primary);
}
.tlc-modal-body .tlc-copy-track-item:has(input:checked) .tlc-copy-track-check::after,
.tlc-modal-body .tlc-copy-toggle-item:has(input:checked) .tlc-copy-track-check::after {
  content: '✓';
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
}

/* ── 全选行 + 分割线 ── */
.tlc-copy-track-header {
  border-bottom: 1px solid #e8eaed;
  margin-bottom: 4px;
  padding-bottom: 4px;
}
.tlc-copy-toggle-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
  border-radius: 6px;
  transition: background .09s;
  color: inherit;
  margin: 0;
}
.tlc-copy-toggle-item:hover {
  background: #f5f7fa;
}
.tlc-copy-toggle-label {
  font-weight: 600;
  color: #37474f;
}
/*$vite$:1*/`;
  document.head.appendChild(__vite_style__);
  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const snap = (v, step) => step ? Math.round(v / step) * step : v;
  let _uidCounter = 0;
  function nextKey() {
    return `_k${(++_uidCounter).toString(36)}_${Date.now().toString(36)}`;
  }
  function h(tag, ...args) {
    const el = document.createElement(tag);
    let props = null;
    let children = args;
    if (args.length && args[0] != null && typeof args[0] === "object" && !Array.isArray(args[0]) && !(args[0] instanceof Node)) {
      props = args[0];
      children = args.slice(1);
    }
    if (props) {
      const { class: cls, style, ...attrs } = props;
      if (cls) el.className = Array.isArray(cls) ? cls.filter(Boolean).join(" ") : cls;
      if (style) {
        if (typeof style === "string") el.style.cssText = style;
        else Object.assign(el.style, style);
      }
      for (const key of Object.keys(attrs)) {
        const val = attrs[key];
        if (!val) continue;
        if (key.startsWith("on") && typeof val === "function") {
          el.addEventListener(key.slice(2).toLowerCase(), val);
        } else {
          el.setAttribute(key, String(val));
        }
      }
    }
    if (children.length) {
      _append(el, children.length === 1 && Array.isArray(children[0]) ? children[0] : children);
    }
    return el;
  }
  function _append(el, list) {
    for (const c of list) {
      if (c == null || c === false || c === true) continue;
      if (typeof c === "string" || typeof c === "number") {
        el.appendChild(document.createTextNode(String(c)));
      } else if (c instanceof Node) {
        el.appendChild(c);
      } else if (Array.isArray(c)) {
        _append(el, c);
      }
    }
  }
  const DEFAULT_LOCALE = {
    /** Fallback display name when a track/segment has no label */
    unnamed: "Untitled",
    /** Title tooltip on segment delete button */
    deleteBtnTitle: "Delete",
    /** Context menu item — edit properties */
    modifyProps: "Edit Properties",
    /** Context menu item — delete track */
    deleteTrack: "Delete Track",
    /** Context menu item — clear all segments */
    clearSegments: "Clear Segments",
    /** Track context menu header template, {name}=track name */
    trackMenuHeader: "📋 {name}",
    /** Segment context menu header template, {name}=segment name, {range}=time range */
    segmentMenuHeader: "🔖 {name}  {range}",
    /** Delete track confirmation template, {name}=track name, {range}=time range */
    confirmDeleteTrack: 'Delete track "{name}" ({range})?',
    /** Delete segment confirmation template */
    confirmDeleteSegment: 'Delete segment "{name}" ({range})?',
    /** Clear all segments confirmation template, {name}=track name */
    confirmClearSegments: 'Clear all segments in track "{name}"?',
    /* ---- Copy / Paste ---- */
    /** Context menu — copy segment */
    copySegment: "Copy Segment",
    /** Context menu — copy track */
    copyTrack: "Copy Track",
    /** Context menu — copy to other tracks */
    copyToTracks: "Copy to Other Tracks…",
    /** Context menu — paste segment */
    pasteSegment: "Paste Segment",
    /** Context menu — paste as new track */
    pasteNewTrack: "Paste as New Track",
    /** Context menu — paste and overwrite this track */
    pasteOverwrite: "Overwrite Paste to This Track",
    /** Copy-to-tracks dialog title, {name}=source track name */
    copyToTracksTitle: 'Copy segments from "{name}" to:',
    /** Copy-to-tracks dialog when no targets available */
    copyToTracksEmpty: "No available target tracks (target must be editable and different from source)",
    /** Select all */
    copySelectAll: "Select All",
    /** Segment count unit (e.g. "5 segments") */
    segmentUnit: "segments",
    /* ---- Edit Dialogs ---- */
    segmentEditTitle: "Edit Segment",
    trackEditTitle: "Edit Track",
    labelField: "Label",
    startTime: "Start Time",
    endTime: "End Time",
    rangeStart: "Start",
    rangeEnd: "End",
    color: "Color",
    name: "Name",
    step: "Step",
    maxSegmentsField: "Max Segments",
    zeroUnlimited: "0=Unlimited",
    /* ---- Buttons ---- */
    cancel: "Cancel",
    confirm: "OK",
    confirmDelete: "Delete",
    confirmDeleteTitle: "Confirm Delete",
    /* ---- Time units ---- */
    hourUnit: "h",
    minuteUnit: "m",
    secondUnit: "s",
    /* ---- Fallback text for invalid time ---- */
    invalidTime: "--:--",
    /* ---- Step hint ---- */
    stepHint: "Step {step} (click to adjust)",
    /* ---- Validation messages ---- */
    invalidValue: "Invalid value",
    startMustBeBeforeEnd: "Start must be before end",
    /**
     * Overlap hint shown below the field
     * Placeholder: {label}=conflicting segment name
     */
    overlapHint: 'Overlaps with "{label}"',
    /* ---- Axis ruler ---- */
    /**
     * Shared axis mode ruler label template.
     * Placeholders: {start}=shared start, {end}=shared end.
     * Set to empty string to hide the label.
     */
    axisRange: "{start} – {end}",
    /* ---- Error messages ---- */
    /**
     * addSegment segment overlap error template.
     * Placeholders: {start}/{end}=new segment range,
     * {label}=conflicting segment name,
     * {segStart}/{segEnd}=conflicting segment range.
     */
    segmentOverlapError: 'Segment overlap: new [{start}–{end}] conflicts with "{label}" [{segStart}–{segEnd}]'
  };
  function formatLocale(tpl, params) {
    return tpl.replace(/\{(\w+)\}/g, (_, k) => params[k] != null ? params[k] : `{${k}}`);
  }
  const KEY_TO_ATTR = {};
  for (const key of Object.keys(DEFAULT_LOCALE)) {
    const attr = "loc-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
    KEY_TO_ATTR[key] = attr;
  }
  const LOCALE_ATTRS = Object.freeze(Object.values(KEY_TO_ATTR));
  function resolveLocale(el, extra) {
    const c = el && el.closest ? el.closest("time-line-container") : null;
    const locale = { ...DEFAULT_LOCALE };
    if (c) {
      for (const key of Object.keys(DEFAULT_LOCALE)) {
        const val = c.getAttribute(KEY_TO_ATTR[key]);
        if (val != null) locale[key] = val;
      }
    }
    return locale;
  }
  function _p(n) {
    return String(Math.floor(n)).padStart(2, "0");
  }
  function _fmtHours(th, showSec, invalidStr) {
    if (th == null || isNaN(th)) return invalidStr || "--:--";
    const neg = th < 0;
    if (neg) th = -th;
    const h2 = Math.floor(th);
    const totalMin = Math.round((th - h2) * 60);
    if (showSec) {
      const totalSec = Math.round(th * 3600);
      const hh = Math.floor(totalSec / 3600);
      const mm = Math.floor(totalSec % 3600 / 60);
      const ss = totalSec % 60;
      return `${neg ? "-" : ""}${_p(hh)}:${_p(mm)}:${_p(ss)}`;
    }
    const m = totalMin;
    if (m === 60) return `${neg ? "-" : ""}${_p(h2 + 1)}:00`;
    return `${neg ? "-" : ""}${_p(h2)}:${_p(m)}`;
  }
  function _parseUnit(s) {
    const m = s.match(/^([\d.]+)\s*(h|hour|hours|min|mins|minute|minutes|sec|secs|second|seconds)$/i);
    if (!m) return null;
    const val = parseFloat(m[1]);
    if (isNaN(val)) return null;
    const raw = m[2].toLowerCase();
    let unit = "";
    if (raw === "h" || raw === "hour" || raw === "hours") unit = "hour";
    else if (raw.startsWith("mi")) unit = "minute";
    else if (raw.startsWith("se")) unit = "second";
    return { val, unit };
  }
  const TO_HOUR = { hour: 1, minute: 1 / 60, second: 1 / 3600 };
  const HOUR_TICKS = [
    1 / 120,
    // 30秒
    1 / 60,
    // 1分钟
    1 / 30,
    // 2分钟
    1 / 12,
    // 5分钟
    0.1,
    0.25,
    0.5,
    1,
    2,
    3,
    4,
    6,
    8,
    12,
    24,
    48
  ];
  function _ticksForUnit(unit) {
    if (unit === "hour") return HOUR_TICKS;
    const f = unit === "minute" ? 60 : 3600;
    return HOUR_TICKS.map((t) => +(t * f).toFixed(6));
  }
  const NUM_TICKS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1e3, 5e3, 1e4, 5e4, 1e5, 5e5, 1e6];
  class ValueFormatter {
    /**
     * @param {'hour'|'minute'|'second'|string} unit - 归一化/显示单位
     */
    constructor(unit = "") {
      this._unit = unit;
    }
    /** @returns {string} 当前单位 */
    get unit() {
      return this._unit;
    }
    /** 是否在格式中显示秒（默认 false，子类可覆盖） */
    get showSec() {
      return false;
    }
    set showSec(v) {
    }
    /**
     * 解析属性字符串 → 归一化数值
     * @param {string|number|null} str
     * @param {number} [fallback=0]
     * @returns {number}
     */
    parse(str, fallback = 0) {
      if (str == null || str === "") return fallback;
      if (typeof str === "number") return str;
      return this._doParse(String(str).trim(), fallback);
    }
    /**
     * 格式化数值 → 显示字符串
     * @param {number} val - 归一化数值
     * @param {'axis'|'segment'|'tooltip'|'editor'} [context='axis'] - 显示上下文
     * @returns {string}
     */
    format(val, context = "axis") {
      if (val == null || isNaN(val)) return "--:--";
      return this._doFormat(val, context);
    }
    /**
     * 格式化范围 → 显示字符串
     * @param {number} start
     * @param {number} end
     * @param {'axis'|'segment'|'tooltip'|'editor'} [context='axis']
     * @returns {string}
     */
    formatRange(start, end, context = "axis") {
      return this.format(start, context) + " – " + this.format(end, context);
    }
    /**
     * 计算合适的刻度步长
     * @param {number} range - 值范围（end - start）
     * @param {number} pxSize - 可用像素尺寸
     * @param {number} [targetPx=72] - 目标像素间隔
     * @returns {number} 步长
     */
    niceStep(range, pxSize, targetPx = 72) {
      if (!range || !pxSize) return 1;
      const raw = range / (pxSize / targetPx);
      return this._doNiceStep(raw);
    }
    /**
     * 编辑框输入属性
     * @param {number} val - 当前值
     * @returns {{ type: string, step?: string, value: string, [key: string]: string }}
     */
    inputAttrs(val) {
      return {
        type: this._doInputType(val),
        value: this._doInputValue(val),
        ...this._doInputStep ? { step: this._doInputStep(val) } : {}
      };
    }
    /**
     * 获取值的所有表示形式
     * 子类可覆盖以提供更多字段（如 TimeFormatter 返回 hours/minutes/seconds）
     * @param {number} val - 归一化数值
     * @returns {{ raw: number, formatted: string }}
     */
    resolve(val) {
      return {
        raw: val,
        formatted: this.format(val)
      };
    }
    /**
     * 获取段数据的所有表示形式——传入任意含 start/end 的对象，
     * 返回增强后的完整 detail 对象，可解构使用
     * @param {{ id?: *, start: number, end: number, label?: string, color?: string }} seg
     * @returns {{ start: number, end: number, startFormatted: string, endFormatted: string, duration: number, durationFormatted: string }}
     */
    resolveSegment(seg) {
      return {
        ...seg,
        start: seg.start,
        end: seg.end,
        startFormatted: this.format(seg.start),
        endFormatted: this.format(seg.end),
        duration: seg.end - seg.start,
        durationFormatted: this.format(seg.end - seg.start)
      };
    }
    /* ---- 子类实现 ---- */
    _doParse(str, fallback) {
      throw new Error("must implement _doParse");
    }
    _doFormat(val, context) {
      throw new Error("must implement _doFormat");
    }
    _doNiceStep(raw) {
      throw new Error("must implement _doNiceStep");
    }
    _doInputType(val) {
      throw new Error("must implement _doInputType");
    }
    _doInputValue(val) {
      throw new Error("must implement _doInputValue");
    }
    _doInputStep(val) {
      return void 0;
    }
  }
  class TimeFormatter extends ValueFormatter {
    /**
     * @param {'hour'|'minute'|'second'} [unit='second'] - 归一化单位
     */
    constructor(unit = "second") {
      super(unit);
      this._ticks = _ticksForUnit(unit);
      this._showSec = false;
    }
    /** showSec 不由 unit 自动决定，仅在 _doFormat 中 tooltip/editor 场景下受 unit 影响 */
    get showSec() {
      return this._showSec;
    }
    set showSec(v) {
      this._showSec = !!v;
    }
    /** 转换为小时（所有内部计算以小时为基准 */
    _toHours(val) {
      return val * (TO_HOUR[this._unit] || 1);
    }
    /** 从小时转换为当前单位 */
    _fromHours(hours) {
      return hours / (TO_HOUR[this._unit] || 1);
    }
    /* ---- 值转换（不受配置 unit 影响，始终返回绝对单位） ---- */
    /**
     * 转换为小时（始终返回小时数，与配置 unit 无关）
     * @param {number} val - 当前配置 unit 下的数值
     * @returns {number}
     */
    toHours(val) {
      return this._toHours(val);
    }
    /**
     * 转换为分钟（始终返回分钟数）
     * @param {number} val
     * @returns {number}
     */
    toMinutes(val) {
      return this._toHours(val) * 60;
    }
    /**
     * 转换为秒（始终返回秒数）
     * @param {number} val
     * @returns {number}
     */
    toSeconds(val) {
      return this._toHours(val) * 3600;
    }
    /**
     * 格式化为 HH:MM[:SS] 字符串
     * @param {number} val
     * @param {boolean} [showSec] - 是否显示秒；不传则按配置自动决定
     * @returns {string}
     */
    toFormatted(val, showSec) {
      return _fmtHours(this._toHours(val), showSec ?? this.showSec);
    }
    /**
     * 获取时间值的所有表示形式
     * @param {number} val
     * @returns {{ raw: number, hours: number, minutes: number, seconds: number, formatted: string }}
     */
    resolve(val) {
      const hours = this._toHours(val);
      return {
        raw: val,
        hours,
        minutes: hours * 60,
        seconds: hours * 3600,
        formatted: this.toFormatted(val)
      };
    }
    /**
     * 获取段数据的完整 detail 对象（可解构使用，含时分秒+格式化时间）
     * @param {{ id?: *, start: number, end: number, label?: string, color?: string }} seg
     * @returns {{
     *   start: number, end: number,
     *   startHours: number, startMinutes: number, startSeconds: number,
     *   startFormatted: string, startFormattedSec: string,
     *   endHours: number, endMinutes: number, endSeconds: number,
     *   endFormatted: string, endFormattedSec: string,
     *   duration: number, durationSeconds: number, durationFormatted: string
     * }}
     */
    resolveSegment(seg) {
      const s = this.resolve(seg.start);
      const e = this.resolve(seg.end);
      return {
        ...seg,
        start: seg.start,
        end: seg.end,
        startHours: s.hours,
        startMinutes: s.minutes,
        startSeconds: s.seconds,
        startFormatted: s.formatted,
        startFormattedSec: this.toFormatted(seg.start, true),
        endHours: e.hours,
        endMinutes: e.minutes,
        endSeconds: e.seconds,
        endFormatted: e.formatted,
        endFormattedSec: this.toFormatted(seg.end, true),
        duration: seg.end - seg.start,
        durationSeconds: this.toSeconds(seg.end - seg.start),
        durationFormatted: this.toFormatted(seg.end - seg.start, true)
      };
    }
    _doFormat(val, context) {
      const autoSec = this._unit === "second" && (context === "tooltip" || context === "editor");
      const showSec = this.showSec || autoSec;
      return _fmtHours(this._toHours(val), showSec);
    }
    _doParse(str, fallback) {
      const timeMatch = str.match(/^(-?)(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (timeMatch) {
        const [_, neg, h2, m, sec] = timeMatch;
        const hours = parseInt(h2, 10) + parseInt(m, 10) / 60 + (sec ? parseInt(sec, 10) / 3600 : 0);
        return this._fromHours(neg ? -hours : hours);
      }
      const unitResult = _parseUnit(str);
      if (unitResult) {
        return this._fromHours(unitResult.val * TO_HOUR[unitResult.unit]);
      }
      const n = parseFloat(str);
      return isNaN(n) ? fallback : n;
    }
    _doNiceStep(raw) {
      for (const t of this._ticks) if (raw <= t) return t;
      let p = this._ticks[this._ticks.length - 1];
      while (p < raw) p *= 2;
      return p;
    }
    _doInputType(val) {
      return this._unit === "second" ? "text" : "time";
    }
    _doInputValue(val) {
      return _fmtHours(this._toHours(val), this._unit === "second");
    }
    _doInputStep(val) {
      if (this._unit === "second") return void 0;
      return "360";
    }
  }
  class NumberFormatter extends ValueFormatter {
    /**
     * @param {string} [unit=''] - 显示单位后缀（如 "px"、"%"、"min"）
     */
    constructor(unit = "") {
      super(unit);
    }
    _doParse(str, fallback) {
      const unitResult = _parseUnit(str);
      if (unitResult) return unitResult.val;
      const numMatch = str.match(/^(-?[\d.]+)\s*.*$/);
      if (numMatch) {
        const n2 = parseFloat(numMatch[1]);
        return isNaN(n2) ? fallback : n2;
      }
      const n = parseFloat(str);
      return isNaN(n) ? fallback : n;
    }
    _doFormat(val, context) {
      if (context === "editor") {
        const formatted2 = parseFloat(val.toFixed(4)).toString();
        return formatted2;
      }
      const abs = Math.abs(val);
      let decimals = 0;
      if (abs < 1) decimals = 3;
      else if (abs < 10) decimals = 2;
      else if (abs < 100) decimals = 1;
      const formatted = parseFloat(val.toFixed(decimals)).toString();
      return this._unit ? `${formatted} ${this._unit}` : formatted;
    }
    _doNiceStep(raw) {
      for (const t of NUM_TICKS) if (raw <= t) return t;
      let p = NUM_TICKS[NUM_TICKS.length - 1];
      while (p < raw) p *= 10;
      return p;
    }
    /**
     * 获取数值的所有表示形式
     * @param {number} val
     * @returns {{ raw: number, formatted: string }}
     */
    resolve(val) {
      return {
        raw: val,
        formatted: this.format(val)
      };
    }
    _doInputType(val) {
      return "number";
    }
    _doInputValue(val) {
      return String(val);
    }
    _doInputStep(val) {
      const abs = Math.abs(val);
      if (abs < 1) return "0.1";
      if (abs < 10) return "0.5";
      if (abs < 100) return "1";
      return "10";
    }
  }
  function createFormatter$1(type = "time", unit = "second") {
    if (type === "number") {
      return new NumberFormatter(unit);
    }
    const validUnits = ["hour", "minute", "second"];
    return new TimeFormatter(validUnits.includes(unit) ? unit : "second");
  }
  class TimeContainer extends HTMLElement {
    constructor() {
      super();
      this._init = false;
      this._axisRuler = null;
      this._rulerResObs = null;
      this._formatter = null;
    }
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      this._formatter = createFormatter$1(this.type, this.unit);
      this._applyDir();
      this._syncAxisRuler();
      this.addEventListener("wheel", this._wheelZoom, { passive: false });
    }
    disconnectedCallback() {
      this.removeEventListener("wheel", this._wheelZoom);
      if (this._vrfRaf) cancelAnimationFrame(this._vrfRaf);
    }
    /** 模态框动效开关：默认 true（启用缩放动效），false 时直接显示/隐藏 */
    get modalAnimation() {
      return this.getAttribute("modal-animation") !== "false";
    }
    set modalAnimation(v) {
      this.toggleAttribute("modal-animation", v !== false && v !== "false");
    }
    static get observedAttributes() {
      return [
        "direction",
        "label-h",
        "label-v",
        "axis-mode",
        "shared-start",
        "shared-end",
        "shared-clip-range",
        "tooltip-pos",
        "max-segments",
        "type",
        "unit",
        "step",
        "default-color",
        "borderless",
        "axis-label",
        "zoom-start",
        "zoom-end",
        "editable",
        "deletable",
        "creatable",
        "clearable",
        "copyable",
        "selection-mode",
        "modal-animation",
        ...LOCALE_ATTRS
      ];
    }
    attributeChangedCallback(name, _ov, nv) {
      if (!this._init) return;
      if (name.startsWith("loc-")) {
        this.querySelectorAll("time-line-track, time-line-segment").forEach((el) => {
          if (el._onLocaleChange) el._onLocaleChange();
        });
        if (this._axisRuler) this._drawAxisRuler();
        return;
      }
      if (name === "tooltip-pos" || name === "step") return;
      if (name === "axis-label") {
        if (this._axisRuler) this._drawAxisRuler();
        return;
      }
      if (name === "editable" || name === "deletable" || name === "creatable" || name === "clearable" || name === "copyable") {
        this.querySelectorAll("time-line-track").forEach((t) => {
          if (t._onEditableChange) t._onEditableChange();
        });
        return;
      }
      if (name === "selection-mode") {
        if (nv == null) {
          this.querySelectorAll("time-line-segment.tls-active").forEach((s) => s.classList.remove("tls-active"));
        }
        return;
      }
      if (name === "type" || name === "unit") {
        this._formatter = createFormatter$1(this.type, this.unit);
        this._onSharedConfigChange();
        return;
      }
      if (name === "label-h" || name === "label-v") {
        this.querySelectorAll("time-line-track").forEach((t) => {
          if (t._onLabelPosChange) t._onLabelPosChange();
        });
      } else if (name === "axis-mode" || name === "shared-start" || name === "shared-end" || name === "shared-clip-range") {
        this._onSharedConfigChange();
      } else if (name === "zoom-start" || name === "zoom-end") {
        this._onViewRangeChange();
      } else {
        this._applyDir();
        this._syncAxisRuler();
        this.querySelectorAll("time-line-track").forEach((t) => {
          if (t._onDirChange) t._onDirChange();
        });
      }
    }
    get direction() {
      return this.getAttribute("direction") || "horizontal";
    }
    set direction(v) {
      this.setAttribute("direction", v);
    }
    /** 值模式：'time' | 'number' */
    get type() {
      return this.getAttribute("type") || "time";
    }
    set type(v) {
      this.setAttribute("type", v);
    }
    /** 归一化/显示单位：'hour' | 'minute' | 'second' | ''（自定义） */
    get unit() {
      return this.getAttribute("unit") || "second";
    }
    set unit(v) {
      if (v == null || v === "second") this.removeAttribute("unit");
      else this.setAttribute("unit", v);
    }
    /** 获取当前 Formatter 实例 */
    getFormatter() {
      if (!this._formatter) {
        this._formatter = createFormatter$1(this.type, this.unit);
      }
      return this._formatter;
    }
    /** 横向模式轴标签位置 */
    get labelH() {
      return this.getAttribute("label-h") || "top";
    }
    set labelH(v) {
      this.setAttribute("label-h", v);
    }
    /** 纵向模式轴标签位置 */
    get labelV() {
      return this.getAttribute("label-v") || "left";
    }
    set labelV(v) {
      this.setAttribute("label-v", v);
    }
    /* ---- Tooltip 位置 ---- */
    get tooltipPos() {
      return this.getAttribute("tooltip-pos") || "top-center";
    }
    set tooltipPos(v) {
      if (v == null) this.removeAttribute("tooltip-pos");
      else this.setAttribute("tooltip-pos", v);
    }
    /* ---- 共享轴模式 ---- */
    get axisMode() {
      return this.getAttribute("axis-mode") || "per-track";
    }
    set axisMode(v) {
      this.setAttribute("axis-mode", v);
    }
    /** 解析此容器的 locale（子元素可直接调用） */
    resolveLocale() {
      return resolveLocale(this);
    }
    get axisRulerActive() {
      return this.axisMode === "shared";
    }
    get sharedStart() {
      const v = this.getAttribute("shared-start");
      if (v != null) return this.getFormatter().parse(v, 0);
      const tracks = this.allTracks();
      if (!tracks.length) return 0;
      return Math.min(...tracks.map((t) => t.tStart));
    }
    set sharedStart(v) {
      this.setAttribute("shared-start", v);
    }
    get sharedEnd() {
      const v = this.getAttribute("shared-end");
      if (v != null) return this.getFormatter().parse(v, 24);
      const tracks = this.allTracks();
      if (!tracks.length) return 24;
      return Math.max(...tracks.map((t) => t.tEnd));
    }
    set sharedEnd(v) {
      this.setAttribute("shared-end", v);
    }
    /** 共享轴裁剪模式：段拖拽不超出各轨道自身范围 */
    get sharedClipRange() {
      return this.hasAttribute("shared-clip-range");
    }
    set sharedClipRange(v) {
      this.toggleAttribute("shared-clip-range", v);
    }
    /* ---- 公共 API ---- */
    /** 全局默认最大段数（各轨道可单独覆盖） */
    get maxSegments() {
      const v = this.getAttribute("max-segments");
      if (v != null) {
        const n = parseInt(v, 10);
        return n > 0 ? n : 0;
      }
      return 0;
    }
    set maxSegments(v) {
      if (v == null || v <= 0) this.removeAttribute("max-segments");
      else this.setAttribute("max-segments", String(v));
    }
    /** 全局默认步长（各轨道可单独覆盖，无自身 step 属性的轨道会回退到此值） */
    get step() {
      const v = this.getAttribute("step");
      return v != null ? this.getFormatter().parse(v, 0) : 0;
    }
    set step(v) {
      if (v == null || v <= 0) this.removeAttribute("step");
      else this.setAttribute("step", String(v));
    }
    /* ---- 可编辑/可删除（各轨道可单独覆盖） ---- */
    /** 是否允许编辑（拖拽创建/移动/调整/修改属性），默认 true */
    get editable() {
      return this.getAttribute("editable") !== "false";
    }
    set editable(v) {
      if (v == null) this.removeAttribute("editable");
      else this.setAttribute("editable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许删除（删除按钮/菜单项），默认 true */
    get deletable() {
      return this.getAttribute("deletable") !== "false";
    }
    set deletable(v) {
      if (v == null) this.removeAttribute("deletable");
      else this.setAttribute("deletable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许清空段（右键菜单"清空时间段"），默认 true */
    get clearable() {
      return this.getAttribute("clearable") !== "false";
    }
    set clearable(v) {
      if (v == null) this.removeAttribute("clearable");
      else this.setAttribute("clearable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许复制（段/轨道复制菜单项），默认 true */
    get copyable() {
      return this.getAttribute("copyable") !== "false";
    }
    set copyable(v) {
      if (v == null) this.removeAttribute("copyable");
      else this.setAttribute("copyable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许创建新内容（拖拽创建新段），默认 true */
    get creatable() {
      return this.getAttribute("creatable") !== "false";
    }
    set creatable(v) {
      if (v == null) this.removeAttribute("creatable");
      else this.setAttribute("creatable", v === false || v === "false" ? "false" : "true");
    }
    /** 选中模式：点击段切换选中状态而非拖拽，默认关闭 */
    get selectionMode() {
      return this.hasAttribute("selection-mode");
    }
    set selectionMode(v) {
      this.toggleAttribute("selection-mode", !!v);
    }
    /* ---- 缩放（视图范围） ---- */
    /** 视图起始（缩小范围 = 放大；null = 禁用缩放，使用默认范围） */
    get zoomStart() {
      const v = this.getAttribute("zoom-start");
      return v != null ? this.getFormatter().parse(v, null) : null;
    }
    set zoomStart(v) {
      if (v == null) this.removeAttribute("zoom-start");
      else this.setAttribute("zoom-start", String(+(+v).toFixed(4)));
    }
    /** 视图结束 */
    get zoomEnd() {
      const v = this.getAttribute("zoom-end");
      return v != null ? this.getFormatter().parse(v, null) : null;
    }
    set zoomEnd(v) {
      if (v == null) this.removeAttribute("zoom-end");
      else this.setAttribute("zoom-end", String(+(+v).toFixed(4)));
    }
    /** 最小缩放范围（防止无限放大），默认内容总范围的 0.3% */
    get minZoomRange() {
      const attr = this.getAttribute("min-zoom-range");
      if (attr != null) {
        const v = this.getFormatter().parse(attr, 0);
        if (v > 0) return v;
      }
      const total = this.sharedEnd - this.sharedStart;
      return Math.max(total * 3e-3, 0.01);
    }
    set minZoomRange(v) {
      if (v == null) this.removeAttribute("min-zoom-range");
      else this.setAttribute("min-zoom-range", String(v));
    }
    /** 最大缩放范围（防止缩小超出内容范围），默认内容总范围 + 20% padding */
    get maxZoomRange() {
      const attr = this.getAttribute("max-zoom-range");
      if (attr != null) {
        const v = this.getFormatter().parse(attr, 0);
        if (v > 0) return v;
      }
      const total = this.sharedEnd - this.sharedStart;
      return total * 1.2;
    }
    set maxZoomRange(v) {
      if (v == null) this.removeAttribute("max-zoom-range");
      else this.setAttribute("max-zoom-range", String(v));
    }
    /** 轴尺渲染所用范围（优先使用缩放视图） */
    _axisRange() {
      if (this.zoomStart != null && this.zoomEnd != null) {
        return { start: this.zoomStart, end: this.zoomEnd };
      }
      return { start: this.sharedStart, end: this.sharedEnd };
    }
    /** 获取所有轨道 */
    allTracks() {
      return Array.from(this.querySelectorAll(":scope > time-line-track"));
    }
    /** 编程式创建轨道 */
    addTrack(label, start, end, opts = {}) {
      const t = document.createElement("time-line-track");
      t.setAttribute("label", label || "");
      t.setAttribute("start", String(start ?? 0));
      t.setAttribute("end", String(end ?? 24));
      if (opts.step) t.setAttribute("step", String(opts.step));
      if (opts.minDuration) t.setAttribute("min-duration", String(opts.minDuration));
      if (opts.maxSegments) t.setAttribute("max-segments", String(opts.maxSegments));
      if (opts.editable != null) t.editable = opts.editable;
      if (opts.deletable != null) t.deletable = opts.deletable;
      if (opts.clearable != null) t.clearable = opts.clearable;
      if (opts.copyable != null) t.copyable = opts.copyable;
      if (opts.creatable != null) t.creatable = opts.creatable;
      this.appendChild(t);
      return t;
    }
    /** 移除轨道 */
    removeTrack(track) {
      track.remove();
    }
    /* ---- 缩放 API ---- */
    /** 以指定（或鼠标位置）为中心放大一步 */
    zoomIn(centerRatio = 0.5) {
      this._zoomAtRatio(centerRatio, 1 / 1.2);
    }
    /** 以指定（或鼠标位置）为中心缩小一步 */
    zoomOut(centerRatio = 0.5) {
      this._zoomAtRatio(centerRatio, 1.2);
    }
    /**
     * 缩放到指定范围
     * @param {number} start - 视图起始
     * @param {number} end - 视图结束
     */
    zoomTo(start, end) {
      this.zoomStart = start;
      this.zoomEnd = end;
    }
    /** 重置缩放：清除 zoom-start/zoom-end，恢复默认视图范围 */
    zoomReset() {
      this.removeAttribute("zoom-start");
      this.removeAttribute("zoom-end");
    }
    /** 缩放到适合所有内容（重置 + 若共享模式则自动计算全范围） */
    zoomFit() {
      this.zoomReset();
    }
    /**
     * 在给定比例位置执行缩放
     * @param {number} ratio - 缩放中心在视图中的比例（0~1）
     * @param {number} factor - 缩放系数（>1 缩小，<1 放大）
     */
    _zoomAtRatio(ratio, factor) {
      const vs = this.zoomStart != null ? this.zoomStart : this.sharedStart;
      const ve = this.zoomEnd != null ? this.zoomEnd : this.sharedEnd;
      const range = ve - vs;
      if (!range) return;
      const center = vs + ratio * range;
      const newRange = range * factor;
      const minR = this.minZoomRange;
      const maxR = this.maxZoomRange;
      if (newRange < minR || newRange >= maxR) return;
      const ss = this.sharedStart;
      const se = this.sharedEnd;
      let newStart = center - newRange * ratio;
      let newEnd = center + newRange * (1 - ratio);
      if (newStart < ss) {
        newEnd = Math.min(newEnd + (ss - newStart), se);
        newStart = ss;
      }
      if (newEnd > se) {
        newStart = Math.max(newStart - (newEnd - se), ss);
        newEnd = se;
      }
      this.zoomStart = newStart;
      this.zoomEnd = newEnd;
    }
    /** 视图范围变更：刷新轴尺 + 所有轨道 */
    _onViewRangeChange() {
      const doDraw = () => {
        if (this._axisRuler) this._drawAxisRuler();
        this.allTracks().forEach((t) => {
          if (t._onViewRangeChange) t._onViewRangeChange();
        });
      };
      if (this._vrfRaf) cancelAnimationFrame(this._vrfRaf);
      this._vrfRaf = requestAnimationFrame(doDraw);
    }
    /**
     * 滚轮事件处理（Ctrl/Meta+滚轮 = 缩放，纯滚轮 = 滚动）
     * 使用 passive:false 以允许 preventDefault 阻止浏览器页面缩放
     */
    _wheelZoom(e) {
      const isZoom = e.ctrlKey || e.metaKey;
      if (!isZoom) return;
      e.preventDefault();
      const isV = this.direction === "vertical";
      const tracks = this.allTracks();
      if (!tracks.length) return;
      let areaRect = null;
      const hovered = document.elementFromPoint(e.clientX, e.clientY);
      if (hovered) {
        const track = hovered.closest("time-line-track");
        if (track && tracks.includes(track)) {
          const area = track.querySelector(":scope > .tlt-row > .tlt-body > .tlt-seg-area");
          if (area) areaRect = area.getBoundingClientRect();
        }
      }
      if (!areaRect) {
        const first = tracks[0].querySelector(":scope > .tlt-row > .tlt-body > .tlt-seg-area");
        if (first) areaRect = first.getBoundingClientRect();
      }
      if (!areaRect || !areaRect.width || !areaRect.height) return;
      const cp = isV ? e.clientY - areaRect.top : e.clientX - areaRect.left;
      const dim = isV ? areaRect.height : areaRect.width;
      const ratio = clamp(cp / dim, 0, 1);
      const FACTOR = 1.2;
      const factor = e.deltaY > 0 ? FACTOR : 1 / FACTOR;
      this._zoomAtRatio(ratio, factor);
    }
    /** 设置全局段圆角 */
    setGlobalRadius(val) {
      this._globalRadius = val;
      this.querySelectorAll("time-line-segment").forEach((seg) => {
        const bar = seg.querySelector(":scope > .tls-bar");
        if (bar) bar.style.borderRadius = val;
      });
    }
    getGlobalRadius() {
      return this._globalRadius || "0";
    }
    /* ---- 共享轴模式 ---- */
    _onSharedConfigChange() {
      this._syncAxisRuler();
      this.allTracks().forEach((t) => {
        if (t._onSharedConfigChange) t._onSharedConfigChange();
      });
    }
    /* ---- 粘性轴尺管理 ---- */
    /** 清除轴尺的 ResizeObserver 并移除 DOM */
    _cleanupRuler() {
      if (this._rulerResObs) {
        this._rulerResObs.disconnect();
        this._rulerResObs = null;
      }
      if (this._axisRuler) {
        this._axisRuler.remove();
        this._axisRuler = null;
      }
    }
    _syncAxisRuler() {
      if (this.axisRulerActive) {
        const isVertical = this.direction === "vertical";
        const staleDir = this._axisRuler && this._axisRuler.classList.contains("vertical") !== isVertical;
        if (!this._axisRuler || !this._axisRuler.isConnected || staleDir) {
          this._cleanupRuler();
          this._createAxisRuler();
        }
        if (!this._hoverFloat) {
          this._hoverFloat = document.createElement("div");
          this._hoverFloat.className = "tlc-hover-float";
          this.appendChild(this._hoverFloat);
        }
        this.style.position = "relative";
        if (!this._hoverTracked) {
          this._hoverTracked = true;
          this.addEventListener("mouseenter", this._onContainerEnter = () => {
            if (this._hoverFloat) this._hoverFloat.classList.add("visible");
          }, { passive: true });
          this.addEventListener("mouseleave", this._onContainerLeave = () => {
            if (this._hoverFloat) this._hoverFloat.classList.remove("visible");
          }, { passive: true });
          this._onTrackMouseOver = (e) => {
            const track = e.target.closest("time-line-track");
            if (track) this._updateHoverFloat(track);
          };
          this.addEventListener("mouseover", this._onTrackMouseOver, { passive: true });
        }
        requestAnimationFrame(() => this._drawAxisRuler());
        this.style.setProperty("--tlc-gap", "0");
        this.style.setProperty("--tlc-padding", "0");
        this.style.overflowX = isVertical ? "" : "hidden";
      } else {
        this._cleanupRuler();
        this.style.removeProperty("position");
        if (this._hoverFloat) {
          this._hoverFloat.remove();
          this._hoverFloat = null;
        }
        if (this._hoverTracked) {
          this._hoverTracked = false;
          if (this._onContainerEnter) this.removeEventListener("mouseenter", this._onContainerEnter);
          if (this._onContainerLeave) this.removeEventListener("mouseleave", this._onContainerLeave);
          if (this._onTrackMouseOver) this.removeEventListener("mouseover", this._onTrackMouseOver);
          this._onContainerEnter = null;
          this._onContainerLeave = null;
          this._onTrackMouseOver = null;
        }
        this.style.removeProperty("overflow-x");
        this.style.removeProperty("--tlc-gap");
        this.style.setProperty("--tlc-padding", "14px 16px");
      }
    }
    _createAxisRuler() {
      this._axisRuler = document.createElement("div");
      this._axisRuler.className = "tlc-axis-ruler";
      const isHorizontal = this.direction !== "vertical";
      if (!isHorizontal) this._axisRuler.classList.add("vertical");
      this._axisRuler.innerHTML = "";
      this._axisRuler.append(
        h("div", { class: "tlc-axis-spacer" }, h("span", { class: "tlc-axis-range" })),
        h("div", { class: "tlc-axis-body" }, h("canvas", { class: "tlc-axis-canvas" }))
      );
      this.insertBefore(this._axisRuler, this.firstChild);
      const body = this._axisRuler.querySelector(".tlc-axis-body");
      this._rulerResObs = new ResizeObserver(() => {
        requestAnimationFrame(() => this._drawAxisRuler());
      });
      this._rulerResObs.observe(body);
    }
    _drawAxisRuler() {
      const ruler = this._axisRuler;
      if (!ruler) return;
      const fmt = this.getFormatter();
      const isHorizontal = this.direction !== "vertical";
      const { start: axisStart, end: axisEnd } = this._axisRange();
      const rangeEl = ruler.querySelector(".tlc-axis-range");
      if (rangeEl) {
        const customLabel = this.getAttribute("axis-label");
        if (customLabel != null) {
          rangeEl.textContent = customLabel;
        } else {
          const loc = resolveLocale(this);
          const text = loc.axisRange.replace("{start}", fmt.format(axisStart, "axis")).replace("{end}", fmt.format(axisEnd, "axis"));
          rangeEl.textContent = text;
        }
      }
      const canvas = ruler.querySelector(".tlc-axis-canvas");
      const body = ruler.querySelector(".tlc-axis-body");
      if (!canvas || !body) return;
      const rect = body.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      const range = axisEnd - axisStart;
      if (!range) return;
      const dim = isHorizontal ? rect.width : rect.height;
      const step = fmt.niceStep(range, dim);
      if (isHorizontal) {
        ctx.strokeStyle = "#d0d4da";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, rect.height - 0.5);
        ctx.lineTo(rect.width, rect.height - 0.5);
        ctx.stroke();
        ctx.strokeStyle = "#e0e3e8";
        ctx.lineWidth = 0.5;
        for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step / 2) {
          const px = (t - axisStart) / range * dim;
          if (px < 2 || px > dim - 2) continue;
          ctx.beginPath();
          ctx.moveTo(px, rect.height - 0.5);
          ctx.lineTo(px, rect.height - 4);
          ctx.stroke();
        }
        ctx.strokeStyle = "#c0c5cc";
        ctx.lineWidth = 1;
        for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
          const px = (t - axisStart) / range * dim;
          if (px < 1 || px > dim - 1) continue;
          ctx.beginPath();
          ctx.moveTo(px, rect.height - 0.5);
          ctx.lineTo(px, rect.height - 8);
          ctx.stroke();
        }
        fmt.showSec = step < 1 / 60;
        ctx.fillStyle = "#6b7d8e";
        ctx.font = "10px -apple-system,BlinkMacSystemFont,sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        let _lastHLabel = "";
        for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
          const px = (t - axisStart) / range * dim;
          if (px < 20 || px > dim - 20) continue;
          const text = fmt.format(t, "axis");
          if (text === _lastHLabel) continue;
          ctx.fillText(text, px, rect.height - 9);
          _lastHLabel = text;
        }
        ctx.textAlign = "left";
        {
          const tick = Math.floor(axisStart / step) * step + step;
          const nextPx = tick <= axisEnd ? (tick - axisStart) / range * dim : dim;
          const drawX = Math.max(0, 2);
          if (nextPx - drawX > 30) {
            if (tick > axisEnd || fmt.format(axisStart, "axis") !== fmt.format(tick, "axis")) {
              ctx.fillText(fmt.format(axisStart, "axis"), drawX, rect.height - 9);
            }
          }
        }
        ctx.textAlign = "right";
        {
          const lastTick = Math.floor(axisEnd / step) * step;
          const prevPx = lastTick > axisStart ? (lastTick - axisStart) / range * dim : 0;
          const drawX = Math.min(dim, dim - 2);
          if (drawX - prevPx > 30) {
            if (!_lastHLabel || fmt.format(axisEnd, "axis") !== _lastHLabel) {
              ctx.fillText(fmt.format(axisEnd, "axis"), drawX, rect.height - 9);
            }
          }
        }
      } else {
        ctx.strokeStyle = "#d0d4da";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rect.width - 0.5, 0);
        ctx.lineTo(rect.width - 0.5, rect.height);
        ctx.stroke();
        ctx.strokeStyle = "#e0e3e8";
        ctx.lineWidth = 0.5;
        for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step / 2) {
          const py = (t - axisStart) / range * dim;
          if (py < 2 || py > dim - 2) continue;
          ctx.beginPath();
          ctx.moveTo(rect.width - 0.5, py);
          ctx.lineTo(rect.width - 5, py);
          ctx.stroke();
        }
        ctx.strokeStyle = "#c0c5cc";
        ctx.lineWidth = 1;
        for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
          const py = (t - axisStart) / range * dim;
          if (py < 1 || py > dim - 1) continue;
          ctx.beginPath();
          ctx.moveTo(rect.width - 0.5, py);
          ctx.lineTo(rect.width - 9, py);
          ctx.stroke();
        }
        fmt.showSec = step < 1 / 60;
        ctx.fillStyle = "#6b7d8e";
        ctx.font = "10px -apple-system,BlinkMacSystemFont,sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        let _lastVLabel = "";
        for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
          const py = (t - axisStart) / range * dim;
          if (py < 12 || py > dim - 12) continue;
          const text = fmt.format(t, "axis");
          if (text === _lastVLabel) continue;
          ctx.fillText(text, rect.width - 11, py);
          _lastVLabel = text;
        }
        {
          const tick = Math.floor(axisStart / step) * step + step;
          const nextPy = tick <= axisEnd ? (tick - axisStart) / range * dim : dim;
          const drawPy = Math.max(0, 8);
          if (nextPy - drawPy > 30) {
            if (tick > axisEnd || fmt.format(axisStart, "axis") !== fmt.format(tick, "axis")) {
              ctx.fillText(fmt.format(axisStart, "axis"), rect.width - 11, drawPy);
            }
          }
        }
        {
          const lastTick = Math.floor(axisEnd / step) * step;
          const prevPy = lastTick > axisStart ? (lastTick - axisStart) / range * dim : 0;
          const drawPy = Math.min(dim, dim - 8);
          if (drawPy - prevPy > 30) {
            if (!_lastVLabel || fmt.format(axisEnd, "axis") !== _lastVLabel) {
              ctx.fillText(fmt.format(axisEnd, "axis"), rect.width - 11, drawPy);
            }
          }
        }
      }
    }
    /** 更新 hover 浮动框位置到当前鼠标所在轨道 */
    _updateHoverFloat(track) {
      const float = this._hoverFloat;
      if (!float) return;
      const isHorizontal = this.direction !== "vertical";
      const row = track.querySelector(".tlt-row");
      if (!row) return;
      const conRect = this.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      if (isHorizontal) {
        float.style.top = rowRect.top - conRect.top + "px";
        float.style.height = rowRect.height + "px";
      } else {
        float.style.left = rowRect.left - conRect.left + "px";
        float.style.width = rowRect.width + "px";
      }
      float.classList.add("visible");
    }
    /* ---- 内部 ---- */
    _applyDir() {
      const v = this.direction === "vertical";
      this.style.flexDirection = v ? "row" : "column";
      this.style.overflow = "auto";
    }
  }
  let _menuEl = null;
  let _overlay = null;
  let _modalEl = null;
  let _closeHandler = null;
  let _keyHandler = null;
  let _menuClickHandler = null;
  let _closeModalHandler = null;
  function closeAll() {
    _closeDropdown();
    hideContextMenu();
    closeModal();
  }
  function showContextMenu(items, x, y, originEl) {
    closeAll();
    if (!_menuEl) {
      _menuEl = document.createElement("div");
      _menuEl.className = "tlc-context-menu";
      document.body.appendChild(_menuEl);
    }
    _menuEl.classList.remove("closing", "show");
    _menuEl.innerHTML = "";
    const menuChildren = [];
    items.forEach((item, i) => {
      if (item.type === "divider") {
        menuChildren.push(h("div", { class: "tlc-context-divider" }));
      } else if (item.type === "header") {
        menuChildren.push(h("div", { class: "tlc-context-header" }, item.label));
      } else {
        const cls = ["tlc-context-item"];
        if (item.danger) cls.push("tlc-context-item-danger");
        menuChildren.push(h("div", { class: cls, "data-idx": String(i) }, item.label));
      }
    });
    _menuEl.append(...menuChildren);
    if (_menuClickHandler) _menuEl.removeEventListener("click", _menuClickHandler);
    _menuClickHandler = (e) => {
      const itemEl = e.target.closest(".tlc-context-item");
      if (!itemEl) return;
      const idx = parseInt(itemEl.dataset.idx, 10);
      const item = items[idx];
      if (item && item.action) item.action();
      hideContextMenu();
    };
    _menuEl.addEventListener("click", _menuClickHandler);
    requestAnimationFrame(() => {
      const mw = _menuEl.offsetWidth || 160;
      const mh = _menuEl.offsetHeight || 40;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const left = Math.max(8, Math.min(x, vw - mw - 8));
      const top = Math.max(8, Math.min(y, vh - mh - 8));
      _menuEl.style.left = left + "px";
      _menuEl.style.top = top + "px";
      if (originEl) {
        const r = originEl.getBoundingClientRect();
        const srcCx = r.left + r.width / 2;
        const srcCy = r.top + r.height / 2;
        const ox = srcCx - left;
        const oy = srcCy - top;
        _menuEl.style.transformOrigin = `${ox}px ${oy}px`;
      } else {
        _menuEl.style.transformOrigin = "center";
      }
      _menuEl.classList.add("show");
    });
    _closeHandler = (e) => {
      if (_menuEl && !_menuEl.contains(e.target)) {
        hideContextMenu();
      }
    };
    requestAnimationFrame(() => {
      document.addEventListener("pointerdown", _closeHandler);
    });
    _keyHandler = (e) => {
      if (e.key === "Escape") hideContextMenu();
    };
    document.addEventListener("keydown", _keyHandler);
  }
  function hideContextMenu() {
    if (_menuEl) {
      if (_menuEl.classList.contains("show")) {
        _menuEl.classList.remove("show");
        _menuEl.classList.add("closing");
        _menuEl.addEventListener("animationend", () => {
          _menuEl.classList.remove("closing");
        }, { once: true });
      } else {
        _menuEl.classList.remove("closing");
      }
    }
    if (_closeHandler) {
      document.removeEventListener("pointerdown", _closeHandler);
      _closeHandler = null;
    }
    if (_keyHandler) {
      document.removeEventListener("keydown", _keyHandler);
      _keyHandler = null;
    }
  }
  function _getOverlay() {
    if (!_overlay) {
      _overlay = document.createElement("div");
      _overlay.className = "tlc-modal-overlay";
      document.body.appendChild(_overlay);
      _overlay.addEventListener("pointerdown", (e) => {
        if (e.target === _overlay) closeModal();
      });
    }
    return _overlay;
  }
  function _getModal() {
    if (!_modalEl) {
      _modalEl = document.createElement("div");
      _modalEl.className = "tlc-modal";
      _modalEl.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
        if (e.key === "Enter" && e.target.tagName === "INPUT") {
          const confirmBtn = _modalEl.querySelector('[data-action="confirm"]');
          if (confirmBtn) confirmBtn.click();
        }
      });
    }
    return _modalEl;
  }
  function _hasModalAnimation(originEl) {
    const c = originEl && originEl.closest ? originEl.closest("time-line-container") : null;
    return c ? c.modalAnimation : true;
  }
  function _showModal(originEl) {
    hideContextMenu();
    const overlay = _getOverlay();
    const modal = _getModal();
    const animating = _hasModalAnimation(originEl);
    if (_closeModalHandler) {
      overlay.removeEventListener("animationend", _closeModalHandler);
      _closeModalHandler = null;
    }
    overlay.classList.remove("closing");
    if (modal.parentNode !== overlay) overlay.appendChild(modal);
    overlay._animating = animating;
    overlay.classList.toggle("tlc-modal-no-anim", !animating);
    if (animating) {
      if (originEl && typeof originEl.getBoundingClientRect === "function") {
        const modalRect = modal.getBoundingClientRect();
        const srcRect = originEl.getBoundingClientRect();
        if (modalRect.width > 0 && modalRect.height > 0 && srcRect.width > 0 && srcRect.height > 0) {
          modal.style.setProperty("--tlc-modal-tx", `${(srcRect.left - modalRect.left).toFixed(1)}px`);
          modal.style.setProperty("--tlc-modal-ty", `${(srcRect.top - modalRect.top).toFixed(1)}px`);
          modal.style.setProperty("--tlc-modal-sx", (srcRect.width / modalRect.width).toFixed(4));
          modal.style.setProperty("--tlc-modal-sy", (srcRect.height / modalRect.height).toFixed(4));
        } else {
          modal.style.setProperty("--tlc-modal-tx", "0px");
          modal.style.setProperty("--tlc-modal-ty", "0px");
          modal.style.setProperty("--tlc-modal-sx", ".35");
          modal.style.setProperty("--tlc-modal-sy", ".35");
        }
      } else {
        modal.style.setProperty("--tlc-modal-tx", "0px");
        modal.style.setProperty("--tlc-modal-ty", "0px");
        modal.style.setProperty("--tlc-modal-sx", ".35");
        modal.style.setProperty("--tlc-modal-sy", ".35");
      }
    }
    requestAnimationFrame(() => {
      overlay.classList.add("show");
    });
    const firstInput = modal.querySelector('input:not([type="color"])');
    if (firstInput) setTimeout(() => firstInput.focus(), 120);
  }
  function closeModal() {
    _closeDropdown();
    if (_overlay) {
      const animating = _overlay._animating !== false;
      if (_overlay.classList.contains("show")) {
        _overlay.classList.remove("show");
        if (animating) {
          _overlay.classList.add("closing");
          if (_closeModalHandler) _overlay.removeEventListener("animationend", _closeModalHandler);
          _closeModalHandler = () => {
            _closeModalHandler = null;
            _overlay.classList.remove("closing");
            if (_modalEl && _modalEl.parentNode === _overlay && !_overlay.classList.contains("show")) {
              _overlay.removeChild(_modalEl);
            }
          };
          _overlay.addEventListener("animationend", _closeModalHandler);
        } else {
          _overlay.classList.remove("closing");
          if (_closeModalHandler) {
            _overlay.removeEventListener("animationend", _closeModalHandler);
            _closeModalHandler = null;
          }
          if (_modalEl && _modalEl.parentNode === _overlay) {
            _overlay.removeChild(_modalEl);
          }
        }
      } else {
        if (_closeModalHandler) {
          _overlay.removeEventListener("animationend", _closeModalHandler);
          _closeModalHandler = null;
        }
        _overlay.classList.remove("closing");
        if (_modalEl && _modalEl.parentNode === _overlay) {
          _overlay.removeChild(_modalEl);
        }
      }
    }
  }
  const PRESET_COLORS = [
    "#e74c3c",
    "#e67e22",
    "#f1c40f",
    "#2ecc71",
    "#1abc9c",
    "#3498db",
    "#2980b9",
    "#9b59b6",
    "#8e44ad",
    "#34495e",
    "#7f8c8d",
    "#95a5a6"
  ];
  function _renderField(labelText, control, hint) {
    const children = [
      h("label", { class: "tlc-field-label" }, labelText),
      control
    ];
    if (hint) children.push(h("span", { class: "tlc-field-hint" }, hint));
    return h("div", { class: "tlc-field" }, children);
  }
  function _isTimeFormatter(fmt) {
    return fmt.format(0, "editor").includes(":");
  }
  function _renderColorPicker(name, currentColor) {
    return h("div", { class: "tlc-color-control" }, [
      h(
        "div",
        { class: "tlc-color-presets" },
        PRESET_COLORS.map(
          (c) => h("button", { type: "button", class: "tlc-color-swatch", "data-color": c, style: `background:${c}`, tabindex: "-1" })
        )
      ),
      h("input", { name, type: "color", value: currentColor })
    ]);
  }
  function _renderTimeControl(fmt, value, name, loc) {
    const formatted = fmt.format(value, "editor");
    const parts = formatted.split(":");
    const labels = { h: loc.hourUnit, m: loc.minuteUnit, s: loc.secondUnit };
    const _col = (partVal, partKey) => h("div", { class: "tlc-tf-col", "data-part": partKey }, [
      h("input", { type: "text", inputmode: "numeric", class: "tlc-tf-input", name: `${name}_${partKey}`, value: partVal, "data-part": partKey, maxlength: partKey === "h" ? "4" : "2", autocomplete: "off" }),
      h("span", { class: "tlc-tf-suffix" }, labels[partKey]),
      h("div", { class: "tlc-tf-steps" }, [
        h("button", { type: "button", class: "tlc-tf-step up", tabindex: "-1" }, "▲"),
        h("button", { type: "button", class: "tlc-tf-step down", tabindex: "-1" }, "▼")
      ])
    ]);
    const rowChildren = [
      _col(parts[0], "h"),
      h("span", { class: "tlc-tf-colon" }, ":"),
      _col(parts[1], "m")
    ];
    if (parts.length === 3) {
      rowChildren.push(h("span", { class: "tlc-tf-colon" }, ":"));
      rowChildren.push(_col(parts[2], "s"));
    }
    return h("div", { class: "tlc-time-control", "data-name": name }, [
      h("div", { class: "tlc-tf-row" }, rowChildren),
      h("div", { class: "tlc-field-error", id: `${name}_error` })
    ]);
  }
  function _renderNumberControl(fmt, value, name) {
    const formatted = fmt.format(value, "editor");
    const unit = fmt.unit;
    return h("div", { class: "tlc-number-control", "data-name": name }, [
      h("div", { class: "tlc-tf-row" }, [
        h("div", { class: "tlc-tf-col" }, [
          h("input", { type: "text", inputmode: "decimal", class: "tlc-field-input", name, value: formatted, autocomplete: "off" }),
          unit ? h("span", { class: "tlc-tf-suffix" }, unit) : null
        ]),
        h("div", { class: "tlc-tf-steps" }, [
          h("button", { type: "button", class: "tlc-tf-step up", tabindex: "-1" }, "▲"),
          h("button", { type: "button", class: "tlc-tf-step down", tabindex: "-1" }, "▼")
        ])
      ]),
      h("div", { class: "tlc-field-error", id: `${name}_error` })
    ]);
  }
  function _readTimeFields(control) {
    const h2 = control.querySelector('[data-part="h"] .tlc-tf-input');
    const m = control.querySelector('[data-part="m"] .tlc-tf-input');
    const s = control.querySelector('[data-part="s"] .tlc-tf-input');
    const hh = h2 ? String(parseInt(h2.value, 10) || 0).padStart(2, "0") : "00";
    const mm = m ? String(parseInt(m.value, 10) || 0).padStart(2, "0") : "00";
    const ss = s ? String(parseInt(s.value, 10) || 0).padStart(2, "0") : "";
    return ss ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  }
  function _showError(controlName, msg) {
    const errEl = document.getElementById(`${controlName}_error`);
    if (!errEl) return;
    errEl.textContent = msg;
    const control = errEl.closest(".tlc-time-control, .tlc-number-control");
    if (!control) return;
    control.querySelectorAll(".tlc-tf-col, .tlc-tf-row, .tlc-field-input").forEach((el) => {
      el.classList.toggle("tlc-input-error", !!msg);
    });
  }
  function _clearErrors(modal) {
    modal.querySelectorAll(".tlc-field-error").forEach((el) => el.textContent = "");
    modal.querySelectorAll(".tlc-input-error").forEach((el) => el.classList.remove("tlc-input-error"));
  }
  function _checkOverlap(track, start, end, exclude, unnamed) {
    if (!track) return null;
    const segments = track.querySelectorAll("time-line-segment");
    for (const seg of segments) {
      if (seg === exclude) continue;
      const ss = seg.start;
      const se = seg.end;
      if (start < se && end > ss) {
        return { label: seg.label || unnamed, start: ss, end: se };
      }
    }
    return null;
  }
  function _formatStepHint(fmt, step, loc) {
    if (!step || step <= 0) return "";
    if (_isTimeFormatter(fmt)) return "";
    const stepStr = parseFloat(step.toFixed(4)).toString();
    return formatLocale(loc.stepHint, { step: stepStr });
  }
  function _setupLongPress(el, onStep) {
    let timer = null, interval = null;
    const stop = () => {
      clearTimeout(timer);
      clearInterval(interval);
      timer = null;
      interval = null;
    };
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      onStep();
      timer = setTimeout(() => {
        interval = setInterval(onStep, 80);
      }, 300);
    });
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointercancel", stop);
    el.addEventListener("pointerleave", stop);
    return stop;
  }
  function _distributeValue(ctl, fmt, val) {
    const formatted = fmt.format(val, "editor");
    const parts = formatted.split(":");
    const PK_MAP = { h: 0, m: 1, s: 2 };
    ctl.querySelectorAll(".tlc-tf-col").forEach((col) => {
      const pk = col.dataset.part;
      if (!pk || PK_MAP[pk] == null) return;
      const inp = col.querySelector(".tlc-tf-input");
      if (!inp) return;
      inp.value = String(parseInt(parts[PK_MAP[pk]], 10) || 0).padStart(2, "0");
    });
    ctl.querySelectorAll(".tlc-tf-input").forEach((inp) => {
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  function _initFormControls(modal, fmt) {
    const isTime = _isTimeFormatter(fmt);
    if (isTime) {
      modal.querySelectorAll(".tlc-time-control").forEach((control) => {
        control.querySelectorAll(".tlc-tf-col").forEach((col) => {
          const input2 = col.querySelector(".tlc-tf-input");
          const up = col.querySelector(".tlc-tf-step.up");
          const down = col.querySelector(".tlc-tf-step.down");
          const part = col.dataset.part;
          if (!input2 || !up || !down || !part) return;
          const limits = { h: { min: 0, max: 9999 }, m: { min: 0, max: 59 }, s: { min: 0, max: 59 } };
          const limit = limits[part] || { min: 0, max: 59 };
          _setupLongPress(up, () => {
            const ctl = col.closest(".tlc-time-control");
            const mn = parseFloat(ctl.dataset.min);
            const mx = parseFloat(ctl.dataset.max);
            const hasRange = !isNaN(mn) && !isNaN(mx);
            let val = parseInt(input2.value, 10) || 0;
            val = val >= limit.max ? limit.min : val + 1;
            input2.value = String(val).padStart(2, "0");
            if (hasRange) {
              const raw = fmt.parse(_readTimeFields(ctl));
              if (!isNaN(raw) && (raw >= mx || raw < mn)) {
                _distributeValue(ctl, fmt, mn);
                return;
              }
            }
            input2.dispatchEvent(new Event("input", { bubbles: true }));
          });
          _setupLongPress(down, () => {
            const ctl = col.closest(".tlc-time-control");
            const mn = parseFloat(ctl.dataset.min);
            const mx = parseFloat(ctl.dataset.max);
            const hasRange = !isNaN(mn) && !isNaN(mx);
            let val = parseInt(input2.value, 10) || 0;
            val = val <= limit.min ? limit.max : val - 1;
            input2.value = String(val).padStart(2, "0");
            if (hasRange) {
              const raw = fmt.parse(_readTimeFields(ctl));
              if (raw < mn) {
                _distributeValue(ctl, fmt, mx);
                return;
              }
              if (raw > mx) {
                const oneMin = fmt.unit === "second" ? 60 : fmt.unit === "minute" ? 1 : 1 / 60;
                _distributeValue(ctl, fmt, mx - oneMin);
                return;
              }
            }
            input2.dispatchEvent(new Event("input", { bubbles: true }));
          });
        });
      });
    } else {
      modal.querySelectorAll(".tlc-number-control").forEach((control) => {
        const input2 = control.querySelector(".tlc-field-input");
        const up = control.querySelector(".tlc-tf-step.up");
        const down = control.querySelector(".tlc-tf-step.down");
        const step = parseFloat(control.dataset.step) || 1;
        const min = parseFloat(control.dataset.min);
        const max = parseFloat(control.dataset.max);
        const hasMin = !isNaN(min);
        const hasMax = !isNaN(max);
        if (!input2 || !up || !down) return;
        _setupLongPress(up, () => {
          const val = fmt.parse(input2.value);
          if (!isNaN(val)) {
            let newVal = val + step;
            if (hasMax && newVal > max) newVal = hasMin ? min : newVal;
            input2.value = fmt.format(newVal, "editor");
            input2.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
        _setupLongPress(down, () => {
          const val = fmt.parse(input2.value);
          if (!isNaN(val)) {
            let newVal = val - step;
            if (hasMin && newVal < min) newVal = hasMax ? max : newVal;
            input2.value = fmt.format(newVal, "editor");
            input2.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      });
    }
    modal.querySelectorAll(".tlc-color-presets").forEach((presets) => {
      const colorInput = presets.closest(".tlc-color-control").querySelector('input[type="color"]');
      if (!colorInput) return;
      presets.addEventListener("click", (e) => {
        const swatch = e.target.closest(".tlc-color-swatch");
        if (!swatch) return;
        colorInput.value = swatch.dataset.color;
      });
    });
    modal.querySelectorAll(".tlc-time-control input, .tlc-number-control input").forEach((inp) => {
      inp.addEventListener("blur", () => {
        const control = inp.closest(".tlc-time-control, .tlc-number-control");
        if (!control) return;
        if (control.classList.contains("tlc-time-control")) {
          const min2 = parseFloat(control.dataset.min);
          const max2 = parseFloat(control.dataset.max);
          const hasMin2 = !isNaN(min2);
          const hasMax2 = !isNaN(max2);
          control.querySelectorAll(".tlc-tf-col").forEach((col) => {
            const part = col.dataset.part;
            if (!part) return;
            const input2 = col.querySelector(".tlc-tf-input");
            if (!input2) return;
            const limits = { h: { min: 0, max: 9999 }, m: { min: 0, max: 59 }, s: { min: 0, max: 59 } };
            const limit = limits[part] || { min: 0, max: 59 };
            let val = parseInt(input2.value, 10);
            if (isNaN(val) || val < limit.min) val = limit.min;
            if (val > limit.max) val = limit.max;
            input2.value = String(val).padStart(2, "0");
          });
          const raw2 = fmt.parse(_readTimeFields(control));
          let clamped2 = isNaN(raw2) ? hasMin2 ? min2 : 0 : raw2;
          if (hasMin2 && clamped2 < min2) clamped2 = min2;
          if (hasMax2 && clamped2 > max2) clamped2 = max2;
          const formatted = fmt.format(clamped2, "editor");
          const parts = formatted.split(":");
          const PK_MAP = { h: 0, m: 1, s: 2 };
          control.querySelectorAll(".tlc-tf-col").forEach((col) => {
            const pk = col.dataset.part;
            if (!pk || PK_MAP[pk] == null) return;
            const input2 = col.querySelector(".tlc-tf-input");
            if (!input2) return;
            const newVal = parts[PK_MAP[pk]] || "00";
            input2.value = String(parseInt(newVal, 10) || 0).padStart(2, "0");
          });
          inp.dispatchEvent(new Event("input", { bubbles: true }));
          return;
        }
        const raw = fmt.parse(inp.value);
        const min = parseFloat(control.dataset.min);
        const max = parseFloat(control.dataset.max);
        const hasMin = !isNaN(min);
        const hasMax = !isNaN(max);
        let clamped = isNaN(raw) ? hasMin ? min : 0 : raw;
        if (hasMin && clamped < min) clamped = min;
        if (hasMax && clamped > max) clamped = max;
        inp.value = fmt.format(clamped, "editor");
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
    modal.querySelectorAll(".tlc-time-control .tlc-tf-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const col = inp.closest(".tlc-tf-col");
        if (!col) return;
        const control = col.closest(".tlc-time-control");
        if (!control) return;
        const part = col.dataset.part;
        if (!part) return;
        const limits = { h: { min: 0, max: 9999 }, m: { min: 0, max: 59 }, s: { min: 0, max: 59 } };
        const limit = limits[part] || { min: 0, max: 59 };
        const val = parseInt(inp.value, 10);
        let isError = inp.value === "" || isNaN(val) || val < limit.min || val > limit.max;
        if (!isError) {
          const min = parseFloat(control.dataset.min);
          const max = parseFloat(control.dataset.max);
          const hasMin = !isNaN(min);
          const hasMax = !isNaN(max);
          if (hasMin || hasMax) {
            const allFilled = [...control.querySelectorAll(".tlc-tf-col")].every((c) => {
              const input2 = c.querySelector(".tlc-tf-input");
              return input2 && input2.value !== "" && !isNaN(parseInt(input2.value, 10));
            });
            if (allFilled) {
              const raw = fmt.parse(_readTimeFields(control));
              if (!isNaN(raw) && (hasMin && raw < min || hasMax && raw > max)) {
                isError = true;
              }
            }
          }
        }
        col.classList.toggle("tlc-input-error", isError);
      });
    });
    _initDropdowns(modal, fmt, isTime);
  }
  let _dropdownEl = null;
  let _ddCloseHandler = null;
  let _ddBlurEl = null;
  let _ddBlurHandler = null;
  function _buildDropdownOptions(fmt, min, max, step) {
    step = step || Math.max((max - min) / 24, 1);
    const range = max - min;
    const effStep = range / Math.min(range / step, 48) || step;
    const opts = [];
    for (let v = min; v <= max + effStep / 2; v += effStep) {
      const clamped = Math.min(Math.max(v, min), max);
      const label = fmt.format(clamped, "editor");
      if (!opts.length || opts[opts.length - 1].label !== label) {
        opts.push({ value: clamped, label });
      }
    }
    return opts;
  }
  function _closeDropdown() {
    if (_dropdownEl && !_dropdownEl.classList.contains("closing")) {
      const el = _dropdownEl;
      el.classList.add("closing");
      if (_ddBlurEl && _ddBlurHandler) {
        _ddBlurEl.removeEventListener("blur", _ddBlurHandler);
        _ddBlurEl = null;
        _ddBlurHandler = null;
      }
      el.addEventListener("animationend", () => {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (_dropdownEl === el) _dropdownEl = null;
      }, { once: true });
    } else if (_dropdownEl) {
      _dropdownEl.remove();
      _dropdownEl = null;
    }
    if (_ddCloseHandler) {
      document.removeEventListener("pointerdown", _ddCloseHandler, true);
      _ddCloseHandler = null;
    }
  }
  function _initDropdowns(modal, fmt, isTime) {
    if (isTime) {
      modal.querySelectorAll(".tlc-time-control .tlc-tf-col").forEach((col) => {
        const input2 = col.querySelector(".tlc-tf-input");
        if (!input2) return;
        const part = col.dataset.part;
        const control = col.closest(".tlc-time-control");
        const showDropdown = () => {
          _closeDropdown();
          let opts = [];
          if (part === "h") {
            for (let v = 0; v <= 24; v++) opts.push(String(v).padStart(2, "0"));
          } else {
            for (let v = 0; v <= 59; v++) opts.push(String(v).padStart(2, "0"));
          }
          _renderDropdownPanel(opts, col, (val) => {
            input2.value = val;
            input2.dispatchEvent(new Event("input", { bubbles: true }));
            if (part === "h" && val === "24") {
              const mInput = control.querySelector('.tlc-tf-col[data-part="m"] .tlc-tf-input');
              const sInput = control.querySelector('.tlc-tf-col[data-part="s"] .tlc-tf-input');
              if (mInput) {
                mInput.value = "00";
                mInput.dispatchEvent(new Event("input", { bubbles: true }));
              }
              if (sInput) {
                sInput.value = "00";
                sInput.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }
          }, input2);
        };
        input2.addEventListener("focus", showDropdown);
        input2.addEventListener("click", () => {
          if (!_dropdownEl) showDropdown();
        });
      });
    }
    modal.querySelectorAll(".tlc-number-control .tlc-field-input").forEach((input2) => {
      const control = input2.closest(".tlc-number-control");
      const showDropdown = () => {
        _closeDropdown();
        const min = parseFloat(control.dataset.min) || 0;
        const max = parseFloat(control.dataset.max) || 100;
        const step = control.dataset.step ? parseFloat(control.dataset.step) : 1;
        const opts = _buildDropdownOptions(fmt, min, max, step);
        _renderDropdownPanel(opts, input2, (label) => {
          input2.value = label;
          input2.dispatchEvent(new Event("input", { bubbles: true }));
        }, input2);
      };
      input2.addEventListener("focus", showDropdown);
      input2.addEventListener("click", () => {
        if (!_dropdownEl) showDropdown();
      });
    });
  }
  function _renderDropdownPanel(opts, anchor, onSelect, blurInput) {
    _dropdownEl = document.createElement("div");
    _dropdownEl.className = "tlc-tf-dropdown-panel";
    opts.forEach((o) => {
      const label = typeof o === "string" ? o : o.label;
      const item = document.createElement("div");
      item.className = "tlc-tf-dropdown-item";
      item.textContent = label;
      item.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        onSelect(label);
        _closeDropdown();
      });
      _dropdownEl.appendChild(item);
    });
    const r = anchor.getBoundingClientRect();
    _dropdownEl.style.position = "fixed";
    _dropdownEl.style.top = r.bottom + 4 + "px";
    _dropdownEl.style.left = r.left + "px";
    _dropdownEl.style.width = r.width + "px";
    _dropdownEl.style.zIndex = "200000";
    document.body.appendChild(_dropdownEl);
    requestAnimationFrame(() => _dropdownEl.classList.add("panel-enter"));
    if (blurInput) {
      const cur = blurInput.value;
      const items = _dropdownEl.querySelectorAll(".tlc-tf-dropdown-item");
      for (const item of items) {
        if (item.textContent === cur) {
          item.classList.add("active");
          item.scrollIntoView({ block: "nearest" });
          break;
        }
      }
    }
    _ddCloseHandler = (ev) => {
      if (!_dropdownEl.contains(ev.target) && ev.target !== input) _closeDropdown();
    };
    document.addEventListener("pointerdown", _ddCloseHandler, true);
    if (blurInput) {
      _ddBlurEl = blurInput;
      _ddBlurHandler = () => _closeDropdown();
      blurInput.addEventListener("blur", _ddBlurHandler);
    }
  }
  function _resolveStep(track, isTime) {
    let step = 0;
    if (track) {
      const s = track.step;
      if (s && s > 0) step = s;
    }
    if (!step) {
      step = isTime ? Math.max((track ? track.tEnd - track.tStart : 24) / 24, 0.5) : 1;
    }
    return step;
  }
  function _setupRangeDataset(modal, tStart, tEnd, step) {
    const startCtls = modal.querySelectorAll('.tlc-time-control[data-name="start"], .tlc-number-control[data-name="start"]');
    const endCtls = modal.querySelectorAll('.tlc-time-control[data-name="end"], .tlc-number-control[data-name="end"]');
    [startCtls, endCtls].forEach((ctls) => {
      ctls.forEach((el) => {
        el.dataset.min = String(tStart);
        el.dataset.max = String(tEnd);
        if (el.classList.contains("tlc-number-control")) el.dataset.step = String(step);
      });
    });
  }
  function _readTimeValues(modal, fmt, isTime) {
    let start, end;
    if (isTime) {
      start = fmt.parse(_readTimeFields(modal.querySelector('[data-name="start"]')));
      end = fmt.parse(_readTimeFields(modal.querySelector('[data-name="end"]')));
    } else {
      const sv = modal.querySelector('input[name="start"]');
      const ev = modal.querySelector('input[name="end"]');
      start = sv ? fmt.parse(sv.value) : NaN;
      end = ev ? fmt.parse(ev.value) : NaN;
    }
    return { start, end };
  }
  function _validateTimeRange(start, end, loc) {
    let valid = true;
    if (isNaN(start) || isNaN(end)) {
      _showError("start", loc.invalidValue);
      _showError("end", loc.invalidValue);
      valid = false;
    } else if (start >= end) {
      _showError("start", loc.startMustBeBeforeEnd);
      _showError("end", loc.startMustBeBeforeEnd);
      valid = false;
    }
    return valid;
  }
  function _scrollToFirstError(modal) {
    const firstErr = modal.querySelector(".tlc-input-error");
    if (firstErr) firstErr.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function _showEditDialog(modal, loc, title, bodyChildren, tStart, tEnd, step, fmt, originEl) {
    modal.innerHTML = "";
    modal.append(
      h("div", { class: "tlc-modal-header" }, title),
      h("div", { class: "tlc-modal-body" }, bodyChildren),
      h("div", { class: "tlc-modal-footer" }, [
        h("button", { class: "tlc-btn", "data-action": "cancel", onClick: closeModal }, loc.cancel),
        h("button", { class: "tlc-btn tlc-btn-primary", "data-action": "confirm" }, loc.confirm)
      ])
    );
    _showModal(originEl);
    _setupRangeDataset(modal, tStart, tEnd, step);
    _initFormControls(modal, fmt);
  }
  function showSegmentEditDialog(segment) {
    const loc = resolveLocale(segment);
    const fmt = segment._formatter;
    const track = segment.closest("time-line-track");
    const isTime = _isTimeFormatter(fmt);
    const modal = _getModal();
    const step = _resolveStep(track, isTime);
    const bodyChildren = [
      _renderField(
        loc.labelField,
        h("input", { class: "tlc-field-input", name: "label", type: "text", value: segment.label })
      ),
      _renderField(
        loc.startTime,
        isTime ? _renderTimeControl(fmt, segment.start, "start", loc) : _renderNumberControl(fmt, segment.start, "start"),
        _formatStepHint(fmt, step, loc)
      ),
      _renderField(
        loc.endTime,
        isTime ? _renderTimeControl(fmt, segment.end, "end", loc) : _renderNumberControl(fmt, segment.end, "end"),
        _formatStepHint(fmt, step, loc)
      ),
      _renderField(loc.color, _renderColorPicker("color", segment.color))
    ];
    _showEditDialog(
      modal,
      loc,
      loc.segmentEditTitle,
      bodyChildren,
      track ? track.tStart : 0,
      track ? track.tEnd : 24,
      step,
      fmt,
      segment
    );
    modal.querySelector('[data-action="confirm"]').addEventListener("click", () => {
      _clearErrors(modal);
      const { start, end } = _readTimeValues(modal, fmt, isTime);
      let valid = _validateTimeRange(start, end, loc);
      if (valid) {
        const overlap = _checkOverlap(track, start, end, segment, loc.unnamed);
        if (overlap) {
          const msg = formatLocale(loc.overlapHint, { label: overlap.label });
          _showError("start", msg);
          _showError("end", msg);
          valid = false;
        }
      }
      if (!valid) {
        _scrollToFirstError(modal);
        return;
      }
      const labelInput = modal.querySelector('input[name="label"]');
      segment.label = labelInput ? labelInput.value : "";
      segment.start = start;
      segment.end = end;
      const colorInput = modal.querySelector('input[name="color"]');
      if (colorInput) segment.color = colorInput.value;
      closeModal();
    });
  }
  function showTrackEditDialog(track) {
    const loc = resolveLocale(track);
    const fmt = track._formatter;
    const isTime = _isTimeFormatter(fmt);
    const modal = _getModal();
    const step = _resolveStep(track, isTime);
    const bodyChildren = [
      _renderField(
        loc.name,
        h("input", { class: "tlc-field-input", name: "label", type: "text", value: track.label })
      ),
      _renderField(
        loc.rangeStart,
        isTime ? _renderTimeControl(fmt, track.tStart, "start", loc) : _renderNumberControl(fmt, track.tStart, "start"),
        _formatStepHint(fmt, step, loc)
      ),
      _renderField(
        loc.rangeEnd,
        isTime ? _renderTimeControl(fmt, track.tEnd, "end", loc) : _renderNumberControl(fmt, track.tEnd, "end"),
        _formatStepHint(fmt, step, loc)
      ),
      _renderField(
        loc.step,
        isTime ? _renderTimeControl(fmt, track.step, "step", loc) : _renderNumberControl(fmt, track.step, "step"),
        _formatStepHint(fmt, step, loc)
      ),
      _renderField(
        loc.maxSegmentsField,
        h("input", { class: "tlc-field-input", name: "maxSegments", type: "text", inputmode: "numeric", placeholder: loc.zeroUnlimited, value: track.maxSegments || "" })
      )
    ];
    const headEl = track.querySelector(".tlt-head") || track;
    _showEditDialog(modal, loc, loc.trackEditTitle, bodyChildren, track.tStart, track.tEnd, step, fmt, headEl);
    modal.querySelector('[data-action="confirm"]').addEventListener("click", () => {
      _clearErrors(modal);
      const { start, end } = _readTimeValues(modal, fmt, isTime);
      const stepCtl = modal.querySelector('[data-name="step"]');
      let parsedStep = NaN;
      if (stepCtl) {
        parsedStep = isTime ? fmt.parse(_readTimeFields(stepCtl)) : fmt.parse(stepCtl.querySelector("input").value);
      }
      const maxSegInput = modal.querySelector('input[name="maxSegments"]');
      const maxSeg = maxSegInput ? parseInt(maxSegInput.value, 10) : NaN;
      let valid = _validateTimeRange(start, end, loc);
      if (!valid) {
        _scrollToFirstError(modal);
        return;
      }
      const labelInput = modal.querySelector('input[name="label"]');
      if (labelInput) track.label = labelInput.value;
      track.setAttribute("start", String(start));
      track.setAttribute("end", String(end));
      track.step = !isNaN(parsedStep) && parsedStep > 0 ? parsedStep : 0;
      if (!isNaN(maxSeg) && maxSeg > 0) {
        track.maxSegments = maxSeg;
      } else {
        track.removeAttribute("max-segments");
      }
      closeModal();
    });
  }
  function showDeleteConfirm(message, onConfirm, refEl) {
    const loc = resolveLocale(refEl);
    const modal = _getModal();
    modal.innerHTML = "";
    modal.append(
      h("div", { class: "tlc-modal-header" }, loc.confirmDeleteTitle),
      h("div", { class: "tlc-modal-body" }, h("p", message)),
      h("div", { class: "tlc-modal-footer" }, [
        h("button", { class: "tlc-btn", "data-action": "cancel", onClick: closeModal }, loc.cancel),
        h("button", { class: "tlc-btn tlc-btn-danger", "data-action": "confirm", onClick: () => {
          closeModal();
          if (onConfirm) onConfirm();
        } }, loc.confirm)
      ])
    );
    _showModal(refEl);
  }
  function showCopyToTracksDialog(srcTrack) {
    const container = srcTrack.closest("time-line-container");
    if (!container) return;
    const loc = resolveLocale(srcTrack);
    const allTracks = container.allTracks();
    const targets = allTracks.filter((t) => t !== srcTrack && t.deletable);
    const modal = _getModal();
    modal.innerHTML = "";
    const header = h(
      "div",
      { class: "tlc-modal-header" },
      loc.copyToTracksTitle.replace("{name}", srcTrack.label || loc.unnamed)
    );
    const bodyChildren = [];
    if (!targets.length) {
      bodyChildren.push(h("p", { style: "color:#999;font-size:12px;padding:12px" }, loc.copyToTracksEmpty));
    } else {
      const syncToggle = () => {
        const cbs = modal.querySelectorAll('input[name="copy-target"]');
        const allChecked = Array.from(cbs).every((cb) => cb.checked);
        const toggleCb = modal.querySelector(".tlc-copy-toggle-cb");
        if (toggleCb) toggleCb.checked = allChecked;
      };
      const toggleAll = () => {
        const cbs = modal.querySelectorAll('input[name="copy-target"]');
        const allChecked = Array.from(cbs).every((cb) => cb.checked);
        cbs.forEach((cb) => cb.checked = !allChecked);
        syncToggle();
      };
      bodyChildren.push(h("div", { class: "tlc-copy-track-header" }, [
        h("div", { class: "tlc-copy-toggle-item", onClick: toggleAll }, [
          h("span", { class: "tlc-copy-track-name tlc-copy-toggle-label" }, loc.copySelectAll),
          h("span", { class: "tlc-copy-track-meta" }),
          h("input", { type: "checkbox", class: "tlc-copy-toggle-cb", checked: true, hidden: true }),
          h("span", { class: "tlc-copy-track-check" })
        ])
      ]));
      const checkboxes = targets.map((t, i) => {
        const segCount = t.sortedSegs().length;
        return h("label", { class: "tlc-copy-track-item" }, [
          h("span", { class: "tlc-copy-track-name" }, t.label || loc.unnamed),
          h("span", { class: "tlc-copy-track-meta" }, `${segCount} ${loc.segmentUnit}`),
          h("input", { type: "checkbox", name: "copy-target", "data-idx": String(i), checked: true, hidden: true, onChange: syncToggle }),
          h("span", { class: "tlc-copy-track-check" })
        ]);
      });
      bodyChildren.push(...checkboxes);
    }
    const body = h("div", { class: "tlc-modal-body" }, bodyChildren);
    const footer = h("div", { class: "tlc-modal-footer" }, [
      h("button", { class: "tlc-btn", "data-action": "cancel", onClick: closeModal }, loc.cancel),
      h("button", { class: "tlc-btn tlc-btn-primary", "data-action": "confirm", onClick: () => {
        const checked = modal.querySelectorAll('input[name="copy-target"]:checked');
        if (checked.length === 0) return;
        const srcSegs = srcTrack.sortedSegs().map((s) => ({
          label: s.label,
          color: s.color,
          start: s.start,
          end: s.end,
          radius: s.radius
        }));
        checked.forEach((cb) => {
          const idx = parseInt(cb.dataset.idx, 10);
          const tgt = targets[idx];
          if (!tgt) return;
          tgt.clearAllSegments();
          for (const sd of srcSegs) {
            try {
              tgt.addSegment(sd.start, sd.end, { label: sd.label, color: sd.color });
            } catch (_) {
            }
          }
          tgt._pulseCopy();
        });
        closeModal();
      } }, loc.confirm)
    ]);
    modal.append(header, body, footer);
    _showModal(srcTrack);
  }
  let _clipboard = null;
  function copyToClipboard(type, data) {
    _clipboard = { type, data };
  }
  function getClipboard() {
    return _clipboard;
  }
  function clearClipboard() {
    _clipboard = null;
  }
  class TimeTrack extends HTMLElement {
    constructor() {
      super();
      this._init = false;
      this._mutObs = null;
      this._trackMutObs = null;
      this._resObs = null;
      this._creating = false;
      this._crS = 0;
      this._crP0 = 0;
      this._ghost = null;
    }
    /* ---- 属性 ---- */
    get tStart() {
      return this._formatter.parse(this.getAttribute("start"), 0);
    }
    get tEnd() {
      return this._formatter.parse(this.getAttribute("end"), 24);
    }
    get label() {
      return this.getAttribute("label") || "";
    }
    set label(v) {
      this.setAttribute("label", v);
    }
    get step() {
      if (this.hasAttribute("step")) return this._formatter.parse(this.getAttribute("step"), 0);
      const c = this.closest("time-line-container");
      if (c && c.hasAttribute("step")) return c.getFormatter().parse(c.getAttribute("step"), 0);
      return 0;
    }
    set step(v) {
      if (v == null) this.removeAttribute("step");
      else this.setAttribute("step", v);
    }
    get minDur() {
      const a = this.getAttribute("min-duration");
      if (a != null) return this._formatter.parse(a);
      return (this.tEnd - this.tStart) * 5e-3;
    }
    /** 最大段数：轨道自身属性 > 容器全局配置 > 无限制 */
    get maxSegments() {
      const mine = this.getAttribute("max-segments");
      if (mine != null) {
        const n = parseInt(mine, 10);
        return n > 0 ? n : 0;
      }
      const c = this.closest("time-line-container");
      if (c && c.maxSegments) return c.maxSegments;
      return 0;
    }
    set maxSegments(v) {
      this.setAttribute("max-segments", v);
    }
    /** 获取默认段颜色（track属性 > container属性 > #5c9ce6） */
    get defaultColor() {
      if (this.hasAttribute("default-color")) return this.getAttribute("default-color");
      const c = this.closest("time-line-container");
      if (c && c.hasAttribute("default-color")) return c.getAttribute("default-color");
      return "#5c9ce6";
    }
    set defaultColor(v) {
      if (v == null || v === "#5c9ce6") this.removeAttribute("default-color");
      else this.setAttribute("default-color", v);
    }
    /* ---- 可编辑/可删除（继承自容器） ---- */
    /** 是否允许编辑（拖拽创建/移动/调整/修改属性），默认继承容器值或 true */
    get editable() {
      if (this.hasAttribute("editable")) return this.getAttribute("editable") !== "false";
      const c = this.closest("time-line-container");
      return c ? c.editable : true;
    }
    set editable(v) {
      if (v == null) this.removeAttribute("editable");
      else this.setAttribute("editable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许删除（删除轨道/段删除按钮和菜单），默认继承容器值或 true */
    get deletable() {
      if (this.hasAttribute("deletable")) return this.getAttribute("deletable") !== "false";
      const c = this.closest("time-line-container");
      return c ? c.deletable : true;
    }
    set deletable(v) {
      if (v == null) this.removeAttribute("deletable");
      else this.setAttribute("deletable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许清空本轨道所有段（右键菜单"清空时间段"），默认继承容器值或 true */
    get clearable() {
      if (this.hasAttribute("clearable")) return this.getAttribute("clearable") !== "false";
      const c = this.closest("time-line-container");
      return c ? c.clearable : true;
    }
    set clearable(v) {
      if (v == null) this.removeAttribute("clearable");
      else this.setAttribute("clearable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许复制本轨道的段（菜单"复制段/轨道"），默认继承容器值或 true */
    get copyable() {
      if (this.hasAttribute("copyable")) return this.getAttribute("copyable") !== "false";
      const c = this.closest("time-line-container");
      return c ? c.copyable : true;
    }
    set copyable(v) {
      if (v == null) this.removeAttribute("copyable");
      else this.setAttribute("copyable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许创建新段（拖拽创建），默认继承容器值或 true */
    get creatable() {
      if (this.hasAttribute("creatable")) return this.getAttribute("creatable") !== "false";
      const c = this.closest("time-line-container");
      return c ? c.creatable : true;
    }
    set creatable(v) {
      if (v == null) this.removeAttribute("creatable");
      else this.setAttribute("creatable", v === false || v === "false" ? "false" : "true");
    }
    get isVertical() {
      const c = this.closest("time-line-container");
      if (!c) return false;
      const d = c.getAttribute("direction") || "";
      return d === "vertical";
    }
    /** 从容器获取 Formatter（找不到时用默认 TimeFormatter） */
    get _formatter() {
      const c = this.closest("time-line-container");
      return c ? c.getFormatter() : this._fmtFallback || (this._fmtFallback = createFormatter("time", "hour"));
    }
    /** 横向模式轴标签位置：从容器读取 */
    get labelH() {
      const c = this.closest("time-line-container");
      return c ? c.labelH : "top";
    }
    /** 纵向模式轴标签位置：从容器读取 */
    get labelV() {
      const c = this.closest("time-line-container");
      return c ? c.labelV : "right";
    }
    /* ---- 数据关联 ---- */
    /**
     * 用户自定义标识符
     * 事件回调的 detail 中直接携带此值，便于在 Vue/React 等响应式数据中按 ID 查找
     * 设置方式：track.key = 'my-track-id'
     * @type {string|number}
     */
    get key() {
      if (this._trackKey === void 0) this._trackKey = nextKey();
      return this._trackKey;
    }
    set key(v) {
      this._trackKey = v;
    }
    /* ---- 公共 API ---- */
    /** 按时间排序所有段 */
    sortedSegs() {
      const arr = Array.from(this.querySelectorAll(":scope .tlt-seg-area > time-line-segment"));
      arr.sort((a, b) => a.start - b.start);
      return arr;
    }
    /** 像素 → 时间值 */
    px2Time(px) {
      const r = this._segRect();
      if (!r) return 0;
      const dim = this.isVertical ? r.height : r.width;
      if (!dim) return 0;
      const { start: ts, end: te } = this._effRange();
      return px / dim * (te - ts);
    }
    /** 时间值 → 像素 */
    time2Px(t) {
      const r = this._segRect();
      if (!r) return 0;
      const dim = this.isVertical ? r.height : r.width;
      const { start: ts, end: te } = this._effRange();
      return (t - ts) / (te - ts) * dim;
    }
    /** 编程式创建时间段 */
    addSegment(start, end, opts = {}) {
      if (!this._checkSegmentLimit()) return null;
      const { start: ts, end: te } = this._effRange();
      start = clamp(start, ts, te);
      end = clamp(end, ts, te);
      const existing = this.sortedSegs();
      for (const seg2 of existing) {
        if (start < seg2.end && end > seg2.start) {
          const fmt = this._formatter;
          const loc = resolveLocale(this);
          const msg = loc.segmentOverlapError.replace("{start}", fmt.format(start)).replace("{end}", fmt.format(end)).replace("{label}", seg2.label || loc.unnamed).replace("{segStart}", fmt.format(seg2.start)).replace("{segEnd}", fmt.format(seg2.end));
          throw new Error("addSegment " + msg);
        }
      }
      const seg = document.createElement("time-line-segment");
      seg.start = start;
      seg.end = end;
      if (opts.label) seg.label = opts.label;
      seg.color = opts.color || this.defaultColor;
      if (opts.radius) seg.radius = opts.radius;
      this._segArea().appendChild(seg);
      requestAnimationFrame(() => {
        this._positionOne(seg);
        this._drawGrid();
      });
      this.dispatchEvent(new CustomEvent("segment-created", {
        bubbles: true,
        detail: { segment: seg, key: seg.key }
      }));
      return seg;
    }
    /** 清空本轨道所有时间段 */
    clearAllSegments() {
      this.sortedSegs().forEach((s) => s.remove());
    }
    /**
     * 程序化删除本轨道（发送可取消事件）
     * 对应右键菜单「删除轨道」
     */
    deleteTrack() {
      const ok = this.dispatchEvent(new CustomEvent("track-before-delete", {
        bubbles: true,
        cancelable: true,
        detail: { track: this, key: this.key }
      }));
      if (!ok) return;
      this.remove();
      this.dispatchEvent(new CustomEvent("track-deleted", {
        bubbles: true,
        detail: { track: this, key: this.key }
      }));
    }
    /**
     * 打开轨道属性编辑弹窗
     * 对应右键菜单「修改属性」
     */
    editTrack() {
      showTrackEditDialog(this);
    }
    /* ---- 复制/粘贴 ---- */
    /**
     * 复制本轨道全部段到剪贴板（覆写已有剪贴板内容）
     * 对应右键菜单「复制轨道」
     */
    copyTrack() {
      clearClipboard();
      const segs = this.sortedSegs().map((s) => ({
        label: s.label,
        color: s.color,
        start: s.start,
        end: s.end,
        radius: s.radius
      }));
      copyToClipboard("track", {
        label: this.label,
        segments: segs
      });
      this._pulseCopy();
    }
    /**
     * 在指定坐标位置粘贴段（段数据放到指针所在时间位置）
     * 对应右键菜单「粘贴段」
     * @param {object} data - 段数据 { label, color, start, end }
     * @param {number} [clientX] - 屏幕 X 坐标，缺省时使用段区域中心
     * @param {number} [clientY] - 屏幕 Y 坐标，缺省时使用段区域中心
     */
    pasteSegment(data, clientX, clientY) {
      const rect = this._segRect();
      if (!rect) return;
      if (clientX == null || clientY == null) {
        clientX = rect.left + rect.width / 2;
        clientY = rect.top + rect.height / 2;
      }
      const v = this.isVertical;
      const cp = v ? clientY : clientX;
      const orig = v ? rect.top : rect.left;
      const dim = v ? rect.height : rect.width;
      if (!dim) return;
      const { start: ts, end: te } = this._effRange();
      const duration = data.end - data.start;
      let start = ts + (cp - orig) / dim * (te - ts);
      if (this.step > 0) start = snap(start, this.step);
      let end = start + duration;
      const { start: dbS, end: dbE } = this._dragBounds();
      if (end > dbE) {
        start = dbE - duration;
        end = dbE;
      }
      if (start < dbS) {
        start = dbS;
        end = dbS + duration;
      }
      try {
        const seg = this.addSegment(start, end, {
          label: data.label,
          color: data.color
        });
        if (seg) seg._pulseCopy();
      } catch (_) {
      }
    }
    /**
     * 从剪贴板轨道数据创建新轨道
     * 对应右键菜单「粘贴为新轨道」
     */
    pasteNewTrack(data) {
      const container = this.closest("time-line-container");
      if (!container) return;
      const label = data.label ? data.label + "（副本）" : "";
      const track = container.addTrack(label, this.tStart, this.tEnd);
      for (const sd of data.segments) {
        try {
          track.addSegment(sd.start, sd.end, { label: sd.label, color: sd.color });
        } catch (_) {
        }
      }
      track._pulseCopy();
    }
    /**
     * 用剪贴板轨道数据覆盖本轨道所有段
     * 对应右键菜单「覆盖粘贴到本轨道」
     */
    pasteOverwrite(data) {
      this.clearAllSegments();
      for (const sd of data.segments) {
        try {
          this.addSegment(sd.start, sd.end, { label: sd.label, color: sd.color });
        } catch (_) {
        }
      }
      this._pulseCopy();
    }
    /** 脉冲动画反馈 */
    _pulseCopy() {
      const row = this.querySelector(":scope > .tlt-row");
      if (!row) return;
      row.classList.remove("tlt-copy-pulse");
      void row.offsetHeight;
      row.classList.add("tlt-copy-pulse");
      setTimeout(() => row.classList.remove("tlt-copy-pulse"), 1200);
    }
    /* ---- 生命周期 ---- */
    connectedCallback() {
      if (this._init) {
        this._onDirChange();
        return;
      }
      this._init = true;
      this._render();
    }
    disconnectedCallback() {
      if (this._mutObs) this._mutObs.disconnect();
      if (this._trackMutObs) this._trackMutObs.disconnect();
      if (this._resObs) this._resObs.disconnect();
      if (this._winResizeHandler) window.removeEventListener("resize", this._winResizeHandler);
    }
    static get observedAttributes() {
      return ["label", "start", "end", "step", "min-duration", "max-segments", "editable", "deletable", "creatable", "clearable", "copyable"];
    }
    attributeChangedCallback(name, _ov, nv) {
      if (!this._init) return;
      if (name === "label") {
        const el = this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-label");
        if (el) {
          const loc = resolveLocale(this);
          const txt = this.label || loc.unnamed;
          el.textContent = txt;
          el.title = txt;
        }
      } else if (name === "editable" || name === "deletable" || name === "creatable") {
        this.querySelectorAll("time-line-segment").forEach((seg) => {
          if (seg._buildDOM) seg._buildDOM();
        });
      } else {
        requestAnimationFrame(() => {
          this._drawGrid();
          this._refreshPositions();
        });
      }
    }
    /* ---- 初次渲染 ---- */
    _render() {
      const chips = Array.from(this.children).filter((c) => c.tagName === "TIME-LINE-SEGMENT");
      const v = this.isVertical;
      this.classList.toggle("vertical", v);
      const loc = resolveLocale(this);
      const labelTxt = this.label || loc.unnamed;
      this.innerHTML = "";
      this.append(
        h("div", { class: "tlt-row" }, [
          h("div", { class: "tlt-head" }, [
            h("span", { class: "tlt-head-label", title: labelTxt }, labelTxt),
            h("span", { class: "tlt-head-range" }, this._formatter.formatRange(this.tStart, this.tEnd, "axis"))
          ]),
          h("div", { class: "tlt-body" }, [
            h("canvas", { class: "tlt-grid-canvas" }),
            h("div", { class: "tlt-seg-area" })
          ])
        ])
      );
      if (this._isSharedMode()) {
        const headRange = this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");
        if (headRange) headRange.style.display = "none";
      }
      const area = this._segArea();
      chips.forEach((c) => area.appendChild(c));
      const body = this.querySelector(".tlt-body");
      body.addEventListener("pointerdown", (e) => this._bodyDown(e));
      this.addEventListener("contextmenu", (e) => {
        if (this._creating) return;
        e.preventDefault();
        const l = resolveLocale(this);
        const trackLabel = this.label || l.unnamed;
        const clip = getClipboard();
        const menuItems = [
          { type: "header", label: l.trackMenuHeader.replace("{name}", trackLabel) }
        ];
        if (this.editable) {
          menuItems.push({ label: l.modifyProps, action: () => this.editTrack() });
        }
        if (clip && clip.type === "segment" && this.creatable) {
          menuItems.push({ label: l.pasteSegment, action: () => {
            this.pasteSegment(clip.data, e.clientX, e.clientY);
          } });
        }
        if (clip && clip.type === "track" && this.creatable) {
          const container = this.closest("time-line-container");
          if (container && container.creatable) {
            menuItems.push({ label: l.pasteNewTrack, action: () => {
              this.pasteNewTrack(clip.data);
            } });
          }
        }
        if (clip && clip.type === "track" && this.deletable) {
          menuItems.push({ label: l.pasteOverwrite, action: () => {
            this.pasteOverwrite(clip.data);
          } });
        }
        if (this.copyable) {
          menuItems.push({ label: l.copyTrack, action: () => {
            this.copyTrack();
          } });
          menuItems.push({ label: l.copyToTracks, action: () => {
            showCopyToTracksDialog(this);
          } });
        }
        if (this.clearable) {
          menuItems.push({ label: l.clearSegments, action: () => {
            showDeleteConfirm(
              l.confirmClearSegments.replace("{name}", trackLabel),
              () => this.clearAllSegments(),
              this
            );
          } });
        }
        if (this.deletable) {
          menuItems.push({ label: l.deleteTrack, danger: true, action: () => {
            showDeleteConfirm(
              l.confirmDeleteTrack.replace("{name}", trackLabel).replace("{range}", this._formatter.formatRange(this.tStart, this.tEnd, "axis")),
              () => {
                this.deleteTrack();
              },
              this
            );
          } });
        }
        if (menuItems.length > 1) {
          const labelEl = this.querySelector(".tlt-head-label");
          showContextMenu(menuItems, e.clientX, e.clientY, labelEl);
        }
      });
      this._resObs = new ResizeObserver(() => {
        this._drawGrid();
        this._refreshPositions();
      });
      this._resObs.observe(body);
      this._mutObs = new MutationObserver((muts) => {
        let dirty = false;
        for (const m of muts) {
          if (m.type !== "childList") continue;
          if (m.addedNodes.length || m.removedNodes.length) dirty = true;
        }
        if (dirty) {
          requestAnimationFrame(() => {
            this._refreshPositions();
            this._drawGrid();
          });
        }
      });
      this._mutObs.observe(this._segArea(), { childList: true });
      this._resizeRaf = null;
      this._winResizeHandler = () => {
        if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
        this._resizeRaf = requestAnimationFrame(() => {
          this._drawGrid();
          this._refreshPositions();
        });
      };
      window.addEventListener("resize", this._winResizeHandler);
      this._trackMutObs = new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.type !== "childList") continue;
          for (const n of m.addedNodes) {
            if (n.nodeType === 1 && n.tagName === "TIME-LINE-SEGMENT") {
              this._segArea().appendChild(n);
            }
          }
        }
      });
      this._trackMutObs.observe(this, { childList: true });
      this._applyLabelPos();
      requestAnimationFrame(() => {
        this._drawGrid();
        this._refreshPositions();
      });
      this._updateClipOverlay();
    }
    /** 方向变更时重新应用布局 */
    _onDirChange() {
      const v = this.isVertical;
      this.classList.toggle("vertical", v);
      this._applyLabelPos();
      this._updateClipOverlay();
      requestAnimationFrame(() => {
        this._drawGrid();
        this._refreshPositions();
      });
    }
    /** 根据容器 label-h/label-v 属性调整 seg-area 间距 */
    _applyLabelPos() {
      const area = this._segArea();
      if (!area) return;
      const c = this.closest("time-line-container");
      const isShared = c && c.axisMode === "shared";
      const cs = getComputedStyle(this);
      const axisGap = parseFloat(cs.getPropertyValue("--tlt-axis-gap")) || 36;
      const segTop = parseFloat(cs.getPropertyValue("--tlt-seg-top")) || 18;
      const segBot = parseFloat(cs.getPropertyValue("--tlt-seg-bottom")) || 0;
      if (isShared && c && c.axisRulerActive) {
        area.style.left = "0";
        area.style.right = "0";
        area.style.top = "0";
        area.style.bottom = "0";
        return;
      }
      if (isShared && this.isVertical) {
        area.style.left = this.labelV === "left" ? axisGap + "px" : "0";
        area.style.right = this.labelV === "left" ? "0" : axisGap + "px";
        area.style.top = "";
        area.style.bottom = "";
        return;
      }
      if (this.isVertical) {
        area.style.left = this.labelV === "left" ? axisGap + "px" : "0";
        area.style.right = this.labelV === "left" ? "0" : axisGap + "px";
        area.style.top = "";
        area.style.bottom = "";
      } else {
        area.style.left = "";
        area.style.right = "";
        area.style.top = this.labelH === "bottom" ? segBot + "px" : segTop + "px";
        area.style.bottom = this.labelH === "bottom" ? segTop + "px" : segBot + "px";
      }
    }
    /** 轴标签位置属性变更后的响应 */
    _onLabelPosChange() {
      this._applyLabelPos();
      requestAnimationFrame(() => {
        this._drawGrid();
        this._refreshPositions();
      });
    }
    /** 容器 editable/deletable 属性变更时的响应：刷新子段 DOM */
    _onEditableChange() {
      this.querySelectorAll("time-line-segment").forEach((seg) => {
        if (seg._buildDOM) seg._buildDOM();
      });
    }
    /** 容器 locale 属性变更时的响应：刷新头部标签文字 */
    _onLocaleChange() {
      const el = this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-label");
      if (el) {
        const loc = resolveLocale(this);
        const txt = this.label || loc.unnamed;
        el.textContent = txt;
        el.title = txt;
      }
    }
    /* ---- 内部 DOM 快捷方法 ---- */
    _bodyEl() {
      return this.querySelector(":scope > .tlt-row > .tlt-body");
    }
    _canvasEl() {
      return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-grid-canvas");
    }
    _segArea() {
      return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-seg-area");
    }
    _segRect() {
      const a = this._segArea();
      return a ? a.getBoundingClientRect() : null;
    }
    /* ---- 拖拽创建 ---- */
    _bodyDown(e) {
      if (e.button !== 0) return;
      if (!this.creatable) return;
      const path = e.composedPath();
      if (path.some((el) => el.tagName === "TIME-LINE-SEGMENT")) return;
      const rect = this._segRect();
      if (!rect) return;
      const v = this.isVertical;
      const cp = v ? e.clientY : e.clientX;
      const orig = v ? rect.top : rect.left;
      const dim = v ? rect.height : rect.width;
      if (!dim) return;
      this._creating = true;
      const _eff = this._effRange();
      this._crS = _eff.start + (cp - orig) / dim * (_eff.end - _eff.start);
      const { start: dbS, end: dbE } = this._dragBounds();
      if (this._crS < dbS || this._crS > dbE) {
        this._creating = false;
        return;
      }
      this._crP0 = cp;
      this._ghost = document.createElement("div");
      this._ghost.className = "tlt-ghost";
      this._ghost.innerHTML = '<span class="tlt-ghost-label"></span>';
      this._segArea().appendChild(this._ghost);
      this._ghostLabel = this._ghost.querySelector(".tlt-ghost-label");
      if (this._ghostLabel) this._ghostLabel.textContent = this._formatter.format(this._crS, "tooltip");
      if (v) {
        const y = this.time2Px(this._crS);
        this._ghost.style.cssText = `left:0;right:0;top:${y}px;height:2px;`;
      } else {
        const x = this.time2Px(this._crS);
        this._ghost.style.cssText = `top:0;bottom:0;left:${x}px;width:2px;`;
      }
      this.setPointerCapture(e.pointerId);
      const onM = (ev) => this._createMove(ev);
      const onU = (ev) => this._createUp(ev, onM, onU);
      this.addEventListener("pointermove", onM);
      this.addEventListener("pointerup", onU);
      this.addEventListener("pointercancel", onU);
      e.preventDefault();
    }
    _createMove(e) {
      if (!this._creating || !this._ghost) return;
      const v = this.isVertical;
      const cp = v ? e.clientY : e.clientX;
      const t1 = this._crS;
      const rect = this._segRect();
      if (!rect) return;
      const orig = v ? rect.top : rect.left;
      const dim = v ? rect.height : rect.width;
      const _eff = this._effRange();
      let t2 = _eff.start + (cp - orig) / dim * (_eff.end - _eff.start);
      const { start: dbS, end: dbE } = this._dragBounds();
      t2 = clamp(t2, dbS, dbE);
      const lo = Math.min(t1, t2), hi = Math.max(t1, t2);
      const p1 = this.time2Px(lo), p2 = this.time2Px(hi);
      if (this._ghostLabel) {
        this._ghostLabel.textContent = this._formatter.formatRange(lo, hi, "tooltip");
      }
      if (v) {
        this._ghost.style.top = p1 + "px";
        this._ghost.style.height = Math.max(3, p2 - p1) + "px";
      } else {
        this._ghost.style.left = p1 + "px";
        this._ghost.style.width = Math.max(3, p2 - p1) + "px";
      }
    }
    _createUp(e, onM, onU) {
      this._creating = false;
      this.removeEventListener("pointermove", onM);
      this.removeEventListener("pointerup", onU);
      this.removeEventListener("pointercancel", onU);
      if (this._ghost) {
        this._ghost.remove();
        this._ghost = null;
      }
      this._ghostLabel = null;
      const v = this.isVertical;
      const cp = v ? e.clientY : e.clientX;
      const rect = this._segRect();
      if (!rect) return;
      const orig = v ? rect.top : rect.left;
      const dim = v ? rect.height : rect.width;
      const _eff = this._effRange();
      const t2 = _eff.start + (cp - orig) / dim * (_eff.end - _eff.start);
      let lo = Math.min(this._crS, t2), hi = Math.max(this._crS, t2);
      if (this.step) {
        const vis = this._effRange();
        const visRange = vis.end - vis.start;
        const body = this._bodyEl();
        let axisStep = 0;
        if (body) {
          const bodyRect = body.getBoundingClientRect();
          const dim2 = this.isVertical ? bodyRect.height : bodyRect.width;
          axisStep = this._formatter.niceStep(visRange, dim2);
        }
        const effStep = Math.min(this.step, (axisStep || visRange * 0.05) / 2);
        lo = snap(lo, effStep);
        hi = snap(hi, effStep);
      }
      const exist = this.sortedSegs();
      for (const seg of exist) {
        if (lo < seg.end && hi > seg.start) {
          if (this._crS < seg.start) hi = Math.min(hi, seg.start);
          else lo = Math.max(lo, seg.end);
        }
      }
      const { start: ts, end: te } = this._dragBounds();
      lo = clamp(lo, ts, te);
      hi = clamp(hi, ts, te);
      if (hi - lo >= this.minDur) {
        if (!this._checkSegmentLimit()) return;
        this.addSegment(lo, hi, { color: this.defaultColor });
      }
    }
    /** 检查当前段数是否已达上限，超限则派发事件并阻止创建 */
    _checkSegmentLimit() {
      const max = this.maxSegments;
      if (max <= 0) return true;
      const current = this.sortedSegs().length;
      if (current < max) return true;
      this.dispatchEvent(new CustomEvent("segment-limit-reached", {
        bubbles: true,
        detail: { track: this, key: this.key, current, max }
      }));
      return false;
    }
    /* ---- 网格绘制 ---- */
    _drawGrid() {
      const canvas = this._canvasEl();
      const body = this._bodyEl();
      if (!canvas || !body) return;
      const rect = body.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      const fmt = this._formatter;
      const v = this.isVertical;
      const { start: gridStart, end: gridEnd } = this._effRange();
      const range = gridEnd - gridStart;
      if (!range) return;
      const dim = v ? rect.height : rect.width;
      const step = fmt.niceStep(range, dim);
      const segRect = this._segRect();
      const offX = segRect ? segRect.left - rect.left : 5;
      const offY = segRect ? segRect.top - rect.top : v ? 5 : 0;
      ctx.strokeStyle = "#f0f2f5";
      ctx.lineWidth = 0.5;
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step / 2) {
        this._drawLine(ctx, rect, t, v, offX, offY);
      }
      ctx.strokeStyle = "#dde0e4";
      ctx.lineWidth = 0.7;
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
        this._drawLine(ctx, rect, t, v, offX, offY);
      }
      if (this._isSharedMode()) {
        const c = this.closest("time-line-container");
        if (c && c.axisRulerActive) return;
      }
      ctx.fillStyle = "#7a8591";
      ctx.font = "10px -apple-system,BlinkMacSystemFont,sans-serif";
      fmt.showSec = step < 1 / 60;
      if (v) {
        ctx.textBaseline = "middle";
        ctx.textAlign = this.labelV === "left" ? "left" : "right";
        const labelX = this.labelV === "left" ? 6 : rect.width - 6;
        let _lastTLabel = "";
        for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
          const px = this.time2Px(t);
          if (px > 14 && px < rect.height - 8) {
            const text = fmt.format(t, "axis");
            if (text !== _lastTLabel) {
              ctx.fillText(text, labelX, px + offY);
              _lastTLabel = text;
            }
          }
        }
        const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd);
        if (sp <= 14) {
          const tick = Math.floor(gridStart / step) * step + step;
          const nextPx = tick <= gridEnd ? this.time2Px(tick) : rect.height;
          const drawPx = sp + offY + 10;
          if (nextPx - drawPx > 28) {
            if (tick > gridEnd || fmt.format(gridStart, "axis") !== fmt.format(tick, "axis")) {
              ctx.fillText(fmt.format(gridStart, "axis"), labelX, drawPx);
            }
          }
        }
        if (ep >= rect.height - 8) {
          const lastTick = Math.floor(gridEnd / step) * step;
          const prevPx = lastTick > gridStart ? this.time2Px(lastTick) : 0;
          const drawPx = ep + offY - 10;
          if (drawPx - prevPx > 28) {
            if (!_lastTLabel || fmt.format(gridEnd, "axis") !== _lastTLabel) {
              ctx.fillText(fmt.format(gridEnd, "axis"), labelX, drawPx);
            }
          }
        }
      } else {
        ctx.textAlign = "center";
        ctx.textBaseline = this.labelH === "bottom" ? "bottom" : "top";
        const labelY = this.labelH === "bottom" ? rect.height - 4 : 4;
        let _lastHLabel = "";
        for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
          const px = this.time2Px(t);
          if (px > 24 && px < rect.width - 24) {
            const text = fmt.format(t, "axis");
            if (text === _lastHLabel) continue;
            ctx.fillText(text, px + offX, labelY);
            _lastHLabel = text;
          }
        }
        const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd);
        ctx.textAlign = "left";
        if (sp <= 24) {
          const tick = Math.floor(gridStart / step) * step + step;
          const nextPx = tick <= gridEnd ? this.time2Px(tick) : rect.width;
          const drawX = Math.max(sp + offX, 2);
          if (nextPx - drawX > 28) {
            if (tick > gridEnd || fmt.format(gridStart, "axis") !== fmt.format(tick, "axis")) {
              ctx.fillText(fmt.format(gridStart, "axis"), drawX, labelY);
            }
          }
        }
        ctx.textAlign = "right";
        if (ep >= rect.width - 24) {
          const lastTick = Math.floor(gridEnd / step) * step;
          const prevPx = lastTick > gridStart ? this.time2Px(lastTick) : 0;
          const drawX = Math.min(ep + offX, rect.width - 2);
          if (drawX - prevPx > 28) {
            if (!_lastHLabel || fmt.format(gridEnd, "axis") !== _lastHLabel) {
              ctx.fillText(fmt.format(gridEnd, "axis"), drawX, labelY);
            }
          }
        }
      }
    }
    _drawLine(ctx, bodyRect, t, vertical, offX, offY) {
      const px = this.time2Px(t);
      if (vertical) {
        const y = px + offY;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(bodyRect.width, y);
        ctx.stroke();
      } else {
        const x = px + offX;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, bodyRect.height);
        ctx.stroke();
      }
    }
    /** @deprecated 委托给 this._formatter.niceStep */
    _niceStep(range, pxSize) {
      return this._formatter.niceStep(range, pxSize);
    }
    /* ---- 段定位 ---- */
    /**
     * 计算单个段的像素位置与动态最小宽度
     * 最小宽度考虑与下一段之间的可用空间，避免视觉重叠
     * @param {TimeSegment} seg - 要定位的段元素
     * @param {number} [bulkDim] - 批量刷新时传入的总尺寸，避免重复 getBoundingClientRect
     */
    _positionOne(seg, bulkDim) {
      const r = bulkDim ? null : this._segRect();
      if (!r && bulkDim == null) return;
      const { start: ts, end: te } = this._effRange();
      const range = te - ts;
      if (!range) return;
      const v = this.isVertical;
      const dim = bulkDim ?? (v ? r.height : r.width);
      const cs = getComputedStyle(this);
      const segSizeVar = v ? cs.getPropertyValue("--tls-width").trim() : cs.getPropertyValue("--tls-height").trim();
      const useCustomSize = segSizeVar && segSizeVar !== "auto" && segSizeVar !== "100%";
      let p1 = (seg.start - ts) / range * dim;
      let p2 = (seg.end - ts) / range * dim;
      if (p1 < 0) p1 = 0;
      if (p2 > dim) p2 = dim;
      if (p1 >= dim || p2 <= 0) {
        seg.style.display = "none";
        return;
      }
      seg.style.display = "";
      const segs = this.sortedSegs();
      const idx = segs.indexOf(seg);
      let rightBound = dim;
      if (idx >= 0 && idx < segs.length - 1) {
        const nStart = (segs[idx + 1].start - ts) / range * dim;
        if (nStart >= p2) rightBound = nStart;
      }
      const avail = rightBound - p1;
      const minW = Math.min(2, avail);
      const segW = Math.min(Math.max(p2 - p1, minW), avail);
      if (v) {
        seg.style.top = p1 + "px";
        seg.style.left = "0";
        seg.style.right = "0";
        seg.style.height = segW + "px";
        seg.style.width = useCustomSize ? segSizeVar : "";
        seg.style.bottom = "";
        seg.style.margin = useCustomSize ? "0 auto" : "";
      } else {
        seg.style.left = p1 + "px";
        seg.style.top = "0";
        seg.style.bottom = "0";
        seg.style.width = segW + "px";
        seg.style.height = useCustomSize ? segSizeVar : "";
        seg.style.right = "";
        seg.style.margin = useCustomSize ? "auto 0" : "";
      }
      seg.classList.toggle("tls-del-hidden", segW < 28);
      seg._updateTextVisibility();
    }
    /**
     * 批量刷新所有段的位置（含重叠预防）
     * 一次计算总尺寸，所有段共享，避免反复 layout thrashing
     */
    _refreshPositions() {
      this._updateClipOverlay();
      const segs = this.sortedSegs();
      if (!segs.length) return;
      const r = this._segRect();
      if (!r) return;
      const { start: ts, end: te } = this._effRange();
      const range = te - ts;
      if (!range) return;
      const v = this.isVertical;
      const dim = v ? r.height : r.width;
      const cs = getComputedStyle(this);
      const segSizeVar = v ? cs.getPropertyValue("--tls-width").trim() : cs.getPropertyValue("--tls-height").trim();
      const useCustomSize = segSizeVar && segSizeVar !== "auto" && segSizeVar !== "100%";
      const lefts = segs.map((s) => (s.start - ts) / range * dim);
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        let p1 = lefts[i];
        let p2 = (seg.end - ts) / range * dim;
        if (p1 < 0) p1 = 0;
        if (p2 > dim) p2 = dim;
        if (p1 >= dim || p2 <= 0) {
          seg.style.display = "none";
          continue;
        }
        seg.style.display = "";
        let rightBound = dim;
        if (i < segs.length - 1) {
          const nStart = lefts[i + 1];
          if (nStart >= p2) rightBound = nStart;
        }
        const avail = rightBound - p1;
        const minW = Math.min(2, avail);
        const segW = Math.min(Math.max(p2 - p1, minW), avail);
        if (v) {
          seg.style.top = p1 + "px";
          seg.style.left = "0";
          seg.style.right = "0";
          seg.style.height = segW + "px";
          seg.style.width = useCustomSize ? segSizeVar : "";
          seg.style.bottom = "";
          seg.style.margin = useCustomSize ? "0 auto" : "";
        } else {
          seg.style.left = p1 + "px";
          seg.style.top = "0";
          seg.style.bottom = "0";
          seg.style.width = segW + "px";
          seg.style.height = useCustomSize ? segSizeVar : "";
          seg.style.right = "";
          seg.style.margin = useCustomSize ? "auto 0" : "";
        }
        seg.classList.toggle("tls-del-hidden", segW < 28);
      }
      if (this._segTextCheckRaf) cancelAnimationFrame(this._segTextCheckRaf);
      this._segTextCheckRaf = requestAnimationFrame(() => {
        this._segTextCheckRaf = 0;
        segs.forEach((s) => s.classList.toggle("tls-text-hidden", s._isTruncated()));
      });
    }
    /** 是否处于共享轴模式 */
    _isSharedMode() {
      const c = this.closest("time-line-container");
      return c && c.axisMode === "shared";
    }
    /** 有效时间范围（缩放 > 共享轴 > 独立轴） */
    _effRange() {
      const c = this.closest("time-line-container");
      if (!c) return { start: this.tStart, end: this.tEnd };
      if (c.zoomStart != null && c.zoomEnd != null) {
        return { start: c.zoomStart, end: c.zoomEnd };
      }
      if (c.axisMode === "shared") return { start: c.sharedStart, end: c.sharedEnd };
      return { start: this.tStart, end: this.tEnd };
    }
    /**
     * 拖拽约束范围（共享轴裁剪模式时仅限轨道自身范围）
     * 段在该范围内可自由拖拽，防止越界到其他轨道的不可见区域
     */
    _dragBounds() {
      const c = this.closest("time-line-container");
      if (c && c.sharedClipRange && this._isSharedMode()) {
        return { start: this.tStart, end: this.tEnd };
      }
      return this._effRange();
    }
    /** 共享轴配置变更时回调 */
    _onSharedConfigChange() {
      const c = this.closest("time-line-container");
      const headRange = this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");
      if (this._isSharedMode()) {
        if (headRange) headRange.style.display = "none";
        if (c && c.sharedClipRange) {
          const { start: ts, end: te } = { start: this.tStart, end: this.tEnd };
          for (const seg of this.sortedSegs()) {
            seg.start = clamp(seg.start, ts, te);
            seg.end = clamp(seg.end, ts, te);
          }
        }
      } else {
        if (headRange) headRange.style.display = "";
        const { start: ts, end: te } = { start: this.tStart, end: this.tEnd };
        for (const seg of this.sortedSegs()) {
          seg.start = clamp(seg.start, ts, te);
          seg.end = clamp(seg.end, ts, te);
        }
      }
      this._applyLabelPos();
      this._updateClipOverlay();
      requestAnimationFrame(() => {
        this._drawGrid();
        this._refreshPositions();
      });
    }
    /** 视图范围（缩放）变更时回调：仅重绘，不做模式切换相关操作 */
    _onViewRangeChange() {
      requestAnimationFrame(() => {
        this._drawGrid();
        this._refreshPositions();
      });
    }
    /* ---- 共享轴裁剪模式遮罩 ---- */
    /**
     * 在 seg-area 上叠加半透明斜纹遮罩，标识不可拖拽区域
     * 仅 shared-clip-range 开启且在共享轴模式时生效
     */
    _updateClipOverlay() {
      const c = this.closest("time-line-container");
      const active = c && c.sharedClipRange && this._isSharedMode();
      const area = this._segArea();
      if (!area) return;
      let overlay = area.querySelector(":scope > .tlt-clip-overlay");
      if (!active) {
        if (overlay) overlay.remove();
        return;
      }
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "tlt-clip-overlay";
        overlay.innerHTML = '<div class="tlt-clip-block tlt-clip-left"></div><div class="tlt-clip-block tlt-clip-right"></div>';
        area.appendChild(overlay);
      }
      const { start: sharedStart, end: sharedEnd } = this._effRange();
      const range = sharedEnd - sharedStart;
      if (!range) return;
      const dim = this.isVertical ? area.offsetHeight : area.offsetWidth;
      if (!dim) return;
      const leftPx = (this.tStart - sharedStart) / range * dim;
      const rightPx = (this.tEnd - sharedStart) / range * dim;
      const leftBlock = overlay.querySelector(".tlt-clip-left");
      const rightBlock = overlay.querySelector(".tlt-clip-right");
      if (this.isVertical) {
        Object.assign(leftBlock.style, { left: "0", right: "0", top: "0", height: leftPx + "px", bottom: "auto" });
        Object.assign(rightBlock.style, { left: "0", right: "0", top: rightPx + "px", bottom: "0", height: "auto" });
      } else {
        Object.assign(leftBlock.style, { top: "0", bottom: "0", left: "0", width: leftPx + "px", right: "auto" });
        Object.assign(rightBlock.style, { top: "0", bottom: "0", left: rightPx + "px", right: "0", width: "auto" });
      }
    }
  }
  let _globalTip = null;
  function _getGlobalTip() {
    if (_globalTip) return _globalTip;
    _globalTip = document.createElement("div");
    _globalTip.className = "tls-global-tip";
    document.body.appendChild(_globalTip);
    return _globalTip;
  }
  let _tipHideTimer = 0;
  function showGlobalTip(seg) {
    clearTimeout(_tipHideTimer);
    const tip = _getGlobalTip();
    const segRect = seg.getBoundingClientRect();
    let side = "top", align = "center";
    const segPos = seg.getAttribute("tooltip-pos");
    if (segPos) {
      const parts = segPos.split("-");
      if (["top", "bottom", "left", "right"].includes(parts[0])) side = parts[0];
      if (["start", "center", "end"].includes(parts[1])) align = parts[1];
    } else {
      const c = seg.closest("time-line-container");
      if (c) {
        const pos = (c.tooltipPos || "top-center").split("-");
        side = pos[0] || "top";
        align = pos[1] || "center";
      }
    }
    const fmt = seg._formatter;
    tip.innerHTML = "";
    tip.append(...[
      seg.label ? h("div", { class: "tls-global-tip-label" }, seg.label) : null,
      h("div", { class: "tls-global-tip-time" }, fmt.formatRange(
        Math.min(seg.start, seg.end),
        Math.max(seg.start, seg.end),
        "tooltip"
      ))
    ].filter(Boolean));
    tip.className = "tls-global-tip";
    tip.classList.add(side, align);
    tip.style.removeProperty("--tlc-arrow-left");
    tip.style.removeProperty("--tlc-arrow-top");
    tip.style.left = "-9999px";
    tip.style.top = "-9999px";
    const tipRect = tip.getBoundingClientRect();
    const tipW = tipRect.width;
    const tipH = tipRect.height;
    const gap = 6;
    const MARGIN = 8;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    let left, top;
    switch (side) {
      case "top":
        top = segRect.top - tipH - gap;
        if (align === "start") {
          left = segRect.left;
          tip.style.setProperty("--tlc-arrow-left", "12px");
        } else if (align === "end") {
          left = segRect.right - tipW;
          tip.style.setProperty("--tlc-arrow-left", "calc(100% - 12px)");
        } else {
          left = segRect.left + segRect.width / 2 - tipW / 2;
        }
        left = clamp(left, MARGIN, vpW - tipW - MARGIN);
        break;
      case "bottom":
        top = segRect.bottom + gap;
        if (align === "start") {
          left = segRect.left;
          tip.style.setProperty("--tlc-arrow-left", "12px");
        } else if (align === "end") {
          left = segRect.right - tipW;
          tip.style.setProperty("--tlc-arrow-left", "calc(100% - 12px)");
        } else {
          left = segRect.left + segRect.width / 2 - tipW / 2;
        }
        left = clamp(left, MARGIN, vpW - tipW - MARGIN);
        break;
      case "left":
        left = segRect.left - tipW - gap;
        if (align === "start") {
          top = segRect.top;
          tip.style.setProperty("--tlc-arrow-top", "12px");
        } else if (align === "end") {
          top = segRect.bottom - tipH;
          tip.style.setProperty("--tlc-arrow-top", "calc(100% - 12px)");
        } else {
          top = segRect.top + segRect.height / 2 - tipH / 2;
        }
        top = clamp(top, MARGIN, vpH - tipH - MARGIN);
        break;
      case "right":
        left = segRect.right + gap;
        if (align === "start") {
          top = segRect.top;
          tip.style.setProperty("--tlc-arrow-top", "12px");
        } else if (align === "end") {
          top = segRect.bottom - tipH;
          tip.style.setProperty("--tlc-arrow-top", "calc(100% - 12px)");
        } else {
          top = segRect.top + segRect.height / 2 - tipH / 2;
        }
        top = clamp(top, MARGIN, vpH - tipH - MARGIN);
        break;
    }
    tip.style.left = left + "px";
    tip.style.top = top + "px";
    tip.classList.add("show");
  }
  function hideGlobalTip() {
    _tipHideTimer = setTimeout(() => {
      const tip = _getGlobalTip();
      tip.classList.remove("show");
    }, 120);
  }
  class TimeSegment extends HTMLElement {
    constructor() {
      super();
      this._init = false;
      this._ptrActive = false;
      this._mode = null;
      this._ptr0 = 0;
      this._s0 = 0;
      this._e0 = 0;
      this._lo = 0;
      this._hi = 0;
      this._onMove = null;
      this._onUp = null;
      this._srcTrack = null;
      this._tgtTrack = null;
      this._ghost = null;
      this._copyMode = false;
      this._copyMoved = false;
      this._ctrlOnDown = false;
      this._copyGhost = null;
      this._swapGuard = false;
    }
    /* ---- 属性 ---- */
    /** 从容器获取 Formatter（找不到时用默认 TimeFormatter） */
    get _formatter() {
      const c = this.closest("time-line-container");
      return c ? c.getFormatter() : this._fmtFallback || (this._fmtFallback = createFormatter$1("time", "hour"));
    }
    get start() {
      return this._formatter.parse(this.getAttribute("start"), 0);
    }
    set start(v) {
      this.setAttribute("start", typeof v === "number" ? Number(v.toFixed(6)).toString() : String(v));
    }
    get end() {
      return this._formatter.parse(this.getAttribute("end"), 0);
    }
    set end(v) {
      this.setAttribute("end", typeof v === "number" ? Number(v.toFixed(6)).toString() : String(v));
    }
    get label() {
      const v = this.getAttribute("label");
      return v && v !== "null" && v !== "undefined" ? v : "";
    }
    set label(v) {
      if (v == null) this.removeAttribute("label");
      else this.setAttribute("label", v);
    }
    get color() {
      return this.getAttribute("color") || "#5c9ce6";
    }
    set color(v) {
      this.setAttribute("color", v);
    }
    get radius() {
      return this.getAttribute("radius") || "5px";
    }
    set radius(v) {
      this.setAttribute("radius", v);
    }
    get tooltip() {
      return this.getAttribute("tooltip") || "auto";
    }
    set tooltip(v) {
      this.setAttribute("tooltip", v);
    }
    get duration() {
      return this.end - this.start;
    }
    /* ---- 值解析（基于容器 Formatter） ---- */
    /**
     * 起始值的所有表示形式（自动适配容器 type/unit）
     * @returns {{ raw: number, hours: number, minutes: number, seconds: number, formatted: string }}
     */
    get startResolved() {
      return this._formatter.resolve(this.start);
    }
    /**
     * 结束值的所有表示形式
     * @returns {{ raw: number, hours: number, minutes: number, seconds: number, formatted: string }}
     */
    get endResolved() {
      return this._formatter.resolve(this.end);
    }
    /** 起始小时数（不受容器 unit 影响，始终返回小时） */
    get startHours() {
      return this._formatter.toHours(this.start);
    }
    /** 起始分钟数（始终返回分钟） */
    get startMinutes() {
      return this._formatter.toMinutes(this.start);
    }
    /** 起始秒数 */
    get startSeconds() {
      return this._formatter.toSeconds(this.start);
    }
    /** 起始格式化字符串 HH:MM[:SS] */
    get startFormatted() {
      return this._formatter.toFormatted(this.start);
    }
    /** 结束小时数 */
    get endHours() {
      return this._formatter.toHours(this.end);
    }
    /** 结束分钟数 */
    get endMinutes() {
      return this._formatter.toMinutes(this.end);
    }
    /** 结束秒数 */
    get endSeconds() {
      return this._formatter.toSeconds(this.end);
    }
    /** 结束格式化字符串 */
    get endFormatted() {
      return this._formatter.toFormatted(this.end);
    }
    /**
     * 生成事件 detail 的完整字段对象（含所有解析值），与 Vue resolveSegment 输出对齐
     * 返回的对象包含 segment 元素引用 + 所有表示形式，可在事件监听中直接解构
     * @returns {{
     *   segment: TimeSegment, key: string|number,
     *   start: number, end: number,
     *   startHours: number, startMinutes: number, startSeconds: number,
     *   startFormatted: string, startFormattedSec: string,
     *   endHours: number, endMinutes: number, endSeconds: number,
     *   endFormatted: string, endFormattedSec: string,
     *   duration: number, durationSeconds: number, durationFormatted: string
     * }}
     */
    _resolvedDetail() {
      return {
        segment: this,
        key: this.key,
        start: this.start,
        end: this.end,
        startHours: this.startHours,
        startMinutes: this.startMinutes,
        startSeconds: this.startSeconds,
        startFormatted: this.startFormatted,
        startFormattedSec: this._formatter.toFormatted(this.start, true),
        endHours: this.endHours,
        endMinutes: this.endMinutes,
        endSeconds: this.endSeconds,
        endFormatted: this.endFormatted,
        endFormattedSec: this._formatter.toFormatted(this.end, true),
        duration: this.duration,
        durationSeconds: this._formatter.toSeconds(this.duration),
        durationFormatted: this._formatter.toFormatted(this.duration, true)
      };
    }
    /* ---- 可编辑/可删除（继承自轨道） ---- */
    /** 是否允许编辑（拖拽移动/调整/修改属性），默认继承轨道值或 true */
    get editable() {
      if (this.hasAttribute("editable")) return this.getAttribute("editable") !== "false";
      const t = this._track;
      return t ? t.editable : true;
    }
    set editable(v) {
      if (v == null) this.removeAttribute("editable");
      else this.setAttribute("editable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许删除（删除按钮/菜单项），默认继承轨道值或 true */
    get deletable() {
      if (this.hasAttribute("deletable")) return this.getAttribute("deletable") !== "false";
      const t = this._track;
      return t ? t.deletable : true;
    }
    set deletable(v) {
      if (v == null) this.removeAttribute("deletable");
      else this.setAttribute("deletable", v === false || v === "false" ? "false" : "true");
    }
    /** 是否允许复制（右键菜单"复制段"），默认继承轨道值或 true */
    get copyable() {
      if (this.hasAttribute("copyable")) return this.getAttribute("copyable") !== "false";
      const t = this._track;
      return t ? t.copyable : true;
    }
    set copyable(v) {
      if (v == null) this.removeAttribute("copyable");
      else this.setAttribute("copyable", v === false || v === "false" ? "false" : "true");
    }
    /** 获取所属的 time-line-track 元素 */
    get _track() {
      let p = this.parentElement;
      while (p) {
        if (p.tagName === "TIME-LINE-TRACK") return p;
        p = p.parentElement;
      }
      return null;
    }
    /** 容器是否启用了选中模式（点击选中而非拖拽） */
    get _containerSelectionMode() {
      const c = this.closest("time-line-container");
      return c ? c.selectionMode : false;
    }
    /* ---- 数据关联 ---- */
    /**
     * 用户自定义标识符
     * 事件回调的 detail 中直接携带此值，便于在 Vue/React 等响应式数据中按 ID 查找
     * 设置方式：segment.key = 'my-seg-id'
     * @type {string|number}
     */
    get key() {
      if (this._segKey === void 0) this._segKey = nextKey();
      return this._segKey;
    }
    set key(v) {
      this._segKey = v;
    }
    /* ---- 生命周期 ---- */
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      this._buildDOM();
      this._bind();
    }
    static get observedAttributes() {
      return ["start", "end", "label", "color", "radius", "editable", "deletable"];
    }
    attributeChangedCallback(name, _ov, nv) {
      if (!this._init) return;
      if (name === "editable" || name === "deletable") {
        this._buildDOM();
        return;
      }
      if (name === "label" || name === "color") {
        this._buildDOM();
      }
      if (name === "start" || name === "end") {
        if (this._swapGuard) return;
        this._buildDOM();
        const t = this._track;
        if (t && t._positionOne) t._positionOne(this);
        this._updateTextVisibility();
      }
    }
    /* ---- DOM ---- */
    _buildDOM() {
      const col = this.color;
      const darker = this._darken(col, 0.18);
      const c = this.closest("time-line-container");
      const r = c && c._globalRadius != null ? c._globalRadius : "0";
      const loc = resolveLocale(this);
      this.innerHTML = "";
      this.append(...[
        this.editable ? h("div", { class: "tls-hdl tls-hdl-left", "data-role": "hdl-left" }, h("div", { class: "tls-hdl-bar" })) : null,
        this.editable ? h("div", { class: "tls-hdl tls-hdl-right", "data-role": "hdl-right" }, h("div", { class: "tls-hdl-bar" })) : null,
        h("div", { class: "tls-bar", style: { background: col, border: `1px solid ${darker}`, borderRadius: r } }, [
          h("div", { class: "tls-inner" }, [
            this.label ? h("span", { class: "tls-label" }, this.label) : null,
            h("span", { class: "tls-time" }, this._formatter.formatRange(
              Math.min(this.start, this.end),
              Math.max(this.start, this.end),
              "segment"
            ))
          ])
        ]),
        this.deletable ? h("button", { class: "tls-del", "data-role": "del", title: loc.deleteBtnTitle, onClick: null }, "×") : null
      ].filter(Boolean));
    }
    _bind() {
      this.addEventListener("pointerdown", (e) => this._onDown(e));
      this.addEventListener("click", (e) => {
        if (e.target.closest('[data-role="del"]')) {
          e.stopPropagation();
          const loc = resolveLocale(this);
          const segRange = this._formatter.formatRange(this.start, this.end, "axis");
          const name = this.label || segRange;
          showDeleteConfirm(
            loc.confirmDeleteSegment.replace("{name}", name).replace("{range}", segRange),
            () => this.deleteSegment(),
            this
          );
        }
      });
      this.addEventListener("mouseenter", () => {
        if (this._ptrActive) return;
        this._refreshTooltip();
      });
      this.addEventListener("mousemove", () => {
        if (this._ptrActive) return;
        this._refreshTooltip();
      });
      this.addEventListener("mouseleave", () => {
        hideGlobalTip();
      });
      this.addEventListener("contextmenu", (e) => {
        if (this._ptrActive) return;
        if (e.target.closest('[data-role="del"]')) return;
        e.preventDefault();
        e.stopPropagation();
        const l = resolveLocale(this);
        const segRange = this._formatter.formatRange(this.start, this.end, "axis");
        const name = this.label || segRange;
        const headerLabel = l.segmentMenuHeader.replace("{name}", this.label || "").replace("{range}", segRange);
        const menuItems = [
          { type: "header", label: headerLabel }
        ];
        if (this.editable) {
          menuItems.push({ label: l.modifyProps, action: () => this.editSegment() });
        }
        if (this.copyable) {
          menuItems.push({ label: l.copySegment, action: () => this.copySegment() });
        }
        if (this.deletable) {
          menuItems.push({ label: l.deleteBtnTitle, danger: true, action: () => {
            showDeleteConfirm(
              l.confirmDeleteSegment.replace("{name}", name).replace("{range}", this._formatter.formatRange(this.start, this.end, "axis")),
              () => this.deleteSegment(),
              this
            );
          } });
        }
        if (menuItems.length > 1) {
          showContextMenu(menuItems, e.clientX, e.clientY, this);
        }
      });
    }
    /** 展示/隐藏（非拖拽期间的实时 tooltip 刷新） */
    _refreshTooltip() {
      const mode = this.tooltip;
      if (mode === "none") return;
      if (mode === "always" || this._isTruncated()) {
        showGlobalTip(this);
      } else {
        hideGlobalTip();
      }
    }
    /** 公开的 tooltip 显示方法（兼容外部调用） */
    _showTooltip() {
      if (this._ptrActive) return;
      this._refreshTooltip();
    }
    /** 公开的 tooltip 隐藏方法（兼容外部调用） */
    _hideTooltip() {
      hideGlobalTip();
    }
    /** 容器 locale 属性变更时刷新文字相关 DOM */
    _onLocaleChange() {
      this._buildDOM();
      this._updateTextVisibility();
    }
    /** 切换选中状态（选中模式用），单选：选中当前段，取消同一容器内其他段的选中 */
    _toggleActive() {
      const wasActive = this.classList.contains("tls-active");
      const c = this.closest("time-line-container");
      if (c) {
        c.querySelectorAll("time-line-segment.tls-active").forEach((s) => s.classList.remove("tls-active"));
      }
      if (!wasActive) {
        this.classList.add("tls-active");
      }
    }
    /** 刷新文字可见性 */
    _updateTextVisibility() {
      cancelAnimationFrame(this._tvRaf);
      this._tvRaf = requestAnimationFrame(() => {
        this._tvRaf = 0;
        this.classList.toggle("tls-text-hidden", this._isTruncated());
      });
    }
    /** 检测段内文本是否被截断（横向/纵向均检测） */
    _isTruncated() {
      const label = this.querySelector(":scope > .tls-bar > .tls-inner > .tls-label");
      const time = this.querySelector(":scope > .tls-bar > .tls-inner > .tls-time");
      if (label && label.scrollWidth > label.clientWidth + 1) return true;
      if (time && time.scrollWidth > time.clientWidth + 1) return true;
      const inner = this.querySelector(":scope > .tls-bar > .tls-inner");
      if (!inner) return false;
      if (inner.scrollWidth > inner.clientWidth + 1) return true;
      const children = inner.children;
      if (children.length) {
        let contentH = 0;
        for (const child of children) {
          const cs = getComputedStyle(child);
          const fs = parseFloat(cs.fontSize) || 11;
          const lh = cs.lineHeight === "normal" ? fs * 1.2 : parseFloat(cs.lineHeight) || fs * 1.2;
          contentH += lh;
        }
        const gap = getComputedStyle(inner).gap;
        if (gap && children.length > 1) {
          const gp = parseFloat(gap) || 0;
          contentH += gp * (children.length - 1);
        }
        const bar = inner.parentElement;
        if (bar && contentH > bar.clientHeight + 1) return true;
      }
      return false;
    }
    /* ---- 拖拽 ---- */
    _onDown(e) {
      if (e.target.closest('[data-role="del"]')) return;
      if (e.button !== 0) return;
      if (!this.editable) return;
      hideContextMenu();
      if (this._containerSelectionMode) {
        this._toggleActive();
        return;
      }
      this.classList.add("tls-selected");
      const hdl = e.target.closest("[data-role]");
      if (hdl && hdl.dataset.role === "hdl-left") this._mode = "resize-left";
      else if (hdl && hdl.dataset.role === "hdl-right") this._mode = "resize-right";
      else this._mode = "move";
      this._ptrActive = true;
      this.classList.add(this._mode.startsWith("resize") ? "resizing" : "dragging");
      this._ptr0 = this._client(e);
      this._s0 = this.start;
      this._e0 = this.end;
      this._srcTrack = this._track;
      this._copyMode = false;
      this._copyMoved = false;
      this._ctrlOnDown = this._mode === "move" && (e.ctrlKey || e.metaKey);
      this._computeBounds();
      this.setPointerCapture(e.pointerId);
      this._onMove = (ev) => this._onMove_(ev);
      this._onUp = (ev) => this._onUp_(ev);
      this.addEventListener("pointermove", this._onMove);
      this.addEventListener("pointerup", this._onUp);
      this.addEventListener("pointercancel", this._onUp);
      this.addEventListener("lostpointercapture", this._onUp);
      e.preventDefault();
      e.stopPropagation();
    }
    _onMove_(e) {
      if (!this._ptrActive) return;
      const t = this._track;
      if (!t) return;
      if (this._ctrlOnDown && !this._copyMode && Math.abs(this._client(e) - this._ptr0) > 3) {
        const t2 = this._track;
        if (t2 && t2.copyable && t2.creatable) {
          this._copyMode = true;
          this._copyMoved = true;
          this._createCopyGhost();
        }
      }
      if (this._copyMode) {
        if (this._mode === "move") {
          const targetTrack = this._detectTargetTrack(e);
          if (targetTrack && targetTrack !== this._tgtTrack) {
            if (this._tgtTrack) this._tgtTrack.classList.remove("tlt-drag-over");
            this._tgtTrack = targetTrack;
            targetTrack.classList.add("tlt-drag-over");
          } else if (!targetTrack && this._tgtTrack) {
            this._tgtTrack.classList.remove("tlt-drag-over");
            this._tgtTrack = null;
          }
        }
        if (this._copyGhost) this._updateCopyGhost(e);
        return;
      }
      const isCross = this._mode === "move" && this._tgtTrack != null;
      const dp = this._client(e) - this._ptr0;
      const dt = t.px2Time(dp);
      const step = t.step || 0;
      const vis = t._effRange();
      const visRange = vis.end - vis.start;
      let axisStep = 0;
      const body = t._bodyEl();
      if (body) {
        const bodyRect = body.getBoundingClientRect();
        const dim = t.isVertical ? bodyRect.height : bodyRect.width;
        axisStep = t._formatter.niceStep(visRange, dim);
      }
      const effStep = step > 0 ? Math.min(step, (axisStep || visRange * 0.05) / 2) : 0;
      Math.max(0, t.minDur);
      if (this._mode === "resize-left") {
        let s = this._s0 + dt;
        s = snap(s, effStep);
        if (s > this._s0) {
          s = Math.min(s, this.end);
        } else {
          s = Math.max(s, this._lo);
        }
        this.start = s;
        if (s >= this.end && this._client(e) > this._ptr0) {
          this._swapToResizeRight(e);
        }
      } else if (this._mode === "resize-right") {
        let ev = this._e0 + dt;
        ev = snap(ev, effStep);
        if (ev < this._e0) {
          ev = Math.max(ev, this.start);
        } else {
          ev = Math.min(ev, this._hi);
        }
        this.end = ev;
        if (this.end <= this.start && this._client(e) < this._ptr0) {
          this._swapToResizeLeft(e);
        }
      } else {
        const w = this._e0 - this._s0;
        const bounds = isCross ? this._tgtTrack._dragBounds ? this._tgtTrack._dragBounds() : this._tgtTrack._effRange() : { start: this._lo, end: this._hi };
        let s = this._s0 + dt;
        s = snap(s, effStep);
        s = clamp(s, bounds.start, bounds.end - w);
        this.start = s;
        this.end = s + w;
      }
      if (this._mode === "move") {
        const targetTrack = this._detectTargetTrack(e);
        if (targetTrack && targetTrack !== t) {
          if (!this._tgtTrack) {
            this._enterCrossTrack(e, targetTrack);
          } else {
            if (targetTrack !== this._tgtTrack) {
              this._tgtTrack.classList.remove("tlt-drag-over");
              targetTrack.classList.add("tlt-drag-over");
              this._tgtTrack = targetTrack;
            }
            this._updateCrossGhost();
          }
          this.dispatchEvent(new CustomEvent("segment-change", {
            bubbles: true,
            detail: this._resolvedDetail()
          }));
          return;
        }
        if (this._tgtTrack) {
          if (!this._tgtTrack.editable) {
            this._exitCrossTrack();
            this.dispatchEvent(new CustomEvent("segment-change", {
              bubbles: true,
              detail: this._resolvedDetail()
            }));
            return;
          }
          const el = document.elementFromPoint(e.clientX, e.clientY);
          const container = this._srcTrack.closest("time-line-container");
          if (!el || !container.contains(el) || el.closest("time-line-track") === this._srcTrack) {
            this._exitCrossTrack();
          }
          this.dispatchEvent(new CustomEvent("segment-change", {
            bubbles: true,
            detail: this._resolvedDetail()
          }));
          return;
        }
      }
      t._positionOne(this);
      if (this.start >= this.end) {
        const r = t._segRect();
        if (r) {
          const { start: ts, end: te } = t._effRange();
          const range = te - ts;
          if (range) {
            const dim = t.isVertical ? r.height : r.width;
            const dragVal = this._mode === "resize-left" ? this.start : this.end;
            const pos = (dragVal - ts) / range * dim;
            this.style.display = "";
            if (t.isVertical) {
              this.style.top = pos + "px";
            } else {
              this.style.left = pos + "px";
            }
          }
        }
      }
      this._buildDOM();
      this._updateTextVisibility();
      void this.offsetHeight;
      if (this._ptrActive) {
        if (this.tooltip !== "none") showGlobalTip(this);
      } else {
        this._refreshTooltip();
      }
      this.dispatchEvent(new CustomEvent("segment-change", {
        bubbles: true,
        detail: this._resolvedDetail()
      }));
    }
    _onUp_(e) {
      if (!this._ptrActive) return;
      const upMode = this._mode;
      this._ptrActive = false;
      this._mode = null;
      this.classList.remove("dragging", "resizing", "tls-selected");
      this.removeEventListener("pointermove", this._onMove);
      this.removeEventListener("pointerup", this._onUp);
      this.removeEventListener("pointercancel", this._onUp);
      this.removeEventListener("lostpointercapture", this._onUp);
      if (this._copyMode) {
        this._finishCopy(e);
        return;
      }
      this._ctrlOnDown = false;
      if (this._tgtTrack) {
        this._finishCrossTrack(e);
        return;
      }
      hideGlobalTip();
      if (this.start > this.end) {
        if (upMode === "resize-left") {
          this.end = this.start;
        } else {
          this.start = this.end;
        }
        this.style.display = "";
        this._buildDOM();
        const t = this._track;
        if (t) {
          t._positionOne(this);
          t._refreshPositions();
        }
      }
      this.dispatchEvent(new CustomEvent("segment-changed", {
        bubbles: true,
        detail: this._resolvedDetail()
      }));
    }
    /* ---- Ctrl+拖拽复制 ---- */
    /** 创建复制浮层 */
    _createCopyGhost() {
      const t = this._track;
      if (!t) return;
      const darker = this._darken(this.color, 0.18);
      const c = this.closest("time-line-container");
      const ghostRadius = c && c._globalRadius != null ? c._globalRadius : "0";
      this._copyGhost = document.createElement("div");
      this._copyGhost.className = "tlt-cross-ghost";
      this._copyGhost.style.opacity = "0.7";
      this._copyGhost.innerHTML = "";
      this._copyGhost.append(
        h("div", { class: "tls-bar", style: { background: this.color, border: `1px solid ${darker}`, borderRadius: ghostRadius } }, [
          h("div", { class: "tls-inner" }, [
            this.label ? h("span", { class: "tls-label" }, this.label) : null,
            h("span", { class: "tls-time" }, this._formatter.formatRange(this.start, this.end, "segment"))
          ])
        ])
      );
      document.body.appendChild(this._copyGhost);
      void this._copyGhost.offsetHeight;
      this._copyGhost.classList.add("show");
    }
    /** 更新复制浮层位置（支持跨轨道：有 _tgtTrack 时用目标轨道的坐标范围） */
    _updateCopyGhost(e) {
      if (!this._copyGhost) return;
      const t = this._tgtTrack || this._track;
      if (!t) return;
      const rect = t._segRect();
      if (!rect) return;
      const { start: ts, end: te } = t._effRange();
      const range = te - ts;
      if (!range) return;
      const v = t.isVertical;
      const dim = v ? rect.height : rect.width;
      const dp = this._client(e) - this._ptr0;
      const dt = t.px2Time(dp);
      const w = this._e0 - this._s0;
      let s = this._s0 + dt;
      s = snap(s, t.step || 0);
      const bounds = t._dragBounds();
      s = clamp(s, bounds.start, bounds.end - w);
      const eTime = s + w;
      const lo = (s - ts) / range * dim;
      const hi = (eTime - ts) / range * dim;
      const segW = Math.max(Math.abs(hi - lo), 2);
      const segL = Math.min(lo, hi);
      Object.assign(this._copyGhost.style, {
        position: "fixed",
        zIndex: "9999",
        pointerEvents: "none",
        ...v ? { left: rect.left + "px", top: rect.top + segL + "px", width: rect.width + "px", height: segW + "px" } : { left: rect.left + segL + "px", top: rect.top + "px", width: segW + "px", height: rect.height + "px" }
      });
    }
    /** 完成复制：在目标位置创建新段（支持跨轨道：_tgtTrack 存在时复制到目标轨道） */
    _finishCopy(e) {
      if (this._copyGhost) {
        this._copyGhost.remove();
        this._copyGhost = null;
      }
      this._copyMode = false;
      this._copyMoved = false;
      this._ctrlOnDown = false;
      const t = this._tgtTrack || this._track;
      if (!t) return;
      const isSameTrack = this._tgtTrack == null;
      if (isSameTrack) {
        const area = t._segArea();
        if (area && this.parentNode === area) {
          area.removeChild(this);
        }
      }
      const dp = this._client(e) - this._ptr0;
      const dt = t.px2Time(dp);
      const w = this._e0 - this._s0;
      let s = this._s0 + dt;
      s = snap(s, t.step || 0);
      const bounds = t._dragBounds();
      s = clamp(s, bounds.start, bounds.end - w);
      let eTime = s + w;
      if (eTime > bounds.end) {
        eTime = bounds.end;
        s = eTime - w;
      }
      let copyError = null;
      try {
        const seg = t.addSegment(s, eTime, { label: this.label, color: this.color });
        if (seg) {
          seg._pulseCopy();
        } else {
          copyError = "segment-limit";
        }
      } catch (_) {
        copyError = "overlap";
      }
      if (copyError) {
        this.dispatchEvent(new CustomEvent("segment-copy-error", {
          bubbles: true,
          detail: { source: this, key: this.key, targetTrack: t, reason: copyError, start: s, end: eTime, ...this._formatter.resolveSegment({ id: this.key, start: s, end: eTime }) }
        }));
      }
      if (isSameTrack) {
        const area = t._segArea();
        if (area) area.appendChild(this);
      }
      if (this._tgtTrack) {
        this._tgtTrack.classList.remove("tlt-drag-over");
        this._tgtTrack = null;
      }
    }
    /** 计算拖拽边界（左右相邻段之间） */
    _computeBounds() {
      const t = this._track;
      if (!t) {
        this._lo = 0;
        this._hi = 24;
        return;
      }
      const segs = t.sortedSegs();
      const idx = segs.indexOf(this);
      const { start: ts, end: te } = t._dragBounds ? t._dragBounds() : t._effRange ? t._effRange() : { start: t.tStart, end: t.tEnd };
      this._lo = idx > 0 ? segs[idx - 1].end : ts;
      this._hi = idx < segs.length - 1 ? segs[idx + 1].start : te;
    }
    /**
     * 左柄缩小到最小宽度后 → 交换为右柄模式
     * 不交换起止值，段保持当前最小宽度，之后拖拽将拉伸右端
     */
    _swapToResizeRight(e) {
      this._mode = "resize-right";
      this._ptr0 = this._client(e);
      this._s0 = this.start;
      this._e0 = this.end;
      this._computeBounds();
    }
    /**
     * 右柄缩小到最小宽度后 → 交换为左柄模式
     * 不交换起止值，段保持当前最小宽度，之后拖拽将拉伸左端
     */
    _swapToResizeLeft(e) {
      this._mode = "resize-left";
      this._ptr0 = this._client(e);
      this._s0 = this.start;
      this._e0 = this.end;
      this._computeBounds();
    }
    /** 获取指针位置（横/纵向自适应） */
    _client(e) {
      const t = this._track;
      if (!t) return e.clientX;
      return t.isVertical ? e.clientY : e.clientX;
    }
    /* ---- 跨轨道拖拽 ---- */
    /**
     * 检测指针下方的目标轨道（同一容器内、同方向）
     * @param {PointerEvent} e
     * @returns {import('./TimeTrack.js').TimeTrack|null}
     */
    _detectTargetTrack(e) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return null;
      const track = el.closest("time-line-track");
      if (!track || track === this._srcTrack) return null;
      if (!track.editable) return null;
      const srcC = this._srcTrack.closest("time-line-container");
      const tgtC = track.closest("time-line-container");
      if (srcC !== tgtC) return null;
      if (track.isVertical !== this._srcTrack.isVertical) return null;
      return track;
    }
    /**
     * 进入跨轨道拖拽模式：隐藏原段，在目标轨道上创建浮层
     * @param {PointerEvent} e
     * @param {import('./TimeTrack.js').TimeTrack} track
     */
    _enterCrossTrack(e, track) {
      this._tgtTrack = track;
      track.classList.add("tlt-drag-over");
      this.style.visibility = "hidden";
      resolveLocale(this);
      const darker = this._darken(this.color, 0.18);
      const c = this.closest("time-line-container");
      const ghostRadius = c && c._globalRadius != null ? c._globalRadius : "0";
      this._ghost = document.createElement("div");
      this._ghost.className = "tlt-cross-ghost";
      this._ghost.innerHTML = "";
      this._ghost.append(
        h("div", { class: "tls-bar", style: { background: this.color, border: `1px solid ${darker}`, borderRadius: ghostRadius } }, [
          h("div", { class: "tls-inner" }, [
            this.label ? h("span", { class: "tls-label" }, this.label) : null,
            h("span", { class: "tls-time" }, this._formatter.formatRange(this.start, this.end, "segment"))
          ])
        ])
      );
      document.body.appendChild(this._ghost);
      void this._ghost.offsetHeight;
      this._ghost.classList.add("show");
      this._updateCrossGhost();
    }
    /** 更新浮层位置，跟随指针在当前目标轨道上映射的时间位置 */
    _updateCrossGhost() {
      if (!this._tgtTrack || !this._ghost) return;
      const tgt = this._tgtTrack;
      const rect = tgt._segRect();
      if (!rect) return;
      const { start: ts, end: te } = tgt._effRange();
      const range = te - ts;
      if (!range) return;
      const v = tgt.isVertical;
      const dim = v ? rect.height : rect.width;
      const lo = (this.start - ts) / range * dim;
      const hi = (this.end - ts) / range * dim;
      const segW = Math.max(Math.abs(hi - lo), 2);
      const segL = Math.min(lo, hi);
      Object.assign(this._ghost.style, {
        position: "fixed",
        zIndex: "9999",
        pointerEvents: "none",
        opacity: "0.7",
        ...v ? { left: rect.left + "px", top: rect.top + segL + "px", width: rect.width + "px", height: segW + "px" } : { left: rect.left + segL + "px", top: rect.top + "px", width: segW + "px", height: rect.height + "px" }
      });
    }
    /** 退出跨轨道拖拽模式：清理浮层，恢复原段可见 */
    _exitCrossTrack() {
      if (this._tgtTrack) this._tgtTrack.classList.remove("tlt-drag-over");
      this._tgtTrack = null;
      this.style.visibility = "";
      if (this._ghost) {
        this._ghost.remove();
        this._ghost = null;
      }
    }
    /**
     * 完成跨轨道拖拽：校验约束 → 迁移 DOM → 刷新双轨道
     * 失败时回退到原轨道
     */
    _finishCrossTrack(e) {
      const tgt = this._tgtTrack;
      const src = this._srcTrack;
      if (this._ghost) {
        this._ghost.remove();
        this._ghost = null;
      }
      tgt.classList.remove("tlt-drag-over");
      this.style.visibility = "";
      const curStart = this.start;
      const curEnd = this.end;
      const dur = curEnd - curStart;
      const { start: ts, end: te } = tgt._dragBounds ? tgt._dragBounds() : tgt._effRange();
      if (!tgt.editable) {
        this._restorePosition();
        return;
      }
      if (curStart < ts || curEnd > te || dur < tgt.minDur) {
        this._restorePosition();
        return;
      }
      if (!tgt._checkSegmentLimit()) {
        this._restorePosition();
        return;
      }
      for (const seg of tgt.sortedSegs()) {
        if (curStart < seg.end && curEnd > seg.start) {
          this._restorePosition();
          return;
        }
      }
      if (this._ghost) {
        this._ghost.classList.add("success");
        const g = this._ghost;
        this._ghost = null;
        setTimeout(() => {
          if (g && g.parentNode) g.remove();
          this._doMigrate(tgt, src);
        }, 200);
      } else {
        this._doMigrate(tgt, src);
      }
    }
    /** 执行 DOM 迁移到目标轨道（成功动画回调） */
    _doMigrate(tgt, src) {
      this._buildDOM();
      src._segArea().removeChild(this);
      tgt._segArea().appendChild(this);
      requestAnimationFrame(() => {
        tgt._positionOne(this);
        tgt._refreshPositions();
        tgt._drawGrid();
        src._refreshPositions();
        src._drawGrid();
      });
      this.dispatchEvent(new CustomEvent("segment-changed", {
        bubbles: true,
        detail: this._resolvedDetail()
      }));
    }
    /** 跨轨道拖拽失败时回退到来源轨道原始位置 */
    _restorePosition() {
      this.start = this._s0;
      this.end = this._e0;
      this._buildDOM();
      this.style.visibility = "";
      this.classList.remove("tls-text-hidden");
      const src = this._srcTrack;
      this._srcTrack = null;
      this._tgtTrack = null;
      requestAnimationFrame(() => {
        src._positionOne(this);
        src._refreshPositions();
      });
    }
    /** 脉冲动画反馈（复制/粘贴成功） */
    _pulseCopy() {
      this.classList.remove("tls-copy-pulse");
      void this.offsetHeight;
      this.classList.add("tls-copy-pulse");
      setTimeout(() => this.classList.remove("tls-copy-pulse"), 1200);
    }
    /**
     * 程序化删除本段（发送可取消事件）
     * 对应右键菜单「删除」
     */
    deleteSegment() {
      const ok = this.dispatchEvent(new CustomEvent("segment-before-delete", {
        bubbles: true,
        cancelable: true,
        detail: this._resolvedDetail()
      }));
      if (!ok) return;
      this.remove();
      this.dispatchEvent(new CustomEvent("segment-deleted", {
        bubbles: true,
        detail: this._resolvedDetail()
      }));
    }
    /**
     * 打开段属性编辑弹窗
     * 对应右键菜单「修改属性」
     */
    editSegment() {
      showSegmentEditDialog(this);
    }
    /**
     * 复制本段到内部剪贴板
     * 对应右键菜单「复制段」
     */
    copySegment() {
      clearClipboard();
      copyToClipboard("segment", {
        label: this.label,
        color: this.color,
        start: this.start,
        end: this.end
      });
      this._pulseCopy();
    }
    /** 颜色加深 */
    _darken(hex, amt) {
      let r, g, b;
      if (hex.startsWith("#")) {
        const n = parseInt(hex.slice(1), 16);
        r = n >> 16 & 255;
        g = n >> 8 & 255;
        b = n & 255;
      } else {
        const m = hex.match(/[\d.]+/g);
        if (!m) return hex;
        [r, g, b] = m.map(Number);
      }
      return `rgb(${clamp(r + amt * 255, 0, 255) | 0},${clamp(g + amt * 255, 0, 255) | 0},${clamp(b + amt * 255, 0, 255) | 0})`;
    }
  }
  if (!customElements.get("time-line-segment")) customElements.define("time-line-segment", TimeSegment);
  if (!customElements.get("time-line-track")) customElements.define("time-line-track", TimeTrack);
  if (!customElements.get("time-line-container")) customElements.define("time-line-container", TimeContainer);
  exports2.TimeContainer = TimeContainer;
  exports2.TimeSegment = TimeSegment;
  exports2.TimeTrack = TimeTrack;
});
