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
  var aspect_height = 2;
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

  var quantize = d3.scale.quantize()
      .domain([min, max])
      .range(d3.range(4).map(function(i) { return "q" + i + "-4"; }));


  var svg = d3.select("#"+containerID)
    .attr("height", height)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)


// Bar chart axes
var x = d3.scale.ordinal()
    .rangeBands([0, width-margin.left-margin.right-50])
    .domain(slice.map(function(d) { return d.geography.code; }))

var y = d3.scale.linear()
    .range([height, 0])
    .domain([0,max])

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)


  svg.selectAll(".bar")
      .data(slice)
    .enter().append("rect")
      .attr("class", function(d){ return "states " + dataID + " " + quantize(d.value)})
      .attr("id", function(d) { return "bar-outline_" + dataID + "_" + d.geography.fips ;})
      .attr("x", function(d) { return x(d.geography.code); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return height/2 + y(d.value); })
      .attr("height", function(d) { return height/2 - y(d.value); });



  var projection = d3.geo.albersUsa()
      .scale(width + margin.left + margin.right)
      .translate([(width+margin.left+margin.right) / 2, (height+margin.top+margin.bottom)/ 4]);

  var path = d3.geo.path()
      .projection(projection);



  var legend = svg.append("g")
  			   .attr("width",width+margin.left+margin.right)
  			   .attr("height",50)

  var keyWidth = 30
  var keyHeight = 15

  for (i=0; i<=5; i++){
    if(i !== 5){
      legend.append("rect")
        .attr("width",keyWidth)
        .attr("height",keyHeight)
        .attr("class",dataID + " q" + i + "-4")
        .attr("x",keyWidth*i)
        .on("mouseover",function(){ mouseEvent(dataID, {type: "Legend", "class": "q" + (this.getAttribute("x")/keyWidth) + "-4"}, "hover") })
        .on("mouseout", function(){mouseEvent(dataID,this,"exit")})
    }

    legend.append("text")
      .attr("x",-5+keyWidth*i)
      .attr("class","legend-labels " + dataID)
      .attr("y",-5)
      .text(min+step*i + units)
  }


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
        		return "states " + dataID + " " + quantize(state[0].value)
        	}
        	else{
        		return "states NA " + dataID
        	}
    	})
        .attr("id", function(d) { return "state-outline_" + dataID + "_" + d.id ;})
        .attr("d", path)
        .on("mouseover", function(d){mouseEvent(dataID,d,"hover")})
        .on("mouseout", function(d){mouseEvent(dataID,d,"exit")})
  }

  function mouseEvent(dataID,element,event){
// state case
    if(element.type == "Feature"){
      var state = d3.select("#state-outline_" + dataID + "_" + element.id)
      var bar = d3.select("#bar-outline_" + dataID + "_" + element.id)
      console.log(bar)
      var stateNode = state[0][0]
      var barNode = bar[0][0]

      stateNode.parentNode.appendChild(stateNode)
      barNode.parentNode.appendChild(barNode)

      state.classed("hover",true)
      bar.classed("hover",true)

    }
// legend case
    else if(element.type == "Legend"){
      var states = d3.selectAll("." + dataID + "." + element.class)
      states.classed("hover", true)
      states[0].forEach(function(s){ s.parentNode.appendChild(s)})
    }

    if(event == "exit"){
      d3.selectAll(".hover").classed("hover",false)
    }
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

drawMap("testing","RUC",null,"%")
// drawMap("other","RUC",null,"%")