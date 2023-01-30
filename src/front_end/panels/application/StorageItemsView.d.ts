import * as UI from '../../ui/legacy/legacy.js';
export declare class StorageItemsView extends UI.Widget.VBox {
    private filterRegex;
    readonly refreshButton: UI.Toolbar.ToolbarButton;
    private readonly mainToolbar;
    readonly filterItem: UI.Toolbar.ToolbarInput;
    readonly deleteAllButton: UI.Toolbar.ToolbarButton;
    readonly deleteSelectedButton: UI.Toolbar.ToolbarButton;
    constructor(_title: string, _filterName: string);
    setDeleteAllTitle(title: string): void;
    setDeleteAllGlyph(glyph: string): void;
    appendToolbarItem(item: UI.Toolbar.ToolbarItem): void;
    private addButton;
    private filterChanged;
    filter<T>(items: T[], keyFunction: (arg0: T) => string): T[];
    hasFilter(): boolean;
    wasShown(): void;
    setCanDeleteAll(enabled: boolean): void;
    setCanDeleteSelected(enabled: boolean): void;
    setCanRefresh(enabled: boolean): void;
    setCanFilter(enabled: boolean): void;
    deleteAllItems(): void;
    deleteSelectedItem(): void;
    refreshItems(): void;
}
