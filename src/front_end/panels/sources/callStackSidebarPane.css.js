// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2016 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

.call-frame-warnings-message {
  --override-ignore-message-background-color: #ffffc2;

  text-align: center;
  font-style: italic;
  padding: 4px;
  color: var(--color-text-secondary);
  background-color: var(--override-ignore-message-background-color);
}

.ignore-listed-message {
  padding: 1px;
}

.ignore-listed-message-label {
  color: var(--color-text-secondary);
  align-items: center;
  display: flex;
}

.-theme-with-dark-background .ignore-listed-message,
:host-context(.-theme-with-dark-background) .ignore-listed-message {
  --override-ignore-message-background-color: rgb(72 72 0);
}

.show-more-message > .link {
  margin-left: 5px;
}

.show-more-message {
  text-align: center;
  font-style: italic;
  padding: 4px;
  border-top: 1px solid var(--color-details-hairline);
}

.call-frame-item {
  padding: 3px 8px 3px 20px;
  position: relative;
  min-height: 18px;
  line-height: 15px;
  display: flex;
  flex-wrap: wrap;
}

.call-frame-title-text {
  text-overflow: ellipsis;
  overflow: hidden;
}

.async-header + .call-frame-item {
  border-top: 0;
}

.call-frame-item:not(.async-header) {
  border-top: 1px solid var(--color-details-hairline);
}

.call-frame-item-title,
.call-frame-location {
  display: flex;
  white-space: nowrap;
}

.async-header .call-frame-item-title {
  font-weight: bold;
  color: var(--color-text-primary);
  background-color: var(--color-background);
  margin-left: -5px;
  padding: 0 5px;
  z-index: 1;
}

.call-frame-item:focus-visible,
.call-frame-item.async-header:focus-visible .call-frame-item-title {
  background-color: var(--legacy-focus-bg-color);
}

.ignore-listed-checkbox:focus-visible {
  outline-width: unset;
}

.call-frame-item:not(.async-header):hover {
  background-color: var(--color-background-elevation-1);
}

.call-frame-location {
  color: var(--color-text-secondary);
  margin-left: auto;
  padding: 0 10px;
}

.async-header::before {
  content: " ";
  width: 100%;
  border-top: 1px solid var(--color-details-hairline);
  margin-top: 8px;
  position: absolute;
  left: 0;
}

.ignore-listed-call-frame {
  opacity: 60%;
  font-style: italic;
}

.selected-call-frame-icon {
  display: none;
  position: absolute;
  top: 5px;
  left: 4px;
}

.call-frame-item.selected .selected-call-frame-icon {
  display: block;
}

.call-frame-warning-icon {
  display: block;
  position: absolute;
  top: 5px;
  right: 4px;
}

@media (forced-colors: active) {
  .call-frame-item:focus-visible,
  .call-frame-item:not(.async-header):hover {
    forced-color-adjust: none;
    background-color: Highlight;
  }

  .call-frame-item:focus-visible *,
  .call-frame-item:not(.async-header):hover * {
    color: HighlightText;
  }
}

/*# sourceURL=callStackSidebarPane.css */
`);
export default styles;
