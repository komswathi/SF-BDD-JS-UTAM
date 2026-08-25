import { Given, When, Then } from '@cucumber/cucumber';
import loginPage from '../pageObjects/login.page.js';
import accountPage from '../pageObjects/account.creation.page.js';
import scenarioContext from '../context/scenario_context.js';
import logger from "../utils/logger.js";
import caseCreationPage from "../pageObjects/case.creation.page.js";

When('I create case with following details', async function(dataTable) {
  const rowData = dataTable.hashes()[0];
  logger.info(`Creating case with ${Object.keys(rowData).length} fields with account name ${rowData['Account Name']}`);
  await caseCreationPage.createCase(rowData);
});