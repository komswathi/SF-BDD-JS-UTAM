require('dotenv').config();
const os = require('os');
const path = require('path');
const reportObj = require('./reporterUtils/generateHTMLReport.js');
const { removeSync } = require('fs-extra');

const { UtamWdioService } = require('wdio-utam-service');
const AllureReporter = require('@wdio/allure-reporter');
// use prefix 'DEBUG=true' to run test in debug mode
const { DEBUG } = process.env;
const TIMEOUT = DEBUG ? 60 * 1000 * 30 : 60 * 1000;

exports.config = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'chrome',
      'goog:chromeOptions': {
        // to run chrome headless the following flags are required
        // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
        // to deactivate the headless mode for local development and testing, please comment out the following line
        //args: ['--headless=new', '--window-size=1920,1080']

        //args: ['--headless=new', '--window-size=1920,1080']
        args: ['--window-size=1920,1080']
      }
    }
  ],
  logLevel: 'debug',
  bail: 0,
  // timeout for all waitFor commands
  waitforTimeout: TIMEOUT,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  automationProtocol: 'webdriver',
  services: [
    'chromedriver',
    [
      UtamWdioService,
      {
        implicitTimeout: 0,
        injectionConfigs: ['salesforce-pageobjects/ui-global-components.config.json']
      }
    ]
  ],

  onPrepare: async function (config, capabilities) {
    await removeSync('./report');
  },

  before: async function () {
    await browser.setWindowSize(1920, 1080);
  },

  /* afterTest: async function (test, context, { error, duration, passed }) {
      let screenshot = await browser.takeScreenshot();
      await browser.allure.addAttachment('screenshot', Buffer.from(screenshot, 'base64'), 'image/png');
  },*/

  afterTest: async function (test, context, { error, duration, passed }) {
    let screenshot = browser.takeScreenshot();
    const buffer = Buffer.from(screenshot, 'base64');
    AllureReporter.addAttachment(`screenshot_${Date.now()}`, buffer, 'image/png');
  },

  onComplete: async (exitCode, config, capabilities, results) => {
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
        disableWebdriverScreenshotsReporting: true,
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
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    format: ['pretty'],
    snippets: true,
    source: true,
    profile: [],
    strict: false,
    tagExpression: '',
    timeout: 120000,
    ignoreUndefinedDefinitions: false
  }
};
