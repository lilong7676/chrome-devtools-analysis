import * as UI from '../../ui/legacy/legacy.js';
import { type LighthouseController } from './LighthouseController.js';
export declare class StartView extends UI.Widget.Widget {
    private controller;
    private readonly settingsToolbarInternal;
    private startButton;
    private helpText?;
    private warningText?;
    private checkboxes;
    changeFormMode?: (mode: string) => void;
    constructor(controller: LighthouseController);
    private populateRuntimeSettingAsRadio;
    private populateRuntimeSettingAsToolbarCheckbox;
    private populateRuntimeSettingAsToolbarDropdown;
    private populateFormControls;
    private render;
    private populateStartButton;
    refresh(): void;
    onResize(): void;
    focusStartButton(): void;
    setStartButtonEnabled(isEnabled: boolean): void;
    setUnauditableExplanation(text: string | null): void;
    setWarningText(text: string | null): void;
    wasShown(): void;
    settingsToolbar(): UI.Toolbar.Toolbar;
}
