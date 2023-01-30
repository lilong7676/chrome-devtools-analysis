import { type TraceEventHandlerName, type HandlerData, type Handlers } from './types.js';
import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function getFirstFCPTimestampFromModelData(model: HandlerData<Handlers>): Types.Timing.MicroSeconds | null;
/**
 * Classifications sourced from
 * https://web.dev/fcp/
 */
export declare function scoreClassificationForFirstContentfulPaint(fcpScoreInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * Classifications sourced from
 * https://web.dev/interactive/#how-lighthouse-determines-your-tti-score
 */
export declare function scoreClassificationForTimeToInteractive(ttiTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * Classifications sourced from
 * https://web.dev/lcp/#what-is-lcp
 */
export declare function scoreClassificationForLargestContentfulPaint(lcpTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * DCL does not have a classification.
 */
export declare function scoreClassificationForDOMContentLoaded(_dclTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * Classifications sourced from
 * https://web.dev/lighthouse-total-blocking-#time/
 */
export declare function scoreClassificationForTotalBlockingTime(tbtTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
export declare function finalize(): Promise<void>;
export declare function data(): {
    metricScoresByFrameId: Map<string, Map<string, Map<MetricName, MetricScore>>>;
};
export declare function deps(): TraceEventHandlerName[];
export declare const enum ScoreClassification {
    GOOD = "good",
    OK = "ok",
    BAD = "bad",
    UNCLASSIFIED = "unclassified"
}
export declare const enum MetricName {
    FCP = "FCP",
    LCP = "LCP",
    DCL = "DCL",
    TTI = "TTI",
    TBT = "TBT",
    CLS = "CLS"
}
export interface MetricScore {
    score: string;
    metricName: MetricName;
    classification: ScoreClassification;
    event?: Types.TraceEvents.PageLoadEvent;
    navigation?: Types.TraceEvents.TraceEventNavigationStart;
    estimated?: boolean;
}
