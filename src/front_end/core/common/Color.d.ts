export declare function getFormat(formatText: string): Format | null;
type ColorSpace = Format.SRGB | Format.SRGB_LINEAR | Format.DISPLAY_P3 | Format.A98_RGB | Format.PROPHOTO_RGB | Format.REC_2020 | Format.XYZ | Format.XYZ_D50 | Format.XYZ_D65;
export declare function parse(text: string): Color | null;
export declare function hsl2rgb(hsl: number[], out_rgb: number[]): void;
export declare function hsva2rgba(hsva: number[], out_rgba: number[]): void;
/**
 * Compute a desired luminance given a given luminance and a desired contrast
 * ratio.
 */
export declare function desiredLuminance(luminance: number, contrast: number, lighter: boolean): number;
/**
 * Approach a value of the given component of `candidateHSVA` such that the
 * calculated luminance of `candidateHSVA` approximates `desiredLuminance`.
 */
export declare function approachColorValue(candidateHSVA: number[], bgRGBA: number[], index: number, desiredLuminance: number, candidateLuminance: (arg0: Array<number>) => number): number | null;
export declare function findFgColorForContrast(fgColor: Legacy, bgColor: Legacy, requiredContrast: number): Legacy | null;
export declare function findFgColorForContrastAPCA(fgColor: Legacy, bgColor: Legacy, requiredContrast: number): Legacy | null;
type ColorParameterSpec = [string, string, string, string | undefined];
interface ColorConversions {
    [Format.Nickname](): Legacy;
    [Format.HEX](): Legacy;
    [Format.ShortHEX](): Legacy;
    [Format.HEXA](): Legacy;
    [Format.ShortHEXA](): Legacy;
    [Format.RGB](): Legacy;
    [Format.RGBA](): Legacy;
    [Format.HSL](): Legacy;
    [Format.HSLA](): Legacy;
    [Format.HWB](): Legacy;
    [Format.HWBA](): Legacy;
    [Format.LCH](): LCH;
    [Format.OKLCH](): Oklch;
    [Format.LAB](): Lab;
    [Format.OKLAB](): Oklab;
    [Format.SRGB](): ColorFunction;
    [Format.SRGB_LINEAR](): ColorFunction;
    [Format.DISPLAY_P3](): ColorFunction;
    [Format.A98_RGB](): ColorFunction;
    [Format.PROPHOTO_RGB](): ColorFunction;
    [Format.REC_2020](): ColorFunction;
    [Format.XYZ](): ColorFunction;
    [Format.XYZ_D50](): ColorFunction;
    [Format.XYZ_D65](): ColorFunction;
}
export interface Color {
    equal(color: Color): boolean;
    asString(format?: Format): string | null;
    setAlpha(alpha: number): Color;
    format(): Format;
    as<T extends Format>(format: T): ReturnType<ColorConversions[T]>;
    asLegacyColor(): Legacy;
}
export declare class Lab implements Color {
    #private;
    constructor(l: number, a: number, b: number, alpha: number | null, originalText: string | undefined, origin?: Color);
    as<T extends Format>(format: T): ReturnType<ColorConversions[T]>;
    asLegacyColor(): Legacy;
    equal(color: Color): boolean;
    format(): Format;
    setAlpha(alpha: number): Lab;
    asString(format?: Format): string | null;
    static fromSpec(spec: ColorParameterSpec, text: string): Lab | null;
}
export declare class LCH implements Color {
    #private;
    constructor(l: number, c: number, h: number, alpha: number | null, originalText: string | undefined, origin?: Color);
    asLegacyColor(): Legacy;
    as<T extends Format>(format: T): ReturnType<ColorConversions[T]>;
    equal(color: Color): boolean;
    format(): Format;
    setAlpha(alpha: number): Color;
    asString(format?: Format): string | null;
    static fromSpec(spec: ColorParameterSpec, text: string): LCH | null;
}
export declare class Oklab implements Color {
    #private;
    constructor(l: number, a: number, b: number, alpha: number | null, originalText: string | undefined, origin?: Color);
    asLegacyColor(): Legacy;
    as<T extends Format>(format: T): ReturnType<ColorConversions[T]>;
    equal(color: Color): boolean;
    format(): Format;
    setAlpha(alpha: number): Color;
    asString(format?: Format): string | null;
    static fromSpec(spec: ColorParameterSpec, text: string): Oklab | null;
}
export declare class Oklch implements Color {
    #private;
    constructor(l: number, c: number, h: number, alpha: number | null, originalText: string | undefined, origin?: Color);
    asLegacyColor(): Legacy;
    as<T extends Format>(format: T): ReturnType<ColorConversions[T]>;
    equal(color: Color): boolean;
    format(): Format;
    setAlpha(alpha: number): Color;
    asString(format?: Format): string | null;
    static fromSpec(spec: ColorParameterSpec, text: string): Oklch | null;
}
export declare class ColorFunction implements Color {
    #private;
    constructor(colorSpace: ColorSpace, rgbOrXyz: [number, number, number, number | null], originalText: string | undefined, origin?: Color);
    asLegacyColor(): Legacy;
    as<T extends Format>(format: T): ReturnType<ColorConversions[T]>;
    equal(color: Color): boolean;
    format(): Format;
    setAlpha(alpha: number): Color;
    asString(format?: Format): string | null;
}
type LegacyColor = Format.Nickname | Format.HEX | Format.ShortHEX | Format.HEXA | Format.ShortHEXA | Format.RGB | Format.RGBA | Format.HSL | Format.HSLA | Format.HWB | Format.HWBA;
export declare class Legacy implements Color {
    #private;
    asLegacyColor(): Legacy;
    constructor(rgba: number[], format: LegacyColor, originalText?: string, origin?: Color);
    static fromHex(hex: string, text: string): Legacy;
    static fromName(name: string, text: string): Legacy | null;
    static fromRGBAFunction(r: string, g: string, b: string, alpha: string | undefined, text: string): Legacy | null;
    static fromHSLA(h: string, s: string, l: string, alpha: string | undefined, text: string): Legacy | null;
    static fromHWB(h: string, w: string, b: string, alpha: string | undefined, text: string): Legacy | null;
    static fromRGBA(rgba: number[]): Legacy;
    static fromHSVA(hsva: number[]): Legacy;
    as<T extends Format>(format: T): ReturnType<ColorConversions[T]>;
    format(): LegacyColor;
    /** HSLA with components within [0..1]
     */
    hsla(): number[];
    canonicalHSLA(): number[];
    /** HSVA with components within [0..1]
     */
    hsva(): number[];
    /** HWBA with components within [0..1]
     */
    hwba(): number[];
    canonicalHWBA(): number[];
    hasAlpha(): boolean;
    detectHEXFormat(): Format;
    asString(format?: Format): string | null;
    rgba(): number[];
    canonicalRGBA(): number[];
    /** nickname
     */
    nickname(): string | null;
    toProtocolRGBA(): {
        r: number;
        g: number;
        b: number;
        a: (number | undefined);
    };
    invert(): Legacy;
    setAlpha(alpha: number): Legacy;
    blendWith(fgColor: Legacy): Legacy;
    blendWithAlpha(alpha: number): Legacy;
    setFormat(format: LegacyColor): void;
    equal(other: Legacy): boolean;
}
export declare const Regex: RegExp;
export declare const ColorMixRegex: RegExp;
export declare const enum Format {
    Nickname = "nickname",
    HEX = "hex",
    ShortHEX = "shorthex",
    HEXA = "hexa",
    ShortHEXA = "shorthexa",
    RGB = "rgb",
    RGBA = "rgba",
    HSL = "hsl",
    HSLA = "hsla",
    HWB = "hwb",
    HWBA = "hwba",
    LCH = "lch",
    OKLCH = "oklch",
    LAB = "lab",
    OKLAB = "oklab",
    SRGB = "srgb",
    SRGB_LINEAR = "srgb-linear",
    DISPLAY_P3 = "display-p3",
    A98_RGB = "a98-rgb",
    PROPHOTO_RGB = "prophoto-rgb",
    REC_2020 = "rec2020",
    XYZ = "xyz",
    XYZ_D50 = "xyz-d50",
    XYZ_D65 = "xyz-d65"
}
export declare const Nicknames: Map<string, number[]>;
export declare const PageHighlight: {
    Content: Legacy;
    ContentLight: Legacy;
    ContentOutline: Legacy;
    Padding: Legacy;
    PaddingLight: Legacy;
    Border: Legacy;
    BorderLight: Legacy;
    Margin: Legacy;
    MarginLight: Legacy;
    EventTarget: Legacy;
    Shape: Legacy;
    ShapeMargin: Legacy;
    CssGrid: Legacy;
    LayoutLine: Legacy;
    GridBorder: Legacy;
    GapBackground: Legacy;
    GapHatch: Legacy;
    GridAreaBorder: Legacy;
};
export declare const SourceOrderHighlight: {
    ParentOutline: Legacy;
    ChildOutline: Legacy;
};
export declare const IsolationModeHighlight: {
    Resizer: Legacy;
    ResizerHandle: Legacy;
    Mask: Legacy;
};
export declare class Generator {
    #private;
    constructor(hueSpace?: number | {
        min: number;
        max: number;
        count: (number | undefined);
    }, satSpace?: number | {
        min: number;
        max: number;
        count: (number | undefined);
    }, lightnessSpace?: number | {
        min: number;
        max: number;
        count: (number | undefined);
    }, alphaSpace?: number | {
        min: number;
        max: number;
        count: (number | undefined);
    });
    setColorForID(id: string, color: string): void;
    colorForID(id: string): string;
    private generateColorForID;
    private indexToValueInSpace;
}
export {};
