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
  var aspect_height = 3;
  var margin = { top: 10, right: 10, bottom: 10, left: 10 };
  var width = $graphic.width() - margin.left - margin.right;

  var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;
  var slice = figureData[dataID]["data"]
  var minIn = Math.min.apply(Math,slice.map(function(o){return o.value;}))
  var maxIn = Math.max.apply(Math,slice.map(function(o){return o.value;}))
  			
  var breaks = getNiceBreaks(minIn,maxIn,5),
  	  min = breaks.min,
  	  max = breaks.max;
  var step = (max-min)/5

  console.log(breaks,min, min+step, min+ step*2, min+ step*3, min + step*4, max)

  var quantize = d3.scale.quantize()
      .domain([min, max])
      .range(d3.range(4).map(function(i) { return "q" + i + "-4"; }));

  var projection = d3.geo.albersUsa()
      .scale(width + margin.left + margin.right)
      .translate([(width+margin.left+margin.right) / 2, (height+margin.top+margin.bottom)/ 4]);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#"+containerID)
    .attr("height", height)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  var legend = svg.append("g")
  			   .attr("width",width+margin.left+margin.right)
  			   .attr("height",50)

  var keyWidth = 30
  var keyHeight = 15
  legend.append("rect").attr("width",keyWidth).attr("height",keyHeight).attr("class","q0-4")
  legend.append("text")
  	.attr("x",0)
    .attr("class","legend-labels")
  	.attr("y",0)
  	.text(min)
  legend.append("rect").attr("width",keyWidth).attr("height",keyHeight).attr("class","q1-4").attr("x",keyWidth)
  legend.append("rect").attr("width",keyWidth).attr("height",keyHeight).attr("class","q2-4").attr("x",keyWidth*2)
  legend.append("rect").attr("width",keyWidth).attr("height",keyHeight).attr("class","q3-4").attr("x",keyWidth*3)
  legend.append("rect").attr("width",keyWidth).attr("height",keyHeight).attr("class","q4-4").attr("x",keyWidth*4)

  legend.attr("transform","translate("+ (width+margin.left+margin.right - keyWidth*5)/2 +",20)")

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

function getNiceBreaks(min,max,bins){
	function isNice(val){
		if (val%bins == 0){
			return true;
		}
		else{
			return false;
		}
	}
	breaks = {"min":null,"max":null}
	if (isNice(Math.ceil(max)-Math.floor(min))){
		breaks.min = Math.floor(min)
		breaks.max = Math.ceil(max)
	}
	else if (isNice(Math.ceil(max*2)/2 - Math.floor(min*2)/2)){
		breaks.min = Math.floor(min*2)/2
		breaks.max = Math.ceil(max*2)/2
	}
	else if (isNice(Math.ceil(max*4)/4 - Math.floor(min*4)/4)){
		breaks.min = Math.floor(min*4)/4
		breaks.max = Math.ceil(max*4)/4
	}
	else if (isNice(Math.ceil(max)+1 - Math.floor(min))){
		breaks.min = Math.floor(min)
		breaks.max = Math.ceil(max)+1
	}
	else{
		breaks.min = Math.floor(min)
		breaks.max = Math.floor(max)
	}

	return breaks
}

drawMap("testing","GOVT",null,null)