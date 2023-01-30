// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TraceParseEvent } from './ModelImpl.js';
export class TraceProcessor extends EventTarget {
    #traceHandlers;
    #pauseDuration;
    #pauseFrequencyMs;
    #status = 0 /* Status.IDLE */;
    constructor(traceHandlers, { pauseDuration = 20, pauseFrequencyMs = 100 } = {}) {
        super();
        this.#traceHandlers = traceHandlers;
        this.#pauseDuration = pauseDuration;
        this.#pauseFrequencyMs = pauseFrequencyMs;
    }
    reset() {
        if (this.#status === 1 /* Status.PARSING */) {
            throw new Error('Trace processor can\'t reset while parsing.');
        }
        const handlers = Object.values(this.#traceHandlers);
        for (const handler of handlers) {
            handler.reset();
        }
        this.#status = 0 /* Status.IDLE */;
    }
    async parse(traceEvents, freshRecording = false) {
        if (this.#status !== 0 /* Status.IDLE */) {
            throw new Error('Trace processor can\'t start parsing when not idle.');
        }
        try {
            this.#status = 1 /* Status.PARSING */;
            await this.#parse(traceEvents, freshRecording);
            this.#status = 2 /* Status.FINISHED_PARSING */;
        }
        catch (e) {
            this.#status = 3 /* Status.ERRORED_WHILE_PARSING */;
            throw e;
        }
    }
    async #parse(traceEvents, freshRecording) {
        // This iterator steps through all events, periodically yielding back to the
        // main thread to avoid blocking execution. It uses `dispatchEvent` to
        // provide status update events, and other various bits of config like the
        // pause duration and frequency.
        const traceEventIterator = new TraceEventIterator(traceEvents, this.#pauseDuration, this.#pauseFrequencyMs);
        // Convert to array so that we are able to iterate all handlers multiple times.
        const sortedHandlers = [...sortHandlers(this.#traceHandlers).values()];
        // Reset.
        for (const handler of sortedHandlers) {
            handler.reset();
        }
        // Initialize.
        for (const handler of sortedHandlers) {
            handler.initialize?.(freshRecording);
        }
        // Handle each event.
        for await (const item of traceEventIterator) {
            if (item.kind === 2 /* IteratorItemType.STATUS_UPDATE */) {
                this.dispatchEvent(new TraceParseEvent(item.data));
                continue;
            }
            for (const handler of sortedHandlers) {
                handler.handleEvent(item.data);
            }
        }
        // Finalize.
        for (const handler of sortedHandlers) {
            await handler.finalize?.();
        }
    }
    get data() {
        if (this.#status !== 2 /* Status.FINISHED_PARSING */) {
            return null;
        }
        const data = {};
        for (const [name, handler] of Object.entries(this.#traceHandlers)) {
            Object.assign(data, { [name]: handler.data() });
        }
        return data;
    }
}
/**
 * Some Handlers need data provided by others. Dependencies of a handler handler are
 * declared in the `deps` field.
 * @returns A map from trace event handler name to trace event hander whose entries
 * iterate in such a way that each handler is visited after its dependencies.
 */
export function sortHandlers(traceHandlers) {
    const sortedMap = new Map();
    const visited = new Set();
    const visitHandler = (handlerName) => {
        if (sortedMap.has(handlerName)) {
            return;
        }
        if (visited.has(handlerName)) {
            let stackPath = '';
            for (const handler of visited) {
                if (stackPath || handler === handlerName) {
                    stackPath += `${handler}->`;
                }
            }
            stackPath += handlerName;
            throw new Error(`Found dependency cycle in trace event handlers: ${stackPath}`);
        }
        visited.add(handlerName);
        const handler = traceHandlers[handlerName];
        if (!handler) {
            return;
        }
        const deps = handler.deps?.();
        if (deps) {
            deps.forEach(visitHandler);
        }
        sortedMap.set(handlerName, handler);
    };
    for (const handlerName of Object.keys(traceHandlers)) {
        visitHandler(handlerName);
    }
    return sortedMap;
}
class TraceEventIterator {
    traceEvents;
    pauseDuration;
    pauseFrequencyMs;
    #time;
    constructor(traceEvents, pauseDuration, pauseFrequencyMs) {
        this.traceEvents = traceEvents;
        this.pauseDuration = pauseDuration;
        this.pauseFrequencyMs = pauseFrequencyMs;
        this.#time = performance.now();
    }
    async *[Symbol.asyncIterator]() {
        for (let i = 0, length = this.traceEvents.length; i < length; i++) {
            // Every so often we take a break just to render.
            if (performance.now() - this.#time > this.pauseFrequencyMs) {
                this.#time = performance.now();
                // Take the opportunity to provide status update events.
                yield { kind: 2 /* IteratorItemType.STATUS_UPDATE */, data: { index: i, total: length } };
                // Wait for rendering before resuming.
                await new Promise(resolve => setTimeout(resolve, this.pauseDuration));
            }
            yield { kind: 1 /* IteratorItemType.TRACE_EVENT */, data: this.traceEvents[i] };
        }
    }
}
//# sourceMappingURL=TraceProcessor.js.map