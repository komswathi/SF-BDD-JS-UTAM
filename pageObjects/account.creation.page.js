const logger = require('../utils/logger');
let BasePage = require('./base.page.js');

let listViewHeader;
let listViewName;


const dropdownFields = new Set(['RATING', 'TYPE', 'OWNERSHIP', 'INDUSTRY', 'BILLING_COUNTRY']);
const baseInputFields = new Set(['ACCOUNT_NAME', 'ACCOUNT_NUMBER', 'ACCOUNT_SITE', 'TICKER_SYMBOL', 'ANNUAL_REVENUE', 'SIC_CODE']);
const inputFields = new Set(['PHONE', 'FAX', 'WEBSITE', 'EMPLOYEES', 'SLA_SERIAL_NUMBER']);
//const textAreaFields = new Set(['BILLING_STREET', 'SHIPPING_STREET', 'DESCRIPTION']);
const fieldData = {
    'Rating': 'Hot',
    'Account Name': 'UTAM Test Account',
    'Phone': '555-1234567',
    'Fax': '1234',
    'Account Number': '1234',
    'Website': 'test',
    'Account Site': 'test',
    'Ticker Symbol': 'test',
    'Type': 'Other',
    'Ownership': 'Public',
    'Industry': 'Banking',
    'Employees': '4',
    'Annual Revenue' : '2345',
    'SIC Code' : '1234567',
    'Customer Priority': 'Low',
    'SLA' : 'Silver',
    'SLA Expiration Date' : '',
    'SLA Serial Number': '123',
    'Number of Locations' : '4',
    'Upsell Opportunity' : 'No',
    'Active' : 'Yes',
    'Description': 'test'
};

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

const {
    AppLauncherMenu,
    RecordLayoutItem,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer,
    RecordLayoutInputAddress
} = require('../pageObjects/index.js');
import { By } from '@utam/core';

class AccountCreation extends BasePage {

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

    async getAppContextName() {
        const appNavAfterNav = await (await utam.load(DesktopLayoutContainer)).getAppNav();
        const appName = await (await appNavAfterNav.getAppName()).getText();
        return appName
    }

    async createAccount() {
        const actionsContainer = await listViewHeader.getAuraActionsContainer();
        await (await actionsContainer.getActionLink('New')).click();
        const modal = await utam.load(RecordActionWrapper);
        const recordForm = await modal.getRecordForm();
        const recordLayout = await recordForm.getRecordLayout();
        await recordLayout.waitForSections();
        await this.fillAccountInformation(recordLayout, fieldData);
        //await this.fillBillingCountry('United Kingdom');
        await this.fillAddress(recordLayout, addressData);
        // click modal save button and wait for modal to close
        await recordForm.clickFooterButton('Save');
        await modal.waitForAbsence();
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
        //const option = await browser.$(`lightning-base-combobox-item[data-value="${ratingValue}"]`);
        //let spanEle = await option.$('[title="Warm"]');
        await option.click();
        console.log(`✓ Rating selected: ${ratingValue}`);
        await dd.click();
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
        //const option = await browser.$(`[title="${countryVal}"]`);
        await option.click();
    }

    async fillBillingCountry1(country) {
        // Step 1: Get address section
        await browser.pause(2000);

        // Get element via JavaScript (pierces shadow DOM)
        const recordLayoutElement = await browser.execute(() => {
            return document.querySelector('records-record-layout-input-address');
        });

        if (!recordLayoutElement) {
            throw new Error('Element not found');
        }

        // Load UTAM PO
        const recordLayout = await utam.load(RecordLayoutInputAddress, recordLayoutElement);
        const inputAddress = await recordLayout.getInputAddress();
        const countryPicklist = await inputAddress.getCountryPicklist();
        const combobox = await countryPicklist.getComboBox();
        const baseCombobox = await combobox.getBase();

        // Step 7: Select by value
        await baseCombobox.selectItemByValue('United Kingdom');
    }

    async fillAddressInformation1(recordLayout, addressData) {
        // Step 1: Get all sections
        const sections = await recordLayout.getSections();

        // Step 2: Find 'Address Information' section
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

        // Step 3: Get rows in that section
        const rows = await addressSection.getRows();

        // Step 4: Get first row (Billing Address)
        const firstRow = rows[0];

        // Step 5: Get items in row
        const items = await firstRow.getItems();

        // Step 6: Get first item (has billing country combobox)
        const firstItem = items[0];

        // Step 7: Get InputAddress component
        const inputAddress = await firstItem.getInputAddress();

        // Step 8: Now call the actual methods
        await inputAddress.setBillingCountry(addressData.billingCountry);
        await inputAddress.setBillingStreet(addressData.billingStreet);
        await inputAddress.setBillingCity(addressData.billingCity);
        // ... other fields
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

    async fillAddress(recordLayout, fieldData) {
        const sections = await recordLayout.getSections();
        let addressInformationSection;
        for (const section of sections) {
            const sectionTitle = await section.getSectionTitle();
            const sectionText = await sectionTitle.getText();
            if (sectionText === 'Address Information') {
                addressInformationSection = await section;
                break;
            }
        }
        const rows = await addressInformationSection.getRows();
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


    async fillAccountInformation(recordLayout, fieldData) {
        const sections = await recordLayout.getSections();
        let accountInformationSection;
        for (const section of sections) {
            const sectionTitle = await section.getSectionTitle();
            const sectionText = await sectionTitle.getText();
            if (sectionText === 'Account Information') {
                accountInformationSection = await section;
                break;
            }
        }
        const rows = await accountInformationSection.getRows();
        for (const row of rows) {
            const items = await row.getItems();
            for (const item of items) {
                const label = await item.getLabelText();
                let fieldName;
                if (label != null) {
                    fieldName = label.replaceAll(' ', '_').toUpperCase();
                }
                let value = fieldData[label];
                if (!value)
                    continue;
                if (dropdownFields.has(fieldName)) {
                    await this.chooseDropdown(item, value);
                } else if (baseInputFields.has(fieldName)) {
                    if(label === 'Account Name') {
                        value = `${value}_${Date.now()}`;
                        logger.info(`Creating account with name...${value}`);
                    }
                    await this.enterBaseInputField(item, value);
                } else if (inputFields.has(fieldName)) {
                    await this.enterInputField(item, value);
                }
            }
        }
    }

    async chooseDropdown(item, value) {
        console.log(await item);
        const dropDownField = await item.getPicklist();
        const baseComboBoxField = await dropDownField.getBaseCombobox();
        await baseComboBoxField.expand();
        const items = await baseComboBoxField.getItems();
        for (const item of items) {
            const itemLabel = await item.getItemLabel();
            if (itemLabel === value) {
                await item.clickItem();
                break;
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
}
module.exports = new AccountCreation();
