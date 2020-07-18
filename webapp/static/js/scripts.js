var currencies_info = document.getElementById('currencies')

window.onload = function () {
    if (document.getElementById('charts_container')) {
        createTableWithAllCurrencies()
        // createCurrenciesGraphs()
        drawGraphsWithCalcs()
    }
}

async function createCurrenciesGraphs() {
    let data = await $.get('http://api.nbp.pl/api/exchangerates/tables/C/')
    data = data[0].rates
    let currencies_codes = []
    for (let i = 0; i < data.length; i++) {
        currencies_codes.push(data[i].code)
    }

    let charts_container = document.getElementById('charts_container')                              //Get graphs container
    for (let i = 0; i < currencies_codes.length; i++) {
        let data = await getCurrencyForLastYear(currencies_codes[i])                             //Get data about specific currency
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
async function getCurrencyForLastYear(code) {
    //Todays date
    let today = new Date(),
    tday = today.getDate().toString(),
    tmonth = (today.getMonth()+1).toString(),
    tyear = today.getFullYear()
    if(tmonth.length<2){
        tmonth= "0"+tmonth
    }
    if(tday.length<2){
        tday="0"+tday
    }

    //Year ago date 
    let yearago = new Date()
    yearago.setDate(yearago.getDate() - 365) 
    let yday = yearago.getDate().toString(),
    ymonth = (yearago.getMonth()+1).toString(),
    yyear = yearago.getFullYear()
    if(ymonth.length<2){
        ymonth= "0"+ymonth
    }
    if(tday.length<2){
        ymonth="0"+ymonth
    }


    var options = {year: 'numeric', month: '2-digit', day:'2-digit'}
    
    console.log(tyear+'-'+tmonth+'-'+tday)
    console.log(yyear+'-'+ymonth+'-'+yday)
    let data = await $.get('http://api.nbp.pl/api/exchangerates/rates/A/' + code + '/' + yyear+"-"+ymonth+"-"+yday+"/" +  tyear+"-"+tmonth+"-"+tday+"/")
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
        html_text += "<tr class=\"currency-row\"><th scope='row'>" + (i + 1) + "</th><td>" + data[i].currency + "</td><td>" + data[i].code + "</td><td>" + data[i].bid + "</td><td>" + data[i].ask + "</td></tr>"
    }
    return html_text
}

function drawGraph(element_id, labels, names, data, code, colors) {
    let ctx = document.getElementById(element_id).getContext('2d');
    let datasets = []
    for(let i=0; i< data.length; i++){
        datasets.push({
                label: code+" "+names[i],
                backgroundColor: colors[i],
                // backgroundColor: ['green', 'blue', 'red'],
                borderColor: '#000000',
                borderWidth: 1,
                hoverBorderWidth: 3,
                hoverBorderColor: 'white',
                data: data[i]})
    }
    let chart = new Chart(ctx,
        {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                title: {
                    display: true,
                    text: code
                },
                legend: {
                    display: true
                },
                elements: {
                    point: {
                        radius: 1
                    }
                },
                tooltips: {
                    mode: 'nearest',
                }

            }
        });
}

// CALCULATOR
function calc_change(id, converter){
    let input=document.getElementById(id+1),
    output = document.getElementById(id+2)
    output.value = input.value*converter
}

async function drawGraphsWithCalcs(){
    let data = await $.get('http://api.nbp.pl/api/exchangerates/tables/C/')
    data = data[0].rates
    let currencies_codes = []
    for (let i = 0; i < data.length; i++) {
        currencies_codes.push(data[i].code)
    }

    let graphs_with_calculators = document.getElementById("charts_and_calcs")
    for(let i = 0; i<currencies_codes.length; i++){
        let data = await getCurrencyBuySellForLastYear(currencies_codes[i])
        graphs_with_calculators.insertAdjacentHTML('beforeend', htmlCanvas(currencies_codes[i] + "_graph"))
        drawGraph(currencies_codes[i]+"_graph", data.labels, ["SELL", "BUY"], [data.data.bid, data.data.ask], currencies_codes[i], ["rgba(100,220,100,0.2)", "rgba(100,100,220,0.2)"])
        graphs_with_calculators.insertAdjacentHTML('beforeend', htmlCalcTable(currencies_codes[i]))
        document.getElementById("PLNTO"+currencies_codes[i].toUpperCase()+"1").addEventListener("input", function(){calc_change("PLNTO"+currencies_codes[i].toUpperCase(), 1/data.data.ask[data.data.ask.length-1])})
        document.getElementById(currencies_codes[i].toUpperCase()+"TOPLN1").addEventListener("input", function(){calc_change(currencies_codes[i].toUpperCase()+"TOPLN", data.data.bid[data.data.bid.length-1])})
    }
}

function htmlCalcTable(code){
    code = code.toUpperCase()
    console.log(code)
    let html=''
    html += '<table class="calc-table"><tr>'
    html += '<td colspan="2"><label for="PLNTO'+code+'"/> PLN TO '+code+' </label></td></tr><tr>'
    html += '<td><input type="number" min="1" step="any" placeholder="PLN" id="PLNTO'+code+'1" /></td>'
    html += '<td><input type="number" min="1" step="any" placeholder="'+code+'" id="PLNTO'+code+'2" disabled /></td>'
    html += '</tr><tr>'
    html += '<td colspan="2"><label for="'+code+'TOPLN"/>'+code+' TO PLN </label></td></tr><tr>'
    html += '<td><input type="number" min="1" step="any" placeholder="'+code+'" id="'+code+'TOPLN1" /></td>'
    html += '<td><input type="number" min="1" step="any" placeholder="PLN" id="'+code+'TOPLN2" disabled /></td>'
    html += '</tr></table>'
    return html
}

async function getCurrencyBuySellForLastYear(code) {
    //Todays date
    let today = new Date(),
    tday = today.getDate().toString(),
    tmonth = (today.getMonth()+1).toString(),
    tyear = today.getFullYear()
    if(tmonth.length<2){
        tmonth= "0"+tmonth
    }
    if(tday.length<2){
        tday="0"+tday
    }

    //Year ago date 
    let yearago = new Date()
    yearago.setDate(yearago.getDate() - 365) 
    let yday = yearago.getDate().toString(),
    ymonth = (yearago.getMonth()+1).toString(),
    yyear = yearago.getFullYear()
    if(ymonth.length<2){
        ymonth= "0"+ymonth
    }
    if(tday.length<2){
        ymonth="0"+ymonth
    }


    var options = {year: 'numeric', month: '2-digit', day:'2-digit'}
    
    let data = await $.get('http://api.nbp.pl/api/exchangerates/rates/C/' + code + '/' + yyear+"-"+ymonth+"-"+yday+"/" +  tyear+"-"+tmonth+"-"+tday+"/")
    let data_labels = []
    let data_bid = []
    let data_ask = []
    data = data.rates
    for (let i = 0; i < data.length; i++) {
        data_labels.push(data[i].effectiveDate)
        data_bid.push(data[i].bid)
        data_ask.push(data[i].ask)
    }
    return { labels: data_labels, data: {bid: data_bid, ask: data_ask} }
}
