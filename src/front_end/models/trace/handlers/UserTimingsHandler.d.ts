import * as Types from '../types/types.js';
interface UserTimingsData {
    timings: readonly Types.TraceEvents.TraceEventSyntheticUserTiming[];
}
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): UserTimingsData;
export {};
