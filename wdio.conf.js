import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';
import path from 'path';
import pkg from 'fs-extra';
const { removeSync } = pkg;
import { UtamWdioService } from 'wdio-utam-service';
import cucumberJson from 'wdio-cucumberjs-json-reporter';
import { fileURLToPath } from 'url';        // ← ADD THIS
import { dirname } from 'path';             // ← ADD THIS

const __filename = fileURLToPath(import.meta.url);  // ← ADD THIS
const __dirname = dirname(__filename);
let driverServerInstance = null;
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
  capabilities: [{
    maxInstances: 3,
    browserName: 'chrome',
    acceptInsecureCerts: true,
    // edgeDriverPath: '/Users/swathikomeravelli/Automation/UTAM/SF-BDD-JS-UTAM/node_modules/edgedriver/bin/msedgedriver',
    'google:chromeOptions': {
      args: [
        '--no-sandbox',
        '--disable-infobars',
        '--disable-gpu',
        '--window-size=1440,735'
      ],
      //binary: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    }
  }],
  logLevel: 'debug',
  bail: 0,
  waitForTimeout: TIMEOUT,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  automationProtocol: 'webdriver',
  services: [
   /* ['wdio-edgedriver-service', {
      port: 9515,
      outputDir: './drivers',
      skipSeleniumStandaloneDownload: true,
      drivers: [{
        browser: 'MicrosoftEdge',
        path: '/Users/swathikomeravelli/Automation/UTAM/SF-BDD-JS-UTAM/drivers/edge/mac/msedgedriver'
      }]
    }],*/
   /* ['chromedriver', {
      logFileName: 'wdio-chromedriver.log', // default
      outputDir: 'driver-logs', // overwrites the config.outputDir
      args: ['--silent']
    }],*/
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
/*
    // Kill the chromedriver process
    if(driverServerInstance) {
      driverServerInstance.kill();
      console.log('[DRIVER] Chromedriver stopped');
    }*/
  },

  onComplete: async (exitCode, config, capabilities, results) => {
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