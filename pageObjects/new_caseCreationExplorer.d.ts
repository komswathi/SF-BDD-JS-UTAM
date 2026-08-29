
import { Driver as _Driver, Element as _Element, Locator as _Locator, BaseUtamElement as _BaseUtamElement, UtamBaseRootPageObject as _UtamBaseRootPageObject } from '@utam/core';
import _Lookup from 'salesforce-pageobjects/lightning/pageObjects/lookup';
import _RecordLayoutItem from 'salesforce-pageobjects/records/pageObjects/recordLayoutItem';
import _Input from 'salesforce-pageobjects/lightning/pageObjects/input';
import _Button from 'salesforce-pageobjects/lightning/pageObjects/button';

/**
 * Salesforce New Case (Complaint record type) Modal Form - reuses the proven generic hierarchy from caseCreationExplorer.utam.json (shadow-chain traversal from the Aura action wrapper down through the LWC record layout, using salesforce-pageobjects' own recordLayoutItem type to reliably reach each field regardless of its specific internal wrapper chain, identified by field-label). Field-label-driven design means it should work for this larger/different Case layout without per-field selectors - only field-type classification needs to be supplied by the caller.
 * generated from JSON force-app/main/default/cases/__utam__/new_caseCreationExplorer.utam.json
 * @version 2026-08-27T14:25:55.909Z
 * @author UTAM
 */
declare class New_caseCreationExplorer extends _UtamBaseRootPageObject {
    constructor(driver: _Driver, element?: _Element, locator?: _Locator);
    /**
     * Get the lookup object for a field identified by its visible field-label, for direct step-by-step interaction (type, wait for suggestions, then select by index) from calling code - useful when suggestion labels are not predictable (e.g. auto-generated test data with unique suffixes)
     */
    getLookupField(fieldLabel: string): Promise<_Lookup>;
    /**
     * Open a picklist field identified by its visible field-label and select the option matching value
     */
    fillDropdownField(fieldLabel: string, fieldLabelReselect: string, value: string): Promise<void>;
    /**
     * Set text on an input field identified by its visible field-label. Uses the item's own direct 'input' element (lightning-input) rather than getTextInput(), since some fields slot lightning-input directly while others wrap it in records-record-layout-base-input - the direct 'input' element works for both cases.
     */
    fillTextField(fieldLabel: string, value: string): Promise<void>;
    /**
     * Set a date field identified by its visible field-label, using the predefined utam-lightning/pageObjects/datepicker type's setDateText method. Expects the org's configured date format (commonly DD/MM/YYYY or MM/DD/YYYY - check the field's format hint in the UI).
     */
    fillDateField(fieldLabel: string, value: string): Promise<void>;
    /**
     * Set text on a textarea field identified by its visible field-label
     */
    fillTextAreaField(fieldLabel: string, value: string): Promise<void>;
    /**
     * Type into a lookup field identified by its visible field-label and select the matching suggestion
     */
    fillLookupField(fieldLabel: string, value: string, fieldLabelWait: string, fieldLabelReselect: string, selectValue: string): Promise<void>;
    /**
     * Toggle send notification email checkbox
     */
    toggleNotificationEmail(): Promise<void>;
    /**
     * Submit case creation form by clicking Save button
     */
    submitCase(): Promise<void>;
    /**
     * Save current case and immediately open form for new case
     */
    submitAndCreateNew(): Promise<void>;
    /**
     * Cancel case creation and close modal
     */
    cancelCaseCreation(): Promise<void>;
    getRecordLayout(): Promise<(_BaseUtamElement)>;
    getSections(): Promise<(_BaseUtamElement)[]>;
    /**
     * @param _sectionsIndex index of parent element
     */
    getRows(_sectionsIndex: number): Promise<(_BaseUtamElement)[]>;
    /**
     * @param _sectionsIndex index of parent element
     * @param _rowsIndex index of parent element
     */
    getItems(_sectionsIndex: number, _rowsIndex: number): Promise<_RecordLayoutItem[]>;
    getItemByLabel(label: string): Promise<_RecordLayoutItem | null>;
    getFormFooter(): Promise<(_BaseUtamElement)>;
    getSendNotificationCheckbox(): Promise<_Input | null>;
    getCancelButton(): Promise<_Button>;
    getSaveAndNewButton(): Promise<_Button>;
    getSaveButton(): Promise<_Button>;
}
export = New_caseCreationExplorer;
