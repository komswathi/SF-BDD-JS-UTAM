
'use strict';

var core = require('@utam/core');
var _RecordLayoutItem = require('salesforce-pageobjects/records/pageObjects/recordLayoutItem');
var _Picklist = require('salesforce-pageobjects/lightning/pageObjects/picklist');
var _Input = require('salesforce-pageobjects/lightning/pageObjects/input');
var _Button = require('salesforce-pageobjects/lightning/pageObjects/button');

async function _utam_get_lwcDetailPanel(driver, root) {
    let _element = root;
    const _locator = core.By.css("records-lwc-detail-panel");
    return _element.findElement(_locator);
}

async function _utam_get_baseRecordForm(driver, root) {
    let _element = await _utam_get_lwcDetailPanel(driver, root);
    const _locator = core.By.css("records-base-record-form");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_recordLayout(driver, root) {
    let _element = await _utam_get_baseRecordForm(driver, root);
    const _locator = core.By.css("records-lwc-record-layout");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_generatedLayout(driver, root) {
    let _element = await _utam_get_recordLayout(driver, root);
    const _locator = core.By.css("[class*=forcegenerated-record-layout]");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_sectionss(driver, root) {
    let _element = await _utam_get_generatedLayout(driver, root);
    const _locator = core.By.css("records-record-layout-section");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElements(_locator);
}

async function _utam_get_rowss(driver, root, _sectionsIndex) {
    let _elements = await _utam_index_sections(driver, root, _sectionsIndex);
    const _locator = core.By.css("records-record-layout-row");
    return _elements.findElements(_locator);
}

async function _utam_get_itemss(driver, root, _sectionsIndex, _rowsIndex) {
    let _elements = await _utam_index_rows(driver, root, _sectionsIndex, _rowsIndex);
    const _locator = core.By.css("records-record-layout-item");
    return _elements.findElements(_locator);
}

async function _utam_get_itemByLabel(driver, root, label) {
    let _element = await _utam_get_generatedLayout(driver, root);
    const _locator = core.By.css("records-record-layout-item[field-label=\"" + label + "\"]");
    _element = new core.ShadowRoot(driver, _element);
    const hasElement = await _element.containsElement(_locator);
    if (!hasElement) { return null; }
    return _element.findElement(_locator);
}

async function _utam_get_statusItem(driver, root) {
    let _element = await _utam_get_generatedLayout(driver, root);
    const _locator = core.By.css("records-record-layout-item[field-label='Status']");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_statusWrapper(driver, root) {
    let _element = await _utam_get_statusItem(driver, root);
    const _locator = core.By.css("support-lwc-input-case-status");
    return _element.findElement(_locator);
}

async function _utam_get_statusPicklistWrapper(driver, root) {
    let _element = await _utam_get_statusWrapper(driver, root);
    const _locator = core.By.css("records-record-picklist");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_statusFormPicklist(driver, root) {
    let _element = await _utam_get_statusPicklistWrapper(driver, root);
    const _locator = core.By.css("records-form-picklist");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_statusLightningPicklist(driver, root) {
    let _element = await _utam_get_statusFormPicklist(driver, root);
    const _locator = core.By.css("lightning-picklist");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_formFooter(driver, root) {
    let _element = await _utam_get_baseRecordForm(driver, root);
    const _locator = core.By.css("records-form-footer");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_sendNotificationCheckbox(driver, root) {
    let _element = await _utam_get_formFooter(driver, root);
    const _locator = core.By.css("lightning-input[data-option-name='triggerOtherEmail']");
    _element = new core.ShadowRoot(driver, _element);
    const hasElement = await _element.containsElement(_locator);
    if (!hasElement) { return null; }
    return _element.findElement(_locator);
}

async function _utam_get_cancelButton(driver, root) {
    let _element = await _utam_get_formFooter(driver, root);
    const _locator = core.By.css("lightning-button button[name='CancelEdit']");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_saveAndNewButton(driver, root) {
    let _element = await _utam_get_formFooter(driver, root);
    const _locator = core.By.css("lightning-button button[name='SaveAndNew']");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_get_saveButton(driver, root) {
    let _element = await _utam_get_formFooter(driver, root);
    const _locator = core.By.css("lightning-button button[name='SaveEdit']");
    _element = new core.ShadowRoot(driver, _element);
    return _element.findElement(_locator);
}

async function _utam_index_sections(driver, root, _sectionsIndex) {
    let _elements = await _utam_get_sectionss(driver, root);
    if(!_elements || _elements.length <= _sectionsIndex) {
       throw new Error('Could not find element "sections" with given index!');
    }
   return _elements[_sectionsIndex];
}

async function _utam_index_rows(driver, root, _sectionsIndex, _rowsIndex) {
    let _elements = await _utam_get_rowss(driver, root, _sectionsIndex);
    if(!_elements || _elements.length <= _rowsIndex) {
       throw new Error('Could not find element "rows" with given index!');
    }
   return _elements[_rowsIndex];
}

/**
 * Salesforce Case Creation Modal Form - hierarchy from the Aura action wrapper down through the LWC record layout, using salesforce-pageobjects' own recordLayoutItem type (getPicklist/getTextInput/getLookup/recordTextArea) to reliably reach each field regardless of its specific internal wrapper chain, identified by field-label
 * generated from JSON force-app/main/default/cases/__utam__/caseCreationExplorer.utam.json
 * @version 2026-08-27T14:25:55.872Z
 * @author UTAM
 */
class CaseCreationExplorer extends core.UtamBaseRootPageObject {
    constructor(driver, element, locator = core.By.css(".oneRecordActionWrapper")) {
        super(driver, element, locator);
    }

    async __getRoot() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        return new BaseUtamElement(driver, root);
    }
    
    async __getLwcDetailPanel() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_lwcDetailPanel(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async __getBaseRecordForm() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_baseRecordForm(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async getRecordLayout() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_recordLayout(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async __getGeneratedLayout() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_generatedLayout(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async getSections() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let elements = await _utam_get_sectionss(driver, root);
        elements = elements.map(function _createElement(element) {
                    return new BaseUtamElement(driver, element);
                });
        return elements;
    }
    
    /**
     * @param _sectionsIndex index of parent element
     */
    async getRows(_sectionsIndex) {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let elements = await _utam_get_rowss(driver, root, _sectionsIndex);
        elements = elements.map(function _createElement(element) {
                    return new BaseUtamElement(driver, element);
                });
        return elements;
    }
    
    /**
     * @param _sectionsIndex index of parent element
     * @param _rowsIndex index of parent element
     */
    async getItems(_sectionsIndex, _rowsIndex) {
        const driver = this.driver;
        const root = await this.getRootElement();
        let elements = await _utam_get_itemss(driver, root, _sectionsIndex, _rowsIndex);
        elements = await Promise.all(elements.map(function _createElement(element) {
                    return core.createInstance(_RecordLayoutItem, driver, element);
                }));
        await Promise.all(elements.map(el => el.__beforeLoad__()));
        return elements;
    }
    
    async getItemByLabel(label) {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_itemByLabel(driver, root, label);
        if (!element) { return null; }
        element = await core.createInstance(_RecordLayoutItem, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    async __getStatusItem() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_statusItem(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async __getStatusWrapper() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_statusWrapper(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async __getStatusPicklistWrapper() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_statusPicklistWrapper(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async __getStatusFormPicklist() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_statusFormPicklist(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async getStatusLightningPicklist() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_statusLightningPicklist(driver, root);
        element = await core.createInstance(_Picklist, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    async getFormFooter() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        let element = await _utam_get_formFooter(driver, root);
        element = new BaseUtamElement(driver, element);
        return element;
    }
    
    async getSendNotificationCheckbox() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_sendNotificationCheckbox(driver, root);
        if (!element) { return null; }
        element = await core.createInstance(_Input, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    async getCancelButton() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_cancelButton(driver, root);
        element = await core.createInstance(_Button, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    async getSaveAndNewButton() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_saveAndNewButton(driver, root);
        element = await core.createInstance(_Button, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    async getSaveButton() {
        const driver = this.driver;
        const root = await this.getRootElement();
        let element = await _utam_get_saveButton(driver, root);
        element = await core.createInstance(_Button, driver, element);
        await element.__beforeLoad__();
        return element;
    }
    
    /**
     * Get the lookup object for a field identified by its visible field-label, for direct step-by-step interaction (type, wait for suggestions, then select by index) from calling code - useful when suggestion labels are not predictable (e.g. auto-generated test data with unique suffixes)
     */
    async getLookupField(fieldLabel) {
        const _statement0 = await this.getItemByLabel(fieldLabel);
        const _result1 = await _statement0.getLookup();
        return _result1;
    }
    
    /**
     * Set case Status specifically - this field uses a special support-lwc-input-case-status wrapper (for status-transition validation) that the generic fillDropdownField path doesn't account for
     */
    async setStatus(value) {
        const _statement0 = await this.getStatusLightningPicklist();
        const _statement1 = await _statement0.getBaseCombobox();
        await _statement1.expand();
        const _statement3 = await this.getStatusLightningPicklist();
        const _statement4 = await _statement3.getBaseCombobox();
        await _statement4.pickItemByLabel(value);
    }
    
    /**
     * Open a picklist field identified by its visible field-label and select the option matching value
     */
    async fillDropdownField(fieldLabel, fieldLabelReselect, value) {
        const _statement0 = await this.getItemByLabel(fieldLabel);
        const _statement1 = await _statement0.getPicklist();
        const _statement2 = await _statement1.getBaseCombobox();
        await _statement2.expand();
        const _statement4 = await this.getItemByLabel(fieldLabelReselect);
        const _statement5 = await _statement4.getPicklist();
        const _statement6 = await _statement5.getBaseCombobox();
        await _statement6.pickItemByLabel(value);
    }
    
    /**
     * Set text on an input field identified by its visible field-label. Uses the item's own direct 'input' element (lightning-input) rather than getTextInput(), since some fields (e.g. Web Email) slot lightning-input directly while others wrap it in records-record-layout-base-input - the direct 'input' element works for both cases.
     */
    async fillTextField(fieldLabel, value) {
        const _statement0 = await this.getItemByLabel(fieldLabel);
        const _statement1 = await _statement0.getInput();
        await _statement1.setText(value);
    }
    
    /**
     * Set text on a textarea field identified by its visible field-label
     */
    async fillTextAreaField(fieldLabel, value) {
        const _statement0 = await this.getItemByLabel(fieldLabel);
        const _statement1 = await _statement0.getRecordTextArea();
        const _statement2 = await _statement1.getTextArea();
        await _statement2.clearAndEnterText(value);
    }
    
    /**
     * Type into a lookup field identified by its visible field-label and select the matching suggestion
     */
    async fillLookupField(fieldLabel, value, fieldLabelWait, fieldLabelReselect, selectValue) {
        const _statement0 = await this.getItemByLabel(fieldLabel);
        const _statement1 = await _statement0.getLookup();
        await _statement1.type(value);
        const _statement3 = await this.getItemByLabel(fieldLabelWait);
        const _statement4 = await _statement3.getLookup();
        await _statement4.waitForSuggestions();
        const _statement6 = await this.getItemByLabel(fieldLabelReselect);
        const _statement7 = await _statement6.getLookup();
        await _statement7.selectRecordSuggestionByLabel(selectValue);
    }
    
    /**
     * Toggle send notification email checkbox
     */
    async toggleNotificationEmail() {
        const _statement0 = await this.getSendNotificationCheckbox();
        if(_statement0 === null) { return null; }
        await _statement0.toggleCheckbox();
    }
    
    /**
     * Submit case creation form by clicking Save button
     */
    async submitCase() {
        const _statement0 = await this.getSaveButton();
        await _statement0.click();
    }
    
    /**
     * Save current case and immediately open form for new case
     */
    async submitAndCreateNew() {
        const _statement0 = await this.getSaveAndNewButton();
        await _statement0.click();
    }
    
    /**
     * Cancel case creation and close modal
     */
    async cancelCaseCreation() {
        const _statement0 = await this.getCancelButton();
        await _statement0.click();
    }
    
}

module.exports = CaseCreationExplorer;
