// var figureData;
// var figureDataURL = "data/figureData.js"

function drawMap(containerID, dataID, title, units){
 // data is an array of objects, each of form
 //    {
 //      "geography": "AK",
 //      "year": "2014",
 //      "month": "11",
 //      "value": "6.3"
 //    }

  var $graphic = $("#"+containerID);

  var aspect_width = 2;
  var aspect_height = 1.2;
  var margin = { top: 10, right: 10, bottom: 10, left: 10 };
  var width = $graphic.width() - margin.left - margin.right;

  var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;
  var slice = figureData[dataID]["data"]
  console.log(figureData)
  var min = Math.floor(
  				Math.min.apply(Math,slice.map(function(o){return o.value;}))
  			)
  var max = Math.ceil(
  				Math.max.apply(Math,slice.map(function(o){return o.value;}))
  			)
  console.log(min,max)

  var quantize = d3.scale.quantize()
      .domain([min, max])
      .range(d3.range(4).map(function(i) { return "q" + i + "-4"; }));

  var projection = d3.geo.albersUsa()
      .scale(width + margin.left + margin.right)
      .translate([width / 2, height / 2]);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#"+containerID)
    .attr("height", height)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  d3.select(self.frameElement).style("height", height + "px");

  queue()
    .defer(d3.json, "shapefile/us-counties.json")
    .await(ready);

  function ready(error,us) {
    svg.append("g")
        .attr("id", "map-states")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
        .attr("class", function(d) {
        	var state = slice.filter(function(obj){return obj.geography.fips == d.id})	;
	        	if(state.length > 0){
        		return "states " + quantize(state[0].value)
        	}
        	else{
        		return "states NA"
        	}
    	})
        .attr("id", function(d) { return "state-outline_" + d.id ;})
        .attr("d", path)
        // .on("mouseover", function(d){mouseover(d,states,x,y,aca,king)})

        // mouseover(_.find(states, function(d) {return d.values[0].state.name == "5" }),states,x,y,aca,king);

  }
}

function drawScatterPlot(container, xData, yData, title, xUnits, yUnits){
 // xData and yData are arrays of objects, each of form
 //    {
 //      "geography": "AK",
 //      "year": "2014",
 //      "month": "11",
 //      "value": "6.3"
 //    }
}

function drawFigures(){
	// slice figureData and pass it to drawMap and drawScatterPlot calls
}

// d3.json(figureDataURL, function(error, data) {
//     figureData = data;

//     drawFigures();
//     window.onresize = drawFigures;
// }



drawMap("testing","RUC",null,null)