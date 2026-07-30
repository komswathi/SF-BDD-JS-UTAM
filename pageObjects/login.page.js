//import { ChainablePromiseElement } from 'webdriverio';
/*import dotenv from 'dotenv';
dotenv.config();*/
//import * as Constants from "../utils/userDetails.js";

let baseUrl = process.env.BASE_URL;
let Page = require('./page.js');
const BasePage = require('./base.page.js');
const axios = require('axios');
const speakeasy = require('speakeasy');
const { getDecryptedSecrets } = require('../utilities/common.js');

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours by default
const {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} = require('../pageObjects/index.js');

class LoginPage extends BasePage {
    get emailInput() { return ("input[type='email']")}
    get passwordInput () {return ("input[type='password']");}
    get submitButton () {return ("input[type='submit']");}
    get otpInput () {return ("input[id='tc']");}
    get saveButton () {return (("input[id='save']"));}

    async logInSalesforce_copy() {
        // Check environment variables
        ['SALESFORCE_LOGIN_URL', 'SALESFORCE_LOGIN_TIME'].forEach((varName) => {
            if (!process.env[varName]) {
                throw new Error(`Missing ${varName} environment variable`);
            }
        });
        const { SALESFORCE_LOGIN_URL, SALESFORCE_LOGIN_TIME } = process.env;

        // Check for Salesforce session timeout
        if (new Date().getTime() - parseInt(SALESFORCE_LOGIN_TIME, 10) > SESSION_TIMEOUT) {
            throw new Error(`Salesforce session timed out. Re-authenticate before running tests.`);
        }


        // Navigate to login URL
        await browser.navigateTo(SALESFORCE_LOGIN_URL);

        // Wait until the OTP/frontdoor redirect completes and we are on a Lightning page.
        // The URL transitions: frontdoor.jsp → contentDoor → lightning.force.com/lightning[/...]
        // We accept any lightning.force.com URL that is not an intermediate redirect page.
        const domDocument = utam.getCurrentDocument();
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl();
                return url.includes('.force.com/lightning') && !url.includes('frontdoor') && !url.includes('contentDoor');
            },
            { timeout: 60000, interval: 500, timeoutMsg: 'Did not reach a Lightning page within 60s after login' }
        );
        return domDocument;
    }

    async logInSalesforce() {
        // Get decrypted secrets from utilities/common.js
        const decrypted = getDecryptedSecrets();
        const { SF_ORG_URL, SF_USERNAME, SF_PASSWORD, SF_TOTP_SECRET } = decrypted;

        if (!SF_ORG_URL || !SF_USERNAME || !SF_PASSWORD || !SF_TOTP_SECRET) {
            throw new Error(`Missing required credentials in environment`);
        }

        const domDocument = utam.getCurrentDocument();

        await browser.navigateTo(SF_ORG_URL);

        const totpCode = speakeasy.totp({
            secret: SF_TOTP_SECRET,
            encoding: 'base32'
        });

        await Promise.all([
            this.fillInput(this.emailInput, SF_USERNAME),
            this.fillInput(this.passwordInput, SF_PASSWORD)
        ]);

        await this.clickElement(this.submitButton);

        // Enter OTP and save
        await this.fillInput(this.otpInput, totpCode);
        await this.clickElement(this.saveButton);

        return domDocument;
    }


    async fillInput(selector, value) {
        const element = await browser.$(selector);
        await element.waitForDisplayed({ timeout: this.loginTimeout });
        await element.setValue(value);
    }

    async clickElement(selector) {
        const element = await browser.$(selector);
        await element.waitForDisplayed({ timeout: this.loginTimeout });
        await element.click();
    }


    async logInSalesforceViaAPI() {
        let accessToken;
        let response;
        try {
             response = await axios.post(
                'https://orgfarm-caf1480b47-dev-ed.develop.my.salesforce.com/services/oauth2/token',
                {
                    grant_type: 'password',
                    client_id: process.env.SF_CLIENT_ID,
                    client_secret: process.env.SF_CLIENT_SECRET,
                    username: process.env.SF_USERNAME,
                    password: process.env.SF_PASSWORD
                }
            );

            let accessToken = response.data.access_token;
            console.log('Auth token generated:', accessToken);

            // Store for later use
            global.sfAuthToken = accessToken;

        } catch (e) {
            console.log('Auth token error:', e.message);
        }


        // Navigate to login URL
        let baseUrl = process.env.SALESFORCE_LOGIN_PAGE;
        await browser.navigateTo(baseUrl);

/*
        // Set cookie with auth token
        await browser.addCookie({
            name: 'sid',
            value: accessToken,
            domain: 'orgfarm-caf1480b47-dev-ed.develop.my.salesforce.com',
            path: '/',
            httpOnly: false,
            secure: true
        });

        // Reload page with cookie set
        await browser.refresh();*/
    }

    async openAppLauncherAndChooseApp(appName) {
        const container = await utam.load(DesktopLayoutContainer);
        const appNav = await container.getAppNav();
        const appLauncher = await (await appNav.getAppLauncherHeader()).getButton();
        await appLauncher.click();

        const menu = await utam.load(AppLauncherMenu);
        const search = await (await menu.getSearchBar()).getLwcInput();
        await browser.pause(2000);
        await search.setText(appName);

        // retry getItems() until search results are available — implicitTimeout is 0
        // so UTAM does not wait internally when search results are still loading
        let items;
        await browser.waitUntil(
            async () => {
                try {
                    items = await menu.getItems();
                    return items.length > 0;
                } catch {
                    return false;
                }
            },
            { timeout: 25000, interval: 500, timeoutMsg: 'App Launcher search returned no items' }
        );

        // find the item whose first line matches exactly 'Sales' to avoid clicking
        // 'Sales Console' or other apps with 'Sales' in the name
        let targetItem = items[0];
        for (const item of items) {
            try {
                const text = await (await item.getRoot()).getText();
                if (text.split('\n')[0].trim() === appName) {
                    targetItem = item;
                    break;
                }
            } catch {
                // skip unreadable item
            }
        }
        await (await targetItem.getRoot()).click();

        // the app context switch is asynchronous — the URL changes immediately but
        // the nav bar app name updates shortly after; retry until it shows 'Sales'
        await browser.waitUntil(
            async () => {
                try {
                    const c = await utam.load(DesktopLayoutContainer);
                    const nav = await c.getAppNav();
                    const name = await (await nav.getAppName()).getText();
                    return name === appName;
                } catch {
                    return false;
                }
            },
            { timeout: 40000, interval: 1000, timeoutMsg: 'App context did not switch to Sales within 30s' }
        );
    }

    async getAppContextName() {
        const appNavAfterNav = await (await utam.load(DesktopLayoutContainer)).getAppNav();
        const appName = await (await appNavAfterNav.getAppName()).getText();
        return appName
    }
}
module.exports = new LoginPage();
