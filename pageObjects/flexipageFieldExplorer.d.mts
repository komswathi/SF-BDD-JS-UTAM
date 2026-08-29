
import { Driver as _Driver, Element as _Element, Locator as _Locator, BaseUtamElement as _BaseUtamElement, UtamBaseRootPageObject as _UtamBaseRootPageObject } from '@utam/core';
import _RecordHomeSingleColNoHeaderTemplateDesktop2 from 'salesforce-pageobjects/flexipage/pageObjects/recordHomeSingleColNoHeaderTemplateDesktop2';
import _Component2 from 'salesforce-pageobjects/flexipage/pageObjects/component2';
import _FieldSection2 from 'salesforce-pageobjects/flexipage/pageObjects/fieldSection2';
import _RecordField from 'salesforce-pageobjects/record/flexipage/pageObjects/recordField';
import _RecordPicklist from 'salesforce-pageobjects/records/pageObjects/recordPicklist';

/**
 * Traverses the flexipage rendering family (record detail/view pages) from the Aura action wrapper down to individual record_flexipage-record-field elements: .oneRecordActionWrapper -&gt; flexipage-record-home-single-col-no-header-template-desktop2 -&gt; flexipage-component2 -&gt; flexipage-field-section2 -&gt; record_flexipage-record-field. Uses predefined salesforce-pageobjects types (utam-flexipage/, utam-record-flexipage/) matching the tags shown in the DOM screenshot. SHADOW STATUS FOR THESE HOPS IS UNVERIFIED - run traceHierarchy() (see memory: shadow-dom-diagnostics) against the live page before trusting this compiles+works; plain 'elements' is used below as a starting guess only, matching how .actionBody's own children are declared in recordActionWrapper.utam.json.
 * generated from JSON force-app/main/default/cases/__utam__/flexipageFieldExplorer.utam.json
 * @version 2026-08-27T14:25:55.903Z
 * @author UTAM
 */
export default class FlexipageFieldExplorer extends _UtamBaseRootPageObject {
    constructor(driver: _Driver, element?: _Element, locator?: _Locator);
    /**
     * Returns the visible label text of every record_flexipage-record-field on the page - use this first to confirm field-label matching works before building a fillField-by-label method, and to see the exact label text to match against (getLabelText() may include trailing required-asterisk markup - verify).
     */
    getFieldLabels(): Promise<string[]>;
    /**
     * Opens a picklist field identified by its data-target-selection-name API attribute (e.g. 'sfdc:RecordField.Case.Origin') and selects the option matching value. Example: fillDropdownByApiName('sfdc:RecordField.Case.Origin', 'sfdc:RecordField.Case.Origin', 'Phone') selects 'Phone' for the Case Channel field.
     */
    fillDropdownByApiName(apiName: string, apiNameReselect: string, value: string): Promise<void>;
    getRecordHome(): Promise<_RecordHomeSingleColNoHeaderTemplateDesktop2>;
    getComponents(): Promise<_Component2[]>;
    getFieldSections(): Promise<_FieldSection2[]>;
    /**
     * Selects one flexipage-field-section2 by its 1-based position among sections (:nth-of-type is 1-based) so its record fields can be queried relative to it via a real CSS parent-child selector, instead of relying on getContent(RecordField) which does not scope to the section it's called on - confirmed live: it kept returning the page's total field count (24, then 36) rather than one section's subset.
     */
    getFieldSectionByIndex(sectionIndex: number): Promise<(_BaseUtamElement) | null>;
    getSectionRecordFields(sectionIndex: number): Promise<_RecordField[] | null>;
    getRecordFields(): Promise<_RecordField[]>;
    /**
     * Finds a field by its data-target-selection-name attribute (e.g. 'sfdc:RecordField.Case.Origin' for Case Channel) - confirmed from real captured markup to sit on record_flexipage-record-field's immediate child div, NOT on the field's own root, so it can't be reached via the predefined recordField type's getAttribute(). This is our own element, not part of the predefined library.
     */
    getFieldByApiName(apiName: string): Promise<(_BaseUtamElement) | null>;
    /**
     * Combines fieldByApiName's scoping selector with the slotted records-record-picklist selector in one shot (confirmed from real markup: the slotted content for a dropdown field is records-record-picklist, not lightning-combobox directly - reuses the same predefined type recordLayoutItem.getPicklist() uses internally). One typed element avoids chaining through an untyped intermediate, which UTAM's compose chain requires a custom type for.
     */
    getPicklistByApiName(apiName: string): Promise<_RecordPicklist | null>;
}