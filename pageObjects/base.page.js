import Page from './page.js';
import {
    AppLauncherMenu,
    RecordActionWrapper,
    ObjectHome,
    DesktopLayoutContainer
} from './index.js';

class BasePage extends Page {
    async chooseAppNavBar(tabName) {
        const container = await utam.load(DesktopLayoutContainer);
        const appNav = await container.getAppNav();
        const appNavBar = await appNav.getAppNavBar();
        const tab = await appNavBar.getNavItem(tabName);
        let name = tabName.slice(0, -1);
        await tab.clickAndWaitForUrl(`lightning/o/${name}`);
    }

    async getAppContextName() {
        const appNavAfterNav = await (await utam.load(DesktopLayoutContainer)).getAppNav();
        const appName = await (await appNavAfterNav.getAppName()).getText();
        return appName;
    }
}
export default BasePage;
