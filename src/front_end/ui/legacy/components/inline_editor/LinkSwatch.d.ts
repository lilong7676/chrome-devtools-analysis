interface LinkSwatchRenderData {
    text: string;
    title: string;
    isDefined: boolean;
    onLinkActivate: (linkText: string) => void;
}
declare class LinkSwatch extends HTMLElement {
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    protected readonly shadow: ShadowRoot;
    protected onLinkActivate: (linkText: string, event: MouseEvent | KeyboardEvent) => void;
    connectedCallback(): void;
    set data(data: LinkSwatchRenderData);
    private render;
}
interface CSSVarSwatchRenderData {
    text: string;
    computedValue: string | null;
    fromFallback: boolean;
    onLinkActivate: (linkText: string) => void;
}
export declare class CSSVarSwatch extends HTMLElement {
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    protected readonly shadow: ShadowRoot;
    constructor();
    set data(data: CSSVarSwatchRenderData);
    private parseVariableFunctionParts;
    private variableName;
    protected render(data: CSSVarSwatchRenderData): void;
}
interface AnimationNameSwatchRenderData {
    isDefined: boolean;
    text: string;
    onLinkActivate: (linkText: string) => void;
}
export declare class AnimationNameSwatch extends HTMLElement {
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    protected readonly shadow: ShadowRoot;
    set data(data: AnimationNameSwatchRenderData);
    protected render(data: AnimationNameSwatchRenderData): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-link-swatch': LinkSwatch;
        'devtools-animation-name-swatch': AnimationNameSwatch;
        'devtools-css-var-swatch': CSSVarSwatch;
    }
}
export {};
