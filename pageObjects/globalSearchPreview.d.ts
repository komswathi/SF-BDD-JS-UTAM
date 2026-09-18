
import { Driver as _Driver, Element as _Element, Locator as _Locator, BaseUtamElement as _BaseUtamElement, UtamBaseRootPageObject as _UtamBaseRootPageObject, ClickableUtamElement as _ClickableUtamElement, ActionableUtamElement as _ActionableUtamElement } from '@utam/core';

/**
 * Global search instant-results record preview pane - the right-hand panel showing the currently-selected/focused suggestion's record. Not modeled by any predefined salesforce-pageobjects type. Confirmed via live DOM: rendered in div#preview (a stable id, referenced by aria-controls on search_dialog-instant-results-list), alongside the results listbox (globalSearchResults.utam.json) in the same assistantPanel dialog overlay. recordLink is a genuine &lt;a href&gt; to the record's URL (data-refid='recordId') - clicking it actually navigates, unlike the results-list item, which per live testing only updates the preview/selection.
 * generated from JSON force-app/main/default/global/__utam__/globalSearchPreview.utam.json
 * @version 2026-09-18T01:10:13.434Z
 * @author UTAM
 */
declare class GlobalSearchPreview extends _UtamBaseRootPageObject {
    constructor(driver: _Driver, element?: _Element, locator?: _Locator);
    getRecordLink(): Promise<(_BaseUtamElement & _ActionableUtamElement & _ClickableUtamElement) | null>;
}
export = GlobalSearchPreview;
