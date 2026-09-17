import { Given, When, Then } from '@cucumber/cucumber';
import loginPage from '../pageObjects/login.page.js';
import accountPage from '../pageObjects/account.creation.page.js';
import casePage from '../pageObjects/case.creation.page.js';
import scenarioContext from '../context/scenario_context.js';
import logger from '../utils/logger.js';

Then('I create a case', async function () {
  await accountPage.openNewAccountModal();
  await browser.pause(5000);
});
Then(/^I verify the following sections are displayed$/, async function (dataTable) {
  const expectedSections = dataTable.raw().map((row) => row[0].trim());
  await accountPage.verifySectionsDisplayed(expectedSections);
});

When('I search for the existing case {string}', async function (caseNumber) {
  await casePage.searchForCase(caseNumber);
});

When('I search for {string}', async function (searchTerm) {
  await casePage.searchForCase(searchTerm);
});

When('I search globally for {string}', async function (searchTerm) {
  await casePage.searchGlobal(searchTerm);
});

When('I select the global search result {string}', async function (searchTerm) {
  await casePage.selectGlobalSearchResult(searchTerm);
});

When('I click on the row {string} and wait for the url to contain {string}', async function (rowNumber, urlContains) {
  await casePage.openRecordFromRow(rowNumber, urlContains);
});

When('I read all the values from the Details tab', async function () {
  const values = await casePage.readAllDetailsTabValues();
  logger.info(`Read ${Object.keys(values).length} field(s) from the Details tab`);
  scenarioContext.setContext('caseDetailsValues', values);
});
