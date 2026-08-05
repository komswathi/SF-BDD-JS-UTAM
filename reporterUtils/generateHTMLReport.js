import report from 'multiple-cucumber-html-reporter';
import os from 'os';

function getCurrentDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    return now.toLocaleDateString('en-US', options);
}

function getChromeVersion() {
    return '149.0';
}

export function generateHTMLReport() {
    const executionTime = getCurrentDateTime();

    report.generate({
        jsonDir: './report/',
        reportPath: './report/cucumber-html-report',
        metadata: {
            browser: {
                name: 'chrome',
                version: getChromeVersion(),
            },
            device: 'Local test machine',
            platform: {
                name: os.platform(),
                version: os.release(),
            },
        },
        customData: {
            title: 'Salesforce UTAM E2E Test Execution Report',
            data: [
                { label: 'Project', value: 'Salesforce UTAM E2E Testing' },
                { label: 'Release', value: '1.0.0' },
                { label: 'Cycle', value: 'BDD Cucumber Tests' },
                { label: 'Execution Start Time', value: executionTime },
                { label: 'Execution End Time', value: executionTime },
                { label: 'Node Version', value: process.version },
                { label: 'OS', value: `${os.platform()} ${os.release()}` },
            ],
        },
    });
}
