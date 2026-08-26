import logger from '../utils/logger.js';
import BasePage from "./base.page.js";
import New_caseCreationExplorer from './new_caseCreationExplorer.mjs';
import {retryAction} from "../utils/waiter.js";
import {
    RecordActionWrapper,
    ObjectHome
} from './index.js';

// Field-label -> render-type classification for the "Complaint" Case record type.
// Every field here is handled through PREDEFINED salesforce-pageobjects types
// (recordLayoutItem.getPicklist/getTextInput/getLookup/getDatepicker/recordTextArea) via the
// generic fillDropdownField/fillTextField/fillTextAreaField/fillDateField/fillLookupField methods
// in new_caseCreationExplorer.utam.json - no custom JSON was needed for any of these, because
// Salesforce renders custom (__c) fields with the exact same LWC components as standard ones.
const FIELD_TYPES = {
    // Picklists - both standard (Status, Case Currency) and custom (__c) fields render as
    // lightning-combobox identically, so the same predefined getPicklist() path covers all of them.
    DROPDOWN: new Set([
        'Status',
        'Case Currency',
        'Reason of Escalation',
        'Escalate Complaint',
        'Forwarded to a 3rd Party?',
        'Is the complaint linked to an incident?',
        'Complaint Specifically Payment Related?',
        'Third Party to act on Customer\'s behalf',
        'Product Type',
        'Product',
        'Customer Type',
        'Primary Root Cause',
        'Secondary Root Cause'
    ]),
    LOOKUP: new Set(['Account']),
    TEXTAREA: new Set(['Customer complaint description', 'Customer Suggestion/Feedback', 'Cause of Matter']),
    DATE: new Set(['Date the complaint feedback was raised', 'Date of event leading to the complaint']),
    // Plain lightning-input text fields.
    TEXT: new Set(['Customer Number / IBIS Identifier'])
};

// Read-only fields that are never filled (system/formula fields) - listed so fillFields can
// warn clearly rather than silently no-op if one of these accidentally ends up in test data.
const READONLY_FIELDS = new Set([
    'Case Number', 'Date/Time Closed', 'Created By', 'Last Modified By',
    'Record Type', 'Number of days to resolve complaint'
]);

class NewCaseCreation extends BasePage {

    /**
     * Open the "New Case" modal from the Cases list view
     */
    async openNewCaseModal() {
        const lv = await utam.load(ObjectHome);
        const lvm = await lv.getListViewManager();
        const cl = await lvm.getCommonListInternal();
        const listViewHeader = await cl.getHeader();
        const actionsContainer = await listViewHeader.getAuraActionsContainer();
        const newButton = await actionsContainer.getActionLink('New');
        await newButton.click();
        return retryAction(
            () => utam.load(RecordActionWrapper),
            3,
            500
        );
    }

    async createCase(data) {
        try {
            logger.info('Starting Complaint case creation...');
            await this.openNewCaseModal();
            const explorer = await utam.load(New_caseCreationExplorer);
            // records-lwc-record-layout renders asynchronously (field/picklist metadata describe
            // calls) after the modal shell appears, so retry until it's present instead of racing
            // a single un-retried element lookup.
            await retryAction(() => explorer.getRecordLayout(), 15, 1000);
            await this.fillFields(explorer, data);
            await explorer.submitCase();

            const modal = await utam.load(RecordActionWrapper);
            await modal.waitForAbsence();
            logger.info('Complaint case created successfully');
        } catch (error) {
            logger.error('Failed to create Complaint case', { error: error.message });
            throw error;
        }
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
     * All PREDEFINED paths (dropdown/textarea/date/lookup/text) call the generic explorer
     * methods, which are themselves built purely from salesforce-pageobjects library types -
     * no custom UTAM JSON per field. Only add a field-specific CUSTOM method (see setStatus in
     * caseCreationExplorer.utam.json for the pattern) if a field is empirically proven to need
     * one - e.g. if it has its own special wrapper component the generic path can't cross.
     */
    async fillField(explorer, fieldName, value) {
        if (READONLY_FIELDS.has(fieldName)) {
            logger.warn(`"${fieldName}" is read-only/system - skipping, not fillable`);
            return;
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
        if (FIELD_TYPES.DATE.has(fieldName)) {
            return explorer.fillDateField(fieldName, value);
        }
        if (FIELD_TYPES.TEXT.has(fieldName)) {
            return this.fillTextInput(explorer, fieldName, value);
        }
        logger.warn(`No handler for field "${fieldName}" - skipping`);
    }

    /**
     * Lookup suggestion labels for auto-generated test data carry unpredictable unique suffixes,
     * so an exact-label match is unreliable. Type the search term, wait for the async search to
     * return, and pick the first real result - skipping index 0, which is always the "Show more
     * results for ..." action item, not an actual record. Uses only predefined lookup/baseCombobox
     * methods.
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
     * Some fields slot lightning-input directly under the item; others wrap it in
     * records-record-layout-base-input, which has its own real shadow root - a plain query for
     * lightning-input from the item can't cross it. Try the wrapper path first, falling back to
     * the direct input otherwise. Both paths use only predefined library types.
     */
    async fillTextInput(explorer, fieldLabel, value) {
        const item = await explorer.getItemByLabel(fieldLabel);
        const wrapper = await item.getLightningInputWrapper();
        const input = wrapper ? await wrapper.getInput() : await item.getInput();
        await input.setText(value);
    }
}

export default new NewCaseCreation()
