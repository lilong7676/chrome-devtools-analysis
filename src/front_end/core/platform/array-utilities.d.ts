export declare const removeElement: <T>(array: T[], element: T, firstOnly?: boolean) => boolean;
type NumberComparator = (a: number, b: number) => number;
export declare function sortRange(array: number[], comparator: NumberComparator, leftBound: number, rightBound: number, sortWindowLeft: number, sortWindowRight: number): number[];
export declare const binaryIndexOf: <T, S>(array: T[], value: S, comparator: (a: S, b: T) => number) => number;
export declare const intersectOrdered: <T>(array1: T[], array2: T[], comparator: (a: T, b: T) => number) => T[];
export declare const mergeOrdered: <T>(array1: T[], array2: T[], comparator: (a: T, b: T) => number) => T[];
export declare const DEFAULT_COMPARATOR: (a: string | number, b: string | number) => number;
/**
 * Return index of the leftmost element that is equal or greater
 * than the specimen object. If there's no such element (i.e. all
 * elements are smaller than the specimen) returns right bound.
 * The function works for sorted array.
 * When specified, |left| (inclusive) and |right| (exclusive) indices
 * define the search window.
 */
export declare function lowerBound<T>(array: Uint32Array | Int32Array, needle: T, comparator: (needle: T, b: number) => number, left?: number, right?: number): number;
export declare function lowerBound<S, T>(array: S[], needle: T, comparator: (needle: T, b: S) => number, left?: number, right?: number): number;
/**
 * Return index of the leftmost element that is greater
 * than the specimen object. If there's no such element (i.e. all
 * elements are smaller or equal to the specimen) returns right bound.
 * The function works for sorted array.
 * When specified, |left| (inclusive) and |right| (exclusive) indices
 * define the search window.
 */
export declare function upperBound<T>(array: Uint32Array, needle: T, comparator: (needle: T, b: number) => number, left?: number, right?: number): number;
export declare function upperBound<S, T>(array: S[], needle: T, comparator: (needle: T, b: S) => number, left?: number, right?: number): number;
/**
 * Obtains the first item in the array that satisfies the predicate function.
 * So, for example, if the array was arr = [2, 4, 6, 8, 10], and you are looking for
 * the first item arr[i] such that arr[i] > 5 you would be returned 2, because
 * array[2] is 6, the first item in the array that satisfies the
 * predicate function.
 *
 * Please note: this presupposes that the array is already ordered.
 */
export declare function nearestIndexFromBeginning<T>(arr: T[], predicate: (arrayItem: T) => boolean): number | null;
/**
 * Obtains the last item in the array that satisfies the predicate function.
 * So, for example, if the array was arr = [2, 4, 6, 8, 10], and you are looking for
 * the last item arr[i] such that arr[i] < 5 you would be returned 1, because
 * arr[1] is 4, the last item in the array that satisfies the
 * predicate function.
 *
 * Please note: this presupposes that the array is already ordered.
 */
export declare function nearestIndexFromEnd<T>(arr: T[], predicate: (arrayItem: T) => boolean): number | null;
export declare function arrayDoesNotContainNullOrUndefined<T>(arr: (T | null | undefined)[]): arr is T[];
export {};
