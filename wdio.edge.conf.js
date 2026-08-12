import { config as sharedConfig } from './wdio.shared.conf.js';
import { UtamWdioService } from 'wdio-utam-service';
import pkg from 'fs-extra';
const { removeSync } = pkg;

const EDGEDRIVER_PATH = '/Users/swathikomeravelli/Automation/UTAM/SF-BDD-JS-UTAM/drivers/edge/mac-v151/msedgedriver';
const WDIO_PORT = 9515;
let driverServerInstance = null;

export const config = {
  ...sharedConfig,
  port: WDIO_PORT,
  hostname: 'localhost',
  ...{
    capabilities: [
      {
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
      }
    ],


    beforeScenario: async function(world, context) {
      const instanceId = process.env.WDIO_WORKER_ID || '0';
      console.log(`Running on instance: ${instanceId}`);
    },


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
    services: [
      [
        UtamWdioService,
        {
          implicitTimeout: 0,
          injectionConfigs: ['salesforce-pageobjects/ui-global-components.config.json']
        }
      ]
    ]
  }
}
