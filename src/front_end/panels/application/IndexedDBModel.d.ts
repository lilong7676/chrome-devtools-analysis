import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class IndexedDBModel extends SDK.SDKModel.SDKModel<EventTypes> implements ProtocolProxyApi.StorageDispatcher {
    private readonly storageKeyManager;
    private readonly indexedDBAgent;
    private readonly storageAgent;
    private readonly databasesInternal;
    private databaseNamesByStorageKey;
    private readonly updatedStorageKeys;
    private readonly throttler;
    private enabled?;
    constructor(target: SDK.Target.Target);
    static keyFromIDBKey(idbKey: any): Protocol.IndexedDB.Key | undefined;
    private static keyRangeFromIDBKeyRange;
    static idbKeyPathFromKeyPath(keyPath: Protocol.IndexedDB.KeyPath): string | string[] | null | undefined;
    static keyPathStringFromIDBKeyPath(idbKeyPath: string | string[] | null | undefined): string | null;
    enable(): void;
    clearForStorageKey(storageKey: string): void;
    deleteDatabase(databaseId: DatabaseId): Promise<void>;
    refreshDatabaseNames(): Promise<void>;
    refreshDatabase(databaseId: DatabaseId): void;
    clearObjectStore(databaseId: DatabaseId, objectStoreName: string): Promise<void>;
    deleteEntries(databaseId: DatabaseId, objectStoreName: string, idbKeyRange: IDBKeyRange): Promise<void>;
    private storageKeyAdded;
    private storageKeyRemoved;
    private addStorageKey;
    private removeStorageKey;
    private updateStorageKeyDatabaseNames;
    databases(): DatabaseId[];
    private databaseAddedForStorageKey;
    private databaseRemovedForStorageKey;
    private loadDatabaseNamesByStorageKey;
    private loadDatabase;
    loadObjectStoreData(databaseId: DatabaseId, objectStoreName: string, idbKeyRange: IDBKeyRange | null, skipCount: number, pageSize: number, callback: (arg0: Array<Entry>, arg1: boolean) => void): void;
    loadIndexData(databaseId: DatabaseId, objectStoreName: string, indexName: string, idbKeyRange: IDBKeyRange | null, skipCount: number, pageSize: number, callback: (arg0: Array<Entry>, arg1: boolean) => void): void;
    private requestData;
    getMetadata(databaseId: DatabaseId, objectStore: ObjectStore): Promise<ObjectStoreMetadata | null>;
    private refreshDatabaseListForStorageKey;
    indexedDBListUpdated({ storageKey: storageKey }: Protocol.Storage.IndexedDBListUpdatedEvent): void;
    indexedDBContentUpdated({ storageKey, databaseName, objectStoreName }: Protocol.Storage.IndexedDBContentUpdatedEvent): void;
    cacheStorageListUpdated(_event: Protocol.Storage.CacheStorageListUpdatedEvent): void;
    cacheStorageContentUpdated(_event: Protocol.Storage.CacheStorageContentUpdatedEvent): void;
    interestGroupAccessed(_event: Protocol.Storage.InterestGroupAccessedEvent): void;
    sharedStorageAccessed(_event: Protocol.Storage.SharedStorageAccessedEvent): void;
}
export declare enum Events {
    DatabaseAdded = "DatabaseAdded",
    DatabaseRemoved = "DatabaseRemoved",
    DatabaseLoaded = "DatabaseLoaded",
    DatabaseNamesRefreshed = "DatabaseNamesRefreshed",
    IndexedDBContentUpdated = "IndexedDBContentUpdated"
}
export type EventTypes = {
    [Events.DatabaseAdded]: {
        model: IndexedDBModel;
        databaseId: DatabaseId;
    };
    [Events.DatabaseRemoved]: {
        model: IndexedDBModel;
        databaseId: DatabaseId;
    };
    [Events.DatabaseLoaded]: {
        model: IndexedDBModel;
        database: Database;
        entriesUpdated: boolean;
    };
    [Events.DatabaseNamesRefreshed]: void;
    [Events.IndexedDBContentUpdated]: {
        model: IndexedDBModel;
        databaseId: DatabaseId;
        objectStoreName: string;
    };
};
export declare class Entry {
    key: SDK.RemoteObject.RemoteObject;
    primaryKey: SDK.RemoteObject.RemoteObject;
    value: SDK.RemoteObject.RemoteObject;
    constructor(key: SDK.RemoteObject.RemoteObject, primaryKey: SDK.RemoteObject.RemoteObject, value: SDK.RemoteObject.RemoteObject);
}
export declare class DatabaseId {
    readonly storageKey: string;
    name: string;
    constructor(storageKey: string, name: string);
    equals(databaseId: DatabaseId): boolean;
}
export declare class Database {
    databaseId: DatabaseId;
    version: number;
    objectStores: Map<string, ObjectStore>;
    constructor(databaseId: DatabaseId, version: number);
}
export declare class ObjectStore {
    name: string;
    keyPath: any;
    autoIncrement: boolean;
    indexes: Map<string, Index>;
    constructor(name: string, keyPath: any, autoIncrement: boolean);
    get keyPathString(): string;
}
export declare class Index {
    name: string;
    keyPath: any;
    unique: boolean;
    multiEntry: boolean;
    constructor(name: string, keyPath: any, unique: boolean, multiEntry: boolean);
    get keyPathString(): string;
}
export interface ObjectStoreMetadata {
    entriesCount: number;
    keyGeneratorValue: number;
}
