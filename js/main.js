function getChartData(){
return d3.select("#chartData").data()[0]
}
function getTopojsonData(){
return d3.select("#topojsonData").data()[0]
}
function getParams(){
	return d3.select("#paramData").data()[0]
}
// function 
function isQuarterly(indicator){

}
function setParams(params){
	if(typeof(params.init) != "undefined"){
		d3.select("#paramData").data([ params ])
	}else{
		var d = d3.select("#paramData").data()[0]
		const keys = Object.keys(params)
		for (const key of keys) {
			d[key] = params[key]
		}
		d3.select("#paramData").data([d])
	}
}

function getSection(indicator){
if(indicator == "unemployment") return "employment"

}
function getFirstYear(indicator){
var section = getSection(indicator)
// var startYear;

console.log(section)
switch(section){
case 'employment':
return 1976;
case 'earnings':
return 2007;
case 'housing':
return 1991;
case 'gdp':
return 2005;
}
}
function getKey(indicator, unit){
var indicators = ["unemployment"]
return indicators.indexOf(indicator) + unit[0]
}
function getActiveIndicator(){

}
function getActiveChartType(){

}
function getActiveStates(){

}
function getActiveUnit(){

}
function getStartDate(){

}
function getEndDate(){

}
function sanitizeDates(startDate, endDate){
	var params = getParams()
	var startMoment = moment(startDate),
		endMoment = moment(endDate),
		firstMoment = moment(params.firstDate),
		lastMoment = moment(params.lastDate);
//make sure that start and end are within total allowable date range
	if(endMoment.isAfter(lastMoment)){
		endMoment = moment(lastMoment)
	}
	if(startMoment.isBefore(firstMoment)){
		startMoment = moment(firstMoment)
	}

	if(startMoment.isBefore(endMoment)){
//if start is before end, great, return them
		return [startDate, endDate]
	}else{
		if(endMoment.isAfter(firstMoment)){
//this is always true unless start, end, and first dates are all equal.
//usually will keep end as is, and set start to 5 years earlier
//if that pushes start before first allowable, then start => first
			startMoment = moment(endMoment)
			if(startMoment.diff(firstMoment, "years", true) >= defaultLinechartMonthRange/12) startMoment.subtract(defaultLinechartMonthRange/12, "years")
			else startMoment = moment(firstMoment)
			
		}else{
//otherwise, start at first date and go 5 years in future. No need to check if this pushes us past last date, since we always have a minimum of 2007-2019 (at time of publication)
			startMoment = moment(firstMoment)
			endMoment.add(defaultLinechartMonthRange/12, "years")
		}
		return [getDateString(startMoment.month() + 1, startMoment.year()), getDateString(endMoment.month() + 1, endMoment.year())]
	}

}


function disableBarMenuMonths(year, lastDate){


      	if(year == moment(lastDate).year()){
      		
  			var lastMonth = moment(lastDate).month() +1;
  			for(var i = lastMonth; i <= 12; i++){
  				$(".barMonth.m_" + i).prop("disabled", true)
  			}
			$(".dateMenu.barChart.month" ).selectmenu("refresh")  			

      	}else{
      		$(".barMonth").prop("disabled", false)
      		$(".dateMenu.barChart.month" ).selectmenu("refresh")  
      	}

}
function buildBarDateMenus(endDate){
// d3.selectAll(".dateMenu").remove()
// var firstYear = getFirstYear(indicator)
var params = getParams()
var firstYear = params.firstDate.split("-")[0]

var endYear = moment(endDate).year(),
	endMonth = moment(endDate).month()

// console.log(endYear)
var barYearMenu = d3.select(".dateMenu.barChart.year")

barYearMenu.selectAll("option").remove()
for(var yr = firstYear; yr <= endYear; yr++){
	barYearMenu.append("option")
		.attr("value", yr)
		.property("selected", function(){ return (yr == endYear)})
		.text(yr)
}


	     $(".dateMenu.barChart.year" ).selectmenu({
      change: function(event, d){
      	var params = getParams()
      	var endMonth = +params.endDate.split("-")[1]
      	var endString = getDateString(endMonth, +d.item.value)
      	var cleanDates = sanitizeDates(params.startDate, endString)

      	disableBarMenuMonths(d.item.value, params.lastDate)




      	updateBarChart(params.indicator, params.unit, cleanDates[1])
      	setParams({"endDate": cleanDates[1], "startDate": cleanDates[0] })

      	// console.log(endDate)
      }
    })
	     $(".dateMenu.barChart.year" ).selectmenu("refresh")


	     $(".dateMenu.barChart.month" ).selectmenu({
      change: function(event, d){
      	var params = getParams()
      	var endYear = +params.endDate.split("-")[0]
      	var endString = getDateString(+d.item.value, endYear)
      	var cleanDates = sanitizeDates(params.startDate, endString)

      	console.log(endString)

      	updateBarChart(params.indicator, params.unit, cleanDates[1])
      	setParams({"endDate": cleanDates[1], "startDate": cleanDates[0] })
      }
    })

	disableBarMenuMonths(endYear, params.lastDate)

}
function buildLineDateMenus(startDate, endDate){
	var monthAbbrs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		params = getParams(),
		lastDate = params.lastDate,
		firstDate = params.firstDate,
		firstYear = +firstDate.split("-")[0],
		lastYear = +lastDate.split("-")[0],
		startYear = +startDate.split("-")[0],
		endYear = +endDate.split("-")[0],
		yearRange = moment(lastDate).diff(firstDate, "years"),
		data = Array(yearRange).fill(monthAbbrs)

		var yearContainer = d3.select(".calendarContainer.startDate")
			.selectAll("calendarYearContainer")
			.data(data)
			.enter().append("div")
			.attr("class", function(d, i){
				return "calendarYearContainer"
			})
			.style("display", function(d, i){
				return ( (i + firstYear) < startYear || (i + firstYear) > startYear + 2) ? "none" : "inline-block"
			})

		yearContainer.append("div")
			.attr("class", function(d, i){
				var active = ""
				return "calYearLabel" + active
			})
			.text(function(d,i){ return i + firstYear })

		yearContainer.selectAll("calMonth")
			.data(function(d){ return d})
			.enter().append("div")
			.attr("class", "calMonth")
			.text(function(d){ return d})

}
function buildStateMenu(stateNamesData, states){
	var leftData = stateNamesData.slice(0, 26)
	var rightData = stateNamesData.slice(26,51)
	var left = d3.select(".stateNameCol.left")
		.selectAll(".stateName")
		.data(leftData)
		.enter().append("div")
		.attr("class", "stateName")

	d3.select(".stateNameCol.right")
		.selectAll(".stateName")
		.data(rightData)
		
		.enter().append("div")
		.attr("class", "stateName")
		// .merge(left)
		// .text("foo")

d3.selectAll(".stateName")
	.text(function(d){ return d.name })
	.classed("active", function(d){ return states.indexOf(d.abbr) != -1 })
	.on("click", function(d){
		var params = getParams()
		console.log(params)
		if(d3.select(this).classed("active")){
			d3.select(this).classed("active", false)
			params.states.splice(params.states.indexOf(d.abbr), 1)
		}else{
			d3.select(this).classed("active", true)
			params.states.push(d.abbr);
		}
		
		setParams({"states": params.states.sort()})
		updateLineChart(params.indicator, params.unit, params.states, params.startDate, params.endDate)

	})


	// var states = left.merge(right)


	// left.text("foo")
		

	// 	.selectAll("")
	// 	.data(stateNamesData)

	// updateLineChart(defaultIndicator, "raw", ["US", "CA", "NJ"], getDateString(1, randStart), getDateString(1, randEnd))

}

function buildCards(cardData){

}
function buildBarChart(chartData, topojsonData, indicator, unit, states, endDate, active){


//if active, show barcontainer by default and hide linecontainer
var allGeographies = getBarData(chartData, indicator, unit, endDate),
data = allGeographies.states,
usData = allGeographies.US



var key = getKey(indicator, unit);



var margin = {top: 20, right: 20, bottom: 70, left: 40},
w = 600,
h = 300,
width = w - margin.left - margin.right,
height = h - margin.top - margin.bottom;

var svg = d3.select("#barChartContainer").append("svg").attr("width", w).attr("height", h)

var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleBand()
.rangeRound([0, width])
.padding(0.1);

var y = d3.scaleLinear()
.rangeRound([height, 0]);

x.domain(data.map(function (d) {
return d.abbr;
}));
y.domain(
[
Math.min(

0,
d3.min(data, function (d) {
return Number(d[key]);
}
)
),
d3.max(data, function (d) {
return Number(d[key]);
}),
]
).nice();

g.append("g")
.attr("class", "bar x axis")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x))
.selectAll("text")
.style("text-anchor", "end")
.attr("dx", "-.8em")
.attr("dy", "-.55em")
.attr("transform", "rotate(-90)" );

g.append("g")
.attr("class", "bar y axis")
.call(d3.axisLeft(y).tickSize(-width).ticks(barTickCount))


var colorScale = getColorScale(y, data, key)


g.selectAll(".usLine")
.data(usData)
.enter().append("line")
.attr("class", "usLine")
.attr("x1", 0)
.attr("x2", width)
.attr("y1", function (d) {
return y(Number(d[key]));
})
.attr("y2", function (d) {
return y(Number(d[key]));
})
// .attr("stroke", "red")

g.selectAll("rect.bar")
.data(data)
.enter().append("rect")
.attr("class", "bar")
.attr("x", function (d, i) {
return x(d.abbr);
})
.attr("y", function (d) {

return y( Math.max(0, +d[key]) );
})
.style("fill", function(d){ return colorScale(d[key])})
.attr("width", x.bandwidth())
.attr("height", function (d) {
return Math.abs(y(+d[key]) - y(0));
});

buildMap(data, topojsonData, key, colorScale)


}
function buildMap(data, topojsonData, key, colorScale){
var width = 621,
height = .6 * width
var svg = d3.select("#mapContainer").append("svg")
.attr("width", width)
.attr("height", height)
.append("g");

var projection = d3.geoAlbersUsa()
.scale(1.2 * width)
.translate([width/2, height/2]);

var path = d3.geoPath()
.projection(projection);





topojsonData.objects.states.geometries.forEach(function(u){
u["properties"]["values"] = data.filter(function(o){ return o.abbr == u.properties.postal })[0]
})

svg
.selectAll("path.stateShape")

.data(topojson.feature(topojsonData, topojsonData.objects.states).features)
.enter().append("path")
.attr("class", "stateShape")
.style("stroke", "white")
.style("fill", function(d){
return colorScale(d["properties"]["values"][key])
})
.attr("d", path);

svg.append("path")
.attr("class", "state-borders")
.style("stroke", "white")
.style("fill", "none")
.attr("d", path(topojson.mesh(topojsonData, topojsonData.objects.states, function(a, b) { return a !== b; })));



}

function getColorScale(y, data, key){

var tickBreaks = y.ticks(barTickCount),
colorBreaks = []

vals = data.map(function(o){ return o[key]}).reverse()

var step = (tickBreaks.length > 10) ? 2 : 1

for(var i = 1; i < tickBreaks.length; i += step){
if(vals[0] > tickBreaks[i]){
continue;
}else{
if(colorBreaks.length < 7){
colorBreaks.push(tickBreaks[i])
}else{
colorBreaks.push(tickBreaks[tickBreaks.length - 1])
break;
}
}
}


var colorRange;
switch (colorBreaks.length){
case 4: colorRange = fourBlues;
case 5: colorRange = fiveBlues;
case 6: colorRange = sixBlues;
case 7: colorRange = sevenBlues;
case 8: colorRange = eightBlues;
}

var colorScale = d3.scaleThreshold()
.range(colorRange)
.domain(colorBreaks)

return colorScale
}
function buildLineChart(chartData, indicator, unit, states, startDate, endDate, active){
//if active, show linecontainer by default and hide barcontainer
var dataObj = getLineData(chartData, indicator, unit, states, startDate, endDate),
data = dataObj.data,
extent = dataObj.extent;

var key = getKey(indicator, unit)

var parseTime = d3.timeParse("%Y-%m-%d");


// data.forEach(function(a) {
// 	a.values.forEach(function(d){
//     d.date = parseTime(d.date);
//     // d.raw = +d.raw;
//     // d.change = +d.change;
//   })
// });


var margin = {top: 10, right: 30, bottom: 30, left: 60},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#lineChartContainer")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
var g = svg.append("g")
.attr("id", "linesContainer")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)

.attr("transform",
"translate(" + margin.left + "," + margin.top + ")");

//Read the data


var defs = svg.append("defs"),
lineClippingPath = defs.append("clipPath").attr("id", "lineClippingPath")
dotClippingPath = defs.append("clipPath").attr("id", "dotClippingPath")

lineClippingPath.append("rect")
.attr("x", 0)
.attr("y",0)
.attr("width", width)
.attr("height", height)

dotClippingPath.append("rect")
.attr("x", -10)
.attr("y",-10)
.attr("width", width+20)
.attr("height", height+20)



// Add X axis --> it is a date format

var x = getLineX(startDate, endDate, width)
var y = getLineY(extent, height)


// color palette

g.append("g")
.attr("class", "line axis x")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x).ticks(5));

g.append("g")
.attr("class", "line axis y")
.call(d3.axisLeft(y).tickSize(-width).ticks(lineTickCount));



g.selectAll(".state.line")
.data(data, function(d) { return d.key; })
.enter()
.append("path")
.attr("class",function(d){ return d.key + " state line" })
.attr("clip-path", "url(#lineClippingPath)")
.attr("d", function(d){
return d3.line()
.x(function(d) { return x(parseTime(d.date)); })
.y(function(d) { return y(+d[key]); })
(d.values)
})


g.append("circle")
.attr("class", "linechartDot")
.attr("clip-path", "url(#dotClippingPath)")
.attr("r", 5)
.attr("cx",0)
.attr("cy",0)

var voronoi = d3.voronoi()
.x(function(d) { return x(parseTime(d.date)); })
.y(function(d) { return y(d[key]); })
.extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

var voronoiGroup = g.append("g")
.attr("class", "voronoi");

voronoiGroup.selectAll("path")
.data(voronoi.polygons(d3.merge(data.map(function(d) { return d.values; }))))
.enter().append("path")
.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
.on("mouseover", function(d){ mouseoverLineChart(d, key, startDate, endDate, extent, width, height) })
.on("mouseout", mouseoutLineChart);







// g.append("rect")
// 	.attr("id", "lineAxisBlocker")
// 	.style("fill", "#fff")
// 	.attr("x", -margin.left)
// 	.attr("width", margin.left)
// 	.attr("y", 0)
// 	.attr("height", height)





}

function getLineX(startDate, endDate, width){
// var parseTime = d3.timeParse("%Y-%m-%d");
var x = d3.scaleTime()
// .domain(d3.extent(data[0].values, function(d) { return d.date; }))
.domain([parseTime()(startDate), parseTime()(endDate)])
.range([ 0, width ]);

return x
}
function getLineY(extent, height){
var y = d3.scaleLinear()
.domain(extent)
.range([ height, 0 ]);

return y
}


function mouseoverLineChart(d, key, startDate, endDate, extent, width, height) {
var parseTime = d3.timeParse("%Y-%m-%d");
if (parseTime(startDate).getTime() > parseTime(d.data.date).getTime() || parseTime(endDate).getTime() < parseTime(d.data.date)){
return false;
}


var x = getLineX(startDate, endDate, width)
var y = getLineY(extent, height)

d3.select(".linechartDot")
.style("opacity",1)
.attr("cx", x(parseTime(d.data.date)))
.attr("cy",y(d["data"][key]))


}

function mouseoutLineChart(d) {
d3.select(".linechartDot").style("opacity",0)
// d3.select(d.data.city.line).classed("city--hover", false);
// focus.attr("transform", "translate(-100,-100)");
}


function getBarData(chartData, indicator, unit, date){
var indicatorData = chartData,
key = getKey(indicator, unit)
var dataByDate = d3.nest()
.key(function(d){ return d.date })
.entries(indicatorData)

var allGeographies = dataByDate.filter(function(d){ return d.key == date })[0].values,
usData = allGeographies.filter(function(d){ return d.abbr == "US" }),
stateData = allGeographies.filter(function(d){ return d.abbr != "US" }).sort(function(a, b){ return b[key] - a[key] })



return {"US": usData, "states": stateData}

}
function getLineData(chartData, indicator, unit, states, startDate, endDate){
var indicatorData = chartData,
key = getKey(indicator, unit)

// var dateFilteredData = indicatorData.filter(function(d){
// 	//3rd param of isBetween is units of granularity (ms default), 4th param indicates both upper and lower bounds are inclusive 
// return moment(d.date, defaultDateFormat, true).isBetween(startDate, endDate, null, '[]')
// })
var dateFilteredData = indicatorData
var extent = d3.extent(dateFilteredData, function(d){ if (states.indexOf(d.abbr) != -1) return d[key]}),
zeroedExtent = [ Math.min(extent[0], 0), extent[1] ]
var dataByState = d3.nest()
.key(function(d){ return d.abbr })
.entries(dateFilteredData)


return {"data": dataByState.filter(function(d){ return states.indexOf(d.key) != -1 })
, "extent": zeroedExtent }
}


function updateBarChart(indicator, unit, date){
	var chartData = getChartData()
	var allGeographies = getBarData(chartData, indicator, unit, date),

	data = allGeographies.states,
	usData = allGeographies.US

	var key = getKey(indicator, unit)

//TO BE UPDATED (abstract out to new func)
	var margin = {top: 20, right: 20, bottom: 70, left: 40},
		w = 600,
		h = 300,
		width = w - margin.left - margin.right,
		height = h - margin.top - margin.bottom;
//end update

//TO BE UPDATED (abstract out to new func)
	var x = d3.scaleBand()
		.rangeRound([0, width])
		.padding(0.1);

	var y = d3.scaleLinear()
		.rangeRound([height, 0]);

	x.domain(data.map(
		function (d) {
			return d.abbr;
		})
	);

	y.domain(
		[
			Math.min(
				0,
				d3.min(data, function (d) {
					return d[key];
				})
			),
			d3.max(data, function (d) {
				return d[key];
			}),
		]
	).nice();
//end update

	var colorScale = getColorScale(y, data, key)

	d3.selectAll(".usLine")
		.data(usData)
		.transition()
		.duration(800)
			.attr("y1", function (d) {
				return y(d[key]);
			})
			.attr("y2", function (d) {
				return y(d[key]);
			})

	d3.selectAll("rect.bar")
		.transition()
		.duration(200)
		.delay(function(d, i){ return i*10})
			.attr("x", function (d) {
				return x(d.abbr);
			})
			.on("end", function(d, i){
				d3.select(this)
					.datum(data.filter(function(o){ return o.abbr == d.abbr })[0])
					.transition()
					.duration(300)
						.attr("y", function (d) {
							return y( Math.max(0, +d[key]) );
						})
						.attr("height", function (d) {
							return Math.abs(y(d[key]) - y(0));
						})
						.style("fill", function(d){ return colorScale(d[key])});
			})

	d3.select(".bar.x.axis")
		.transition()
		.duration(200)
			.call(d3.axisBottom(x))
			.selectAll(".tick")
			.delay(function(d, i){ return  i * 10 });

	d3.select(".bar.y.axis")
		.transition()
		.duration(500)
			.call(d3.axisLeft(y).tickSize(-width).ticks(barTickCount))

	updateMap(data, key, colorScale)

}
function updateMap(data, key, colorScale){
	var us = getTopojsonData()

	us.objects.states.geometries.forEach(function(u){
		u["properties"]["values"] = data.filter(function(o){ return o.abbr == u.properties.postal })[0]
	})

	d3.selectAll("path.stateShape")
		.data(topojson.feature(us, us.objects.states).features)
		.transition()
			.duration(800)
			.style("fill", function(d){
				return colorScale(d["properties"]["values"][key])
			})

}
function updateLineChart(indicator, unit, states, startDate, endDate){
//ADD FUNCTIONALITY
	//if active, show linecontainer by default and hide barcontainer

	mouseoutLineChart();

	var chartData = getChartData();

	var dataObj = getLineData(chartData, indicator, unit, states, startDate, endDate),
		data = dataObj.data,
		extent = dataObj.extent;

	var key = getKey(indicator, unit);

//TO BE UPDATED
//abstract out to a new function
	var margin = {top: 10, right: 30, bottom: 30, left: 60},
	width = 460 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;
//END UPDATE

	var x = getLineX(startDate, endDate, width)
	var y = getLineY(extent, height)

	var oldStates = d3.selectAll(".state.line").data().map(function(o){ return o.key })

	var lines = d3.select("#linesContainer")
		.selectAll(".state.line")
		.data(data, function(d) { return d.key; })

	lines.exit()
		.transition()
		.style("opacity",0)
		.remove()


	lines.enter()
		.insert("path", ".state.line")
		.merge(lines)
			.attr("class",function(d){ return d.key + " state line" })
			.attr("clip-path", "url(#lineClippingPath)")
			.attr("d", function(d, i){
				var isNew = (oldStates.indexOf(d.key) == -1)
				if(isNew){
					return d3.line()
						.x(0)
						.y(function(d) { return y(+d[key]); })
						(d.values)
				}else{
					return d3.select(this).attr("d")
				}
			})
			.transition()
				.duration(800)
				.attr("d", function(d){
					return d3.line()
				.x(function(d) {
					return x(parseTime()(d.date));
				})
				.y(function(d) {
					return y(+d[key]); })
					(d.values)
				})

	d3.select(".line.axis.x")
		.transition()
			.call(d3.axisBottom(x).ticks(5));

	d3.select(".line.axis.y")
		.transition()
			.call(d3.axisLeft(y).tickSize(-width).ticks(lineTickCount));


	var voronoi = d3.voronoi()
		.x(function(d) { return x(parseTime()(d.date)); })
		.y(function(d) { return y(d[key]); })
		.extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

	var voronoiGroup = d3.select(".voronoi");

	var vg = voronoiGroup.selectAll("path")
		.data(voronoi.polygons(d3.merge(data.map(function(d) { return d.values; }))))

	vg.exit().remove()

	vg.enter().append("path")
		.merge(vg)
			.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
			.on("mouseover", function(d){ mouseoverLineChart(d, key, startDate, endDate, extent, width, height) })
			.on("mouseout", mouseoutLineChart);
}
function updateIndicator(indicator){
	//setparams update:
		//indicator
		//unit (if unit not avail)
		//states (add or remove US as needed)
		//firstDate
		//lastDate
}

function showChart(chartType){
	//have 2 divs for bar/line that slide in/out cleanly 
}
function selectStates(states){
	selectBarStates(states)
	selectLineStates(states)
}
function deselectStates(states){
	deselectBarStates(states)
	deselectLineStates(states)
}
function selectBarStates(states){

}
function selectLineStates(states) {

}
function deselectBarStates(states){

}
function deselectLineStates(states) {

}


function init(allData, topojsonData, stateNamesData){
	buildCards(allData.cards)

	console.log(allData)

	var qStates = getQueryString("states"),
		qIndicator = getQueryString("indicator"),
		qStartDate = getQueryString("start"),
		qEndDate = getQueryString("end"),
		qBarDate = getQueryString("date"),
		qUnit = getQueryString("unit");


	var states = (qStates == "") ? ["US"] : qStates.split("-"),
		indicator = (qIndicator == "") ? defaultIndicator : qIndicator;

//ADD FUNCTIONALITY
	//this isn't true for every indicator.
	if(states.indexOf("US") == -1) states.push("US")

	var defaultEndYear = allData["dates"][getSection(indicator)]["year"],
		defaultEndMonth = allData["dates"][getSection(indicator)]["month"]

	var defaultEndDate = getDateString(defaultEndMonth, defaultEndYear)

	var endDate = (qEndDate == "") ? defaultEndDate : getDateString(qEndDate.split("-")[0], qEndDate.split("-")[1])
	var endMoment = moment(endDate, defaultDateFormat, true)
	var startDate = (qStartDate == "") ? endMoment.subtract(defaultLinechartMonthRange, "months").format(defaultDateFormat) : getDateString(qStartDate.split("-")[0], qStartDate.split("-")[1])

	var activeBars = (qStartDate == "")
	var unit = (qUnit == "") ? "raw" : "change"

	var firstYear = getFirstYear(indicator),
		firstDate = getDateString(1, firstYear),
		lastDate = getDateString(defaultEndMonth, defaultEndYear)

//ADD FUNCTIONALITY
	//if change is the default, then logic to say if Indicator is something that doesn't show change (unemployment and housing), switch to raw


//ADD FUNCTIONALITY
	//sanitize inputs, including:
		//remove invalid states
		//if qEndDate is later than default (from allData), set it to default
		//if qStartDate is earlier than earliest (from consts), set it to default
		//remove invalid chart types, units, and indicators


		d3.select("#chartData").data([allData.data])
		d3.select("#topojsonData").data([topojsonData])

		buildBarChart(allData.data, topojsonData, indicator, unit, states, endDate, activeBars)
		buildLineChart(allData.data, indicator, unit, states, startDate, endDate, !activeBars)
		setParams({"indicator": indicator, "unit": unit, "states": states, "startDate": startDate, "endDate": endDate, "init": true, "firstDate": firstDate, "lastDate": lastDate})
		buildBarDateMenus(endDate)
		buildLineDateMenus(startDate, endDate)
		buildStateMenu(stateNamesData, states)
}



//TO BE REMOVE
// d3.select("body").on("click", function(){
// var randStart = Math.floor(Math.random() * 20) + 1976
// var randEnd = Math.floor(Math.random() * 15) + 2000
// updateBarChart(defaultIndicator, "raw", getDateString(1, randEnd))
// updateLineChart(defaultIndicator, "raw", ["US", "CA", "NJ"], getDateString(1, randStart), getDateString(1, randEnd))
// })
//END REMOVED


d3.json("data/dump.json").then(function(allData){
	d3.json("data/states.json").then(function(topojsonData){
		d3.csv("data/state_fips.csv").then(function(stateNamesData){
			init(allData, topojsonData, stateNamesData)
		})
	})
})
