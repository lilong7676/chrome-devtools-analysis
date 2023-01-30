import type * as Handlers from './handlers/handlers.js';
import type * as Types from './types/types.js';
export declare class TraceProcessor<ModelHandlers extends {
    [key: string]: Handlers.Types.TraceEventHandler;
}> extends EventTarget {
    #private;
    constructor(traceHandlers: ModelHandlers, { pauseDuration, pauseFrequencyMs }?: {
        pauseDuration?: number | undefined;
        pauseFrequencyMs?: number | undefined;
    });
    reset(): void;
    parse(traceEvents: readonly Types.TraceEvents.TraceEventData[], freshRecording?: boolean): Promise<void>;
    get data(): Handlers.Types.HandlerData<ModelHandlers> | null;
}
/**
 * Some Handlers need data provided by others. Dependencies of a handler handler are
 * declared in the `deps` field.
 * @returns A map from trace event handler name to trace event hander whose entries
 * iterate in such a way that each handler is visited after its dependencies.
 */
export declare function sortHandlers(traceHandlers: Partial<{
    [key in Handlers.Types.TraceEventHandlerName]: Handlers.Types.TraceEventHandler;
}>): Map<Handlers.Types.TraceEventHandlerName, Handlers.Types.TraceEventHandler>;
