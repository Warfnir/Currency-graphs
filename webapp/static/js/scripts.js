var currencies_info = document.getElementById('currencies')

window.onload = function () {
    if (document.getElementById('charts_container')) {
        createTableWithAllCurrencies()
        createCurrenciesGraphs()
    }

}

async function createCurrenciesGraphs() {
    // Get currencies codes
    let data = await $.get('http://api.nbp.pl/api/exchangerates/tables/C/')
    data = data[0].rates
    let currencies_codes = []
    for (let i = 0; i < data.length; i++) {
        currencies_codes.push(data[i].code)
    }

    let charts_container = document.getElementById('charts_container')                              //Get graphs container
    for (let i = 0; i < currencies_codes.length; i++) {
        let data = await getCurrencyForYear(currencies_codes[i], 2019)                             //Get data about specific currency
        charts_container.insertAdjacentHTML('beforeend', htmlCanvas(currencies_codes[i] + "_chart"))//Add canvas
        drawGraph(currencies_codes[i] + "_chart", data.labels, data.data, currencies_codes[i])      //Draw chart in canvas
    }
}

function createTableWithAllCurrencies() {
    $.get('http://api.nbp.pl/api/exchangerates/tables/C/', function (data, status) {
        data = data[0].rates
        currencies_info.insertAdjacentHTML("beforeend", currencyTableRows(data))
    })
}


function htmlCanvas(chartId) {
    let html_text = ""
    html_text += "<div class='currency-chart'><canvas id=\"" + chartId + "\"></canvas></div>"
    return html_text
}


// Returns array with all currencies codes
async function getCurrenciesCodes() {
    let result = await $.get('http://api.nbp.pl/api/exchangerates/tables/C/', function (data, status) {
        data = data[0].rates
        var currencies_codes = []
        for (let i = 0; i < data.length; i++) {
            currencies_codes.push(data[i].code)
        }
        return currencies_codes
    })
    return result
}


// Returns currency mean values for a given year
async function getCurrencyForYear(code, year) {
    let data = await $.get('http://api.nbp.pl/api/exchangerates/rates/A/' + code + '/' + year + '-01-01/' + year + '-12-31/')
    let data_labels = []
    let data_mid = []
    data = data.rates
    result = {}
    for (let i = 0; i < data.length; i++) {
        data_labels.push(data[i].effectiveDate)
        data_mid.push(data[i].mid)
        result[data[i].effectiveDate] = data[i].mid
    }
    return { labels: data_labels, data: data_mid }
}


function currencyTableRows(data) {
    let html_text = ""
    for (let i = 0; i < data.length; i++) {
        html_text += "<tr><th scope='row'>" + (i + 1) + "</th><td>" + data[i].currency + "</td><td>" + data[i].code + "</td><td>" + data[i].bid + "</td><td>" + data[i].ask + "</td></tr>"
    }
    return html_text
}

function drawGraph(element_id, labels, data, code) {
    let ctx = document.getElementById(element_id).getContext('2d');
    let chart = new Chart(ctx,
        {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: code,
                    backgroundColor: 'green',
                    // backgroundColor: ['green', 'blue', 'red'],
                    borderColor: '#000000',
                    borderWidth: 1,
                    hoverBorderWidth: 3,
                    hoverBorderColor: 'white',
                    data: data
                }]
            },
            options: {
                title: {
                    display: true,
                    text: code
                },
                legend: {
                    display: false
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                tooltips: {
                    mode: 'nearest',
                }

            }
        });
}


