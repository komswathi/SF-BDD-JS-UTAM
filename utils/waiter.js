export async function waitForElement(utamElement, timeout = 5000) {
    return browser.waitUntil(
        async () => {
            try {
                const root = await utamElement.getRoot();
                return root && await root.isDisplayed();
            } catch {
                return false;
            }
        },
        { timeout, interval: 500, timeoutMsg: `Element not visible after ${timeout}ms` }
    );
}

export async function retryAction(action, maxRetries = 3, delay = 500) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await action();
        } catch (e) {
            if (i === maxRetries - 1) throw e;
            await browser.pause(delay);
        }
    }
}