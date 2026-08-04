//import { ChainablePromiseElement } from 'webdriverio';
/*import dotenv from 'dotenv';
dotenv.config();*/
//import * as Constants from "../utils/userDetails.js";

import {error} from "@salesforce/sfdx-lwc-jest/src/log";

let baseUrl = process.env.BASE_URL;
let Page = require('./page.js');
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours by default
const {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} = require('./index.js');
class BasePage extends Page {
    async chooseAppNavBar(tabName) {
        const container = await utam.load(DesktopLayoutContainer);
        const appNav = await container.getAppNav();
        const appNavBar = await appNav.getAppNavBar();
        const tab = await appNavBar.getNavItem(tabName);
        await tab.clickAndWaitForUrl('lightning/o/Account/list?filterName=__Recent');
    }

    async getAppContextName() {
        const appNavAfterNav = await (await utam.load(DesktopLayoutContainer)).getAppNav();
        const appName = await (await appNavAfterNav.getAppName()).getText();
        return appName
    }
}
export default BasePage;
