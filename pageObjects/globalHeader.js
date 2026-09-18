
'use strict';

var core = require('@utam/core');

async function _utam_get_searchButton(driver, root) {
    let _element = root;
    const _locator = core.By.css("button.search-button[aria-label='Search']");
    return _element.findElement(_locator);
}

/**
 * Global header search button, corrected for the current Lightning UI markup. The predefined salesforce-pageobjects Header PO (global/pageObjects/header) targets a legacy selector ([data-key=search].forceHeaderButtonDeprecated) that no longer exists in this org's rendered header (confirmed against live DOM). Deliberately does NOT model the search input here: lightning-input.saInput (the real Search Assistant Input LWC that appears once the box expands) is not actually nested inside .oneHeader's DOM subtree - a click-intercepted error showed WebDriver's raw hit-testing finding it at the button's screen position while a .oneHeader-scoped lookup never found it, which only makes sense if it renders elsewhere (an overlay). It is loaded separately in case.creation.page.js via an injected page-wide locator instead.
 * generated from JSON force-app/main/default/global/__utam__/globalHeader.utam.json
 * @version 2026-09-18T01:10:13.422Z
 * @author UTAM
 */
class GlobalHeader extends core.UtamBaseRootPageObject {
    constructor(driver, element, locator = core.By.css(".oneHeader")) {
        super(driver, element, locator);
    }

    async __getRoot() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        return new BaseUtamElement(driver, root);
    }
    
    async getSearchButton() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const ActionableClickableUtamElement = core.createUtamMixinCtor(core.ActionableUtamElement, core.ClickableUtamElement);
        let element = await _utam_get_searchButton(driver, root);
        element = new ActionableClickableUtamElement(driver, element);
        return element;
    }
    
}

module.exports = GlobalHeader;
