import type * as Handlers from '../handlers/handlers.js';
import type * as Types from '../types/types.js';
import * as SDK from '../../../core/sdk/sdk.js';
export declare function _TEST_clearCache(): void;
export interface LayoutShiftSource {
    previousRect: DOMRect;
    currentRect: DOMRect;
    node: SDK.DOMModel.DOMNode;
}
/**
 * Calculates and returns a list of sources for a LayoutShift.
 * Here, a source is considered as a node that moved and contributed to the
 * given LayoutShift existing and the score it was given. Each source returned
 * contains a reference to the DOM Node, and its dimensions (as a DOMRect), both
 * before and now, so we can see how this node changed and how that impacted the
 * layout shift.
 *
 * This data is cached based on the provided model data and the given layout
 * shift, so it is is safe to call multiple times with the same input.
 */
export declare function sourcesForLayoutShift(modelData: Handlers.Types.TraceParseData, event: Types.TraceEvents.TraceEventLayoutShift): Promise<readonly LayoutShiftSource[]>;
/**
 * Takes a LayoutShift and normalizes its node dimensions based on the device
 * pixel ratio (DPR) of the user's display.
 * This is required because the Layout Instability API is not based on CSS
 * pixels, but physical pixels. Therefore we need to map these to normalized CSS
 * pixels if we can. For example, if the user is on a device with a DPR of 2,
 * the values of the node dimensions reported by the Instability API need to be
 * divided by 2 to be accurate.
 * This function is safe to call multiple times as results are cached based on
 * the provided model data.
 * See https://crbug.com/1300309 for details.
 */
export declare function normalizedImpactedNodesForLayoutShift(modelData: Handlers.Types.TraceParseData, event: Types.TraceEvents.TraceEventLayoutShift): Promise<readonly Types.TraceEvents.TraceImpactedNode[]>;
