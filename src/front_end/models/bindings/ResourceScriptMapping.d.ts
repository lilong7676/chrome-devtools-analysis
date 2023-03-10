import * as Common from '../../core/common/common.js';
import type * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as Workspace from '../workspace/workspace.js';
import { type Breakpoint } from './BreakpointManager.js';
import { DebuggerWorkspaceBinding, type DebuggerSourceMapping } from './DebuggerWorkspaceBinding.js';
export declare class ResourceScriptMapping implements DebuggerSourceMapping {
    #private;
    readonly debuggerModel: SDK.DebuggerModel.DebuggerModel;
    readonly debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, workspace: Workspace.Workspace.WorkspaceImpl, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    private project;
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    private inspectedURLChanged;
    private addScript;
    scriptFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): ResourceScriptFile | null;
    private removeScript;
    private executionContextDestroyed;
    private globalObjectCleared;
    resetForTest(): void;
    dispose(): void;
}
export declare class ResourceScriptFile extends Common.ObjectWrapper.ObjectWrapper<ResourceScriptFile.EventTypes> {
    #private;
    scriptInternal: SDK.Script.Script | undefined;
    constructor(resourceScriptMapping: ResourceScriptMapping, uiSourceCode: Workspace.UISourceCode.UISourceCode, scripts: SDK.Script.Script[]);
    hasScripts(scripts: SDK.Script.Script[]): boolean;
    private isDiverged;
    private workingCopyChanged;
    private workingCopyCommitted;
    scriptSourceWasSet(source: string, breakpoints: Breakpoint[], status: Protocol.Debugger.SetScriptSourceResponseStatus, exceptionDetails?: Protocol.Runtime.ExceptionDetails): Promise<void>;
    private update;
    private divergeFromVM;
    private mergeToVM;
    hasDivergedFromVM(): boolean;
    isDivergingFromVM(): boolean;
    isMergingToVM(): boolean;
    checkMapping(): void;
    private mappingCheckedForTest;
    dispose(): void;
    addSourceMapURL(sourceMapURL: Platform.DevToolsPath.UrlString): void;
    addDebugInfoURL(debugInfoURL: Platform.DevToolsPath.UrlString): void;
    hasSourceMapURL(): boolean;
    missingSymbolFiles(): Promise<string[] | null>;
    get script(): SDK.Script.Script | null;
    get uiSourceCode(): Workspace.UISourceCode.UISourceCode;
}
export declare namespace ResourceScriptFile {
    const enum Events {
        DidMergeToVM = "DidMergeToVM",
        DidDivergeFromVM = "DidDivergeFromVM"
    }
    type EventTypes = {
        [Events.DidMergeToVM]: void;
        [Events.DidDivergeFromVM]: void;
    };
}
