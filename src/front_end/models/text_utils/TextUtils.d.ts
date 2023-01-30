import { SearchMatch } from './ContentProvider.js';
export declare const Utils: {
    readonly _keyValueFilterRegex: RegExp;
    readonly _regexFilterRegex: RegExp;
    readonly _textFilterRegex: RegExp;
    readonly _SpaceCharRegex: RegExp;
    /**
     * @enum {string}
     */
    readonly Indent: {
        TwoSpaces: '  ';
        FourSpaces: '    ';
        EightSpaces: '        ';
        TabCharacter: '\t';
    };
    isStopChar: (char: string) => boolean;
    isWordChar: (char: string) => boolean;
    isSpaceChar: (char: string) => boolean;
    isWord: (word: string) => boolean;
    isOpeningBraceChar: (char: string) => boolean;
    isClosingBraceChar: (char: string) => boolean;
    isBraceChar: (char: string) => boolean;
    textToWords: (text: string, isWordChar: (arg0: string) => boolean, wordCallback: (arg0: string) => void) => void;
    lineIndent: (line: string) => string;
    isUpperCase: (text: string) => boolean;
    isLowerCase: (text: string) => boolean;
    splitStringByRegexes(text: string, regexes: RegExp[]): {
        value: string;
        position: number;
        regexIndex: number;
        captureGroups: Array<string | undefined>;
    }[];
};
export declare class FilterParser {
    private readonly keys;
    constructor(keys: string[]);
    static cloneFilter(filter: ParsedFilter): ParsedFilter;
    parse(query: string): ParsedFilter[];
}
export declare class BalancedJSONTokenizer {
    private readonly callback;
    private index;
    private balance;
    private buffer;
    private findMultiple;
    private closingDoubleQuoteRegex;
    private lastBalancedIndex?;
    constructor(callback: (arg0: string) => void, findMultiple?: boolean);
    write(chunk: string): boolean;
    private reportBalanced;
    remainder(): string;
}
/**
 * Heuristic to check whether a given text was likely minified. Intended to
 * be used for HTML, CSS, and JavaScript inputs.
 *
 * A text is considered to be the result of minification if the average
 * line length for the whole text is 80 characters or more.
 *
 * @param text The input text to check.
 * @returns
 */
export declare const isMinified: (text: string) => boolean;
export declare const performSearchInContent: (content: string, query: string, caseSensitive: boolean, isRegex: boolean) => SearchMatch[];
export interface ParsedFilter {
    key?: string;
    text?: string | null;
    regex?: RegExp;
    negative: boolean;
}
