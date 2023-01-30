import type * as Protocol from '../../../generated/protocol.js';
import * as UI from '../../../ui/legacy/legacy.js';
interface SharedStorageMetadataGetter {
    getMetadata: () => Promise<Protocol.Storage.SharedStorageMetadata | null>;
    resetBudget: () => Promise<void>;
}
export declare class SharedStorageMetadataView extends UI.Widget.VBox {
    #private;
    constructor(sharedStorageMetadataGetter: SharedStorageMetadataGetter, owner: string);
    doUpdate(): Promise<void>;
}
export interface SharedStorageMetadataViewData {
    creationTime: Protocol.Network.TimeSinceEpoch | null;
    length: number;
    remainingBudget: number;
}
interface SharedStorageResetBudgetButtonData {
    resetBudgetHandler: () => void;
}
declare class SharedStorageResetBudgetButton extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: SharedStorageResetBudgetButtonData);
}
export declare class SharedStorageMetadataReportView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    resetBudgetHandler: (() => void);
    connectedCallback(): void;
    set data(data: SharedStorageMetadataViewData);
    set origin(origin: string);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-shared-storage-metadata-view': SharedStorageMetadataReportView;
        'devtools-shared-storage-reset-budget-button': SharedStorageResetBudgetButton;
    }
}
export {};
