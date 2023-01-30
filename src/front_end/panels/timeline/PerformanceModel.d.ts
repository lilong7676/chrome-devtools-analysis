import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
export declare class PerformanceModel extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    #private;
    private mainTargetInternal;
    private tracingModelInternal;
    private filtersInternal;
    private readonly timelineModelInternal;
    private readonly frameModelInternal;
    private filmStripModelInternal;
    private windowInternal;
    private readonly extensionTracingModels;
    private recordStartTimeInternal?;
    constructor();
    setMainTarget(target: SDK.Target.Target): void;
    mainTarget(): SDK.Target.Target | null;
    setRecordStartTime(time: number): void;
    recordStartTime(): number | undefined;
    setFilters(filters: TimelineModel.TimelineModelFilter.TimelineModelFilter[]): void;
    filters(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    isVisible(event: SDK.TracingModel.Event): boolean;
    setTracingModel(model: SDK.TracingModel.TracingModel): Promise<void>;
    addSourceMapListeners(): Promise<void>;
    addExtensionEvents(title: string, model: SDK.TracingModel.TracingModel, timeOffset: number): void;
    tracingModel(): SDK.TracingModel.TracingModel;
    timelineModel(): TimelineModel.TimelineModel.TimelineModelImpl;
    filmStripModel(): SDK.FilmStripModel.FilmStripModel;
    frames(): TimelineModel.TimelineFrameModel.TimelineFrame[];
    frameModel(): TimelineModel.TimelineFrameModel.TimelineFrameModel;
    extensionInfo(): {
        title: string;
        model: SDK.TracingModel.TracingModel;
    }[];
    dispose(): void;
    filmStripModelFrame(frame: TimelineModel.TimelineFrameModel.TimelineFrame): SDK.FilmStripModel.Frame | null;
    save(stream: Common.StringOutputStream.OutputStream): Promise<DOMError | null>;
    setWindow(window: Window, animate?: boolean): void;
    window(): Window;
    private autoWindowTimes;
}
export declare enum Events {
    ExtensionDataAdded = "ExtensionDataAdded",
    WindowChanged = "WindowChanged",
    NamesResolved = "NamesResolved"
}
export interface WindowChangedEvent {
    window: Window;
    animate: boolean | undefined;
}
export type EventTypes = {
    [Events.ExtensionDataAdded]: void;
    [Events.WindowChanged]: WindowChangedEvent;
    [Events.NamesResolved]: void;
};
export interface Window {
    left: number;
    right: number;
}
