require('dotenv').config();
const os = require('os');

const { UtamWdioService } = require('wdio-utam-service');
const AllureReporter = require('@wdio/allure-reporter');
const { removeSync } = require('fs-extra');
// use prefix 'DEBUG=true' to run test in debug mode
const { DEBUG } = process.env;
const TIMEOUT = DEBUG ? 60 * 1000 * 30 : 60 * 1000;
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours by default

exports.config = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  maxInstances: 2,
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
  waitforTimeout: SESSION_TIMEOUT,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  //automationProtocol: 'webdriver',
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

  before: async function (capabilities, specs) {
    await browser.setWindowSize(1920, 1080);
    const { Given, When, Then } = require('@cucumber/cucumber');
    [global.Given, global.When, global.Then] = [Given, When, Then];

    const loginPage = require('./utam-helper.js');  // load login file
    await loginPage.logInSalesforce();

  },

  beforeScenario: async function (capabilities, specs) {
    //await browser.reloadSession()
  },


  afterStep: async function (step, scenario, result, context) {
    if (!result.passed) {
      const cucumberJson = require('wdio-cucumberjs-json-reporter');
      await cucumberJson.attach(await browser.takeScreenshot(), 'image/png');
    }
  },

  afterScenario: async function (world, result, context) {
    const cucumberJson = require('wdio-cucumberjs-json-reporter');
    await cucumberJson.attach(await browser.takeScreenshot(), 'image/png');
  },

  onComplete: async (exitCode, config, capabilities, results) => {
    const reportObj = require('./reporterUtils/generateHTMLReport.js');
    reportObj.generateHTMLReport();
  },

  /* afterTest: async function (test, context, { error, duration, passed }) {
      let screenshot = await browser.takeScreenshot();
      await browser.allure.addAttachment('screenshot', Buffer.from(screenshot, 'base64'), 'image/png');
  },*/

  afterTest: async function (test, context, { error, duration, passed }) {
    let screenshot = await browser.takeScreenshot();
    const buffer = Buffer.from(screenshot, 'base64');
    AllureReporter.addAttachment(test.description.replaceAll(' ', '_'), buffer, 'image/png');
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
    [ 'cucumberjs-json', {
      jsonFolder: 'report/',
      language: 'en',
    },
    ]
  ],
/*  jasmineOpts: {
    // max execution time for a script, set to 5 min
    defaultTimeoutInterval: 1000 * 60 * 5
  }*/
  //
  // If you are using Cucumber you need to specify the location of your step definitions.
  cucumberOpts: {
    // <string[]> (file/dir) require files before executing features
    require: ['./step-definitions/**/*.js'],
    // <boolean> show full backtrace for errors
    backtrace: false,
    // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    requireModule: [],
    // <boolean> invoke formatters without executing steps
    dryRun: false,
    // <boolean> abort the run on first failure
    failFast: false,
    // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    format: ['pretty'],
    // <boolean> hide step definition snippets for pending steps
    snippets: true,
    // <boolean> hide source uris
    source: true,
    // <string[]> (name) specify the profile to use
    profile: [],
    // <boolean> fail if there are any undefined or pending steps
    strict: false,
    // <string> (expression) only execute the features or scenarios with tags matching the expression
    tagExpression: '',
    // <number> timeout for step definitions
    timeout: 120000,
    // <boolean> Enable this config to treat undefined definitions as warnings.
    ignoreUndefinedDefinitions: false
  }
};
