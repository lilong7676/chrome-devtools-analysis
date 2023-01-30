import type * as Protocol from '../../../generated/protocol.js';
import { type MicroSeconds, type MilliSeconds, type Seconds } from './Timing.js';
export declare const enum TraceEventPhase {
    BEGIN = "B",
    END = "E",
    COMPLETE = "X",
    INSTANT = "I",
    COUNTER = "C",
    ASYNC_NESTABLE_START = "b",
    ASYNC_NESTABLE_INSTANT = "n",
    ASYNC_NESTABLE_END = "e",
    FLOW_START = "s",
    FLOW_STEP = "t",
    FLOW_END = "f",
    SAMPLE = "P",
    OBJECT_CREATED = "N",
    OBJECT_SNAPSHOT = "O",
    OBJECT_DESTROYED = "D",
    METADATA = "M",
    MEMORY_DUMP_GLOBAL = "V",
    MEMORY_DUMP_PROCESS = "v",
    MARK = "R",
    CLOCK_SYNC = "c"
}
export declare const enum TraceEventScope {
    THREAD = "t",
    PROCESS = "p",
    GLOBAL = "g"
}
export interface TraceEventData {
    args?: TraceEventArgs;
    cat: string;
    name: string;
    ph: TraceEventPhase;
    pid: ProcessID;
    tid: ThreadID;
    tts?: MicroSeconds;
    ts: MicroSeconds;
    tdur?: MicroSeconds;
    dur?: MicroSeconds;
}
export interface TraceEventArgs {
    data?: TraceEventArgsData;
}
export interface TraceEventArgsData {
    stackTrace?: TraceEventCallFrame[];
}
export interface TraceEventCallFrame {
    codeType?: string;
    functionName: string;
    scriptId: number;
    columnNumber?: number;
    lineNumber?: number;
    url?: string;
}
export interface TraceFrame {
    frame: string;
    name: string;
    processId: ProcessID;
    url: string;
    parent?: string;
}
export interface TraceEventSample extends TraceEventData {
    ph: TraceEventPhase.SAMPLE;
}
export interface TraceEventProfile extends TraceEventSample {
    name: 'Profile';
    id: ProfileID;
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            startTime: MicroSeconds;
        };
    };
}
export interface TraceEventProfileChunk extends TraceEventSample {
    name: 'ProfileChunk';
    id: ProfileID;
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            cpuProfile?: TraceEventPartialProfile;
            timeDeltas?: MicroSeconds[];
        };
    };
}
export interface TraceEventPartialProfile {
    nodes?: TraceEventPartialNode[];
    samples: CallFrameID[];
}
export interface TraceEventPartialNode {
    callFrame: TraceEventCallFrame;
    id: CallFrameID;
    parent?: CallFrameID;
}
export interface TraceEventComplete extends TraceEventData {
    ph: TraceEventPhase.COMPLETE;
    dur: MicroSeconds;
}
export interface TraceEventDispatch extends TraceEventComplete {
    name: 'EventDispatch';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            type: string;
        };
    };
}
export interface TraceEventEventTiming extends TraceEventData {
    ph: TraceEventPhase.ASYNC_NESTABLE_START | TraceEventPhase.ASYNC_NESTABLE_END;
    args: TraceEventArgs & {
        frame: string;
        data?: TraceEventArgsData & {
            cancelable: boolean;
            duration: MilliSeconds;
            processingEnd: MicroSeconds;
            processingStart: MicroSeconds;
            timeStamp: MicroSeconds;
            interactionId?: number;
            type: string;
        };
    };
}
export interface TraceEventGPUTask extends TraceEventComplete {
    name: 'GPUTask';
    args: TraceEventArgs & {
        data?: TraceEventArgsData & {
            renderer_pid: ProcessID;
            used_bytes: number;
        };
    };
}
export interface TraceEventSyntheticNetworkRedirect {
    url: string;
    priority: string;
    ts: MicroSeconds;
    dur: MicroSeconds;
}
export interface TraceEventSyntheticNetworkRequest extends TraceEventComplete {
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            decodedBodyLength: number;
            dnsLookup: MicroSeconds;
            download: MicroSeconds;
            encodedDataLength: number;
            finishTime: MicroSeconds;
            frame: string;
            fromCache: boolean;
            fromServiceWorker: boolean;
            host: string;
            initialConnection: MicroSeconds;
            isHttps: boolean;
            mimeType: string;
            networkDuration: MicroSeconds;
            pathname: string;
            search: string;
            priority: string;
            processingDuration: MicroSeconds;
            protocol: string;
            proxyNegotiation: MicroSeconds;
            queueing: MicroSeconds;
            receiveHeadersEnd: MicroSeconds;
            redirects: TraceEventSyntheticNetworkRedirect[];
            redirectionDuration: MicroSeconds;
            renderBlocking: RenderBlocking;
            requestId: string;
            requestingFrameUrl: string;
            requestSent: MicroSeconds;
            requestTime: number;
            sendEnd: MicroSeconds;
            sendStart: MicroSeconds;
            statusCode: number;
            ssl: MicroSeconds;
            sslStart: MicroSeconds;
            stalled: MicroSeconds;
            totalTime: MicroSeconds;
            url: string;
            waiting: MicroSeconds;
        };
    };
    cat: 'loading';
    name: 'SyntheticNetworkRequest';
    ph: TraceEventPhase.COMPLETE;
    dur: MicroSeconds;
    tdur: MicroSeconds;
    ts: MicroSeconds;
    tts: MicroSeconds;
    pid: ProcessID;
    tid: ThreadID;
}
export interface TraceEventSnapshot extends TraceEventData {
    args: TraceEventArgs & {
        snapshot: string;
    };
    name: 'Screenshot';
    cat: 'disabled-by-default-devtools.screenshot';
    ph: TraceEventPhase.OBJECT_SNAPSHOT;
}
export interface TraceEventAnimation extends TraceEventData {
    args: TraceEventArgs & {
        id?: string;
        name?: string;
        nodeId?: number;
        nodeName?: string;
        state?: string;
        compositeFailed?: number;
        unsupportedProperties?: string[];
    };
    name: 'Animation';
    id2?: {
        local?: string;
    };
}
export interface TraceEventMetadata extends TraceEventData {
    ph: TraceEventPhase.METADATA;
    args: TraceEventArgs & {
        name?: string;
        uptime?: string;
    };
}
export interface TraceEventThreadName extends TraceEventMetadata {
    name: 'thread_name';
    args: TraceEventArgs & {
        name?: string;
    };
}
export interface TraceEventProcessName extends TraceEventMetadata {
    name: 'process_name';
}
export interface TraceEventMark extends TraceEventData {
    ph: TraceEventPhase.MARK;
}
export interface TraceEventNavigationStart extends TraceEventMark {
    name: 'navigationStart';
    args: TraceEventArgs & {
        data?: TraceEventArgsData & {
            documentLoaderURL: string;
            isLoadingMainFrame: boolean;
            isOutermostMainFrame?: boolean;
            navigationId: string;
        };
        frame: string;
    };
}
export interface TraceEventFirstContentfulPaint extends TraceEventMark {
    name: 'firstContentfulPaint';
    args: TraceEventArgs & {
        frame: string;
        data?: TraceEventArgsData & {
            navigationId: string;
        };
    };
}
export type PageLoadEvent = TraceEventFirstContentfulPaint | TraceEventMarkDOMContent | TraceEventInteractiveTime | TraceEventLargestContentfulPaintCandidate | TraceEventLayoutShift;
export interface TraceEventLargestContentfulPaintCandidate extends TraceEventMark {
    name: 'largestContentfulPaint::Candidate';
    args: TraceEventArgs & {
        frame: string;
        data?: TraceEventArgsData & {
            candidateIndex: number;
            navigationId: string;
            nodeId: Protocol.DOM.BackendNodeId;
            type?: string;
        };
    };
}
export interface TraceEventLargestImagePaintCandidate extends TraceEventMark {
    name: 'LargestImagePaint::Candidate';
    args: TraceEventArgs & {
        frame: string;
        data?: TraceEventArgsData & {
            candidateIndex: number;
            imageUrl: string;
            DOMNodeId: Protocol.DOM.BackendNodeId;
        };
    };
}
export interface TraceEventLargestTextPaintCandidate extends TraceEventMark {
    name: 'LargestTextPaint::Candidate';
    args: TraceEventArgs & {
        frame: string;
        data?: TraceEventArgsData & {
            candidateIndex: number;
            DOMNodeId: Protocol.DOM.BackendNodeId;
        };
    };
}
export interface TraceEventInteractiveTime extends TraceEventMark {
    name: 'InteractiveTime';
    args: TraceEventArgs & {
        args: {
            total_blocking_time_ms: number;
        };
        frame: string;
    };
}
export interface TraceEventInstant extends TraceEventData {
    ph: TraceEventPhase.INSTANT;
    s: TraceEventScope;
}
export type TraceEventRendererData = TraceEventInstant | TraceEventComplete;
export interface TraceEventTracingStartedInBrowser extends TraceEventInstant {
    name: 'TracingStartedInBrowser';
    args: TraceEventArgs & {
        data?: TraceEventArgsData & {
            frameTreeNodeId: number;
            frames: TraceFrame[];
            persistentIds: boolean;
        };
    };
}
export interface TraceEventFrameCommittedInBrowser extends TraceEventInstant {
    name: 'FrameCommittedInBrowser';
    args: TraceEventArgs & {
        data?: TraceEventArgsData & TraceFrame;
    };
}
export interface TraceEventMainFrameViewport extends TraceEventInstant {
    name: 'PaintTimingVisualizer::Viewport';
    args: {
        data: TraceEventArgsData & {
            viewport_rect: number[];
        };
    };
}
export interface TraceEventCommitLoad extends TraceEventInstant {
    name: 'CommitLoad';
    args: TraceEventArgs & {
        data?: TraceEventArgsData & {
            frame: string;
            isMainFrame: boolean;
            name: string;
            nodeId: number;
            page: string;
            parent: string;
            url: string;
        };
    };
}
export interface TraceEventMarkDOMContent extends TraceEventInstant {
    name: 'MarkDOMContent';
    args: TraceEventArgs & {
        data?: TraceEventArgsData & {
            frame: string;
            isMainFrame: boolean;
            page: string;
        };
    };
}
export type TraceRect = [number, number, number, number];
export type TraceImpactedNode = {
    new_rect: TraceRect;
    node_id: Protocol.DOM.BackendNodeId;
    old_rect: TraceRect;
};
export interface TraceEventLayoutShift extends TraceEventInstant {
    name: 'LayoutShift';
    normalized?: boolean;
    args: TraceEventArgs & {
        frame: string;
        data?: TraceEventArgsData & {
            cumulative_score: number;
            frame_max_distance: number;
            had_recent_input: boolean;
            impacted_nodes: TraceImpactedNode[] | undefined;
            is_main_frame: boolean;
            overall_max_distance: number;
            region_rects: TraceRect[];
            score: number;
            weighted_score_delta: number;
        };
    };
}
export type Priorty = 'Low' | 'High' | 'VeryHigh' | 'Highest';
export type RenderBlocking = 'blocking' | 'non_blocking' | 'in_body_parser_blocking' | 'potentially_blocking';
export interface TraceEventResourceSendRequest extends TraceEventInstant {
    name: 'ResourceSendRequest';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            frame: string;
            requestId: string;
            url: string;
            priority: Priorty;
            renderBlocking?: RenderBlocking;
        };
    };
}
export interface TraceEventResourceWillSendRequest extends TraceEventInstant {
    name: 'ResourceWillSendRequest';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            requestId: string;
        };
    };
}
export interface TraceEventResourceFinish extends TraceEventInstant {
    name: 'ResourceFinish';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            decodedBodyLength: number;
            didFail: boolean;
            encodedDataLength: number;
            finishTime: Seconds;
            requestId: string;
        };
    };
}
export interface TraceEventResourceReceivedData extends TraceEventInstant {
    name: 'ResourceReceivedData';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            encodedDataLength: number;
            frame: string;
            requestId: string;
        };
    };
}
export interface TraceEventResourceReceiveResponse extends TraceEventInstant {
    name: 'ResourceReceiveResponse';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            encodedDataLength: number;
            frame: string;
            fromCache: boolean;
            fromServiceWorker: boolean;
            mimeType: string;
            requestId: string;
            responseTime: MilliSeconds;
            statusCode: number;
            timing: {
                connectEnd: MilliSeconds;
                connectStart: MilliSeconds;
                dnsEnd: MilliSeconds;
                dnsStart: MilliSeconds;
                proxyEnd: MilliSeconds;
                proxyStart: MilliSeconds;
                pushEnd: MilliSeconds;
                pushStart: MilliSeconds;
                receiveHeadersEnd: MilliSeconds;
                requestTime: number;
                sendEnd: MilliSeconds;
                sendStart: MilliSeconds;
                sslEnd: MilliSeconds;
                sslStart: MilliSeconds;
                workerReady: MilliSeconds;
                workerStart: MilliSeconds;
            };
        };
    };
}
export interface TraceEventMarkDOMContent extends TraceEventInstant {
    name: 'MarkDOMContent';
    args: TraceEventArgs & {
        data?: TraceEventArgsData & {
            frame: string;
            isMainFrame: boolean;
            page: string;
        };
    };
}
export declare const enum LayoutInvalidationReason {
    SIZE_CHANGED = "Size changed",
    ATTRIBUTE = "Attribute",
    ADDED_TO_LAYOUT = "Added to layout",
    SCROLLBAR_CHANGED = "Scrollbar changed",
    REMOVED_FROM_LAYOUT = "Removed from layout",
    STYLE_CHANGED = "Style changed",
    FONTS_CHANGED = "Fonts changed",
    UNKNOWN = "Unknown"
}
export interface TraceEventLayoutInvalidation extends TraceEventInstant {
    name: 'LayoutInvalidationTracking' | 'ScheduleStyleInvalidationTracking';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            frame: string;
            nodeId: Protocol.DOM.BackendNodeId;
            reason: LayoutInvalidationReason;
            nodeName?: string;
        };
    };
}
export declare const enum StyleRecalcInvalidationReason {
    ANIMATION = "Animation"
}
export interface TraceEventStyleRecalcInvalidation extends TraceEventInstant {
    name: 'StyleRecalcInvalidationTracking';
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            frame: string;
            nodeId: Protocol.DOM.BackendNodeId;
            reason: StyleRecalcInvalidationReason;
            subtree: boolean;
            nodeName?: string;
            extraData?: string;
        };
    };
}
export interface TraceEventPrePaint extends TraceEventComplete {
    name: 'PrePaint';
}
export type TraceEventAsyncUserTiming = TraceEventUserTimingBegin | TraceEventUserTimingEnd;
export interface TraceEventUserTimingBegin extends TraceEventData {
    cat: 'blink.user_timing';
    ph: TraceEventPhase.ASYNC_NESTABLE_START;
    id: string;
}
export interface TraceEventUserTimingEnd extends TraceEventData {
    cat: 'blink.user_timing';
    ph: TraceEventPhase.ASYNC_NESTABLE_END;
    id: string;
}
export interface TraceEventSyntheticUserTiming extends TraceEventData {
    id: string;
    dur: MicroSeconds;
    args: TraceEventArgs & {
        data: TraceEventArgsData & {
            beginEvent: TraceEventUserTimingBegin;
            endEvent: TraceEventUserTimingEnd;
        };
    };
}
declare class ProfileIdTag {
    #private;
}
export type ProfileID = string & ProfileIdTag;
export declare function ProfileID(value: string): ProfileID;
declare class CallFrameIdTag {
    #private;
}
export type CallFrameID = number & CallFrameIdTag;
export declare function CallFrameID(value: number): CallFrameID;
declare class ProcessIdTag {
    #private;
}
export type ProcessID = number & ProcessIdTag;
export declare function ProcessID(value: number): ProcessID;
declare class ThreadIdTag {
    #private;
}
export type ThreadID = number & ThreadIdTag;
export declare function ThreadID(value: number): ThreadID;
export declare function isTraceEventComplete(event: TraceEventData): event is TraceEventComplete;
export declare function isTraceEventDispatch(event: TraceEventData): event is TraceEventDispatch;
export declare function isTraceEventInstant(event: TraceEventData): event is TraceEventInstant;
export declare function isTraceEventRendererEvent(event: TraceEventData): event is TraceEventRendererData;
export declare function isThreadName(traceEventData: TraceEventData): traceEventData is TraceEventThreadName;
export declare function isProcessName(traceEventData: TraceEventData): traceEventData is TraceEventProcessName;
export declare function isTraceEventTracingStartedInBrowser(traceEventData: TraceEventData): traceEventData is TraceEventTracingStartedInBrowser;
export declare function isTraceEventFrameCommittedInBrowser(traceEventData: TraceEventData): traceEventData is TraceEventFrameCommittedInBrowser;
export declare function isTraceEventCommitLoad(traceEventData: TraceEventData): traceEventData is TraceEventCommitLoad;
export declare function isTraceEventNavigationStart(traceEventData: TraceEventData): traceEventData is TraceEventNavigationStart;
export declare function isTraceEventAnimation(traceEventData: TraceEventData): traceEventData is TraceEventAnimation;
export declare function isTraceEventLayoutShift(traceEventData: TraceEventData): traceEventData is TraceEventLayoutShift;
export declare function isTraceEventLayoutInvalidation(traceEventData: TraceEventData): traceEventData is TraceEventLayoutInvalidation;
export declare function isTraceEventStyleRecalcInvalidation(traceEventData: TraceEventData): traceEventData is TraceEventStyleRecalcInvalidation;
export declare function isTraceEventFirstContentfulPaint(traceEventData: TraceEventData): traceEventData is TraceEventFirstContentfulPaint;
export declare function isTraceEventLargestContentfulPaintCandidate(traceEventData: TraceEventData): traceEventData is TraceEventLargestContentfulPaintCandidate;
export declare function isTraceEventLargestImagePaintCandidate(traceEventData: TraceEventData): traceEventData is TraceEventLargestImagePaintCandidate;
export declare function isTraceEventLargestTextPaintCandidate(traceEventData: TraceEventData): traceEventData is TraceEventLargestTextPaintCandidate;
export declare function isTraceEventMarkDOMContent(traceEventData: TraceEventData): traceEventData is TraceEventMarkDOMContent;
export declare function isTraceEventInteractiveTime(traceEventData: TraceEventData): traceEventData is TraceEventInteractiveTime;
export declare function isTraceEventEventTiming(traceEventData: TraceEventData): traceEventData is TraceEventEventTiming;
export declare function isTraceEventGPUTask(traceEventData: TraceEventData): traceEventData is TraceEventGPUTask;
export declare function isTraceEventProfile(traceEventData: TraceEventData): traceEventData is TraceEventProfile;
export declare function isTraceEventProfileChunk(traceEventData: TraceEventData): traceEventData is TraceEventProfileChunk;
export declare function isTraceEventResourceSendRequest(traceEventData: TraceEventData): traceEventData is TraceEventResourceSendRequest;
export declare function isTraceEventResourceReceiveResponse(traceEventData: TraceEventData): traceEventData is TraceEventResourceReceiveResponse;
export declare function isTraceEventResourceFinish(traceEventData: TraceEventData): traceEventData is TraceEventResourceFinish;
export declare function isTraceEventResourceWillSendRequest(traceEventData: TraceEventData): traceEventData is TraceEventResourceWillSendRequest;
export declare function isTraceEventResourceReceivedData(traceEventData: TraceEventData): traceEventData is TraceEventResourceReceivedData;
export declare function isSyntheticNetworkRequestDetailsEvent(traceEventData: TraceEventData): traceEventData is TraceEventSyntheticNetworkRequest;
export declare function isTraceEventPrePaint(traceEventData: TraceEventData): traceEventData is TraceEventPrePaint;
export declare function isTraceEventNavigationStartWithURL(event: TraceEventData): event is TraceEventNavigationStart;
export declare function isTraceEventMainFrameViewport(traceEventData: TraceEventData): traceEventData is TraceEventMainFrameViewport;
export declare function isSyntheticUserTimingTraceEvent(traceEventData: TraceEventData): traceEventData is TraceEventSyntheticUserTiming;
export declare function isTraceEventUserTimingsBeginOrEnd(traceEventData: TraceEventData): traceEventData is TraceEventUserTimingBegin | TraceEventUserTimingEnd;
export {};
