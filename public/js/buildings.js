const drawBuildings = buildings => {
  const toLine = b => `<strong>${b.name}</strong> <i>${b.height}</i>`;
  document.querySelector("#chart-area").innerHTML = buildings
    .map(toLine)
    .join("<hr/>");

  const width = 400;
  const height = 400;

  const container = d3.select("#chart-data");
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const y = d3
    .scaleLinear()
    .domain([0, _.maxBy(buildings, b => b.height).height])
    .range([0, height]);

  x = d3
    .scaleBand()
    .domain(_.map(buildings, "name"))
    .range([0, width])
    .padding(0.3);

  const rectangles = svg.selectAll("rect").data(buildings);

  const newRectangles = rectangles.enter().append("rect");
  newRectangles
    .attr("y", 0)
    .attr("x", b => x(b.name))
    .attr("width", x.bandwidth)
    .attr("height", b => y(b.height));
};

const main = () => {
  d3.json("data/buildings.json").then(drawBuildings);
};
window.onload = main;
