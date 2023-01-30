// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
class ProfileIdTag {
    #profileIdTag;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ProfileID(value) {
    return value;
}
class CallFrameIdTag {
    #callFrameIdTag;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CallFrameID(value) {
    return value;
}
class ProcessIdTag {
    #processIdTag;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ProcessID(value) {
    return value;
}
class ThreadIdTag {
    #threadIdTag;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ThreadID(value) {
    return value;
}
export function isTraceEventComplete(event) {
    return event.ph === "X" /* TraceEventPhase.COMPLETE */;
}
export function isTraceEventDispatch(event) {
    return event.name === 'EventDispatch';
}
export function isTraceEventInstant(event) {
    return event.ph === "I" /* TraceEventPhase.INSTANT */;
}
export function isTraceEventRendererEvent(event) {
    return isTraceEventInstant(event) || isTraceEventComplete(event);
}
export function isThreadName(traceEventData) {
    return traceEventData.name === 'thread_name';
}
export function isProcessName(traceEventData) {
    return traceEventData.name === 'process_name';
}
export function isTraceEventTracingStartedInBrowser(traceEventData) {
    return traceEventData.name === 'TracingStartedInBrowser';
}
export function isTraceEventFrameCommittedInBrowser(traceEventData) {
    return traceEventData.name === 'FrameCommittedInBrowser';
}
export function isTraceEventCommitLoad(traceEventData) {
    return traceEventData.name === 'CommitLoad';
}
export function isTraceEventNavigationStart(traceEventData) {
    return traceEventData.name === 'navigationStart';
}
export function isTraceEventAnimation(traceEventData) {
    return traceEventData.name === 'Animation';
}
export function isTraceEventLayoutShift(traceEventData) {
    return traceEventData.name === 'LayoutShift';
}
export function isTraceEventLayoutInvalidation(traceEventData) {
    return traceEventData.name === 'LayoutInvalidationTracking' ||
        traceEventData.name === 'ScheduleStyleInvalidationTracking';
}
export function isTraceEventStyleRecalcInvalidation(traceEventData) {
    return traceEventData.name === 'StyleRecalcInvalidationTracking';
}
export function isTraceEventFirstContentfulPaint(traceEventData) {
    return traceEventData.name === 'firstContentfulPaint';
}
export function isTraceEventLargestContentfulPaintCandidate(traceEventData) {
    return traceEventData.name === 'largestContentfulPaint::Candidate';
}
export function isTraceEventLargestImagePaintCandidate(traceEventData) {
    return traceEventData.name === 'LargestImagePaint::Candidate';
}
export function isTraceEventLargestTextPaintCandidate(traceEventData) {
    return traceEventData.name === 'LargestTextPaint::Candidate';
}
export function isTraceEventMarkDOMContent(traceEventData) {
    return traceEventData.name === 'MarkDOMContent';
}
export function isTraceEventInteractiveTime(traceEventData) {
    return traceEventData.name === 'InteractiveTime';
}
export function isTraceEventEventTiming(traceEventData) {
    return traceEventData.name === 'EventTiming';
}
export function isTraceEventGPUTask(traceEventData) {
    return traceEventData.name === 'GPUTask';
}
export function isTraceEventProfile(traceEventData) {
    return traceEventData.name === 'Profile';
}
export function isTraceEventProfileChunk(traceEventData) {
    return traceEventData.name === 'ProfileChunk';
}
export function isTraceEventResourceSendRequest(traceEventData) {
    return traceEventData.name === 'ResourceSendRequest';
}
export function isTraceEventResourceReceiveResponse(traceEventData) {
    return traceEventData.name === 'ResourceReceiveResponse';
}
export function isTraceEventResourceFinish(traceEventData) {
    return traceEventData.name === 'ResourceFinish';
}
export function isTraceEventResourceWillSendRequest(traceEventData) {
    return traceEventData.name === 'ResourceWillSendRequest';
}
export function isTraceEventResourceReceivedData(traceEventData) {
    return traceEventData.name === 'ResourceReceivedData';
}
export function isSyntheticNetworkRequestDetailsEvent(traceEventData) {
    return traceEventData.name === 'SyntheticNetworkRequest';
}
export function isTraceEventPrePaint(traceEventData) {
    return traceEventData.name === 'PrePaint';
}
export function isTraceEventNavigationStartWithURL(event) {
    return Boolean(isTraceEventNavigationStart(event) && event.args.data && event.args.data.documentLoaderURL !== '');
}
export function isTraceEventMainFrameViewport(traceEventData) {
    return traceEventData.name === 'PaintTimingVisualizer::Viewport';
}
export function isSyntheticUserTimingTraceEvent(traceEventData) {
    if (traceEventData.cat !== 'blink.user_timing') {
        return false;
    }
    const data = traceEventData.args?.data;
    if (!data) {
        return false;
    }
    return 'beginEvent' in data && 'endEvent' in data;
}
export function isTraceEventUserTimingsBeginOrEnd(traceEventData) {
    const validPhases = new Set(["b" /* TraceEventPhase.ASYNC_NESTABLE_START */, "e" /* TraceEventPhase.ASYNC_NESTABLE_END */]);
    return validPhases.has(traceEventData.ph) && traceEventData.cat === 'blink.user_timing';
}
//# sourceMappingURL=TraceEvents.js.map