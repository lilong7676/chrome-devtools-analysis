// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as Types from '../types/types.js';
/**
 * IMPORTANT!
 * See UserTimings.md in this directory for some handy documentation on
 * UserTimings and the trace events we parse currently.
 **/
const syntheticEvents = [];
const timingEvents = [];
let handlerState = 1 /* HandlerState.UNINITIALIZED */;
export function reset() {
    syntheticEvents.length = 0;
    timingEvents.length = 0;
    handlerState = 2 /* HandlerState.INITIALIZED */;
}
export function handleEvent(event) {
    if (handlerState !== 2 /* HandlerState.INITIALIZED */) {
        throw new Error('UserTimings handler is not initialized');
    }
    if (Types.TraceEvents.isTraceEventUserTimingsBeginOrEnd(event)) {
        timingEvents.push(event);
    }
}
export async function finalize() {
    if (handlerState !== 2 /* HandlerState.INITIALIZED */) {
        throw new Error('UserTimings handler is not initialized');
    }
    const matchedEvents = new Map();
    for (const event of timingEvents) {
        const otherEventsWithID = Platform.MapUtilities.getWithDefault(matchedEvents, event.id, () => {
            return { begin: null, end: null };
        });
        const isStartEvent = event.ph === "b" /* Types.TraceEvents.TraceEventPhase.ASYNC_NESTABLE_START */;
        const isEndEvent = event.ph === "e" /* Types.TraceEvents.TraceEventPhase.ASYNC_NESTABLE_END */;
        if (isStartEvent) {
            otherEventsWithID.begin = event;
        }
        else if (isEndEvent) {
            otherEventsWithID.end = event;
        }
    }
    for (const [id, eventsPair] of matchedEvents.entries()) {
        if (!eventsPair.begin || !eventsPair.end) {
            // This should never happen, the backend only creates the events once it
            // has them both, so we should never get into this state.
            // If we do, something is very wrong, so let's just drop that problematic event.
            continue;
        }
        const event = {
            cat: eventsPair.end.cat,
            ph: eventsPair.end.ph,
            pid: eventsPair.end.pid,
            tid: eventsPair.end.tid,
            id,
            // Both events have the same name, so it doesn't matter which we pick to
            // use as the description
            name: eventsPair.begin.name,
            dur: Types.Timing.MicroSeconds(eventsPair.end.ts - eventsPair.begin.ts),
            ts: eventsPair.begin.ts,
            args: {
                data: {
                    beginEvent: eventsPair.begin,
                    endEvent: eventsPair.end,
                },
            },
        };
        syntheticEvents.push(event);
    }
    syntheticEvents.sort((event1, event2) => {
        if (event1.ts > event2.ts) {
            return 1;
        }
        if (event2.ts > event1.ts) {
            return -1;
        }
        return 0;
    });
    handlerState = 3 /* HandlerState.FINALIZED */;
}
export function data() {
    if (handlerState !== 3 /* HandlerState.FINALIZED */) {
        throw new Error('UserTimings handler is not finalized');
    }
    return {
        timings: [...syntheticEvents],
    };
}
//# sourceMappingURL=UserTimingsHandler.js.map