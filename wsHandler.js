const socket = require('socket.io');
const fs = require('fs');
const cron = require('node-cron');

const DataProvider = require('./dataProvider');

class WsHanlder {

    io;
    dataProvider;
    collectingData;
    currencyData;
    sendToFECron;
    collectDataCron;

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
            socket.on("hello", async(arg) => {
                console.log(arg); // world
                console.log('Incoming connection from btc_page...');
                //const coin2='BTC'
                var coin2=arg;
                if (!this.collectingData) {
                    console.log('Start collecting data...');

                    // collect data for the first client who connects to the server so we can create him the table asap.
                    this.currencyData = await this.dataProvider.fetchProcessedData(coin2);

                    // start collecting data periodically for live updates to clients
                    this.startCollectingData(coin2);
                } else {
                    console.log('Collecting process already running!');
                }

                if (arg === 'BTC') {

                    // check if there is a sending cron job currently running and stop it 
                    // TODO: check if is a page refresh and let the process continue 
                    if (this.sendToFECron !== undefined) {
                        this.sendToFECron.stop();
                    }

                    // check if there is a collecting cron job currently running and stop it
                    if (this.collectDataCron !== undefined) {
                        this.collectDataCron.stop();
                    }

                    this.currencyData = await this.dataProvider.fetchProcessedData(arg);

                    this.startCollectingData(arg);

                    socket.emit('btc-first-data', this.currencyData);

                    this.sendToFECron=cron.schedule('*/5 * * * * *', async () => {

                        socket.emit('btc-tabel-data', this.currencyData);

                    });
                } else {

                    // check if there is a cron job currently running and stop it
                    if(this.sendToFECron !== undefined) {
                        this.sendToFECron.stop();
                    }

                     // check if there is a collecting cron job currently running and stop it
                     if (this.collectDataCron !== undefined) {
                        this.collectDataCron.stop();
                    }

                    this.currencyData = await this.dataProvider.fetchProcessedData(arg);

                    this.startCollectingData(arg);

                    socket.emit('first-data', this.currencyData);

                    this.sendToFECron=cron.schedule('*/5 * * * * *', async () => {

                        socket.emit('tabel-data', this.currencyData);

                    });
                }

             });
  
    });

        

    }

    startCollectingData(coin) {
        this.collectingData = true;

        this.collectDataCron = cron.schedule('*/5 * * * * *', async () => {

            this.currencyData = await this.dataProvider.fetchProcessedData(coin);

        }); 
    }
        
}

module.exports = WsHanlder;