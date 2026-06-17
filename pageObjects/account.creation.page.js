//import { ChainablePromiseElement } from 'webdriverio';
/*import dotenv from 'dotenv';
dotenv.config();*/
//import * as Constants from "../utils/userDetails.js";

let BasePage = require('./base.page.js');
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

let listViewHeader;
let listViewName;
const dropdownFields = new Set(['RATING', 'TYPE', 'OWNERSHIP', 'INDUSTRY']);
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
    'Billing Country' : 'United Kingdom',
    'Billing Street': 'test',
    'Billing City' : 'London',
    'Billing Zip/Postal Code' : 'ABC DEF',
    'Shipping Country': 'United Kingdom',
    'Shipping Street' : 'test',
    'Shipping City' : 'London',
    'Shipping Zip/Postal Code' : 'ABC DEF',
}

const {
    AppLauncherMenu,
    RecordLayoutItem,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} = require('../pageObjects/index.js');
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
        //await this.fillAddressInformation(recordLayout, addressData);
        // click modal save button and wait for modal to close
        await recordForm.clickFooterButton('Save');
        await modal.waitForAbsence();
    }

    async verifyAccountCreatedSuccessMessage() {
        const message = 'Account "gertge" was created.';
        const regex = /Account ".+?" was created\./;
        expect(message).toMatch(regex);
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
            const rows = await section.getRows();
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
                const value = fieldData[label];
                if (!value)
                    continue;
                if (dropdownFields.has(fieldName)) {
                    await this.chooseDropdown(item, value);
                } else if (baseInputFields.has(fieldName)) {
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
