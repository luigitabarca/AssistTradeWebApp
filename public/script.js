const socket = io.connect("http://localhost:4001");

const rankingBody= document.querySelector("#table-body");

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

                td.appendChild(priceSpan);
                td.innerHTML += '/';
                td.appendChild(percentageSpan);
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
               percentageSpan.textContent = (((tickerData[property] - tickerData["priceBinance"]) / tickerData[property]) * 100).toFixed(2);
            } else if (property === "symbol") {
                // we do not update anything
                continue;
            } else {
                const td = document.getElementById(`${dynamicId}`);
                td.textContent = tickerData[property];
            }
        }
    }
})

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
        console.log(arrayToSort);
        arrayToSort
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr) );
    })));
}

