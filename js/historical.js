function drawGraphic(dataID){

  var states = {"Alabama": "AL","Alaska": "AK","American Samoa": "AS","Arizona": "AZ","Arkansas": "AR","California": "CA","Colorado": "CO","Connecticut": "CT","Delaware": "DE","District Of Columbia": "DC","Federated States Of Micronesia": "FM","Florida": "FL","Georgia": "GA","Guam": "GU","Hawaii": "HI","Idaho": "ID","Illinois": "IL","Indiana": "IN","Iowa": "IA","Kansas": "KS","Kentucky": "KY","Louisiana": "LA","Maine": "ME","Marshall Islands": "MH","Maryland": "MD","Massachusetts": "MA","Michigan": "MI","Minnesota": "MN","Mississippi": "MS","Missouri": "MO","Montana": "MT","Nebraska": "NE","Nevada": "NV","New Hampshire": "NH","New Jersey": "NJ","New Mexico": "NM","New York": "NY","North Carolina": "NC","North Dakota": "ND","Northern Mariana Islands": "MP","Ohio": "OH","Oklahoma": "OK","Oregon": "OR","Palau": "PW","Pennsylvania": "PA","Puerto Rico": "PR","Rhode Island": "RI","South Carolina": "SC","South Dakota": "SD","Tennessee": "TN","Texas": "TX","Utah": "UT","Vermont": "VT","Virgin Islands": "VI","Virginia": "VA","Washington": "WA","West Virginia": "WV","Wisconsin": "WI","WY": "Wyoming", "US Average": "USA", "United States": "USA"}

  var months,
      monthFormat = d3.time.format("%Y-%m");

  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var voronoi = d3.geom.voronoi()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); })
      .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

  var line = d3.svg.line()
      // .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

  var svg = d3.select("#" + dataID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/historical/" + dataID + ".csv", type, function(error, states) {
    // console.log(error, states)
    x.domain(d3.extent(months));
    y.domain([d3.min(states, function(c) { return d3.min(c.values, function(d) { return d.value; }); }), d3.max(states, function(c) { return d3.max(c.values, function(d) { return d.value; }); })]).nice();

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
          .scale(x)
          .orient("bottom"));

    svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10))
      .append("text")
        .attr("x", 4)
        .attr("dy", ".32em")
        .style("font-weight", "bold")
        .text("Unemployment Rate");

    svg.append("g")
        .attr("class", "states")
      .selectAll("path")
        .data(states)
      .enter().append("path")
        .attr("d", function(d) { d.line = this; return line(d.values); })
        .attr("id", function(d){  return d.abbrev});

    var focus = svg.append("g")
        .attr("transform", "translate(-100,-100)")
        .attr("class", "focus");

    focus.append("circle")
        .attr("r", 5)
        .attr("class","marker");

    // focus.append("text")
    //     .attr("y", -10);

    var voronoiGroup = svg.append("g")
        .attr("class", "voronoi");

    voronoiGroup.selectAll("path")
        .data(voronoi(d3.nest()
            .key(function(d) { return x(d.date) + "," + y(d.value); })
            .rollup(function(v) { return v[0]; })
            .entries(d3.merge(states.map(function(d) { return d.values; })))
            .map(function(d) { return d.values; })))
      .enter().append("path")
        .attr("d", function(d) { if(typeof(d) != "undefined"){return "M" + d.join("L") + "Z"; }})
        .datum(function(d) { if(typeof(d) != "undefined"){return d.point; }})
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
   d3.select("#USA").node().parentNode.appendChild(d3.select("#USA").node());

    // d3.select("#show-voronoi")
    //     .property("disabled", false)
    //     .on("change", function() { voronoiGroup.classed("voronoi--show", this.checked); });

    function mouseover(d) {
      d3.select(d.state.line).classed("state--hover", true);
      d.state.line.parentNode.appendChild(d.state.line);
      focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
      // focus.select("text").text(d.state.name);
      console.log(d.state.name)
      console.log(d.value)
      console.log(d.date)
    }

    function mouseout(d) {
      d3.select(d.state.line).classed("state--hover", false);
      focus.attr("transform", "translate(-100,-100)");
      d3.select("#USA").node().parentNode.appendChild(d3.select("#USA").node());
    }
  });

  function type(d, i) {
    if (!i) months = Object.keys(d).map(monthFormat.parse).filter(Number);
    var state = {
      name: d.state,
      abbrev: states[d.state],
      values: null
    };
    state.values = months.map(function(m) {
      // console.log(d)
      return {
        state: state,
        date: m,
        value: d[monthFormat(m)] /1
      };
    });
    return state;
  }
}

drawGraphic("gov_employment_historical")