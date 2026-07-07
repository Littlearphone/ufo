(function(C,H){typeof exports=="object"&&typeof module<"u"?H(exports):typeof define=="function"&&define.amd?define(["exports"],H):(C=typeof globalThis<"u"?globalThis:C||self,H(C.TimelineTrack={}))})(this,function(C){"use strict";const H=`
  /* ---- Container ---- */
  time-line-container {
    display: flex;
    gap: var(--tlc-gap, 10px);
    background: var(--tlc-bg, #f8f9fb);
    border: 1px solid var(--tlc-border, #dfe3e8);
    border-radius: var(--tlc-radius, 0);
    padding: var(--tlc-padding, 14px 16px);
    --tlc-bg: #f8f9fb;
    --tlc-border: #dfe3e8;
    --tlc-radius: 0;
    --tlc-padding: 14px 16px;
    --tlc-gap: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 13px;
    color: #333;
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
    --tlt-seg-top: 18px;
    --tlt-seg-bottom: 0px;
  }
  time-line-track .tlt-row {
    display: flex;
    align-items: stretch;
    background: #fff;
    border: 1px solid #e5e8ec;
    border-radius: 0;
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
    width: 150px;
    min-height: 280px;
  }

  time-line-track .tlt-head {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: var(--tlt-header-w);
    min-width: var(--tlt-header-w);
    padding: 6px 10px;
    background: #fafbfc;
    border-right: 1px solid #e5e8ec;
    gap: 2px;
    user-select: none;
  }
  time-line-track.vertical .tlt-head {
    width: auto;
    min-width: auto;
    border-right: none;
    border-bottom: 1px solid #e5e8ec;
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
    top: 0;
    bottom: 0;
    left: 36px;
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
  time-line-segment.dragging,
  time-line-segment.resizing { z-index: 12; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23fff' stroke-width='3.5' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' fill='%23444' stroke='none'/%3E%3C/svg%3E") 10 10, grabbing; }

  time-line-segment .tls-bar {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 0;
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
  time-line-segment .tls-hdl-left  { left: -2px; top: 0; bottom: 0; width: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='18,5 7,12 18,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }
  time-line-segment .tls-hdl-right { right: -2px; top: 0; bottom: 0; width: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='6,5 17,12 6,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }

  time-line-segment .tls-hdl-bar {
    position: absolute;
    top: 20%;
    bottom: 20%;
    width: 4px;
    background: linear-gradient(to right, rgba(0,0,0,0.04), rgba(255,255,255,0.10));
    border-radius: 0;
    opacity: 0;
    transition: opacity .14s;
    pointer-events: none;
  }
  time-line-segment .tls-hdl-left  .tls-hdl-bar { left: 0; width: 4px; border-right: 1px solid rgba(0,0,0,0.08); }
  time-line-segment .tls-hdl-right .tls-hdl-bar { right: 0; width: 4px; border-left: 1px solid rgba(0,0,0,0.08); }
  time-line-segment:hover .tls-hdl-bar              { opacity: 1; }
  time-line-segment.dragging .tls-hdl-bar,
  time-line-segment.resizing .tls-hdl-bar           { opacity: 0; }

  time-line-track.vertical time-line-segment .tls-hdl-left  { left: 0; right: 0; top: -2px; bottom: auto; width: auto; height: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='5,18 12,7 19,18' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }
  time-line-track.vertical time-line-segment .tls-hdl-right { left: 0; right: 0; bottom: -2px; top: auto; width: auto; height: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='5,6 12,17 19,6' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }

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
    top: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ef5350;
    color: #fff;
    border: 2px solid #fff;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .14s, transform .14s;
    z-index: 15;
    padding: 0;
    box-shadow: 0 1px 4px rgba(0,0,0,.2);
  }
  time-line-segment .tls-del:hover { transform: scale(1.15); }
  time-line-segment:hover .tls-del { opacity: 1; }
  time-line-segment.dragging .tls-del,
  time-line-segment.resizing .tls-del { opacity: 0; }
  time-line-segment.tls-del-hidden .tls-del { display: none; }
  time-line-segment.tls-text-hidden .tls-inner { visibility: hidden; }
  time-line-segment.tls-selected .tls-bar { box-shadow: inset 0 0 0 2px rgba(255,255,255,.65); }

  .tls-global-tip {
    position: fixed;
    z-index: 99999;
    pointer-events: none;
    opacity: 0;
    transition: opacity .15s;
    background: rgba(30,35,42,.92);
    color: #fff;
    padding: 5px 9px;
    border-radius: 0;
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
    border-top-color: rgba(30,35,42,.92);
    border-bottom: none;
    left: var(--tlc-arrow-left, 50%);
    transform: translateX(-50%);
  }
  .tls-global-tip.bottom::after {
    bottom: 100%;
    border-bottom-color: rgba(30,35,42,.92);
    border-top: none;
    left: var(--tlc-arrow-left, 50%);
    transform: translateX(-50%);
  }
  .tls-global-tip.left::after {
    left: 100%;
    border-left-color: rgba(30,35,42,.92);
    border-right: none;
    top: var(--tlc-arrow-top, 50%);
    transform: translateY(-50%);
  }
  .tls-global-tip.right::after {
    right: 100%;
    border-right-color: rgba(30,35,42,.92);
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
    background: rgba(30,35,42,.92);
    color: #fff;
    padding: 5px 9px;
    border-radius: 0;
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
    border-top-color: rgba(30,35,42,.92);
  }
  time-line-segment .tls-tip.show { opacity: 1; }
  time-line-segment.dragging .tls-tip,
  time-line-segment.resizing .tls-tip { opacity: 0 !important; }
  time-line-segment .tls-tip-label { font-weight: 600; }
  time-line-segment .tls-tip-time  { opacity: .75; font-size: 10px; }

  .tlt-ghost {
    position: absolute;
    background: rgba(66,133,244,.18);
    border: 2px dashed #4285f4;
    border-radius: 0;
    pointer-events: none;
    z-index: 9;
  }

  .tlc-axis-ruler {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--tlc-bg, #f8f9fb);
    border-radius: 0;
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
`;let nt=!1;function ot(){if(nt)return;const l=document.createElement("style");l.textContent=H,document.head.appendChild(l),nt=!0}const J={unnamed:"未命名",invalidTime:"--:--",deleteBtnTitle:"删除",modifyProps:"修改属性",deleteTrack:"删除轨道",clearSegments:"清空时间段",trackMenuHeader:"📋 {name}",segmentMenuHeader:"🔖 {name}  {range}",confirmDeleteTrack:"确定要删除轨道「{name}」({range}) 吗？",confirmDeleteSegment:"确定要删除时间段「{name}」({range}) 吗？",confirmClearSegments:"确定要清空轨道「{name}」的所有时间段吗？",segmentEditTitle:"修改时间段属性",trackEditTitle:"修改轨道属性",labelField:"标签",startTime:"开始时间",endTime:"结束时间",color:"颜色",name:"名称",step:"步长",maxSegmentsField:"最大段数",zeroUnlimited:"0=无限制",cancel:"取消",confirm:"确定",confirmDelete:"确定删除",confirmDeleteTitle:"确认删除",hourUnit:"时",minuteUnit:"分",secondUnit:"秒",stepHint:"步进 {step}（点击增减）",invalidValue:"无效的值",startMustBeBeforeEnd:"开始必须早于结束",overlapHint:"与「{label}」重叠",segmentOverlapError:"时间段重叠：新段 [{start}–{end}] 与已有段「{label}」[{segStart}–{segEnd}] 冲突"};function lt(l,t){return l.replace(/\{(\w+)\}/g,(e,i)=>t[i]!=null?t[i]:`{${i}}`)}const Q={};for(const l of Object.keys(J)){const t="loc-"+l.replace(/([A-Z])/g,"-$1").toLowerCase();Q[l]=t}const wt=Object.freeze(Object.values(Q));function w(l,t){const e=l&&l.closest?l.closest("time-line-container"):null,i={...J};if(e)for(const s of Object.keys(J)){const r=e.getAttribute(Q[s]);r!=null&&(i[s]=r)}return i}function N(l){return String(Math.floor(l)).padStart(2,"0")}function at(l,t,e){if(l==null||isNaN(l))return e||"--:--";const i=l<0;i&&(l=-l);const s=Math.floor(l),r=Math.round((l-s)*60);if(t){const o=Math.round(l*3600),a=Math.floor(o/3600),n=Math.floor(o%3600/60),h=o%60;return`${i?"-":""}${N(a)}:${N(n)}:${N(h)}`}const c=r;return c===60?`${i?"-":""}${N(s+1)}:00`:`${i?"-":""}${N(s)}:${N(c)}`}function ct(l){const t=l.match(/^([\d.]+)\s*(h|hour|hours|min|mins|minute|minutes|sec|secs|second|seconds)$/i);if(!t)return null;const e=parseFloat(t[1]);if(isNaN(e))return null;const i=t[2].toLowerCase();let s="";return i==="h"||i==="hour"||i==="hours"?s="hour":i.startsWith("mi")?s="minute":i.startsWith("se")&&(s="second"),{val:e,unit:s}}const tt={hour:1,minute:1/60,second:1/3600},dt=[.1,.25,.5,1,2,3,4,6,8,12,24,48];function St(l){if(l==="hour")return dt;const t=l==="minute"?60:3600;return dt.map(e=>+(e*t).toFixed(6))}const et=[.1,.2,.5,1,2,5,10,20,50,100,200,500,1e3,5e3,1e4,5e4,1e5,5e5,1e6];class ht{constructor(t=""){this._unit=t}get unit(){return this._unit}parse(t,e=0){return t==null||t===""?e:typeof t=="number"?t:this._doParse(String(t).trim(),e)}format(t,e="axis"){return t==null||isNaN(t)?"--:--":this._doFormat(t,e)}formatRange(t,e,i="axis"){return this.format(t,i)+" – "+this.format(e,i)}niceStep(t,e,i=72){if(!t||!e)return 1;const s=t/(e/i);return this._doNiceStep(s)}inputAttrs(t){return{type:this._doInputType(t),value:this._doInputValue(t),...this._doInputStep?{step:this._doInputStep(t)}:{}}}_doParse(t,e){throw new Error("must implement _doParse")}_doFormat(t,e){throw new Error("must implement _doFormat")}_doNiceStep(t){throw new Error("must implement _doNiceStep")}_doInputType(t){throw new Error("must implement _doInputType")}_doInputValue(t){throw new Error("must implement _doInputValue")}_doInputStep(t){}}class Et extends ht{constructor(t="hour"){super(t),this._ticks=St(t)}_toHours(t){return t*(tt[this._unit]||1)}_fromHours(t){return t/(tt[this._unit]||1)}_doParse(t,e){const i=t.match(/^(-?)(\d{1,2}):(\d{2})(?::(\d{2}))?$/);if(i){const[c,o,a,n,h]=i,d=parseInt(a,10)+parseInt(n,10)/60+(h?parseInt(h,10)/3600:0);return this._fromHours(o?-d:d)}const s=ct(t);if(s)return this._fromHours(s.val*tt[s.unit]);const r=parseFloat(t);return isNaN(r)?e:r}_doFormat(t,e){const i=this._unit==="second"&&(e==="tooltip"||e==="editor");return at(this._toHours(t),i)}_doNiceStep(t){for(const i of this._ticks)if(t<=i)return i;let e=this._ticks[this._ticks.length-1];for(;e<t;)e*=2;return e}_doInputType(t){return this._unit==="second"?"text":"time"}_doInputValue(t){return at(this._toHours(t),this._unit==="second")}_doInputStep(t){if(this._unit!=="second")return"360"}}class kt extends ht{constructor(t=""){super(t)}_doParse(t,e){const i=ct(t);if(i)return i.val;const s=t.match(/^(-?[\d.]+)\s*.*$/);if(s){const c=parseFloat(s[1]);return isNaN(c)?e:c}const r=parseFloat(t);return isNaN(r)?e:r}_doFormat(t,e){if(e==="editor")return parseFloat(t.toFixed(4)).toString();const i=Math.abs(t);let s=0;i<1?s=3:i<10?s=2:i<100&&(s=1);const r=parseFloat(t.toFixed(s)).toString();return this._unit?`${r} ${this._unit}`:r}_doNiceStep(t){for(const i of et)if(t<=i)return i;let e=et[et.length-1];for(;e<t;)e*=10;return e}_doInputType(t){return"number"}_doInputValue(t){return String(t)}_doInputStep(t){const e=Math.abs(t);return e<1?"0.1":e<10?"0.5":e<100?"1":"10"}}function D(l="time",t="hour"){if(l==="number")return new kt(t);const e=["hour","minute","second"];return new Et(e.includes(t)?t:"hour")}class ut extends HTMLElement{constructor(){super(),this._init=!1,this._axisRuler=null,this._rulerResObs=null,this._formatter=null}connectedCallback(){ot(),!this._init&&(this._init=!0,this._formatter=D(this.type,this.unit),this._applyDir(),this._syncAxisRuler())}static get observedAttributes(){return["direction","label-h","label-v","axis-mode","shared-start","shared-end","tooltip-pos","max-segments","type","unit",...wt]}attributeChangedCallback(t,e,i){if(this._init){if(t.startsWith("loc-")){this.querySelectorAll("time-line-track, time-line-segment").forEach(s=>{s._onLocaleChange&&s._onLocaleChange()});return}if(t!=="tooltip-pos"){if(t==="type"||t==="unit"){this._formatter=D(this.type,this.unit),this._onSharedConfigChange();return}t==="label-h"||t==="label-v"?this.querySelectorAll("time-line-track").forEach(s=>{s._onLabelPosChange&&s._onLabelPosChange()}):t==="axis-mode"||t==="shared-start"||t==="shared-end"?this._onSharedConfigChange():(this._applyDir(),this._syncAxisRuler(),this.querySelectorAll("time-line-track").forEach(s=>{s._onDirChange&&s._onDirChange()}))}}}get direction(){return this.getAttribute("direction")||"horizontal"}set direction(t){this.setAttribute("direction",t)}get type(){return this.getAttribute("type")||"time"}set type(t){this.setAttribute("type",t)}get unit(){return this.getAttribute("unit")||"hour"}set unit(t){t==null||t==="hour"?this.removeAttribute("unit"):this.setAttribute("unit",t)}getFormatter(){return this._formatter||(this._formatter=D(this.type,this.unit)),this._formatter}get labelH(){return this.getAttribute("label-h")||"top"}set labelH(t){this.setAttribute("label-h",t)}get labelV(){return this.getAttribute("label-v")||"left"}set labelV(t){this.setAttribute("label-v",t)}get tooltipPos(){return this.getAttribute("tooltip-pos")||"top-center"}set tooltipPos(t){t==null?this.removeAttribute("tooltip-pos"):this.setAttribute("tooltip-pos",t)}get axisMode(){return this.getAttribute("axis-mode")||"per-track"}set axisMode(t){this.setAttribute("axis-mode",t)}resolveLocale(){return w(this)}get axisRulerActive(){return this.axisMode==="shared"}get sharedStart(){const t=this.getAttribute("shared-start");if(t!=null)return this.getFormatter().parse(t,0);const e=this.allTracks();return e.length?Math.min(...e.map(i=>i.tStart)):0}set sharedStart(t){this.setAttribute("shared-start",t)}get sharedEnd(){const t=this.getAttribute("shared-end");if(t!=null)return this.getFormatter().parse(t,24);const e=this.allTracks();return e.length?Math.max(...e.map(i=>i.tEnd)):24}set sharedEnd(t){this.setAttribute("shared-end",t)}get maxSegments(){const t=this.getAttribute("max-segments");if(t!=null){const e=parseInt(t,10);return e>0?e:0}return 0}set maxSegments(t){t==null||t<=0?this.removeAttribute("max-segments"):this.setAttribute("max-segments",String(t))}allTracks(){return Array.from(this.querySelectorAll(":scope > time-line-track"))}addTrack(t,e,i,s={}){const r=document.createElement("time-line-track");return r.setAttribute("label",t||""),r.setAttribute("start",String(e??0)),r.setAttribute("end",String(i??24)),s.step&&r.setAttribute("step",String(s.step)),s.minDuration&&r.setAttribute("min-duration",String(s.minDuration)),s.maxSegments&&r.setAttribute("max-segments",String(s.maxSegments)),this.appendChild(r),r}removeTrack(t){t.remove()}setGlobalRadius(t){this._globalRadius=t,this.querySelectorAll("time-line-segment").forEach(e=>{const i=e.querySelector(":scope > .tls-bar");i&&(i.style.borderRadius=t)})}getGlobalRadius(){return this._globalRadius||"0"}_onSharedConfigChange(){this._syncAxisRuler(),this.allTracks().forEach(t=>{t._onSharedConfigChange&&t._onSharedConfigChange()})}_cleanupRuler(){this._rulerResObs&&(this._rulerResObs.disconnect(),this._rulerResObs=null),this._axisRuler&&(this._axisRuler.remove(),this._axisRuler=null)}_syncAxisRuler(){if(this.axisRulerActive){const t=this.direction==="vertical",e=this._axisRuler&&this._axisRuler.classList.contains("vertical")!==t;(!this._axisRuler||!this._axisRuler.isConnected||e)&&(this._cleanupRuler(),this._createAxisRuler()),requestAnimationFrame(()=>this._drawAxisRuler()),this.style.setProperty("--tlc-gap","0"),this.style.setProperty("--tlc-padding","0"),this.style.overflowX=t?"":"hidden"}else this._cleanupRuler(),this.style.removeProperty("overflow-x"),this.style.removeProperty("--tlc-gap"),this.style.setProperty("--tlc-padding","14px 16px")}_createAxisRuler(){this._axisRuler=document.createElement("div"),this._axisRuler.className="tlc-axis-ruler",this.direction!=="vertical"||this._axisRuler.classList.add("vertical"),this._axisRuler.innerHTML='<div class="tlc-axis-spacer"><span class="tlc-axis-range"></span></div><div class="tlc-axis-body"><canvas class="tlc-axis-canvas"></canvas></div>',this.insertBefore(this._axisRuler,this.firstChild);const e=this._axisRuler.querySelector(".tlc-axis-body");this._rulerResObs=new ResizeObserver(()=>{requestAnimationFrame(()=>this._drawAxisRuler())}),this._rulerResObs.observe(e)}_drawAxisRuler(){const t=this._axisRuler;if(!t)return;const e=this.getFormatter(),i=this.direction!=="vertical",s=t.querySelector(".tlc-axis-range");s&&(s.textContent=e.formatRange(this.sharedStart,this.sharedEnd,"axis"));const r=t.querySelector(".tlc-axis-canvas"),c=t.querySelector(".tlc-axis-body");if(!r||!c)return;const o=c.getBoundingClientRect();if(!o.width||!o.height)return;const a=window.devicePixelRatio||1;r.width=o.width*a,r.height=o.height*a,r.style.width=o.width+"px",r.style.height=o.height+"px";const n=r.getContext("2d");n.scale(a,a);const h=this.sharedEnd-this.sharedStart;if(!h)return;const d=i?o.width:o.height,u=e.niceStep(h,d);if(i){n.strokeStyle="#d0d4da",n.lineWidth=1,n.beginPath(),n.moveTo(0,o.height-.5),n.lineTo(o.width,o.height-.5),n.stroke(),n.strokeStyle="#e0e3e8",n.lineWidth=.5;for(let p=Math.floor(this.sharedStart/u)*u;p<=this.sharedEnd;p+=u/2){const f=(p-this.sharedStart)/h*d;f<2||f>d-2||(n.beginPath(),n.moveTo(f,o.height-.5),n.lineTo(f,o.height-4),n.stroke())}n.strokeStyle="#c0c5cc",n.lineWidth=1;for(let p=Math.floor(this.sharedStart/u)*u;p<=this.sharedEnd;p+=u){const f=(p-this.sharedStart)/h*d;f<1||f>d-1||(n.beginPath(),n.moveTo(f,o.height-.5),n.lineTo(f,o.height-8),n.stroke())}n.fillStyle="#6b7d8e",n.font="10px -apple-system,BlinkMacSystemFont,sans-serif",n.textAlign="center",n.textBaseline="bottom";for(let p=Math.floor(this.sharedStart/u)*u;p<=this.sharedEnd;p+=u){const f=(p-this.sharedStart)/h*d;f<20||f>d-20||n.fillText(e.format(p,"axis"),f,o.height-9)}n.textAlign="left",n.fillText(e.format(this.sharedStart,"axis"),Math.max(0,2),o.height-9),n.textAlign="right",d>d-20&&n.fillText(e.format(this.sharedEnd,"axis"),Math.min(d,d-2),o.height-9)}else{n.strokeStyle="#d0d4da",n.lineWidth=1,n.beginPath(),n.moveTo(o.width-.5,0),n.lineTo(o.width-.5,o.height),n.stroke(),n.strokeStyle="#e0e3e8",n.lineWidth=.5;for(let p=Math.floor(this.sharedStart/u)*u;p<=this.sharedEnd;p+=u/2){const f=(p-this.sharedStart)/h*d;f<2||f>d-2||(n.beginPath(),n.moveTo(o.width-.5,f),n.lineTo(o.width-5,f),n.stroke())}n.strokeStyle="#c0c5cc",n.lineWidth=1;for(let p=Math.floor(this.sharedStart/u)*u;p<=this.sharedEnd;p+=u){const f=(p-this.sharedStart)/h*d;f<1||f>d-1||(n.beginPath(),n.moveTo(o.width-.5,f),n.lineTo(o.width-9,f),n.stroke())}n.fillStyle="#6b7d8e",n.font="10px -apple-system,BlinkMacSystemFont,sans-serif",n.textAlign="right",n.textBaseline="middle";for(let p=Math.floor(this.sharedStart/u)*u;p<=this.sharedEnd;p+=u){const f=(p-this.sharedStart)/h*d;f<12||f>d-12||n.fillText(e.format(p,"axis"),o.width-11,f)}n.fillText(e.format(this.sharedStart,"axis"),o.width-11,Math.max(0,8)),d>d-12&&n.fillText(e.format(this.sharedEnd,"axis"),o.width-11,Math.min(d,d-8))}}_applyDir(){const t=this.direction==="vertical";this.style.flexDirection=t?"row":"column",this.style.overflow="auto"}}const _=(l,t,e)=>l<t?t:l>e?e:l,I=(l,t)=>t?Math.round(l/t)*t:l;function b(l){const t=document.createElement("div");return t.textContent=l!=null?String(l):"",t.innerHTML}const At=`
/* ── Context Menu ── */
.tlc-context-menu {
  position: fixed;
  z-index: 100000;
  background: #fff;
  border: 1px solid #dfe3e8;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,.14);
  padding: 4px 0;
  min-width: 148px;
  opacity: 0;
  transform-origin: top left;
  transform: scale(0.92);
  transition: opacity .1s ease, transform .1s ease;
  pointer-events: none;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size: 12px;
  user-select: none;
}
.tlc-context-menu.show {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.tlc-context-item {
  padding: 7px 14px;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background .09s;
  white-space: nowrap;
}
.tlc-context-item:hover {
  background: #f0f2f5;
}
.tlc-context-item:active {
  background: #e5e8ec;
}
.tlc-context-header {
  padding: 7px 14px 5px;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  cursor: default;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
  white-space: nowrap;
  line-height: 1.4;
}
.tlc-context-item-danger {
  color: #e53935;
}
.tlc-context-item-danger:hover {
  background: #fbe9e7;
}
.tlc-context-item-danger:active {
  background: #f5d0cc;
}
.tlc-context-divider {
  height: 1px;
  background: #e8eaed;
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
  transition: opacity .18s ease;
  pointer-events: none;
}
.tlc-modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

/* ── Modal Card ── */
.tlc-modal {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
  min-width: 300px;
  max-width: 420px;
  width: 90vw;
  transform: scale(0.94) translateY(8px);
  transition: transform .18s ease;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size: 13px;
  color: #333;
}
.tlc-modal-overlay.show .tlc-modal {
  transform: scale(1) translateY(0);
}
.tlc-modal-header {
  padding: 14px 18px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}
.tlc-modal-body {
  padding: 8px 18px 14px;
}
.tlc-modal-body label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #555;
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
  border: 1px solid #d0d4da;
  border-radius: 3px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color .12s, box-shadow .12s;
}
.tlc-modal-body input:focus {
  border-color: #4285f4;
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
  color: #999;
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
  border: 1px solid #d0d4da;
  border-radius: 3px;
  background: #fff;
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
  background: #e8eaed;
}
.tlc-btn-primary {
  background: #4285f4;
  color: #fff;
  border-color: #4285f4;
}
.tlc-btn-primary:hover {
  background: #3b78e7;
  border-color: #3b78e7;
}
.tlc-btn-primary:active {
  background: #3367d6;
}
.tlc-btn-danger {
  background: #e53935;
  color: #fff;
  border-color: #e53935;
}
.tlc-btn-danger:hover {
  background: #d32f2f;
  border-color: #d32f2f;
}
.tlc-btn-danger:active {
  background: #c62828;
}

/* ── Stepper Buttons ── */
.tlc-step-btns {
  display: flex;
  flex-direction: column;
  border: 1px solid #d0d4da;
  border-radius: 3px;
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
  color: #555;
  transition: background .09s;
  user-select: none;
  outline: none;
}
.tlc-step-btn:hover {
  background: #e8eaed;
}
.tlc-step-btn:active {
  background: #d0d4da;
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
  border: 1px solid #d0d4da;
  border-radius: 3px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color .12s, box-shadow .12s;
  box-sizing: border-box;
}
.tlc-field-input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-field-hint {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #999;
}
.tlc-field-error {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #e53935;
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
  border: 1px solid #d0d4da;
  border-radius: 3px;
  overflow: hidden;
}
.tlc-time-control .tlc-tf-input {
  border: none;
  padding: 5px 9px;
  border-radius: 0;
}
.tlc-time-control .tlc-tf-steps {
  border: none;
  border-radius: 0;
}
.tlc-time-control .tlc-tf-col:focus-within {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-time-control .tlc-tf-input:focus {
  box-shadow: none;
}
.tlc-time-control .tlc-tf-col.tlc-input-error {
  border-color: #e53935;
  box-shadow: 0 0 0 2px rgba(229,57,53,.15);
}

.tlc-tf-input {
  width: 100%;
  min-width: 0;
  text-align: center;
  padding: 4px 22px 4px 2px;
  border: 1px solid #d0d4da;
  border-right: none;
  border-radius: 3px 0 0 3px;
  font-size: 15px;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  outline: none;
  box-sizing: border-box;
  -moz-appearance: textfield;
  transition: border-color .12s, box-shadow .12s;
  background: #fff;
}
.tlc-tf-input::-webkit-inner-spin-button,
.tlc-tf-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.tlc-tf-input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
  z-index: 1;
  position: relative;
}
.tlc-tf-suffix {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 11px;
  color: #999;
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
  color: #555;
  user-select: none;
  padding: 0 1px;
}
.tlc-tf-steps {
  display: flex;
  flex-direction: column;
  border: 1px solid #d0d4da;
  border-radius: 0 3px 3px 0;
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
  color: #555;
  transition: background .09s;
  user-select: none;
  outline: none;
}
.tlc-tf-step:hover { background: #e8eaed; }
.tlc-tf-step:active { background: #d0d4da; }
.tlc-tf-step + .tlc-tf-step { border-top: 1px solid #e0e3e8; }
.tlc-time-control .tlc-field-error { margin-top: 4px; }
.tlc-number-control .tlc-tf-steps { margin-left: 4px; }

/* ── Number Control: 输入框与步进统一外边框 ── */
.tlc-number-control .tlc-tf-row {
  border: 1px solid #d0d4da;
  border-radius: 3px;
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
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-number-control .tlc-field-input:focus {
  box-shadow: none;
}
.tlc-number-control.tlc-input-error .tlc-tf-row,
.tlc-number-control .tlc-tf-row.tlc-input-error {
  border-color: #e53935;
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
  border: 1px solid #d0d4da;
  border-radius: 3px;
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

`;let pt=!1,v=null,E=null,A=null,O=null,V=null;function B(){if(pt)return;const l=document.createElement("style");l.textContent=At,document.head.appendChild(l),pt=!0}function Tt(){$(),T()}function ft(l,t,e){Tt(),B(),v||(v=document.createElement("div"),v.className="tlc-context-menu",document.body.appendChild(v));let i="";v.innerHTML=l.map((s,r)=>{if(s.type==="divider")return'<div class="tlc-context-divider"></div>';if(s.type==="header")return i=`<div class="tlc-context-header">${b(s.label)}</div>`,null;const c=["tlc-context-item"];return s.danger&&c.push("tlc-context-item-danger"),`<div class="${c.join(" ")}" data-idx="${r}">${b(s.label)}</div>`}).filter(Boolean).join(""),i&&(v.innerHTML=i+v.innerHTML),v.addEventListener("click",s=>{const r=s.target.closest(".tlc-context-item");if(!r)return;const c=parseInt(r.dataset.idx,10),o=l[c];o&&o.action&&o.action(),$()}),requestAnimationFrame(()=>{const s=v.offsetWidth||160,r=v.offsetHeight||40,c=window.innerWidth,o=window.innerHeight,a=Math.max(8,Math.min(t,c-s-8)),n=Math.max(8,Math.min(e,o-r-8));v.style.left=a+"px",v.style.top=n+"px",v.classList.add("show")}),O=s=>{v&&!v.contains(s.target)&&$()},requestAnimationFrame(()=>{document.addEventListener("pointerdown",O)}),V=s=>{s.key==="Escape"&&$()},document.addEventListener("keydown",V)}function $(){v&&v.classList.remove("show"),O&&(document.removeEventListener("pointerdown",O),O=null),V&&(document.removeEventListener("keydown",V),V=null)}function Mt(){return E||(E=document.createElement("div"),E.className="tlc-modal-overlay",document.body.appendChild(E),E.addEventListener("pointerdown",l=>{l.target===E&&T()})),E}function U(){return A||(A=document.createElement("div"),A.className="tlc-modal",A.addEventListener("keydown",l=>{if(l.key==="Escape"&&T(),l.key==="Enter"&&l.target.tagName==="INPUT"){const t=A.querySelector('[data-action="confirm"]');t&&t.click()}})),A}function it(){$();const l=Mt(),t=U();l.appendChild(t),requestAnimationFrame(()=>{l.classList.add("show")});const e=t.querySelector('input:not([type="color"])');e&&setTimeout(()=>e.focus(),120)}function T(){E&&(E.classList.remove("show"),A&&A.parentNode===E&&E.removeChild(A))}const Ct=["#e74c3c","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db","#2980b9","#9b59b6","#8e44ad","#34495e","#7f8c8d","#95a5a6"];function M(l,t,e){return`
    <div class="tlc-field">
      <label class="tlc-field-label">${l}</label>
      ${t}
      ${e?`<span class="tlc-field-hint">${e}</span>`:""}
    </div>`}function W(l){return l.format(0,"editor").includes(":")}function Lt(l,t){return`
    <div class="tlc-color-control">
      <div class="tlc-color-presets">
        ${Ct.map(e=>`<button type="button" class="tlc-color-swatch" data-color="${e}" style="background:${e}" tabindex="-1"></button>`).join("")}
      </div>
      <input name="${l}" type="color" value="${t}">
    </div>`}function j(l,t,e,i){const r=l.format(t,"editor").split(":"),c={h:i.hourUnit,m:i.minuteUnit,s:i.secondUnit},o=(a,n)=>`
    <div class="tlc-tf-col" data-part="${n}">
      <input type="text" inputmode="numeric" class="tlc-tf-input" name="${e}_${n}" value="${a}" data-part="${n}" maxlength="${n==="h"?4:2}" autocomplete="off">
      <span class="tlc-tf-suffix">${b(c[n])}</span>
      <div class="tlc-tf-steps">
        <button type="button" class="tlc-tf-step up" tabindex="-1">▲</button>
        <button type="button" class="tlc-tf-step down" tabindex="-1">▼</button>
      </div>
    </div>`;return`
    <div class="tlc-time-control" data-name="${e}">
      <div class="tlc-tf-row">
        ${o(r[0],"h")}
        <span class="tlc-tf-colon">:</span>
        ${o(r[1],"m")}
        ${r.length===3?`
        <span class="tlc-tf-colon">:</span>
        ${o(r[2],"s")}`:""}
      </div>
      <div class="tlc-field-error" id="${e}_error"></div>
    </div>`}function G(l,t,e){const i=l.format(t,"editor"),s=l.unit;return`
    <div class="tlc-number-control" data-name="${e}">
      <div class="tlc-tf-row">
        <div class="tlc-tf-col">
          <input type="text" inputmode="decimal" class="tlc-field-input" name="${e}" value="${b(i)}" autocomplete="off">
          ${s?`<span class="tlc-tf-suffix">${b(s)}</span>`:""}
        </div>
        <div class="tlc-tf-steps">
          <button type="button" class="tlc-tf-step up" tabindex="-1">▲</button>
          <button type="button" class="tlc-tf-step down" tabindex="-1">▼</button>
        </div>
      </div>
      <div class="tlc-field-error" id="${e}_error"></div>
    </div>`}function L(l){const t=l.querySelector('[data-part="h"] .tlc-tf-input'),e=l.querySelector('[data-part="m"] .tlc-tf-input'),i=l.querySelector('[data-part="s"] .tlc-tf-input'),s=t?String(parseInt(t.value,10)||0).padStart(2,"0"):"00",r=e?String(parseInt(e.value,10)||0).padStart(2,"0"):"00",c=i?String(parseInt(i.value,10)||0).padStart(2,"0"):"";return c?`${s}:${r}:${c}`:`${s}:${r}`}function k(l,t){const e=document.getElementById(`${l}_error`);if(!e)return;e.textContent=t;const i=e.closest(".tlc-time-control, .tlc-number-control");i&&i.querySelectorAll(".tlc-tf-col, .tlc-tf-row, .tlc-field-input").forEach(s=>{s.classList.toggle("tlc-input-error",!!t)})}function mt(l){l.querySelectorAll(".tlc-field-error").forEach(t=>t.textContent=""),l.querySelectorAll(".tlc-input-error").forEach(t=>t.classList.remove("tlc-input-error"))}function Rt(l,t,e,i,s){if(!l)return null;const r=l.querySelectorAll("time-line-segment");for(const c of r){if(c===i)continue;const o=c.start,a=c.end;if(t<a&&e>o)return{label:c.label||s||"未命名",start:o,end:a}}return null}function X(l,t,e){if(!t||t<=0||W(l))return"";const i=b(parseFloat(t.toFixed(4)).toString());return b(lt(e.stepHint,{step:i}))}function Y(l,t){let e=null,i=null;const s=()=>{clearTimeout(e),clearInterval(i),e=null,i=null};return l.addEventListener("pointerdown",r=>{r.preventDefault(),t(),e=setTimeout(()=>{i=setInterval(t,80)},300)}),l.addEventListener("pointerup",s),l.addEventListener("pointercancel",s),l.addEventListener("pointerleave",s),s}function st(l,t,e){const s=t.format(e,"editor").split(":"),r={h:0,m:1,s:2};l.querySelectorAll(".tlc-tf-col").forEach(c=>{const o=c.dataset.part;if(!o||r[o]==null)return;const a=c.querySelector(".tlc-tf-input");a&&(a.value=String(parseInt(s[r[o]],10)||0).padStart(2,"0"))}),l.querySelectorAll(".tlc-tf-input").forEach(c=>{c.dispatchEvent(new Event("input",{bubbles:!0}))})}function gt(l,t){W(t)?l.querySelectorAll(".tlc-time-control").forEach(i=>{i.querySelectorAll(".tlc-tf-col").forEach(s=>{const r=s.querySelector(".tlc-tf-input"),c=s.querySelector(".tlc-tf-step.up"),o=s.querySelector(".tlc-tf-step.down"),a=s.dataset.part;if(!r||!c||!o||!a)return;const h={h:{min:0,max:9999},m:{min:0,max:59},s:{min:0,max:59}}[a]||{min:0,max:59};Y(c,()=>{const d=s.closest(".tlc-time-control"),u=parseFloat(d.dataset.min),p=parseFloat(d.dataset.max),f=!isNaN(u)&&!isNaN(p);let g=parseInt(r.value,10)||0;if(g=g>=h.max?h.min:g+1,r.value=String(g).padStart(2,"0"),f){const m=t.parse(L(d));if(!isNaN(m)&&(m>=p||m<u)){st(d,t,u);return}}r.dispatchEvent(new Event("input",{bubbles:!0}))}),Y(o,()=>{const d=s.closest(".tlc-time-control"),u=parseFloat(d.dataset.min),p=parseFloat(d.dataset.max),f=!isNaN(u)&&!isNaN(p);let g=parseInt(r.value,10)||0;if(g=g<=h.min?h.max:g-1,r.value=String(g).padStart(2,"0"),f){const m=t.parse(L(d));if(m<u){st(d,t,p);return}if(m>p){const x=t.unit==="second"?60:t.unit==="minute"?1:.016666666666666666;st(d,t,p-x);return}}r.dispatchEvent(new Event("input",{bubbles:!0}))})})}):l.querySelectorAll(".tlc-number-control").forEach(i=>{const s=i.querySelector(".tlc-field-input"),r=i.querySelector(".tlc-tf-step.up"),c=i.querySelector(".tlc-tf-step.down"),o=parseFloat(i.dataset.step)||1,a=parseFloat(i.dataset.min),n=parseFloat(i.dataset.max),h=!isNaN(a),d=!isNaN(n);!s||!r||!c||(Y(r,()=>{const u=t.parse(s.value);if(!isNaN(u)){let p=u+o;d&&p>n&&(p=h?a:p),s.value=t.format(p,"editor"),s.dispatchEvent(new Event("input",{bubbles:!0}))}}),Y(c,()=>{const u=t.parse(s.value);if(!isNaN(u)){let p=u-o;h&&p<a&&(p=d?n:p),s.value=t.format(p,"editor"),s.dispatchEvent(new Event("input",{bubbles:!0}))}}))}),l.querySelectorAll(".tlc-color-presets").forEach(i=>{const s=i.closest(".tlc-color-control").querySelector('input[type="color"]');s&&i.addEventListener("click",r=>{const c=r.target.closest(".tlc-color-swatch");c&&(s.value=c.dataset.color)})}),l.querySelectorAll(".tlc-time-control input, .tlc-number-control input").forEach(i=>{i.addEventListener("blur",()=>{const s=i.closest(".tlc-time-control, .tlc-number-control");if(!s)return;if(s.classList.contains("tlc-time-control")){const d=parseFloat(s.dataset.min),u=parseFloat(s.dataset.max),p=!isNaN(d),f=!isNaN(u);s.querySelectorAll(".tlc-tf-col").forEach(y=>{const P=y.dataset.part;if(!P)return;const F=y.querySelector(".tlc-tf-input");if(!F)return;const Z={h:{min:0,max:9999},m:{min:0,max:59},s:{min:0,max:59}}[P]||{min:0,max:59};let z=parseInt(F.value,10);(isNaN(z)||z<Z.min)&&(z=Z.min),z>Z.max&&(z=Z.max),F.value=String(z).padStart(2,"0")});const g=t.parse(L(s));let m=isNaN(g)?p?d:0:g;p&&m<d&&(m=d),f&&m>u&&(m=u);const R=t.format(m,"editor").split(":"),S={h:0,m:1,s:2};s.querySelectorAll(".tlc-tf-col").forEach(y=>{const P=y.dataset.part;if(!P||S[P]==null)return;const F=y.querySelector(".tlc-tf-input");if(!F)return;const yt=R[S[P]]||"00";F.value=String(parseInt(yt,10)||0).padStart(2,"0")}),i.dispatchEvent(new Event("input",{bubbles:!0}));return}const r=t.parse(i.value),c=parseFloat(s.dataset.min),o=parseFloat(s.dataset.max),a=!isNaN(c),n=!isNaN(o);let h=isNaN(r)?a?c:0:r;a&&h<c&&(h=c),n&&h>o&&(h=o),i.value=t.format(h,"editor"),i.dispatchEvent(new Event("input",{bubbles:!0}))})}),l.querySelectorAll(".tlc-time-control .tlc-tf-input").forEach(i=>{i.addEventListener("input",()=>{const s=i.closest(".tlc-tf-col");if(!s)return;const r=s.closest(".tlc-time-control");if(!r)return;const c=s.dataset.part;if(!c)return;const a={h:{min:0,max:9999},m:{min:0,max:59},s:{min:0,max:59}}[c]||{min:0,max:59},n=parseInt(i.value,10);let h=i.value===""||isNaN(n)||n<a.min||n>a.max;if(!h){const d=parseFloat(r.dataset.min),u=parseFloat(r.dataset.max),p=!isNaN(d),f=!isNaN(u);if((p||f)&&[...r.querySelectorAll(".tlc-tf-col")].every(m=>{const x=m.querySelector(".tlc-tf-input");return x&&x.value!==""&&!isNaN(parseInt(x.value,10))})){const m=t.parse(L(r));!isNaN(m)&&(p&&m<d||f&&m>u)&&(h=!0)}}s.classList.toggle("tlc-input-error",h)})})}function Nt(l){B();const t=w(l),e=l._formatter,i=l.closest("time-line-track"),s=W(e),r=U();let c=0;if(i){const o=i.step;o&&o>0&&(c=o)}c||(c=s?Math.max((i?i.tEnd-i.tStart:24)/24,.5):1),r.innerHTML=`
    <div class="tlc-modal-header">${b(t.segmentEditTitle)}</div>
    <div class="tlc-modal-body">
      ${M(b(t.labelField),`<input class="tlc-field-input" name="label" type="text" value="${b(l.label)}">`)}
      ${M(b(t.startTime),s?j(e,l.start,"start",t):G(e,l.start,"start"),X(e,c,t))}
      ${M(b(t.endTime),s?j(e,l.end,"end",t):G(e,l.end,"end"),X(e,c,t))}
      ${M(b(t.color),Lt("color",l.color))}
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${b(t.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${b(t.confirm)}</button>
    </div>`,it();{const o=i?i.tStart:0,a=i?i.tEnd:24,n=r.querySelectorAll('.tlc-time-control[data-name="start"], .tlc-number-control[data-name="start"]'),h=r.querySelectorAll('.tlc-time-control[data-name="end"], .tlc-number-control[data-name="end"]');n.forEach(d=>{d.dataset.min=String(o),d.dataset.max=String(a),d.classList.contains("tlc-number-control")&&(d.dataset.step=String(c))}),h.forEach(d=>{d.dataset.min=String(o),d.dataset.max=String(a),d.classList.contains("tlc-number-control")&&(d.dataset.step=String(c))})}gt(r,e),r.querySelector('[data-action="cancel"]').addEventListener("click",T),r.querySelector('[data-action="confirm"]').addEventListener("click",()=>{mt(r);let o,a;if(s)o=e.parse(L(r.querySelector('[data-name="start"]'))),a=e.parse(L(r.querySelector('[data-name="end"]')));else{const u=r.querySelector('input[name="start"]'),p=r.querySelector('input[name="end"]');o=u?e.parse(u.value):NaN,a=p?e.parse(p.value):NaN}let n=!0;if(isNaN(o)||isNaN(a)?(k("start",t.invalidValue),k("end",t.invalidValue),n=!1):o>=a&&(k("start",t.startMustBeBeforeEnd),k("end",t.startMustBeBeforeEnd),n=!1),n){const u=Rt(i,o,a,l,t.unnamed);if(u){const p=lt(t.overlapHint,{label:u.label});k("start",p),k("end",p),n=!1}}if(!n){const u=r.querySelector(".tlc-input-error");u&&u.scrollIntoView({block:"nearest",behavior:"smooth"});return}const h=r.querySelector('input[name="label"]');l.label=h?h.value:"",l.start=o,l.end=a;const d=r.querySelector('input[name="color"]');d&&(l.color=d.value),T()})}function $t(l){B();const t=w(l),e=l._formatter,i=W(e),s=U();let r=0;const c=l.step;c&&c>0&&(r=c),r||(r=i?Math.max((l.tEnd-l.tStart)/24,.5):1),s.innerHTML=`
    <div class="tlc-modal-header">${b(t.trackEditTitle)}</div>
    <div class="tlc-modal-body">
      ${M(b(t.name),`<input class="tlc-field-input" name="label" type="text" value="${b(l.label)}">`)}
      ${M(b(t.startTime),i?j(e,l.tStart,"start",t):G(e,l.tStart,"start"),X(e,r,t))}
      ${M(b(t.endTime),i?j(e,l.tEnd,"end",t):G(e,l.tEnd,"end"),X(e,r,t))}
      ${M(b(t.step),`<input class="tlc-field-input" name="step" type="text" value="${l.step}" style="width:100px;">`)}
      ${M(b(t.maxSegmentsField),`<input class="tlc-field-input" name="maxSegments" type="number" step="1" min="0" placeholder="${b(t.zeroUnlimited)}" value="${l.maxSegments||""}" style="width:100px;">`)}
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${b(t.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${b(t.confirm)}</button>
    </div>`,it();{const o=s.querySelectorAll('.tlc-time-control[data-name="start"], .tlc-number-control[data-name="start"]'),a=s.querySelectorAll('.tlc-time-control[data-name="end"], .tlc-number-control[data-name="end"]');o.forEach(n=>{n.dataset.min=String(l.tStart),n.dataset.max=String(l.tEnd),n.classList.contains("tlc-number-control")&&(n.dataset.step=String(r))}),a.forEach(n=>{n.dataset.min=String(l.tStart),n.dataset.max=String(l.tEnd),n.classList.contains("tlc-number-control")&&(n.dataset.step=String(r))})}gt(s,e),s.querySelector('[data-action="cancel"]').addEventListener("click",T),s.querySelector('[data-action="confirm"]').addEventListener("click",()=>{mt(s);let o,a;if(i)o=e.parse(L(s.querySelector('[data-name="start"]'))),a=e.parse(L(s.querySelector('[data-name="end"]')));else{const g=s.querySelector('input[name="start"]'),m=s.querySelector('input[name="end"]');o=g?e.parse(g.value):NaN,a=m?e.parse(m.value):NaN}const n=s.querySelector('input[name="step"]'),h=s.querySelector('input[name="maxSegments"]'),d=n?e.parse(n.value):NaN,u=h?parseInt(h.value,10):NaN;let p=!0;if(isNaN(o)||isNaN(a)?(k("start",t.invalidValue),k("end",t.invalidValue),p=!1):o>=a&&(k("start",t.startMustBeBeforeEnd),k("end",t.startMustBeBeforeEnd),p=!1),!p){const g=s.querySelector(".tlc-input-error");g&&g.scrollIntoView({block:"nearest",behavior:"smooth"});return}const f=s.querySelector('input[name="label"]');f&&(l.label=f.value),l.setAttribute("start",String(o)),l.setAttribute("end",String(a)),l.step=!isNaN(d)&&d>0?d:0,!isNaN(u)&&u>0?l.maxSegments=u:l.removeAttribute("max-segments"),T()})}function K(l,t,e){B();const i=w(e),s=U();s.innerHTML=`
    <div class="tlc-modal-header">${b(i.confirmDeleteTitle)}</div>
    <div class="tlc-modal-body">
      <p>${b(l)}</p>
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${b(i.cancel)}</button>
      <button class="tlc-btn tlc-btn-danger" data-action="confirm">${b(i.confirmDelete)}</button>
    </div>`,it(),s.querySelector('[data-action="cancel"]').addEventListener("click",T),s.querySelector('[data-action="confirm"]').addEventListener("click",()=>{T(),t&&t()})}class bt extends HTMLElement{constructor(){super(),this._init=!1,this._mutObs=null,this._trackMutObs=null,this._resObs=null,this._creating=!1,this._crS=0,this._crP0=0,this._ghost=null}get tStart(){return this._formatter.parse(this.getAttribute("start"),0)}get tEnd(){return this._formatter.parse(this.getAttribute("end"),24)}get label(){return this.getAttribute("label")||""}set label(t){this.setAttribute("label",t)}get step(){return this._formatter.parse(this.getAttribute("step"),0)}set step(t){this.setAttribute("step",t)}get minDur(){const t=this.getAttribute("min-duration");return t!=null?this._formatter.parse(t):(this.tEnd-this.tStart)*.005}get maxSegments(){const t=this.getAttribute("max-segments");if(t!=null){const i=parseInt(t,10);return i>0?i:0}const e=this.closest("time-line-container");return e&&e.maxSegments?e.maxSegments:0}set maxSegments(t){this.setAttribute("max-segments",t)}get isVertical(){const t=this.closest("time-line-container");return t?(t.getAttribute("direction")||"")==="vertical":!1}get _formatter(){const t=this.closest("time-line-container");return t?t.getFormatter():this._fmtFallback||(this._fmtFallback=createFormatter("time","hour"))}get labelH(){const t=this.closest("time-line-container");return t?t.labelH:"top"}get labelV(){const t=this.closest("time-line-container");return t?t.labelV:"right"}sortedSegs(){const t=Array.from(this.querySelectorAll(":scope .tlt-seg-area > time-line-segment"));return t.sort((e,i)=>e.start-i.start),t}px2Time(t){const e=this._segRect();if(!e)return 0;const i=this.isVertical?e.height:e.width;if(!i)return 0;const{start:s,end:r}=this._effRange();return t/i*(r-s)}time2Px(t){const e=this._segRect();if(!e)return 0;const i=this.isVertical?e.height:e.width,{start:s,end:r}=this._effRange();return(t-s)/(r-s)*i}addSegment(t,e,i={}){if(!this._checkSegmentLimit())return null;const{start:s,end:r}=this._effRange();t=_(t,s,r),e=_(e,s,r);const c=this.sortedSegs();for(const a of c)if(t<a.end&&e>a.start){const n=this._formatter,h=w(this),d=h.segmentOverlapError.replace("{start}",n.format(t)).replace("{end}",n.format(e)).replace("{label}",a.label||h.unnamed).replace("{segStart}",n.format(a.start)).replace("{segEnd}",n.format(a.end));throw new Error("addSegment "+d)}const o=document.createElement("time-line-segment");return o.start=t,o.end=e,i.label&&(o.label=i.label),i.color&&(o.color=i.color),i.radius&&(o.radius=i.radius),this._segArea().appendChild(o),requestAnimationFrame(()=>{this._positionOne(o),this._drawGrid()}),this.dispatchEvent(new CustomEvent("segment-created",{bubbles:!0,detail:{segment:o}})),o}clearAllSegments(){this.sortedSegs().forEach(t=>t.remove())}_deleteTrack(){this.dispatchEvent(new CustomEvent("track-before-delete",{bubbles:!0,cancelable:!0,detail:{track:this}}))&&(this.remove(),this.dispatchEvent(new CustomEvent("track-deleted",{bubbles:!0,detail:{track:this}})))}connectedCallback(){if(ot(),this._init){this._onDirChange();return}this._init=!0,this._render()}disconnectedCallback(){this._mutObs&&this._mutObs.disconnect(),this._trackMutObs&&this._trackMutObs.disconnect(),this._resObs&&this._resObs.disconnect(),this._winResizeHandler&&window.removeEventListener("resize",this._winResizeHandler)}static get observedAttributes(){return["label","start","end","step","min-duration","max-segments"]}attributeChangedCallback(t,e,i){if(this._init)if(t==="label"){const s=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-label");if(s){const r=w(this),c=this.label||r.unnamed;s.textContent=c,s.title=c}}else requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_render(){const t=Array.from(this.children).filter(o=>o.tagName==="TIME-LINE-SEGMENT"),e=this.isVertical;this.classList.toggle("vertical",e);const i=w(this),s=this.label||i.unnamed;if(this.innerHTML=`<div class="tlt-row">
        <div class="tlt-head">
          <span class="tlt-head-label" title="${b(s)}">${b(s)}</span>
          <span class="tlt-head-range">${this._formatter.formatRange(this.tStart,this.tEnd,"axis")}</span>
        </div>
        <div class="tlt-body">
          <canvas class="tlt-grid-canvas"></canvas>
          <div class="tlt-seg-area"></div>
        </div>
      </div>`,this._isSharedMode()){const o=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");o&&(o.style.display="none")}const r=this._segArea();t.forEach(o=>r.appendChild(o));const c=this.querySelector(".tlt-body");c.addEventListener("pointerdown",o=>this._bodyDown(o)),this.addEventListener("contextmenu",o=>{if(this._creating)return;o.preventDefault();const a=w(this),n=this.label||a.unnamed;ft([{type:"header",label:a.trackMenuHeader.replace("{name}",n)},{label:a.modifyProps,action:()=>$t(this)},{label:a.clearSegments,action:()=>{K(a.confirmClearSegments.replace("{name}",n),()=>this.clearAllSegments(),this)}},{label:a.deleteTrack,danger:!0,action:()=>{K(a.confirmDeleteTrack.replace("{name}",n).replace("{range}",this._formatter.formatRange(this.tStart,this.tEnd,"axis")),()=>{this._deleteTrack()},this)}}],o.clientX,o.clientY)}),this._resObs=new ResizeObserver(()=>{this._drawGrid(),this._refreshPositions()}),this._resObs.observe(c),this._mutObs=new MutationObserver(o=>{let a=!1;for(const n of o)n.type==="childList"&&(n.addedNodes.length||n.removedNodes.length)&&(a=!0);a&&requestAnimationFrame(()=>{this._refreshPositions(),this._drawGrid()})}),this._mutObs.observe(this._segArea(),{childList:!0}),this._resizeRaf=null,this._winResizeHandler=()=>{this._resizeRaf&&cancelAnimationFrame(this._resizeRaf),this._resizeRaf=requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})},window.addEventListener("resize",this._winResizeHandler),this._trackMutObs=new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const n of a.addedNodes)n.nodeType===1&&n.tagName==="TIME-LINE-SEGMENT"&&this._segArea().appendChild(n)}),this._trackMutObs.observe(this,{childList:!0}),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_onDirChange(){const t=this.isVertical;this.classList.toggle("vertical",t),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_applyLabelPos(){const t=this._segArea();if(!t)return;const e=this.closest("time-line-container"),i=e&&e.axisMode==="shared";if(i&&e&&e.axisRulerActive){t.style.left="0",t.style.right="0",t.style.top="0",t.style.bottom="0";return}if(i&&this.isVertical){t.style.left=this.labelV==="left"?"36px":"0",t.style.right=this.labelV==="left"?"0":"36px",t.style.top="",t.style.bottom="";return}this.isVertical?(t.style.left=this.labelV==="left"?"36px":"0",t.style.right=this.labelV==="left"?"0":"36px",t.style.top="",t.style.bottom=""):(t.style.left="",t.style.right="",t.style.top=this.labelH==="bottom"?"0":"18px",t.style.bottom=this.labelH==="bottom"?"18px":"0")}_onLabelPosChange(){this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_onLocaleChange(){const t=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-label");if(t){const e=w(this),i=this.label||e.unnamed;t.textContent=i,t.title=i}}_bodyEl(){return this.querySelector(":scope > .tlt-row > .tlt-body")}_canvasEl(){return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-grid-canvas")}_segArea(){return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-seg-area")}_segRect(){const t=this._segArea();return t?t.getBoundingClientRect():null}_bodyDown(t){if(t.button!==0||t.composedPath().some(h=>h.tagName==="TIME-LINE-SEGMENT"))return;const i=this._segRect();if(!i)return;const s=this.isVertical,r=s?t.clientY:t.clientX,c=s?i.top:i.left,o=s?i.height:i.width;if(!o)return;if(this._creating=!0,this._crS=this.tStart+(r-c)/o*(this._effRange().end-this._effRange().start),this._crP0=r,this._ghost=document.createElement("div"),this._ghost.className="tlt-ghost",this._segArea().appendChild(this._ghost),s){const h=this.time2Px(this._crS);this._ghost.style.cssText=`left:0;right:0;top:${h}px;height:2px;`}else{const h=this.time2Px(this._crS);this._ghost.style.cssText=`top:0;bottom:0;left:${h}px;width:2px;`}this.setPointerCapture(t.pointerId);const a=h=>this._createMove(h),n=h=>this._createUp(h,a,n);this.addEventListener("pointermove",a),this.addEventListener("pointerup",n),this.addEventListener("pointercancel",n),t.preventDefault()}_createMove(t){if(!this._creating||!this._ghost)return;const e=this.isVertical,i=e?t.clientY:t.clientX,s=this._crS,r=this._segRect();if(!r)return;const c=e?r.top:r.left,o=e?r.height:r.width,a=this.tStart+(i-c)/o*(this._effRange().end-this._effRange().start),n=Math.min(s,a),h=Math.max(s,a),d=this.time2Px(n),u=this.time2Px(h);e?(this._ghost.style.top=d+"px",this._ghost.style.height=Math.max(3,u-d)+"px"):(this._ghost.style.left=d+"px",this._ghost.style.width=Math.max(3,u-d)+"px")}_createUp(t,e,i){this._creating=!1,this.removeEventListener("pointermove",e),this.removeEventListener("pointerup",i),this.removeEventListener("pointercancel",i),this._ghost&&(this._ghost.remove(),this._ghost=null);const s=this.isVertical,r=s?t.clientY:t.clientX,c=this._segRect();if(!c)return;const o=s?c.top:c.left,a=s?c.height:c.width,n=this.tStart+(r-o)/a*(this._effRange().end-this._effRange().start);let h=Math.min(this._crS,n),d=Math.max(this._crS,n);this.step&&(h=I(h,this.step),d=I(d,this.step));const u=this.sortedSegs();for(const g of u)h<g.end&&d>g.start&&(this._crS<g.start?d=Math.min(d,g.start):h=Math.max(h,g.end));const{start:p,end:f}=this._effRange();if(h=_(h,p,f),d=_(d,p,f),d-h>=this.minDur){if(!this._checkSegmentLimit())return;this.addSegment(h,d)}}_checkSegmentLimit(){const t=this.maxSegments;if(t<=0)return!0;const e=this.sortedSegs().length;return e<t?!0:(this.dispatchEvent(new CustomEvent("segment-limit-reached",{bubbles:!0,detail:{track:this,current:e,max:t}})),!1)}_drawGrid(){const t=this._canvasEl(),e=this._bodyEl();if(!t||!e)return;const i=e.getBoundingClientRect();if(!i.width||!i.height)return;const s=window.devicePixelRatio||1;t.width=i.width*s,t.height=i.height*s,t.style.width=i.width+"px",t.style.height=i.height+"px";const r=t.getContext("2d");r.scale(s,s);const c=this._formatter,o=this.isVertical,{start:a,end:n}=this._effRange(),h=n-a;if(!h)return;const d=o?i.height:i.width,u=c.niceStep(h,d),p=this._segRect(),f=p?p.left-i.left:5,g=p?p.top-i.top:o?5:0;r.strokeStyle="#f0f2f5",r.lineWidth=.5;for(let m=Math.floor(a/u)*u;m<=n;m+=u/2)this._drawLine(r,i,m,o,f,g);r.strokeStyle="#dde0e4",r.lineWidth=.7;for(let m=Math.floor(a/u)*u;m<=n;m+=u)this._drawLine(r,i,m,o,f,g);if(this._isSharedMode()){const m=this.closest("time-line-container");if(m&&m.axisRulerActive)return}if(r.fillStyle="#7a8591",r.font="10px -apple-system,BlinkMacSystemFont,sans-serif",o){r.textBaseline="middle",r.textAlign=this.labelV==="left"?"left":"right";const m=this.labelV==="left"?6:i.width-6;for(let S=Math.floor(a/u)*u;S<=n;S+=u){const y=this.time2Px(S);y>14&&y<i.height-8&&r.fillText(c.format(S,"axis"),m,y+g)}const x=this.time2Px(a),R=this.time2Px(n);x<=14&&r.fillText(c.format(a,"axis"),m,x+g+10),R>=i.height-8&&r.fillText(c.format(n,"axis"),m,R+g-10)}else{r.textAlign="center",r.textBaseline=this.labelH==="bottom"?"bottom":"top";const m=this.labelH==="bottom"?i.height-4:4;for(let S=Math.floor(a/u)*u;S<=n;S+=u){const y=this.time2Px(S);y>24&&y<i.width-24&&r.fillText(c.format(S,"axis"),y+f,m)}const x=this.time2Px(a),R=this.time2Px(n);r.textAlign="left",x<=24&&r.fillText(c.format(a,"axis"),Math.max(x+f,2),m),r.textAlign="right",R>=i.width-24&&r.fillText(c.format(n,"axis"),Math.min(R+f,i.width-2),m)}}_drawLine(t,e,i,s,r,c){const o=this.time2Px(i);if(s){const a=o+c;t.beginPath(),t.moveTo(0,a),t.lineTo(e.width,a),t.stroke()}else{const a=o+r;t.beginPath(),t.moveTo(a,0),t.lineTo(a,e.height),t.stroke()}}_niceStep(t,e){return this._formatter.niceStep(t,e)}_positionOne(t,e){const i=e?null:this._segRect();if(!i&&e==null)return;const{start:s,end:r}=this._effRange(),c=r-s;if(!c)return;const o=this.isVertical,a=e??(o?i.height:i.width),n=(t.start-s)/c*a,h=(t.end-s)/c*a,d=this.sortedSegs(),u=d.indexOf(t);let p=a;if(u>=0&&u<d.length-1){const x=(d[u+1].start-s)/c*a;x>=h&&(p=x)}const f=p-n,g=Math.min(6,f),m=Math.min(Math.max(h-n,g),f);o?(t.style.top=n+"px",t.style.left="0",t.style.right="0",t.style.height=m+"px",t.style.width="",t.style.bottom=""):(t.style.left=n+"px",t.style.top="0",t.style.bottom="0",t.style.width=m+"px",t.style.height="",t.style.right=""),t.classList.toggle("tls-del-hidden",m<28)}_refreshPositions(){const t=this.sortedSegs();if(!t.length)return;const e=this._segRect();if(!e)return;const{start:i,end:s}=this._effRange(),r=s-i;if(!r)return;const c=this.isVertical,o=c?e.height:e.width,a=t.map(n=>(n.start-i)/r*o);for(let n=0;n<t.length;n++){const h=t[n],d=a[n],u=(h.end-i)/r*o;let p=o;if(n<t.length-1){const x=a[n+1];x>=u&&(p=x)}const f=p-d,g=Math.min(6,f),m=Math.min(Math.max(u-d,g),f);c?(h.style.top=d+"px",h.style.left="0",h.style.right="0",h.style.height=m+"px",h.style.width="",h.style.bottom=""):(h.style.left=d+"px",h.style.top="0",h.style.bottom="0",h.style.width=m+"px",h.style.height="",h.style.right=""),h.classList.toggle("tls-del-hidden",m<28)}this._segTextCheckRaf&&cancelAnimationFrame(this._segTextCheckRaf),this._segTextCheckRaf=requestAnimationFrame(()=>{this._segTextCheckRaf=0,t.forEach(n=>n.classList.toggle("tls-text-hidden",n._isTruncated()))})}_isSharedMode(){const t=this.closest("time-line-container");return t&&t.axisMode==="shared"}_effRange(){const t=this.closest("time-line-container");return t&&t.axisMode==="shared"?{start:t.sharedStart,end:t.sharedEnd}:{start:this.tStart,end:this.tEnd}}_onSharedConfigChange(){const t=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");this._isSharedMode()?t&&(t.style.display="none"):t&&(t.style.display=""),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}}let q=null;function xt(){return q||(q=document.createElement("div"),q.className="tls-global-tip",document.body.appendChild(q),q)}let vt=0;function qt(l){clearTimeout(vt);const t=xt(),e=l.getBoundingClientRect();let i="top",s="center";const r=l.getAttribute("tooltip-pos");if(r){const m=r.split("-");["top","bottom","left","right"].includes(m[0])&&(i=m[0]),["start","center","end"].includes(m[1])&&(s=m[1])}else{const m=l.closest("time-line-container");if(m){const x=(m.tooltipPos||"top-center").split("-");i=x[0]||"top",s=x[1]||"center"}}const c=l._formatter;t.innerHTML=(l.label?`<div class="tls-global-tip-label">${b(l.label)}</div>`:"")+`<div class="tls-global-tip-time">${c.formatRange(l.start,l.end,"tooltip")}</div>`,t.className="tls-global-tip",t.classList.add(i,s),t.style.removeProperty("--tlc-arrow-left"),t.style.removeProperty("--tlc-arrow-top"),t.style.left="-9999px",t.style.top="-9999px";const o=t.getBoundingClientRect(),a=o.width,n=o.height,h=6,d=8,u=window.innerWidth,p=window.innerHeight;let f,g;switch(i){case"top":g=e.top-n-h,s==="start"?(f=e.left,t.style.setProperty("--tlc-arrow-left","12px")):s==="end"?(f=e.right-a,t.style.setProperty("--tlc-arrow-left","calc(100% - 12px)")):f=e.left+e.width/2-a/2,f=_(f,d,u-a-d);break;case"bottom":g=e.bottom+h,s==="start"?(f=e.left,t.style.setProperty("--tlc-arrow-left","12px")):s==="end"?(f=e.right-a,t.style.setProperty("--tlc-arrow-left","calc(100% - 12px)")):f=e.left+e.width/2-a/2,f=_(f,d,u-a-d);break;case"left":f=e.left-a-h,s==="start"?(g=e.top,t.style.setProperty("--tlc-arrow-top","12px")):s==="end"?(g=e.bottom-n,t.style.setProperty("--tlc-arrow-top","calc(100% - 12px)")):g=e.top+e.height/2-n/2,g=_(g,d,p-n-d);break;case"right":f=e.right+h,s==="start"?(g=e.top,t.style.setProperty("--tlc-arrow-top","12px")):s==="end"?(g=e.bottom-n,t.style.setProperty("--tlc-arrow-top","calc(100% - 12px)")):g=e.top+e.height/2-n/2,g=_(g,d,p-n-d);break}t.style.left=f+"px",t.style.top=g+"px",t.classList.add("show")}function rt(){vt=setTimeout(()=>{xt().classList.remove("show")},120)}class _t extends HTMLElement{constructor(){super(),this._init=!1,this._ptrActive=!1,this._mode=null,this._ptr0=0,this._s0=0,this._e0=0,this._lo=0,this._hi=0,this._onMove=null,this._onUp=null}get _formatter(){const t=this.closest("time-line-container");return t?t.getFormatter():this._fmtFallback||(this._fmtFallback=D("time","hour"))}get start(){return this._formatter.parse(this.getAttribute("start"),0)}set start(t){this.setAttribute("start",String(typeof t=="number"?Math.round(t*1e4)/1e4:t))}get end(){return this._formatter.parse(this.getAttribute("end"),0)}set end(t){this.setAttribute("end",String(typeof t=="number"?Math.round(t*1e4)/1e4:t))}get label(){return this.getAttribute("label")||""}set label(t){this.setAttribute("label",t)}get color(){return this.getAttribute("color")||"#5c9ce6"}set color(t){this.setAttribute("color",t)}get radius(){return this.getAttribute("radius")||"5px"}set radius(t){this.setAttribute("radius",t)}get tooltip(){return this.getAttribute("tooltip")||"auto"}set tooltip(t){this.setAttribute("tooltip",t)}get duration(){return this.end-this.start}get _track(){let t=this.parentElement;for(;t;){if(t.tagName==="TIME-LINE-TRACK")return t;t=t.parentElement}return null}connectedCallback(){this._init||(this._init=!0,this._buildDOM(),this._bind())}static get observedAttributes(){return["start","end","label","color","radius"]}attributeChangedCallback(t,e,i){if(this._init&&((t==="label"||t==="color")&&this._buildDOM(),t==="start"||t==="end")){this._buildDOM();const s=this._track;s&&s._positionOne&&s._positionOne(this),this._updateTextVisibility()}}_buildDOM(){const t=this.color,e=this._darken(t,.18),i=this.closest("time-line-container"),s=i&&i._globalRadius!=null?i._globalRadius:"0",r=w(this);this.innerHTML=`<div class="tls-hdl tls-hdl-left" data-role="hdl-left">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-hdl tls-hdl-right" data-role="hdl-right">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-bar" style="background:${t};border:1px solid ${e};border-radius:${s};">
        <div class="tls-inner">
          ${this.label?`<span class="tls-label">${b(this.label)}</span>`:""}
          <span class="tls-time">${this._formatter.formatRange(this.start,this.end,"segment")}</span>
        </div>
      </div>
      <button class="tls-del" data-role="del" title="${b(r.deleteBtnTitle)}">&times;</button>`}_bind(){this.addEventListener("pointerdown",t=>this._onDown(t)),this.addEventListener("click",t=>{if(t.target.closest('[data-role="del"]')){t.stopPropagation();const e=w(this),i=this._formatter.formatRange(this.start,this.end,"axis"),s=this.label||i;K(e.confirmDeleteSegment.replace("{name}",s).replace("{range}",i),()=>this._deleteSegment(),this)}}),this.addEventListener("mouseenter",()=>{this._ptrActive||this._refreshTooltip()}),this.addEventListener("mousemove",()=>{this._ptrActive||this._refreshTooltip()}),this.addEventListener("mouseleave",()=>{rt()}),this.addEventListener("contextmenu",t=>{if(this._ptrActive||t.target.closest('[data-role="del"]'))return;t.preventDefault(),t.stopPropagation();const e=w(this),i=this._formatter.formatRange(this.start,this.end,"axis"),s=this.label||i,r=this.label||i;ft([{type:"header",label:e.segmentMenuHeader.replace("{name}",s).replace("{range}",i)},{label:e.modifyProps,action:()=>Nt(this)},{label:e.deleteBtnTitle,danger:!0,action:()=>{K(e.confirmDeleteSegment.replace("{name}",r).replace("{range}",this._formatter.formatRange(this.start,this.end,"axis")),()=>this._deleteSegment(),this)}}],t.clientX,t.clientY)})}_refreshTooltip(){const t=this.tooltip;t!=="none"&&(t==="always"||this._isTruncated()?qt(this):rt())}_showTooltip(){this._ptrActive||this._refreshTooltip()}_hideTooltip(){rt()}_onLocaleChange(){this._buildDOM(),this._updateTextVisibility()}_updateTextVisibility(){cancelAnimationFrame(this._tvRaf),this._tvRaf=requestAnimationFrame(()=>{this._tvRaf=0,this.classList.toggle("tls-text-hidden",this._isTruncated())})}_isTruncated(){const t=this.querySelector(":scope > .tls-bar > .tls-inner > .tls-label"),e=this.querySelector(":scope > .tls-bar > .tls-inner > .tls-time");if(t&&t.scrollWidth>t.clientWidth+1||e&&e.scrollWidth>e.clientWidth+1)return!0;const i=this.querySelector(":scope > .tls-bar > .tls-inner");if(!i)return!1;if(i.scrollWidth>i.clientWidth+1)return!0;const s=i.children;if(s.length){let r=0;for(const a of s){const n=getComputedStyle(a),h=parseFloat(n.fontSize)||11,d=n.lineHeight==="normal"?h*1.2:parseFloat(n.lineHeight)||h*1.2;r+=d}const c=getComputedStyle(i).gap;if(c&&s.length>1){const a=parseFloat(c)||0;r+=a*(s.length-1)}const o=i.parentElement;if(o&&r>o.clientHeight+1)return!0}return!1}_onDown(t){if(t.target.closest('[data-role="del"]')||t.button!==0)return;$(),this.classList.add("tls-selected");const e=t.target.closest("[data-role]");e&&e.dataset.role==="hdl-left"?this._mode="resize-left":e&&e.dataset.role==="hdl-right"?this._mode="resize-right":this._mode="move",this._ptrActive=!0,this.classList.add(this._mode.startsWith("resize")?"resizing":"dragging"),this._ptr0=this._client(t),this._s0=this.start,this._e0=this.end,this._computeBounds(),this.setPointerCapture(t.pointerId),this._onMove=i=>this._onMove_(i),this._onUp=i=>this._onUp_(i),this.addEventListener("pointermove",this._onMove),this.addEventListener("pointerup",this._onUp),this.addEventListener("pointercancel",this._onUp),this.addEventListener("lostpointercapture",this._onUp),t.preventDefault(),t.stopPropagation()}_onMove_(t){if(!this._ptrActive)return;const e=this._track;if(!e)return;const i=this._client(t)-this._ptr0,s=e.px2Time(i),r=e.step||0,c=e.minDur;if(this._mode==="resize-left"){let o=this._s0+s;o=I(o,r),o=_(o,this._lo,this._e0-c),this.start=o}else if(this._mode==="resize-right"){let o=this._e0+s;o=I(o,r),o=_(o,this._s0+c,this._hi),this.end=o}else{const o=this._e0-this._s0;let a=this._s0+s;a=I(a,r),a=_(a,this._lo,this._hi-o),this.start=a,this.end=a+o}e._positionOne(this),this._buildDOM(),this._updateTextVisibility(),this.offsetHeight,this._refreshTooltip(),this.dispatchEvent(new CustomEvent("segment-change",{bubbles:!0,detail:{segment:this,start:this.start,end:this.end}}))}_onUp_(t){this._ptrActive&&(this._ptrActive=!1,this._mode=null,this.classList.remove("dragging","resizing","tls-selected"),this.removeEventListener("pointermove",this._onMove),this.removeEventListener("pointerup",this._onUp),this.removeEventListener("pointercancel",this._onUp),this.removeEventListener("lostpointercapture",this._onUp),this.dispatchEvent(new CustomEvent("segment-changed",{bubbles:!0,detail:{segment:this,start:this.start,end:this.end}})))}_computeBounds(){const t=this._track;if(!t){this._lo=0,this._hi=24;return}const e=t.sortedSegs(),i=e.indexOf(this),{start:s,end:r}=t._effRange?t._effRange():{start:t.tStart,end:t.tEnd};this._lo=i>0?e[i-1].end:s,this._hi=i<e.length-1?e[i+1].start:r}_client(t){const e=this._track;return e&&e.isVertical?t.clientY:t.clientX}_deleteSegment(){this.dispatchEvent(new CustomEvent("segment-before-delete",{bubbles:!0,cancelable:!0,detail:{segment:this}}))&&(this.remove(),this.dispatchEvent(new CustomEvent("segment-deleted",{bubbles:!0,detail:{segment:this}})))}_darken(t,e){let i,s,r;if(t.startsWith("#")){const c=parseInt(t.slice(1),16);i=c>>16&255,s=c>>8&255,r=c&255}else{const c=t.match(/[\d.]+/g);if(!c)return t;[i,s,r]=c.map(Number)}return`rgb(${_(i+e*255,0,255)|0},${_(s+e*255,0,255)|0},${_(r+e*255,0,255)|0})`}}customElements.get("time-line-segment")||customElements.define("time-line-segment",_t),customElements.get("time-line-track")||customElements.define("time-line-track",bt),customElements.get("time-line-container")||customElements.define("time-line-container",ut),C.TimeContainer=ut,C.TimeSegment=_t,C.TimeTrack=bt,Object.defineProperty(C,Symbol.toStringTag,{value:"Module"})});
