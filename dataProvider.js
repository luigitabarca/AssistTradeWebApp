const DataCollector = require('./dataCollector');
const DataParser = require('./dataParser');

class DataProvider {
    dataParser;
    dataCollector;

    constructor() {}


    async collectData() {
        this.dataCollector = new DataCollector();
        return this.dataCollector.getData();
    }

    processData(binanceData, coinbitData, bithumbData, upbitData,coin) { 
        this.dataParser = new DataParser();

        const parsedBithumbData = this.dataParser.parseBithumpbData(bithumbData);
        const symbols = parsedBithumbData.map(bithumpdata => bithumpdata.symbol);
        const parsedBinanceData = this.dataParser.parseBinanceData(binanceData, symbols,coin);

        
        
        //const parsedBinanceData = this.dataParser.parseBinanceData(binanceData, symbols);
        const parsedCoibitData = this.dataParser.parseCoinbitData(coinbitData, symbols);
        const parsedUpbitData = this.dataParser.parseUpbitData(upbitData, symbols);

        //parsare pret btc
        var priceBTC=1;

        if (coin==='BTC') {
            priceBTC = this.dataParser.parseBTCPriceData(binanceData,symbols)
        }
        

        

            const unifiedData = this.dataParser.unifyParsedData(parsedBithumbData, parsedBinanceData, parsedCoibitData, parsedUpbitData, priceBTC); 
        
        
        return unifiedData;
    }

    async fetchProcessedData(coin) {

        const { binanceData, coinbitData, bithumbData, upbitData } = await this.collectData();  
        const processedData = this.processData(binanceData, coinbitData, bithumbData, upbitData,coin);

        return processedData;
    }
}

module.exports = DataProvider;