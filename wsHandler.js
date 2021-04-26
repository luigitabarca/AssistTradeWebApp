const socket = require('socket.io');
const DataCollector = require('./dataCollector');
const DataParser = require('./dataParser');
const fs = require('fs');
const cron = require('node-cron');

class WsHanlder {

    io;
    dataCollector;
    dataParser;

    constructor(serverPort, wsPort) {
        this.io = require("socket.io")(wsPort, {
            cors: {
                origin: `http://localhost:${serverPort}`,
                credentials: true
              }
        });
    }

    handleWsConnection() {
        this.io.on("connection", async (socket) => {
            console.log('Incoming connection...');
            console.log('Fetching data...');

            const processedData = await this.fetchProcessedData();
            
            socket.emit('first-data', processedData);

            cron.schedule('*/5 * * * * *', async () => {

                const processedData = await this.fetchProcessedData()
                socket.emit('tabel-data', processedData);

              });

        });
    }

    async collectData() {
        this.dataCollector = new DataCollector();
        return this.dataCollector.getData();
    }

    processData(binanceData, coinbitData, bithumbData, upbitData) { 
        this.dataParser = new DataParser();

        const parsedBithumbData = this.dataParser.parseBithumpbData(bithumbData);
        const symbols = parsedBithumbData.map(bithumpdata => bithumpdata.symbol);

        const parsedBinanceData = this.dataParser.parseBinanceData(binanceData, symbols);
        const parsedCoibitData = this.dataParser.parseCoinbitData(coinbitData, symbols);
        const parsedUpbitData = this.dataParser.parseUpbitData(upbitData, symbols);

        const unifiedData = this.dataParser.unifyParsedData(parsedBithumbData, parsedBinanceData, parsedCoibitData, parsedUpbitData); 

        return unifiedData;
    }

    async fetchProcessedData() {

        const { binanceData, coinbitData, bithumbData, upbitData } = await this.collectData();  
        const processedData = this.processData(binanceData, coinbitData, bithumbData, upbitData);

        return processedData
    }
        
}

module.exports = WsHanlder;