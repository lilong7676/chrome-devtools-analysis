// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2017 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

.perfmon-pane {
  overflow: hidden;

  --override-color-perf-monitor-cpu: rgb(227 33 33);
  --override-color-perf-monitor-cpu-task-duration: rgb(154 154 154);
  --override-color-perf-monitor-cpu-script-duration: rgb(255 165 0);
  --override-color-perf-monitor-cpu-layout-duration: rgb(138 43 226);
  --override-color-perf-monitor-cpu-recalc-style-duration: rgb(238 130 238);
  --override-color-perf-monitor-jsheap: rgb(0 0 255);
  --override-color-perf-monitor-jsheap-total-size: rgb(153 153 255);
  --override-color-perf-monitor-jsheap-used-size: rgb(0 0 255);
  --override-color-perf-monitor-dom-nodes: rgb(11 154 11);
  --override-color-perf-monitor-js-event-listeners: rgb(154 205 50);
  --override-color-perf-monitor-documents: rgb(0 0 139);
  --override-color-perf-monitor-document-frames: rgb(0 139 139);
  --override-color-perf-monitor-layout-count: rgb(255 105 180);
  --override-color-perf-monitor-recalc-style-count: rgb(255 20 147);
}

:host-context(.-theme-with-dark-background) .perfmon-pane {
  --override-color-perf-monitor-cpu: rgb(242 113 113);
  --override-color-perf-monitor-cpu-task-duration: rgb(201 201 201);
  --override-color-perf-monitor-cpu-script-duration: rgb(255 165 0);
  --override-color-perf-monitor-cpu-layout-duration: rgb(124 29 212);
  --override-color-perf-monitor-cpu-recalc-style-duration: rgb(179 49 179);
  --override-color-perf-monitor-jsheap: rgb(153 153 255);
  --override-color-perf-monitor-jsheap-total-size: rgb(153 153 255);
  --override-color-perf-monitor-jsheap-used-size: rgb(0 0 255);
  --override-color-perf-monitor-dom-nodes: rgb(127 255 127);
  --override-color-perf-monitor-js-event-listeners: rgb(154 205 50);
  --override-color-perf-monitor-documents: rgb(116 116 255);
  --override-color-perf-monitor-document-frames: rgb(116 255 255);
  --override-color-perf-monitor-layout-count: rgb(255 105 180);
  --override-color-perf-monitor-recalc-style-count: rgb(235 0 127);
}

.perfmon-pane.suspended {
  opacity: 40%;
  pointer-events: none;
}

.perfmon-pane .perfmon-chart-suspend-overlay {
  display: none;
  font-size: 26px;
  align-items: center;
  justify-content: center;
}

.perfmon-pane.suspended .perfmon-chart-suspend-overlay {
  display: flex;
}

.perfmon-control-pane {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.perfmon-chart-container {
  display: flex;
  flex: 1 1;
  border-left: 1px solid var(--color-details-hairline);
  overflow-y: auto;
}

.perfmon-chart-container canvas {
  width: 100%;
}

.perfmon-indicator {
  padding: 6px 12px;
  margin: -1px 0;
  display: flex;
  flex-shrink: 0;
  width: 210px;
}

.perfmon-indicator:hover,
.perfmon-indicator:focus-visible {
  background-color: var(--color-background-elevation-1);
}

.perfmon-indicator-swatch {
  margin-right: 6px;
}

.perfmon-indicator:not(.active) .perfmon-indicator-swatch {
  background-color: var(--color-background-elevation-2) !important; /* stylelint-disable-line declaration-no-important */
}

.perfmon-indicator-title {
  flex: 0 0 115px;
}

.perfmon-indicator:not(.active) .perfmon-indicator-title {
  color: var(--color-text-secondary);
}

.perfmon-indicator-value {
  flex: 0 0 55px;
  text-align: right;
  overflow: visible;
}

.perfmon-indicator:not(.active) .perfmon-indicator-value {
  opacity: 0%;
}

/*# sourceURL=performanceMonitor.css */
`);
export default styles;
