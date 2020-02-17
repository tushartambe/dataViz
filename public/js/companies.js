
const chartSize = { width: 800, height: 600 };
const margin = { left: 100, right: 10, top: 10, bottom: 150 };

const width = chartSize.width - margin.left - margin.right;
const height = chartSize.height - margin.top - margin.bottom;

const color = d3.scaleOrdinal(d3.schemeCategory10);

const easeTransiction = d3.transition()
    .duration(1000)
    .ease(d3.easeLinear)

const percentageFormat = d => `${d}%`;
const kCroresFormat = d => `${d / 1000}k Cr ₹`;
const rsFormat = d => d + "₹";

const formats = {
    MarketCap: kCroresFormat,
    DivYld: percentageFormat,
    QSales: kCroresFormat,
    QNetProfit: kCroresFormat,
    ROCE: percentageFormat,
    CMP: rsFormat
};

const initChart = companies => {
    const svg = d3
        .select("#chart-area svg")
        .attr("height", chartSize.height)
        .attr("width", chartSize.width);

    companiesG = svg.append("g");
    companiesG
        .attr('class', 'companies')
        .attr("transform", `translate(${margin.left},${margin.right})`);

    rects = companiesG.selectAll("rect").data(companies, c => c.Name);

    companiesG.append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - margin.top);

    companiesG.append("text")
        .attr("class", "y axis-label")
        .attr("transform", `rotate(-90)`)
        .attr("x", -(height / 2))
        .attr("y", -60)

    companiesG.append("g")
        .attr("class", "y-axis")

    companiesG.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
}


const updateChart = function (companies, fieldName) {
    const svg = d3.select("#chart-area svg");

    svg.select(".y.axis-label").
        text(fieldName);

    svg.select(".x.axis-label").
        text("Companies");

    const maxValue = _.get(_.maxBy(companies, fieldName), fieldName, 0);
    y = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(formats[fieldName]);

    svg.select(".y-axis")
        .call(yAxis)

    const x = d3
        .scaleBand()
        .domain(_.map(companies, "Name"))
        .range([0, width])
        .padding(0.3);

    const xAxis = d3.axisBottom(x);

    svg.select(".x-axis")
        .call(xAxis);

    const companiesG = svg.select('.companies');
    const rects = companiesG.selectAll('rect').data(companies, c => c.Name);

    rects.exit()
        .transition(easeTransiction)
        .remove()

    rects.enter()
        .append('rect')
        .attr('fill', b => color(b.Name))
        .attr('y', y(0))
        .attr('x', c => x(c.Name))
        .merge(rects)
        .transition(easeTransiction)
        .attr('height', b => y(0) - y(b[fieldName]))
        .attr('y', b => y(b[fieldName]))
        .attr('x', b => x(b.Name))
        .attr('width', x.bandwidth);
}

const frequentlyMoveCompanies = (src, dest) => {
    setInterval(() => {
        const c = src.shift();
        if (c) dest.push(c);
        else[src, dest] = [dest, src];

    }, 2000);
}

const drawCompanies = companies => {
    initChart(companies);
    const fields = "CMP,PE,MarketCap,DivYld,QNetProfit,QSales,ROCE".split(",");
    let step = 1;
    updateChart(companies, fields[0])
    setInterval(() => updateChart(companies, fields[step++ % fields.length]), 3000)
    frequentlyMoveCompanies(companies, []);
};

const parseCompany = ({ Name, ...numerics }) => {
    _.forEach(numerics, (v, k) => numerics[k] = +v);
    return { Name, ...numerics };
}

const main = () => {
    d3.csv("data/companies.csv", parseCompany).then(drawCompanies);
};

window.onload = main;
