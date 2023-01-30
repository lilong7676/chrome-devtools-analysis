// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as Host from '../../../../core/host/host.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as Diff from '../../../../third_party/diff/diff.js';
import * as UI from '../../legacy.js';
import { FilteredListWidget, Provider, registerProvider } from './FilteredListWidget.js';
import { QuickOpenImpl } from './QuickOpen.js';
const UIStrings = {
    /**
     * @description Message to display if a setting change requires a reload of DevTools
     */
    oneOrMoreSettingsHaveChanged: 'One or more settings have changed which requires a reload to take effect.',
    /**
     * @description Text in Command Menu of the Command Menu
     */
    noCommandsFound: 'No commands found',
    /**
     * @description Text for command prefix of run a command
     */
    run: 'Run',
    /**
     * @description Text for command suggestion of run a command
     */
    command: 'Command',
    /**
     * @description Hint text to indicate that a selected command is deprecated
     */
    deprecated: '— deprecated',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/quick_open/CommandMenu.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let commandMenuInstance;
export class CommandMenu {
    commandsInternal;
    constructor() {
        this.commandsInternal = [];
        this.loadCommands();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!commandMenuInstance || forceNew) {
            commandMenuInstance = new CommandMenu();
        }
        return commandMenuInstance;
    }
    static createCommand(options) {
        const { category, keys, title, shortcut, executeHandler, availableHandler, userActionCode, deprecationWarning } = options;
        let handler = executeHandler;
        if (userActionCode) {
            const actionCode = userActionCode;
            handler = () => {
                Host.userMetrics.actionTaken(actionCode);
                executeHandler();
            };
        }
        if (title === 'Show Issues') {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const cached_handler = handler;
            handler = () => {
                Host.userMetrics.issuesPanelOpenedFrom(Host.UserMetrics.IssueOpener.CommandMenu);
                cached_handler();
            };
        }
        return new Command(category, title, keys, shortcut, handler, availableHandler, deprecationWarning);
    }
    static createSettingCommand(setting, title, value) {
        const category = setting.category();
        if (!category) {
            throw new Error(`Creating '${title}' setting command failed. Setting has no category.`);
        }
        const tags = setting.tags() || '';
        const reloadRequired = Boolean(setting.reloadRequired());
        return CommandMenu.createCommand({
            category: Common.Settings.getLocalizedSettingsCategory(category),
            keys: tags,
            title,
            shortcut: '',
            executeHandler: () => {
                if (setting.deprecation?.disabled &&
                    (!setting.deprecation?.experiment || setting.deprecation.experiment.isEnabled())) {
                    void Common.Revealer.reveal(setting);
                    return;
                }
                setting.set(value);
                if (reloadRequired) {
                    UI.InspectorView.InspectorView.instance().displayReloadRequiredWarning(i18nString(UIStrings.oneOrMoreSettingsHaveChanged));
                }
            },
            availableHandler,
            userActionCode: undefined,
            deprecationWarning: setting.deprecation?.warning,
        });
        function availableHandler() {
            return setting.get() !== value;
        }
    }
    static createActionCommand(options) {
        const { action, userActionCode } = options;
        const shortcut = UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutTitleForAction(action.id()) || '';
        return CommandMenu.createCommand({
            category: action.category(),
            keys: action.tags() || '',
            title: action.title() || '',
            shortcut,
            executeHandler: action.execute.bind(action),
            userActionCode,
            availableHandler: undefined,
        });
    }
    static createRevealViewCommand(options) {
        const { title, tags, category, userActionCode, id } = options;
        return CommandMenu.createCommand({
            category,
            keys: tags,
            title,
            shortcut: '',
            executeHandler: UI.ViewManager.ViewManager.instance().showView.bind(UI.ViewManager.ViewManager.instance(), id, /* userGesture */ true),
            userActionCode,
            availableHandler: undefined,
        });
    }
    loadCommands() {
        const locations = new Map();
        for (const { category, name } of UI.ViewManager.getRegisteredLocationResolvers()) {
            if (category && name) {
                locations.set(name, category);
            }
        }
        const views = UI.ViewManager.getRegisteredViewExtensions();
        for (const view of views) {
            const viewLocation = view.location();
            const category = viewLocation && locations.get(viewLocation);
            if (!category) {
                continue;
            }
            const options = {
                title: view.commandPrompt(),
                tags: view.tags() || '',
                category,
                userActionCode: undefined,
                id: view.viewId(),
            };
            this.commandsInternal.push(CommandMenu.createRevealViewCommand(options));
        }
        // Populate allowlisted settings.
        const settingsRegistrations = Common.Settings.getRegisteredSettings();
        for (const settingRegistration of settingsRegistrations) {
            const options = settingRegistration.options;
            if (!options || !settingRegistration.category) {
                continue;
            }
            for (const pair of options) {
                const setting = Common.Settings.Settings.instance().moduleSetting(settingRegistration.settingName);
                this.commandsInternal.push(CommandMenu.createSettingCommand(setting, pair.title(), pair.value));
            }
        }
    }
    commands() {
        return this.commandsInternal;
    }
}
export class CommandMenuProvider extends Provider {
    commands;
    constructor(commandsForTest = []) {
        super();
        this.commands = commandsForTest;
    }
    attach() {
        const allCommands = CommandMenu.instance().commands();
        // Populate allowlisted actions.
        const actions = UI.ActionRegistry.ActionRegistry.instance().availableActions();
        for (const action of actions) {
            const category = action.category();
            if (!category) {
                continue;
            }
            const options = { action, userActionCode: undefined };
            this.commands.push(CommandMenu.createActionCommand(options));
        }
        for (const command of allCommands) {
            if (command.available()) {
                this.commands.push(command);
            }
        }
        this.commands = this.commands.sort(commandComparator);
        function commandComparator(left, right) {
            const cats = Platform.StringUtilities.compare(left.category(), right.category());
            return cats ? cats : Platform.StringUtilities.compare(left.title(), right.title());
        }
    }
    detach() {
        this.commands = [];
    }
    itemCount() {
        return this.commands.length;
    }
    itemKeyAt(itemIndex) {
        return this.commands[itemIndex].key();
    }
    itemScoreAt(itemIndex, query) {
        const command = this.commands[itemIndex];
        let score = Diff.Diff.DiffWrapper.characterScore(query.toLowerCase(), command.title().toLowerCase());
        // Score panel/drawer reveals above regular actions.
        if (command.category().startsWith('Panel')) {
            score += 2;
        }
        else if (command.category().startsWith('Drawer')) {
            score += 1;
        }
        return score;
    }
    renderItem(itemIndex, query, titleElement, subtitleElement) {
        const command = this.commands[itemIndex];
        titleElement.removeChildren();
        UI.UIUtils.createTextChild(titleElement, command.title());
        FilteredListWidget.highlightRanges(titleElement, query, true);
        subtitleElement.textContent = command.shortcut();
        const deprecationWarning = command.deprecationWarning();
        if (deprecationWarning) {
            const deprecatedTagElement = titleElement.parentElement?.createChild('span', 'deprecated-tag');
            if (deprecatedTagElement) {
                deprecatedTagElement.textContent = i18nString(UIStrings.deprecated);
                deprecatedTagElement.title = deprecationWarning;
            }
        }
        const tagElement = titleElement.parentElement?.parentElement?.createChild('span', 'tag');
        if (!tagElement) {
            return;
        }
        const index = Platform.StringUtilities.hashCode(command.category()) % MaterialPaletteColors.length;
        tagElement.style.backgroundColor = MaterialPaletteColors[index];
        tagElement.style.color = 'var(--color-background)';
        tagElement.textContent = command.category();
    }
    selectItem(itemIndex, _promptValue) {
        if (itemIndex === null) {
            return;
        }
        this.commands[itemIndex].execute();
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.SelectCommandFromCommandMenu);
    }
    notFoundText() {
        return i18nString(UIStrings.noCommandsFound);
    }
}
export const MaterialPaletteColors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#9E9E9E',
    '#607D8B',
];
export class Command {
    categoryInternal;
    titleInternal;
    keyInternal;
    shortcutInternal;
    executeHandler;
    availableHandler;
    deprecationWarningInternal;
    constructor(category, title, key, shortcut, executeHandler, availableHandler, deprecationWarning) {
        this.categoryInternal = category;
        this.titleInternal = title;
        this.keyInternal = category + '\0' + title + '\0' + key;
        this.shortcutInternal = shortcut;
        this.executeHandler = executeHandler;
        this.availableHandler = availableHandler;
        this.deprecationWarningInternal = deprecationWarning;
    }
    category() {
        return this.categoryInternal;
    }
    title() {
        return this.titleInternal;
    }
    key() {
        return this.keyInternal;
    }
    shortcut() {
        return this.shortcutInternal;
    }
    available() {
        return this.availableHandler ? this.availableHandler() : true;
    }
    execute() {
        this.executeHandler();
    }
    deprecationWarning() {
        return this.deprecationWarningInternal;
    }
}
let showActionDelegateInstance;
export class ShowActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!showActionDelegateInstance || forceNew) {
            showActionDelegateInstance = new ShowActionDelegate();
        }
        return showActionDelegateInstance;
    }
    handleAction(_context, _actionId) {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
        QuickOpenImpl.show('>');
        return true;
    }
}
registerProvider({
    prefix: '>',
    iconName: 'ic_command_run_command',
    provider: () => Promise.resolve(new CommandMenuProvider()),
    titlePrefix: () => i18nString(UIStrings.run),
    titleSuggestion: () => i18nString(UIStrings.command),
});
//# sourceMappingURL=CommandMenu.js.map