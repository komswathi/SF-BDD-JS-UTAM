const { Given, When, Then } = require('@wdio/cucumber-framework');
const loginPage = require('../pageobjects/login.page.js');



Given('I logged into Salesforce as {string}', async (user) => {
    await loginPage.logInSalesforce();
});

When('I open app launcher and search for {string} app', async (appName) => {
   await loginPage.openAppLauncherAndChooseApp(appName);
});

Then('I verify that the app context switches to {string}', async (appName) => {
    let appContextDisplay = await loginPage.getAppContextName(appName);
    await expect(appContextDisplay).toBe(true);
});