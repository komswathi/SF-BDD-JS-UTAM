
import { By as _By, ShadowRoot as _ShadowRoot, createUtamMixinCtor as _createUtamMixinCtor, UtamBaseRootPageObject as _UtamBaseRootPageObject, ClickableUtamElement as _ClickableUtamElement, ActionableUtamElement as _ActionableUtamElement } from '@utam/core';

async function _utam_get_listbox(driver, root) {
    let _element = root;
    const _locator = _By.css("div[role='listbox'][aria-label='Suggestions']");
    _element = new _ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_resultItemElementss(driver, root) {
    let _element = await _utam_get_listbox(driver, root);
    const _locator = _By.css("search_dialog-instant-result-item");
    return _element.findElements(_locator);
}

async function _utam_get_optionRoot(driver, root, _resultItemElementsIndex) {
    let _elements = await _utam_index_resultItemElements(driver, root, _resultItemElementsIndex);
    const _locator = _By.css("div[role='option']");
    _elements = new _ShadowRoot(driver, _elements);
    const hasElement = await _elements.containsElement(_locator);
    if (!hasElement) { return null; }
    return _elements.findElement(_locator);
}

async function _utam_get_primaryLabel(driver, root, _resultItemElementsIndex) {
    let _elements = await _utam_index_resultItemElements(driver, root, _resultItemElementsIndex);
    const _locator = _By.css(".instant-result-item__content span[title]");
    _elements = new _ShadowRoot(driver, _elements);
    const hasElement = await _elements.containsElement(_locator);
    if (!hasElement) { return null; }
    return _elements.findElement(_locator);
}

async function _utam_index_resultItemElements(driver, root, _resultItemElementsIndex) {
    let _elements = await _utam_get_resultItemElementss(driver, root);
    if(!_elements || _elements.length <= _resultItemElementsIndex) {
       throw new Error('Could not find element "resultItemElements" with given index!');
    }
   return _elements[_resultItemElementsIndex];
}

/**
 * Global search instant-results dropdown (search_dialog-instant-results-list / search_dialog-instant-result-item). Root is the outer search_dialog-instant-results-list custom element, which has its own shadow root (confirmed - a scoped search for the listbox only succeeds when crossed via "shadow"). Inside that shadow, the listbox's own children are the individual search_dialog-instant-result-item custom elements, declared as plain "elements" (light DOM relative to the outer shadow root). Each search_dialog-instant-result-item is itself a second, separate LWC custom element with its own shadow root (same naming pattern as the outer list, and confirmed live: a scoped search for div[role='option'] directly under the listbox fails with "can't find elements ... inside its scope element" even though the listbox itself resolves fine) - so div[role='option'] and its label span are declared under a second nested "shadow" block on each item. Since a CSS :has()/text selector cannot cross that second shadow boundary, matching by search text is done in JS (case.creation.page.js) by reading each item's primaryLabel text and comparing, then clicking that item's optionRoot - not via a single parameterized selector.
 * generated from JSON force-app/main/default/global/__utam__/globalSearchResults.utam.json
 * @version 2026-09-18T01:10:13.438Z
 * @author UTAM
 */
export default class GlobalSearchResults extends _UtamBaseRootPageObject {
    constructor(driver, element, locator = _By.css("search_dialog-instant-results-list")) {
        super(driver, element, locator);
    }

    async __getRoot() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        return new BaseUtamElement(driver, root);
    }
    
    async __getListbox() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        let element = await _utam_get_listbox(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async getResultItemElements() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        let elements = await _utam_get_resultItemElementss(driver, root);
        elements = elements.map(function _createElement(element) {
                    return new BaseUtamElement(driver, element);
                });
        return elements;
    }
    
    /**
     * @param _resultItemElementsIndex index of parent element
     */
    async getOptionRoot(_resultItemElementsIndex) {
        const driver = this.driver;
        const root = await this.getRootElement();
        const ActionableClickableUtamElement = _createUtamMixinCtor(_ActionableUtamElement, _ClickableUtamElement);
        let element = await _utam_get_optionRoot(driver, root, _resultItemElementsIndex);
        if (!element) { return null; }
        element = new ActionableClickableUtamElement(driver, element);
        return element;
    }
    
    /**
     * @param _resultItemElementsIndex index of parent element
     */
    async getPrimaryLabel(_resultItemElementsIndex) {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        let element = await _utam_get_primaryLabel(driver, root, _resultItemElementsIndex);
        if (!element) { return null; }
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
}