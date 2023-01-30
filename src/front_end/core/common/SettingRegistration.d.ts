import type * as Platform from '../platform/platform.js';
import * as Root from '../root/root.js';
import { type SettingStorageType } from './Settings.js';
export declare function registerSettingExtension(registration: SettingRegistration): void;
export declare function getRegisteredSettings(): Array<SettingRegistration>;
export declare function registerSettingsForTest(settings: Array<SettingRegistration>, forceReset?: boolean): void;
export declare function resetSettings(): void;
export declare function maybeRemoveSettingExtension(settingName: string): boolean;
export declare enum SettingCategory {
    NONE = "",
    ELEMENTS = "ELEMENTS",
    APPEARANCE = "APPEARANCE",
    SOURCES = "SOURCES",
    NETWORK = "NETWORK",
    PERFORMANCE = "PERFORMANCE",
    CONSOLE = "CONSOLE",
    PERSISTENCE = "PERSISTENCE",
    DEBUGGER = "DEBUGGER",
    GLOBAL = "GLOBAL",
    RENDERING = "RENDERING",
    GRID = "GRID",
    MOBILE = "MOBILE",
    EMULATION = "EMULATION",
    MEMORY = "MEMORY",
    EXTENSIONS = "EXTENSIONS",
    ADORNER = "ADORNER",
    SYNC = "SYNC"
}
export declare function getLocalizedSettingsCategory(category: SettingCategory): string | Platform.UIString.LocalizedString;
export declare enum SettingType {
    ARRAY = "array",
    REGEX = "regex",
    ENUM = "enum",
    BOOLEAN = "boolean"
}
export interface RegExpSettingItem {
    /**
     * A regular expression matched against URLs for ignore listing.
     */
    pattern: string;
    /**
     * If true, ignore this rule.
     */
    disabled?: boolean;
    /**
     * When a rule is disabled due to requesting through a script's context menu
     * that it no longer be ignore listed, this field is set to the URL of that
     * script, so that if the user requests through the same context menu to
     * enable ignore listing, the rule can be reenabled.
     */
    disabledForUrl?: Platform.DevToolsPath.UrlString;
}
export interface SettingRegistration {
    /**
     * The category with which the setting is displayed in the UI.
     */
    category?: SettingCategory;
    /**
     * Used to sort on screen the settings that belong to the same category.
     */
    order?: number;
    /**
     * The title with which the setting is shown on screen.
     */
    title?: () => Platform.UIString.LocalizedString;
    /**
     * The title with which the setting is shown on screen, if the platform running DevTools is 'mac'.
     * If not set, the 'title' field will be used instead.
     */
    titleMac?: () => Platform.UIString.LocalizedString;
    /**
     * The identifier of the setting.
     */
    settingName: string;
    /**
     * Determines how the possible values of the setting are expressed.
     *
     * - If the setting can only be enabled and disabled use BOOLEAN
     * - If the setting has a list of possible values use ENUM
     * - If each setting value is a set of objects use ARRAY
     * - If the setting value is a regular expression use REGEX
     */
    settingType: SettingType;
    /**
     * The value set by default to the setting.
     */
    defaultValue: unknown;
    /**
     * Words used to find a setting in the Command Menu.
     */
    tags?: Array<() => Platform.UIString.LocalizedString>;
    /**
     * The possible values the setting can have, each with a description composed of a title and an optional text.
     */
    options?: Array<SettingExtensionOption>;
    /**
     * Whether DevTools must be reloaded for a change in the setting to take effect.
     */
    reloadRequired?: boolean;
    /**
     * Determines if the setting value is stored in the global, local or session storage.
     */
    storageType?: SettingStorageType;
    /**
     * A condition that, when present in the queryParamsObject of Runtime, constraints the value
     * of the setting to be changed only if the user set it.
     */
    userActionCondition?: string;
    /**
     * The name of the experiment a setting is associated with. Enabling and disabling the declared
     * experiment will enable and disable the setting respectively.
     */
    experiment?: Root.Runtime.ExperimentName;
    /**
     * A condition represented as a string the setting's availability depends on. Conditions come
     * from the queryParamsObject defined in Runtime and just as the experiment field, they determine the availability
     * of the setting. A condition can be negated by prepending a ‘!’ to the value of the condition
     * property and in that case the behaviour of the setting's availability will be inverted.
     */
    condition?: Root.Runtime.ConditionName;
    /**
     * If a setting is deprecated, define this notice to show an appropriate warning according to the `warning` propertiy.
     * If `disabled` is set, the setting will be disabled in the settings UI. In that case, `experiment` optionally can be
     * set to link to an experiment (by experiment name). The information icon in the settings UI can then be clicked to
     * jump to the experiment. If a setting is not disabled, the experiment entry will be ignored.
     */
    deprecationNotice?: {
        disabled: boolean;
        warning: () => Platform.UIString.LocalizedString;
        experiment?: string;
    };
}
interface LocalizedSettingExtensionOption {
    value: boolean | string;
    title: () => Platform.UIString.LocalizedString;
    text?: () => Platform.UIString.LocalizedString;
    raw?: false;
}
interface RawSettingExtensionOption {
    value: boolean | string;
    title: () => Platform.UIString.LocalizedString;
    /**
     * Text used to describe the option. Must be localized if 'raw' is false.
     */
    text?: string;
    raw: true;
}
export type SettingExtensionOption = LocalizedSettingExtensionOption | RawSettingExtensionOption;
export {};
