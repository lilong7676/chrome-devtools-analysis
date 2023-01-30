import * as Common from '../../../core/common/common.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as Protocol from '../../../generated/protocol.js';
export declare class FrameDetailsView extends UI.ThrottledWidget.ThrottledWidget {
    #private;
    constructor(frame: SDK.ResourceTreeModel.ResourceTreeFrame);
    targetChanged(event: Common.EventTarget.EventTargetEvent<Protocol.Target.TargetInfo>): void;
    doUpdate(): Promise<void>;
}
export interface FrameDetailsReportViewData {
    frame: SDK.ResourceTreeModel.ResourceTreeFrame;
    target?: SDK.Target.Target;
    prerenderedUrl?: string;
    adScriptId: Protocol.Page.AdScriptId | null;
}
export declare class FrameDetailsReportView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: FrameDetailsReportViewData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-frame-details-view': FrameDetailsReportView;
    }
}
