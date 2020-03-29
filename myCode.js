var w = 1000,
  h = 700;

var body = d3.select('body')
var container = d3.select("#container");
var svg = container.append('svg')
  .attr('width', w)
  .attr('height', h)

var tooltip = body.append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

var color = d3.scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeOranges[9]);

var xScale = d3.scaleLinear()
  .domain([2.6, 75.1])
  .rangeRound([490, 750]);

var g = svg.append("g")
  .attr("id", "legend")
  .attr("transform", "translate(0,550)");

g.selectAll("rect")
  .data(color.range().map(d => {
    d = color.invertExtent(d);
    if (d[0] === null) d[0] = xScale.domain()[0];
    if (d[1] === null) d[1] = xScale.domain()[1];
    return d;
  }))
  .enter()
  .append("rect")
  .attr("height", 15)
  .attr("x", d => xScale(d[0]))
  .attr("width", d => xScale(d[1]) - xScale(d[0]))
  .attr("fill", d => color(d[0]));

g.call(d3.axisBottom(xScale)
  .tickSize(21)
  .tickFormat(d => Math.round(d) + '%')
  .tickValues(color.domain())
)

g.select(".domain").remove();

var files = [
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json',
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'
];
var promises = [];

files.forEach(function (url) {
  promises.push(d3.json(url))
});

Promise.all(promises).then(function (values) {
  var us = values[0];
  var education = values[1];

  var geoPath = d3.geoPath();

  svg.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("class", "states")
    .attr("d", geoPath);

  var TopoJSON_File =
  {
    "type": "Topology",
    "transform": {
      "scale": [0.036003600360036005, 0.017361589674592462],
      "translate": [-180, -89.99892578124998]
    },
    "objects": {
      "aruba": {
        "type": "Polygon",
        "arcs": [[0]],
        "id": 533
      }
    },
    "arcs": [
      [[3058, 5901], [0, -2], [-2, 1], [-1, 3], [-2, 3], [0, 3], [1, 1], [1, -3], [2, -5], [1, -1]]
    ]
  }

  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", function (d) {
      return d.id
    })
    .attr("data-education", function (d) {
      var result = education.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return result[0].bachelorsOrHigher
      }
      return 0
    })
    .attr("fill", function (d) {
      var result = education.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return color(result[0].bachelorsOrHigher)
      }
      return color(0)
    })
    .attr("d", geoPath)
    .on("mouseover", function (d) {
      tooltip.style("opacity", 1);
      tooltip.html(function () {
        var result = education.filter(function (obj) {
          return obj.fips === d.id;
        });
        if (result[0]) {
          return result[0]['area_name'] + ': ' + result[0].bachelorsOrHigher + '%'
        }
        return 0
      })
        .attr("data-education", function () {
          var result = education.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return result[0].bachelorsOrHigher
          }
          return 0
        })
        .style("left", (d3.event.pageX + 10))
        .style("top", (d3.event.pageY - 28));
    })
    .on("mouseout", function (d) {
      tooltip.style("opacity", 0);
    });
})
