
const chartSize = { width: 1200, height: 700 };
const margin = { left: 100, right: 10, top: 10, bottom: 150 };

const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const r = x => _.round(x);

const initChart = companies => {
    const svg = d3
        .select("#chart-area svg")
        .attr("height", chartSize.height)
        .attr("width", chartSize.width);

    const g = svg.append("g");
    g
        .attr('class', 'time')
        .attr("transform", `translate(${margin.left},${margin.right})`);

    rects = g.selectAll("rect").data(companies, c => c.Name);

    g.append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - margin.top)
        .text("TIME");

    g.append("text")
        .attr("class", "y axis-label")
        .attr("transform", `rotate(-90)`)
        .attr("x", -(height / 2))
        .attr("y", -60)
        .text("CLOSE");

    g.append("g")
        .attr("class", "y-axis");

    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    g.append("path")
        .attr("class", "smaline");

    g.append("path")
        .attr("class", "close");
}


const updateChart = function (quotes, fieldName) {
    const svg = d3.select("#chart-area svg");
    const fq = _.first(quotes);
    const lq = _.last(quotes);

    const x = d3
        .scaleTime()
        .domain([fq.time, lq.time])
        .range([0, width]);

    const xAxis = d3.axisBottom(x);
    svg.select(".x-axis")
        .call(xAxis);
    const minDomain = Math.min(..._.map(quotes, 'Low'), ..._.map(_.filter(quotes, 'SMA'), 'SMA'));
    const maxDomain = Math.max(..._.map(quotes, 'Low'), ..._.map(_.filter(quotes, 'SMA'), 'SMA'));
    const y = d3
        .scaleLinear()
        .domain([minDomain, maxDomain])
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .ticks(15);

    svg.select(".y-axis")
        .call(yAxis);

    const line = d3.line()
        .x(q => x(q.time))
        .y(q => y(q.Close));

    const smaLine = d3.line()
        .x(q => x(q.time))
        .y(q => y(q.SMA))

    d3.select('.close').attr("d", line(quotes));
    d3.select('.smaline').attr("d", smaLine(_.filter(quotes, 'SMA')));
}

const createTable = function (transactions) {
    const tr = d3.select("#transactions-table table tbody")
        .selectAll("tr")
        .data(transactions)
        .enter().append("tr");

    const mapTransactionFields = (t, i) => [
        ++i,
        t.buy.Date,
        r(t.buy.Close),
        r(t.buy.SMA),
        t.sell.Date,
        r(t.sell.Close),
        r(t.sell.SMA),
        r(t.benefit)
    ];
    const td = tr.selectAll("td")
        .data(mapTransactionFields)
        .enter().append("td")
        .text(d => d);
}

const analyzeData = (quotes) => {
    const first100 = _.take(quotes, 100);
    avgOfFirst100 = first100.reduce((a, b) => a + b.Close, 0) / first100.length;
    let copyOfQuotes = quotes;

    for (i = 0; i < 101; i++) {
        quotes[i].Index = i;
    }

    for (i = 101; i < quotes.length; i++) {
        copyOfQuotes = copyOfQuotes.slice(1);
        let first100Elements = _.take(copyOfQuotes, 100);
        let avg = first100Elements.reduce((a, b) => a + b.Close, 0) / first100Elements.length;
        quotes[i].SMA = avg;
        quotes[i].Index = i;
    }

    return quotes;
}

const calculateTransactions = function (quotes) {

    allTransactions = _.reduce(quotes, (transactionsRecord, quote) => {
        let roundedClose = r(quote.Close);
        let roundedSMA = r(quote.SMA);

        if (roundedClose > roundedSMA && transactionsRecord.shouldBuy) {
            transactionsRecord.transactions.push({ "buy": quote });
            transactionsRecord.shouldBuy = false;
        }
        if (roundedClose < roundedSMA && !transactionsRecord.shouldBuy) {
            _.last(transactionsRecord.transactions)["sell"] = quote;
            transactionsRecord.shouldBuy = true;
        }
        return transactionsRecord;
    }, { shouldBuy: true, transactions: [] }).transactions;



    if (!_.last(allTransactions).sell) {
        _.last(allTransactions).sell = _.last(quotes);
    }

    console.log(allTransactions);
    return _.map(allTransactions, ({ buy, sell }) => {
        const benefit = sell.Close - buy.Close;
        let verdict = benefit >= 0 ? "win" : "lose";
        return { buy, sell, "benefit": benefit, "verdict": verdict };
    })
}

const showTransactionsSummary = function (transactions) {

    const wins = transactions.filter(t => t.verdict == "win");
    const loss = transactions.filter(t => t.verdict == "lose");

    const totalTransactions = transactions.length;
    const totalWins = wins.length;
    const totalLoss = loss.length;

    const totalWinAmount = _.reduce(wins, (sum, t) => sum + t.benefit, 0);
    const totalLossAmount = _.reduce(loss, (sum, t) => sum + t.benefit, 0);
    const winPercentage = (totalWins / totalTransactions) * 100;
    const averageWinSize = totalWinAmount / totalWins;
    const averageLossSize = totalLossAmount / totalLoss;
    const winMultiple = averageWinSize / averageLossSize;
    const net = _.reduce(transactions, (sum, t) => sum + t.benefit, 0);
    const expectancy = totalWinAmount / totalTransactions;

    const summary = [
        { "k": "Total Transactions", "v": totalTransactions },
        { "k": "Total Wins", "v": totalWins },
        { "k": "Total Loss", "v": totalLoss },
        { "k": "Win Percentage %", "v": r(winPercentage) },
        { "k": "Average Win Size", "v": r(averageWinSize) },
        { "k": "Average Loss Size", "v": Math.abs(r(averageLossSize)) },
        { "k": "Win Multiple", "v": r(winMultiple) },
        { "k": "Net", "v": r(net) },
        { "k": "Expectancy", "v": r(expectancy) },
    ]

    const tr = d3.select("#transactions-summary table tbody")
        .selectAll("tr")
        .data(summary)
        .enter().append("tr");

    const td = tr.selectAll("td")
        .data((t, i) => { return Object.values(t) })
        .enter().append("td")
        .text(d => d);
}

const parseData = ({ Date, Volume, AdjClose, ...numerics }) => {
    _.forEach(numerics, (v, k) => numerics[k] = +v);
    return { Date, time: new window.Date(Date), ...numerics };
}

const showSelectedDates = function (startDate, endDate) {
    const showElement = document.getElementById("selected-range");
    showElement.innerText = `${startDate.toLocaleDateString()}  - ${endDate.toLocaleDateString()}`;
}

const createSlider = function (quotes) {
    x = quotes
    const f = _.first(quotes);
    const l = _.last(quotes);
    window.slider = createD3RangeSlider(f.Index, l.Index, "#slider");
    slider.range(f.Index, l.Index);

    showSelectedDates(f.time, l.time);

    slider.onChange((range) => {
        let begin = range.begin;
        let end = range.end;
        showSelectedDates(quotes[begin].time, quotes[end].time);
        updateChart(quotes.slice(begin, end));
    })
}

const startVisualization = data => {
    initChart();
    const analyzedData = analyzeData(data);
    const transactions = calculateTransactions(analyzedData.slice(101));
    createTable(transactions);
    showTransactionsSummary(transactions);
    updateChart(analyzedData);
    createSlider(analyzedData.slice(0));

};

const main = () => {
    d3.csv("data/nifty.csv", parseData).then(startVisualization);
};

window.onload = main;
