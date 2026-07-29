**UTAM Jasmine**
npm install

sf org login web --set-default

npm run test:ui:compile

npm run test:ui:generate:login

npm run test:ui

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



pkill -f chromedriver
pkill -f "Google Chrome"
pkill -f Chromium
sleep 
