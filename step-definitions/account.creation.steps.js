const { Given, When, Then } = require('@wdio/cucumber-framework');
const {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} = require('../pageObjects/index.js');

When('I navigate to Accounts tab', async () => {
    const container = await utam.load(DesktopLayoutContainer);
    const appNav = await container.getAppNav();
    const appNavBar = await appNav.getAppNavBar();
    const tab = await appNavBar.getNavItem('Accounts');
    await tab.clickAndWaitForUrl('lightning/o/Account/list?filterName=__Recent');
});

Then('recently viewed list appears', async () => {
    let listViewName;
    await browser.waitUntil(
        async () => {
            try {
                const lv = await utam.load(ObjectHome);
                const lvm = await lv.getListViewManager();
                const cl = await lvm.getCommonListInternal();
                const header = await cl.getHeader();
                listViewName = await header.getListViewTitleViaPicker();
                return listViewName && listViewName.length > 0;
            } catch {
                return false;
            }
        },
        { timeout: 15000, interval: 500 }
    );
    expect(listViewName).toEqual('Recently Viewed');
});

When('I click New account', async () => {
    const lv = await utam.load(ObjectHome);
    const lvm = await lv.getListViewManager();
    const cl = await lvm.getCommonListInternal();
    const header = await cl.getHeader();
    const actionsContainer = await header.getAuraActionsContainer();
    await (await actionsContainer.getActionLink('New')).click();
});

When('I fill Account Information', async (dataTable) => {
    const modal = await utam.load(RecordActionWrapper);
    const recordForm = await modal.getRecordForm();
    const recordLayout = await recordForm.getRecordLayout();

    const data = dataTable.rowsHash();
    await fillFormFields(recordLayout, data);
});

When('I fill Address Information', async (dataTable) => {
    const modal = await utam.load(RecordActionWrapper);
    const recordForm = await modal.getRecordForm();
    const recordLayout = await recordForm.getRecordLayout();

    const data = dataTable.rowsHash();
    await fillFormFields(recordLayout, data);
});

When('I fill Additional Information', async (dataTable) => {
    const modal = await utam.load(RecordActionWrapper);
    const recordForm = await modal.getRecordForm();
    const recordLayout = await recordForm.getRecordLayout();

    const data = dataTable.rowsHash();
    await fillFormFields(recordLayout, data);
});

When('I save account', async () => {
    const modal = await utam.load(RecordActionWrapper);
    const recordForm = await modal.getRecordForm();
    await recordForm.clickFooterButton('Save');
    await modal.waitForAbsence();
});

Then('account creation succeeds', async () => {
    await browser.waitUntil(
        async () => {
            try {
                const title = await browser.getTitle();
                return !title.includes('New Account');
            } catch {
                return false;
            }
        },
        { timeout: 10000, interval: 500 }
    );
});

async function fillFormFields(recordLayout, fieldData) {
    const sections = await recordLayout.getSections();

    for (const section of sections) {
        const rows = await section.getRows();
        for (const row of rows) {
            const items = await row.getItems();
            for (const item of items) {
                const label = await item.getLabelText();
                if (!label || !fieldData[label]) continue;

                const value = fieldData[label];
                await fillField(item, value);
            }
        }
    }
}

async function fillField(item, value) {
    try {
        const pickList = await item.getPicklist();
        const comboBox = await pickList.getBaseCombobox();
        await comboBox.expand();
        const items = await comboBox.getItems();
        for (const opt of items) {
            if (await opt.getItemLabel() === value) {
                await opt.clickItem();
                break;
            }
        }
    } catch {
        try {
            const input = await item.getInput();
            await input.setText(value);
        } catch {
            // handle other field types
        }
    }
}