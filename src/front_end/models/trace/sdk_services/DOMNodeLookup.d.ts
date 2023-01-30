import type * as Handlers from '../handlers/handlers.js';
import type * as Protocol from '../../../generated/protocol.js';
import * as SDK from '../../../core/sdk/sdk.js';
export declare function _TEST_clearCache(): void;
/**
 * Looks up the DOM Node on the page for the given BackendNodeId. Uses the
 * provided TraceParseData as the cache and will cache the result after the
 * first lookup.
 */
export declare function forNodeId(modelData: Handlers.Types.TraceParseData, nodeId: Protocol.DOM.BackendNodeId): Promise<SDK.DOMModel.DOMNode | null>;
/**
 * Takes a set of Protocol.DOM.BackendNodeId ids and will return a map of NodeId=>DOMNode.
 * Results are cached based on 1) the provided TraceParseData and 2) the provided set of IDs.
 */
export declare function forMultipleNodeIds(modelData: Handlers.Types.TraceParseData, nodeIds: Set<Protocol.DOM.BackendNodeId>): Promise<Map<Protocol.DOM.BackendNodeId, SDK.DOMModel.DOMNode | null>>;
