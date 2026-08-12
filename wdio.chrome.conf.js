import { config as sharedConfig } from './wdio.shared.conf.js';


export const config = {
  ...sharedConfig,
  ...{
    capabilities: [
      {
        maxInstances: 1,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'google:chromeOptions': {
          args: [
            '--no-sandbox',
            '--disable-infobars',
            '--disable-gpu',
            '--window-size=1440,735'
          ],
        }
      }
    ]
  }
}