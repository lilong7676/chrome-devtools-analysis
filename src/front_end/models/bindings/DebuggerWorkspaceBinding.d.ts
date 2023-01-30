import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { DebuggerLanguagePluginManager } from './DebuggerLanguagePlugins.js';
import { LiveLocationWithPool, type LiveLocation, type LiveLocationPool } from './LiveLocation.js';
import { type ResourceMapping } from './ResourceMapping.js';
import { type ResourceScriptFile } from './ResourceScriptMapping.js';
export declare class DebuggerWorkspaceBinding implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    #private;
    readonly resourceMapping: ResourceMapping;
    pluginManager: DebuggerLanguagePluginManager | null;
    private constructor();
    initPluginManagerForTest(): DebuggerLanguagePluginManager | null;
    static instance(opts?: {
        forceNew: boolean | null;
        resourceMapping: ResourceMapping | null;
        targetManager: SDK.TargetManager.TargetManager | null;
    }): DebuggerWorkspaceBinding;
    static removeInstance(): void;
    addSourceMapping(sourceMapping: DebuggerSourceMapping): void;
    removeSourceMapping(sourceMapping: DebuggerSourceMapping): void;
    private computeAutoStepRanges;
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    /**
     * The promise returned by this function is resolved once all *currently*
     * pending LiveLocations are processed.
     */
    pendingLiveLocationChangesPromise(): Promise<void | Location | StackTraceTopFrameLocation | null>;
    private recordLiveLocationChange;
    updateLocations(script: SDK.Script.Script): Promise<void>;
    createLiveLocation(rawLocation: SDK.DebuggerModel.Location, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<Location | null>;
    createStackTraceTopFrameLiveLocation(rawLocations: SDK.DebuggerModel.Location[], updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<LiveLocation>;
    createCallFrameLiveLocation(location: SDK.DebuggerModel.Location, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<Location | null>;
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Promise<Workspace.UISourceCode.UILocation | null>;
    uiSourceCodeForSourceMapSourceURL(debuggerModel: SDK.DebuggerModel.DebuggerModel, url: Platform.DevToolsPath.UrlString, isContentScript: boolean): Workspace.UISourceCode.UISourceCode | null;
    uiSourceCodeForSourceMapSourceURLPromise(debuggerModel: SDK.DebuggerModel.DebuggerModel, url: Platform.DevToolsPath.UrlString, isContentScript: boolean): Promise<Workspace.UISourceCode.UISourceCode>;
    uiSourceCodeForDebuggerLanguagePluginSourceURLPromise(debuggerModel: SDK.DebuggerModel.DebuggerModel, url: Platform.DevToolsPath.UrlString): Promise<Workspace.UISourceCode.UISourceCode | null>;
    waitForUISourceCodeAdded(url: Platform.DevToolsPath.UrlString, target: SDK.Target.Target): Promise<Workspace.UISourceCode.UISourceCode>;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber?: number): Promise<SDK.DebuggerModel.Location[]>;
    uiLocationToRawLocationsForUnformattedJavaScript(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    normalizeUILocation(uiLocation: Workspace.UISourceCode.UILocation): Promise<Workspace.UISourceCode.UILocation>;
    scriptFile(uiSourceCode: Workspace.UISourceCode.UISourceCode, debuggerModel: SDK.DebuggerModel.DebuggerModel): ResourceScriptFile | null;
    scriptsForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script[];
    supportsConditionalBreakpoints(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    private globalObjectCleared;
    private reset;
    resetForTest(target: SDK.Target.Target): void;
    private registerCallFrameLiveLocation;
    removeLiveLocation(location: Location): void;
    private debuggerResumed;
}
export declare class Location extends LiveLocationWithPool {
    #private;
    readonly scriptId: string;
    readonly rawLocation: SDK.DebuggerModel.Location;
    constructor(scriptId: string, rawLocation: SDK.DebuggerModel.Location, binding: DebuggerWorkspaceBinding, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool);
    uiLocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    dispose(): void;
    isIgnoreListed(): Promise<boolean>;
}
declare class StackTraceTopFrameLocation extends LiveLocationWithPool {
    #private;
    constructor(updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool);
    static createStackTraceTopFrameLocation(rawLocations: SDK.DebuggerModel.Location[], binding: DebuggerWorkspaceBinding, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<StackTraceTopFrameLocation>;
    uiLocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    isIgnoreListed(): Promise<boolean>;
    dispose(): void;
    private scheduleUpdate;
    private updateLocation;
}
export interface RawLocationRange {
    start: SDK.DebuggerModel.Location;
    end: SDK.DebuggerModel.Location;
}
export interface DebuggerSourceMapping {
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber?: number): SDK.DebuggerModel.Location[];
}
export {};
