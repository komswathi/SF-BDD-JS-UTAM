const { Given, When, Then } = require('@cucumber/cucumber');

const stepDefinitionPath = __filename;

const loginPage = require('../pageobjects/login.page');
const accountPage = require('../pageobjects/account.creation.page');
const scenarioContext = require('../context/scenario_context');

Given('I am logged into Salesforce', async () => {
  await loginPage.logInSalesforceWithMFA();
  //await loginPage.logInSalesforceViaAPI();
  scenarioContext.getScenarioContext().clear();
});

When('I open app launcher and choose {string}', async (appName) => {
  await loginPage.openAppLauncherAndChooseApp(appName);
  scenarioContext.setContext('selectedApp', appName);
});

Then('app context should display {string}', async (expectedApp) => {
  const actualApp = await loginPage.getAppContextName();
  expect(actualApp).toEqual(expectedApp);
});

Then('I navigate to {string} tab', async (tabName) => {
  await accountPage.chooseAppNavBar(tabName);
  scenarioContext.setContext('navigationTab', tabName);
});

Then('I verify accounts are sorted by recent', async () => {
  await accountPage.verifyAccountsSortedRecent();
});

When('I create account with following details', async (dataTable) => {
  const testData = {
    accountData: {},
    addressData: {}
  };

  const rows = dataTable.rows();
  rows.forEach((row) => {
    const field = row[0];
    const value = row[1];

    // Categorize fields
    if (field.includes('Billing') || field.includes('Shipping')) {
      testData.addressData[field] = value;
    } else {
      testData.accountData[field] = value;
    }
  });

  scenarioContext.setContext('testData', testData);
  scenarioContext.setContext('accountName', testData.accountData['Account Name']);
  await accountPage.createAccount(testData);
});

Then('I search for the created account', async () => {
  const accountName = scenarioContext.getContext('accountName');
  await accountPage.searchForAccount(accountName);
});

Then('account should be displayed in the list', async () => {
  await accountPage.verifyAccountDisplay();
});