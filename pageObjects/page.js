class Page {

    async navigateToUrl (url) {
        await browser.url(url);
    }

    async waitForElementToBeDisplayed(element, timeout = 60000) {
        return await element.waitForDisplayed(timeout, undefined, `Element '${element.selector}' is not displayed after ${timeout} milliseconds`);
    }

    async waitForElementToBeEnabled(element, timeout = 60000) {
        return await element.waitForEnabled(timeout, undefined, `Element '${element.selector}' is not displayed after ${timeout} milliseconds`);
    }

    async waitForElementToBeClickable(element, timeout = 60000) {
        return await element.waitForClickable(timeout, undefined, `Element '${element.selector}' is not displayed after ${timeout} milliseconds`);
    }

    async verifyElementDisplayed(element, timeOut = 6000) {
        try {
            await this.waitForElementToBeDisplayed(element, timeOut);
        } catch (e) {
            console.log('Element is not displayed');
        }
        let flag = await this.isElementDisplayed(element);
        return flag;
    }

    async isElementDisplayed(element) {
        let displayed = await element.isDisplayed();
        return displayed;
    }

    async clickOnElement(element, timeOut = 60000) {
        await this.waitForElementToBeEnabled(element, timeOut);
        await this.waitForElementToBeClickable(element, timeOut);
        await element.click();
    }
}

export default Page;
