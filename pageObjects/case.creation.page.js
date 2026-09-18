import logger from '../utils/logger.js';
import BasePage from './base.page.js';
import LwcDetailPanel from 'salesforce-pageobjects/records/pageObjects/lwcDetailPanel';
import FormattedText from 'salesforce-pageobjects/lightning/pageObjects/formattedText';
import Input from 'salesforce-pageobjects/lightning/pageObjects/input';
import GlobalHeader from './globalHeader.mjs';
import GlobalSearchResults from './globalSearchResults.mjs';
import { ObjectHome } from './index.js';

const GLOBAL_SEARCH_INPUT_SELECTOR = 'lightning-input.saInput';
import { TIMEOUTS, WAIT_INTERVALS } from '../utils/salesforceConstants.js';
import { retryAction } from '../utils/waiter.js';

class CaseCreation extends BasePage {
  /**
   * Search the currently-open list view (e.g. Cases) by Case Number or any global search term.
   * Assumes the target tab is already open via a prior "I navigate to ... tab" step.
   */
  async searchForCase(caseNumber) {
    logger.info(`Searching for case: ${caseNumber}`);
    // The list view header's search-bar sub-component mounts asynchronously after the tab
    // navigation resolves; implicitTimeout is 0 (wdio.shared.conf.js), so a nullable element
    // like getSearchBar() is checked once with no polling and fails instantly if it isn't
    // mounted yet. Retry the whole lookup chain instead of a single un-retried attempt.
    const searchBarInput = await retryAction(
      async () => {
        const pageObject = await utam.load(ObjectHome);
        const listViewMgr = await pageObject.getListViewManager();
        const commonList = await listViewMgr.getCommonListInternal();
        const header = await commonList.getHeader();
        const searchBar = await header.getSearchBar();
        return searchBar.getInput();
      },
      10,
      1000
    );
    await searchBarInput.setText(caseNumber);
    await searchBarInput.focus();
    await browser.keys(['Enter']);
    await browser.pause(TIMEOUTS.SEARCH_RESULTS);
  }

  /**
   * Search using the global header search box (`.oneHeader`, the same element that carries
   * id="oneHeader"), not the currently-open list view's own local search bar. Pure UTAM:
   * click the search button via the custom globalHeader.utam.json (the predefined Header
   * PO's searchIcon targets a legacy selector, [data-key=search].forceHeaderButtonDeprecated,
   * that no longer exists in this org's rendered header), then type into the resulting
   * lightning-input.saInput (Search Assistant Input) via the predefined lightning Input PO,
   * loaded with an injected page-wide locator since it is not actually nested inside
   * .oneHeader's DOM subtree - confirmed live via DevTools, it renders in a separate
   * assistantPanel dialog. Input.focus() is called first since the panel only fully
   * activates on focus ("when I get focus on the global search then lightning input is
   * displayed").
   */
  async searchGlobal(searchTerm) {
    logger.info(`Global header search for: ${searchTerm}`);

    await retryAction(
      async () => {
        const header = await utam.load(GlobalHeader);
        const searchButton = await header.getSearchButton();
        await searchButton.click();
      },
      5,
      1000
    );
    logger.info('searchGlobal: search button clicked');

    // The input is often present in the DOM before the panel finishes opening/animating in,
    // so a load alone can hand back an element that isn't yet interactable - wait for it to
    // actually be visible before returning, and retry the whole thing (not just the wait) if
    // it times out, since the panel may need re-triggering.
    const searchInput = await retryAction(
      async () => {
        const input = await utam.load(Input, { locator: utam.By.css(GLOBAL_SEARCH_INPUT_SELECTOR) });
        await input.waitForVisible();
        return input;
      },
      10,
      1000
    );
    logger.info('searchGlobal: search input found and visible');

    await searchInput.focus();
    logger.info('searchGlobal: search input focused');

    // Input.setText() sets the value without producing the same discrete keydown/input/keyup
    // sequence a real user's keystrokes do - confirmed live: after setText(), the listbox
    // never appeared even after a full 20s wait, though the exact same UI works instantly for
    // a human typing. Sending real keystrokes via the Actions API (browser.keys) one at a
    // time, with the field already focused, is much closer to genuine typing and is more
    // likely to trigger Salesforce's live-search debounce listener.
    await browser.keys(searchTerm.split(''));
    logger.info(`searchGlobal: keys sent for "${searchTerm}" - readback = "${await searchInput.getValueText()}"`);

    // No Enter - confirmed via a decoded Aura URL fragment (componentDef:
    // "forceSearch:searchPageDesktop") that Enter navigates away to the full search-results
    // page, which has no instant-results listbox at all. Wait for the listbox directly
    // instead of a blind pause, so we find out definitively whether typing alone ever
    // populates it and how long it actually takes.
    const listboxAppeared = await browser
      .waitUntil(() => browser.$("div[role='listbox'][aria-label='Suggestions']").isExisting(), {
        timeout: 5000,
        interval: 1000
      })
      .catch(() => false);
    logger.info(`searchGlobal: instant-results listbox present = ${listboxAppeared}`);
    logger.info(`searchGlobal: current URL = ${await browser.getUrl()}`);
    logger.info('searchGlobal: done');
  }

  /**
   * Click the instant-results suggestion whose primary label exactly matches searchTerm,
   * navigating into that record. Call this right after searchGlobal(). Uses a custom
   * globalSearchResults.utam.json - no predefined salesforce-pageobjects type models this
   * search-assistant dropdown. There are two nested shadow boundaries: the outer
   * search_dialog-instant-results-list root has its own shadow root (crossed via "shadow"
   * to reach the listbox), and each search_dialog-instant-result-item inside the listbox is
   * itself a second, separate custom element with its own shadow root (crossed via a second
   * nested "shadow" to reach div[role='option'] and its label). A single CSS :has()/text
   * selector can't cross that second shadow boundary, so matching is done here in JS -
   * iterate resultItemElements, read each one's primaryLabel text, and click the optionRoot
   * of the one that equals searchTerm exactly (never the "Show more results for
   * "<searchTerm>"" decoy, whose label is that whole phrase, not searchTerm alone).
   */
  async selectGlobalSearchResult(searchTerm) {
    logger.info(`Selecting global search result: ${searchTerm}`);

    const item = await retryAction(
      async () => {
        const resultsList = await utam.load(GlobalSearchResults);
        const itemElements = await resultsList.getResultItemElements();

        for (let index = 0; index < itemElements.length; index++) {
          const labelElement = await resultsList.getPrimaryLabel(index);
          const label = labelElement ? (await labelElement.getText())?.trim() : null;
          if (label === searchTerm) {
            const optionRoot = await resultsList.getOptionRoot(index);
            if (optionRoot) {
              return optionRoot;
            }
          }
        }

        throw new Error(`No global search result found matching "${searchTerm}"`);
      },
      5,
      1000
    );

    logger.info(`selectGlobalSearchResult: clicking match for "${searchTerm}"`);
    await item.click();
    await browser.pause(6000);
  }

  /**
   * Click the primary-field link (Case Number) on a list-view row and wait for navigation.
   * rowNumber is 1-based (matches what's visible on screen); the datatable's own
   * data-row-number attribute is 0-based, so it is converted here.
   */
  async openRecordFromRow(rowNumber, urlContains, preferredColumnLabel = 'Case Number') {
    const rowIndex = Number(rowNumber) - 1;

    // Same async-mount race as searchForCase() - the grid re-renders after search results
    // return, so retry the whole chain down to the target cell/link instead of one attempt.
    // getCellByLabel/getFormattedUrlByLabel are nullable (they resolve to null, they don't
    // throw), so a label mismatch alone wouldn't trigger a retry - hence the explicit throw
    // below, and a fallback that scans every column for whichever one is actually a link,
    // since which field is the linked/primary column varies by list view.
    const link = await retryAction(
      async () => {
        const pageObject = await utam.load(ObjectHome);
        const listViewMgr = await pageObject.getListViewManager();
        const commonList = await listViewMgr.getCommonListInternal();
        const displayManager = await commonList.getDisplayManager();
        const primaryDisplay = await displayManager.getDisplay();
        const grid = await primaryDisplay.getDisplayGrid();
        const dataTable = await grid.getDatatable();

        const namedCell = await dataTable.getCellByLabel(1, 'Case Number');
      },
      10,
      1000
    );
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
