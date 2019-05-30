function isQuarterly(indicator){

}
function getSection(indicator){
	if(indicator == "unemployment") return "employment"

}
function getActiveIndicator(){

}
function getActiveChartType(){

}
function getActiveStates(){

}
function getStartDate(){

}
function getEndDate(){

}


function buildCards(cardData){

}
function buildBarChart(data, indicator, states, endDate, active){
//if active, show barcontainer by default and hide linecontainer
	var data = getBarData(data, indicator, endDate)
	console.log("bar", data)
}
function buildMap(data, indicator, states, endDate){

}
function buildLineChart(data, indicator, states, startDate, endDate, active){
//if active, show linecontainer by default and hide barcontainer
	var data = getLineData(data, indicator, states, startDate, endDate)
	console.log("line", data)
}

function getChartData(){

}
function getBarData(chartData, indicator, date){
	var indicatorData = chartData[indicator]
	var dataByDate = d3.nest()
		.key(function(d){ return d.date })
		.entries(indicatorData)


	return dataByDate.filter(function(d){ return d.key == date })[0].values

}
function getLineData(chartData, indicator, states, startDate, endDate){
 	var indicatorData = chartData[indicator]
 	var dateFilteredData = indicatorData.filter(function(d){
 		//3rd param of isBetween is units of granularity (ms default), 4th param indicates both upper and lower bounds are inclusive 
		return moment(d.date, defaultDateFormat, true).isBetween(startDate, endDate, null, '[]')
		// var x = moment(d.date, defaultDateFormat, true)
		// console.log(startDate, endDate)
		return true
 	})
 	var dataByState = d3.nest()
 		.key(function(d){ return d.state })
 		.entries(dateFilteredData)

 	return dataByState.filter(function(d){ return states.indexOf(d.key) != -1 })
}

function updateChart(indicator, states, startDate, endDate){
	var chartType = (dateDiff(startDate, endDate) == 0) ? "bar" : "line";
	
	var oldStates = getActiveStates()
	var addStates = states.filter(function(s){ return oldStates.indexOf(s) == -1 })
	if(addStates.length != 0) selectStates(addStates)

	var removeStates = oldStates.filter(function(s){ return states.indexOf(s) == -1 })
	if(removeStates.length != 0) deselectStates(addStates)

	if(chartType != getActiveChartType()){
		showChart(chartType)
	}

	if(chartType == "bar"){
		if(indicator != getActiveIndicator() && dateDiff(endDate,getEndDate()) != 0 ){
			updateBarChart(indicator, endDate)
		}
	}else{
		if(indicator != getActiveIndicator() && dateDiff(endDate,getEndDate()) != 0 && dateDiff(startDate,getStartDate()) != 0){
			updateLineChart(indicator, startDate, endDate)
		}
	}
}
function updateBarChart(indicator, date){
	updateMap(indicator, date)
}
function updateMap(indicator, date){

}
function updateLineChart(indicator, startDate, endDate){

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


function init(allData){
	buildCards(allData.cards)
	// buildBarChart()

	var qStates = getQueryString("states"),
		qIndicator = getQueryString("indicator"),
		qStartDate = getQueryString("start"),
		qEndDate = getQueryString("end");

	//if qEndDate is later than default (from allData), set it to default
	//if qStartDate is earlier than earliest (from consts), set it to default

	var states = (qStates == "") ? ["US"] : qStates.split("-"),
		indicator = (qIndicator == "") ? defaultIndicator : qIndicator;

	if(states.indexOf("US") == -1) states.push("US")

	var defaultEndYear = allData["dates"][getSection(indicator)]["year"],
		defaultEndMonth = allData["dates"][getSection(indicator)]["month"]

	var defaultEndDate = getDateString(defaultEndMonth, defaultEndYear)

	var endDate = (qEndDate == "") ? defaultEndDate : getDateString(qEndDate.split("-")[0], qEndDate.split("-")[1])
	var endMoment = moment(endDate, defaultDateFormat, true)
	var startDate = (qStartDate == "") ? endMoment.subtract(defaultLinechartMonthRange, "months").format(defaultDateFormat) : getDateString(qStartDate.split("-")[0], qStartDate.split("-")[1])

	var activeBars = (qStartDate == "")

	buildBarChart(allData.data, indicator, states, endDate, activeBars)
	buildLineChart(allData.data, indicator, states, startDate, endDate, !activeBars)
}


d3.json("data/allData.json").then(function(allData){
	init(allData)
})
