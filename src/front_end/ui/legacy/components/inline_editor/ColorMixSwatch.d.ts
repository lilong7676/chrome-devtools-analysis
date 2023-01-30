export declare class ColorMixSwatch extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    private readonly shadow;
    private text;
    private firstColorText;
    private secondColorText;
    constructor();
    setText(text: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-color-mix-swatch': ColorMixSwatch;
    }
}
