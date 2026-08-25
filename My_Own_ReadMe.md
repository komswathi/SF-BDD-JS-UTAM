**UTAM Jasmine**

nvm install 23
nvm use 23
node -v


npm install

npm install --legacy-peer-deps



sf org login web --set-default

npm run test:ui:compile

npm run test:ui:generate:login

npm run test:ui

lsof -i :9515

killall -9 chromedriver

npm run test:ui -- --cucumberOpts.tagExpression='@lead'

brew install allure
allure --version

allure generate
allure serve


jar xf ./salesforce-pageobjects-12.0.0-javadoc.jar


**BDD cucumber instructions**

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run test:ui:generate:login
npm run test:local

npm run test:ui -- -- --cucumberOpts.tagExpression='@account'
Docker
brew install docker-compose

docker-compose build

docker-compose up


docker images
docker images | grep wdio
docker rmi image-name

All containers (including stopped):
docker ps
docker ps -a
docker rm container-id

docker-compose down --remove-orphans

docker-compose up --build

nvm install 22
nvm use 20
rm -rf node_modules package-lock.json
npm install
npm run test-local



With WDIO V8 and Node 18, this frameworks with command **wdio run wdio.conf.chrome.js**

With WDIO V8 and Node 23, this frameworks with command **NODE_OPTIONS="--no-experimental-require-module" wdio run wdio.conf.chrome.js**



swathikomeravelli@Swathis-MacBook-Air SF-BDD-JS-UTAM % node -v         
v23.11.1
swathikomeravelli@Swathis-MacBook-Air SF-BDD-JS-UTAM % npm install 

swathikomeravelli@Swathis-MacBook-Air SF-BDD-JS-UTAM % npm run test:ui

> salesforce-utam-e2e-testing@1.0.0 test:ui
> NODE_OPTIONS="--no-experimental-require-module" wdio run wdio.conf.chrome.js



**EDGE MAC**
# Create symlink
sudo ln -s "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" /usr/local/bin/msedge

# Verify
which msedge
# Output: /usr/local/bin/msedge

# Test
msedge --version


WDIO_SKIP_DRIVER_UPDATE=true npm run test:ui:edge 

npm run test:ui:chrome -- --cucumberOpts.tagExpression='@case'


**nvm use**

**npm install**

**npm run test:ui:edge -- --cucumberOpts.tagExpression='@regression'**

**npm run test:ui:chrome -- --cucumberOpts.tagExpression='@regression'**


# DO NOT CHECK THIS FILE IN WITH PERSONAL INFORMATION SAVED
SALESFORCE_LOGIN_URL=https://orgfarm-caf1480b47-dev-ed.develop.my.salesforce.com/secur/frontdoor.jsp?otp=00Dg500000CASgr%21AQEAQN65CNbv_ZOK82Oj2.rfoajOlIQBbIHPy38_3VLveVWWEPjIo.aVGJ_xhml10zUymTl.Grn7QcN7E0.Qter4fTY_cwbg&startURL=%2Flightning&cshc=5000008DKxB500000CASgr
SF_USERNAME=a29tc3dhdGhpLmNkYmZhZWM2YmZmNEBhZ2VudGZvcmNlLmNvbQ==
SF_PASSWORD=SmFhbnNoaW11XzE0Mw==
SF_TOTP_SECRET=S0paR0hNMkdWN01DSUpTNVVFWUVQRldBNVVEUUtJNzQ=
SF_ORG_URL=https://orgfarm-caf1480b47-dev-ed.develop.lightning.force.com
DOCKER_ENV=true
HEADLESS=false
BROWSER=CHROME