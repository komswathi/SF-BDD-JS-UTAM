import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';
import path from 'path';
import pkg from 'fs-extra';
const { removeSync } = pkg;
import { UtamWdioService } from 'wdio-utam-service';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cucumberJson from 'wdio-cucumberjs-json-reporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let driverServerInstance = null;
const EDGEDRIVER_PATH = '/Users/swathikomeravelli/Automation/UTAM/SF-BDD-JS-UTAM/drivers/edge/mac-v151/msedgedriver';
const WDIO_PORT = 9515;
dotenv.config();

const isDocker = process.env.DOCKER_ENV === 'true';
const { DEBUG } = process.env;
const TIMEOUT = DEBUG ? 60 * 1000 * 30 : 30 * 1000;

const screenshotDir = './screenshots';
const jsonReportDir = './report/json';

let localChromedriverPath = path.resolve(
    __dirname,
    'node_modules',
    'chromedriver',
    'lib',
    'chromedriver',
    'chromedriver'
);

[screenshotDir, jsonReportDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


export const config = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  // maxInstances: 3,
  skipSeleniumStandaloneDownload: true,
  port: WDIO_PORT,
  hostname: 'localhost',
  capabilities: [{
    maxInstances: 3,
    browserName: 'MicrosoftEdge',
    acceptInsecureCerts: true,
    'ms:edgeOptions': {
      args: [
        '--no-sandbox',
        '--disable-infobars',
        '--disable-gpu',
        '--window-size=1440,735'
      ],
      binary: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    }
  }],
  logLevel: 'debug',
  bail: 0,
  waitForTimeout: TIMEOUT,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  automationProtocol: 'webdriver',
  services: [
    [
      UtamWdioService,
      {
        implicitTimeout: 0,
        injectionConfigs: ['salesforce-pageobjects/ui-global-components.config.json']
      }
    ]
  ],

  onPrepare: async function (config, capabilities) {
    try {
      removeSync('./report');
      removeSync('./allure-results');
      removeSync('./allure-reports');
    } catch (e) {
      console.warn('Report cleanup warning:', e.message);
    }

    // Start local edgedriver server
    try {
      const { exec } = await import('child_process');
      driverServerInstance = exec(`${EDGEDRIVER_PATH} --port=${WDIO_PORT}`, (error, stdout, stderr) => {
        if (error && !error.killed) {
          console.error('[EDGEDRIVER] Process error:', error);
        }
      });

      // Wait for driver to start
      await new Promise((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        }, 3000);

        driverServerInstance.stdout?.on('data', (data) => {
          console.log('[EDGEDRIVER]', data.toString().trim());
          if (!resolved && (data.toString().includes('listening') || data.toString().includes('started'))) {
            resolved = true;
            clearTimeout(timeout);
            resolve();
          }
        });

        driverServerInstance.stderr?.on('data', (data) => {
          console.log('[EDGEDRIVER]', data.toString().trim());
        });
      });

      console.log(`[EDGEDRIVER] Server running on localhost:${WDIO_PORT}`);
    } catch (e) {
      console.error('[EDGEDRIVER] Failed to start:', e.message);
      throw e;
    }
  },

  before: async function () {
    await browser.setWindowSize(1920, 1080);
  },

  afterStep: async function (step, scenario, result, context) {
    if (!result.passed) {
      try {
        const screenshot = await browser.takeScreenshot();
        cucumberJson.attach(screenshot, 'image/png');
      } catch (e) {
        console.log('Screenshot capture failed in afterStep:', e.message);
      }
    }
  },

  beforeScenario: async function(world, context) {
    const instanceId = process.env.WDIO_WORKER_ID || '0';
    console.log(`Running on instance: ${instanceId}`);
 /*   if(fs.existsSync(localChromedriverPath)) {
      console.log(`[DRIVER] Starting local chromedriver binary from disk : ${localChromedriverPath}`);
      const execFile = (await import('child_process')).execFile;
      driverServerInstance = execFile(localChromedriverPath, ['--port=9515', '--url-base=/'], (err, stdout, stderr) => {
        if(err && !err.killed) {console.error('Chromedriver process error:', err)}
      });
    }*/
  },

  afterScenario: async function (world, result, context) {
    try {
      const screenshot = await browser.takeScreenshot();
      cucumberJson.attach(screenshot, 'image/png');
    } catch (e) {
      console.log('Screenshot attach failed in afterScenario:', e.message);
    }
  },

  onComplete: async (exitCode, config, capabilities, results) => {
    // Kill edgedriver server
    if (driverServerInstance) {
      driverServerInstance.kill();
      console.log('[EDGEDRIVER] Server stopped');
    }

    try {
      const reporterUtils = await import('./reporterUtils/generateHTMLReport.js');
      reporterUtils.generateHTMLReport();
    } catch (e) {
      console.log('Report generation warning:', e.message);
    }
  },


  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        addConsoleLogs: true,
        reportedEnvironmentVars: {
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: os.version()
        }
      }
    ],
    ['cucumberjs-json', {
      jsonFolder: 'report/',
      language: 'en'
    }]
  ],

  cucumberOpts: {
    require: ['./step-definitions/**/*.js'],
    format: [
      'pretty'
    ],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    profile: [],
    strict: false,
    tagExpression: '',
    timeout: 120000,
    ignoreUndefinedDefinitions: false
  }
};