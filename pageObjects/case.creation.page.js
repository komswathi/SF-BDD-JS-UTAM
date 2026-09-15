import logger from '../utils/logger.js';
import BasePage from './base.page.js';
import LwcDetailPanel from 'salesforce-pageobjects/records/pageObjects/lwcDetailPanel';
import FormattedText from 'salesforce-pageobjects/lightning/pageObjects/formattedText';
import { ObjectHome } from './index.js';
import { TIMEOUTS, WAIT_INTERVALS } from '../utils/salesforceConstants.js';

class CaseCreation extends BasePage {
  /**
   * Search the currently-open list view (e.g. Cases) by Case Number or any global search term.
   * Assumes the target tab is already open via a prior "I navigate to ... tab" step.
   */
  async searchForCase(caseNumber) {
    logger.info(`Searching for case: ${caseNumber}`);
    const pageObject = await utam.load(ObjectHome);
    const listViewMgr = await pageObject.getListViewManager();
    const commonList = await listViewMgr.getCommonListInternal();
    const header = await commonList.getHeader();
    const searchBar = await header.getSearchBar();
    const searchBarInput = await searchBar.getInput();
    await searchBarInput.setText(caseNumber);
    await searchBarInput.focus();
    await browser.keys(['Enter']);
    await browser.pause(TIMEOUTS.SEARCH_RESULTS);
  }

  /**
   * Click the primary-field link (Case Number) on a list-view row and wait for navigation.
   * rowNumber is 1-based (matches what's visible on screen); the datatable's own
   * data-row-number attribute is 0-based, so it is converted here.
   */
  async openRecordFromRow(rowNumber, urlContains, columnLabel = 'Case Number') {
    const pageObject = await utam.load(ObjectHome);
    const listViewMgr = await pageObject.getListViewManager();
    const commonList = await listViewMgr.getCommonListInternal();
    const displayManager = await commonList.getDisplayManager();
    const primaryDisplay = await displayManager.getDisplay();
    const grid = await primaryDisplay.getDisplayGrid();
    const dataTable = await grid.getDatatable();

    const rowIndex = Number(rowNumber) - 1;
    const cell = await dataTable.getCellByLabel(rowIndex, columnLabel);
    const formattedUrl = await cell.getFormattedUrlByLabel();
    const link = await formattedUrl.getUrlLink();
    await link.click();

    await browser.waitUntil(async () => (await browser.getUrl()).includes(urlContains), {
      timeout: TIMEOUTS.PAGE_LOAD,
      interval: WAIT_INTERVALS.STANDARD,
      timeoutMsg: `URL did not contain "${urlContains}" within timeout`
    });
    logger.info(`Navigated to record, URL now contains "${urlContains}"`);
  }

  /**
   * Read every field label/value pair from the record's Details tab using only predefined
   * salesforce-pageobjects types: records-lwc-detail-panel -> base-record-form -> record-layout
   * -> getAllItems(). getOutputField() is a UTAM container element, so FormattedText.getInnerText()
   * reads the rendered display value regardless of the field's actual renderer (phone/url/number/
   * text all render as plain visible text in view mode).
   */
  async readAllDetailsTabValues() {
    const detailPanel = await utam.load(LwcDetailPanel, {
      locator: utam.By.css('records-lwc-detail-panel')
    });
    const baseRecordForm = await detailPanel.getBaseRecordForm();
    const recordLayout = await baseRecordForm.getRecordLayout();
    const items = await recordLayout.getAllItems();

    const values = {};
    for (const item of items) {
      const label = (await item.getLabelText())?.trim();
      if (!label) continue;

      try {
        const outputContainer = await item.getOutputField(FormattedText);
        const value = (await outputContainer.getInnerText())?.trim() ?? '';
        values[label] = value;
        logger.info(`${label} = ${value}`);
      } catch (error) {
        logger.warn(`Could not read value for "${label}"`, { error: error.message });
      }
    }
    return values;
  }
}

export default new CaseCreation();
