const showData = buildings => {
  const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
  document.querySelector("#chart-data").innerHTML = buildings
    .map(toLine)
    .join("<hr/>");
};

const drawChart = buildings => {
  // const [width, height] = [400, 400];
  const chartSize = { width: 600, height: 400 };
  const margin = { left: 100, right: 10, top: 10, bottom: 150 };

  const width = chartSize.width - margin.left - margin.right;
  const height = chartSize.height - margin.top - margin.bottom;

  const svg = d3
    .select("#chart-area")
    .append("svg")
    .attr("height", chartSize.height)
    .attr("width", chartSize.width);

  buildingsG = svg.append("g");
  buildingsG.attr("transform", `translate(${margin.left},${margin.right})`);

  const y = d3
    .scaleLinear()
    .domain([0, _.maxBy(buildings, "height").height])
    .range([height, 0]);

  const x = d3
    .scaleBand()
    .domain(_.map(buildings, "name"))
    .range([0, width])
    .padding(0.3);

  const rects = buildingsG.selectAll("rect").data(buildings);

  const newRects = rects.enter();
  newRects
    .append("rect")
    .attr("x", b => x(b.name))
    .attr("y", b => y(b.height))
    .attr("width", x.bandwidth)
    .attr("height", b => y(0) - y(b.height))
    .attr("fill", "grey");

  buildingsG.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("tall building");

  buildingsG.append("text")
    .attr("class", "axis-label")
    .attr("transform", `rotate(-90)`)
    .attr("x", -(height / 2))
    .attr("y", -60)
    .text("Height (m)");

  const yAxis = d3.axisLeft(y).tickFormat(d => d + "m").ticks(3);

  buildingsG.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  const xAxis = d3.axisBottom(x);

  const xAxisG = buildingsG.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  xAxisG.selectAll("text")
    .attr("class", "building-names")
    .attr("transform", "rotate(-90)")
    .attr("x", 6)
    .attr("y", 0);
};

const drawBuildings = buildings => {
  showData(buildings);
  drawChart(buildings);
};

const main = () => {
  d3.json("data/buildings.json").then(drawBuildings);
};

window.onload = main;
