(function(v,k){typeof exports=="object"&&typeof module<"u"?k(exports):typeof define=="function"&&define.amd?define(["exports"],k):(v=typeof globalThis<"u"?globalThis:v||self,k(v.TimelineTrack={}))})(this,function(v){"use strict";const k=`
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
  time-line-container[方向="vertical"],
  time-line-container[direction="vertical"] {
    flex-direction: row;
  }
  time-line-container:not([direction="vertical"]):not([方向="vertical"]) {
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
  time-line-container[方向="vertical"] .tlc-axis-ruler,
  time-line-container[direction="vertical"] .tlc-axis-ruler {
    top: auto;
    left: 0;
    flex-direction: column;
    width: 44px;
    min-width: 44px;
  }
  time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-spacer,
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-spacer {
    width: auto;
    min-width: auto;
    height: 28px;
    min-height: 28px;
    padding: 0 4px;
    border-bottom: 1px solid #e0e3e8;
  }
  time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-range,
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-range {
    display: none;
  }
  time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-body,
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-body {
    height: auto;
    min-height: 0;
    flex: 1;
  }
  time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-canvas,
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-canvas {
    width: 100%;
    height: 100%;
  }
`;let C=!1;function T(){if(C)return;const g=document.createElement("style");g.textContent=k,document.head.appendChild(g),C=!0}const b=(g,t,e)=>g<t?t:g>e?e:g,S=(g,t)=>t?Math.round(g/t)*t:g;function m(g,t){if(g==null||isNaN(g))return"--:--";const e=g<0;e&&(g=-g);const i=Math.floor(g),s=Math.round((g-i)*60);return s===60?`${e?"-":""}${String(i+1).padStart(2,"0")}:00`:`${e?"-":""}${String(i).padStart(2,"0")}:${t===!1?"00":String(s).padStart(2,"0")}`}function A(g){const t=document.createElement("div");return t.textContent=g!=null?String(g):"",t.innerHTML}class R extends HTMLElement{constructor(){super(),this._init=!1,this._axisRuler=null,this._rulerResObs=null}connectedCallback(){T(),!this._init&&(this._init=!0,this._applyDir(),this._syncAxisRuler())}static get observedAttributes(){return["direction","方向","label-h","label-v","axis-mode","shared-start","shared-end","tooltip-pos"]}attributeChangedCallback(t,e,i){this._init&&t!=="tooltip-pos"&&(t==="label-h"||t==="label-v"?this.querySelectorAll("time-line-track").forEach(s=>{s._onLabelPosChange&&s._onLabelPosChange()}):t==="axis-mode"||t==="shared-start"||t==="shared-end"?this._onSharedConfigChange():(this._applyDir(),this._syncAxisRuler(),this.querySelectorAll("time-line-track").forEach(s=>{s._onDirChange&&s._onDirChange()})))}get direction(){return this.getAttribute("direction")||this.getAttribute("方向")||"horizontal"}set direction(t){this.setAttribute("direction",t),this.setAttribute("方向",t)}get labelH(){return this.getAttribute("label-h")||"top"}set labelH(t){this.setAttribute("label-h",t)}get labelV(){return this.getAttribute("label-v")||"left"}set labelV(t){this.setAttribute("label-v",t)}get tooltipPos(){return this.getAttribute("tooltip-pos")||"top-center"}set tooltipPos(t){t==null?this.removeAttribute("tooltip-pos"):this.setAttribute("tooltip-pos",t)}get axisMode(){return this.getAttribute("axis-mode")||"per-track"}set axisMode(t){this.setAttribute("axis-mode",t)}get axisRulerActive(){return this.axisMode==="shared"}get sharedStart(){const t=this.getAttribute("shared-start");if(t!=null)return parseFloat(t);const e=this.allTracks();return e.length?Math.min(...e.map(i=>i.tStart)):0}set sharedStart(t){this.setAttribute("shared-start",t)}get sharedEnd(){const t=this.getAttribute("shared-end");if(t!=null)return parseFloat(t);const e=this.allTracks();return e.length?Math.max(...e.map(i=>i.tEnd)):24}set sharedEnd(t){this.setAttribute("shared-end",t)}allTracks(){return Array.from(this.querySelectorAll(":scope > time-line-track"))}addTrack(t,e,i,s={}){const n=document.createElement("time-line-track");return n.setAttribute("label",t||""),n.setAttribute("start",String(e??0)),n.setAttribute("end",String(i??24)),s.step&&n.setAttribute("step",String(s.step)),s.minDuration&&n.setAttribute("min-duration",String(s.minDuration)),this.appendChild(n),n}removeTrack(t){t.remove()}setGlobalRadius(t){this._globalRadius=t,this.querySelectorAll("time-line-segment").forEach(e=>{const i=e.querySelector(":scope > .tls-bar");i&&(i.style.borderRadius=t)})}getGlobalRadius(){return this._globalRadius||"0"}_onSharedConfigChange(){this._syncAxisRuler(),this.allTracks().forEach(t=>{t._onSharedConfigChange&&t._onSharedConfigChange()})}_syncAxisRuler(){if(this.axisRulerActive){this._axisRuler||this._createAxisRuler(),requestAnimationFrame(()=>this._drawAxisRuler()),this.style.setProperty("--tlc-gap","0"),this.style.setProperty("--tlc-padding","0");const t=this.direction!=="vertical"&&this.direction!=="纵向";this.style.overflowX=t?"hidden":""}else this._axisRuler&&(this._rulerResObs&&(this._rulerResObs.disconnect(),this._rulerResObs=null),this._axisRuler.remove(),this._axisRuler=null),this.style.removeProperty("overflow-x"),this.style.removeProperty("--tlc-gap"),this.style.setProperty("--tlc-padding","14px 16px")}_createAxisRuler(){this._axisRuler=document.createElement("div"),this._axisRuler.className="tlc-axis-ruler",this.direction!=="vertical"&&this.direction!=="纵向"||this._axisRuler.classList.add("vertical"),this._axisRuler.innerHTML='<div class="tlc-axis-spacer"><span class="tlc-axis-range"></span></div><div class="tlc-axis-body"><canvas class="tlc-axis-canvas"></canvas></div>',this.insertBefore(this._axisRuler,this.firstChild);const e=this._axisRuler.querySelector(".tlc-axis-body");this._rulerResObs=new ResizeObserver(()=>{requestAnimationFrame(()=>this._drawAxisRuler())}),this._rulerResObs.observe(e)}_drawAxisRuler(){const t=this._axisRuler;if(!t)return;const e=this.direction!=="vertical"&&this.direction!=="纵向",i=t.querySelector(".tlc-axis-range");i&&(i.textContent=m(this.sharedStart,!1)+" – "+m(this.sharedEnd,!1));const s=t.querySelector(".tlc-axis-canvas"),n=t.querySelector(".tlc-axis-body");if(!s||!n)return;const l=n.getBoundingClientRect();if(!l.width||!l.height)return;const o=window.devicePixelRatio||1;s.width=l.width*o,s.height=l.height*o,s.style.width=l.width+"px",s.style.height=l.height+"px";const r=s.getContext("2d");r.scale(o,o);const f=this.sharedEnd-this.sharedStart;if(!f)return;const h=e?l.width:l.height,a=this._niceStepForAxis(f,h);if(e){r.strokeStyle="#d0d4da",r.lineWidth=1,r.beginPath(),r.moveTo(0,l.height-.5),r.lineTo(l.width,l.height-.5),r.stroke(),r.strokeStyle="#e0e3e8",r.lineWidth=.5;for(let d=Math.floor(this.sharedStart/a)*a;d<=this.sharedEnd;d+=a/2){const c=(d-this.sharedStart)/f*h;c<2||c>h-2||(r.beginPath(),r.moveTo(c,l.height-.5),r.lineTo(c,l.height-4),r.stroke())}r.strokeStyle="#c0c5cc",r.lineWidth=1;for(let d=Math.floor(this.sharedStart/a)*a;d<=this.sharedEnd;d+=a){const c=(d-this.sharedStart)/f*h;c<1||c>h-1||(r.beginPath(),r.moveTo(c,l.height-.5),r.lineTo(c,l.height-8),r.stroke())}r.fillStyle="#6b7d8e",r.font="10px -apple-system,BlinkMacSystemFont,sans-serif",r.textAlign="center",r.textBaseline="bottom";for(let d=Math.floor(this.sharedStart/a)*a;d<=this.sharedEnd;d+=a){const c=(d-this.sharedStart)/f*h;c<20||c>h-20||r.fillText(m(d,a<1),c,l.height-9)}r.textAlign="left",r.fillText(m(this.sharedStart,a<1),Math.max(0,2),l.height-9),r.textAlign="right",h>h-20&&r.fillText(m(this.sharedEnd,a<1),Math.min(h,h-2),l.height-9)}else{r.strokeStyle="#d0d4da",r.lineWidth=1,r.beginPath(),r.moveTo(l.width-.5,0),r.lineTo(l.width-.5,l.height),r.stroke(),r.strokeStyle="#e0e3e8",r.lineWidth=.5;for(let d=Math.floor(this.sharedStart/a)*a;d<=this.sharedEnd;d+=a/2){const c=(d-this.sharedStart)/f*h;c<2||c>h-2||(r.beginPath(),r.moveTo(l.width-.5,c),r.lineTo(l.width-5,c),r.stroke())}r.strokeStyle="#c0c5cc",r.lineWidth=1;for(let d=Math.floor(this.sharedStart/a)*a;d<=this.sharedEnd;d+=a){const c=(d-this.sharedStart)/f*h;c<1||c>h-1||(r.beginPath(),r.moveTo(l.width-.5,c),r.lineTo(l.width-9,c),r.stroke())}r.fillStyle="#6b7d8e",r.font="10px -apple-system,BlinkMacSystemFont,sans-serif",r.textAlign="right",r.textBaseline="middle";for(let d=Math.floor(this.sharedStart/a)*a;d<=this.sharedEnd;d+=a){const c=(d-this.sharedStart)/f*h;c<12||c>h-12||r.fillText(m(d,a<1),l.width-11,c)}r.fillText(m(this.sharedStart,a<1),l.width-11,Math.max(0,8)),h>h-12&&r.fillText(m(this.sharedEnd,a<1),l.width-11,Math.min(h,h-8))}}_niceStepForAxis(t,e){const s=t/(e/72),n=[.1,.25,.5,1,2,3,4,6,8,12,24,48];for(const o of n)if(s<=o)return o;let l=1;for(;l<s;)l*=2;return l}_applyDir(){const t=this.direction==="vertical"||this.direction==="纵向";this.style.flexDirection=t?"row":"column",this.style.overflow="auto"}}class P extends HTMLElement{constructor(){super(),this._init=!1,this._mutObs=null,this._trackMutObs=null,this._resObs=null,this._creating=!1,this._crS=0,this._crP0=0,this._ghost=null}get tStart(){return parseFloat(this.getAttribute("start"))||0}get tEnd(){return parseFloat(this.getAttribute("end"))||24}get label(){return this.getAttribute("label")||""}set label(t){this.setAttribute("label",t)}get step(){return parseFloat(this.getAttribute("step"))||0}set step(t){this.setAttribute("step",t)}get minDur(){const t=this.getAttribute("min-duration");return t!=null?parseFloat(t):(this.tEnd-this.tStart)*.005}get isVertical(){const t=this.closest("time-line-container");if(!t)return!1;const e=t.getAttribute("direction")||t.getAttribute("方向")||"";return e==="vertical"||e==="纵向"}get labelH(){const t=this.closest("time-line-container");return t?t.labelH:"top"}get labelV(){const t=this.closest("time-line-container");return t?t.labelV:"right"}sortedSegs(){const t=Array.from(this.querySelectorAll(":scope .tlt-seg-area > time-line-segment"));return t.sort((e,i)=>e.start-i.start),t}px2Time(t){const e=this._segRect();if(!e)return 0;const i=this.isVertical?e.height:e.width;if(!i)return 0;const{start:s,end:n}=this._effRange();return t/i*(n-s)}time2Px(t){const e=this._segRect();if(!e)return 0;const i=this.isVertical?e.height:e.width,{start:s,end:n}=this._effRange();return(t-s)/(n-s)*i}addSegment(t,e,i={}){const s=document.createElement("time-line-segment"),{start:n,end:l}=this._effRange();return s.start=b(t,n,l),s.end=b(e,n,l),i.label&&(s.label=i.label),i.color&&(s.color=i.color),i.radius&&(s.radius=i.radius),this._segArea().appendChild(s),requestAnimationFrame(()=>{this._positionOne(s),this._drawGrid()}),this.dispatchEvent(new CustomEvent("segment-created",{bubbles:!0,detail:{segment:s}})),s}connectedCallback(){if(T(),this._init){this._onDirChange();return}this._init=!0,this._render()}disconnectedCallback(){this._mutObs&&this._mutObs.disconnect(),this._trackMutObs&&this._trackMutObs.disconnect(),this._resObs&&this._resObs.disconnect()}static get observedAttributes(){return["label","start","end","step","min-duration"]}attributeChangedCallback(t,e,i){if(this._init)if(t==="label"){const s=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-label");s&&(s.textContent=this.label||"未命名",s.title=this.label||"未命名")}else requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_render(){const t=Array.from(this.children).filter(n=>n.tagName==="TIME-LINE-SEGMENT"),e=this.isVertical;if(this.classList.toggle("vertical",e),this.innerHTML=`<div class="tlt-row">
        <div class="tlt-head">
          <span class="tlt-head-label" title="${A(this.label)||"未命名"}">${A(this.label)||"未命名"}</span>
          <span class="tlt-head-range">${m(this.tStart,!1)} – ${m(this.tEnd,!1)}</span>
        </div>
        <div class="tlt-body">
          <canvas class="tlt-grid-canvas"></canvas>
          <div class="tlt-seg-area"></div>
        </div>
      </div>`,this._isSharedMode()){const n=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");n&&(n.style.display="none")}const i=this._segArea();t.forEach(n=>i.appendChild(n));const s=this.querySelector(".tlt-body");s.addEventListener("pointerdown",n=>this._bodyDown(n)),this._resObs=new ResizeObserver(()=>{this._drawGrid(),this._refreshPositions()}),this._resObs.observe(s),this._mutObs=new MutationObserver(n=>{let l=!1;for(const o of n)o.type==="childList"&&(o.addedNodes.length||o.removedNodes.length)&&(l=!0);l&&requestAnimationFrame(()=>{this._refreshPositions(),this._drawGrid()})}),this._mutObs.observe(this._segArea(),{childList:!0}),this._trackMutObs=new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const o of l.addedNodes)o.nodeType===1&&o.tagName==="TIME-LINE-SEGMENT"&&this._segArea().appendChild(o)}),this._trackMutObs.observe(this,{childList:!0}),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_onDirChange(){const t=this.isVertical;this.classList.toggle("vertical",t),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_applyLabelPos(){const t=this._segArea();if(!t)return;const e=this.closest("time-line-container"),i=e&&e.axisMode==="shared";if(i&&e&&e.axisRulerActive){t.style.left="0",t.style.right="0",t.style.top="0",t.style.bottom="0";return}if(i&&this.isVertical){t.style.left=this.labelV==="left"?"36px":"0",t.style.right=this.labelV==="left"?"0":"36px",t.style.top="",t.style.bottom="";return}this.isVertical?(t.style.left=this.labelV==="left"?"36px":"0",t.style.right=this.labelV==="left"?"0":"36px",t.style.top="",t.style.bottom=""):(t.style.left="",t.style.right="",t.style.top=this.labelH==="bottom"?"0":"18px",t.style.bottom=this.labelH==="bottom"?"18px":"0")}_onLabelPosChange(){this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_bodyEl(){return this.querySelector(":scope > .tlt-row > .tlt-body")}_canvasEl(){return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-grid-canvas")}_segArea(){return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-seg-area")}_segRect(){const t=this._segArea();return t?t.getBoundingClientRect():null}_bodyDown(t){if(t.button!==0||t.composedPath().some(h=>h.tagName==="TIME-LINE-SEGMENT"))return;const i=this._segRect();if(!i)return;const s=this.isVertical,n=s?t.clientY:t.clientX,l=s?i.top:i.left,o=s?i.height:i.width;if(!o)return;if(this._creating=!0,this._crS=this.tStart+(n-l)/o*(this._effRange().end-this._effRange().start),this._crP0=n,this._ghost=document.createElement("div"),this._ghost.className="tlt-ghost",this._segArea().appendChild(this._ghost),s){const h=this.time2Px(this._crS);this._ghost.style.cssText=`left:0;right:0;top:${h}px;height:2px;`}else{const h=this.time2Px(this._crS);this._ghost.style.cssText=`top:0;bottom:0;left:${h}px;width:2px;`}this.setPointerCapture(t.pointerId);const r=h=>this._createMove(h),f=h=>this._createUp(h,r,f);this.addEventListener("pointermove",r),this.addEventListener("pointerup",f),this.addEventListener("pointercancel",f),t.preventDefault()}_createMove(t){if(!this._creating||!this._ghost)return;const e=this.isVertical,i=e?t.clientY:t.clientX,s=this._crS,n=this._segRect();if(!n)return;const l=e?n.top:n.left,o=e?n.height:n.width,r=this.tStart+(i-l)/o*(this._effRange().end-this._effRange().start),f=Math.min(s,r),h=Math.max(s,r),a=this.time2Px(f),d=this.time2Px(h);e?(this._ghost.style.top=a+"px",this._ghost.style.height=Math.max(3,d-a)+"px"):(this._ghost.style.left=a+"px",this._ghost.style.width=Math.max(3,d-a)+"px")}_createUp(t,e,i){this._creating=!1,this.removeEventListener("pointermove",e),this.removeEventListener("pointerup",i),this.removeEventListener("pointercancel",i),this._ghost&&(this._ghost.remove(),this._ghost=null);const s=this.isVertical,n=s?t.clientY:t.clientX,l=this._segRect();if(!l)return;const o=s?l.top:l.left,r=s?l.height:l.width,f=this.tStart+(n-o)/r*(this._effRange().end-this._effRange().start);let h=Math.min(this._crS,f),a=Math.max(this._crS,f);this.step&&(h=S(h,this.step),a=S(a,this.step));const d=this.sortedSegs();for(const p of d)h<p.end&&a>p.start&&(this._crS<p.start?a=Math.min(a,p.start):h=Math.max(h,p.end));const{start:c,end:u}=this._effRange();h=b(h,c,u),a=b(a,c,u),a-h>=this.minDur&&this.addSegment(h,a)}_drawGrid(){const t=this._canvasEl(),e=this._bodyEl();if(!t||!e)return;const i=e.getBoundingClientRect();if(!i.width||!i.height)return;const s=window.devicePixelRatio||1;t.width=i.width*s,t.height=i.height*s,t.style.width=i.width+"px",t.style.height=i.height+"px";const n=t.getContext("2d");n.scale(s,s);const l=this.isVertical,{start:o,end:r}=this._effRange(),f=r-o;if(!f)return;const h=l?i.height:i.width,a=this._niceStep(f,h),d=this._segRect(),c=d?d.left-i.left:5,u=d?d.top-i.top:l?5:0;n.strokeStyle="#f0f2f5",n.lineWidth=.5;for(let p=Math.floor(o/a)*a;p<=r;p+=a/2)this._drawLine(n,i,p,l,c,u);n.strokeStyle="#dde0e4",n.lineWidth=.7;for(let p=Math.floor(o/a)*a;p<=r;p+=a)this._drawLine(n,i,p,l,c,u);if(this._isSharedMode()){const p=this.closest("time-line-container");if(p&&p.axisRulerActive)return}if(n.fillStyle="#7a8591",n.font="10px -apple-system,BlinkMacSystemFont,sans-serif",l){n.textBaseline="middle",n.textAlign=this.labelV==="left"?"left":"right";const p=this.labelV==="left"?6:i.width-6;for(let x=Math.floor(o/a)*a;x<=r;x+=a){const w=this.time2Px(x);w>14&&w<i.height-8&&n.fillText(m(x,a<1),p,w+u)}const _=this.time2Px(o),E=this.time2Px(r);_<=14&&n.fillText(m(o,a<1),p,_+u+10),E>=i.height-8&&n.fillText(m(r,a<1),p,E+u-10)}else{n.textAlign="center",n.textBaseline=this.labelH==="bottom"?"bottom":"top";const p=this.labelH==="bottom"?i.height-4:4;for(let x=Math.floor(o/a)*a;x<=r;x+=a){const w=this.time2Px(x);w>24&&w<i.width-24&&n.fillText(m(x,a<1),w+c,p)}const _=this.time2Px(o),E=this.time2Px(r);n.textAlign="left",_<=24&&n.fillText(m(o,a<1),Math.max(_+c,2),p),n.textAlign="right",E>=i.width-24&&n.fillText(m(r,a<1),Math.min(E+c,i.width-2),p)}}_drawLine(t,e,i,s,n,l){const o=this.time2Px(i);if(s){const r=o+l;t.beginPath(),t.moveTo(0,r),t.lineTo(e.width,r),t.stroke()}else{const r=o+n;t.beginPath(),t.moveTo(r,0),t.lineTo(r,e.height),t.stroke()}}_niceStep(t,e){const s=t/(e/72),n=[.1,.25,.5,1,2,3,4,6,8,12,24,48];for(const o of n)if(s<=o)return o;let l=1;for(;l<s;)l*=2;return l}_positionOne(t){const e=this._segRect();if(!e)return;const{start:i,end:s}=this._effRange(),n=s-i;if(!n)return;const l=this.isVertical,o=l?e.height:e.width,r=(t.start-i)/n*o,f=(t.end-i)/n*o;l?(t.style.top=r+"px",t.style.left="0",t.style.right="0",t.style.height=Math.max(6,f-r)+"px",t.style.width="",t.style.bottom=""):(t.style.left=r+"px",t.style.top="0",t.style.bottom="0",t.style.width=Math.max(6,f-r)+"px",t.style.height="",t.style.right="")}_refreshPositions(){this.sortedSegs().forEach(t=>this._positionOne(t))}_isSharedMode(){const t=this.closest("time-line-container");return t&&t.axisMode==="shared"}_effRange(){const t=this.closest("time-line-container");return t&&t.axisMode==="shared"?{start:t.sharedStart,end:t.sharedEnd}:{start:this.tStart,end:this.tEnd}}_onSharedConfigChange(){const t=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");this._isSharedMode()?t&&(t.style.display="none"):t&&(t.style.display=""),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}}let y=null;function L(){return y||(y=document.createElement("div"),y.className="tls-global-tip",document.body.appendChild(y),y)}let z=0;function M(g){clearTimeout(z);const t=L(),e=g.getBoundingClientRect();let i="top",s="center";const n=g.getAttribute("tooltip-pos");if(n){const p=n.split("-");["top","bottom","left","right"].includes(p[0])&&(i=p[0]),["start","center","end"].includes(p[1])&&(s=p[1])}else{const p=g.closest("time-line-container");if(p){const _=(p.tooltipPos||"top-center").split("-");i=_[0]||"top",s=_[1]||"center"}}t.innerHTML=`<div class="tls-global-tip-label">${A(g.label)||"未命名"}</div>
     <div class="tls-global-tip-time">${m(g.start)} – ${m(g.end)}</div>`,t.className="tls-global-tip",t.classList.add(i,s),t.style.removeProperty("--tlc-arrow-left"),t.style.removeProperty("--tlc-arrow-top"),t.style.left="-9999px",t.style.top="-9999px";const l=t.getBoundingClientRect(),o=l.width,r=l.height,f=6,h=8,a=window.innerWidth,d=window.innerHeight;let c,u;switch(i){case"top":u=e.top-r-f,s==="start"?(c=e.left,t.style.setProperty("--tlc-arrow-left","12px")):s==="end"?(c=e.right-o,t.style.setProperty("--tlc-arrow-left","calc(100% - 12px)")):c=e.left+e.width/2-o/2,c=b(c,h,a-o-h);break;case"bottom":u=e.bottom+f,s==="start"?(c=e.left,t.style.setProperty("--tlc-arrow-left","12px")):s==="end"?(c=e.right-o,t.style.setProperty("--tlc-arrow-left","calc(100% - 12px)")):c=e.left+e.width/2-o/2,c=b(c,h,a-o-h);break;case"left":c=e.left-o-f,s==="start"?(u=e.top,t.style.setProperty("--tlc-arrow-top","12px")):s==="end"?(u=e.bottom-r,t.style.setProperty("--tlc-arrow-top","calc(100% - 12px)")):u=e.top+e.height/2-r/2,u=b(u,h,d-r-h);break;case"right":c=e.right+f,s==="start"?(u=e.top,t.style.setProperty("--tlc-arrow-top","12px")):s==="end"?(u=e.bottom-r,t.style.setProperty("--tlc-arrow-top","calc(100% - 12px)")):u=e.top+e.height/2-r/2,u=b(u,h,d-r-h);break}t.style.left=c+"px",t.style.top=u+"px",t.classList.add("show")}function O(){z=setTimeout(()=>{L().classList.remove("show")},120)}class H extends HTMLElement{constructor(){super(),this._init=!1,this._ptrActive=!1,this._mode=null,this._ptr0=0,this._s0=0,this._e0=0,this._lo=0,this._hi=0,this._onMove=null,this._onUp=null}get start(){return parseFloat(this.getAttribute("start"))||0}set start(t){this.setAttribute("start",String(Math.round(t*1e4)/1e4))}get end(){return parseFloat(this.getAttribute("end"))||0}set end(t){this.setAttribute("end",String(Math.round(t*1e4)/1e4))}get label(){return this.getAttribute("label")||""}set label(t){this.setAttribute("label",t)}get color(){return this.getAttribute("color")||"#5c9ce6"}set color(t){this.setAttribute("color",t)}get radius(){return this.getAttribute("radius")||"5px"}set radius(t){this.setAttribute("radius",t)}get tooltip(){return this.getAttribute("tooltip")||"auto"}set tooltip(t){this.setAttribute("tooltip",t)}get duration(){return this.end-this.start}get _track(){let t=this.parentElement;for(;t;){if(t.tagName==="TIME-LINE-TRACK")return t;t=t.parentElement}return null}connectedCallback(){this._init||(this._init=!0,this._buildDOM(),this._bind())}static get observedAttributes(){return["start","end","label","color","radius"]}attributeChangedCallback(t,e,i){if(this._init&&((t==="label"||t==="color")&&this._buildDOM(),t==="start"||t==="end")){this._buildDOM();const s=this._track;s&&s._positionOne&&s._positionOne(this)}}_buildDOM(){const t=this.color,e=this._darken(t,.18),i=this.closest("time-line-container"),s=i&&i._globalRadius!=null?i._globalRadius:"0";this.innerHTML=`<div class="tls-hdl tls-hdl-left" data-role="hdl-left">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-hdl tls-hdl-right" data-role="hdl-right">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-bar" style="background:${t};border:1px solid ${e};border-radius:${s};">
        <div class="tls-inner">
          ${this.label?`<span class="tls-label">${A(this.label)}</span>`:""}
          <span class="tls-time">${m(this.start)} – ${m(this.end)}</span>
        </div>
      </div>
      <button class="tls-del" data-role="del" title="删除">&times;</button>`}_bind(){this.addEventListener("pointerdown",e=>this._onDown(e)),this.addEventListener("click",e=>{e.target.closest('[data-role="del"]')&&this._emitDelete(e)});let t=!1;this.addEventListener("mouseenter",()=>{if(this._ptrActive)return;const e=this.tooltip;if(e==="none")return;const i=this._isTruncated();(e==="always"||i)&&(M(this),t=!0)}),this.addEventListener("mousemove",()=>{t&&M(this)}),this.addEventListener("mouseleave",()=>{O(),t=!1})}_showTooltip(){if(this._ptrActive)return;const t=this.tooltip;if(t==="none")return;const e=this._isTruncated();(t==="always"||e)&&M(this)}_hideTooltip(){O()}_isTruncated(){const t=this.querySelector(":scope > .tls-bar > .tls-inner > .tls-label"),e=this.querySelector(":scope > .tls-bar > .tls-inner > .tls-time");if(t&&t.scrollWidth>t.clientWidth+1||e&&e.scrollWidth>e.clientWidth+1)return!0;const i=this.querySelector(":scope > .tls-bar > .tls-inner");return!!(i&&i.scrollWidth>i.clientWidth+1)}_onDown(t){if(t.target.closest('[data-role="del"]')||t.button!==0)return;const e=t.target.closest("[data-role]");e&&e.dataset.role==="hdl-left"?this._mode="resize-left":e&&e.dataset.role==="hdl-right"?this._mode="resize-right":this._mode="move",this._ptrActive=!0,this.classList.add(this._mode.startsWith("resize")?"resizing":"dragging"),this._ptr0=this._client(t),this._s0=this.start,this._e0=this.end,this._computeBounds(),this.setPointerCapture(t.pointerId),this._onMove=i=>this._onMove_(i),this._onUp=i=>this._onUp_(i),this.addEventListener("pointermove",this._onMove),this.addEventListener("pointerup",this._onUp),this.addEventListener("pointercancel",this._onUp),this.addEventListener("lostpointercapture",this._onUp),t.preventDefault(),t.stopPropagation()}_onMove_(t){if(!this._ptrActive)return;const e=this._track;if(!e)return;const i=this._client(t)-this._ptr0,s=e.px2Time(i),n=e.step||0,l=e.minDur;if(this._mode==="resize-left"){let o=this._s0+s;o=S(o,n),o=b(o,this._lo,this._e0-l),this.start=o}else if(this._mode==="resize-right"){let o=this._e0+s;o=S(o,n),o=b(o,this._s0+l,this._hi),this.end=o}else{const o=this._e0-this._s0;let r=this._s0+s;r=S(r,n),r=b(r,this._lo,this._hi-o),this.start=r,this.end=r+o}if(e._positionOne(this),this._buildDOM(),this.tooltip!=="none"){const o=document.querySelector(".tls-global-tip");o&&o.classList.contains("show")&&M(this)}this.dispatchEvent(new CustomEvent("segment-change",{bubbles:!0,detail:{segment:this,start:this.start,end:this.end}}))}_onUp_(t){this._ptrActive&&(this._ptrActive=!1,this._mode=null,this.classList.remove("dragging","resizing"),this.removeEventListener("pointermove",this._onMove),this.removeEventListener("pointerup",this._onUp),this.removeEventListener("pointercancel",this._onUp),this.removeEventListener("lostpointercapture",this._onUp),this.dispatchEvent(new CustomEvent("segment-changed",{bubbles:!0,detail:{segment:this,start:this.start,end:this.end}})))}_computeBounds(){const t=this._track;if(!t){this._lo=0,this._hi=24;return}const e=t.sortedSegs(),i=e.indexOf(this),{start:s,end:n}=t._effRange?t._effRange():{start:t.tStart,end:t.tEnd};this._lo=i>0?e[i-1].end:s,this._hi=i<e.length-1?e[i+1].start:n}_client(t){const e=this._track;return e&&e.isVertical?t.clientY:t.clientX}_emitDelete(t){this.dispatchEvent(new CustomEvent("segment-before-delete",{bubbles:!0,cancelable:!0,detail:{segment:this}}))&&(this.remove(),this.dispatchEvent(new CustomEvent("segment-deleted",{bubbles:!0,detail:{segment:this}})),t.preventDefault(),t.stopPropagation())}_darken(t,e){let i,s,n;if(t.startsWith("#")){const l=parseInt(t.slice(1),16);i=l>>16&255,s=l>>8&255,n=l&255}else{const l=t.match(/[\d.]+/g);if(!l)return t;[i,s,n]=l.map(Number)}return`rgb(${b(i+e*255,0,255)|0},${b(s+e*255,0,255)|0},${b(n+e*255,0,255)|0})`}}customElements.get("time-line-segment")||customElements.define("time-line-segment",H),customElements.get("time-line-track")||customElements.define("time-line-track",P),customElements.get("time-line-container")||customElements.define("time-line-container",R),v.TimeContainer=R,v.TimeSegment=H,v.TimeTrack=P,Object.defineProperty(v,Symbol.toStringTag,{value:"Module"})});
