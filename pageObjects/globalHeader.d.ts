
import { Driver as _Driver, Element as _Element, Locator as _Locator, BaseUtamElement as _BaseUtamElement, UtamBaseRootPageObject as _UtamBaseRootPageObject, ClickableUtamElement as _ClickableUtamElement, ActionableUtamElement as _ActionableUtamElement } from '@utam/core';

/**
 * Global header search button, corrected for the current Lightning UI markup. The predefined salesforce-pageobjects Header PO (global/pageObjects/header) targets a legacy selector ([data-key=search].forceHeaderButtonDeprecated) that no longer exists in this org's rendered header (confirmed against live DOM). Deliberately does NOT model the search input here: lightning-input.saInput (the real Search Assistant Input LWC that appears once the box expands) is not actually nested inside .oneHeader's DOM subtree - a click-intercepted error showed WebDriver's raw hit-testing finding it at the button's screen position while a .oneHeader-scoped lookup never found it, which only makes sense if it renders elsewhere (an overlay). It is loaded separately in case.creation.page.js via an injected page-wide locator instead.
 * generated from JSON force-app/main/default/global/__utam__/globalHeader.utam.json
 * @version 2026-09-18T01:10:13.422Z
 * @author UTAM
 */
declare class GlobalHeader extends _UtamBaseRootPageObject {
    constructor(driver: _Driver, element?: _Element, locator?: _Locator);
    getSearchButton(): Promise<(_BaseUtamElement & _ActionableUtamElement & _ClickableUtamElement)>;
}
export = GlobalHeader;
