class DataParser {
    constructor() {}

    parseBithumpbData(data) {
        const parsedData = [];
        for(const ticker of Object.keys(data)) {
            if(!data.hasOwnProperty(ticker) || ticker === 'date') {
                continue;
            }

            parsedData.push({
                symbol: ticker,
                price: data[ticker].closing_price,
                volume: data[ticker].acc_trade_value_24H
            });
        }

        return parsedData;
    }

    parseBinanceData(data, symbols) {
        const parsedData = {};

        // filter non-usdt tickers
        const usdtTickers = data.filter(ticker => ticker.symbol.includes('USDT', 1));

        // remove USDT from ticker symbols
        // TODO: use replace instead of substring
        for(const ticker of usdtTickers) {
            ticker.symbol = ticker.symbol.substring(0, ticker.symbol.length - 4);
        }

        // filter unecessary tickers
        const necessaryTickers = usdtTickers.filter(ticker => symbols.includes(ticker.symbol));

        for (const ticker of necessaryTickers) {
            parsedData[ticker.symbol] = {
                price: ticker.lastPrice,
                volume: ticker.quoteVolume
            }
        }

        return parsedData;
    }

    parseCoinbitData(data, symbols) {
        const parsedData = {};

        // filter unecessary tickers
        const necessaryTickers = data.filter(ticker => symbols.includes(ticker.base_symbol));

        for (const ticker of necessaryTickers) {
            parsedData[ticker.base_symbol] = {
                price: ticker.close_price,
                volume: ticker.acc_trade_value_24h  
            }
        }

        return parsedData;
    }

    parseUpbitData(data, symbols) {
        const parsedData = {};

        // filter non-krw tickers
        const krwTickers = data.filter(ticker => ticker.market.includes('KRW-'));

        // remove KRW- from ticker symbols
        // TODO: use replace instead of substring
        for(const ticker of krwTickers) {
            ticker.market = ticker.market.substring(4);
        }

        // filter unecessary tickers
        const necessaryTickers = krwTickers.filter(ticker => symbols.includes(ticker.market));

        for (const ticker of necessaryTickers) {
            parsedData[ticker.market] = {
                price: ticker.trade_price,
                volume: ticker.acc_trade_price_24h 
            }
        }

        return parsedData;
    }

    unifyParsedData(parsedBithumbData, parsedBinanceData, parsedCoinbitData, parsedUpbitData) {
        const unifiedData = [];
        for(const ticker of parsedBithumbData) {
            unifiedData.push({
                symbol: ticker.symbol,
                priceBithumb: (parseFloat(ticker.price) * 0.0009).toFixed(4),
                volumeBihumb: parseInt(parseFloat(ticker.volume) * 0.0009),
                priceBinance: parsedBinanceData[ticker.symbol] ? (parseFloat(parsedBinanceData[ticker.symbol].price)).toFixed(4) : 0,
                volumeBinance: parsedBinanceData[ticker.symbol] ? parseInt(parsedBinanceData[ticker.symbol].volume) : 0,
                priceCoinbit: parsedCoinbitData[ticker.symbol] ? (parseFloat(parsedCoinbitData[ticker.symbol].price) * 0.0009 ).toFixed(4): 0,
                volumeCoinbit: parsedCoinbitData[ticker.symbol] ? parseInt(parseFloat(parsedCoinbitData[ticker.symbol].volume) * 0.0009) : 0,
                priceUpbit: parsedUpbitData[ticker.symbol] ? (parsedUpbitData[ticker.symbol].price * 0.0009).toFixed(4) : 0,
                volumeUpbit: parsedUpbitData[ticker.symbol] ? parseInt(parsedUpbitData[ticker.symbol].volume * 0.0009) : 0,
            });
        }

        return unifiedData;
    }
}

module.exports = DataParser;