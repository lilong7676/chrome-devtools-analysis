import * as Protocol from '../../generated/protocol.js';
import type * as Platform from '../platform/platform.js';
import * as ResourceTreeModel from './ResourceTreeModel.js';
import * as SDKModel from './SDKModel.js';
import * as Target from './Target.js';
import * as TargetManager from './TargetManager.js';
export declare class PrerenderingModel extends SDKModel.SDKModel<EventTypes> implements TargetManager.SDKModelObserver<ResourceTreeModel.ResourceTreeModel> {
    private registry;
    constructor(target: Target.Target);
    dispose(): void;
    getById(id: PreloadingId): PrerenderingAttempt | null;
    getAll(): PrerenderingAttemptWithId[];
    clearNotOngoing(): void;
    private dispatchPrerenderingAttemptStarted;
    private dispatchPrerenderingAttemptUpdated;
    private dispatchPrerenderingAttemptsRemoved;
    private onTargetInfoChanged;
    modelAdded(model: ResourceTreeModel.ResourceTreeModel): void;
    modelRemoved(model: ResourceTreeModel.ResourceTreeModel): void;
    private onPrerenderAttemptCompleted;
}
export declare enum Events {
    PrerenderingAttemptStarted = "PrerenderingAttemptStarted",
    PrerenderingAttemptUpdated = "PrerenderingAttemptUpdated",
    PrerenderingAttemptsRemoved = "PrerenderingAttemtsRemoved"
}
export type EventTypes = {
    [Events.PrerenderingAttemptStarted]: void;
    [Events.PrerenderingAttemptUpdated]: void;
    [Events.PrerenderingAttemptsRemoved]: void;
};
export type PreloadingId = string;
export type PrerenderingAttemptId = string;
export interface PrerenderingAttempt {
    prerenderingAttemptId: PrerenderingAttemptId;
    startedAt: number;
    trigger: PrerenderingTrigger;
    url: Platform.DevToolsPath.UrlString;
    status: PrerenderingStatus;
    discardedReason?: Protocol.Page.PrerenderFinalStatus | null | 'Unknown';
}
type PrerenderingTrigger = PrerenderingTriggerSpecRules | PrerenderingTriggerDUI | PrerenderingTriggerDSE | PrerenderingTriggerOpaque;
interface PrerenderingTriggerSpecRules {
    kind: 'PrerenderingTriggerSpecRules';
    rule: object;
}
interface PrerenderingTriggerDUI {
    kind: 'PrerenderingTriggerDUI';
}
interface PrerenderingTriggerDSE {
    kind: 'PrerenderingTriggerDSE';
}
interface PrerenderingTriggerOpaque {
    kind: 'PrerenderingTriggerOpaque';
}
export declare const enum PrerenderingStatus {
    Prerendering = "Prerendering",
    Activated = "Activated",
    Discarded = "Discarded"
}
export type PrerenderingAttemptEvent = PrerenderingAttemptEventAdd | PrerenderingAttemptEventUpdate;
export interface PrerenderingAttemptEventAdd {
    kind: 'PrerenderingAttemptEventAdd';
    attempt: PrerenderingAttempt;
}
export interface PrerenderingAttemptEventUpdate {
    kind: 'PrerenderingAttemptEventUpdate';
    update: PrerenderingAttempt;
}
export interface PrerenderingAttemptWithId {
    id: PreloadingId;
    attempt: PrerenderingAttempt;
}
export declare class PrerenderingRegistry {
    private entities;
    private opaqueUrlToPreId;
    getById(id: PreloadingId): PrerenderingAttempt | null;
    getAll(): PrerenderingAttemptWithId[];
    private makePreloadingId;
    private makePreIdOfPrerendering;
    processEvent(event: PrerenderingAttemptEvent): void;
    clearNotOngoing(): void;
    maybeAddOpaquePrerendering(frameId: Protocol.Page.FrameId, url: Platform.DevToolsPath.UrlString): void;
    updateOpaquePrerenderingAttempt(event: Protocol.Page.PrerenderAttemptCompletedEvent): void;
    private getDiscardedReason;
}
export {};
