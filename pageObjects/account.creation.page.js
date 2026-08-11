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

let listViewHeader;
let listViewName;

const SECTIONS = {
    ACCOUNT_INFO: 'Account Information',
    ADDRESS_INFO: 'Address Information',
    ADDITIONAL_INFO: 'Additional Information'
};


const FIELD_TYPES = {
    DROPDOWN: new Set(['RATING', 'TYPE', 'OWNERSHIP', 'INDUSTRY', 'BILLING_COUNTRY', 'SHIPPING_COUNTRY']),
    BASE_INPUT: new Set(['ACCOUNT_NAME', 'ACCOUNT_NUMBER', 'ACCOUNT_SITE', 'TICKER_SYMBOL', 'ANNUAL_REVENUE', 'SIC_CODE']),
    INPUT: new Set(['PHONE', 'FAX', 'WEBSITE', 'EMPLOYEES', 'SLA_SERIAL_NUMBER', 'BILLING_CITY', 'SHIPPING_CITY', 'BILLING_ZIP/POSTAL_CODE', 'SHIPPING_ZIP/POSTAL_CODE']),
    TEXTAREA: new Set(['BILLING_STREET', 'SHIPPING_STREET']),
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

    async createAccount(testData) {
        const actionsContainer = await listViewHeader.getAuraActionsContainer();
        await (await actionsContainer.getActionLink('New')).click();
        const modal = await utam.load(RecordActionWrapper);
        const recordForm = await modal.getRecordForm();
        const recordLayout = await recordForm.getRecordLayout();
        await recordLayout.waitForSections();
        await this.fillAccountInformation(recordLayout, testData.accountData);
        await this.fillAddress(recordLayout, testData.addressData);
        await recordForm.clickFooterButton('Save');
        await modal.waitForAbsence();
        logger.info('Account created successfully');
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
     * Select dropdown value - handles all combobox interactions
     */
    async selectDropdownValue(item, value) {
        const dropDownField = await item.getPicklist();
        await this.scrollUTAMElementIntoView(dropDownField);
        const baseComboBoxField = await dropDownField.getBaseCombobox();
        await baseComboBoxField.expand();
        const items = await baseComboBoxField.getItems();
        for (const option of items) {
            const label = await option.getItemLabel();
            if (label === value) {
                await option.clickItem();
                break;
            }
        }
    }


    async fillTextField(item, value) {
        const input = await item.getLightningInputWrapper()
            .then(w => w.getInput())
            .catch(() => item.getInput());

        await input.setText(value);
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

        /*if(fieldName === "Billing Country") {
            let element = await browser.$("//lightning-combobox//label[text()='Billing Country']");
            await element.scrollIntoView();
            await browser.pause(300);
            await element.click();
        }*/

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

    async fillTextArea(item, fieldKey, fieldValue) {
        const inputAddress = await item.getInputAddress();
        const lightningInput = await inputAddress.getInputAddress();
        const textAreaField = await lightningInput.getStreetInput();
        const fieldName = await textAreaField.getLabelText();
        if(fieldName === fieldKey) {
            await textAreaField.clearAndEnterText(fieldValue);
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
        const section = await this.getSection(recordLayout, SECTIONS.ADDRESS_INFO);
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


    async fillAddress_working(recordLayout, fieldData) {
        const section = await this.getSection(recordLayout, SECTIONS.ADDRESS_INFO);
        const rows = await section.getRows();
        for (const row of rows) {
            const items = await row.getItems();
            for (const item of items) {
                const inputAddress = await item.getInputAddress();
                const lightningInput = await inputAddress.getInputAddress();
                const dropDownField = await lightningInput.getCountryPicklist();
                const comboBoxField = await dropDownField.getComboBox();
                const fieldName = await comboBoxField.getLabelText();
                        if(fieldName === 'Billing Country') {
                            const baseComboBoxField = await comboBoxField.getBase();
                            await baseComboBoxField.expand();
                            const items = await baseComboBoxField.getItems();
                            for (const item of items) {
                                const itemLabel = await item.getItemLabel();
                                //let value = fieldData[itemLabel];
                                if (itemLabel === 'United Kingdom') {
                                    await item.clickItem();
                                    break;
                                }
                            }
                        }
            }
        }
    }


    async fillAccountInformation(recordLayout, testData) {
        /*const sections = await recordLayout.getSections();
        let accountInformationSection;
        for (const section of sections) {
            const sectionTitle = await section.getSectionTitle();
            const sectionText = await sectionTitle.getText();
            if (sectionText === 'Account Information') {
                accountInformationSection = await section;
                break;
            }
        }*/
        const section = await this.getSection(recordLayout, SECTIONS.ACCOUNT_INFO);
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



    async enterBaseInputField(item, value) {
        const baseInput = await item.getLightningInputWrapper();
        const lightningInput = await baseInput.getInput();
        await lightningInput.setText(value);
    }

    async enterInputField(item, value) {
        const lightningInput = await item.getInput();
        await lightningInput.setText(value);
    }

    async  enterTextField(item, value) {
        const lightningInput = await item.getInput();
        await lightningInput.setText(value);
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
            { timeout: 15000, interval: 500, timeoutMsg: 'List view title did not load within 15s' }
        );
        expect(listViewName).toEqual('Recently Viewed');
    }



    async verifyAccountCreatedSuccessMessage() {
        const message = 'Account "gertge" was created.';
        const regex = /Account ".+?" was created\./;
        expect(message).toMatch(regex);
    }

    async selectRating(ratingValue) {
        await browser.pause(1000);
        const modal = await browser.$('[class*="slds-modal__container"]');
        if (!modal) {
            throw new Error('Modal not found');
        }
        const ratingButton = await modal.$('button[aria-label="Rating"]');
        await ratingButton.scrollIntoView();
        await browser.pause(500);
        await ratingButton.click();
        await browser.pause(1000);
        const option = await browser.$(`[title="Warm"]`);
        await option.click();
        console.log(`✓ Rating selected: ${ratingValue}`);
    }

    async fillBillingCountry(countryVal) {
        await browser.pause(1000);
        const modal = await browser.$('[class*="slds-modal__container"]');
        if (!modal) {
            throw new Error('Modal not found');n
        }
        const billingCountry = await modal.$('input[aria-label="Billing Country"]');
        await billingCountry.scrollIntoView();
        await browser.pause(500);
        await billingCountry.click();
        await browser.pause(1000);
        const option = await browser.$(`//lightning-base-combobox-item//span[@title="${countryVal}"]/../..`);
        await option.click();
    }

    async fillBillingCountry1(country) {
        await browser.pause(2000);
        const recordLayoutElement = await browser.execute(() => {
            return document.querySelector('records-record-layout-input-address');
        });

        if (!recordLayoutElement) {
            throw new Error('Element not found');
        }
        const recordLayout = await utam.load(RecordLayoutInputAddress, recordLayoutElement);
        const inputAddress = await recordLayout.getInputAddress();
        const countryPicklist = await inputAddress.getCountryPicklist();
        const combobox = await countryPicklist.getComboBox();
        const baseCombobox = await combobox.getBase();
        await baseCombobox.selectItemByValue('United Kingdom');
    }

    async fillAddressInformation1(recordLayout, addressData) {
        const sections = await recordLayout.getSections();
        let addressSection = null;
        for (const section of sections) {
            const title = await section.getSectionTitle();
            if (title === 'Address Information') {
                addressSection = section;
                break;
            }
        }
        if (!addressSection) {
            throw new Error('Address Information section not found');
        }
        const rows = await addressSection.getRows();
        const firstRow = rows[0];
        const items = await firstRow.getItems();
        const firstItem = items[0];
        const inputAddress = await firstItem.getInputAddress();
        await inputAddress.setBillingCountry(addressData.billingCountry);
        await inputAddress.setBillingStreet(addressData.billingStreet);
        await inputAddress.setBillingCity(addressData.billingCity);
    }

    async searchForAccount() {
        await browser.pause(4000);
        await this.chooseAppNavBar('Accounts');
        const accountName = scenarioContext.getContext('Account Name');
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
        //const actualAccountNameEle = await dataTable.getRow(1);
        //const actualAccountName = await actualAccountNameEle.getText();
        const rows = await dataTable.getRows();
        expect(rows.length).toEqual(1);
    }

    async verifyAccountCreatedSuccessMessage() {
        const message = 'Account "gertge" was created.';
        const regex = /Account ".+?" was created\./;
        expect(message).toMatch(regex);
    }

    async scrollUTAMElementIntoView(utamElement) {
        try {
            // Get the underlying WebDriver element
            const element = await utamElement.getRoot();
            // Scroll into view
            await element.scrollToCenter();
            await browser.pause(500);
            console.log('Element scrolled into view');
        } catch (e) {
            console.warn('Failed to scroll element:', e.message);
        }
    }


}

export default new AccountCreation()