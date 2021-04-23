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
        this.io.on("connection", (socket) => {
            console.log('Incoming connection...');

            cron.schedule('*/5 * * * * *', async () => {

                const { binanceData, coinbitData, bithumbData, upbitData } = await this.collectData();  

                const processedData = this.processData(binanceData, coinbitData, bithumbData, upbitData);

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
        
}

module.exports = WsHanlder;