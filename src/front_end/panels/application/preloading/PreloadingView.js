// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as PreloadingComponents from './components/components.js';
// eslint-disable-next-line rulesdir/es_modules_import
import emptyWidgetStyles from '../../../ui/legacy/emptyWidget.css.js';
import preloadingViewStyles from './preloadingView.css.js';
const UIStrings = {
    /**
     *@description Text to clear content
     */
    clearNotOngoing: 'Clear not ongoing',
    /**
     *@description Text in grid and details
     */
    statusPrerendering: 'Prerendering',
    /**
     *@description Text in grid and details
     */
    statusActivated: 'Activated',
    /**
     *@description Text in grid and details
     */
    statusDiscarded: 'Discarded',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/preloading/PreloadingView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class PrerenderingUIUtils {
    static trigger(x) {
        switch (x.trigger.kind) {
            case 'PrerenderingTriggerSpecRules':
                return i18n.i18n.lockedString('Speculation Rules');
            case 'PrerenderingTriggerDUI':
                return i18n.i18n.lockedString('Direct User Input');
            case 'PrerenderingTriggerDSE':
                return i18n.i18n.lockedString('Default Search Engine');
            case 'PrerenderingTriggerOpaque':
                return i18n.i18n.lockedString('Opaque');
        }
    }
    static status(x) {
        switch (x.status) {
            case "Prerendering" /* SDK.PrerenderingModel.PrerenderingStatus.Prerendering */:
                return i18nString(UIStrings.statusPrerendering);
            case "Activated" /* SDK.PrerenderingModel.PrerenderingStatus.Activated */:
                return i18nString(UIStrings.statusActivated);
            case "Discarded" /* SDK.PrerenderingModel.PrerenderingStatus.Discarded */:
                return i18nString(UIStrings.statusDiscarded);
        }
    }
}
export class PreloadingView extends UI.Widget.VBox {
    model;
    focused = null;
    toolbar;
    splitWidget;
    grid = new PreloadingComponents.PreloadingGrid.PreloadingGrid();
    bottomContainer;
    details = new PreloadingComponents.PreloadingDetailsReportView.PreloadingDetailsReportView();
    constructor(model) {
        super(/* isWebComponent */ true, /* delegatesFocus */ false);
        this.model = model;
        this.model.addEventListener(SDK.PrerenderingModel.Events.PrerenderingAttemptStarted, this.onModelUpdated, this);
        this.model.addEventListener(SDK.PrerenderingModel.Events.PrerenderingAttemptUpdated, this.onModelUpdated, this);
        this.model.addEventListener(SDK.PrerenderingModel.Events.PrerenderingAttemptsRemoved, this.onModelUpdated, this);
        // this (VBox)
        //   +- toolbar (| [clear] |)
        //   +- splitWidget
        //        +- topContainer
        //             +- PreloadingGrid
        //        +- bottomContainer
        //             +- PreloadingDetailsReportView
        //
        // - If an row selected, PreloadingDetailsReportView shows details of it.
        // - If not, PreloadingDetailsReportView shows some messages.
        this.toolbar = new UI.Toolbar.Toolbar('preloading-toolbar', this.contentElement);
        const clearButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.clearNotOngoing), 'largeicon-clear');
        clearButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this.onClearNotOngoing, this);
        this.toolbar.appendToolbarItem(clearButton);
        this.toolbar.appendSeparator();
        const topContainer = new UI.Widget.VBox();
        topContainer.setMinimumSize(0, 40);
        this.bottomContainer = new UI.Widget.VBox();
        this.bottomContainer.setMinimumSize(0, 80);
        this.splitWidget = new UI.SplitWidget.SplitWidget(
        /* isVertical */ false, 
        /* secondIsSidebar */ true, 
        /* settingName */ undefined, 
        /* defaultSidebarWidth */ undefined, 
        /* defaultSidebarHeight */ 500, 
        /* constraintsInDip */ undefined);
        this.splitWidget.setMainWidget(topContainer);
        this.splitWidget.setSidebarWidget(this.bottomContainer);
        this.grid.addEventListener('cellfocused', this.onCellFocused.bind(this));
        topContainer.contentElement.appendChild(this.grid);
        this.bottomContainer.contentElement.appendChild(this.details);
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([emptyWidgetStyles, preloadingViewStyles]);
        this.splitWidget.show(this.contentElement);
        this.onModelUpdated();
    }
    updateDetails() {
        this.details.data = this.focused === null ? null : this.model.getById(this.focused);
    }
    onModelUpdated() {
        // Update grid
        const rows = this.model.getAll().map(({ id, attempt }) => {
            return {
                id,
                startedAt: new Date(attempt.startedAt).toLocaleString(),
                type: i18n.i18n.lockedString('Prerendering'),
                trigger: PrerenderingUIUtils.trigger(attempt),
                url: attempt.url,
                status: PrerenderingUIUtils.status(attempt),
            };
        });
        this.grid.update(rows);
        this.updateDetails();
    }
    onCellFocused(event) {
        const focusedEvent = event;
        this.focused = focusedEvent.data.row.cells.find(cell => cell.columnId === 'id')?.value;
        this.updateDetails();
    }
    onClearNotOngoing() {
        this.model.clearNotOngoing();
    }
    getGridForTest() {
        return this.grid;
    }
    getDetailsForTest() {
        return this.details;
    }
}
//# sourceMappingURL=PreloadingView.js.map