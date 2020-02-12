
const drawChart = companies => {
    const chartSize = { width: 800, height: 600 };
    const margin = { left: 100, right: 10, top: 10, bottom: 150 };

    const width = chartSize.width - margin.left - margin.right;
    const height = chartSize.height - margin.top - margin.bottom;

    const svg = d3
        .select("#chart-area")
        .append("svg")
        .attr("height", chartSize.height)
        .attr("width", chartSize.width);

    companiesG = svg.append("g");
    companiesG.attr("transform", `translate(${margin.left},${margin.right})`);

    const y = d3
        .scaleLinear()
        .domain([0, _.maxBy(companies, "CMP").CMP])
        .range([height, 0]);

    const x = d3
        .scaleBand()
        .domain(_.map(companies, "Name"))
        .range([0, width])
        .padding(0.3);

    const c = d3.scaleOrdinal(d3.schemeCategory10);

    rects = companiesG.selectAll("rect").data(companies);

    console.log(companies[0].CMP);
    const newRects = rects.enter();
    newRects
        .append("rect")
        .attr("x", b => x(b.Name))
        .attr("y", b => y(b.CMP))
        .attr("width", x.bandwidth)
        .attr("height", b => y(0) - y(b.CMP))
        .attr("fill", b => c(b.Name));

    companiesG.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 140)
        .text("Companies");

    companiesG.append("text")
        .attr("class", "axis-label")
        .attr("transform", `rotate(-90)`)
        .attr("x", -(height / 2))
        .attr("y", -60)
        .text("CMP");

    const yAxis = d3.axisLeft(y).tickFormat(d => d + "₹").ticks(10);

    companiesG.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    const xAxis = d3.axisBottom(x);

    const xAxisG = companiesG.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    xAxisG.selectAll("text")
        .attr("class", "column-names")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10);
}

const drawCompanies = companies => {
    drawChart(companies);
};

const parseCompany = ({ Name, ...numerics }) => {
    _.forEach(numerics, (v, k) => numerics[k] = +v);
    return { Name, ...numerics };
}

const main = () => {
    d3.csv("data/companies.csv", parseCompany).then(drawCompanies);
};

window.onload = main;
