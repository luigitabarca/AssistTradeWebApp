const axios = require('axios');
const fetch = require("node-fetch");

class DataCollector {
    binanceUrl;
    coinbitUrl;
    upbitUrl;
    bithumbUrl;

    constructor() {
        this.binanceUrl = 'https://www.binance.com/api/v3/ticker/24hr';
        this.coinbitUrl = 'https://api.coinbit.com/api/v1.0/trading_pairs/';
        this.upbitUrl = '';
        this.bithumbUrl = 'https://api.bithumb.com/public/ticker/ALL_KRW';
    }

    async getData() {
        const promises = [];

        const upbitMarkets = await this.getMarketList();
        const upbitMarketStrings = upbitMarkets.map( market => market.market);

        promises.push(axios.get(this.binanceUrl));
        promises.push(axios.get(this.coinbitUrl));
        promises.push(axios.get(this.bithumbUrl));
        promises.push(this.getTicker(upbitMarketStrings));

        const now = Date.now();

        const data = await Promise.all(promises);

        console.log(`${(Date.now() - now) / 1000} seconds passed`);

        return {
            binanceData: data[0].data,
            coinbitData: data[1].data,
            bithumbData: data[2].data.data,
            upbitData: data[3]
        }        
    }

    async getMarketList() {
        const pathname = 'market/all';
        const endpoint = this.getUpbitEndpoint('https://api.upbit.com/v1', pathname, '');
        const result = await fetch(endpoint);
        const data = await result.json();
      
        return data;
    };

    getTicker = async (markets) => {
        const pathname = 'ticker';
        const qs = `markets=${this.serializeArray(markets, (_) => _.toUpperCase())}`;
        const endpoint = this.getUpbitEndpoint('https://api.upbit.com/v1', pathname, qs);
        const result = await fetch(endpoint);
        const data = await result.json();
        
        return data;
    };

    getUpbitEndpoint = (host, pathname, qs) => (qs ? `${host}/${pathname}?${qs}` : `${host}/${pathname}`);
    serializeArray = (arr, callback) => arr.map(callback).join(',');
}

module.exports = DataCollector;