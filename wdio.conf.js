require('dotenv').config();
const os = require('os');
const fs = require('fs');
const path = require('path');
const { removeSync } = require('fs-extra');
const isDocker = process.env.DOCKER_ENV === 'true';
const { UtamWdioService } = require('wdio-utam-service');
const AllureReporter = require('@wdio/allure-reporter');
// use prefix 'DEBUG=true' to run test in debug modeconst reportObj = require('./reporterUtils/generateHTMLReport.js');
const { DEBUG } = process.env;
const TIMEOUT = DEBUG ? 60 * 1000 * 30 : 30 * 1000;

exports.config = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: [
        '--no-sandbox',
        '--disable-infobars',
        '--disable-gpu',
        '--window-size=1440,735'
      ],
    }
  }],
  logLevel: 'debug',
  bail: 0,
  // timeout for all waitFor commands
  waitforTimeout: TIMEOUT,
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
  },

  before: async function () {
    await browser.setWindowSize(1920, 1080);
  },

  afterStep: async function (step, scenario, result, context) {
    if (!result.passed) {
      try {
        const cucumberJson = require('wdio-cucumberjs-json-reporter').default;
        const screenshot = await browser.takeScreenshot();
        await cucumberJson.attach(screenshot, 'image/png');
      } catch (e) {
        console.log('Screenshot attach failed in afterStep:', e.message);
      }
    }
  },

  afterScenario: async function (world, result, context) {
    try {
      const cucumberJson = require('wdio-cucumberjs-json-reporter').default;
      const screenshot = await browser.takeScreenshot();
      cucumberJson.attach(screenshot, 'image/png');
    } catch (e) {
      console.log('Screenshot attach failed in afterScenario:', e.message);
    }
  },

  onComplete: async (exitCode, config, capabilities, results) => {
    const reportObj = require('./reporterUtils/generateHTMLReport.js');
    reportObj.generateHTMLReport();
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
    ]
  ],

  cucumberOpts: {
    require: ['./step-definitions/**/*.js'],
    format: [
      'pretty',
      'json:./report/cucumber_report.json'
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
