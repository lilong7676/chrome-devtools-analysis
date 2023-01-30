import * as Handlers from './handlers/handlers.js';
import type * as Types from './types/types.js';
export declare class Model extends EventTarget {
    #private;
    parse(traceEvents: readonly Types.TraceEvents.TraceEventData[], metadata?: TraceFileMetaData, freshRecording?: boolean): Promise<void>;
    traceParsedData(index: number): Handlers.Types.TraceParseData | null;
    metadata(index: number): TraceFileMetaData | null;
    traceEvents(index: number): readonly Types.TraceEvents.TraceEventData[] | null;
    size(): number;
    deleteTraceByIndex(recordingIndex: number): void;
    getRecordingsAvailable(): string[];
    reset(): void;
}
/**
 * This parsed trace file is used by the Model. It keeps multiple instances
 * of these so that the user can swap between them. The key is that it is
 * essentially the TraceFile plus whatever the model has parsed from it.
 */
export type ParsedTraceFile = TraceFile & {
    traceParsedData: Handlers.Types.TraceParseData | null;
};
export declare const enum ModelUpdateType {
    GLOBAL = 0,
    TRACE = 1,
    LIGHTHOUSE = 2
}
export type ModelUpdateEventData = ModelUpdateEventGlobalData | ModelUpdateEventTraceData | ModelUpdateEventLighthouseData;
export type ModelUpdateEventGlobalData = {
    type: ModelUpdateType.GLOBAL;
    data: GlobalParseEventData;
};
export type ModelUpdateEventTraceData = {
    type: ModelUpdateType.TRACE;
    data: TraceParseEventData;
};
export type ModelUpdateEventLighthouseData = {
    type: ModelUpdateType.LIGHTHOUSE;
    data: LighthouseParseEventData;
};
export type GlobalParseEventData = 'done';
export type TraceParseEventData = TraceParseEventProgressData | 'done';
export type LighthouseParseEventData = 'done';
export type TraceParseEventProgressData = {
    index: number;
    total: number;
};
export declare class ModelUpdateEvent extends Event {
    data: ModelUpdateEventData;
    static readonly eventName = "modelupdate";
    constructor(data: ModelUpdateEventData);
}
export declare function isModelUpdateEventDataGlobal(object: ModelUpdateEventData): object is ModelUpdateEventGlobalData;
export declare function isModelUpdateEventDataTrace(object: ModelUpdateEventData): object is ModelUpdateEventTraceData;
export declare class TraceParseEvent extends Event {
    data: TraceParseEventData;
    static readonly eventName = "traceparse";
    constructor(data: TraceParseEventData, init?: EventInit);
}
export type TraceFile = {
    traceEvents: readonly Types.TraceEvents.TraceEventData[];
    metadata: TraceFileMetaData;
};
/**
 * Trace metadata that we persist to the file. This will allow us to
 * store specifics for the trace, e.g., which tracks should be visible
 * on load.
 */
export interface TraceFileMetaData {
    source?: 'DevTools';
    networkThrottling?: string;
    cpuThrottling?: number;
}
export type TraceFileContents = TraceFile | Types.TraceEvents.TraceEventData[];
declare global {
    interface HTMLElementEventMap {
        [TraceParseEvent.eventName]: TraceParseEvent;
    }
}
