// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2009 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Platform from '../platform/platform.js';
import { ColorConverter } from './ColorConverter.js';
import { blendColors, contrastRatioAPCA, desiredLuminanceAPCA, luminance, luminanceAPCA, rgbaToHsla, rgbaToHwba, } from './ColorUtils.js';
// Parses angle in the form of
// `<angle>deg`, `<angle>turn`, `<angle>grad and `<angle>rad`
// and returns the canonicalized `degree`.
function parseAngle(angleText) {
    const angle = angleText.replace(/(deg|g?rad|turn)$/, '');
    // @ts-ignore: isNaN can accept strings
    if (isNaN(angle) || angleText.match(/\s+(deg|g?rad|turn)/)) {
        return null;
    }
    const number = parseFloat(angle);
    if (angleText.includes('turn')) {
        // 1turn === 360deg
        return number * 360;
    }
    if (angleText.includes('grad')) {
        // 1grad === 0.9deg
        return number * 9 / 10;
    }
    if (angleText.includes('rad')) {
        // πrad === 180deg
        return number * 180 / Math.PI;
    }
    // 1deg === 1deg ^_^
    return number;
}
// Returns the `Format` equivalent from the format text
export function getFormat(formatText) {
    switch (formatText) {
        case "nickname" /* Format.Nickname */:
            return "nickname" /* Format.Nickname */;
        case "hex" /* Format.HEX */:
            return "hex" /* Format.HEX */;
        case "shorthex" /* Format.ShortHEX */:
            return "shorthex" /* Format.ShortHEX */;
        case "hexa" /* Format.HEXA */:
            return "hexa" /* Format.HEXA */;
        case "shorthexa" /* Format.ShortHEXA */:
            return "shorthexa" /* Format.ShortHEXA */;
        case "rgb" /* Format.RGB */:
            return "rgb" /* Format.RGB */;
        case "rgba" /* Format.RGBA */:
            return "rgba" /* Format.RGBA */;
        case "hsl" /* Format.HSL */:
            return "hsl" /* Format.HSL */;
        case "hsla" /* Format.HSLA */:
            return "hsla" /* Format.HSLA */;
        case "hwb" /* Format.HWB */:
            return "hwb" /* Format.HWB */;
        case "hwba" /* Format.HWBA */:
            return "hwba" /* Format.HWBA */;
        case "lch" /* Format.LCH */:
            return "lch" /* Format.LCH */;
        case "oklch" /* Format.OKLCH */:
            return "oklch" /* Format.OKLCH */;
        case "lab" /* Format.LAB */:
            return "lab" /* Format.LAB */;
        case "oklab" /* Format.OKLAB */:
            return "oklab" /* Format.OKLAB */;
    }
    return getColorSpace(formatText);
}
function getColorSpace(colorSpaceText) {
    switch (colorSpaceText) {
        case "srgb" /* Format.SRGB */:
            return "srgb" /* Format.SRGB */;
        case "srgb-linear" /* Format.SRGB_LINEAR */:
            return "srgb-linear" /* Format.SRGB_LINEAR */;
        case "display-p3" /* Format.DISPLAY_P3 */:
            return "display-p3" /* Format.DISPLAY_P3 */;
        case "a98-rgb" /* Format.A98_RGB */:
            return "a98-rgb" /* Format.A98_RGB */;
        case "prophoto-rgb" /* Format.PROPHOTO_RGB */:
            return "prophoto-rgb" /* Format.PROPHOTO_RGB */;
        case "rec2020" /* Format.REC_2020 */:
            return "rec2020" /* Format.REC_2020 */;
        case "xyz" /* Format.XYZ */:
            return "xyz" /* Format.XYZ */;
        case "xyz-d50" /* Format.XYZ_D50 */:
            return "xyz-d50" /* Format.XYZ_D50 */;
        case "xyz-d65" /* Format.XYZ_D65 */:
            return "xyz-d65" /* Format.XYZ_D65 */;
    }
    return null;
}
/**
 * Percents in color spaces are mapped to ranges.
 * These ranges change based on the syntax.
 * For example, for 'C' in lch() c: 0% = 0, 100% = 150.
 * See: https://www.w3.org/TR/css-color-4/#funcdef-lch
 * Some percentage values can be negative
 * though their ranges don't change depending on the sign
 * (for now, according to spec).
 * @param percent % value of the number. 42 for 42%.
 * @param range Range of [min, max]. Including `min` and `max`.
 */
function mapPercentToRange(percent, range) {
    const sign = Math.sign(percent);
    const absPercent = Math.abs(percent);
    const [outMin, outMax] = range;
    return sign * (absPercent * (outMax - outMin) / 100 + outMin);
}
/**
 * Parses given `color()` function definition and returns the `Color` object.
 * We want to special case its parsing here because it's a bit different
 * than other color functions: rgb, lch etc. accepts 3 arguments with
 * optional alpha. This accepts 4 arguments with optional alpha.
 *
 * Instead of making `splitColorFunctionParameters` work for this case too
 * I've decided to implement it specifically.
 * @param originalText Original definition of the color with `color`
 * @param parametersText Inside of the `color()` function. ex, `display-p3 0.1 0.2 0.3 / 0%`
 * @returns `Color` object
 */
function parseColorFunction(originalText, parametersText) {
    const parameters = parametersText.trim().split(/\s+/);
    const [colorSpaceText, ...remainingParams] = parameters;
    const colorSpace = getColorSpace(colorSpaceText);
    // Color space is not known to us, do not parse the Color.
    if (!colorSpace) {
        return null;
    }
    // `color(<color-space>)` is a valid syntax
    if (remainingParams.length === 0) {
        return new ColorFunction(colorSpace, [0, 0, 0, null], originalText);
    }
    // Check if it contains `/ <alpha>` part, if so, it should be at the end
    const alphaSeparatorIndex = remainingParams.indexOf('/');
    const containsAlpha = alphaSeparatorIndex !== -1;
    if (containsAlpha && alphaSeparatorIndex !== remainingParams.length - 2) {
        // Invalid syntax: like `color(<space> / <alpha> <number>)`
        return null;
    }
    if (containsAlpha) {
        // Since we know that the last value is <alpha>
        // we can safely remove the alpha separator
        // and only leave the numbers (if given correctly)
        remainingParams.splice(alphaSeparatorIndex, 1);
    }
    // `color` cannot contain more than 4 parameters when there is alpha
    // and cannot contain more than 3 parameters when there isn't alpha
    const maxLength = containsAlpha ? 4 : 3;
    if (remainingParams.length > maxLength) {
        return null;
    }
    // Replace `none`s with 0s
    const nonesReplacesParams = remainingParams.map(param => param === 'none' ? '0' : param);
    // At this point, we know that all the values are there so we can
    // safely try to parse all the values as number or percentage
    const values = nonesReplacesParams.map(param => parsePercentOrNumber(param, [0, 1]));
    const containsNull = values.includes(null);
    // At least one value is malformatted (not a number or percentage)
    if (containsNull) {
        return null;
    }
    let alphaValue = 1;
    if (containsAlpha) {
        // We know that `alphaValue` exists at this point.
        // See the above lines for deciding on `containsAlpha`.
        alphaValue = values[values.length - 1];
        // We get rid of the `alpha` from the list
        // so that all the values map to `r, g, b` from the start
        values.pop();
    }
    // Depending on the color space
    // this either reflects `rgb` parameters in that color space
    // or `xyz` parameters in the given `xyz` space.
    const rgbOrXyza = [
        values[0] ?? 0,
        values[1] ?? 0,
        values[2] ?? 0,
        alphaValue,
    ];
    return new ColorFunction(colorSpace, rgbOrXyza, originalText);
}
export function parse(text) {
    // Simple - #hex, nickname
    const value = text.toLowerCase().replace(/\s+/g, '');
    const simple = /^(?:#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(\w+))$/i;
    let match = value.match(simple);
    if (match) {
        if (match[1]) {
            return Legacy.fromHex(match[1], text);
        }
        if (match[2]) {
            return Legacy.fromName(match[2], text);
        }
        return null;
    }
    // rgb/rgba(), hsl/hsla(), hwb/hwba(), lch(), oklch(), lab(), oklab() and color()
    match = text.toLowerCase().match(/^\s*(?:(rgba?)|(hsla?)|(hwba?)|(lch)|(oklch)|(lab)|(oklab)|(color))\((.*)\)\s*$/);
    if (match) {
        const isRgbaMatch = Boolean(match[1]); // rgb/rgba()
        const isHslaMatch = Boolean(match[2]); // hsl/hsla()
        const isHwbaMatch = Boolean(match[3]); // hwb/hwba()
        const isLchMatch = Boolean(match[4]); // lch()
        const isOklchMatch = Boolean(match[5]); // oklch()
        const isLabMatch = Boolean(match[6]); // lab()
        const isOklabMatch = Boolean(match[7]); // oklab()
        const isColorMatch = Boolean(match[8]); // color()
        const valuesText = match[9];
        // Parse color function first because extracting values for
        // this function is not the same as the other ones
        // so, we're not using any of the logic below.
        if (isColorMatch) {
            return parseColorFunction(text, valuesText);
        }
        const isOldSyntax = isRgbaMatch || isHslaMatch || isHwbaMatch;
        const allowCommas = isRgbaMatch || isHslaMatch;
        const convertNoneToZero = !isOldSyntax; // Convert 'none' keyword to zero in new syntaxes
        const values = splitColorFunctionParameters(valuesText, { allowCommas, convertNoneToZero });
        if (!values) {
            return null;
        }
        const spec = [values[0], values[1], values[2], values[3]];
        if (isRgbaMatch) {
            return Legacy.fromRGBAFunction(values[0], values[1], values[2], values[3], text);
        }
        if (isHslaMatch) {
            return Legacy.fromHSLA(values[0], values[1], values[2], values[3], text);
        }
        if (isHwbaMatch) {
            return Legacy.fromHWB(values[0], values[1], values[2], values[3], text);
        }
        if (isLchMatch) {
            return LCH.fromSpec(spec, text);
        }
        if (isOklchMatch) {
            return Oklch.fromSpec(spec, text);
        }
        if (isLabMatch) {
            return Lab.fromSpec(spec, text);
        }
        if (isOklabMatch) {
            return Oklab.fromSpec(spec, text);
        }
    }
    return null;
}
/**
 * Split the color parameters of (e.g.) rgb(a), hsl(a), hwb(a) functions.
 */
function splitColorFunctionParameters(content, { allowCommas, convertNoneToZero }) {
    const components = content.trim();
    let values = [];
    if (allowCommas) {
        values = components.split(/\s*,\s*/);
    }
    if (!allowCommas || values.length === 1) {
        values = components.split(/\s+/);
        if (values[3] === '/') {
            values.splice(3, 1);
            if (values.length !== 4) {
                return null;
            }
        }
        else if ((values.length > 2 && values[2].indexOf('/') !== -1) || (values.length > 3 && values[3].indexOf('/') !== -1)) {
            const alpha = values.slice(2, 4).join('');
            values = values.slice(0, 2).concat(alpha.split(/\//)).concat(values.slice(4));
        }
        else if (values.length >= 4) {
            return null;
        }
    }
    if (values.length !== 3 && values.length !== 4 || values.indexOf('') > -1) {
        return null;
    }
    // Question: what should we do with `alpha` being none?
    if (convertNoneToZero) {
        return values.map(value => value === 'none' ? '0' : value);
    }
    return values;
}
function clamp(value, { min, max }) {
    if (value === null) {
        return value;
    }
    if (min) {
        value = Math.max(value, min);
    }
    if (max) {
        value = Math.min(value, max);
    }
    return value;
}
function parsePercentage(value, range) {
    if (!value.endsWith('%')) {
        return null;
    }
    const percentage = parseFloat(value.substr(0, value.length - 1));
    return isNaN(percentage) ? null : mapPercentToRange(percentage, range);
}
function parseNumber(value) {
    const number = parseFloat(value);
    return isNaN(number) ? null : number;
}
function parseAlpha(value) {
    if (value === undefined) {
        return null;
    }
    return clamp(parsePercentage(value, [0, 1]) ?? parseNumber(value), { min: 0, max: 1 });
}
/**
 *
 * @param value Text value to be parsed in the form of 'number|percentage'.
 * @param range Range to map the percentage.
 * @returns If it is not percentage, returns number directly; otherwise,
 * maps the percentage to the range. For example:
 * - 30% in range [0, 100] is 30
 * - 20% in range [0, 1] is 0.5
 */
function parsePercentOrNumber(value, range = [0, 1]) {
    // @ts-ignore: isNaN can accept strings
    if (isNaN(value.replace('%', ''))) {
        return null;
    }
    const parsed = parseFloat(value);
    if (value.indexOf('%') !== -1) {
        if (value.indexOf('%') !== value.length - 1) {
            return null;
        }
        return mapPercentToRange(parsed, range);
    }
    return parsed;
}
function parseRgbNumeric(value) {
    const parsed = parsePercentOrNumber(value);
    if (parsed === null) {
        return null;
    }
    if (value.indexOf('%') !== -1) {
        return parsed;
    }
    return parsed / 255;
}
function parseHueNumeric(value) {
    const angle = value.replace(/(deg|g?rad|turn)$/, '');
    // @ts-ignore: isNaN can accept strings
    if (isNaN(angle) || value.match(/\s+(deg|g?rad|turn)/)) {
        return null;
    }
    const number = parseFloat(angle);
    if (value.indexOf('turn') !== -1) {
        return number % 1;
    }
    if (value.indexOf('grad') !== -1) {
        return (number / 400) % 1;
    }
    if (value.indexOf('rad') !== -1) {
        return (number / (2 * Math.PI)) % 1;
    }
    return (number / 360) % 1;
}
function parseSatLightNumeric(value) {
    // @ts-ignore: isNaN can accept strings
    if (value.indexOf('%') !== value.length - 1 || isNaN(value.replace('%', ''))) {
        return null;
    }
    const parsed = parseFloat(value);
    return Math.min(1, parsed / 100);
}
function parseAlphaNumeric(value) {
    return parsePercentOrNumber(value);
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
function hsva2hsla(hsva, out_hsla) {
    const h = hsva[0];
    let s = hsva[1];
    const v = hsva[2];
    const t = (2 - s) * v;
    if (v === 0 || s === 0) {
        s = 0;
    }
    else {
        s *= v / (t < 1 ? t : 2 - t);
    }
    out_hsla[0] = h;
    out_hsla[1] = s;
    out_hsla[2] = t / 2;
    out_hsla[3] = hsva[3];
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export function hsl2rgb(hsl, out_rgb) {
    const h = hsl[0];
    let s = hsl[1];
    const l = hsl[2];
    function hue2rgb(p, q, h) {
        if (h < 0) {
            h += 1;
        }
        else if (h > 1) {
            h -= 1;
        }
        if ((h * 6) < 1) {
            return p + (q - p) * h * 6;
        }
        if ((h * 2) < 1) {
            return q;
        }
        if ((h * 3) < 2) {
            return p + (q - p) * ((2 / 3) - h) * 6;
        }
        return p;
    }
    if (s < 0) {
        s = 0;
    }
    let q;
    if (l <= 0.5) {
        q = l * (1 + s);
    }
    else {
        q = l + s - (l * s);
    }
    const p = 2 * l - q;
    const tr = h + (1 / 3);
    const tg = h;
    const tb = h - (1 / 3);
    out_rgb[0] = hue2rgb(p, q, tr);
    out_rgb[1] = hue2rgb(p, q, tg);
    out_rgb[2] = hue2rgb(p, q, tb);
    out_rgb[3] = hsl[3];
}
// eslint-disable-next-line @typescript-eslint/naming-convention
function hwb2rgb(hwb, out_rgb) {
    const h = hwb[0];
    const w = hwb[1];
    const b = hwb[2];
    if (w + b >= 1) {
        out_rgb[0] = out_rgb[1] = out_rgb[2] = w / (w + b);
        out_rgb[3] = hwb[3];
    }
    else {
        hsl2rgb([h, 1, 0.5, hwb[3]], out_rgb);
        for (let i = 0; i < 3; ++i) {
            out_rgb[i] += w - (w + b) * out_rgb[i];
        }
    }
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export function hsva2rgba(hsva, out_rgba) {
    const tmpHSLA = [0, 0, 0, 0];
    hsva2hsla(hsva, tmpHSLA);
    hsl2rgb(tmpHSLA, out_rgba);
}
/**
 * Compute a desired luminance given a given luminance and a desired contrast
 * ratio.
 */
export function desiredLuminance(luminance, contrast, lighter) {
    function computeLuminance() {
        if (lighter) {
            return (luminance + 0.05) * contrast - 0.05;
        }
        return (luminance + 0.05) / contrast - 0.05;
    }
    let desiredLuminance = computeLuminance();
    if (desiredLuminance < 0 || desiredLuminance > 1) {
        lighter = !lighter;
        desiredLuminance = computeLuminance();
    }
    return desiredLuminance;
}
/**
 * Approach a value of the given component of `candidateHSVA` such that the
 * calculated luminance of `candidateHSVA` approximates `desiredLuminance`.
 */
export function approachColorValue(candidateHSVA, bgRGBA, index, desiredLuminance, candidateLuminance) {
    const epsilon = 0.0002;
    let x = candidateHSVA[index];
    let multiplier = 1;
    let dLuminance = candidateLuminance(candidateHSVA) - desiredLuminance;
    let previousSign = Math.sign(dLuminance);
    for (let guard = 100; guard; guard--) {
        if (Math.abs(dLuminance) < epsilon) {
            candidateHSVA[index] = x;
            return x;
        }
        const sign = Math.sign(dLuminance);
        if (sign !== previousSign) {
            // If `x` overshoots the correct value, halve the step size.
            multiplier /= 2;
            previousSign = sign;
        }
        else if (x < 0 || x > 1) {
            // If there is no overshoot and `x` is out of bounds, there is no
            // acceptable value for `x`.
            return null;
        }
        // Adjust `x` by a multiple of `dLuminance` to decrease step size as
        // the computed luminance converges on `desiredLuminance`.
        x += multiplier * (index === 2 ? -dLuminance : dLuminance);
        candidateHSVA[index] = x;
        dLuminance = candidateLuminance(candidateHSVA) - desiredLuminance;
    }
    return null;
}
export function findFgColorForContrast(fgColor, bgColor, requiredContrast) {
    const candidateHSVA = fgColor.hsva();
    const bgRGBA = bgColor.rgba();
    const candidateLuminance = (candidateHSVA) => {
        return luminance(blendColors(Legacy.fromHSVA(candidateHSVA).rgba(), bgRGBA));
    };
    const bgLuminance = luminance(bgColor.rgba());
    const fgLuminance = candidateLuminance(candidateHSVA);
    const fgIsLighter = fgLuminance > bgLuminance;
    const desired = desiredLuminance(bgLuminance, requiredContrast, fgIsLighter);
    const saturationComponentIndex = 1;
    const valueComponentIndex = 2;
    if (approachColorValue(candidateHSVA, bgRGBA, valueComponentIndex, desired, candidateLuminance)) {
        return Legacy.fromHSVA(candidateHSVA);
    }
    candidateHSVA[valueComponentIndex] = 1;
    if (approachColorValue(candidateHSVA, bgRGBA, saturationComponentIndex, desired, candidateLuminance)) {
        return Legacy.fromHSVA(candidateHSVA);
    }
    return null;
}
export function findFgColorForContrastAPCA(fgColor, bgColor, requiredContrast) {
    const candidateHSVA = fgColor.hsva();
    const bgRGBA = bgColor.rgba();
    const candidateLuminance = (candidateHSVA) => {
        return luminanceAPCA(Legacy.fromHSVA(candidateHSVA).rgba());
    };
    const bgLuminance = luminanceAPCA(bgColor.rgba());
    const fgLuminance = candidateLuminance(candidateHSVA);
    const fgIsLighter = fgLuminance >= bgLuminance;
    const desiredLuminance = desiredLuminanceAPCA(bgLuminance, requiredContrast, fgIsLighter);
    const saturationComponentIndex = 1;
    const valueComponentIndex = 2;
    if (approachColorValue(candidateHSVA, bgRGBA, valueComponentIndex, desiredLuminance, candidateLuminance)) {
        const candidate = Legacy.fromHSVA(candidateHSVA);
        if (Math.abs(contrastRatioAPCA(bgColor.rgba(), candidate.rgba())) >= requiredContrast) {
            return candidate;
        }
    }
    candidateHSVA[valueComponentIndex] = 1;
    if (approachColorValue(candidateHSVA, bgRGBA, saturationComponentIndex, desiredLuminance, candidateLuminance)) {
        const candidate = Legacy.fromHSVA(candidateHSVA);
        if (Math.abs(contrastRatioAPCA(bgColor.rgba(), candidate.rgba())) >= requiredContrast) {
            return candidate;
        }
    }
    return null;
}
function stringifyWithPrecision(s, precision = 2) {
    const string = s.toFixed(precision).replace(/\.?0*$/, '');
    return string === '-0' ? '0' : string;
}
export class Lab {
    #l;
    #a;
    #b;
    #alpha;
    #origin;
    #originalText;
    #conversions = {
        ["nickname" /* Format.Nickname */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "nickname" /* Format.Nickname */, undefined, this),
        ["hex" /* Format.HEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hex" /* Format.HEX */, undefined, this),
        ["shorthex" /* Format.ShortHEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "shorthex" /* Format.ShortHEX */, undefined, this),
        ["hexa" /* Format.HEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hexa" /* Format.HEXA */, undefined, this),
        ["shorthexa" /* Format.ShortHEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "shorthexa" /* Format.ShortHEXA */, undefined, this),
        ["rgb" /* Format.RGB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "rgb" /* Format.RGB */, undefined, this),
        ["rgba" /* Format.RGBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "rgba" /* Format.RGBA */, undefined, this),
        ["hsl" /* Format.HSL */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hsl" /* Format.HSL */, undefined, this),
        ["hsla" /* Format.HSLA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hsla" /* Format.HSLA */, undefined, this),
        ["hwb" /* Format.HWB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hwb" /* Format.HWB */, undefined, this),
        ["hwba" /* Format.HWBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hwba" /* Format.HWBA */, undefined, this),
        ["lch" /* Format.LCH */]: () => new LCH(...ColorConverter.labToLch(this.#l, this.#a, this.#b), this.#alpha, undefined, this),
        ["oklch" /* Format.OKLCH */]: () => new Oklch(...ColorConverter.xyzd50ToOklch(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["lab" /* Format.LAB */]: () => this,
        ["oklab" /* Format.OKLAB */]: () => new Oklab(...ColorConverter.xyzd65ToOklab(...ColorConverter.xyzd50ToD65(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["srgb" /* Format.SRGB */]: () => new ColorFunction("srgb" /* Format.SRGB */, [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["srgb-linear" /* Format.SRGB_LINEAR */]: () => new ColorFunction("srgb-linear" /* Format.SRGB_LINEAR */, [...ColorConverter.xyzd50TosRGBLinear(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["display-p3" /* Format.DISPLAY_P3 */]: () => new ColorFunction("display-p3" /* Format.DISPLAY_P3 */, [...ColorConverter.xyzd50ToDisplayP3(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["a98-rgb" /* Format.A98_RGB */]: () => new ColorFunction("a98-rgb" /* Format.A98_RGB */, [...ColorConverter.xyzd50ToAdobeRGB(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["prophoto-rgb" /* Format.PROPHOTO_RGB */]: () => new ColorFunction("prophoto-rgb" /* Format.PROPHOTO_RGB */, [...ColorConverter.xyzd50ToProPhoto(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["rec2020" /* Format.REC_2020 */]: () => new ColorFunction("rec2020" /* Format.REC_2020 */, [...ColorConverter.xyzd50ToRec2020(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz" /* Format.XYZ */]: () => new ColorFunction("xyz" /* Format.XYZ */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz-d50" /* Format.XYZ_D50 */]: () => new ColorFunction("xyz-d50" /* Format.XYZ_D50 */, [...this.#toXyzd50(), this.#alpha], undefined, this),
        ["xyz-d65" /* Format.XYZ_D65 */]: () => new ColorFunction("xyz-d65" /* Format.XYZ_D65 */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
    };
    #toXyzd50() {
        return ColorConverter.labToXyzd50(this.#l, this.#a, this.#b);
    }
    #getRGBArray(withAlpha = true) {
        const params = [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50())];
        if (this.#alpha !== null && withAlpha) {
            params.push(this.#alpha);
        }
        return params;
    }
    constructor(l, a, b, alpha, originalText, origin) {
        this.#l = clamp(l, { min: 0, max: 100 });
        this.#a = a;
        this.#b = b;
        this.#alpha = clamp(alpha, { min: 0, max: 1 });
        this.#origin = origin;
        this.#originalText = originalText;
    }
    as(format) {
        if (this.#origin) {
            return this.#origin.as(format);
        }
        return this.#conversions[format]();
    }
    asLegacyColor() {
        return this.as("rgba" /* Format.RGBA */);
    }
    equal(color) {
        const lab = color.as("lab" /* Format.LAB */);
        return lab.#l === this.#l && lab.#a === this.#a && lab.#b === this.#b && lab.#alpha === this.#alpha;
    }
    format() {
        return "lab" /* Format.LAB */;
    }
    setAlpha(alpha) {
        return new Lab(this.#l, this.#a, this.#b, alpha, undefined);
    }
    asString(format) {
        if (format) {
            return this.as(format).asString();
        }
        if (this.#originalText) {
            return this.#originalText;
        }
        const alpha = this.#alpha === null || this.#alpha === 1 ? '' : ` / ${stringifyWithPrecision(this.#alpha)}`;
        return `lab(${stringifyWithPrecision(this.#l)} ${stringifyWithPrecision(this.#a)} ${stringifyWithPrecision(this.#b)}${alpha})`;
    }
    static fromSpec(spec, text) {
        const L = parsePercentage(spec[0], [0, 100]) ?? parseNumber(spec[0]);
        if (L === null) {
            return null;
        }
        const a = parsePercentage(spec[1], [0, 125]) ?? parseNumber(spec[1]);
        if (a === null) {
            return null;
        }
        const b = parsePercentage(spec[2], [0, 125]) ?? parseNumber(spec[2]);
        if (b === null) {
            return null;
        }
        const alpha = parseAlpha(spec[3]);
        return new Lab(L, a, b, alpha, text);
    }
}
export class LCH {
    #l;
    #c;
    #h;
    #alpha;
    #origin;
    #originalText;
    #conversions = {
        ["nickname" /* Format.Nickname */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "nickname" /* Format.Nickname */, undefined, this),
        ["hex" /* Format.HEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hex" /* Format.HEX */, undefined, this),
        ["shorthex" /* Format.ShortHEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "shorthex" /* Format.ShortHEX */, undefined, this),
        ["hexa" /* Format.HEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hexa" /* Format.HEXA */, undefined, this),
        ["shorthexa" /* Format.ShortHEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "shorthexa" /* Format.ShortHEXA */, undefined, this),
        ["rgb" /* Format.RGB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "rgb" /* Format.RGB */, undefined, this),
        ["rgba" /* Format.RGBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "rgba" /* Format.RGBA */, undefined, this),
        ["hsl" /* Format.HSL */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hsl" /* Format.HSL */, undefined, this),
        ["hsla" /* Format.HSLA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hsla" /* Format.HSLA */, undefined, this),
        ["hwb" /* Format.HWB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hwb" /* Format.HWB */, undefined, this),
        ["hwba" /* Format.HWBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hwba" /* Format.HWBA */, undefined, this),
        ["lch" /* Format.LCH */]: () => this,
        ["oklch" /* Format.OKLCH */]: () => new Oklch(...ColorConverter.xyzd50ToOklch(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["lab" /* Format.LAB */]: () => new Lab(...ColorConverter.lchToLab(this.#l, this.#c, this.#h), this.#alpha, undefined, this),
        ["oklab" /* Format.OKLAB */]: () => new Oklab(...ColorConverter.xyzd65ToOklab(...ColorConverter.xyzd50ToD65(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["srgb" /* Format.SRGB */]: () => new ColorFunction("srgb" /* Format.SRGB */, [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["srgb-linear" /* Format.SRGB_LINEAR */]: () => new ColorFunction("srgb-linear" /* Format.SRGB_LINEAR */, [...ColorConverter.xyzd50TosRGBLinear(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["display-p3" /* Format.DISPLAY_P3 */]: () => new ColorFunction("display-p3" /* Format.DISPLAY_P3 */, [...ColorConverter.xyzd50ToDisplayP3(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["a98-rgb" /* Format.A98_RGB */]: () => new ColorFunction("a98-rgb" /* Format.A98_RGB */, [...ColorConverter.xyzd50ToAdobeRGB(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["prophoto-rgb" /* Format.PROPHOTO_RGB */]: () => new ColorFunction("prophoto-rgb" /* Format.PROPHOTO_RGB */, [...ColorConverter.xyzd50ToProPhoto(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["rec2020" /* Format.REC_2020 */]: () => new ColorFunction("rec2020" /* Format.REC_2020 */, [...ColorConverter.xyzd50ToRec2020(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz" /* Format.XYZ */]: () => new ColorFunction("xyz" /* Format.XYZ */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz-d50" /* Format.XYZ_D50 */]: () => new ColorFunction("xyz-d50" /* Format.XYZ_D50 */, [...this.#toXyzd50(), this.#alpha], undefined, this),
        ["xyz-d65" /* Format.XYZ_D65 */]: () => new ColorFunction("xyz-d65" /* Format.XYZ_D65 */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
    };
    #toXyzd50() {
        return ColorConverter.labToXyzd50(...ColorConverter.lchToLab(this.#l, this.#c, this.#h));
    }
    #getRGBArray(withAlpha = true) {
        const params = [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50())];
        if (this.#alpha !== null && withAlpha) {
            params.push(this.#alpha);
        }
        return params;
    }
    constructor(l, c, h, alpha, originalText, origin) {
        this.#l = clamp(l, { min: 0, max: 100 });
        this.#c = clamp(c, { min: 0 });
        this.#h = h;
        this.#alpha = clamp(alpha, { min: 0, max: 1 });
        this.#origin = origin;
        this.#originalText = originalText;
    }
    asLegacyColor() {
        return this.as("rgba" /* Format.RGBA */);
    }
    as(format) {
        if (this.#origin) {
            return this.#origin.as(format);
        }
        return this.#conversions[format]();
    }
    equal(color) {
        const lch = color.as("lch" /* Format.LCH */);
        return lch.#l === this.#l && lch.#c === this.#c && lch.#h === this.#h && lch.#alpha === this.#alpha;
    }
    format() {
        return "lch" /* Format.LCH */;
    }
    setAlpha(alpha) {
        return new LCH(this.#l, this.#c, this.#h, alpha, undefined);
    }
    asString(format) {
        if (format) {
            return this.as(format).asString();
        }
        if (this.#originalText) {
            return this.#originalText;
        }
        const alpha = this.#alpha === null || this.#alpha === 1 ? '' : ` / ${stringifyWithPrecision(this.#alpha)}`;
        return `lch(${stringifyWithPrecision(this.#l)} ${stringifyWithPrecision(this.#c)} ${stringifyWithPrecision(this.#h)}${alpha})`;
    }
    static fromSpec(spec, text) {
        const L = parsePercentage(spec[0], [0, 100]) ?? parseNumber(spec[0]);
        if (L === null) {
            return null;
        }
        const c = parsePercentage(spec[1], [0, 150]) ?? parseNumber(spec[1]);
        if (c === null) {
            return null;
        }
        const h = parseAngle(spec[2]);
        if (h === null) {
            return null;
        }
        const alpha = parseAlpha(spec[3]);
        return new LCH(L, c, h, alpha, text);
    }
}
export class Oklab {
    #l;
    #a;
    #b;
    #alpha;
    #origin;
    #originalText;
    #conversions = {
        ["nickname" /* Format.Nickname */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "nickname" /* Format.Nickname */, undefined, this),
        ["hex" /* Format.HEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hex" /* Format.HEX */, undefined, this),
        ["shorthex" /* Format.ShortHEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "shorthex" /* Format.ShortHEX */, undefined, this),
        ["hexa" /* Format.HEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hexa" /* Format.HEXA */, undefined, this),
        ["shorthexa" /* Format.ShortHEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "shorthexa" /* Format.ShortHEXA */, undefined, this),
        ["rgb" /* Format.RGB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "rgb" /* Format.RGB */, undefined, this),
        ["rgba" /* Format.RGBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "rgba" /* Format.RGBA */, undefined, this),
        ["hsl" /* Format.HSL */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hsl" /* Format.HSL */, undefined, this),
        ["hsla" /* Format.HSLA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hsla" /* Format.HSLA */, undefined, this),
        ["hwb" /* Format.HWB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hwb" /* Format.HWB */, undefined, this),
        ["hwba" /* Format.HWBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hwba" /* Format.HWBA */, undefined, this),
        ["lch" /* Format.LCH */]: () => new LCH(...ColorConverter.labToLch(...ColorConverter.xyzd50ToLab(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["oklch" /* Format.OKLCH */]: () => new Oklch(...ColorConverter.xyzd50ToOklch(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["lab" /* Format.LAB */]: () => new Lab(...ColorConverter.xyzd50ToLab(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["oklab" /* Format.OKLAB */]: () => this,
        ["srgb" /* Format.SRGB */]: () => new ColorFunction("srgb" /* Format.SRGB */, [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["srgb-linear" /* Format.SRGB_LINEAR */]: () => new ColorFunction("srgb-linear" /* Format.SRGB_LINEAR */, [...ColorConverter.xyzd50TosRGBLinear(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["display-p3" /* Format.DISPLAY_P3 */]: () => new ColorFunction("display-p3" /* Format.DISPLAY_P3 */, [...ColorConverter.xyzd50ToDisplayP3(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["a98-rgb" /* Format.A98_RGB */]: () => new ColorFunction("a98-rgb" /* Format.A98_RGB */, [...ColorConverter.xyzd50ToAdobeRGB(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["prophoto-rgb" /* Format.PROPHOTO_RGB */]: () => new ColorFunction("prophoto-rgb" /* Format.PROPHOTO_RGB */, [...ColorConverter.xyzd50ToProPhoto(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["rec2020" /* Format.REC_2020 */]: () => new ColorFunction("rec2020" /* Format.REC_2020 */, [...ColorConverter.xyzd50ToRec2020(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz" /* Format.XYZ */]: () => new ColorFunction("xyz" /* Format.XYZ */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz-d50" /* Format.XYZ_D50 */]: () => new ColorFunction("xyz-d50" /* Format.XYZ_D50 */, [...this.#toXyzd50(), this.#alpha], undefined, this),
        ["xyz-d65" /* Format.XYZ_D65 */]: () => new ColorFunction("xyz-d65" /* Format.XYZ_D65 */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
    };
    #toXyzd50() {
        return ColorConverter.xyzd65ToD50(...ColorConverter.oklabToXyzd65(this.#l, this.#a, this.#b));
    }
    #getRGBArray(withAlpha = true) {
        const params = [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50())];
        if (this.#alpha !== null && withAlpha) {
            params.push(this.#alpha);
        }
        return params;
    }
    constructor(l, a, b, alpha, originalText, origin) {
        this.#l = clamp(l, { min: 0, max: 1 });
        this.#a = a;
        this.#b = b;
        this.#alpha = clamp(alpha, { min: 0, max: 1 });
        this.#origin = origin;
        this.#originalText = originalText;
    }
    asLegacyColor() {
        return this.as("rgba" /* Format.RGBA */);
    }
    as(format) {
        if (this.#origin) {
            return this.#origin.as(format);
        }
        return this.#conversions[format]();
    }
    equal(color) {
        const oklab = color.as("oklab" /* Format.OKLAB */);
        return oklab.#l === this.#l && oklab.#a === this.#a && oklab.#b === this.#b && oklab.#alpha === this.#alpha;
    }
    format() {
        return "oklab" /* Format.OKLAB */;
    }
    setAlpha(alpha) {
        return new Oklab(this.#l, this.#a, this.#b, alpha, undefined);
    }
    asString(format) {
        if (format) {
            return this.as(format).asString();
        }
        if (this.#originalText) {
            return this.#originalText;
        }
        const alpha = this.#alpha === null || this.#alpha === 1 ? '' : ` / ${stringifyWithPrecision(this.#alpha)}`;
        return `oklab(${stringifyWithPrecision(this.#l)} ${stringifyWithPrecision(this.#a)} ${stringifyWithPrecision(this.#b)}${alpha})`;
    }
    static fromSpec(spec, text) {
        const L = parsePercentage(spec[0], [0, 1]) ?? parseNumber(spec[0]);
        if (L === null) {
            return null;
        }
        const a = parsePercentage(spec[1], [0, 0.4]) ?? parseNumber(spec[1]);
        if (a === null) {
            return null;
        }
        const b = parsePercentage(spec[2], [0, 0.4]) ?? parseNumber(spec[2]);
        if (b === null) {
            return null;
        }
        const alpha = parseAlpha(spec[3]);
        return new Oklab(L, a, b, alpha, text);
    }
}
export class Oklch {
    #l;
    #c;
    #h;
    #alpha;
    #origin;
    #originalText;
    #conversions = {
        ["nickname" /* Format.Nickname */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "nickname" /* Format.Nickname */, undefined, this),
        ["hex" /* Format.HEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hex" /* Format.HEX */, undefined, this),
        ["shorthex" /* Format.ShortHEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "shorthex" /* Format.ShortHEX */, undefined, this),
        ["hexa" /* Format.HEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hexa" /* Format.HEXA */, undefined, this),
        ["shorthexa" /* Format.ShortHEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "shorthexa" /* Format.ShortHEXA */, undefined, this),
        ["rgb" /* Format.RGB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "rgb" /* Format.RGB */, undefined, this),
        ["rgba" /* Format.RGBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "rgba" /* Format.RGBA */, undefined, this),
        ["hsl" /* Format.HSL */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hsl" /* Format.HSL */, undefined, this),
        ["hsla" /* Format.HSLA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hsla" /* Format.HSLA */, undefined, this),
        ["hwb" /* Format.HWB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hwb" /* Format.HWB */, undefined, this),
        ["hwba" /* Format.HWBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hwba" /* Format.HWBA */, undefined, this),
        ["lch" /* Format.LCH */]: () => new LCH(...ColorConverter.labToLch(...ColorConverter.xyzd50ToLab(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["oklch" /* Format.OKLCH */]: () => this,
        ["lab" /* Format.LAB */]: () => new Lab(...ColorConverter.xyzd50ToLab(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["oklab" /* Format.OKLAB */]: () => new Oklab(...ColorConverter.xyzd65ToOklab(...ColorConverter.xyzd50ToD65(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["srgb" /* Format.SRGB */]: () => new ColorFunction("srgb" /* Format.SRGB */, [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["srgb-linear" /* Format.SRGB_LINEAR */]: () => new ColorFunction("srgb-linear" /* Format.SRGB_LINEAR */, [...ColorConverter.xyzd50TosRGBLinear(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["display-p3" /* Format.DISPLAY_P3 */]: () => new ColorFunction("display-p3" /* Format.DISPLAY_P3 */, [...ColorConverter.xyzd50ToDisplayP3(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["a98-rgb" /* Format.A98_RGB */]: () => new ColorFunction("a98-rgb" /* Format.A98_RGB */, [...ColorConverter.xyzd50ToAdobeRGB(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["prophoto-rgb" /* Format.PROPHOTO_RGB */]: () => new ColorFunction("prophoto-rgb" /* Format.PROPHOTO_RGB */, [...ColorConverter.xyzd50ToProPhoto(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["rec2020" /* Format.REC_2020 */]: () => new ColorFunction("rec2020" /* Format.REC_2020 */, [...ColorConverter.xyzd50ToRec2020(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz" /* Format.XYZ */]: () => new ColorFunction("xyz" /* Format.XYZ */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz-d50" /* Format.XYZ_D50 */]: () => new ColorFunction("xyz-d50" /* Format.XYZ_D50 */, [...this.#toXyzd50(), this.#alpha], undefined, this),
        ["xyz-d65" /* Format.XYZ_D65 */]: () => new ColorFunction("xyz-d65" /* Format.XYZ_D65 */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
    };
    #toXyzd50() {
        return ColorConverter.oklchToXyzd50(this.#l, this.#c, this.#h);
    }
    #getRGBArray(withAlpha = true) {
        const params = [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50())];
        if (this.#alpha !== null && withAlpha) {
            params.push(this.#alpha);
        }
        return params;
    }
    constructor(l, c, h, alpha, originalText, origin) {
        this.#l = clamp(l, { min: 0, max: 1 });
        this.#c = clamp(c, { min: 0 });
        this.#h = h;
        this.#alpha = clamp(alpha, { min: 0, max: 1 });
        this.#origin = origin;
        this.#originalText = originalText;
    }
    asLegacyColor() {
        return this.as("rgba" /* Format.RGBA */);
    }
    as(format) {
        if (this.#origin) {
            return this.#origin.as(format);
        }
        return this.#conversions[format]();
    }
    equal(color) {
        const oklch = color.as("oklch" /* Format.OKLCH */);
        return oklch.#l === this.#l && oklch.#c === this.#c && oklch.#h === this.#h && oklch.#alpha === this.#alpha;
    }
    format() {
        return "oklch" /* Format.OKLCH */;
    }
    setAlpha(alpha) {
        return new Oklch(this.#l, this.#c, this.#h, alpha, undefined);
    }
    asString(format) {
        if (format) {
            return this.as(format).asString();
        }
        if (this.#originalText) {
            return this.#originalText;
        }
        const alpha = this.#alpha === null || this.#alpha === 1 ? '' : ` / ${stringifyWithPrecision(this.#alpha)}`;
        return `oklch(${stringifyWithPrecision(this.#l)} ${stringifyWithPrecision(this.#c)} ${stringifyWithPrecision(this.#h)}${alpha})`;
    }
    static fromSpec(spec, text) {
        const L = parsePercentage(spec[0], [0, 1]) ?? parseNumber(spec[0]);
        if (L === null) {
            return null;
        }
        const c = parsePercentage(spec[1], [0, 0.4]) ?? parseNumber(spec[1]);
        if (c === null) {
            return null;
        }
        const h = parseAngle(spec[2]);
        if (h === null) {
            return null;
        }
        const alpha = parseAlpha(spec[3]);
        return new Oklch(L, c, h, alpha, text);
    }
}
export class ColorFunction {
    #spec;
    #colorSpace;
    #origin;
    #originalText;
    #conversions = {
        ["nickname" /* Format.Nickname */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "nickname" /* Format.Nickname */, undefined, this),
        ["hex" /* Format.HEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hex" /* Format.HEX */, undefined, this),
        ["shorthex" /* Format.ShortHEX */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "shorthex" /* Format.ShortHEX */, undefined, this),
        ["hexa" /* Format.HEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hexa" /* Format.HEXA */, undefined, this),
        ["shorthexa" /* Format.ShortHEXA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "shorthexa" /* Format.ShortHEXA */, undefined, this),
        ["rgb" /* Format.RGB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "rgb" /* Format.RGB */, undefined, this),
        ["rgba" /* Format.RGBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "rgba" /* Format.RGBA */, undefined, this),
        ["hsl" /* Format.HSL */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hsl" /* Format.HSL */, undefined, this),
        ["hsla" /* Format.HSLA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hsla" /* Format.HSLA */, undefined, this),
        ["hwb" /* Format.HWB */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ false), "hwb" /* Format.HWB */, undefined, this),
        ["hwba" /* Format.HWBA */]: () => new Legacy(this.#getRGBArray(/* withAlpha= */ true), "hwba" /* Format.HWBA */, undefined, this),
        ["lch" /* Format.LCH */]: () => new LCH(...ColorConverter.labToLch(...ColorConverter.xyzd50ToLab(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["oklch" /* Format.OKLCH */]: () => new Oklch(...ColorConverter.xyzd50ToOklch(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["lab" /* Format.LAB */]: () => new Lab(...ColorConverter.xyzd50ToLab(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["oklab" /* Format.OKLAB */]: () => new Oklab(...ColorConverter.xyzd65ToOklab(...ColorConverter.xyzd50ToD65(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["srgb" /* Format.SRGB */]: () => new ColorFunction("srgb" /* Format.SRGB */, [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["srgb-linear" /* Format.SRGB_LINEAR */]: () => new ColorFunction("srgb-linear" /* Format.SRGB_LINEAR */, [...ColorConverter.xyzd50TosRGBLinear(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["display-p3" /* Format.DISPLAY_P3 */]: () => new ColorFunction("display-p3" /* Format.DISPLAY_P3 */, [...ColorConverter.xyzd50ToDisplayP3(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["a98-rgb" /* Format.A98_RGB */]: () => new ColorFunction("a98-rgb" /* Format.A98_RGB */, [...ColorConverter.xyzd50ToAdobeRGB(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["prophoto-rgb" /* Format.PROPHOTO_RGB */]: () => new ColorFunction("prophoto-rgb" /* Format.PROPHOTO_RGB */, [...ColorConverter.xyzd50ToProPhoto(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["rec2020" /* Format.REC_2020 */]: () => new ColorFunction("rec2020" /* Format.REC_2020 */, [...ColorConverter.xyzd50ToRec2020(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz" /* Format.XYZ */]: () => new ColorFunction("xyz" /* Format.XYZ */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz-d50" /* Format.XYZ_D50 */]: () => new ColorFunction("xyz-d50" /* Format.XYZ_D50 */, [...this.#toXyzd50(), this.#alpha], undefined, this),
        ["xyz-d65" /* Format.XYZ_D65 */]: () => new ColorFunction("xyz-d65" /* Format.XYZ_D65 */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
    };
    get #alpha() {
        return this.#spec[3] ?? null;
    }
    #toXyzd50() {
        const [p0, p1, p2] = this.#spec;
        switch (this.#colorSpace) {
            case "srgb" /* Format.SRGB */:
                return ColorConverter.srgbToXyzd50(p0, p1, p2);
            case "srgb-linear" /* Format.SRGB_LINEAR */:
                return ColorConverter.srgbLinearToXyzd50(p0, p1, p2);
            case "display-p3" /* Format.DISPLAY_P3 */:
                return ColorConverter.displayP3ToXyzd50(p0, p1, p2);
            case "a98-rgb" /* Format.A98_RGB */:
                return ColorConverter.adobeRGBToXyzd50(p0, p1, p2);
            case "prophoto-rgb" /* Format.PROPHOTO_RGB */:
                return ColorConverter.proPhotoToXyzd50(p0, p1, p2);
            case "rec2020" /* Format.REC_2020 */:
                return ColorConverter.rec2020ToXyzd50(p0, p1, p2);
            case "xyz-d50" /* Format.XYZ_D50 */:
                return [p0, p1, p2];
            case "xyz" /* Format.XYZ */:
            case "xyz-d65" /* Format.XYZ_D65 */:
                return ColorConverter.xyzd65ToD50(p0, p1, p2);
        }
        throw new Error('Invalid color space');
    }
    #getRGBArray(withAlpha = true) {
        const [p0, p1, p2] = this.#spec;
        const params = this.#colorSpace === "srgb" /* Format.SRGB */ ? [p0, p1, p2] : [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50())];
        if (this.#alpha !== null && withAlpha) {
            params.push(this.#alpha);
        }
        return params;
    }
    constructor(colorSpace, rgbOrXyz, originalText, origin) {
        this.#colorSpace = colorSpace;
        this.#origin = origin;
        this.#originalText = originalText;
        if (colorSpace === "xyz" /* Format.XYZ */ || colorSpace === "xyz-d50" /* Format.XYZ_D50 */ || colorSpace === "xyz-d65" /* Format.XYZ_D65 */) {
            this.#spec = [rgbOrXyz[0], rgbOrXyz[1], rgbOrXyz[2], clamp(rgbOrXyz[3], { min: 0, max: 1 })];
        }
        else {
            this.#spec = [
                clamp(rgbOrXyz[0], { min: 0, max: 1 }),
                clamp(rgbOrXyz[1], { min: 0, max: 1 }),
                clamp(rgbOrXyz[2], { min: 0, max: 1 }),
                clamp(rgbOrXyz[3], { min: 0, max: 1 }),
            ];
        }
    }
    asLegacyColor() {
        return this.as("rgba" /* Format.RGBA */);
    }
    as(format) {
        if (this.#colorSpace === format) {
            return this;
        }
        if (this.#origin) {
            return this.#origin.as(format);
        }
        return this.#conversions[format]();
    }
    equal(color) {
        const space = color.as(this.#colorSpace);
        return space.#spec[0] === this.#spec[0] && space.#spec[1] === this.#spec[1] && space.#spec[2] === this.#spec[2] &&
            space.#spec[3] === this.#spec[3];
    }
    format() {
        return this.#colorSpace;
    }
    setAlpha(alpha) {
        return new ColorFunction(this.#colorSpace, [this.#spec[0], this.#spec[1], this.#spec[2], alpha], undefined);
    }
    asString(format) {
        if (format) {
            return this.as(format).asString();
        }
        if (this.#originalText) {
            return this.#originalText;
        }
        const alpha = this.#spec[3] === null || this.#spec[3] === 1 ? '' : ` / ${stringifyWithPrecision(this.#spec[3])}`;
        return `color(${this.#colorSpace} ${stringifyWithPrecision(this.#spec[0])} ${stringifyWithPrecision(this.#spec[1])} ${stringifyWithPrecision(this.#spec[2])}${alpha})`;
    }
}
export class Legacy {
    #hslaInternal;
    #hwbaInternal;
    #rgbaInternal;
    #originalText;
    #formatInternal;
    #origin;
    #conversions = {
        ["nickname" /* Format.Nickname */]: () => new Legacy(this.#rgbaInternal, "nickname" /* Format.Nickname */, undefined, this),
        ["hex" /* Format.HEX */]: () => new Legacy(this.#rgbaInternal, "hex" /* Format.HEX */, undefined, this),
        ["shorthex" /* Format.ShortHEX */]: () => new Legacy(this.#rgbaInternal, "shorthex" /* Format.ShortHEX */, undefined, this),
        ["hexa" /* Format.HEXA */]: () => new Legacy(this.#rgbaInternal, "hexa" /* Format.HEXA */, undefined, this),
        ["shorthexa" /* Format.ShortHEXA */]: () => new Legacy(this.#rgbaInternal, "shorthexa" /* Format.ShortHEXA */, undefined, this),
        ["rgb" /* Format.RGB */]: () => new Legacy(this.#rgbaInternal, "rgb" /* Format.RGB */, undefined, this),
        ["rgba" /* Format.RGBA */]: () => new Legacy(this.#rgbaInternal, "rgba" /* Format.RGBA */, undefined, this),
        ["hsl" /* Format.HSL */]: () => new Legacy(this.#rgbaInternal, "hsl" /* Format.HSL */, undefined, this),
        ["hsla" /* Format.HSLA */]: () => new Legacy(this.#rgbaInternal, "hsla" /* Format.HSLA */, undefined, this),
        ["hwb" /* Format.HWB */]: () => new Legacy(this.#rgbaInternal, "hwb" /* Format.HWB */, undefined, this),
        ["hwba" /* Format.HWBA */]: () => new Legacy(this.#rgbaInternal, "hwba" /* Format.HWBA */, undefined, this),
        ["lch" /* Format.LCH */]: () => new LCH(...ColorConverter.labToLch(...ColorConverter.xyzd50ToLab(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["oklch" /* Format.OKLCH */]: () => new Oklch(...ColorConverter.xyzd50ToOklch(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["lab" /* Format.LAB */]: () => new Lab(...ColorConverter.xyzd50ToLab(...this.#toXyzd50()), this.#alpha, undefined, this),
        ["oklab" /* Format.OKLAB */]: () => new Oklab(...ColorConverter.xyzd65ToOklab(...ColorConverter.xyzd50ToD65(...this.#toXyzd50())), this.#alpha, undefined, this),
        ["srgb" /* Format.SRGB */]: () => new ColorFunction("srgb" /* Format.SRGB */, [...ColorConverter.xyzd50ToSrgb(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["srgb-linear" /* Format.SRGB_LINEAR */]: () => new ColorFunction("srgb-linear" /* Format.SRGB_LINEAR */, [...ColorConverter.xyzd50TosRGBLinear(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["display-p3" /* Format.DISPLAY_P3 */]: () => new ColorFunction("display-p3" /* Format.DISPLAY_P3 */, [...ColorConverter.xyzd50ToDisplayP3(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["a98-rgb" /* Format.A98_RGB */]: () => new ColorFunction("a98-rgb" /* Format.A98_RGB */, [...ColorConverter.xyzd50ToAdobeRGB(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["prophoto-rgb" /* Format.PROPHOTO_RGB */]: () => new ColorFunction("prophoto-rgb" /* Format.PROPHOTO_RGB */, [...ColorConverter.xyzd50ToProPhoto(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["rec2020" /* Format.REC_2020 */]: () => new ColorFunction("rec2020" /* Format.REC_2020 */, [...ColorConverter.xyzd50ToRec2020(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz" /* Format.XYZ */]: () => new ColorFunction("xyz" /* Format.XYZ */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
        ["xyz-d50" /* Format.XYZ_D50 */]: () => new ColorFunction("xyz-d50" /* Format.XYZ_D50 */, [...this.#toXyzd50(), this.#alpha], undefined, this),
        ["xyz-d65" /* Format.XYZ_D65 */]: () => new ColorFunction("xyz-d65" /* Format.XYZ_D65 */, [...ColorConverter.xyzd50ToD65(...this.#toXyzd50()), this.#alpha], undefined, this),
    };
    #toXyzd50() {
        const [r, g, b] = this.#rgbaInternal;
        return ColorConverter.srgbToXyzd50(r, g, b);
    }
    get #alpha() {
        switch (this.format()) {
            case "hexa" /* Format.HEXA */:
            case "shorthexa" /* Format.ShortHEXA */:
            case "rgba" /* Format.RGBA */:
            case "hsla" /* Format.HSLA */:
            case "hwba" /* Format.HWBA */:
                return this.#rgbaInternal[3];
            default:
                return null;
        }
    }
    asLegacyColor() {
        return this;
    }
    constructor(rgba, format, originalText, origin) {
        this.#hslaInternal = undefined;
        this.#hwbaInternal = undefined;
        this.#originalText = originalText || null;
        this.#formatInternal = format;
        this.#origin = origin;
        this.#rgbaInternal = [
            clamp(rgba[0], { min: 0, max: 1 }),
            clamp(rgba[1], { min: 0, max: 1 }),
            clamp(rgba[2], { min: 0, max: 1 }),
            clamp(rgba[3] ?? 1, { min: 0, max: 1 }),
        ];
    }
    static fromHex(hex, text) {
        hex = hex.toLowerCase();
        let format;
        if (hex.length === 3) {
            format = "shorthex" /* Format.ShortHEX */;
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        else if (hex.length === 4) {
            format = "shorthexa" /* Format.ShortHEXA */;
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2) +
                hex.charAt(3) + hex.charAt(3);
        }
        else if (hex.length === 6) {
            format = "hex" /* Format.HEX */;
        }
        else {
            format = "hexa" /* Format.HEXA */;
        }
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        let a = 1;
        if (hex.length === 8) {
            a = parseInt(hex.substring(6, 8), 16) / 255;
        }
        return new Legacy([r / 255, g / 255, b / 255, a], format, text);
    }
    static fromName(name, text) {
        const nickname = name.toLowerCase();
        const rgba = Nicknames.get(nickname);
        if (rgba !== undefined) {
            const color = Legacy.fromRGBA(rgba);
            color.#formatInternal = "nickname" /* Format.Nickname */;
            color.#originalText = text;
            return color;
        }
        return null;
    }
    static fromRGBAFunction(r, g, b, alpha, text) {
        const rgba = [
            parseRgbNumeric(r),
            parseRgbNumeric(g),
            parseRgbNumeric(b),
            alpha ? parseAlphaNumeric(alpha) : 1,
        ];
        if (!Platform.ArrayUtilities.arrayDoesNotContainNullOrUndefined(rgba)) {
            return null;
        }
        return new Legacy(rgba, alpha ? "rgba" /* Format.RGBA */ : "rgb" /* Format.RGB */, text);
    }
    static fromHSLA(h, s, l, alpha, text) {
        const parameters = [
            parseHueNumeric(h),
            parseSatLightNumeric(s),
            parseSatLightNumeric(l),
            alpha ? parseAlphaNumeric(alpha) : 1,
        ];
        if (!Platform.ArrayUtilities.arrayDoesNotContainNullOrUndefined(parameters)) {
            return null;
        }
        const rgba = [];
        hsl2rgb(parameters, rgba);
        return new Legacy(rgba, alpha ? "hsla" /* Format.HSLA */ : "hsl" /* Format.HSL */, text);
    }
    static fromHWB(h, w, b, alpha, text) {
        const parameters = [
            parseHueNumeric(h),
            parseSatLightNumeric(w),
            parseSatLightNumeric(b),
            alpha ? parseAlphaNumeric(alpha) : 1,
        ];
        if (!Platform.ArrayUtilities.arrayDoesNotContainNullOrUndefined(parameters)) {
            return null;
        }
        const rgba = [];
        hwb2rgb(parameters, rgba);
        return new Legacy(rgba, alpha ? "hwba" /* Format.HWBA */ : "hwb" /* Format.HWB */, text);
    }
    static fromRGBA(rgba) {
        return new Legacy([rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3]], "rgba" /* Format.RGBA */);
    }
    static fromHSVA(hsva) {
        const rgba = [];
        hsva2rgba(hsva, rgba);
        return new Legacy(rgba, "hsla" /* Format.HSLA */);
    }
    as(format) {
        if (format === this.format()) {
            return this;
        }
        if (this.#origin) {
            return this.#origin.as(format);
        }
        return this.#conversions[format]();
    }
    format() {
        return this.#formatInternal;
    }
    /** HSLA with components within [0..1]
     */
    hsla() {
        if (this.#hslaInternal) {
            return this.#hslaInternal;
        }
        this.#hslaInternal = rgbaToHsla(this.#rgbaInternal);
        return this.#hslaInternal;
    }
    canonicalHSLA() {
        const hsla = this.hsla();
        return [Math.round(hsla[0] * 360), Math.round(hsla[1] * 100), Math.round(hsla[2] * 100), hsla[3]];
    }
    /** HSVA with components within [0..1]
     */
    hsva() {
        const hsla = this.hsla();
        const h = hsla[0];
        let s = hsla[1];
        const l = hsla[2];
        s *= l < 0.5 ? l : 1 - l;
        return [h, s !== 0 ? 2 * s / (l + s) : 0, (l + s), hsla[3]];
    }
    /** HWBA with components within [0..1]
     */
    hwba() {
        if (this.#hwbaInternal) {
            return this.#hwbaInternal;
        }
        this.#hwbaInternal = rgbaToHwba(this.#rgbaInternal);
        return this.#hwbaInternal;
    }
    canonicalHWBA() {
        const hwba = this.hwba();
        return [Math.round(hwba[0] * 360), Math.round(hwba[1] * 100), Math.round(hwba[2] * 100), hwba[3]];
    }
    hasAlpha() {
        return this.#rgbaInternal[3] !== 1;
    }
    detectHEXFormat() {
        let canBeShort = true;
        for (let i = 0; i < 4; ++i) {
            const c = Math.round(this.#rgbaInternal[i] * 255);
            if (c % 17) {
                canBeShort = false;
                break;
            }
        }
        const hasAlpha = this.hasAlpha();
        if (canBeShort) {
            return hasAlpha ? "shorthexa" /* Format.ShortHEXA */ : "shorthex" /* Format.ShortHEX */;
        }
        return hasAlpha ? "hexa" /* Format.HEXA */ : "hex" /* Format.HEX */;
    }
    asString(format) {
        if (format) {
            return this.as(format).asString();
        }
        if (!format) {
            format = this.#formatInternal;
        }
        if (format === this.#formatInternal && this.#originalText) {
            return this.#originalText;
        }
        function toRgbValue(value) {
            return Math.round(value * 255);
        }
        function toHexValue(value) {
            const hex = Math.round(value * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }
        function toShortHexValue(value) {
            return (Math.round(value * 255) / 17).toString(16);
        }
        switch (format) {
            case "rgb" /* Format.RGB */:
            case "rgba" /* Format.RGBA */: {
                const start = Platform.StringUtilities.sprintf('rgb(%d %d %d', toRgbValue(this.#rgbaInternal[0]), toRgbValue(this.#rgbaInternal[1]), toRgbValue(this.#rgbaInternal[2]));
                if (this.hasAlpha()) {
                    return start + Platform.StringUtilities.sprintf(' / %d%)', Math.round(this.#rgbaInternal[3] * 100));
                }
                return start + ')';
            }
            case "hsl" /* Format.HSL */:
            case "hsla" /* Format.HSLA */: {
                const hsla = this.hsla();
                const start = Platform.StringUtilities.sprintf('hsl(%sdeg %s% %s%', stringifyWithPrecision(hsla[0] * 360), stringifyWithPrecision(hsla[1] * 100), stringifyWithPrecision(hsla[2] * 100));
                if (this.hasAlpha()) {
                    return start + Platform.StringUtilities.sprintf(' / %s%)', stringifyWithPrecision(hsla[3] * 100));
                }
                return start + ')';
            }
            case "hwb" /* Format.HWB */:
            case "hwba" /* Format.HWBA */: {
                const hwba = this.hwba();
                const start = Platform.StringUtilities.sprintf('hwb(%sdeg %s% %s%', stringifyWithPrecision(hwba[0] * 360), stringifyWithPrecision(hwba[1] * 100), stringifyWithPrecision(hwba[2] * 100));
                if (this.hasAlpha()) {
                    return start + Platform.StringUtilities.sprintf(' / %s%)', stringifyWithPrecision(hwba[3] * 100));
                }
                return start + ')';
            }
            case "hexa" /* Format.HEXA */: {
                return Platform.StringUtilities
                    .sprintf('#%s%s%s%s', toHexValue(this.#rgbaInternal[0]), toHexValue(this.#rgbaInternal[1]), toHexValue(this.#rgbaInternal[2]), toHexValue(this.#rgbaInternal[3]))
                    .toLowerCase();
            }
            case "hex" /* Format.HEX */: {
                if (this.hasAlpha()) {
                    return null;
                }
                return Platform.StringUtilities
                    .sprintf('#%s%s%s', toHexValue(this.#rgbaInternal[0]), toHexValue(this.#rgbaInternal[1]), toHexValue(this.#rgbaInternal[2]))
                    .toLowerCase();
            }
            case "shorthexa" /* Format.ShortHEXA */: {
                const hexFormat = this.detectHEXFormat();
                if (hexFormat !== "shorthexa" /* Format.ShortHEXA */ && hexFormat !== "shorthex" /* Format.ShortHEX */) {
                    return null;
                }
                return Platform.StringUtilities
                    .sprintf('#%s%s%s%s', toShortHexValue(this.#rgbaInternal[0]), toShortHexValue(this.#rgbaInternal[1]), toShortHexValue(this.#rgbaInternal[2]), toShortHexValue(this.#rgbaInternal[3]))
                    .toLowerCase();
            }
            case "shorthex" /* Format.ShortHEX */: {
                if (this.hasAlpha()) {
                    return null;
                }
                if (this.detectHEXFormat() !== "shorthex" /* Format.ShortHEX */) {
                    return null;
                }
                return Platform.StringUtilities
                    .sprintf('#%s%s%s', toShortHexValue(this.#rgbaInternal[0]), toShortHexValue(this.#rgbaInternal[1]), toShortHexValue(this.#rgbaInternal[2]))
                    .toLowerCase();
            }
            case "nickname" /* Format.Nickname */: {
                return this.nickname();
            }
        }
        return this.#originalText;
    }
    rgba() {
        return this.#rgbaInternal.slice();
    }
    canonicalRGBA() {
        const rgba = new Array(4);
        for (let i = 0; i < 3; ++i) {
            rgba[i] = Math.round(this.#rgbaInternal[i] * 255);
        }
        rgba[3] = this.#rgbaInternal[3];
        return rgba;
    }
    /** nickname
     */
    nickname() {
        return RGBAToNickname.get(String(this.canonicalRGBA())) || null;
    }
    toProtocolRGBA() {
        const rgba = this.canonicalRGBA();
        const result = { r: rgba[0], g: rgba[1], b: rgba[2], a: undefined };
        if (rgba[3] !== 1) {
            result.a = rgba[3];
        }
        return result;
    }
    invert() {
        const rgba = [];
        rgba[0] = 1 - this.#rgbaInternal[0];
        rgba[1] = 1 - this.#rgbaInternal[1];
        rgba[2] = 1 - this.#rgbaInternal[2];
        rgba[3] = this.#rgbaInternal[3];
        return new Legacy(rgba, "rgba" /* Format.RGBA */);
    }
    setAlpha(alpha) {
        const rgba = this.#rgbaInternal.slice();
        rgba[3] = alpha;
        return new Legacy(rgba, "rgba" /* Format.RGBA */);
    }
    blendWith(fgColor) {
        const rgba = blendColors(fgColor.#rgbaInternal, this.#rgbaInternal);
        return new Legacy(rgba, "rgba" /* Format.RGBA */);
    }
    blendWithAlpha(alpha) {
        const rgba = this.#rgbaInternal.slice();
        rgba[3] *= alpha;
        return new Legacy(rgba, "rgba" /* Format.RGBA */);
    }
    setFormat(format) {
        this.#formatInternal = format;
    }
    equal(other) {
        return this.#rgbaInternal.every((v, i) => v === other.#rgbaInternal[i]) &&
            this.#formatInternal === other.#formatInternal;
    }
}
export const Regex = /((?:rgba?|hsla?|hwba?|lab|lch|oklab|oklch|color)\([^)]+\)|#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3,4}|\b[a-zA-Z]+\b(?!-))/g;
export const ColorMixRegex = /(?:color-mix)\(.+\)/g;
const COLOR_TO_RGBA_ENTRIES = [
    ['aliceblue', [240, 248, 255]],
    ['antiquewhite', [250, 235, 215]],
    ['aqua', [0, 255, 255]],
    ['aquamarine', [127, 255, 212]],
    ['azure', [240, 255, 255]],
    ['beige', [245, 245, 220]],
    ['bisque', [255, 228, 196]],
    ['black', [0, 0, 0]],
    ['blanchedalmond', [255, 235, 205]],
    ['blue', [0, 0, 255]],
    ['blueviolet', [138, 43, 226]],
    ['brown', [165, 42, 42]],
    ['burlywood', [222, 184, 135]],
    ['cadetblue', [95, 158, 160]],
    ['chartreuse', [127, 255, 0]],
    ['chocolate', [210, 105, 30]],
    ['coral', [255, 127, 80]],
    ['cornflowerblue', [100, 149, 237]],
    ['cornsilk', [255, 248, 220]],
    ['crimson', [237, 20, 61]],
    ['cyan', [0, 255, 255]],
    ['darkblue', [0, 0, 139]],
    ['darkcyan', [0, 139, 139]],
    ['darkgoldenrod', [184, 134, 11]],
    ['darkgray', [169, 169, 169]],
    ['darkgrey', [169, 169, 169]],
    ['darkgreen', [0, 100, 0]],
    ['darkkhaki', [189, 183, 107]],
    ['darkmagenta', [139, 0, 139]],
    ['darkolivegreen', [85, 107, 47]],
    ['darkorange', [255, 140, 0]],
    ['darkorchid', [153, 50, 204]],
    ['darkred', [139, 0, 0]],
    ['darksalmon', [233, 150, 122]],
    ['darkseagreen', [143, 188, 143]],
    ['darkslateblue', [72, 61, 139]],
    ['darkslategray', [47, 79, 79]],
    ['darkslategrey', [47, 79, 79]],
    ['darkturquoise', [0, 206, 209]],
    ['darkviolet', [148, 0, 211]],
    ['deeppink', [255, 20, 147]],
    ['deepskyblue', [0, 191, 255]],
    ['dimgray', [105, 105, 105]],
    ['dimgrey', [105, 105, 105]],
    ['dodgerblue', [30, 144, 255]],
    ['firebrick', [178, 34, 34]],
    ['floralwhite', [255, 250, 240]],
    ['forestgreen', [34, 139, 34]],
    ['fuchsia', [255, 0, 255]],
    ['gainsboro', [220, 220, 220]],
    ['ghostwhite', [248, 248, 255]],
    ['gold', [255, 215, 0]],
    ['goldenrod', [218, 165, 32]],
    ['gray', [128, 128, 128]],
    ['grey', [128, 128, 128]],
    ['green', [0, 128, 0]],
    ['greenyellow', [173, 255, 47]],
    ['honeydew', [240, 255, 240]],
    ['hotpink', [255, 105, 180]],
    ['indianred', [205, 92, 92]],
    ['indigo', [75, 0, 130]],
    ['ivory', [255, 255, 240]],
    ['khaki', [240, 230, 140]],
    ['lavender', [230, 230, 250]],
    ['lavenderblush', [255, 240, 245]],
    ['lawngreen', [124, 252, 0]],
    ['lemonchiffon', [255, 250, 205]],
    ['lightblue', [173, 216, 230]],
    ['lightcoral', [240, 128, 128]],
    ['lightcyan', [224, 255, 255]],
    ['lightgoldenrodyellow', [250, 250, 210]],
    ['lightgreen', [144, 238, 144]],
    ['lightgray', [211, 211, 211]],
    ['lightgrey', [211, 211, 211]],
    ['lightpink', [255, 182, 193]],
    ['lightsalmon', [255, 160, 122]],
    ['lightseagreen', [32, 178, 170]],
    ['lightskyblue', [135, 206, 250]],
    ['lightslategray', [119, 136, 153]],
    ['lightslategrey', [119, 136, 153]],
    ['lightsteelblue', [176, 196, 222]],
    ['lightyellow', [255, 255, 224]],
    ['lime', [0, 255, 0]],
    ['limegreen', [50, 205, 50]],
    ['linen', [250, 240, 230]],
    ['magenta', [255, 0, 255]],
    ['maroon', [128, 0, 0]],
    ['mediumaquamarine', [102, 205, 170]],
    ['mediumblue', [0, 0, 205]],
    ['mediumorchid', [186, 85, 211]],
    ['mediumpurple', [147, 112, 219]],
    ['mediumseagreen', [60, 179, 113]],
    ['mediumslateblue', [123, 104, 238]],
    ['mediumspringgreen', [0, 250, 154]],
    ['mediumturquoise', [72, 209, 204]],
    ['mediumvioletred', [199, 21, 133]],
    ['midnightblue', [25, 25, 112]],
    ['mintcream', [245, 255, 250]],
    ['mistyrose', [255, 228, 225]],
    ['moccasin', [255, 228, 181]],
    ['navajowhite', [255, 222, 173]],
    ['navy', [0, 0, 128]],
    ['oldlace', [253, 245, 230]],
    ['olive', [128, 128, 0]],
    ['olivedrab', [107, 142, 35]],
    ['orange', [255, 165, 0]],
    ['orangered', [255, 69, 0]],
    ['orchid', [218, 112, 214]],
    ['palegoldenrod', [238, 232, 170]],
    ['palegreen', [152, 251, 152]],
    ['paleturquoise', [175, 238, 238]],
    ['palevioletred', [219, 112, 147]],
    ['papayawhip', [255, 239, 213]],
    ['peachpuff', [255, 218, 185]],
    ['peru', [205, 133, 63]],
    ['pink', [255, 192, 203]],
    ['plum', [221, 160, 221]],
    ['powderblue', [176, 224, 230]],
    ['purple', [128, 0, 128]],
    ['rebeccapurple', [102, 51, 153]],
    ['red', [255, 0, 0]],
    ['rosybrown', [188, 143, 143]],
    ['royalblue', [65, 105, 225]],
    ['saddlebrown', [139, 69, 19]],
    ['salmon', [250, 128, 114]],
    ['sandybrown', [244, 164, 96]],
    ['seagreen', [46, 139, 87]],
    ['seashell', [255, 245, 238]],
    ['sienna', [160, 82, 45]],
    ['silver', [192, 192, 192]],
    ['skyblue', [135, 206, 235]],
    ['slateblue', [106, 90, 205]],
    ['slategray', [112, 128, 144]],
    ['slategrey', [112, 128, 144]],
    ['snow', [255, 250, 250]],
    ['springgreen', [0, 255, 127]],
    ['steelblue', [70, 130, 180]],
    ['tan', [210, 180, 140]],
    ['teal', [0, 128, 128]],
    ['thistle', [216, 191, 216]],
    ['tomato', [255, 99, 71]],
    ['turquoise', [64, 224, 208]],
    ['violet', [238, 130, 238]],
    ['wheat', [245, 222, 179]],
    ['white', [255, 255, 255]],
    ['whitesmoke', [245, 245, 245]],
    ['yellow', [255, 255, 0]],
    ['yellowgreen', [154, 205, 50]],
    ['transparent', [0, 0, 0, 0]],
];
Platform.DCHECK(() => {
    return COLOR_TO_RGBA_ENTRIES.every(([nickname]) => nickname.toLowerCase() === nickname);
}, 'All color nicknames must be lowercase.');
export const Nicknames = new Map(COLOR_TO_RGBA_ENTRIES);
const RGBAToNickname = new Map(
// Default opacity to 1 if the color only specified 3 channels
COLOR_TO_RGBA_ENTRIES.map(([nickname, [r, g, b, a = 1]]) => {
    return [String([r, g, b, a]), nickname];
}));
const LAYOUT_LINES_HIGHLIGHT_COLOR = [127, 32, 210];
export const PageHighlight = {
    Content: Legacy.fromRGBA([111, 168, 220, .66]),
    ContentLight: Legacy.fromRGBA([111, 168, 220, .5]),
    ContentOutline: Legacy.fromRGBA([9, 83, 148]),
    Padding: Legacy.fromRGBA([147, 196, 125, .55]),
    PaddingLight: Legacy.fromRGBA([147, 196, 125, .4]),
    Border: Legacy.fromRGBA([255, 229, 153, .66]),
    BorderLight: Legacy.fromRGBA([255, 229, 153, .5]),
    Margin: Legacy.fromRGBA([246, 178, 107, .66]),
    MarginLight: Legacy.fromRGBA([246, 178, 107, .5]),
    EventTarget: Legacy.fromRGBA([255, 196, 196, .66]),
    Shape: Legacy.fromRGBA([96, 82, 177, 0.8]),
    ShapeMargin: Legacy.fromRGBA([96, 82, 127, .6]),
    CssGrid: Legacy.fromRGBA([0x4b, 0, 0x82, 1]),
    LayoutLine: Legacy.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, 1]),
    GridBorder: Legacy.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, 1]),
    GapBackground: Legacy.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, .3]),
    GapHatch: Legacy.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, .8]),
    GridAreaBorder: Legacy.fromRGBA([26, 115, 232, 1]),
};
export const SourceOrderHighlight = {
    ParentOutline: Legacy.fromRGBA([224, 90, 183, 1]),
    ChildOutline: Legacy.fromRGBA([0, 120, 212, 1]),
};
export const IsolationModeHighlight = {
    Resizer: Legacy.fromRGBA([222, 225, 230, 1]),
    ResizerHandle: Legacy.fromRGBA([166, 166, 166, 1]),
    Mask: Legacy.fromRGBA([248, 249, 249, 1]),
};
export class Generator {
    #hueSpace;
    #satSpace;
    #lightnessSpace;
    #alphaSpace;
    #colors;
    constructor(hueSpace, satSpace, lightnessSpace, alphaSpace) {
        this.#hueSpace = hueSpace || { min: 0, max: 360, count: undefined };
        this.#satSpace = satSpace || 67;
        this.#lightnessSpace = lightnessSpace || 80;
        this.#alphaSpace = alphaSpace || 1;
        this.#colors = new Map();
    }
    setColorForID(id, color) {
        this.#colors.set(id, color);
    }
    colorForID(id) {
        let color = this.#colors.get(id);
        if (!color) {
            color = this.generateColorForID(id);
            this.#colors.set(id, color);
        }
        return color;
    }
    generateColorForID(id) {
        const hash = Platform.StringUtilities.hashCode(id);
        const h = this.indexToValueInSpace(hash, this.#hueSpace);
        const s = this.indexToValueInSpace(hash >> 8, this.#satSpace);
        const l = this.indexToValueInSpace(hash >> 16, this.#lightnessSpace);
        const a = this.indexToValueInSpace(hash >> 24, this.#alphaSpace);
        const start = `hsl(${h}deg ${s}% ${l}%`;
        if (a !== 1) {
            return `${start} / ${Math.floor(a * 100)}%)`;
        }
        return `${start})`;
    }
    indexToValueInSpace(index, space) {
        if (typeof space === 'number') {
            return space;
        }
        const count = space.count || space.max - space.min;
        index %= count;
        return space.min + Math.floor(index / (count - 1) * (space.max - space.min));
    }
}
//# sourceMappingURL=Color.js.map