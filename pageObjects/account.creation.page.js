//import { ChainablePromiseElement } from 'webdriverio';
/*import dotenv from 'dotenv';
dotenv.config();*/
//import * as Constants from "../utils/userDetails.js";

import {error} from "@salesforce/sfdx-lwc-jest/src/log";
let baseUrl = process.env.BASE_URL;
let Page = require('./page.js');
let BasePage = require('./base.page.js');
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

let listViewHeader;
let listViewName;

const dropdownFields = new Set(['RATING', 'TYPE', 'OWNERSHIP', 'INDUSTRY', 'BILLING_COUNTRY', 'SHIPPING_COUNTRY', 'CUSTOMER_PRIORITY']);
const baseInputFields = new Set(['ACCOUNT_NAME', 'ACCOUNT_NUMBER', 'ACCOUNT_SITE', 'TICKER_SYMBOL', 'ANNUAL_REVENUE', 'SIC_CODE']);
const inputFields = new Set(['PHONE', 'FAX', 'WEBSITE', 'EMPLOYEES', 'SLA_SERIAL_NUMBER', 'BILLING_CITY', 'SHIPPING_CITY', 'BILLING_ZIP/POSTAL_CODE', 'SHIPPING_ZIP/POSTAL_CODE']);
const textAreaFields = new Set(['BILLING_STREET', 'SHIPPING_STREET', 'DESCRIPTION']);
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
    'Billing Country' : 'United Kingdom',
    'Billing Street': 'test',
    'Billing City' : 'London',
    'Billing Zip/Postal Code' : 'ABC DEF',
    'Shipping Country': 'United Kingdom',
    'Shipping Street' : 'test',
    'Shipping City' : 'London',
    'Shipping Zip/Postal Code' : 'ABC DEF',
    'Customer Priority': 'Low',
    'SLA' : 'Silver',
    'SLA Expiration Date' : '',
    'SLA Serial Number': '123',
    'Number of Locations' : '4',
    'Upsell Opportunity' : 'No',
    'Active' : 'Yes',
    'Description': 'test'
};

const {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} = require('../pageObjects/index.js');
class AccountCreation extends BasePage {


    async  chooseDropdown(item, value) {
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

    async  enterBaseInputField(item, value) {
        const baseInput = await item.getLightningInputWrapper();
        const lightningInput = await baseInput.getInput();
        await lightningInput.setText(value);
    }

    async  enterInputField(item, value) {
        const lightningInput = await item.getInput();
        await lightningInput.setText(value);
    }

    async  enterTextField(item, value) {
        const lightningInput = await item.getInput();
        await lightningInput.setText(value);
    }

    async  fillFormFields(recordLayout, fieldData) {
        const sections = await recordLayout.getSections();
        for (const section of sections) {
            const rows = await section.getRows();
            for (const row of rows) {
                const items = await row.getItems();
                for (const item of items) {
                    const label = await item.getLabelText();
                    let fieldName;
                    if(label != null) {
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
                    } else if(textAreaFields.has(fieldName)) {
                        await this.enterTextField(item, value);
                    }
                }
            }
        }
    }

    async createAccount() {
        const actionsContainer = await listViewHeader.getAuraActionsContainer();
        await (await actionsContainer.getActionLink('New')).click();
        const modal = await utam.load(RecordActionWrapper);
        const recordForm = await modal.getRecordForm();
        const recordLayout = await recordForm.getRecordLayout();
        await recordLayout.waitForSections();
        await this.fillFormFields(recordLayout, fieldData);
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

        // assert that you have selected the correct list view
        expect(listViewName).toEqual('Recently Viewed');
    }

    async getAppContextName() {
        const appNavAfterNav = await (await utam.load(DesktopLayoutContainer)).getAppNav();
        const appName = await (await appNavAfterNav.getAppName()).getText();
        return appName
    }
}
module.exports = new AccountCreation();
