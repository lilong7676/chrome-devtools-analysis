// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright (c) 2017 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

[slot="insertion-point-main"] {
  flex-direction: column;
  display: flex;
}

[slot="insertion-point-sidebar"] {
  overflow: auto;
}

.diff-container {
  flex: 1;
  overflow: auto;
}

:focus.selected {
  --override-selected-color: #fff;

  background-color: var(--legacy-selection-bg-color);
  color: var(--override-selected-color);
}

.-theme-with-dark-background :focus.selected,
:host-context(.-theme-with-dark-background) :focus.selected {
  --override-selected-color: rgb(0 0 0);
}

.changes-toolbar {
  background-color: var(--color-background-elevation-1);
  border-top: var(--legacy-divider-border);
}

/*# sourceURL=changesView.css */
`);
export default styles;
