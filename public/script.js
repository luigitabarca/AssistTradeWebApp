const socket = io.connect("http://localhost:4001");

const rankingBody= document.querySelector("#table-body");

socket.on('tabel-data', (data) => {
    rankingBody.innerHTML = '';
    console.log(data);
    for(const tickerData of data) {
        const tr = document.createElement('tr');
        for(const property in tickerData) {
            const td = document.createElement('td');
            if(property=="priceBithumb"||property=="priceCoinbit"||property=="priceUpbit")
                td.textContent = "$"+tickerData[property] +" /"+ ((tickerData[property]-tickerData["priceBinance"])/tickerData[property]*100).toFixed(2)+"%";
            else
                if(property=="symbol")
                    td.textContent = tickerData[property]+"/USDT";
                else
                    td.textContent = "$"+tickerData[property];
            tr.appendChild(td);
        }
        rankingBody.appendChild(tr);
    }
})

