import * as SDK from '../../../core/sdk/sdk.js';
import { forNodeId } from './DOMNodeLookup.js';
const layoutShiftSourcesCache = new Map();
const normalizedNodesCache = new Map();
// eslint-disable-next-line @typescript-eslint/naming-convention
export function _TEST_clearCache() {
    layoutShiftSourcesCache.clear();
    normalizedNodesCache.clear();
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
export async function sourcesForLayoutShift(modelData, event) {
    const fromCache = layoutShiftSourcesCache.get(modelData)?.get(event);
    if (fromCache) {
        return fromCache;
    }
    const impactedNodes = event.args.data?.impacted_nodes;
    if (!impactedNodes) {
        return [];
    }
    const sources = [];
    await Promise.all(impactedNodes.map(async (node) => {
        const domNode = await forNodeId(modelData, node.node_id);
        if (domNode) {
            sources.push({
                previousRect: new DOMRect(node.old_rect[0], node.old_rect[1], node.old_rect[2], node.old_rect[3]),
                currentRect: new DOMRect(node.new_rect[0], node.new_rect[1], node.new_rect[2], node.new_rect[3]),
                node: domNode,
            });
        }
    }));
    const cacheForModel = layoutShiftSourcesCache.get(modelData) || new Map();
    cacheForModel.set(event, sources);
    layoutShiftSourcesCache.set(modelData, cacheForModel);
    return sources;
}
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
export async function normalizedImpactedNodesForLayoutShift(modelData, event) {
    const fromCache = normalizedNodesCache.get(modelData)?.get(event);
    if (fromCache) {
        return fromCache;
    }
    const impactedNodes = event.args?.data?.impacted_nodes;
    if (!impactedNodes) {
        return [];
    }
    let viewportScale = null;
    const target = SDK.TargetManager.TargetManager.instance().mainFrameTarget();
    // Get the CSS-to-physical pixel ratio of the device the inspected
    // target is running at.
    const evaluateResult = await target?.runtimeAgent().invoke_evaluate({ expression: 'window.devicePixelRatio' });
    if (evaluateResult?.result.type === 'number') {
        viewportScale = evaluateResult?.result.value ?? null;
    }
    if (!viewportScale) {
        // Bail and return the nodes as is.
        return impactedNodes;
    }
    const normalizedNodes = [];
    for (const impactedNode of impactedNodes) {
        const newNode = { ...impactedNode };
        for (let i = 0; i < impactedNode.old_rect.length; i++) {
            newNode.old_rect[i] /= viewportScale;
        }
        for (let i = 0; i < impactedNode.new_rect.length; i++) {
            newNode.new_rect[i] /= viewportScale;
        }
        normalizedNodes.push(newNode);
    }
    const cacheForModel = normalizedNodesCache.get(modelData) ||
        new Map();
    cacheForModel.set(event, normalizedNodes);
    normalizedNodesCache.set(modelData, cacheForModel);
    return normalizedNodes;
}
//# sourceMappingURL=LayoutShifts.js.map