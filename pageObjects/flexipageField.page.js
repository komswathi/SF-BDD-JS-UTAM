import Page from './page.js';
import FlexipageFieldExplorer from './flexipageFieldExplorer.mjs';

class FlexipageFieldPage extends Page {

    /**
     * Loads the full chain from the Aura action wrapper down to every
     * record_flexipage-record-field on the page:
     *   .oneRecordActionWrapper -> .actionBody
     *     -> flexipage-record-home-single-col-no-header-template-desktop2
     *     -> flexipage-component2 (all)
     *     -> flexipage-field-section2 (all)
     *     -> record_flexipage-record-field (all)
     *
     * utam.load(FlexipageFieldExplorer) resolves the ENTIRE chain in one call, since the
     * root selector in flexipageFieldExplorer.utam.json is .oneRecordActionWrapper and every
     * hop below it is declared inside that same JSON file - matching the parent-to-child
     * pattern in DesktopLayoutContainer/AppLauncherMenu above, just with more nesting.
     */
    async loadFlexipageFields() {
        const explorer = await utam.load(FlexipageFieldExplorer);
        const recordHome = await explorer.getRecordHome();
        const components = await explorer.getComponents();
        const fieldSections = await explorer.getFieldSections();
        const recordFields = await explorer.getRecordFields();
        return { explorer, recordHome, components, fieldSections, recordFields };
    }

    /**
     * Returns the visible label text for every field on the page, in DOM order -
     * the JS equivalent of what traceHierarchy()/checkShadowStatus() verify live in the
     * console before we trust a chain compiles+works.
     */
    async getAllFieldLabels() {
        const { explorer } = await this.loadFlexipageFields();
        return explorer.getFieldLabels();
    }

    /**
     * Finds one record_flexipage-record-field by its visible label text.
     * There's no field-label attribute to filter by in the selector itself (unlike
     * records-record-layout-item), so this matches in JS across the returnAll collection.
     */
    async getFieldByLabel(targetLabel) {
        const { recordFields } = await this.loadFlexipageFields();
        for (const field of recordFields) {
            const label = await field.getLabelText();
            if (label && label.trim() === targetLabel.trim()) {
                return field;
            }
        }
        return null;
    }
}

export default new FlexipageFieldPage()
