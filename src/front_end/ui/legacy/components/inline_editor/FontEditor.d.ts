import * as Common from '../../../../core/common/common.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as UI from '../../legacy.js';
declare const FontEditor_base: (new (...args: any[]) => {
    "__#11@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>; /**
     *@description Label for numbered fallback selectors
     *@example {2} PH1
     */
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T]>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2]>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class FontEditor extends FontEditor_base {
    private readonly selectedNode;
    private readonly propertyMap;
    private readonly fontSelectorSection;
    private fontSelectors;
    private fontsList;
    constructor(propertyMap: Map<string, string>);
    wasShown(): void;
    private createFontSelectorSection;
    private createFontsList;
    private splitComputedFontArray;
    private createFontSelector;
    private deleteFontSelector;
    private updateFontSelectorList;
    private getPropertyInfo;
    private createSelector;
    private onFontSelectorChanged;
    private updatePropertyValue;
    private resizePopout;
}
export declare enum Events {
    FontChanged = "FontChanged",
    FontEditorResized = "FontEditorResized"
}
export interface FontChangedEvent {
    propertyName: string;
    value: string;
}
export type EventTypes = {
    [Events.FontChanged]: FontChangedEvent;
    [Events.FontEditorResized]: void;
};
export {};
