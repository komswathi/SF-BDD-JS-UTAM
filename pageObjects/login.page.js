//import { ChainablePromiseElement } from 'webdriverio';
/*import dotenv from 'dotenv';
dotenv.config();*/
//import * as Constants from "../utils/userDetails.js";

let baseUrl = process.env.BASE_URL;
let scenarioContext = require('@wdio/cucumber-framework');
let Page = require('./page.js');
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours by default
import {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} from '../pageObjects/index.js';
class LoginPage extends Page {
    async logInSalesforce() {
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

    async openAppLauncherAndChooseApp(appName) {
        const container = await utam.load(DesktopLayoutContainer);
        const appNav = await container.getAppNav();
        const appLauncher = await (await appNav.getAppLauncherHeader()).getButton();
        await appLauncher.click();

        const menu = await utam.load(AppLauncherMenu);
        const search = await (await menu.getSearchBar()).getLwcInput();
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
            { timeout: 40000, interval: 500, timeoutMsg: 'App Launcher search returned no items' }
        );

        // find the item whose first line matches exactly 'Sales' to avoid clicking
        // 'Sales Console' or other apps with 'Sales' in the name
        let targetItem = items[0];
        for (const item of items) {
            try {
                const text = await (await item.getRoot()).getText();
                if (text.split('\n')[0].trim() === 'Sales') {
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
                    return name === 'Sales';
                } catch {
                    return false;
                }
            },
            { timeout: 40000, interval: 1000, timeoutMsg: 'App context did not switch to Sales within 30s' }
        );
    }

    async getAppContextName(appName) {
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
            { timeout: 40000, interval: 1000 }
        );
    }
}
module.exports = new LoginPage();
