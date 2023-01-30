import type * as SDK from '../../core/sdk/sdk.js';
import type * as Platform from '../../core/platform/platform.js';
import { ApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import { type ResourcesPanel } from './ResourcesPanel.js';
export declare class PreloadingTreeElement extends ApplicationPanelTreeElement {
    private model?;
    private view?;
    constructor(resourcesPanel: ResourcesPanel);
    get itemURL(): Platform.DevToolsPath.UrlString;
    initialize(model: SDK.PrerenderingModel.PrerenderingModel): void;
    onselect(selectedByUser?: boolean): boolean;
}
