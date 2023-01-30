// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';
// This handler serves two purposes. It generates a list of evnets that are
// used to show user clicks in the timeline. It is also used to gather
// EventTimings into Interactions, which we use to show interactions and
// highlight long interactions to the user, along with INP.
// We don't need to know which process / thread these events occurred in,
// because they are effectively global, so we just track all that we find.
const allEvents = [];
const interactionEvents = [];
let handlerState = 1 /* HandlerState.UNINITIALIZED */;
export function reset() {
    allEvents.length = 0;
    interactionEvents.length = 0;
    handlerState = 2 /* HandlerState.INITIALIZED */;
}
export function handleEvent(event) {
    if (handlerState !== 2 /* HandlerState.INITIALIZED */) {
        throw new Error('Handler is not initialized');
    }
    if (!Types.TraceEvents.isTraceEventEventTiming(event)) {
        return;
    }
    allEvents.push(event);
    if (!event.args.data) {
        return;
    }
    const { duration, interactionId } = event.args.data;
    // We exclude events for the sake of interactions if:
    // 1. They have no duration.
    // 2. They have no interactionId
    // 3. They have an interactionId of 0: this indicates that it's not an
    //    interaction that we care about because it hasn't had its own interactionId
    //    set (0 is the default on the backend).
    // See: https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/timing/responsiveness_metrics.cc;l=133;drc=40c209a9c365ebb9f16fb99dfe78c7fe768b9594
    if (duration < 1 || interactionId === undefined || interactionId === 0) {
        return;
    }
    const interactionEvent = {
        ...event,
        // We also store the interactionId on the top level for easier access
        interactionId,
        // EventTiming events do not have a duration, but ones we use for
        // Interactions do, in args.data.duration. But that value is in milliseconds.
        // To avoid confusion and accidental bad maths adding micro + milliseconds,
        // we set `dur` to the MicroSeconds value here before returning the events.
        dur: Helpers.Timing.millisecondsToMicroseconds(duration),
    };
    interactionEvents.push(interactionEvent);
}
export async function finalize() {
    handlerState = 3 /* HandlerState.FINALIZED */;
}
export function data() {
    return {
        allEvents: [...allEvents],
        interactionEvents: [...interactionEvents],
    };
}
//# sourceMappingURL=UserInteractionsHandler.js.map