import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const exec = promisify(execCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const DOTENV_FILEPATH = join(__dirname, '../.env');

async function getScratchOrgLoginUrl() {
  try {
    const getUrlCmd = 'sf org open -p /lightning -r --json';
    console.log('Executing the following command: ', getUrlCmd);
    const { stderr, stdout } = await exec(getUrlCmd, { cwd: __dirname });
    if (stderr) throw new Error(stderr);
    const response = JSON.parse(stdout);
    const { url } = response.result;
    console.log(`Command returned with response: ${url}`);
    return url;
  } catch (err) {
    throw err;
  }
}

async function generateLoginUrl() {
  try {
    const url = await getScratchOrgLoginUrl();
    const template = `# DO NOT CHECK THIS FILE IN WITH PERSONAL INFORMATION SAVED
SALESFORCE_LOGIN_URL=${url}
SALESFORCE_LOGIN_TIME=${new Date().getTime()}`;
    writeFileSync(DOTENV_FILEPATH, template);
    console.log(`Property .env file successfully generated in ${DOTENV_FILEPATH}`);
  } catch (err) {
    console.error(err);
  }
}

generateLoginUrl();
