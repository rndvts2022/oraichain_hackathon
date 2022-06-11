### Enviroment Prepare: Please install Docker-compose

# 1: Arbitrage-bot
This is an automation, we can use it for crawling data between Exchanges and calculates Arbitrages Infomation

# 2: arbitrages-service
This is a service for synchron data from Bot, provide data to Oraichain Oracle Services

# 3: price-prediction-service
This is a service for predict price coin/token on market, provide data to Oraichain Oracle Services

# 4: deno-script
This is a script seem to be endpoint for Oracle Serives get data

# 5: orai_sc
This is a sc deploy on Oraichain Network

# This way for running all services
docker-compose up or docker-compose up -d4

### Dapp for end user
node server.js