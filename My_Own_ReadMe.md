**UTAM Jasmine**
npm install

npm install --legacy-peer-deps

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



With WDIO V8 and Node 18, this frameworks with command **wdio run wdio.conf.js**

With WDIO V8 and Node 23, this frameworks with command **NODE_OPTIONS="--no-experimental-require-module" wdio run wdio.conf.js**



swathikomeravelli@Swathis-MacBook-Air SF-BDD-JS-UTAM % node -v         
v23.11.1
swathikomeravelli@Swathis-MacBook-Air SF-BDD-JS-UTAM % npm install 

swathikomeravelli@Swathis-MacBook-Air SF-BDD-JS-UTAM % npm run test:ui

> salesforce-utam-e2e-testing@1.0.0 test:ui
> NODE_OPTIONS="--no-experimental-require-module" wdio run wdio.conf.js
