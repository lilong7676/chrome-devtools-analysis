import * as UI from '../../../ui/legacy/legacy.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as PreloadingComponents from './components/components.js';
export declare class PreloadingView extends UI.Widget.VBox {
    private readonly model;
    private focused;
    private readonly toolbar;
    private readonly splitWidget;
    private readonly grid;
    private readonly bottomContainer;
    private details;
    constructor(model: SDK.PrerenderingModel.PrerenderingModel);
    wasShown(): void;
    private updateDetails;
    private onModelUpdated;
    private onCellFocused;
    private onClearNotOngoing;
    getGridForTest(): PreloadingComponents.PreloadingGrid.PreloadingGrid;
    getDetailsForTest(): PreloadingComponents.PreloadingDetailsReportView.PreloadingDetailsReportView;
}
