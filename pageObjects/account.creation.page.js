import logger from '../utils/logger.js';
import BasePage from "./base.page.js";
import scenarioContext from '../context/scenario_context.js';
import {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer,
    RecordLayoutInputAddress
} from './index.js';
import {TIMEOUTS, WAIT_INTERVALS} from "../utils/salesforceConstants.js";
import {retryAction} from "../utils/waiter.js";

let listViewHeader;
let listViewName;

const ACCOUNT_SECTIONS = {
    ACCOUNT_INFO: 'Account Information',
    ADDRESS_INFO: 'Address Information',
    ADDITIONAL_INFO: 'Additional Information'
};

const FIELD_TYPES = {
    DROPDOWN: new Set(['RATING', 'TYP    DROPDOWN: new Set([\'RATING\', \'TYPE\', \'OWNERSHIP\', \'INDUSTRY\', \'BILLING_COUNTRY\', \'SHIPPING_COUNTRY\', \'CUSTOMER_PRIORITY\', \'SLA\', \'UPSELL_OPPORTUNITY\', \'ACTIVE\']),\nE', 'OWNERSHIP', 'INDUSTRY', 'BILLING_COUNTRY', 'SHIPPING_COUNTRY', 'CUSTOMER_PRIORITY', 'SLA', 'UPSELL_OPPORTUNITY', 'ACTIVE']),
    BASE_INPUT: new Set(['ACCOUNT_NAME', 'ACCOUNT_NUMBER', 'ACCOUNT_SITE', 'TICKER_SYMBOL', 'ANNUAL_REVENUE', 'SIC_CODE']),
    INPUT: new Set(['PHONE', 'FAX', 'WEBSITE', 'EMPLOYEES', 'SLA_SERIAL_NUMBER', 'NUMBER_OF_LOCATIONS', 'BILLING_CITY', 'SHIPPING_CITY', 'BILLING_ZIP/POSTAL_CODE', 'SHIPPING_ZIP/POSTAL_CODE']),
    TEXTAREA: new Set(['BILLING_STREET', 'SHIPPING_STREET', 'DESCRIPTION']),
};


const dropdownFields = new Set(['RATING', 'TYPE', 'OWNERSHIP', 'INDUSTRY', 'BILLING_COUNTRY']);
const baseInputFields = new Set(['ACCOUNT_NAME', 'ACCOUNT_NUMBER', 'ACCOUNT_SITE', 'TICKER_SYMBOL', 'ANNUAL_REVENUE', 'SIC_CODE']);
const inputFields = new Set(['PHONE', 'FAX', 'WEBSITE', 'EMPLOYEES', 'SLA_SERIAL_NUMBER']);
//const textAreaFields = new Set(['BILLING_STREET', 'SHIPPING_STREET', 'DESCRIPTION']);



const addressData = {
    'Billing Country' : 'United Kingdom'
    /*'Billing Street': 'test',
    'Billing City' : 'London',
    'Billing Zip/Postal Code' : 'ABC DEF',
    'Shipping Country': 'United Kingdom',
    'Shipping Street' : 'test',
    'Shipping City' : 'London',
    'Shipping Zip/Postal Code' : 'ABC DEF',*/
}



class AccountCreation extends BasePage {

    async getAppContextName() {
        const appNavAfterNav = await (await utam.load(DesktopLayoutContainer)).getAppNav();
        const appName = await (await appNavAfterNav.getAppName()).getText();
        return appName
    }

    /**
     * Open new account modal
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

    /**
     * Get record layout
     */
    async getRecordLayout() {
        const modal = await utam.load(RecordActionWrapper);
        const recordForm = await modal.getRecordForm();
        const recordLayout = await recordForm.getRecordLayout();
        await recordLayout.waitForSections();
        return recordLayout;
    }

    async saveForm() {
        const modal = await utam.load(RecordActionWrapper);
        const recordForm = await modal.getRecordForm();
        await recordForm.clickFooterButton('Save');
        await modal.waitForAbsence();
    }




    async createAccount(data) {
        try {
            logger.info('Starting account creation...');
            await this.openNewAccountModal();
            const recordLayout = await this.getRecordLayout();
            await this.fillAllFields(recordLayout, data);
            //await this.fillAccountInformation(recordLayout, testData.accountData);
            //await this.fillAddress(recordLayout, testData.addressData);
            await  this.saveForm();
            logger.info('Account created successfully');

        } catch (error) {
            logger.error('Failed to create account', { error: error.message });
            throw error;
        }
    }

    async fillAllFields(recordLayout, testData) {
        const sections = await recordLayout.getSections();
        logger.info("Sections length - " + sections.length);
        logger.info("Sections - " + sections[0] + " " + sections[1] + " " + sections[2]);

        for (const section of sections) {
            const sectionTitleElement = await section.getSectionTitle();
            const sectionTitle = await sectionTitleElement.getText();
            logger.info("Section name - " + sectionTitle);
            const rows = await section.getRows();
            logger.debug(`Processing section: ${sectionTitle}`);
            for (const row of rows) {
                const items = await row.getItems();

                for (const item of items) {
                        const fieldName = await item.getLabelText();
                        const fieldValue = testData[fieldName];

                        // Skip if field not in test data
                        if (!fieldValue) continue;

                    const normalizedFieldName = fieldName.replaceAll(' ', '_').toUpperCase();

                        // Fill field based on type and section
                        logger.info('Field name - ' + fieldName);
                        await this.fillField(item, fieldName, fieldValue, section, sectionTitle, normalizedFieldName);
                        logger.info(`${sectionTitle} > ${fieldName} = ${fieldValue}`);

                }
            }
        }
    }

    async fillField(item, fieldName, value, section, sectionTitle, normalizedFieldName) {
        logger.info("FIELD value - " + normalizedFieldName);
        logger.info("Section Title - " + sectionTitle);

        try {
            if (sectionTitle === 'Address Information') {
                // Address section fields (country, street, city, postal)
                await this.fillAddressField(section, fieldName, value);
                //await this.fillAddress(section,item, fieldName, value);

            }
            else if (FIELD_TYPES.DROPDOWN.has(normalizedFieldName)) {
                logger.info("DROPDOWN value - " + fieldName.toUpperCase());
                await this.selectDropdownValue(item, value);
            }
            else if (FIELD_TYPES.TEXTAREA.has(normalizedFieldName)) {
                await this.fillTextArea(item, value);
            }

            else {
                // Regular text field
                await this.fillTextField(item, value);
            }

        } catch (error) {
            logger.error(`FAILED to fill ${fieldName} in "${sectionTitle}"`, {
                fieldName,
                value,
                sectionTitle,
                errorMessage: error.message,
                errorStack: error.stack
            });
            throw error;
        }
    }

    /**
     * Select dropdown value - scroll and retry until success
     */
    async selectDropdownValue(item, value) {
        try {
            const dropDownField = await item.getPicklist();
            const baseComboBoxField = await dropDownField.getBaseCombobox();

            // Keep scrolling and retrying until expand succeeds
            for (let attempt = 1; attempt <= 10; attempt++) {
                try {
                    logger.debug(`Dropdown expand attempt ${attempt}`);

                    // Expand dropdown
                    await baseComboBoxField.expand();
                    await browser.pause(600);

                    // Get options
                    const options = await baseComboBoxField.getItems();
                    if (!options || options.length === 0) {
                        throw new Error('No options found');
                    }

                    // Find and click target option
                    for (const option of options) {
                        const label = await option.getItemLabel();
                        if (label === value) {
                            await option.clickItem();
                            await browser.pause(400);
                            logger.info(`✓ Selected dropdown: ${value}`);
                            return;
                        }
                    }

                    throw new Error(`Option not found: ${value}`);

                } catch (error) {
                    if (attempt >= 10) {
                        throw error; // Final attempt failed
                    }

                    logger.debug(`Attempt ${attempt} failed, scrolling down...`);

                    // Scroll down modal body
                    await browser.execute(() => {
                        const modal = document.querySelector('[role="dialog"]');
                        if (modal) {
                            const body = modal.querySelector('[class*="body"], .slds-modal__body');
                            if (body) {
                                body.scrollTop += 100; // Scroll down 100px
                            }
                        }
                    });

                    await browser.pause(400);
                }
            }
        } catch (error) {
            logger.error(`Failed to select dropdown: ${value}`, { error: error.message });
            throw error;
        }
    }


    async fillTextField(item, value) {
        try {
            const input = await item.getLightningInputWrapper()
                .then(w => w.getInput())
                .catch(() => item.getInput());
            await input.setText(value);
        } catch (error) {
            throw new Error(`Failed to fill text field: ${error.message}`);
        }
    }

    /**
     * Fill address field - handles shadow DOM components
     */
    async fillAddressField(section, fieldName, fieldValue) {
        logger.info("In Address field");
        const rows = await section.getRows();
        for (const row of rows) {
            const items = await row.getItems();
            for (const item of items) {
                try {
                    const inputAddress = await item.getInputAddress();
                    const lightningInput = await inputAddress.getInputAddress();

                    if (fieldName === 'Billing Country' || fieldName === 'Shipping Country') {
                        await this.fillCountryPicklist(lightningInput, fieldName, fieldValue);
                    }
                    else if (fieldName === 'Billing Street' || fieldName === 'Shipping Street') {
                        const streetField = await lightningInput.getStreetInput();
                        await streetField.clearAndEnterText(fieldValue);
                    }
                    else if (fieldName === 'Billing City' || fieldName === 'Shipping City') {
                        const cityField = await lightningInput.getCityInput();
                        await cityField.setText(fieldValue);
                    }
                    else if (fieldName === 'Billing Zip/Postal Code' || fieldName === 'Shipping Zip/Postal Code') {
                        const postalField = await lightningInput.getPostalCodeInput();
                        await postalField.setText(fieldValue);
                    }
                } catch (error) {
                    logger.warn(`Could not fill address field: ${fieldName}`, { error: error.message });
                }
            }
        }


    }

    /**
     * Fill country picklist
     */
    async fillCountryPicklist(lightningInput, fieldName, countryValue) {
        const dropDownField = await lightningInput.getCountryPicklist();
        const comboBoxField = await dropDownField.getComboBox();

        await this.scrollUTAMElementIntoView(comboBoxField);
        await comboBoxField.waitForVisible();

        const baseComboBox = await comboBoxField.getBase();
        await baseComboBox.expand();

        const options = await baseComboBox.getItems();
        for (const option of options) {
            const label = await option.getItemLabel();
            if (label === countryValue) {
                await option.clickItem();
                return;
            }
        }

        throw new Error(`Country option not found: ${countryValue}`);
    }

    /**
     * Scroll UTAM element into view
     */
    async scrollUTAMElementIntoView(utamElement) {
        try {
            // For UTAM elements, use scrollIntoView method if available
            if (typeof utamElement.scrollIntoView === 'function') {
                await utamElement.scrollIntoView({ block: 'center' });
            }
            // For WebDriver elements, get root and scroll
            else if (typeof utamElement.getRoot === 'function') {
                const element = await utamElement.getRoot();
                await element.scrollIntoView({ block: 'center' });
            }
            // Fallback: try browser scroll
            else {
                await browser.execute(() => window.scrollBy(0, 300));
            }

            await browser.pause(500); // Give time for scroll to complete
            logger.debug('✓ Element scrolled into view');
        } catch (error) {
            logger.warn('Could not scroll element into view', { error: error.message });
            // Don't throw - continue anyway
        }
    }


    /**
     * Find section by title
     */
    async getSection(recordLayout, sectionTitle) {
        const sections = await recordLayout.getSections();
        for (const section of sections) {
            const title = await section.getSectionTitle();
            const text = await title.getText();
            if (text === sectionTitle) return section;
        }
        throw new Error(`Section "${sectionTitle}" not found`);
    }



    /**
     * Fill country picklist (handles shadow DOM)
     */
    async fillCountryPicklist(item, fieldKey, countryValue) {
        const inputAddress = await item.getInputAddress();
        const lightningInput = await inputAddress.getInputAddress();
        const dropDownField = await lightningInput.getCountryPicklist();
        const comboBoxField = await dropDownField.getComboBox();
        const fieldName = await comboBoxField.getLabelText();
        if(fieldName === fieldKey) {
            const baseComboBoxField = await comboBoxField.getBase();
            await this.scrollUTAMElementIntoView(comboBoxField);
            await comboBoxField.waitForVisible();
            await baseComboBoxField.expand();
            const items = await baseComboBoxField.getItems();
            for (const item of items) {
                const itemLabel = await item.getItemLabel();
                //let value = fieldData[itemLabel];
                if (itemLabel === countryValue) {
                    await item.clickItem();
                    break;
                }
            }
        }
    }

    async fillTextArea(item, value) {
        try {
            // Get textarea input element
            const textArea = await item.getRecordTextArea()
                .then(w => w.getTextArea())
                .catch(() => item.getTextArea());
            await textArea.clearAndEnterText(value);
        } catch (error) {
            throw new Error(`Failed to fill textarea: ${error.message}`);
        }
    }


    async fillInputField(item, fieldKey, fieldValue) {
        const inputAddress = await item.getInputAddress();
        const lightningInput = await inputAddress.getInputAddress();
        let inputField;
        switch (fieldKey.replaceAll(' ', '_').toUpperCase()) {
            case 'BILLING_CITY' :
            case 'SHIPPING_CITY' :
                inputField = await lightningInput.getCityInput();
                break;
            case 'BILLING_ZIP/POSTAL_CODE' :
            case 'SHIPPING_ZIP/POSTAL_CODE' :
                inputField = await lightningInput.getPostalCodeInput();
                break;
        }
        const fieldName = await inputField.getLabelText();
        if(fieldName === fieldKey) {
            await inputField.setText(fieldValue);
        }
    }

    async fillPostalCodeField(item, fieldKey, fieldValue) {
        const inputAddress = await item.getInputAddress();
        const lightningInput = await inputAddress.getInputAddress();
        const inputField = await lightningInput.getPostalCodeInput();
        const fieldName = await inputField.getLabelText();
        if(fieldName === fieldKey) {
            await inputField.setText(fieldValue);
        }
    }


    async fillAddressInformation(recordLayout, addressData) {
        const sections = await recordLayout.getSections();
        let addressInformationSection;
        for (const section of sections) {
            const sectionTitle = await section.getSectionTitle();
            if (sectionTitle === 'Address Information') {
                addressInformationSection = await section;
                break;
            }
            const rows = await addressInformationSection.getRows();
            for (const row of rows) {
                const items = await row.getItems();
                for (const item of items) {
                    const inputAddresses = await item.getInputAddress();
                    for (const inputAddress of inputAddresses) {
                        const lightningInputs = await inputAddress.getInputAddress();
                        for (const lightningInput of lightningInputs) {
                            const lightningInputs = await inputAddress.getInputAddress();
                        }

                    }
                }

            }

        }
        let addressInformation = await addressInformationSection.getRows().get(0);
        let addressInformationItem = await addressInformation.getItems().get(0);
        let inputAddress = await addressInformationItem.getInputAddress();
    }

    async fillAddress(recordLayout, addressData) {
        const section = await this.getSection(recordLayout, ACCOUNT_SECTIONS.ADDRESS_INFO);
        const rows = await section.getRows();
        for (const row of rows) {
            const items = await row.getItems();
            for (const item of items) {
                for (const [fieldKey, fieldValue] of Object.entries(addressData)) {
                    let value;
                    if (fieldKey != null) {
                        value = fieldKey.replaceAll(' ', '_').toUpperCase();
                    }
                    if (FIELD_TYPES.DROPDOWN.has(value)) {
                        await this.fillCountryPicklist(item, fieldKey, addressData[fieldKey]);
                    } else if (FIELD_TYPES.TEXTAREA.has(value)){
                        await this.fillTextArea(item, fieldKey, addressData[fieldKey]);
                    } else if (FIELD_TYPES.INPUT.has(value)){
                        await this.fillInputField(item, fieldKey, addressData[fieldKey]);
                    }
                }
            }
        }
    }

    async fillAddress_Copy(recordLayout, addressData) {
        const section = await this.getSection(recordLayout, ACCOUNT_SECTIONS.ADDRESS_INFO);
        const rows = await section.getRows();
        for (const row of rows) {
            const items = await row.getItems();
            for (const item of items) {
                for (const [fieldKey, fieldValue] of Object.entries(addressData)) {
                    let value;
                    if (fieldKey != null) {
                        value = fieldKey.replaceAll(' ', '_').toUpperCase();
                    }
                    if (FIELD_TYPES.DROPDOWN.has(value)) {
                        await this.fillCountryPicklist(item, fieldKey, addressData[fieldKey]);
                    } else if (FIELD_TYPES.TEXTAREA.has(value)){
                        await this.fillTextArea(item, fieldKey, addressData[fieldKey]);
                    } else if (FIELD_TYPES.INPUT.has(value)){
                        await this.fillInputField(item, fieldKey, addressData[fieldKey]);
                    }
                }
            }
        }
    }

    async fillAccountInformation(recordLayout, testData) {
        const section = await this.getSection(recordLayout, ACCOUNT_SECTIONS.ACCOUNT_INFO);
        const rows = await section.getRows();
        for (const row of rows) {
            const items = await row.getItems();
            for (const item of items) {
                const label = await item.getLabelText();
                let fieldKey;
                if (label != null) {
                    fieldKey = label.replaceAll(' ', '_').toUpperCase();
                }
                let value = testData[label];
                if (!value)
                    continue;
                if (FIELD_TYPES.DROPDOWN.has(fieldKey)) {
                    await this.selectDropdownValue(item, value);
                } else if (FIELD_TYPES.BASE_INPUT.has(fieldKey) || FIELD_TYPES.INPUT.has(fieldKey)) {
                    if(label === 'Account Name') {
                        value = `${value}_${Date.now()}`;
                        scenarioContext.setContext('Account Name', value);
                        logger.info(`Creating account with name...${value}`);
                    }
                    await this.fillTextField(item, value);
                }
            }
        }
    }

    async verifyAccountsSortedRecent() {
        await browser.waitUntil(
            async () => {
                try {
                    const lv = await utam.load(ObjectHome);
                    const lvm = await lv.getListViewManager();
                    const cl = await lvm.getCommonListInternal();
                    listViewHeader = await cl.getHeader();
                    listViewName = await listViewHeader.getListViewTitleViaPicker();
                    return listViewName && listViewName.length > 0;
                } catch {
                    return false;
                }
            },
            { timeout: TIMEOUTS.PAGE_LOAD, interval: WAIT_INTERVALS.STANDARD, timeoutMsg: 'List view title did not load within 15s' }
        );
        expect(listViewName).toEqual('Recently Viewed');
    }

    async searchForAccount(accountName) {
        await browser.pause(4000);
        await this.chooseAppNavBar('Accounts');
        logger.info("Account name created - " + accountName);
        const pageObject = await utam.load(ObjectHome);
        const listViewMgr = await pageObject.getListViewManager();
        const commonList = await listViewMgr.getCommonListInternal();
        const header = await commonList.getHeader();
        const searchBar = await header.getSearchBar();
        const searchBarInput = await searchBar.getInput();
        await searchBarInput.setText(accountName);
        await searchBarInput.focus();
        await browser.keys(['Enter']);
        await browser.pause(7000);
    }

    async verifyAccountDisplay() {
        let expectedAccountName = scenarioContext.getContext('Account Name')
        const pageObject = await utam.load(ObjectHome);
        const listViewMgr = await pageObject.getListViewManager();
        const commonList = await listViewMgr.getCommonListInternal();
        const displayManager = await commonList.getDisplayManager();
        const primaryDisplay = await displayManager.getDisplay();
        const  grid = await primaryDisplay.getDisplayGrid();
        const dataTable = await grid.getDatatable();
        const rows = await dataTable.getRows();
        expect(rows.length).toEqual(1);
    }

    async scrollUTAMElementIntoView(utamElement) {
        try {
            const element = await utamElement.getRoot();
            await element.scrollToCenter();
            await browser.pause(500);
            console.log('Element scrolled into view');
        } catch (e) {
            console.warn('Failed to scroll element:', e.message);
        }
    }


}

export default new AccountCreation()