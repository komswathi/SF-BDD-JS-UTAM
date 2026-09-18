
import { Driver as _Driver, Element as _Element, Locator as _Locator, BaseUtamElement as _BaseUtamElement, UtamBaseRootPageObject as _UtamBaseRootPageObject, ClickableUtamElement as _ClickableUtamElement, ActionableUtamElement as _ActionableUtamElement } from '@utam/core';

/**
 * Global search instant-results dropdown (search_dialog-instant-results-list / search_dialog-instant-result-item). Root is the outer search_dialog-instant-results-list custom element, which has its own shadow root (confirmed - a scoped search for the listbox only succeeds when crossed via "shadow"). Inside that shadow, the listbox's own children are the individual search_dialog-instant-result-item custom elements, declared as plain "elements" (light DOM relative to the outer shadow root). Each search_dialog-instant-result-item is itself a second, separate LWC custom element with its own shadow root (same naming pattern as the outer list, and confirmed live: a scoped search for div[role='option'] directly under the listbox fails with "can't find elements ... inside its scope element" even though the listbox itself resolves fine) - so div[role='option'] and its label span are declared under a second nested "shadow" block on each item. Since a CSS :has()/text selector cannot cross that second shadow boundary, matching by search text is done in JS (case.creation.page.js) by reading each item's primaryLabel text and comparing, then clicking that item's optionRoot - not via a single parameterized selector.
 * generated from JSON force-app/main/default/global/__utam__/globalSearchResults.utam.json
 * @version 2026-09-18T01:10:13.438Z
 * @author UTAM
 */
export default class GlobalSearchResults extends _UtamBaseRootPageObject {
    constructor(driver: _Driver, element?: _Element, locator?: _Locator);
    getResultItemElements(): Promise<(_BaseUtamElement)[]>;
    /**
     * @param _resultItemElementsIndex index of parent element
     */
    getOptionRoot(_resultItemElementsIndex: number): Promise<(_BaseUtamElement & _ActionableUtamElement & _ClickableUtamElement) | null>;
    /**
     * @param _resultItemElementsIndex index of parent element
     */
    getPrimaryLabel(_resultItemElementsIndex: number): Promise<(_BaseUtamElement) | null>;
}