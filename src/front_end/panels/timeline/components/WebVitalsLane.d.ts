import type * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { MarkerType, type Event, type Marker, type Timebox, type WebVitalsTimeline } from './WebVitalsTimeline.js';
type GetMarkerTypeCallback = (event: Event) => MarkerType;
type GetMarkerOverlayCallback = (marker: Marker) => LitHtml.TemplateResult;
type GetTimeboxOverlayCallback = (marker: Timebox) => LitHtml.TemplateResult;
declare abstract class WebVitalsLane {
    protected context: CanvasRenderingContext2D;
    protected timeline: WebVitalsTimeline;
    protected theme: {
        [key: string]: string;
    };
    constructor(timeline: WebVitalsTimeline);
    abstract handlePointerMove(x: number | null): void;
    abstract handleClick(x: number | null): void;
    protected tX(x: number): number;
    protected tD(x: number): number;
    protected renderLaneLabel(label: string): void;
    render(): void;
}
export declare class WebVitalsEventLane extends WebVitalsLane {
    #private;
    constructor(timeline: WebVitalsTimeline, label: string, getMarkerType: GetMarkerTypeCallback, getMarkerOverlay?: GetMarkerOverlayCallback);
    handlePointerMove(x: number | null): void;
    handleClick(_: number | null): void;
    setEvents(markers: readonly Event[]): void;
    render(): void;
}
export declare class WebVitalsTimeboxLane extends WebVitalsLane {
    #private;
    constructor(timeline: WebVitalsTimeline, label: string, getTimeboxOverlay?: GetTimeboxOverlayCallback);
    handlePointerMove(x: number | null): void;
    handleClick(_: number | null): void;
    setTimeboxes(boxes: readonly Timebox[]): void;
    render(): void;
}
export {};
