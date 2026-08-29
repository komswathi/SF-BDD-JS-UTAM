import logger from '../utils/logger.js';
import BasePage from "./base.page.js";
import scenarioContext from '../context/scenario_context.js';
import CaseCreationExplorer from './caseCreationExplorer.mjs';
import FlexipageFieldExplorer from './flexipageFieldExplorer.mjs';
import Combobox from 'salesforce-pageobjects/lightning/pageObjects/combobox';
import Input from 'salesforce-pageobjects/lightning/pageObjects/input';
import Textarea from 'salesforce-pageobjects/lightning/pageObjects/textarea';
import Lookup from 'salesforce-pageobjects/lightning/pageObjects/lookup';
import {retryAction} from "../utils/waiter.js";
import {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer,
    RecordLayoutInputAddress
} from './index.js';

let listViewHeader;
let listViewName;

// Gherkin data table column headers match the real field-label attribute on
// each records-record-layout-item in the New Case modal. CaseCreationExplorer
// exposes generic fillers per field TYPE (dropdown/text/textarea/lookup) that
// take the field-label directly, so we only need to classify each column once.
const FIELD_TYPES = {
    // Status is handled separately below - it has a special support-lwc-input-case-status
    // wrapper (for status-transition validation) that the generic picklist path doesn't expect.
    DROPDOWN: new Set(['Priority', 'Case Origin', 'Type', 'Case Reason', 'Product', 'Potential Liability', 'SLA Violation']),
    LOOKUP: new Set(['Contact Name', 'Account Name']),
    TEXTAREA: new Set(['Description', 'Internal Comments']),
    TEXT: new Set(['Subject', 'Web Email', 'Web Company', 'Web Name', 'Web Phone', 'Engineering Req Number'])
};

class CaseCreation extends BasePage {

    /**
     * Open the "New Case" modal from the Cases list view
     */
    async openNewAccountModal() {
        const lv = await utam.load(ObjectHome);
        const lvm = await lv.getListViewManager();
        const cl = await lvm.getCommonListInternal();
        listViewHeader = await cl.getHeader();
        const actionsContainer = await listViewHeader.getAuraActionsContainer();
        const newButton = await actionsContainer.getActionLink('New');
        await newButton.click();
        const modal = await retryAction(
            () => utam.load(RecordActionWrapper),
            3,
            500
        );
        return modal;
    }

    async createCase(data) {
        try {
            logger.info('Starting case creation...');
            await this.openNewAccountModal();
            const explorer = await utam.load(CaseCreationExplorer);
            // records-lwc-record-layout renders asynchronously (field/picklist metadata
            // describe calls) after the modal shell appears, so retry until it's present
            // instead of racing a single un-retried element lookup.
            await retryAction(() => explorer.getRecordLayout(), 15, 1000);
            await this.fillFields(explorer, data);
            await explorer.submitCase();

            const modal = await utam.load(RecordActionWrapper);
            await modal.waitForAbsence();
            logger.info('Case created successfully');
        } catch (error) {
            logger.error('Failed to create case', { error: error.message });
            throw error;
        }
    }

    /**
     * Alternative entry point that loads the New Case modal via the flexipage component
     * family (flexipage-record-home-single-col-no-header-template-desktop2 -> flexipage-component2
     * -> flexipage-field-section2 -> record_flexipage-record-field) instead of the records-*
     * family CaseCreationExplorer uses. Currently a discovery step: opens the modal, loads every
     * record_flexipage-record-field present, and logs each field's visible label via the
     * predefined getLabelText() method - use this to confirm live which labels/order actually
     * come back before wiring up value-filling on top of it, the same way getFieldLabels() was
     * meant to be used from flexipageFieldExplorer.utam.json.
     *
     * NOTE: the shadow-vs-plain traversal in flexipageFieldExplorer.utam.json is still
     * unverified against a live page (see memory: shadow-dom-diagnostics) - if this throws a
     * "Can't find element ... inside its scope element/shadow root" error, that pinpoints
     * exactly which hop needs "shadow" flipped to "elements" or vice versa.
     */
    async createCaseUsingFlexi() {
        try {
            logger.info('Starting case creation via flexipage field explorer...');
            await this.openNewAccountModal();

            const explorer = await utam.load(FlexipageFieldExplorer);
            const recordFields = await explorer.getRecordFields();
            logger.info(`Found ${recordFields.length} record_flexipage-record-field element(s)`);

            const labels = [];
            for (let i = 0; i < recordFields.length; i++) {
                const label = await this.safeGetFlexiFieldLabel(recordFields[i]);
                labels.push(label);
                if (label !== null) {
                    logger.info(`Field ${i}: "${label}"`);
                } else {
                    logger.warn(`Field ${i}: no readable label (no shadow root, or missing .test-id__field-label)`);
                }
            }

            return labels;
        } catch (error) {
            logger.error('Failed to load fields via flexipage explorer', { error: error.message });
            throw error;
        }
    }

    /**
     * Reads a record_flexipage-record-field's label, tolerating fields that have no readable
     * label at all. hasLabelText() is NOT reliably safe here - it only avoids throwing when the
     * field HAS a shadow root but is missing .test-id__field-label inside it; if the field has
     * no shadow root at all (or it isn't attached yet), even isPresent()-based checks throw
     * "Can't find element ... inside its scope shadow root". So the whole check is wrapped in
     * one try/catch rather than trusting any single predefined method to degrade gracefully.
     */
    async safeGetFlexiFieldLabel(field) {
        try {
            const hasLabel = await field.hasLabelText();
            if (!hasLabel) return null;
            return await field.getLabelText();
        } catch (error) {
            return null;
        }
    }

    /**
     * Selects a picklist value on a record_flexipage-record-field that's already been located
     * (e.g. via findFlexiFieldByLabel). Casts the generic [slot='input'] container to Combobox
     * via getFieldContentEditMode(Combobox) - this is the manual equivalent of what
     * recordLayoutItem.getPicklist() does automatically for the records-* family; recordField
     * doesn't have that convenience wrapper, so we supply the type ourselves.
     *
     * NOTE: confirmed from real DOM (Case Channel field) that this Combobox cast is structurally
     * wrong for fields whose slotted content is records-record-picklist (records-* family), not
     * lightning-combobox directly - use fillDropdownByApiName() below for those instead.
     */
    async selectFlexiDropdownValue(field, value) {
        let combobox = await field.getFieldContentEditMode(Combobox);
        let baseCombobox = await combobox.getBaseCombobox();
        await baseCombobox.expand();

        // expand() doesn't return a chainable reference, so re-resolve the field's edit content
        // before picking the item - same reselect pattern used in fillDropdownField for the
        // records-* family.
        combobox = await field.getFieldContentEditMode(Combobox);
        baseCombobox = await combobox.getBaseCombobox();
        await baseCombobox.pickItemByLabel(value);
    }

    /**
     * Selects a picklist value by the field's data-target-selection-name API name (e.g.
     * 'sfdc:RecordField.Case.Origin' for Case Channel), entirely via UTAM - no browser.execute().
     * Confirmed from real captured markup: that attribute lives on record_flexipage-record-field's
     * immediate child div (not the field's own root), and its slotted edit content is
     * records-record-picklist, not lightning-combobox directly - both are handled by
     * flexipageFieldExplorer.utam.json's picklistByApiName element + fillDropdownByApiName method.
     */
    async fillFlexiDropdownByApiName(apiName, value) {
        const explorer = await utam.load(FlexipageFieldExplorer);
        await explorer.fillDropdownByApiName(apiName, apiName, value);
    }

    /**
     * Selects "Phone" for the Case Channel field via its API name
     * (sfdc:RecordField.Case.Origin), purely through UTAM.
     */
    async selectCaseChannelPhone() {
        await this.fillFlexiDropdownByApiName('sfdc:RecordField.Case.Origin', 'Phone');
    }

    /**
     * Sets text on a record_flexipage-record-field whose edit content is a plain input.
     * Casts the generic [slot='input'] container to Input via getFieldContentEditMode(Input).
     */
    async fillFlexiTextValue(field, value) {
        const input = await field.getFieldContentEditMode(Input);
        await input.setText(value);
    }

    /**
     * Sets text on a record_flexipage-record-field whose edit content is a textarea.
     * Casts the generic [slot='input'] container to Textarea via getFieldContentEditMode(Textarea).
     */
    async fillFlexiTextAreaValue(field, value) {
        const textarea = await field.getFieldContentEditMode(Textarea);
        await textarea.clearAndEnterText(value);
    }

    /**
     * Types into and selects a suggestion on a record_flexipage-record-field whose edit content
     * is a lookup. Casts the generic [slot='input'] container to Lookup via
     * getFieldContentEditMode(Lookup), which exposes type()/waitForSuggestions()/
     * selectRecordSuggestionByLabel() - the same predefined lookup methods used for the
     * records-* family.
     */
    async fillFlexiLookupValue(field, searchText, selectLabel) {
        let lookup = await field.getFieldContentEditMode(Lookup);
        await lookup.type(searchText);
        await lookup.waitForSuggestions();

        // Re-resolve before selecting, same reselect pattern used elsewhere after an action
        // that can change the field's rendered state.
        lookup = await field.getFieldContentEditMode(Lookup);
        await lookup.selectRecordSuggestionByLabel(selectLabel);
    }

    /**
     * Finds a record_flexipage-record-field by its visible label text (there's no field-label
     * attribute to filter by in the selector itself, unlike records-record-layout-item, so this
     * matches in JS across the returnAll collection). Uses safeGetFlexiFieldLabel() since some
     * fields throw when checked (no shadow root, or missing .test-id__field-label).
     */
    async findFlexiFieldByLabel(fieldLabel) {
        const explorer = await utam.load(FlexipageFieldExplorer);
        const recordFields = await explorer.getRecordFields();
        for (const field of recordFields) {
            const label = await this.safeGetFlexiFieldLabel(field);
            if (label !== null && label.trim() === fieldLabel.trim()) {
                return field;
            }
        }
        return null;
    }

    /**
     * Convenience: find a flexi field by label and select a picklist value on it in one call.
     */
    async selectFlexiDropdownByLabel(fieldLabel, value) {
        const field = await this.findFlexiFieldByLabel(fieldLabel);
        if (!field) {
            throw new Error(`Field "${fieldLabel}" not found via flexipage explorer`);
        }
        await this.selectFlexiDropdownValue(field, value);
    }

    async fillFields(explorer, data) {
        for (const [fieldName, fieldValue] of Object.entries(data)) {
            if (!fieldValue) continue;

            try {
                await this.fillField(explorer, fieldName, fieldValue);
                logger.info(`${fieldName} = ${fieldValue}`);
            } catch (error) {
                logger.error(`FAILED to fill "${fieldName}"`, {
                    fieldName,
                    fieldValue,
                    errorMessage: error.message,
                    errorStack: error.stack
                });
                throw error;
            }
        }
    }

    /**
     * Dispatch a single field to the correct fill strategy, classified by FIELD_TYPES.
     */
    async fillField(explorer, fieldName, value) {
        if (fieldName === 'Status') {
            return explorer.setStatus(value);
        }
        if (fieldName === 'Send Notification') {
            if (String(value).trim().toLowerCase() === 'yes') {
                await explorer.toggleNotificationEmail();
            }
            return;
        }
        if (FIELD_TYPES.DROPDOWN.has(fieldName)) {
            return explorer.fillDropdownField(fieldName, fieldName, value);
        }
        if (FIELD_TYPES.LOOKUP.has(fieldName)) {
            return this.selectFirstLookupResult(explorer, fieldName, value);
        }
        if (FIELD_TYPES.TEXTAREA.has(fieldName)) {
            return explorer.fillTextAreaField(fieldName, value);
        }
        if (FIELD_TYPES.TEXT.has(fieldName)) {
            return this.fillTextInput(explorer, fieldName, value);
        }
        logger.warn(`No handler for field "${fieldName}" - skipping`);
    }

    /**
     * Lookup suggestion labels for auto-generated test data (e.g. "UTAM Test Account_1786557462930")
     * carry unpredictable unique suffixes, so an exact-label match is unreliable. Instead, type the
     * search term, wait for the async search to return, and pick the first real result - skipping
     * index 0, which is always the "Show more results for ..." action item, not an actual record.
     */
    async selectFirstLookupResult(explorer, fieldLabel, value) {
        const lookup = await explorer.getLookupField(fieldLabel);
        await lookup.type(value);
        await lookup.waitForSuggestions();
        const baseCombobox = await lookup.getBaseCombobox();
        const items = await baseCombobox.getItems();
        const target = items.length > 1 ? items[1] : items[0];
        await target.clickItem();
    }

    /**
     * Some fields (e.g. Web Email) slot lightning-input directly under the item; others (e.g. Web
     * Company/Name/Phone) wrap it in records-record-layout-base-input, which has its own real shadow
     * root - a plain query for lightning-input from the item can't cross it. Try the wrapper path
     * first (matching the proven working Account flow), falling back to the direct input otherwise.
     */
    async fillTextInput(explorer, fieldLabel, value) {
        const item = await explorer.getItemByLabel(fieldLabel);
        const wrapper = await item.getLightningInputWrapper();
        const input = wrapper ? await wrapper.getInput() : await item.getInput();
        await input.setText(value);
    }
}

export default new CaseCreation()
