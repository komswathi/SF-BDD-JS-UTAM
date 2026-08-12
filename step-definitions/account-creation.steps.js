import { Given, When, Then } from '@cucumber/cucumber';
import loginPage from '../pageObjects/login.page.js';
import accountPage from '../pageObjects/account.creation.page.js';
import scenarioContext from '../context/scenario_context.js';
import logger from "../utils/logger.js";

Given('I am logged into Salesforce', async function() {
  await loginPage.logInSalesforceIfNotLoggedIn();
  //await loginPage.logInSalesforceViaAPI();
  scenarioContext.getScenarioContext().clear();
});

When('I open app launcher and choose {string}', async function(appName) {
  await loginPage.openAppLauncherAndChooseApp(appName);
  scenarioContext.setContext('selectedApp', appName);
});

Then('app context should display {string}', async function(expectedApp) {
  const actualApp = await loginPage.getAppContextName();
  expect(actualApp).toEqual(expectedApp);
});

Then('I navigate to {string} tab', async function(tabName) {
  await accountPage.chooseAppNavBar(tabName);
  scenarioContext.setContext('navigationTab', tabName);
});

Then('I verify accounts are sorted by recent', async function() {
  await accountPage.verifyAccountsSortedRecent();
});

When('I create account with following details', async function(dataTable) {
  const scenarioName = this.scenarioName.replaceAll(' ', '_');
  const rowData = dataTable.hashes()[0];
  if (rowData['Account Name']) {
    rowData['Account Name'] = `${rowData['Account Name']}_${Date.now()}`;
  }
  logger.info('Printing scenario name - ' + `accountDetails_${scenarioName}`);
  scenarioContext.setContext(`accountDetails_${scenarioName}`, rowData);
  scenarioContext.setContext(`accountName_${scenarioName}`, rowData['Account Name']);

  logger.info(`Creating account with ${Object.keys(rowData).length} fields with account name ${rowData['Account Name']}`);
  await accountPage.createAccount(rowData);
});

Then('I search for the created account', async function()  {
  const scenarioName = this.scenarioName.replaceAll(' ', '_');
  const accountName = scenarioContext.getContext(`accountName_${scenarioName}`);
  await accountPage.searchForAccount(accountName);
});

Then('account should be displayed in the list', async function () {
  await accountPage.verifyAccountDisplay();
});