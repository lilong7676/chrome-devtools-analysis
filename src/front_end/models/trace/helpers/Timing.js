// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as Types from '../types/types.js';
export const millisecondsToMicroseconds = (value) => Types.Timing.MicroSeconds(value * 1000);
export const secondsToMilliseconds = (value) => Types.Timing.MilliSeconds(value * 1000);
export const secondsToMicroseconds = (value) => millisecondsToMicroseconds(secondsToMilliseconds(value));
export function detectBestTimeUnit(timeInMicroseconds) {
    if (timeInMicroseconds < 1000) {
        return 0 /* Types.Timing.TimeUnit.MICROSECONDS */;
    }
    const timeInMilliseconds = timeInMicroseconds / 1000;
    if (timeInMilliseconds < 1000) {
        return 1 /* Types.Timing.TimeUnit.MILLISECONDS */;
    }
    const timeInSeconds = timeInMilliseconds / 1000;
    if (timeInSeconds < 60) {
        return 2 /* Types.Timing.TimeUnit.SECONDS */;
    }
    return 3 /* Types.Timing.TimeUnit.MINUTES */;
}
const defaultFormatOptions = {
    style: 'unit',
    unit: 'millisecond',
    unitDisplay: 'narrow',
};
// Create a bunch of common formatters up front, so that we're not creating
// them repeatedly during rendering.
const serialize = (value) => JSON.stringify(value);
const formatterFactory = (key) => {
    return new Intl.NumberFormat(navigator.language, key ? JSON.parse(key) : {});
};
const formatters = new Map();
// Microsecond Formatter.
Platform.MapUtilities.getWithDefault(formatters, serialize({ style: 'decimal' }), formatterFactory);
// Millisecond Formatter
Platform.MapUtilities.getWithDefault(formatters, serialize(defaultFormatOptions), formatterFactory);
// Second Formatter
Platform.MapUtilities.getWithDefault(formatters, serialize({ ...defaultFormatOptions, unit: 'second' }), formatterFactory);
// Minute Formatter
Platform.MapUtilities.getWithDefault(formatters, serialize({ ...defaultFormatOptions, unit: 'minute' }), formatterFactory);
export function formatMicrosecondsTime(timeInMicroseconds, opts = {}) {
    if (!opts.format) {
        opts.format = detectBestTimeUnit(timeInMicroseconds);
    }
    const timeInMilliseconds = timeInMicroseconds / 1000;
    const timeInSeconds = timeInMilliseconds / 1000;
    const formatterOpts = { ...defaultFormatOptions, ...opts };
    switch (opts.format) {
        case 0 /* Types.Timing.TimeUnit.MICROSECONDS */: {
            const formatter = Platform.MapUtilities.getWithDefault(formatters, serialize({ style: 'decimal' }), formatterFactory);
            return `${formatter.format(timeInMicroseconds)}??s`;
        }
        case 1 /* Types.Timing.TimeUnit.MILLISECONDS */: {
            const formatter = Platform.MapUtilities.getWithDefault(formatters, serialize(formatterOpts), formatterFactory);
            return formatter.format(timeInMilliseconds);
        }
        case 2 /* Types.Timing.TimeUnit.SECONDS */: {
            const formatter = Platform.MapUtilities.getWithDefault(formatters, serialize({ ...formatterOpts, unit: 'second' }), formatterFactory);
            return formatter.format(timeInSeconds);
        }
        default: {
            // Switch to mins & seconds.
            const minuteFormatter = Platform.MapUtilities.getWithDefault(formatters, serialize({ ...formatterOpts, unit: 'minute' }), formatterFactory);
            const secondFormatter = Platform.MapUtilities.getWithDefault(formatters, serialize({ ...formatterOpts, unit: 'second' }), formatterFactory);
            const timeInMinutes = timeInSeconds / 60;
            const [mins, divider, fraction] = minuteFormatter.formatToParts(timeInMinutes);
            let seconds = 0;
            if (divider && fraction) {
                // Convert the fraction value (a string) to the nearest second.
                seconds = Math.round(Number(`0.${fraction.value}`) * 60);
            }
            return `${minuteFormatter.format(Number(mins.value))} ${secondFormatter.format(seconds)}`;
        }
    }
}
//# sourceMappingURL=Timing.js.map