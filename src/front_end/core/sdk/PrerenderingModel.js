// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ChildTargetManager from './ChildTargetManager.js';
import * as ResourceTreeModel from './ResourceTreeModel.js';
import * as SDKModel from './SDKModel.js';
import * as Target from './Target.js';
import * as TargetManager from './TargetManager.js';
// Holds prerendering information of given target.
//
// Note: In first implementation of Preloading Status Panel, we utilize
// TargetInfo to detect beginning of prerendering. See the discussion in
// https://chromium-review.googlesource.com/c/chromium/src/+/3875947/comment/595dd0d3_bb2cb92f/
export class PrerenderingModel extends SDKModel.SDKModel {
    registry = new PrerenderingRegistry();
    constructor(target) {
        super(target);
        TargetManager.TargetManager.instance().addModelListener(ChildTargetManager.ChildTargetManager, ChildTargetManager.Events.TargetInfoChanged, this.onTargetInfoChanged, this);
        TargetManager.TargetManager.instance().observeModels(ResourceTreeModel.ResourceTreeModel, this);
    }
    dispose() {
        super.dispose();
        TargetManager.TargetManager.instance().removeModelListener(ChildTargetManager.ChildTargetManager, ChildTargetManager.Events.TargetInfoChanged, this.onTargetInfoChanged, this);
        TargetManager.TargetManager.instance().unobserveModels(ResourceTreeModel.ResourceTreeModel, this);
    }
    // Returns reference. Don't save returned values.
    getById(id) {
        return this.registry.getById(id);
    }
    // Returns array of pairs of id and reference. Don't save returned references.
    getAll() {
        return this.registry.getAll();
    }
    clearNotOngoing() {
        this.registry.clearNotOngoing();
        this.dispatchPrerenderingAttemptsRemoved();
    }
    dispatchPrerenderingAttemptStarted() {
        this.dispatchEventToListeners(Events.PrerenderingAttemptStarted);
    }
    dispatchPrerenderingAttemptUpdated() {
        this.dispatchEventToListeners(Events.PrerenderingAttemptUpdated);
    }
    dispatchPrerenderingAttemptsRemoved() {
        this.dispatchEventToListeners(Events.PrerenderingAttemptsRemoved);
    }
    onTargetInfoChanged(event) {
        const targetInfo = event.data;
        if (targetInfo.subtype !== 'prerender') {
            return;
        }
        // Ad-hoc filtering. Ignore the active page.
        if (targetInfo.url === '') {
            return;
        }
        // Non trivial assumption
        //
        // We assume that targetId is the same to frameId for targetInfo
        // with subtype === 'prerender'.
        const frameId = targetInfo.targetId;
        this.registry.maybeAddOpaquePrerendering(frameId, targetInfo.url);
        this.dispatchPrerenderingAttemptStarted();
    }
    // implements TargetManager.SDKModelObserver<ResourceTreeModel.ResourceTreeModel>
    modelAdded(model) {
        model.addEventListener(ResourceTreeModel.Events.PrerenderAttemptCompleted, this.onPrerenderAttemptCompleted, this);
    }
    // implements TargetManager.SDKModelObserver<ResourceTreeModel.ResourceTreeModel>
    modelRemoved(model) {
        model.removeEventListener(ResourceTreeModel.Events.PrerenderAttemptCompleted, this.onPrerenderAttemptCompleted, this);
    }
    onPrerenderAttemptCompleted(event) {
        const inner = event.data;
        this.registry.updateOpaquePrerenderingAttempt(inner);
        this.dispatchPrerenderingAttemptUpdated();
    }
}
SDKModel.SDKModel.register(PrerenderingModel, { capabilities: Target.Capability.Target, autostart: false });
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["PrerenderingAttemptStarted"] = "PrerenderingAttemptStarted";
    Events["PrerenderingAttemptUpdated"] = "PrerenderingAttemptUpdated";
    Events["PrerenderingAttemptsRemoved"] = "PrerenderingAttemtsRemoved";
})(Events || (Events = {}));
// export only for testing.
export class PrerenderingRegistry {
    entities = new Map();
    // Currently, PrerenderAttemptCompleted event doesn't have information
    // to identify corresponding attempt. To mitigate this, we utilize the
    // fact that attempts are activated/cancelled if navigated out. So,
    // in many cases, we can identify an ongoing attempt by URL.
    opaqueUrlToPreId = new Map();
    // Returns reference. Don't save returned values.
    getById(id) {
        return this.entities.get(id) || null;
    }
    // Returns array of pairs of id and reference. Don't save returned references.
    getAll() {
        return Array.from(this.entities.entries()).map(([id, attempt]) => ({ id, attempt }));
    }
    makePreloadingId(x) {
        if (x.trigger.kind === 'PrerenderingTriggerOpaque') {
            return `PrerenderingAttempt-opaque:${x.prerenderingAttemptId}`;
        }
        return `PrerenderingAttempt:${x.prerenderingAttemptId}`;
    }
    makePreIdOfPrerendering(frameId) {
        return `PrerenderingAttempt-opaque:${frameId}`;
    }
    // TODO(https://crbug.com/1384419): Make this private.
    processEvent(event) {
        switch (event.kind) {
            case 'PrerenderingAttemptEventAdd': {
                this.entities.set(this.makePreloadingId(event.attempt), event.attempt);
                break;
            }
            case 'PrerenderingAttemptEventUpdate': {
                this.entities.set(this.makePreloadingId(event.update), event.update);
                const x = event.update;
                if (x.status !== "Prerendering" /* PrerenderingStatus.Prerendering */) {
                    if (this.opaqueUrlToPreId.get(x.url)) {
                        this.opaqueUrlToPreId.delete(x.url);
                    }
                }
                break;
            }
        }
    }
    // Clear not ongoing prerendering attempts.
    clearNotOngoing() {
        for (const [id, x] of this.entities.entries()) {
            if (x.status !== "Prerendering" /* PrerenderingStatus.Prerendering */) {
                this.entities.delete(id);
            }
        }
    }
    // Initial support of detecting prerendering start
    // TODO: Make CDP changes correctly.
    maybeAddOpaquePrerendering(frameId, url) {
        // Ad-hoc filtering
        //
        // If a page has SpeculationRules and browser navigated out to a not
        // related page, current Chrome throws PrerenderAttemptCompleted
        // event and then TargetInfoChanged event. This filtering prevents
        // adding a new prerendering attempt by the latter TargetInfoChanged.
        if (this.entities.get(this.makePreIdOfPrerendering(frameId)) !== undefined) {
            return;
        }
        const prerenderingAttemptId = frameId;
        const event = {
            kind: 'PrerenderingAttemptEventAdd',
            attempt: {
                prerenderingAttemptId: prerenderingAttemptId,
                startedAt: Date.now(),
                trigger: {
                    kind: 'PrerenderingTriggerOpaque',
                },
                url,
                status: "Prerendering" /* PrerenderingStatus.Prerendering */,
            },
        };
        this.processEvent(event);
        const id = this.makePreIdOfPrerendering(frameId);
        this.opaqueUrlToPreId.set(url, id);
    }
    updateOpaquePrerenderingAttempt(event) {
        const id = this.opaqueUrlToPreId.get(event.prerenderingUrl);
        if (id === undefined) {
            return;
        }
        const originalAttempt = this.entities.get(id);
        if (originalAttempt === undefined) {
            return;
        }
        const status = (event.finalStatus === "Activated" /* Protocol.Page.PrerenderFinalStatus.Activated */) ? "Activated" /* PrerenderingStatus.Activated */ :
            "Discarded" /* PrerenderingStatus.Discarded */;
        const eventInternal = {
            kind: 'PrerenderingAttemptEventUpdate',
            update: {
                prerenderingAttemptId: originalAttempt.prerenderingAttemptId,
                startedAt: originalAttempt.startedAt,
                trigger: originalAttempt.trigger,
                url: originalAttempt.url,
                status: status,
                discardedReason: this.getDiscardedReason(event),
            },
        };
        this.processEvent(eventInternal);
    }
    getDiscardedReason(event) {
        switch (event.finalStatus) {
            case "Activated" /* Protocol.Page.PrerenderFinalStatus.Activated */:
                return null;
            case "Destroyed" /* Protocol.Page.PrerenderFinalStatus.Destroyed */:
                return null;
            default:
                return event.finalStatus;
        }
    }
}
//# sourceMappingURL=PrerenderingModel.js.map