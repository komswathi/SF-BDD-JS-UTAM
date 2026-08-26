import logger from '../utils/logger.js';
import BasePage from "./base.page.js";
import scenarioContext from '../context/scenario_context.js';
import CaseCreationExplorer from './caseCreationExplorer.mjs';
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
