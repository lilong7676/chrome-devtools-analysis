// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../../core/sdk/sdk.js';
const singleNodeCache = new Map();
const batchNodesCache = new Map();
// eslint-disable-next-line @typescript-eslint/naming-convention
export function _TEST_clearCache() {
    singleNodeCache.clear();
    batchNodesCache.clear();
}
/**
 * Looks up the DOM Node on the page for the given BackendNodeId. Uses the
 * provided TraceParseData as the cache and will cache the result after the
 * first lookup.
 */
export async function forNodeId(modelData, nodeId) {
    const fromCache = singleNodeCache.get(modelData)?.get(nodeId);
    if (fromCache !== undefined) {
        return fromCache;
    }
    const target = SDK.TargetManager.TargetManager.instance().mainFrameTarget();
    const domModel = target?.model(SDK.DOMModel.DOMModel);
    if (!domModel) {
        return null;
    }
    const domNodesMap = await domModel.pushNodesByBackendIdsToFrontend(new Set([nodeId]));
    const result = domNodesMap?.get(nodeId) || null;
    const cacheForModel = singleNodeCache.get(modelData) || new Map();
    cacheForModel.set(nodeId, result);
    singleNodeCache.set(modelData, cacheForModel);
    return result;
}
/**
 * Takes a set of Protocol.DOM.BackendNodeId ids and will return a map of NodeId=>DOMNode.
 * Results are cached based on 1) the provided TraceParseData and 2) the provided set of IDs.
 */
export async function forMultipleNodeIds(modelData, nodeIds) {
    const fromCache = batchNodesCache.get(modelData)?.get(nodeIds);
    if (fromCache) {
        return fromCache;
    }
    const target = SDK.TargetManager.TargetManager.instance().mainFrameTarget();
    const domModel = target?.model(SDK.DOMModel.DOMModel);
    if (!domModel) {
        return new Map();
    }
    const domNodesMap = await domModel.pushNodesByBackendIdsToFrontend(nodeIds) || new Map();
    const cacheForModel = batchNodesCache.get(modelData) ||
        new Map();
    cacheForModel.set(nodeIds, domNodesMap);
    batchNodesCache.set(modelData, cacheForModel);
    return domNodesMap;
}
//# sourceMappingURL=DOMNodeLookup.js.map