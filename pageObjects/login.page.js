import BasePage from './base.page.js';
import axios from 'axios';
import speakeasy from 'speakeasy';
import { generate, createGuardrails } from 'otplib';
import {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} from './index.js';
import {TIMEOUTS, WAIT_INTERVALS} from "../utils/salesforceConstants.js";

const SESSION_TIMEOUT = 2 * 60 * 60 * 100;

class LoginPage extends BasePage {
    get emailInput() { return ("input[type='email']")}
    get passwordInput () {return ("input[type='password']");}
    get submitButton () {return ("input[type='submit']");}
    get otpInput () {return ("input[id='tc']");}
    get saveButton () {return (("input[id='save']"));}
    get appNav () {return ("one-appnav")}

    async logInSalesforce() {
        ['SF_ORG_URL', 'SF_USERNAME', 'SF_PASSWORD', 'SF_TOTP_SECRET'].forEach((varName) => {
            if (!process.env[varName]) {
                throw new Error(`Missing ${varName} environment variable`);
            }
        });
        const { SF_ORG_URL, SF_USERNAME, SF_PASSWORD, SF_TOTP_SECRET } = process.env;
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

    async logInSalesforceIfNotLoggedIn() {
        try {
            console.log('Attempting to login...');
            await this.logInSalesforceWithMFA();
            console.log('Already logged in or login successful');

        } catch (e) {
            console.error('Login failed:', e.message);
            throw e;
        }
    }

    async logInSalesforceWithMFA() {
        try {
            const url = await browser.getUrl();
            if (url.includes('lightning') && !url.includes('login')) {
                console.log('Already logged in');
                await browser.navigateTo(process.env.SF_ORG_URL);
                return;
            }
        } catch (e) {
        }

        const { SF_ORG_URL, SF_USERNAME, SF_PASSWORD, SF_TOTP_SECRET } = process.env;

        if (!SF_ORG_URL || !SF_USERNAME || !SF_PASSWORD || !SF_TOTP_SECRET) {
            throw new Error(`Missing required credentials in environment`);
        }

        await browser.navigateTo(SF_ORG_URL);

        // Fill login form
        await Promise.all([
            this.fillInput(this.emailInput, atob(SF_USERNAME)),
            this.fillInput(this.passwordInput, atob(SF_PASSWORD))
        ]);
        await this.clickElement(this.submitButton);

        // TOTP with retry
        let lastError;
        for (let attempt = 1; attempt <= 6; attempt++) {
            try {
                console.log(`TOTP attempt ${attempt}/3`);

                const token = await generate({
                    secret: atob(SF_TOTP_SECRET),
                    guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }),
                });

                await this.fillInput(this.otpInput, token);
                await this.clickElement(this.saveButton);

                // Wait for redirect to Lightning
                await browser.waitUntil(
                    async () => {
                        const url = await browser.getUrl();
                        return url.includes('lightning') && !url.includes('login');
                    },
                    { timeout: TIMEOUTS.PAGE_LOAD, timeoutMsg: 'Did not redirect to Lightning' }
                );

                console.log('✓ Login successful');
                return;

            } catch (e) {
                lastError = e;
                console.error(`Attempt ${attempt} failed:`, e.message);

                if (attempt < 3) {
                    await browser.pause(5000);
                }
            }
        }

        throw new Error(`Login failed after 3 TOTP attempts: ${lastError.message}`);
    }


    async logInSalesforceWithMFA_WithoutRetry() {
        const { SF_ORG_URL, SF_USERNAME, SF_PASSWORD, SF_TOTP_SECRET } = process.env;

        if (!SF_ORG_URL || !SF_USERNAME || !SF_PASSWORD || !SF_TOTP_SECRET) {
            throw new Error(`Missing required credentials in environment`);
        }

        const domDocument = utam.getCurrentDocument();
        await browser.navigateTo(SF_ORG_URL);
        // Generate TOTP with otplib
        let token;
            token = await generate({
                secret: atob(SF_TOTP_SECRET),
                guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }),
            });

        await Promise.all([
            this.fillInput(this.emailInput, atob(SF_USERNAME)),
            this.fillInput(this.passwordInput, atob(SF_PASSWORD))
        ]);
        await this.clickElement(this.submitButton);
        // Enter OTP and save
        await this.fillInput(this.otpInput, process.env.TOTP_CODE);
        await this.clickElement(this.saveButton);
        await browser.$(this.appNav).waitForDisplayed({timeout : TIMEOUTS.ELEMENT_VISIBLE, timeoutMsg : "App navigation is not displayed"});
        /*await browser.waitUntil(
                async () => ( await $(this.totpError).isDisplayed(),
                {
                   timeout : 2000,
                   timeoutMsg : "TOTP error is displayed"
                }
            )
        );*/
        return domDocument;
    }

    async fillInput(selector, value) {
        const element = await browser.$(selector);
        await element.waitForDisplayed({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        await element.setValue(value);
    }

    async clickElement(selector) {
        const element = await browser.$(selector);
        await element.waitForDisplayed({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
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
       /* const container = await browser.waitUntil(async () =>
                await utam.load(DesktopLayoutContainer),
            { timeout: 20000, timeoutMsg: 'DesktopLayoutContainer not loaded' }
        );*/

        let container = await utam.load(DesktopLayoutContainer);
        try {
            let appNav = await container.getAppNav();
            let appLauncher = await (await appNav.getAppLauncherHeader()).getButton();
            await appLauncher.click();
        } catch (e) {
            let appNav = await container.getAppNav();
            let appLauncher = await (await appNav.getAppLauncherHeader()).getButton();
            await appLauncher.click();
        }
        let menu = await utam.load(AppLauncherMenu);
        let search = await (await menu.getSearchBar()).getLwcInput();
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
            { timeout: 25000, interval: WAIT_INTERVALS.ELEMENT, timeoutMsg: 'App Launcher search returned no items' }
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
            { timeout: TIMEOUTS.ONE_MINUTE, interval: WAIT_INTERVALS.STANDARD, timeoutMsg: 'App context did not switch to Sales within 30s' }
        );
    }

    async getAppContextName() {
        const appNavAfterNav = await (await utam.load(DesktopLayoutContainer)).getAppNav();
        const appName = await (await appNavAfterNav.getAppName()).getText();
        return appName
    }
}

export default new LoginPage()
