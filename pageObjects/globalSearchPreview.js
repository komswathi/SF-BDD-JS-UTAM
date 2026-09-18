
'use strict';

var core = require('@utam/core');

async function _utam_get_recordLink(driver, root) {
    let _element = root;
    const _locator = core.By.css("a[data-refid='recordId']");
    const hasElement = await _element.containsElement(_locator);
    if (!hasElement) { return null; }
    return _element.findElement(_locator);
}

/**
 * Global search instant-results record preview pane - the right-hand panel showing the currently-selected/focused suggestion's record. Not modeled by any predefined salesforce-pageobjects type. Confirmed via live DOM: rendered in div#preview (a stable id, referenced by aria-controls on search_dialog-instant-results-list), alongside the results listbox (globalSearchResults.utam.json) in the same assistantPanel dialog overlay. recordLink is a genuine &lt;a href&gt; to the record's URL (data-refid='recordId') - clicking it actually navigates, unlike the results-list item, which per live testing only updates the preview/selection.
 * generated from JSON force-app/main/default/global/__utam__/globalSearchPreview.utam.json
 * @version 2026-09-18T01:10:13.434Z
 * @author UTAM
 */
class GlobalSearchPreview extends core.UtamBaseRootPageObject {
    constructor(driver, element, locator = core.By.css("#preview")) {
        super(driver, element, locator);
    }

    async __getRoot() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const BaseUtamElement = core.createUtamMixinCtor();
        return new BaseUtamElement(driver, root);
    }
    
    async getRecordLink() {
        const driver = this.driver;
        const root = await this.getRootElement();
        const ActionableClickableUtamElement = core.createUtamMixinCtor(core.ActionableUtamElement, core.ClickableUtamElement);
        let element = await _utam_get_recordLink(driver, root);
        if (!element) { return null; }
        element = new ActionableClickableUtamElement(driver, element);
        return element;
    }
    
}

module.exports = GlobalSearchPreview;
