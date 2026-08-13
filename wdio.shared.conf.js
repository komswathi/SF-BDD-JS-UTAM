import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';
import path from 'path';
import pkg from 'fs-extra';
import { UtamWdioService } from 'wdio-utam-service';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cucumberJson from 'wdio-cucumberjs-json-reporter';
import logger from "./utils/logger.js";

dotenv.config();
let __filename = fileURLToPath(import.meta.url);
let __dirname = dirname(__filename);
let browserType = process.env.BROWSER || 'EDGE'
let { removeSync } = pkg;

let EDGEDRIVER_PATH = '/Users/swathikomeravelli/Automation/UTAM/SF-BDD-JS-UTAM/drivers/edge/mac-v151/msedgedriver';
let WDIO_PORT = 9515;
let driverServerInstance = null;


let isDocker = process.env.DOCKER_ENV === 'true';
let { DEBUG } = process.env;
let TIMEOUT = DEBUG ? 60 * 1000 * 30 : 30 * 1000;

let screenshotDir = './screenshots';
let jsonReportDir = './report/json';

[screenshotDir, jsonReportDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export async function startEdgeInstance(driverPath = EDGEDRIVER_PATH, port = WDIO_PORT) {
  let instance = null;
  try {
    const { exec } = await import('child_process');
    instance = exec(`${driverPath} --port=${port}`, (error, stdout, stderr) => {
      if (error && !error.killed) {
        console.error('[EDGEDRIVER] Process error:', error);
      }
    });

    await new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 3000);

      instance.stdout?.on('data', (data) => {
        console.log('[EDGEDRIVER]', data.toString().trim());
        if (!resolved && (data.toString().includes('listening') || data.toString().includes('started'))) {
          resolved = true;
          clearTimeout(timeout);
          resolve();
        }
      });

      instance.stderr?.on('data', (data) => {
        console.log('[EDGEDRIVER]', data.toString().trim());
      });
    });

    console.log(`[EDGEDRIVER] Server running on localhost:${port}`);
    return instance;
  } catch (e) {
    console.error('[EDGEDRIVER] Failed to start:', e.message);
    throw e;
  }
}


export const config = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  // maxInstances: 3,
  waitForTimeout: TIMEOUT,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  automationProtocol: 'webdriver',
  logLevel: 'warn',
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
      const reportPath = path.resolve(process.cwd(), './report');
      const allureResultsPath = path.resolve(process.cwd(), './allure-results');
      const allureReportsPath = path.resolve(process.cwd(), './allure-report');

      removeSync(reportPath);
      removeSync(allureResultsPath);
      removeSync(allureReportsPath);

      logger.info('Cleanup complete');
    } catch (e) {
      logger.error('Report cleanup warning:', e.message);
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