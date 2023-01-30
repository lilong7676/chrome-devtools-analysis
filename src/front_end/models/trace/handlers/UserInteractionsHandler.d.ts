import * as Types from '../types/types.js';
export interface UserInteractionsData {
    allEvents: readonly Types.TraceEvents.TraceEventEventTiming[];
    interactionEvents: readonly InteractionEvent[];
}
export interface InteractionEvent extends Types.TraceEvents.TraceEventEventTiming {
    dur: Types.Timing.MicroSeconds;
    interactionId: number;
}
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): UserInteractionsData;
