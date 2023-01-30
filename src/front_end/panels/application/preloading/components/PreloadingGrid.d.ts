export declare const i18nString: (id: string, values?: import("../../../../core/i18n/i18nTypes.js").Values | undefined) => import("../../../../core/platform/UIString.js").LocalizedString;
export interface PreloadingGridRow {
    id: string;
    startedAt: string;
    type: string;
    trigger: string;
    url: string;
    status: string;
}
export declare class PreloadingGrid extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    update(rows: PreloadingGridRow[]): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-preloading-grid': PreloadingGrid;
    }
}
