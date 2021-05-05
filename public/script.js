const socket = io.connect("http://localhost:4001");

const rankingBody= document.querySelector("#table-body");
var priceBTC =1;

socket.emit("hello", "USDT");


socket.on('first-data', (data) => {
    rankingBody.innerHTML = '';
    for(const tickerData of data) {
        const tr = document.createElement('tr');
        for(const property in tickerData) {
            // create td field
            const dynamicId = `${tickerData['symbol']}${property}`;
            const td = document.createElement('td');
            td.setAttribute('id', dynamicId);

            
            if (property === "priceBithumb" || property === "priceCoinbit" || property === "priceUpbit") {
                // create spans for price and percentage
                const priceSpan = document.createElement('span');
                const percentageSpan = document.createElement('span');

                priceSpan.setAttribute('id', `${dynamicId}-price`);
                percentageSpan.setAttribute('id', `${dynamicId}-percentage`);

                const priceSpanValue = tickerData[property];
                const percentageSpanValue = (((priceSpanValue - tickerData["priceBinance"]) / priceSpanValue) * 100).toFixed(2);

                priceSpan.textContent = priceSpanValue;
                percentageSpan.textContent = percentageSpanValue;
                
                td.innerHTML += '$';
                td.appendChild(priceSpan);
                td.innerHTML += '/';
                if (tickerData["priceBinance"] === 0 || !isFinite(percentageSpanValue)) {
                    percentageSpan.textContent = 'N/A';
                    td.appendChild(percentageSpan);
                } else {
                    td.appendChild(percentageSpan);
                    td.innerHTML += '%';
                }
            } else if (property === "symbol") {
                td.textContent = tickerData[property]+"/USDT";
            } else {
                
                td.textContent = "$"+tickerData[property];
            }
                
            tr.appendChild(td);
        }
        rankingBody.appendChild(tr);
    }
});

socket.on('tabel-data', (data) => {
    console.log('new data');
    for (const tickerData of data) {
        for (const property in tickerData) {
            const dynamicId = `${tickerData['symbol']}${property}`;
            if (property === "priceBithumb" || property === "priceCoinbit" || property === "priceUpbit") {
               const priceSpan = document.getElementById(`${dynamicId}-price`);
               const percentageSpan = document.getElementById(`${dynamicId}-percentage`);
               
               priceSpan.textContent = tickerData[property];
               const percentageSpanValue = (((tickerData[property] - tickerData["priceBinance"]) / tickerData[property]) * 100).toFixed(2);
               percentageSpan.textContent = (!tickerData["priceBinance"] || !isFinite(percentageSpanValue)) ? 'N/A' : percentageSpanValue;
            } else if (property === "symbol") {
                // we do not update anything
                continue;
            } else if (property === "priceBinance") {
                const td = document.getElementById(`${dynamicId}`);
                td.textContent ='$' + tickerData[property];
            } else {
                const td = document.getElementById(`${dynamicId}`);
                td.textContent ='$' + numberWithCommas(tickerData[property]);
            }
        }
    }
})

const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

window.onload = () => {
    const getCellValue = (tr, idx) => {
        return tr.children[idx].children[1].innerText || tr.children[idx].children[1].textContent;
    }

    const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        const arrayToSort = Array.from(table.querySelectorAll('tr:nth-child(n+1)'));
        arrayToSort.shift();
        arrayToSort
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr) );
    })));
}

