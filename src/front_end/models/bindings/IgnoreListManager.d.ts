import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { type DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
export declare class IgnoreListManager implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    #private;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        debuggerWorkspaceBinding: DebuggerWorkspaceBinding | null;
    }): IgnoreListManager;
    static removeInstance(): void;
    addChangeListener(listener: () => void): void;
    removeChangeListener(listener: () => void): void;
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    private clearCacheIfNeeded;
    private getSkipStackFramesPatternSetting;
    private setIgnoreListPatterns;
    isUserOrSourceMapIgnoreListedUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    isUserOrSourceMapIgnoreListedURL(url: Platform.DevToolsPath.UrlString, isKnownThirdParty: boolean): boolean;
    isUserIgnoreListedURL(url: Platform.DevToolsPath.UrlString, isContentScript?: boolean): boolean;
    private sourceMapAttached;
    private sourceMapDetached;
    private updateScriptRanges;
    private uiSourceCodeURL;
    canIgnoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    ignoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    unIgnoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    get enableIgnoreListing(): boolean;
    set enableIgnoreListing(value: boolean);
    get skipContentScripts(): boolean;
    get automaticallyIgnoreListKnownThirdPartyScripts(): boolean;
    ignoreListContentScripts(): void;
    unIgnoreListContentScripts(): void;
    ignoreListThirdParty(): void;
    unIgnoreListThirdParty(): void;
    private ignoreListURL;
    private ignoreListRegex;
    private unIgnoreListURL;
    private removeIgnoreListPattern;
    private ignoreListHasPattern;
    private patternChanged;
    private patternChangeFinishedForTests;
    private urlToRegExpString;
    getIgnoreListURLContextMenuItems(uiSourceCode: Workspace.UISourceCode.UISourceCode): Array<{
        text: string;
        callback: () => void;
    }>;
    getIgnoreListFolderContextMenuItems(url: Platform.DevToolsPath.UrlString): Array<{
        text: string;
        callback: () => void;
    }>;
}
export interface SourceRange {
    lineNumber: number;
    columnNumber: number;
}
