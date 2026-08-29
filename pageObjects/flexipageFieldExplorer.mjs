
import { By as _By, createUtamMixinCtor as _createUtamMixinCtor, createInstance as _createInstance, UtamBaseRootPageObject as _UtamBaseRootPageObject } from '@utam/core';
import _RecordHomeSingleColNoHeaderTemplateDesktop2 from 'salesforce-pageobjects/flexipage/pageObjects/recordHomeSingleColNoHeaderTemplateDesktop2';
import _Component2 from 'salesforce-pageobjects/flexipage/pageObjects/component2';
import _FieldSection2 from 'salesforce-pageobjects/flexipage/pageObjects/fieldSection2';
import _RecordField from 'salesforce-pageobjects/record/flexipage/pageObjects/recordField';
import _RecordPicklist from 'salesforce-pageobjects/records/pageObjects/recordPicklist';

async function _utam_get_actionBody(driver, root) {
    let _element = root;
    const _locator = _By.css(".actionBody");
    return _element.findElement(_locator);
}

async function _utam_get_recordHome(driver, root) {
    let _element = await _utam_get_actionBody(driver, root);
    const _locator = _By.css("flexipage-record-home-single-col-no-header-template-desktop2");
    return _element.findElement(_locator);
}

async function _utam_get_componentss(driver, root) {
    let _element = await _utam_get_actionBody(driver, root);
    const _locator = _By.css("flexipage-component2");
    return _element.findElements(_locator);
}

async function _utam_get_fieldSectionss(driver, root) {
    let _element = await _utam_get_actionBody(driver, root);
    const _locator = _By.css("flexipage-field-section2");
    return _element.findElements(_locator);
}

async function _utam_get_fieldSectionByIndex(driver, root, sectionIndex) {
    let _element = await _utam_get_actionBody(driver, root);
    const _locator = _By.css("flexipage-field-section2:nth-of-type(" + sectionIndex + ")");
    const hasElement = await _element.containsElement(_locator);
    if (!hasElement) { return null; }
    return _element.findElement(_locator);
}

async function _utam_get_sectionRecordFieldss(driver, root, sectionIndex) {
    let _element = await _utam_get_fieldSectionByIndex(driver, root, sectionIndex);
    if (!_element) { return null; }
    const _locator = _By.css("record_flexipage-record-field");
    return _element.findElements(_locator);
}

async function _utam_get_recordFieldss(driver, root) {
    let _element = await _utam_get_actionBody(driver, root);
    const _locator = _By.css("record_flexipage-record-field");
    return _element.findElements(_locator);
}

async function _utam_get_fieldByApiName(driver, root, apiName) {
    let _element = await _utam_get_actionBody(driver, root);
    const _locator = _By.css("record_flexipage-record-field div[data-target-selection-name=\"" + apiName + "\"]");
    const hasElement = await _element.containsElement(_locator);
    if (!hasElement) { return null; }
    return _element.findElement(_locator);
}

async function _utam_get_picklistByApiName(driver, root, apiName) {
    let _element = await _utam_get_actionBody(driver, root);
    const _locator = _By.css("record_flexipage-record-field div[data-target-selection-name=\"" + apiName + "\"] [slot=\"input\"] records-record-picklist");
    const hasElement = await _element.containsElement(_locator);
    if (!hasElement) { return null; }
    return _element.findElement(_locator);
}

/**
 * Traverses the flexipage rendering family (record detail/view pages) from the Aura action wrapper down to individual record_flexipage-record-field elements: .oneRecordActionWrapper -&gt; flexipage-record-home-single-col-no-header-template-desktop2 -&gt; flexipage-component2 -&gt; flexipage-field-section2 -&gt; record_flexipage-record-field. Uses predefined salesforce-pageobjects types (utam-flexipage/, utam-record-flexipage/) matching the tags shown in the DOM screenshot. SHADOW STATUS FOR THESE HOPS IS UNVERIFIED - run traceHierarchy() (see memory: shadow-dom-diagnostics) against the live page before trusting this compiles+works; plain 'elements' is used below as a starting guess only, matching how .actionBody's own children are declared in recordActionWrapper.utam.json.
 * generated from JSON force-app/main/default/cases/__utam__/flexipageFieldExplorer.utam.json
 * @version 2026-08-27T14:25:55.903Z
 * @author UTAM
 */
export default class FlexipageFieldExplorer extends _UtamBaseRootPageObject {
    constructor(driver, element, locator = _By.css(".oneRecordActionWrapper")) {
        super(driver, element, locator);
    }

    async __getRoot() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        return new BaseUtamElement(driver, root);
    }
    
    async __getActionBody() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        let element = await _utam_get_actionBody(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async getRecordHome() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_recordHome(driver, root);
        element = await _createInstance(_RecordHomeSingleColNoHeaderTemplateDesktop2, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    async getComponents() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let elements = await _utam_get_componentss(driver, root);
        elements = await Promise.all(elements.map(function _createElement(element) {
                    return _createInstance(_Component2, driver, element);
                }));
        await Promise.all(elements.map(el => el.__beforeLoad__()));
        return elements;
    }
    
    async getFieldSections() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let elements = await _utam_get_fieldSectionss(driver, root);
        elements = await Promise.all(elements.map(function _createElement(element) {
                    return _createInstance(_FieldSection2, driver, element);
                }));
        await Promise.all(elements.map(el => el.__beforeLoad__()));
        return elements;
    }
    
    /**
     * Selects one flexipage-field-section2 by its 1-based position among sections (:nth-of-type is 1-based) so its record fields can be queried relative to it via a real CSS parent-child selector, instead of relying on getContent(RecordField) which does not scope to the section it's called on - confirmed live: it kept returning the page's total field count (24, then 36) rather than one section's subset.
     */
    async getFieldSectionByIndex(sectionIndex) {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        let element = await _utam_get_fieldSectionByIndex(driver, root, sectionIndex);
        if (!element) { return null; }
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async getSectionRecordFields(sectionIndex) {
        const driver = this.driver;
        const root = await this.getRootElement();
        let elements = await _utam_get_sectionRecordFieldss(driver, root, sectionIndex);
        if (!elements) { return null; }
        elements = await Promise.all(elements.map(function _createElement(element) {
                    return _createInstance(_RecordField, driver, element);
                }));
        await Promise.all(elements.map(el => el.__beforeLoad__()));
        return elements;
    }
    
    async getRecordFields() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let elements = await _utam_get_recordFieldss(driver, root);
        elements = await Promise.all(elements.map(function _createElement(element) {
                    return _createInstance(_RecordField, driver, element);
                }));
        await Promise.all(elements.map(el => el.__beforeLoad__()));
        return elements;
    }
    
    /**
     * Finds a field by its data-target-selection-name attribute (e.g. 'sfdc:RecordField.Case.Origin' for Case Channel) - confirmed from real captured markup to sit on record_flexipage-record-field's immediate child div, NOT on the field's own root, so it can't be reached via the predefined recordField type's getAttribute(). This is our own element, not part of the predefined library.
     */
    async getFieldByApiName(apiName) {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = _createUtamMixinCtor();
        let element = await _utam_get_fieldByApiName(driver, root, apiName);
        if (!element) { return null; }
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    /**
     * Combines fieldByApiName's scoping selector with the slotted records-record-picklist selector in one shot (confirmed from real markup: the slotted content for a dropdown field is records-record-picklist, not lightning-combobox directly - reuses the same predefined type recordLayoutItem.getPicklist() uses internally). One typed element avoids chaining through an untyped intermediate, which UTAM's compose chain requires a custom type for.
     */
    async getPicklistByApiName(apiName) {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_picklistByApiName(driver, root, apiName);
        if (!element) { return null; }
        element = await _createInstance(_RecordPicklist, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    /**
     * Returns the visible label text of every record_flexipage-record-field on the page - use this first to confirm field-label matching works before building a fillField-by-label method, and to see the exact label text to match against (getLabelText() may include trailing required-asterisk markup - verify).
     */
    async getFieldLabels() {
        const _statement0 = await this.getRecordFields();
        const _result0 = await Promise.all(_statement0.map((_it) => _it.getLabelText()));
        return _result0;
    }
    
    /**
     * Opens a picklist field identified by its data-target-selection-name API attribute (e.g. 'sfdc:RecordField.Case.Origin') and selects the option matching value. Example: fillDropdownByApiName('sfdc:RecordField.Case.Origin', 'sfdc:RecordField.Case.Origin', 'Phone') selects 'Phone' for the Case Channel field.
     */
    async fillDropdownByApiName(apiName, apiNameReselect, value) {
        const _statement0 = await this.getPicklistByApiName(apiName);
        const _statement1 = await _statement0.getBasePicklist();
        const _statement2 = await _statement1.getBaseCombobox();
        await _statement2.expand();
        const _statement4 = await this.getPicklistByApiName(apiNameReselect);
        const _statement5 = await _statement4.getBasePicklist();
        const _statement6 = await _statement5.getBaseCombobox();
        await _statement6.pickItemByLabel(value);
    }
    
}