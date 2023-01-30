import type * as Platform from '../platform/platform.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import { type NameValue } from './NetworkRequest.js';
import { type Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class ServiceWorkerCacheModel extends SDKModel<EventTypes> implements ProtocolProxyApi.StorageDispatcher {
    #private;
    readonly cacheAgent: ProtocolProxyApi.CacheStorageApi;
    /**
     * Invariant: This #model can only be constructed on a ServiceWorker target.
     */
    constructor(target: Target);
    enable(): void;
    clearForStorageKey(storageKey: string): void;
    refreshCacheNames(): void;
    deleteCache(cache: Cache): Promise<void>;
    deleteCacheEntry(cache: Cache, request: string): Promise<void>;
    loadCacheData(cache: Cache, skipCount: number, pageSize: number, pathFilter: string, callback: (arg0: Array<Protocol.CacheStorage.DataEntry>, arg1: number) => void): void;
    loadAllCacheData(cache: Cache, pathFilter: string, callback: (arg0: Array<Protocol.CacheStorage.DataEntry>, arg1: number) => void): void;
    caches(): Cache[];
    dispose(): void;
    private addStorageKey;
    private removeStorageKey;
    private loadCacheNames;
    private updateCacheNames;
    private storageKeyAdded;
    private storageKeyRemoved;
    private cacheAdded;
    private cacheRemoved;
    private requestEntries;
    private requestAllEntries;
    cacheStorageListUpdated({ storageKey }: Protocol.Storage.CacheStorageListUpdatedEvent): void;
    cacheStorageContentUpdated({ storageKey, cacheName }: Protocol.Storage.CacheStorageContentUpdatedEvent): void;
    indexedDBListUpdated(_event: Protocol.Storage.IndexedDBListUpdatedEvent): void;
    indexedDBContentUpdated(_event: Protocol.Storage.IndexedDBContentUpdatedEvent): void;
    interestGroupAccessed(_event: Protocol.Storage.InterestGroupAccessedEvent): void;
    sharedStorageAccessed(_event: Protocol.Storage.SharedStorageAccessedEvent): void;
    setThrottlerSchedulesAsSoonAsPossibleForTest(): void;
}
export declare enum Events {
    CacheAdded = "CacheAdded",
    CacheRemoved = "CacheRemoved",
    CacheStorageContentUpdated = "CacheStorageContentUpdated"
}
export interface CacheEvent {
    model: ServiceWorkerCacheModel;
    cache: Cache;
}
export interface CacheStorageContentUpdatedEvent {
    storageKey: string;
    cacheName: string;
}
export type EventTypes = {
    [Events.CacheAdded]: CacheEvent;
    [Events.CacheRemoved]: CacheEvent;
    [Events.CacheStorageContentUpdated]: CacheStorageContentUpdatedEvent;
};
export declare class Cache {
    #private;
    storageKey?: string;
    cacheName: string;
    cacheId: Protocol.CacheStorage.CacheId;
    constructor(model: ServiceWorkerCacheModel, storageKey: string | undefined, cacheName: string, cacheId: Protocol.CacheStorage.CacheId);
    equals(cache: Cache): boolean;
    toString(): string;
    requestCachedResponse(url: Platform.DevToolsPath.UrlString, requestHeaders: NameValue[]): Promise<Protocol.CacheStorage.CachedResponse | null>;
}
