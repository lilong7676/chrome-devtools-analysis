// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import * as Handlers from './handlers/handlers.js';
import * as Helpers from './helpers/helpers.js';
import { TraceProcessor } from './TraceProcessor.js';
// Note: this model is implemented in a way that can support multiple trace
// processors. Currently there is only one implemented, but you will see
// references to "processors" plural because it can easily be extended in the future.
export class Model extends EventTarget {
    #traceProcessor = new TraceProcessor(Handlers.ModelHandlers);
    #traces = [];
    #nextNumberByDomain = new Map();
    #recordingsAvailable = [];
    #lastRecordingIndex = 0;
    async parse(traceEvents, metadata = {}, freshRecording = false) {
        // During parsing, periodically update any listeners on each processors'
        // progress (if they have any updates).
        const onTraceUpdate = (event) => {
            const { data } = event;
            this.dispatchEvent(new ModelUpdateEvent({ type: 1 /* ModelUpdateType.TRACE */, data: data }));
        };
        this.#traceProcessor.addEventListener(TraceParseEvent.eventName, onTraceUpdate);
        // Create a parsed trace file, populating it in parallel as each processor
        // finishes its parsing process.
        const file = {
            traceEvents,
            metadata,
            traceParsedData: null,
        };
        // When processors have finished parsing, store the parsed data so that it
        // is available to call sites notified by each respective 'done' update.
        const traceProcessing = async () => {
            await this.#traceProcessor.parse(traceEvents, freshRecording);
            file.traceParsedData = this.#traceProcessor.data;
            this.#lastRecordingIndex++;
            let recordingName = `Trace ${this.#lastRecordingIndex}`;
            let origin = null;
            if (file.traceParsedData) {
                origin = Helpers.Trace.extractOriginFromTrace(file.traceParsedData.Meta.mainFrameURL);
                if (origin) {
                    const nextSequenceForDomain = Platform.MapUtilities.getWithDefault(this.#nextNumberByDomain, origin, () => 1);
                    recordingName = `${origin} (${nextSequenceForDomain})`;
                    this.#nextNumberByDomain.set(origin, nextSequenceForDomain + 1);
                }
            }
            this.#recordingsAvailable.push(recordingName);
            this.dispatchEvent(new ModelUpdateEvent({ type: 1 /* ModelUpdateType.TRACE */, data: 'done' }));
        };
        try {
            // Wait for all outstanding promises before finishing the async execution,
            // but perform all tasks in parallel.
            await traceProcessing();
            // We only push the file onto this.#traces here once we know it's valid
            // and there's been no errors in the parsing.
            this.#traces.push(file);
        }
        catch (e) {
            throw e;
        }
        finally {
            // All processors have finished parsing, no more updates are expected.
            // Finally, update any listeners that all processors are 'done'.
            this.#traceProcessor.removeEventListener(TraceParseEvent.eventName, onTraceUpdate);
            this.dispatchEvent(new ModelUpdateEvent({ type: 0 /* ModelUpdateType.GLOBAL */, data: 'done' }));
        }
    }
    traceParsedData(index) {
        if (!this.#traces[index]) {
            return null;
        }
        return this.#traces[index].traceParsedData;
    }
    metadata(index) {
        if (!this.#traces[index]) {
            return null;
        }
        return this.#traces[index].metadata;
    }
    traceEvents(index) {
        if (!this.#traces[index]) {
            return null;
        }
        return this.#traces[index].traceEvents;
    }
    size() {
        return this.#traces.length;
    }
    deleteTraceByIndex(recordingIndex) {
        this.#traces.splice(recordingIndex, 1);
        this.#recordingsAvailable.splice(recordingIndex, 1);
    }
    getRecordingsAvailable() {
        return this.#recordingsAvailable;
    }
    reset() {
        this.#traceProcessor.reset();
    }
}
export class ModelUpdateEvent extends Event {
    data;
    static eventName = 'modelupdate';
    constructor(data) {
        super(ModelUpdateEvent.eventName);
        this.data = data;
    }
}
export function isModelUpdateEventDataGlobal(object) {
    return object.type === 0 /* ModelUpdateType.GLOBAL */;
}
export function isModelUpdateEventDataTrace(object) {
    return object.type === 1 /* ModelUpdateType.TRACE */;
}
export class TraceParseEvent extends Event {
    data;
    static eventName = 'traceparse';
    constructor(data, init = { bubbles: true }) {
        super(TraceParseEvent.eventName, init);
        this.data = data;
    }
}
//# sourceMappingURL=ModelImpl.js.map