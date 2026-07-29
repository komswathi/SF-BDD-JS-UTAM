**UTAM Jasmine**


Install Node 20 or greater
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


pkill -f chromedriver; pkill -f "Google Chrome"; sleep 2
