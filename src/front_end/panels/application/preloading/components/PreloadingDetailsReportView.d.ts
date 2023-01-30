import * as SDK from '../../../../core/sdk/sdk.js';
type PrerenderingAttempt = SDK.PrerenderingModel.PrerenderingAttempt;
export type PreloadingDetailsReportViewData = PrerenderingAttempt | null;
export declare class PreloadingDetailsReportView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: PreloadingDetailsReportViewData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-preloading-details-report-view': PreloadingDetailsReportView;
    }
}
export {};
