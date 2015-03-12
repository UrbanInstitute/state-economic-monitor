

function drawMapFigure(containerID, dataID, title, units){
 // data is an array of objects, each of form
// {
//   "geography":
//      {"code": "AK", "fips": "2", "name": "Alaska"},
//    "value": 6.3
// }

    var slice = figureData[dataID]["data"]
    var minIn = Math.min.apply(Math,slice.map(function(o){return o.value;}))
    var maxIn = Math.max.apply(Math,slice.map(function(o){return o.value;}))
    
    var breaks = getNiceBreaks(minIn,maxIn,5),
        min = breaks.min,
        max = breaks.max;
    var step = (max-min)/5.0

    // console.log(minIn, maxIn, min, max, step)

        var quantize = d3.scale.quantize()
        .domain([min, max])
        .range(d3.range(5).map(function(i) { return "q" + i + "-4"; }));



    // var $graphic = $("#"+containerID);
    var parent = d3.select("#"+containerID)
    $("#"+containerID).empty()

    title = parent.append("div")
      .attr("id",containerID + "_title")
    barChart = parent.append("div")
      .attr("id",containerID + "_bar-chart")
    parent.append("div")
      .attr("id",containerID + "_tooltip")
    parent.append("div")
      .attr("id",containerID + "_map")
      .attr("class", "map-container")
    
    drawMap()
    drawBars()
    drawTooltip()

  function drawMap(){

    var $graphic = $("#"+containerID + "_map");
    
    // $graphic.empty()

    var aspect_width = 10;
    var aspect_height = 7;
    var margin = { top: 10, right: 10, bottom: 10, left: 20 };
    var width = $graphic.width() - margin.left - margin.right;

    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;




    var svg = d3.select("#"+containerID + "_map")
      .attr("height", height)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate("   + margin.left + "," + margin.top + ")")
      // .append("rect")
      //   .attr("width", width + margin.left + margin.right)
      //   .attr("height", height + margin.top + margin.bottom)
        .on("click",function(){mouseEvent(null,{"type":"Background"},"click")});


  

      var projection = d3.geo.albersUsa()
          .scale(width + margin.left + margin.right)
          .translate([(width+margin.left+margin.right) / 2, (height+margin.top+margin.bottom)/ 2]);

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
            .on("click",function(){ mouseEvent(dataID, {type: "Legend", "class": "q" + (this.getAttribute("x")/keyWidth) + "-4"}, "click") })

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
            var state = slice.filter(function(obj){return obj.geography.fips == d.id})  ;
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
          .on("click", function(d){mouseEvent(dataID,d,"click")})

    }
  }


var barSvg, barXAxis, barBase;

  function drawBars(){
    var $graphic = $("#"+containerID + "_bar-chart");

    var aspect_width = 41;
    var aspect_height = 6;
    var margin = { top: 20, right: 0, bottom: 20, left: 20 };
    var width = $graphic.width() - margin.left - margin.right;
    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

    // Bar chart axes
    var x = d3.scale.ordinal()
        .rangeBands([margin.left, width],0.285)
        .domain(slice.sort(function(a,b){ return b.value-a.value}).map(function(d) { return d.geography.code; }));


    var svg = d3.select("#"+containerID + "_bar-chart")
      .attr("height", height)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate("   + margin.left + "," + margin.top + ")")
        .on("click",function(){mouseEvent(null,{"type":"Background"},"click")});

    var lowerBound;
    if(min < 0){
      lowerBound = min
    }
    else{
      lowerBound = 0
    }

    var y = d3.scale.linear()
        .range([height,0])
        .domain([lowerBound,min+step*7])


    svg
    .append("svg:line")
            .attr("x1", 0+margin.left)
            .attr("y1", y(min+step))
            .attr("x2", width - margin.right)
            .attr("y2", y(min+step))
        .attr("class","grid-line");
    svg.append("svg:line")
            .attr("x1", 0+margin.left)
            .attr("y1", y(min+6*step))
            .attr("x2", width - margin.right)
            .attr("y2", y(min+6*step))
        .attr("class","grid-line");

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickValues([min+step, min+step*6])
        .tickFormat(function(d){
          // Check tick val and format accordingly. N -> int, N.5 -> 1 decimal place, N.25 -> 2 decimal places
          var formatter;
          if(parseInt(d) === d){
            formatter = d3.format(".0f")
            return formatter(d)
          }
          else if(parseInt(d*2) === d*2){
            formatter = d3.format(".1f")
            return formatter(d)
          }
          else if(parseInt(d*4) === d*4){
            formatter = d3.format(".2f")
            return formatter(d)
          }
          else{
            formatter = d3.format(".0f")
            return formatter(d)
          }
        })
        .tickSize(0)
    // console.log(parseInt(4) === 4)

      svg.append("g")
          .attr("class", "y axis")
          .attr("transform","translate(" + margin.left + ",0)")
          .call(yAxis)

      svg.selectAll(".bar")
          .data(slice)
        .enter().append("rect")
          .attr("class", function(d){ return "states " + dataID + " " + quantize(d.value)})
          .attr("id", function(d) { return "bar-outline_" + dataID + "_" + d.geography.fips ;})
          .attr("x", function(d) { return x(d.geography.code); })
          .attr("width", x.rangeBand())
          //to handle negative bars, Bars either start at 0 or at neg value
          .attr("y", function(d) { return y(Math.max(0, d.value)) })
          .attr("height", function(d) { return Math.abs(y(0) - y(d.value));})
          .on("mouseover",function(d){ mouseEvent(dataID, {"value": d.value, "type": "Bar", "id": this.id.replace("bar-outline_","").replace(dataID,"").replace("_","")}, "hover") })
          .on("mouseout", function(){ mouseEvent(dataID,this,"exit")})
          .on("click",function(d){ mouseEvent(dataID, {"value": d.value, "type": "Bar", "id": this.id.replace("bar-outline_","").replace(dataID,"").replace("_","")}, "click") })
          ;

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y(0)+ ")")
          .call(xAxis);
      barSvg = svg
      barXAxis = xAxis
      barBase = y(0)

      reapppendAxis()

//Grab all the x axis ticks, if the state they label has a negative value bar, pop them up above the x axis

  }

  function reapppendAxis(){
    d3.selectAll("#"+containerID + "_bar-chart .x.axis .tick text").remove()
    barSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + barBase+ ")")
      .call(barXAxis);

    var xTicks = $("#"+containerID + "_bar-chart .x.axis .tick text")
    xTicks.each(function(index,tick){
      var value = slice.filter(function(obj){return obj.geography.code == tick.innerHTML})[0].value
      if(value <= 0){
        $(tick).attr("dy","-.71em")  
      }
    });

  }

  function drawTooltip(){
    var data = figureData[dataID]
    var yearUpdated = data.yearUpdated
    //Get quarter from month, then subtract 1 to make it zero indexed
    var quarterUpdated = Math.ceil(data.monthUpdated/3) - 1
    var quarterNames = ["First","Second","Third","Fourth"]

    var graphic = d3.select("#"+containerID + "_tooltip");
    var tooltip = graphic.append('div')
      .attr('class',"tooltip-container")

    var region = tooltip.append('div')
      .attr('class',"region-text")
    region.append('div')
        .attr('class','tooltip-title')
        .text('REGION/STATE')
    region.append('div')
        .attr('class','tooltip-data')

    var value = tooltip.append('div')
      .attr('class',"value-text")
    value.append('div')
        .attr('class','tooltip-title')
        .text('VALUE')
    value.append('div')
        .attr('class','tooltip-data')

    var quarter = tooltip.append('div')
      .attr('class',"quarter-text")
    quarter.append('div')
        .attr('class','tooltip-title')
        .text('QUARTER')
    quarter.append('div')
        .attr('class','tooltip-data')
        .text(quarterNames[quarterUpdated])  

    var year = tooltip.append('div')
      .attr('class',"year-text")
    year.append('div')
        .attr('class','tooltip-title')
        .text('YEAR')
    year.append('div')
        .attr('class','tooltip-data')
        .text(yearUpdated)

    // tooltip.attr("style","width:" + resizeTooltip() + "px");
    resizeTooltip();

  }

  function resizeTooltip(){
  //Make width of tooltip text shrink-wrapped to width of elements. 3 margins, 3 px extra for rounding errors,
  //plus the widths of the elements
    var totalWidth = 30*3 + 1
    $(".tooltip-data")
    .each(function(index,value) {
      totalWidth += $(value).width();
    });
    d3.select("#"+containerID + "_tooltip .tooltip-container").attr("style","width:" + totalWidth + "px")
  }

  function mouseEvent(dataID,element,event){
    // stopPropagation() means that clicks on bars and map do not trigger click on background
    d3.event.stopPropagation();
// state case
    
    if(element.type == "Feature" || element.type == "Bar"){

      var state = d3.select("#state-outline_" + dataID + "_" + element.id)
      var bar = d3.select("#bar-outline_" + dataID + "_" + element.id)
      var stateNode = state[0][0]
      var barNode = bar[0][0] 

      // console.log(stateNode.classed("click"))

      stateNode.parentNode.appendChild(stateNode)
      barNode.parentNode.appendChild(barNode)

      var obj = slice.filter(function(obj){return obj.geography.fips == element.id})[0]
      var name = obj.geography.name
      var formatter = d3.format(".1f")
      var value = formatter(obj.value)
      var nameDiv = d3.select("#"+containerID + "_tooltip .region-text .tooltip-data")
      var valueDiv = d3.select("#"+containerID + "_tooltip .value-text .tooltip-data")

      nameDiv.text(name)
      valueDiv.text(value)
      resizeTooltip();


      state.classed(event,true)
      bar.classed(event,true)
      reapppendAxis()



      // var margin = { top: 20, right: 10, bottom: 20, left: 20 };
      // var aspect_width = 41;
      // var aspect_height = 5;
      // var width = $("#"+containerID + "_bar-chart").width() - margin.left - margin.right;
      // var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

      // d3.select("#"+containerID + "_bar-chart svg")
      // .append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(xAxis);

    }
// legend case
    else if(element.type == "Legend"){
      d3.selectAll("path." + dataID + ".states")
      .classed("demphasized",true)

      var states = d3.selectAll("." + dataID + "." + element.class)
      states.classed({"demphasized": false})
      states[0].forEach(function(s){ s.parentNode.appendChild(s)})
    }

// bar case
    // else if(element.type == )

    if(event == "exit"){
      d3.selectAll(".hover").classed("hover",false)
      d3.selectAll(".demphasized").classed("demphasized",false)
      reapppendAxis()

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


function drawGraphic(){
  drawMapFigure("testing","AWWChg",null,"%")
  // drawMap("other","RUC",null,"%")
}

drawGraphic();
window.onresize = drawGraphic;