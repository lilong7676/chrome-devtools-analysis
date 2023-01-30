import * as Platform from '../../../core/platform/platform.js';
export declare function findNextNodeForKeyboardNavigation(target: HTMLElement, key: Platform.KeyboardUtilities.ArrowKey, setGroupExpandedStateCallback: (detailsElement: HTMLDetailsElement, expanded: boolean) => Promise<unknown>): Promise<HTMLElement | null>;
