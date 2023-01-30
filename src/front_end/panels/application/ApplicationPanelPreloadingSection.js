// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import { PreloadingView } from './preloading/PreloadingView.js';
const UIStrings = {
    /**
     *@description Text in Application Panel Sidebar of the Application panel
     */
    prefetchingAndPrerendering: 'Prefetching & Prerendering',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/ApplicationPanelPreloadingSection.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class PreloadingTreeElement extends ApplicationPanelTreeElement {
    model;
    view;
    constructor(resourcesPanel) {
        super(resourcesPanel, i18nString(UIStrings.prefetchingAndPrerendering), false);
        const icon = UI.Icon.Icon.create('mediumicon-fetch', 'resource-tree-item');
        this.setLeadingIcons([icon]);
        // TODO(https://crbug.com/1384419): Set link
    }
    get itemURL() {
        return 'preloading://';
    }
    initialize(model) {
        this.model = model;
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        if (!this.model) {
            return false;
        }
        if (!this.view) {
            this.view = new PreloadingView(this.model);
        }
        this.showView(this.view);
        // TODO(https://crbug.com/1384419): Report metrics when the panel shown.
        return false;
    }
}
//# sourceMappingURL=ApplicationPanelPreloadingSection.js.map