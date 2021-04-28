const socket = require('socket.io');
const fs = require('fs');
const cron = require('node-cron');

const DataProvider = require('./dataProvider');

class WsHanlder {

    io;
    dataProvider;
    collectingData;
    currencyData;

    constructor(serverPort, wsPort) {
        // open websocket port
        this.io = require("socket.io")(wsPort, {
            cors: {
                origin: `http://localhost:${serverPort}`,
                credentials: true
              }
        });

        // set local params
        this.collectingData = false;
        this.dataProvider = new DataProvider();
    }

    handleWsConnection() {
        this.io.on("connection", async (socket) => {
            console.log('Incoming connection...');

            if (!this.collectingData) {
                console.log('Start collecting data...');

                // collect data for the first client who connects to the server so we can create him the table asap.
                this.currencyData = await this.dataProvider.fetchProcessedData();

                // start collecting data periodically for live updates to clients
                this.startCollectingData();
            } else {
                console.log('Collecting process already running!');
            }

            socket.emit('first-data', this.currencyData);

            cron.schedule('*/5 * * * * *', async () => {

                socket.emit('tabel-data', this.currencyData);

            });

        });
    }

    startCollectingData() {
        this.collectingData = true;

        cron.schedule('*/5 * * * * *', async () => {

            this.currencyData = await this.dataProvider.fetchProcessedData();

        }); 
    }
        
}

module.exports = WsHanlder;