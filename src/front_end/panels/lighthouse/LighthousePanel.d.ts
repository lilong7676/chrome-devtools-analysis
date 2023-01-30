import * as UI from '../../ui/legacy/legacy.js';
import { Events, LighthouseController } from './LighthouseController.js';
import { ProtocolService } from './LighthouseProtocolService.js';
export declare class LighthousePanel extends UI.Panel.Panel {
    private readonly protocolService;
    private readonly controller;
    private readonly startView;
    private readonly statusView;
    private readonly timespanView;
    private warningText;
    private unauditableExplanation;
    private readonly cachedRenderedReports;
    private readonly dropTarget;
    private readonly auditResultsElement;
    private clearButton;
    private newButton;
    private reportSelector;
    private settingsPane;
    private rightToolbar;
    private showSettingsPaneSetting;
    private stateBefore?;
    private isLHAttached?;
    private currentLighthouseRun?;
    private constructor();
    static instance(opts?: {
        forceNew: boolean;
        protocolService: ProtocolService;
        controller: LighthouseController;
    }): LighthousePanel;
    static getEvents(): typeof Events;
    private onLighthouseTimespanStart;
    private onLighthouseTimespanEnd;
    private onLighthouseStart;
    private onLighthouseCancel;
    private refreshWarningsUI;
    private refreshStartAuditUI;
    private refreshStatusUI;
    private refreshToolbarUI;
    private clearAll;
    private renderToolbar;
    private updateSettingsPaneVisibility;
    private toggleSettingsDisplay;
    private renderStartView;
    private renderStatusView;
    private beforePrint;
    private afterPrint;
    private renderReport;
    private buildReportUI;
    private handleDrop;
    private loadedFromFile;
    private recordMetrics;
    private startLighthouse;
    private collectLighthouseResults;
    private cancelLighthouse;
    /**
     * We set the device emulation on the DevTools-side for two reasons:
     * 1. To workaround some odd device metrics emulation bugs like occuluding viewports
     * 2. To get the attractive device outline
     */
    private setupEmulationAndProtocolConnection;
    private restoreEmulationAndProtocolConnection;
    wasShown(): void;
}
