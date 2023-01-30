// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/**
 * Copyright 2019 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

.overview-completed-view {
  overflow: auto;

  --overview-default-padding: 28px;
  --overview-icon-padding: 32px;
}

.overview-completed-view .summary ul,
.overview-completed-view .colors ul {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}

.overview-completed-view .summary ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  grid-gap: 16px;
}

.overview-completed-view .colors ul li {
  display: inline-block;
  margin: 0 0 16px;
  padding: 0 8px 0 0;
}

.overview-completed-view .summary ul li {
  display: flex;
  flex-direction: column;
  grid-column-start: auto;
}

.overview-completed-view li .label {
  font-size: 12px;
  padding-bottom: 2px;
}

.overview-completed-view li .value {
  font-size: 17px;
}

.overview-completed-view ul li span {
  font-weight: bold;
}

.unused-rules-grid .header-container,
.unused-rules-grid .data-container,
.unused-rules-grid table.data {
  position: relative;
}

.unused-rules-grid .data-container {
  top: 0;
  max-height: 350px;
}

.unused-rules-grid {
  border-left: none;
  border-right: none;
}
/** Ensure links are rendered at the correct height */

.unused-rules-grid .monospace {
  display: block;
  height: 18px;
}

.element-grid {
  flex: 1;
  border-left: none;
  border-right: none;
  overflow: auto;
}

.block {
  width: 65px;
  height: 25px;
  border-radius: 3px;
  margin-right: 16px;
}

.block-title {
  padding-top: 4px;
  font-size: 12px;
  color: var(--color-text-primary);
  letter-spacing: 0;
  text-transform: uppercase;
}

.block-title.color-text {
  text-transform: none;
  max-width: 65px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
  user-select: text;
  overflow: hidden;
}

.results-section {
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-details-hairline);
  padding: var(--overview-default-padding) 0 var(--overview-default-padding) 0;
}

.horizontally-padded {
  padding-left: var(--overview-default-padding);
  padding-right: var(--overview-default-padding);
}

.results-section h1 {
  font-size: 15px;
  font-weight: normal;
  padding: 0;
  margin: 0 0 20px;
  padding-left: calc(var(--overview-default-padding) + var(--overview-icon-padding));
  position: relative;
  height: 26px;
  line-height: 26px;
}

.results-section h1::before {
  content: "";
  display: block;
  position: absolute;
  left: var(--overview-default-padding);
  top: 0;
  width: 26px;
  height: 26px;
  background-image: var(--image-file-cssoverview_icons_2x);
  background-size: 104px 26px;
}

.results-section.horizontally-padded h1 {
  padding-left: var(--overview-icon-padding);
}

.results-section.horizontally-padded h1::before {
  left: 0;
}

.results-section.summary h1 {
  padding-left: 0;
}

.results-section.summary h1::before {
  display: none;
}

.results-section.colors h1::before {
  background-position: 0 0;
}

.results-section.font-info h1::before {
  background-position: -26px 0;
}

.results-section.unused-declarations h1::before {
  background-position: -52px 0;
}

.results-section.media-queries h1::before {
  background-position: -78px 0;
}

.results-section.colors h2 {
  margin-top: 20px;
  font-size: 13px;
  font-weight: normal;
}

.overview-completed-view .font-info ul,
.overview-completed-view .media-queries ul,
.overview-completed-view .unused-declarations ul {
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0 var(--overview-default-padding);
}

.overview-completed-view .font-info ul li,
.overview-completed-view .media-queries ul li,
.overview-completed-view .unused-declarations ul li {
  display: grid;
  grid-template-columns: 2fr 3fr;
  grid-gap: 12px;
  margin-bottom: 4px;
  align-items: center;
}

.overview-completed-view .font-info button,
.overview-completed-view .media-queries button,
.overview-completed-view .unused-declarations button {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  border-radius: 2px;
  cursor: pointer;
  height: 28px;
  background: none;
}

.overview-completed-view .font-info button .details,
.overview-completed-view .media-queries button .details,
.overview-completed-view .unused-declarations button .details {
  min-width: 100px;
  text-align: right;
  margin-right: 8px;
  color: var(--color-primary);
  pointer-events: none;
}

.overview-completed-view .font-info button .bar-container,
.overview-completed-view .media-queries button .bar-container,
.overview-completed-view .unused-declarations button .bar-container {
  flex: 1;
  pointer-events: none;
}

.overview-completed-view .font-info button .bar,
.overview-completed-view .media-queries button .bar,
.overview-completed-view .unused-declarations button .bar {
  height: 8px;
  background: var(--color-primary);
  border-radius: 2px;
  min-width: 2px;
}

.overview-completed-view .font-info button:hover .details,
.overview-completed-view .font-info button:focus .details,
.overview-completed-view .media-queries button:hover .details,
.overview-completed-view .media-queries button:focus .details,
.overview-completed-view .unused-declarations button:hover .details,
.overview-completed-view .unused-declarations button:focus .details {
  color: var(--color-primary-variant);
}

.overview-completed-view .font-info button:hover .bar,
.overview-completed-view .font-info button:focus .bar,
.overview-completed-view .media-queries button:hover .bar,
.overview-completed-view .media-queries button:focus .bar,
.overview-completed-view .unused-declarations button:hover .bar,
.overview-completed-view .unused-declarations button:focus .bar {
  background-color: var(--color-primary-variant);
  box-shadow: 0 1px 2px var(--divider-line), 0 0 0 2px var(--color-primary-variant);
  color: var(--color-background);
}

.overview-completed-view .font-info .font-metric {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  grid-gap: 12px;
}

.overview-completed-view .font-info ul {
  padding: 0;
}

.overview-completed-view .font-info ul li {
  grid-template-columns: 1fr 4fr;
}

.overview-completed-view .font-info h2 {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 1em;
}

.overview-completed-view .font-info h3 {
  font-size: 13px;
  font-weight: normal;
  font-style: italic;
  margin: 0 0 0.5em;
}

.overview-completed-view .font-info {
  padding-bottom: 0;
}

.overview-completed-view .font-family {
  padding: var(--overview-default-padding);
}

.overview-completed-view .font-family:nth-child(2n+1) {
  background: var(--color-background);
}

.overview-completed-view .font-family:first-of-type {
  padding-top: 0;
}

.contrast-warning {
  display: flex;
  align-items: baseline;
}

.contrast-warning .threshold-label {
  font-weight: normal;
  width: 30px;
}

.contrast-warning [is="ui-icon"] {
  margin-left: 5px;
}

.contrast-preview {
  padding: 0 5px;
}

.contrast-container-in-grid {
  display: flex;
  align-items: baseline;
}

.contrast-container-in-grid > * {
  margin-right: 5px;
  min-width: initial;
}

[is="ui-icon"].smallicon-checkmark-square {
  background-color: var(--color-green);
}

[is="ui-icon"].smallicon-no {
  background-color: var(--color-red);
}

.data .nodeId-column {
  align-items: center;
  display: flex;
  height: 20px;
}

.nodeId-column .monospace {
  overflow: hidden;
}

.show-element {
  margin: 0 0 0 8px;
  padding: 0;
  background: none;
  border: none;
  -webkit-mask-image: var(--image-file-ic_show_node_16x16);
  background-color: var(--color-text-secondary);
  width: 16px;
  height: 16px;
  display: none;
  cursor: pointer;
  flex: none;
}

.show-element:focus,
.show-element:hover {
  background-color: var(--color-primary);
}

.nodeId-column:focus-within .show-element,
.nodeId-column:hover .show-element {
  display: inline-block;
}

/*# sourceURL=cssOverviewCompletedView.css */
`);
export default styles;
