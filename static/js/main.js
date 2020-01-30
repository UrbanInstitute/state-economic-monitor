function getChartData(){
return d3.select("#chartData").data()[0]
}
function getTopojsonData(){
return d3.select("#topojsonData").data()[0]
}
function getParams(){
	return d3.select("#paramData").data()[0]
}
function getTerminalDates(key){
	return d3.select("#terminalDatesData").data()[0][key]
}
function getStateName(abbr){
	return d3.select("#stateNamesData").data()[0].filter(function(o){ return o.abbr == abbr })[0].name
}

function isQuarterly(indicator){
	return (indicator == "house_price_index" || indicator == "state_gdp")
}
function isUSHidden(){
	return d3.select("#hideUS").classed("hide")
}
function isTransitioning(){
	return d3.select("#isTransitioning").classed("active")
}
function startTransition(){
	d3.select("#isTransitioning").classed("active", true)	
}
function endTransition(){
	d3.select("#isTransitioning").classed("active", false)		
}
function setParams(params){
	if(typeof(params.init) != "undefined"){
		d3.select("#paramData").data([ params ])
	}else{
		var d = d3.select("#paramData").data()[0]
		var keys = Object.keys(params)
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i]
			if (key != "text") d[key] = params[key]
		}
		d3.select("#paramData").data([d])
	}
}
function getSection(indicator){
	switch(indicator){
		case 'house_price_index': return "housing"
		case 'state_gdp': return "gdp"
		case 'weekly_earnings': return "earnings"
		default: return "employment"
	}
}
function getKey(indicator, unit){
	return orderedIndicators.indexOf(indicator) + unit[0]
}
function makeCSV(data, indicator, unit, filename) {
  var key = getKey(indicator, unit)
  if(isUSHidden()){
  	data = data.filter(function(o){ return o.abbr != "US" })
  }
  data.sort(function(a,b){
  	if(a.date == b.date){
  		return 0
  	}
  	else if(moment(a.date).isBefore(moment(b.date))){
  		return -1
  	}else{
  		return 1
  	}
  })
  // if(indicator == "state_and_local_public_education_employment"){
  // 	data = data.filter(function(o){ return o.abbr != "US" })	
  // }
  var divisor;
  	if(unit == "change"){
  		divisor = 1;
  	}
	else if(indicator == "federal_public_employment" || indicator == "private_employment" || indicator == "public_employment" || indicator == "state_and_local_public_employment" || indicator == "total_employment" || indicator == "state_and_local_public_education_employment"){
		divisor = 1000
	}
	else if(indicator == "state_gdp"){
		divisor = 1000000
	}else{
		divisor = 1;
	}

  ////////// Make the results a CSV ////////////

  // Building the CSV from the Data two-dimensional array
  // Each column is separated by ";" and new line "\n" for next row
  var csvContent = '';
  var dates = []
  var tempData = {}

  data.forEach(function(infoObject, index) {
  	var newDate
  	if(indicator == "house_price_index" || indicator == "state_gdp"){
  		var tempDate = infoObject["date"].split("-"),
  			tempYear = tempDate[0],
  			tempQ = ((+tempDate[1]-1)/3)+1,
  			newDate = tempYear + " Q" + tempQ

  	}else{
  		newDate = infoObject["date"]
  	}


  	if(tempData.hasOwnProperty(newDate)){
  		tempData[newDate].push("")
  	}
  	// var sep = (index == data.length - 1) ? "" : ",";
  	
  	if(dates.indexOf(newDate) == -1) dates.push(newDate)
  	headerString = "Geography," + dates.join(",")

  	var state = infoObject["abbr"];
  	var value;




	if(indicator == "state_and_local_public_education_employment" && (state == "DC" || state == "HI" || state == "MO")){
		value = "";
	}else{
		value = (+infoObject[key]/divisor);
	}

	if(tempData.hasOwnProperty(state)){
		tempData[state].push(value)
	}else{
		tempData[state] = [state, value]
	}




  })
  console.log(tempData)

  csvContent = headerString + "\n"

  for(s in tempData){
  	csvContent += tempData[s].join(",") + "\n"
  }

  // tempData.forEach(function(o,i){
  // 	csvContent += 0
  // })
  
 //  var header = ["date","geography", indicator + "_" + unit]
 //  var headerString = "\"" + header.join('","') + "\"" + '\n';
 //  csvContent += headerString;

 //  data.forEach(function(infoObject, index) {
 //  	console.log(infoObject)
 //  	if(typeof(infoObject[key]) != "undefined"){
	//   	var newDate
	//   	if(indicator == "house_price_index" || indicator == "state_gdp"){
	//   		var tempDate = infoObject["date"].split("-"),
	//   			tempYear = tempDate[0],
	//   			tempQ = ((+tempDate[1]-1)/3)+1,
	//   			newDate = tempYear + " Q" + tempQ

	//   	}else{
	//   		newDate = infoObject["date"]
	//   	}
	//   	if(indicator == "state_and_local_public_education_employment" && (infoObject["abbr"] == "DC" || infoObject["abbr"] == "HI" || infoObject["abbr"] == "MO")){
	//   		infoArray = [newDate, infoObject["abbr"], "" ];
	//   	}else{
	//     	infoArray = [newDate, infoObject["abbr"], (+infoObject[key]/divisor) ];
	//     }


	//     // put a quote mark on the first item in each line            
	//     // put a trailing quote mark on the last item in each line    
	//     // add quotes around everything else as well
	//     dataString = "\"" + infoArray.join('","') + "\"";

	//     // Add the whole line to the content
	//     csvContent += index < data.length ? dataString + '\n' : dataString;
	// }
 //  });
  
  var args = {
    data: csvContent,
    filename: filename,      
  };

  return args
}
function getFilename(chartType, indicator, unit, filetype){
	var newUnit;
	if(filetype == "csv"){
		if(unit == "change"){
			newUnit = "yoy_percent_change"
		}else{
			if(indicator == "federal_public_employment" || indicator == "private_employment" || indicator == "public_employment" || indicator == "state_and_local_public_employment" || indicator == "total_employment" || indicator == "state_and_local_public_education_employment"){
				newUnit = "raw_in_thousands"
			}
			else if(indicator == "state_gdp"){
				newUnit = "raw_in_millions"
			}else{
				newUnit = unit;
			}
		}
	}else{
		if(unit == "change"){
			newUnit = "yoy_percent_change"
		}else{
			newUnit = "raw"
		}
	}

	if(chartType == "bar"){
		return indicator + "_" + newUnit + "_" + d3.select(".menuActive.timeSingle").text().toLowerCase().replace(" ", "-") + "." + filetype
	}else{
		return indicator + "_" + newUnit + "_" + d3.select(".menuActive.timeRange").text().toLowerCase().replace("–", "-to-").replace(/\s/g, "-") + "." + filetype
	}
}
function setToQuarterly(moment){
	var q = (Math.floor(moment.month()/3)),
		m = q*3
	moment.month(m)
}
function formatValue(indicator, unit, value){
	if(typeof(value) == "undefined" || value == ""){
		return ""
	}
	if(unit == "change"){
		return value.toFixed(2)
	}
	else if(indicator == "unemployment_rate"){
		return value.toFixed(1)
	}
	else if(getSection(indicator) == "employment"){
		if(value < 1000000){
			return (value/1000.0).toFixed(0) + "k"
		}
		else{
			return (value/1000000.0).toFixed(3) + "M"
		}
	}
	else if(indicator == "weekly_earnings"){
		return d3.format(",.0f")(value)
	}
	else if(indicator == "state_gdp"){
		if(value < 1000000000000){
			return (value/1000000000.0).toFixed(0) + "B"
		}
		else{
			return (value/1000000000000.0).toFixed(3) + "T"
		}
	}
	else{
		return false
	}
}
function sanitizeDates(startDate, endDate, opts){
	var params = getParams()
	var startMoment = moment(startDate),
		endMoment = moment(endDate),
		firstMoment = (opts.hasOwnProperty("firstDate")) ? moment(opts.firstDate) : moment(params.firstDate),
		lastMoment = (opts.hasOwnProperty("lastDate")) ? moment(opts.lastDate) : moment(params.lastDate);
	if(! startMoment.isValid()) startMoment = firstMoment
	if(! endMoment.isValid()) endMoment = lastMoment

	if(opts.hasOwnProperty("indicator")){
		if(isQuarterly(opts.indicator)){
			setToQuarterly(startMoment)
			setToQuarterly(endMoment)
			setToQuarterly(firstMoment)
			setToQuarterly(lastMoment)
		}
	}
//make sure that start and end are within total allowable date range
	if(endMoment.isAfter(lastMoment)){
		endMoment = moment(lastMoment)
	}
	if(endMoment.isBefore(firstMoment)){
		
		endMoment = moment(firstMoment)
		endMoment.add(defaultLinechartMonthRange/12, "years")
	}
	if(startMoment.isBefore(firstMoment)){
		startMoment = moment(firstMoment)
	}
	if(startMoment.isAfter(lastMoment)){

		startMoment = moment(lastMoment)
		startMoment.subtract(defaultLinechartMonthRange/12, "years")
	}

	if(startMoment.isBefore(endMoment)){
//if start is before end, great, return them
		return [getDateString(startMoment.month() + 1, startMoment.year()), getDateString(endMoment.month() + 1, endMoment.year())]
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
			// startMoment = moment(firstMoment)
			// endMoment.add(defaultLinechartMonthRange/12, "years")
		}

		return [getDateString(startMoment.month() + 1, startMoment.year()), getDateString(endMoment.month() + 1, endMoment.year())]
	}

}
function closePopup(puClass){
	var popups = (puClass == "all") ? d3.selectAll(".popupMenu") : d3.select(".popupMenu." + puClass);
	d3.selectAll(".pu-dlRow .pu-checkBox").classed("active", false)
	d3.select(".popupScreen")
		.transition()
		.style("opacity",0)
		.on("end", function(){
			d3.select(this)
				.style("display","none")
		})
	popups
		.transition()
		.style("opacity",0)
		.on("end", function(){
			d3.select(this)
				.style("display","none")
				.style("height", "auto")
				.classed("fullScreenPopup", false)
				.style("top", "0px")
				.style("border-left", "none")
				.style("border-right","none")
		})
	
	d3.select("#hiddenBarChartContainer").selectAll("svg").remove()

}
function closeMenus(exception){
	if(widthUnder(768)){
		d3.selectAll(".menuBlock.fullScreen")
			// .style("width","calc(100% - 70px)")
			.classed("fullScreen",false)
		d3.selectAll(".menuBlock").select(".menuTop").classed("open", false)

		d3.selectAll(".menuArrow").attr("src", "static/img/dropdown-bg.png")

		d3.select(".timeMenu.menuBlock")
			.style("border-left", "none")
			.style("border-right", "none")
		d3.select("#menu-mobile-close").style("display","none")
	}
	if(exception != "shareChart"){
		d3.selectAll(".shareTooltip").classed("hidden", true)
		d3.selectAll(".chartButton.shareURL").classed("active", false)
		d3.selectAll(".copiedText").style("opacity",0)
	}
	if(exception != "cardButton"){
		d3.selectAll(".card").classed("selected", false)
	}

	if(!widthUnder(768)){
		d3.selectAll(".menuArrow").attr("src", "static/img/dropdown-bg.png")
		d3.selectAll(".menuSpacer")
			.transition()
		    	.style("border-left-color", "#fff")
				.style("border-bottom-color", "#fff")
				.style("border-right-color", "#fff");

		if(exception != "employment" && exception == "state" && exception != "time"){
			d3.selectAll(".menuBlock")
				.transition()
					.style("height", menuHeights["closed"] + "px")
					.style("border-left-color", "#fff")
					.style("border-right-color", "#fff")
		
			d3.selectAll(".menuBlock").select(".menuTop").classed("open", false)
		}else{
			d3.selectAll(".menuBlock:not(." + exception +")")
				.transition()
					.style("height", menuHeights["closed"] + "px")
					.style("border-left-color", "#fff")
					.style("border-right-color", "#fff")

			d3.selectAll(".menuBlock:not(." + exception +")").select(".menuTop").classed("open", false)
		}
	}
	d3.selectAll(".calendarParent").classed("visible", false)

}
function disableBarMenuMonths(year, lastDate){
	if(year == moment(lastDate).year()){
		var lastMonth = moment(lastDate).month() +1,
			lastQuarter = Math.ceil(+lastMonth/3.0),
			indicator = getParams().indicator,
			quarterly = isQuarterly(indicator)
		if(quarterly){
			for(var i = lastQuarter+1; i <= 4; i++){
				$(".barMonth.q" + i).prop("disabled", true)
			}

			$(".dateMenu.barChart.quarter" ).selectmenu("refresh")  
		}else{
			for(var i = lastMonth+1; i <= 12; i++){
				$(".barMonth.m" + i).prop("disabled", true)
			}

			$(".dateMenu.barChart.month" ).selectmenu("refresh") 

		}			
	}else{
		$(".barMonth").prop("disabled", false)
		$(".dateMenu.barChart.month" ).selectmenu("refresh")  
		$(".dateMenu.barChart.quarter" ).selectmenu("refresh")  
	}
}
function buildBarDateMenus(endDate, lastDate){
	var params = getParams(),
		firstYear = params.firstDate.split("-")[0],
		endYear = moment(endDate).year(),
		endMonth = moment(endDate).month(),
		lastYear = moment(lastDate).year(),
		lastMonth = moment(lastDate).month(),
		barYearMenu = d3.select(".dateMenu.barChart.year");

	barYearMenu.selectAll("option").remove()

	for(var yr = firstYear; yr <= lastYear; yr++){
		barYearMenu.append("option")
			.attr("value", yr)
			.attr("class", "barYear y" + yr)
			.property("selected", function(){ return (yr == endYear)})
			.text(yr)
	}


	$(".dateMenu.barChart.year" ).selectmenu({
		open: function(event, d){
			event.stopPropagation();
		},
		close: function(event, d){
			event.stopPropagation();
		},
		change: function(event, d){
			event.stopPropagation();
			var params = getParams(),
				endMonth = +params.endDate.split("-")[1],
				endString = getDateString(endMonth, +d.item.value),
				cleanDates = sanitizeDates(params.startDate, endString, {});

			disableBarMenuMonths(d.item.value, params.lastDate)
			updateBarChart(params.indicator, params.unit, cleanDates[1])
			updateLineChart(params.indicator, params.unit, params.states, cleanDates[0], cleanDates[1])
			setParams({"endDate": cleanDates[1], "startDate": cleanDates[0] })
			updateDateMenus({"startDate": cleanDates[0], "endDate": cleanDates[1]})
		}
	})

	$(".dateMenu.barChart.year" ).selectmenu("refresh")

	$(".dateMenu.barChart.month" ).selectmenu({
		open: function(event, d){
			event.stopPropagation();
		},
		close: function(event, d){
			event.stopPropagation();
		},
		change: function(event, d){
			event.stopPropagation();
			var params = getParams(),
				endYear = +params.endDate.split("-")[0],
				endString = getDateString(+d.item.value, endYear),
				cleanDates = sanitizeDates(params.startDate, endString, {});

			updateBarChart(params.indicator, params.unit, cleanDates[1])
			updateLineChart(params.indicator, params.unit, params.states, cleanDates[0], cleanDates[1])
			setParams({"endDate": cleanDates[1], "startDate": cleanDates[0] })
			updateDateMenus({"startDate": cleanDates[0], "endDate": cleanDates[1]})
		}
	})

	$(".dateMenu.barChart.quarter" ).selectmenu({
		open: function(event, d){
			event.stopPropagation();
		},
		close: function(event, d){
			event.stopPropagation();
		},
		change: function(event, d){
			event.stopPropagation();
			var params = getParams(),
				endYear = +params.endDate.split("-")[0],
				endString = getDateString(+d.item.value, endYear),
				cleanDates = sanitizeDates(params.startDate, endString, {});

			updateBarChart(params.indicator, params.unit, cleanDates[1])
			updateLineChart(params.indicator, params.unit, params.states, cleanDates[0], cleanDates[1])
			setParams({"endDate": cleanDates[1], "startDate": cleanDates[0] })
			updateDateMenus({"startDate": cleanDates[0], "endDate": cleanDates[1]})
		}
	})

	disableBarMenuMonths(endYear, params.lastDate)
}
function buildLineDateMenu(startDate, endDate, menu){
	var params = getParams(),
		indicator = params.indicator,
		lastDate = params.lastDate,
		firstDate = params.firstDate,
		firstYear = +(firstDate.split("-")[0]),
		firstMonth = +(firstDate.split("-")[1]),
		lastYear = +lastDate.split("-")[0],
		lastMonth = +lastDate.split("-")[1],
		startYear = +startDate.split("-")[0],
		endYear = +endDate.split("-")[0],
		startMonth = +startDate.split("-")[1],
		endMonth = +endDate.split("-")[1],
		yearRange = moment(lastDate).diff(firstDate, "years"),
		data = Array(yearRange + 1).fill(monthAbbrs),
		menuSelector = (menu == "start") ? ".calendarContainer.startDate" : ".calendarContainer.endDate",
		calMenuTitle = (menu == "start") ? "Start Date" : "End Date";

		d3.select(menuSelector).selectAll("*").remove()


	d3.select(menuSelector)
			.append("div")
			.attr("class", "calMenuTitle")
			.text(calMenuTitle)

		var leftArrow = d3.select(menuSelector)
			.append("div")
			.attr("class", "left calendarArrow")
		leftArrow.append("img")
			.attr("src", pathPrefix + "static/img/calendarArrow.png")
		leftArrow.on("click", function(){
			d3.event.stopPropagation();
			var rightMostYear = (+d3.select(this.parentNode).select(".calendarYearContainer.active").attr("data-year") + 3),
			
			firstYear = +(getParams().firstDate.split("-")[0])
			if(firstYear + 3 == rightMostYear) return false

			d3.select(this.parentNode).select(".calendarYearContainer.y" + (+rightMostYear - 4)).classed("active", true)
			d3.select(this.parentNode).select(".calendarSubcontainer")
				.style("left", (-1*calendarYearContainerWidth) + "px")
				.transition()
				.style("left", "0px")
				.on("end", function(){
					d3.select(this.parentNode).select(".calendarYearContainer.y" + (+rightMostYear)).classed("active", false)
					d3.select(this.parentNode).select(".calendarYearContainer.y" + (+rightMostYear + 1)).classed("active", false)
				})
		})

		var yearContainer = d3.select(menuSelector)
			.append("div")
				.attr("class", "calendarFrame")
				.append("div")
					.attr("class", "calendarSubcontainer")
					.selectAll("calendarYearContainer")
					.data(data)
					.enter().append("div")
						.attr("class", function(d, i){
							var active;
							if(menu == "start"){
								active = ( (i + firstYear) < startYear || (i + firstYear) > startYear + 3) ? "" : " active"
							}else{
								active = ( (i + firstYear) > endYear + 2 || (i + firstYear) < endYear - 2) ? "" : " active"
							}
							return "calendarYearContainer y" + (i + firstYear) + active
						})
						.attr("data-year", function(d, i){ return i + firstYear})


		yearContainer.append("input")
			.attr("class", function(d, i){
				var active = (startYear <= (i + firstYear) && endYear >= (i + firstYear)) ? " active" : ""
				return "calYearLabel" + active
			})
			.attr("value", function(d,i){ return i + firstYear })
			// .on("input", function(d, i){
			// })

		yearContainer.selectAll("calMonth")
			.data(function(d){ return d})
			.enter().append("div")
				.attr("class", function(d, i){
					var year = +d3.select(this.parentNode).attr("data-year"),
						month = (i + 1),
						quarterly = (month == 1 || month == 4 || month == 7 || month == 10) ? " quarterShow" : " quarterHide",
						calClass = "calMonth " + menu + " m" + month + quarterly;

					if(year > startYear && year < endYear){
						calClass += " active"
					}
					else if(year == lastYear && month > lastMonth && menu == "end"  ){
						calClass += " disabled"
					}
					else if(year == startYear && year == endYear && menu == "start"){
						if(month >= startMonth && month <= endMonth) calClass += " active"
						else if(month > endMonth) calClass += " disabled"
					}
					else if(year == startYear && year == endYear && menu == "end"){
						if(month >= startMonth && month <= endMonth) calClass += " active"
						else if(month < startMonth) calClass += " disabled"
					}
					else if(year == startYear && month >= startMonth){
						calClass += " active"
					}
					else if(year == endYear && month <= endMonth){
						calClass += " active"
					}
					else if((year > endYear || (year == endYear && month > endMonth)) && menu == "start"  ){
						calClass += " disabled"
					}
					else if((year < startYear || (year == startYear && month < startMonth)) && menu == "end"  ){
						calClass += " disabled"
					}
					return calClass;

				})

				.text(function(d){
					if(isQuarterly(indicator)){
						if(d == "Jan") return "Q1"
						else if(d == "Apr") return "Q2"	
						else if(d == "Jul") return "Q3"
						else if(d == "Oct") return "Q4"	
					}else{
						return d
					}
				})
				.style("width", function(){
					return (isQuarterly(indicator)) ? calMonthQuarterWidth + "px" : calMonthWidth + "px"
				})
				.style("display", function(d, i){
					// return (isQuarterly(indicator)) ? str(calMonthQuarterWidth) + "px" : str(calMonthWidth) + "px"

					// return (quarterly && isQuarterly(indicator)) ? ""
					if(isQuarterly(indicator)){
						var month = (i + 1),
							quarterly = (month == 1 || month == 4 || month == 7 || month == 10)
						
						return (quarterly) ? "block" : "none"
					}else{
						return "inline-block"
					}
				})
				.on("click", function(d, i){
					d3.event.stopPropagation();
					if(d3.select(this).classed("start")){
						var year = +d3.select(this.parentNode).attr("data-year"),
							params = getParams(),
							endDate = params.endDate,
							startString = getDateString(i+1, year)

						setParams({"startDate": startString})
						updateDateMenus({"startDate": startString, "endDate": endDate, "calClick": true })
						updateLineChart(params.indicator, params.unit, params.states, startString, params.endDate)
					}else{
						var year = +d3.select(this.parentNode).attr("data-year"),
							params = getParams(),
							startDate = params.startDate,
							endString = getDateString(i+1, year)

						setParams({"endDate": endString})
						updateDateMenus({"startDate": startDate, "endDate": endString, "calClick": true})
						updateLineChart(params.indicator, params.unit, params.states, startDate, endString)
						updateBarChart(params.indicator, params.unit, endString)

					}

				})

		var rightArrow = d3.select(menuSelector)
			.append("div")
			.attr("class", "right calendarArrow")
		rightArrow.append("img")
			.attr("src", pathPrefix + "static/img/calendarArrow.png")
		rightArrow.on("click", function(){
			d3.event.stopPropagation();
			var leftMostYear = d3.select(this.parentNode).select(".calendarYearContainer.active").attr("data-year"),
				lastYear = +getParams().lastDate.split("-")[0]
			if(+leftMostYear == lastYear){ return false}
			d3.select(this.parentNode).select(".calendarSubcontainer")
				.transition()
				.style("left", (-1*calendarYearContainerWidth) + "px")
				.on("end", function(){
					d3.select(this).style("left", "0px")
					d3.select(this.parentNode).select(".calendarYearContainer.y" + leftMostYear).classed("active", false)
					d3.select(this.parentNode).select(".calendarYearContainer.y" + (+leftMostYear + 4)).classed("active", true)
				})
		})

		d3.selectAll(".calYearLabel")
			.on("input", function(){
				var params = getParams(),
					firstYear = +params.firstDate.split("-")[0],
					lastYear = +params.lastDate.split("-")[0],
					inputYear = +this.value,
					containerYear = d3.select(this.parentNode).attr("data-year"),
					displayedYears = d3.select(this.parentNode.parentNode).selectAll(".calendarYearContainer.active").nodes().map(function(o){
						return d3.select(o).attr("data-year")
					}),
					displayedIndex = displayedYears.indexOf(containerYear)

					var thisInd = this;

				if(inputYear >= firstYear && inputYear <= lastYear){
					var startLeft, endLeft;
					if(inputYear == containerYear){
						return false;
					}
					else if(inputYear > containerYear){
						startLeft = -1*calendarYearContainerWidth + "px"
						endLeft = "0px"
					}
					else{
						endLeft = -1*calendarYearContainerWidth + "px"
						startLeft = "0px"

					}

					d3.select(this.parentNode.parentNode)
						.style("left", startLeft)
						.transition()
						.style("left", endLeft)
						.on("end", function(){
							d3.select(this).style("left","0px")

							var newYears;
							if( (displayedIndex == 0 && +inputYear < lastYear - 1) || (+inputYear == +firstYear) || (+inputYear == +firstYear+1 && displayedIndex == 2)) {
								newYears = [+inputYear, +inputYear+1, +inputYear+2, +inputYear+3]
							}
							else if(displayedIndex == 1 && +inputYear != +lastYear){
								newYears = [+inputYear-1, +inputYear, +inputYear+1, +inputYear+2]
							}
							else if(displayedIndex == 2 || (+inputYear == +lastYear) || (+inputYear == +lastYear-1 && displayedIndex == 0)){
								newYears = [+inputYear-2, +inputYear-1, +inputYear, +inputYear+1]	
							}else{
								return false
							}


							d3.select(this.parentNode.parentNode).selectAll(".calendarYearContainer").classed("active", false)
							for(var i = 0; i < newYears.length; i++){
								var ny = newYears[i]
								if(ny <= +lastYear && ny >= +firstYear){
									d3.select(this.parentNode.parentNode).select(".calendarYearContainer.y" + newYears[i]).classed("active", true)
								}
							}

							thisInd.blur()
							// this.blur()

						})
				}
			})
			.on("blur", function(){
				var inputYear = d3.select(this).attr("value"),
					containerYear = d3.select(this.parentNode).attr("data-year")
				d3.select(this).property("value", containerYear)
			})

		var doneButton = d3.select(menuSelector)
			.append("div")
			.attr("class", "calDoneButton")
			.text("Done")
			.on("click", function(){
				d3.event.stopPropagation();
				d3.selectAll(".calendarParent").classed("visible", false)
			})

		d3.select(menuSelector).append("div")
			.attr("class","datesAvailHeader")
			.text("Available dates")

		var datesAvailText = d3.select(menuSelector).append("div")
			.attr("class", "datesAvailText")
			.html(function(){
							if(isQuarterly(indicator)){
				return "Q" + ((firstMonth-1)/3 + 1) + " " + firstYear + "&ndash;" + "Q" + ((lastMonth-1)/3 + 1) + " " + lastYear
			}else{
				return monthFull[firstMonth - 1] + " " + firstYear + "&ndash;" + monthFull[lastMonth - 1] + " " + lastYear
			}
			})

			// if(isQuarterly(indicator)){
			// 	return "Q" + ((startMonth-1)/3 + 1) + " " + startYear + "&ndash;" + "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			// }else{
			// 	return monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear
			// }


}
function buildStateMenu(stateNamesData, states){
	var leftData = stateNamesData.slice(0, 26),
		rightData = stateNamesData.slice(26,51),
		left = d3.select(".stateNameCol.left")
			.selectAll(".stateName")
			.data(leftData)
			.enter().append("div")
				.attr("class", "stateName")

	d3.select(".stateNameCol.right")
		.selectAll(".stateName")
		.data(rightData)
		.enter().append("div")
			.attr("class", "stateName")

	d3.selectAll(".stateName")
		.text(function(d){ return d.name })
		.classed("active", function(d){ return states.indexOf(d.abbr) != -1 })
		.attr("id", function(d){ return "stateName_" + d.abbr})
		.on("click", function(d){
			d3.event.stopPropagation();
			var params = getParams()

			if(d3.select(this).classed("active")){
				d3.select(this).classed("active", false)
				params.states.splice(params.states.indexOf(d.abbr), 1)
			}else{
				d3.select(this).classed("active", true)
				params.states.push(d.abbr);
			}

			setParams({"states": params.states.sort()})
			updateSelectedStates(params.states)
		})
	d3.selectAll(".clearSelections")
		.on("click", function(d){
			var params = getParams(),
				cleared = params.states.filter(function(o){ return o == "US" })

			setParams({"states": cleared})
			updateSelectedStates(cleared)
		})
	d3.select("#hideUS")
		.on("click", function(){
			var params = getParams(),
				newStates = params.states;

			if(d3.select(this).classed("show")){
				d3.select(this).classed("show", false)
				d3.select(this).classed("hide", true)

				d3.select(this).select("span").text("Show")

				newStates = newStates.filter(function(o){ return o != "US" })

				d3.selectAll(".usText").transition().style("opacity",0)
				d3.selectAll(".usLine").transition().style("opacity",0)


			}else{
				d3.select(this).classed("show", true)
				d3.select(this).classed("hide", false)

				d3.select(this).select("span").text("Hide")

				newStates.push("US")

				d3.selectAll(".usText").transition().style("opacity",1)
				d3.selectAll(".usLine").transition().style("opacity",1)
			}
			
			// var params = getParams(),
			// 	cleared = params.states.filter(function(o){ return o == "US" })

			setParams({"states": newStates})
			updateSelectedStates(newStates)
		})
}
function updateSelectedStates(states, hoverState){
	var nonUS = states.filter(function(o){ return o != "US" })
	var params = getParams();
	d3.selectAll(".stateName").classed("active", false)
	if(nonUS.length > 0){
		d3.selectAll(".clearSelections").classed("disabled", false)
	}else{
		d3.selectAll(".clearSelections").classed("disabled", true)
	}

	var downloadStateText = ""
	for(var i = 0; i < nonUS.length; i++){
		s = nonUS[i]
		d3.select("#stateName_" + s).classed("active", true)
		if(i < nonUS.length - 1){
			if(nonUS.length == 2) downloadStateText += getStateName(s) + " "
			else downloadStateText += getStateName(s) + ", "
		}
		// else if(i == nonUS.length - 2 ){
		// 	downloadStateText += getStateName(s) + " "	
		// }
		else{
			if(i == 0) downloadStateText += getStateName(s)
			else downloadStateText += " and " + getStateName(s)
		}
	}
	d3.select("#pu-dlStates").text(downloadStateText)
	if(nonUS.length > 1){
		d3.selectAll(".stateDisplayName").text(multipleStatesText)
		d3.select(".singleYear.tt-states").text(multipleStatesText)
		d3.selectAll(".multiYear.tt-states").text(multipleStatesText)
		d3.select(".singleYear.tt-value").style("opacity",0)
	}
	else if(nonUS.length == 0){
		d3.selectAll(".stateDisplayName").text(noStatesText)
		d3.select(".singleYear.tt-states").text("")
		d3.selectAll(".multiYear.tt-states").text("")
		d3.select(".singleYear.tt-value").style("opacity",0)
	}
	else{
		d3.selectAll(".stateDisplayName").text(getStateName(nonUS[0]))
		d3.select(".singleYear.tt-states").text(getStateName(nonUS[0]))
		d3.selectAll(".multiYear.tt-states").text(getStateName(nonUS[0]))
	}
	highlightStates(states, hoverState)
	updateLineChart(params.indicator, params.unit, states, params.startDate, params.endDate)
}
function updateDateMenus(opts){
	
	var params = getParams(),
		firstDate = params.firstDate.split("-"),
		lastDate = params.lastDate.split("-"),
		firstYear = +firstDate[0],
		lastYear = +lastDate[0],
		lastMonth = +lastDate[1],
		indicator = params.indicator;


	if(opts.hasOwnProperty("startDate")){
		var startDate = opts.startDate,
			endDate = opts.endDate,
			startYear = +startDate.split("-")[0],
			endYear = +endDate.split("-")[0],
			startMonth = +startDate.split("-")[1],
			endMonth = +endDate.split("-")[1];

		d3.select(".menuActive.timeRange").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((startMonth-1)/3 + 1) + " " + startYear + "&ndash;" + "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear
			}
		})

		d3.select("#pu-dlDateRange").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((startMonth-1)/3 + 1) + " " + startYear + " to " + "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear
			}
		})

		d3.select(".multiYear.tt-date.range").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((startMonth-1)/3 + 1) + " " + startYear + "&ndash;" + "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear
			}
		})

		d3.select(".lineMenuDate.start").text(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((startMonth-1)/3 + 1) + " " + startYear
			}else{
				return startMonth + "/" + startYear	
			}
		})

		d3.select(".calendarContainer.startDate")
			.selectAll(".calYearLabel")
			.classed("active", function(d, i){
				return (startYear <= (i + firstYear) && endYear >= (i + firstYear))
			})
		d3.select(".calendarContainer.endDate")
			.selectAll(".calYearLabel")
			.classed("active", function(d, i){
				return (startYear <= (i + firstYear) && endYear >= (i + firstYear))
			})

		d3.select(".calendarContainer.startDate")
			.selectAll(".calMonth")
			.attr("class", function(d, i){
				var year = +d3.select(this.parentNode).attr("data-year"),
					month = monthAbbrs.indexOf(d) + 1,
					quarterly = (month == 1 || month == 4 || month == 7 || month == 10) ? " quarterShow" : " quarterHide",
					calClass = "calMonth start m" + month + quarterly;

				if(year > startYear && year < endYear){
					calClass += " active"
				}
				else if(year == startYear && year == endYear){
					if(month >= startMonth && month <= endMonth) calClass += " active"
					else if(month > endMonth) calClass += " disabled"
				}
				else if(year == startYear && month >= startMonth){
					calClass += " active"
				}
				else if(year == endYear && month <= endMonth){
					calClass += " active"
				}
				else if(year > endYear || (year == endYear && month > endMonth) ){
					calClass += " disabled"
				}
				return calClass
			})

		if( ! opts.hasOwnProperty("calClick") ){

			d3.select(".calendarContainer.startDate")
				.selectAll(".calendarYearContainer")
				.attr("class", function(d, i){
					var active = ( (i + firstYear) < startYear || (i + firstYear) > startYear + 3) ? "" : " active"
					return "calendarYearContainer y" + (i + firstYear) +  active
				})
		}
	}
	if(opts.hasOwnProperty("endDate")){
		var startDate = opts.startDate,
			endDate = opts.endDate,
			startYear = +startDate.split("-")[0],
			endYear = +endDate.split("-")[0],
			startMonth = +startDate.split("-")[1],
			endMonth = +endDate.split("-")[1];

		d3.select(".menuActive.timeRange").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((startMonth-1)/3 + 1) + " " + startYear + "&ndash;" + "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear
			}
		})

		d3.select("#pu-dlDateSingle").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[endMonth - 1] + " " + endYear
			}
		})

		d3.select(".multiYear.tt-date.range").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((startMonth-1)/3 + 1) + " " + startYear + "&ndash;" + "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear
			}
		})
		d3.select(".menuActive.timeSingle").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[endMonth - 1] + " " + endYear
			}
		})
		d3.select("#mobileStateDate").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[endMonth - 1] + " " + endYear
			}
		})

		d3.select(".lineMenuDate.end").text(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return endMonth + "/" + endYear	
			}
		})

		d3.select(".singleYear.tt-date").html(function(){
			if(isQuarterly(indicator)){
				return "Q" + ((endMonth-1)/3 + 1) + " " + endYear
			}else{
				return monthFull[endMonth - 1] + " " + endYear
			}
		})

		disableBarMenuMonths(endYear, params.lastDate)

		d3.select(".dateMenu.barChart.year")
			.selectAll(".barYear")
			.property("selected", false)

		d3.select(".dateMenu.barChart.year")
			.select(".barYear.y" + endYear)
			.property("selected", "selected")

		$(".dateMenu.barChart.year")
			.selectmenu("refresh")

		d3.select(".dateMenu.barChart.month")
			.selectAll(".barMonth")
			.property("selected", false)

		d3.select(".dateMenu.barChart.month")
			.select(".barMonth.m" + endMonth)
			.property("selected", "selected")

		$(".dateMenu.barChart.month")
			.selectmenu("refresh")

		d3.select(".dateMenu.barChart.quarter")
			.selectAll(".barMonth")
			.property("selected", false)

		d3.select(".dateMenu.barChart.quarter")
			.select(".barMonth.q" + Math.ceil(endMonth/3))
			.property("selected", "selected")

		$(".dateMenu.barChart.quarter")
			.selectmenu("refresh")


		d3.select(".calendarContainer.startDate")
			.selectAll(".calYearLabel")
			.classed("active", function(d, i){
				return (startYear <= (i + firstYear) && endYear >= (i + firstYear))
			})
		d3.select(".calendarContainer.endDate")
			.selectAll(".calYearLabel")
			.classed("active", function(d, i){
				return (startYear <= (i + firstYear) && endYear >= (i + firstYear))
			})

		d3.select(".calendarContainer.endDate")
			.selectAll(".calMonth")
			.attr("class", function(d, i){
				var year = +d3.select(this.parentNode).attr("data-year"),
					month = monthAbbrs.indexOf(d) + 1,
					quarterly = (month == 1 || month == 4 || month == 7 || month == 10) ? " quarterShow" : " quarterHide",
					calClass = "calMonth end m" + month + quarterly;
				
				if(year > startYear && year < endYear){
					calClass += " active"
				}
				else if(year == lastYear && month > lastMonth){
					calClass += " disabled"
				}
				else if(year == startYear && year == endYear){
					if(month >= startMonth && month <= endMonth) calClass += " active"
					else if(month < startMonth) calClass += " disabled"
				}
				else if(year == startYear && month >= startMonth){
					calClass += " active"
				}
				else if(year == endYear && month <= endMonth){
					calClass += " active"
				}
				else if(year < startYear || (year == startYear && month < startMonth) ){
					calClass += " disabled"
				}
				return calClass;
			})

		if( ! opts.hasOwnProperty("calClick") ){
			d3.select(".calendarContainer.endDate")
				.selectAll(".calendarYearContainer")
				.attr("class", function(d, i){
					var active = ( (i + firstYear) > endYear + 2 || (i + firstYear) < endYear - 2) ? "" : " active"
					return "calendarYearContainer y" + (i + firstYear) +  active
				})
		}


	}
}

function buildShareURL(){
	// states, indicator, unit, startDate, endDate
	var params = getParams()
	var shareURL = window.location.origin + window.location.pathname + "?"

	var startString = parseInt(params.startDate.split("-")[1]) + "-" + params.startDate.split("-")[0],
		endString = parseInt(params.endDate.split("-")[1]) + "-" + params.endDate.split("-")[0],
		stateString = params.states.join("-"),
		indicatorString = params.indicator,
		unitString = params.unit;

	if(d3.select(".timeTypeContainer.active").classed("line")){
		shareURL += "start=" + startString + "&"
	}
	shareURL += "end=" + endString + "&states=" + stateString + "&indicator=" + indicatorString + "&unit=" + unitString

	return shareURL;

}
function buildCards(cardData, isDefault){
	var card = d3.select("#cardContentContainer")
		.selectAll(".card")
		.data(cardData)
		.enter().append("div")
		.attr("class", function(d,i){
			if (isDefault && i == 0) return "card selected"
			else return "card"
		})

		.style("background-color", function(d,i){
			var bgColors = ["#1696d2", "#46ABDB"]
			return bgColors[i%2]
		})
		.on("mouseover", function(){
			d3.select(this).classed("active", true)
		})
		.on("mouseout", function(){
			d3.select(this).classed("active", false)
		})
		.on("click", function(d){
			d3.event.stopPropagation();
			closeMenus("cardButton")
			d3.selectAll(".card").classed("selected", false)
			d3.select(this).classed("selected", true)

			var scrollToSelector = (widthUnder(768)) ? "#chartAreaContainer" : "#sectionNames"
			$("html, body").animate({ scrollTop: $(scrollToSelector).offset().top - 20 }, 1000);

			var copy = JSON.parse(JSON.stringify(d))
			var params = ["indicator", "startDate", "endDate", "unit", "states"]
			if(copy.hasOwnProperty("startDate")) showChart("line")
			else showChart("bar")
			setParams(copy)
			updateSelectedStates(copy.states)
			updateIndicator(d.indicator)
		})

	card.append("div")
		.attr("class","cardSectionTitle")
		.text(function(d){
			return sectionNames[getSection(d.indicator)]
		})
	card.append("div")
		.attr("class", "cardMainText")
		.html(function(d){
			return d.text
		})


	var bottomRow = card.append("div")
		.attr("class", "cardBottomRow")

	bottomRow.append("div")
		.attr("class", "cardButton")
		.text("See the chart")


	bottomRow.append("div")
		.attr("class", "cardFacebookButton")
			.append("span")
				.attr("class", "cardFacebookImg")
				.on("click", function(d){
					window.open(getFacebookShare(buildShareURL()), "_blank")
				})

	bottomRow.append("div")
		.attr("class", "cardTwitterButton")
			.append("span")
				.attr("class", "cardTwitterImg")
				.on("click", function(d){
					d3.event.stopPropagation();
					window.open(getTwitterShare(buildShareURL(), d.text), "_blank")
				})

	var downArrow = card.append("div")
		.attr("class", "cardDownArrow")

	downArrow.append("img")
		.attr("src", function(d,i){
			var downArrows = ["static/img/downArrow1.png", "static/img/downArrow2.png"]
			return downArrows[i%2]
		})

	var wellWidth = d3.select("#cardContentContainer").node().getBoundingClientRect().width,
		cardCount = cardData.length,
		cardWidth = 342;
	
	if(cardCount * cardWidth > wellWidth) d3.select(".cardArrow.right").style("display", "block")

	d3.select(".cardArrow.left")
		.on("click", function(){
			d3.select(".cardArrow.right").style("display", "block").style("opacity",1)
			var progress = Math.abs(Math.round(+(d3.select(".card").style("left").replace("px",""))/cardWidth))
			if(progress == 0){
				d3.select(this).style("opacity",.1)
				return false
			}
			// if(cardCount - progress == 1){
			// 	return false
			// }
			d3.selectAll(".card")
				.transition()
				.style("left", ((progress - 1) * -1 * cardWidth) + "px")
		})

	d3.select(".cardArrow.right")
		.on("click", function(){
			d3.select(".cardArrow.left").style("display", "block").style("opacity",1)
			var progress = Math.abs(Math.round(+(d3.select(".card").style("left").replace("px",""))/cardWidth))
			if
			((d3.selectAll(".card").nodes()[cardCount-1].getBoundingClientRect().right  < window.innerWidth)
			||
			(cardCount - progress == 1))
			{
				d3.select(this).style("opacity",.1)
				return false
			}
			d3.selectAll(".card")
				.transition()
				.style("left", ((progress + 1) * -1 * cardWidth) + "px")

		})


}
function buildBarChart(chartData, topojsonData, indicator, unit, states, endDate, containerType){
	var allGeographies = getBarData(chartData, indicator, unit, endDate),
		data = allGeographies.states,
		usData = allGeographies.US,
		key = getKey(indicator, unit);

	var margin = getBarMargins(),
		w = getBarW(),
		h = getBarH(),
		width = w - margin.left - margin.right,
		height = h - margin.top - margin.bottom;

	var printClass;
	if(containerType == "screen"){
		var margin = getBarMargins(),
			w = getBarW(),
			h = getBarH(),
			width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
		var svg = d3.select("#barChartContainer").append("svg").attr("id", "barChartScreen").attr("width", w).attr("height", h)
		printClass = ""
	}else{
		var margin = getBarMargins(),
			w = BAR_IMG_WIDTH,
			h = BAR_IMG_HEIGHT,
			width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
		
		var svg = d3.select("#hiddenBarChartContainer").append("svg").attr("id", "barChartHide").attr("width", w - 20 + 10).attr("height", 60 + h + MAP_IMG_WIDTH *.6)
		printClass = "imgMapHide"
	}

	var imgScootch = (containerType == "screen") ? 0 : 30;
	var leftScootch = (containerType == "screen") ? 0 : 10;

	var g = svg.append("g").attr("transform", "translate(" + (margin.left + leftScootch) + "," + (margin.top + imgScootch) + ")").attr("class",printClass);

	var paddingInner = (widthUnder(768)) ? 0 : 0.1
	var align = (widthUnder(768)) ? 1 : 0.2
	var x = d3.scaleBand()
		.range([0, width])
		.paddingInner(paddingInner)
		.align(align)
		.paddingOuter(0.8)
		.domain(data.map(function (d) {
			return d.abbr;
		}));


	var yMax = d3.max(data, function (d) { return d[key]; }),
		yMin = Math.min( 0, d3.min(data, function (d) { return d[key]; }) ),
		yRange = yMax - yMin,
		newYMin = (yMin == 0) ? 0 : yMin - (.2*yRange),
		newYMax = yMax + (.2 * yRange)

	var y = d3.scaleLinear()
		.rangeRound([height, 0])
		.domain([newYMin, newYMax])
		.nice();

	g.append("g")
		.attr("class", "bar x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
			.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", "-.55em")
				.attr("transform", "rotate(-90)" );

	var axisSelection = g.append("g")
		.attr("class", "bar y axis")
		.call(d3.axisLeft(y).tickSize(-width).ticks(barTickCount).tickFormat(abbrevFormat))

	axisSelection.selectAll("text").attr("text-anchor", "start").attr("x", -1*getBarMargins().left)
	axisSelection.selectAll("line").attr("stroke", function(d,i){ return (d == 0) ? "#000" : "#dedddd" })


	var colorScale = getColorScale(y, data, key)
	
	g.selectAll(".usLine")
		.data(usData)
		.enter().append("line")
			.attr("class", "usLine")
			.attr("x1", 0)
			.attr("x2", width-x.bandwidth())
			.attr("y1", function (d) {
				return y(d[key]);
			})
			.attr("y2", function (d) {
				return y(d[key]);
			})
			.style("opacity", function(){ return (isUSHidden()) ? 0 : 1})
	var usXScootch = (widthUnder(768)) ? -3: 2;
	g.selectAll(".usText")
		.data(usData)
		.enter().append("text")
			.attr("class", "usText")
			.attr("x", width-x.bandwidth() + usXScootch)
			.attr("text-anchor", "start")
			.attr("y", function (d) {
				return y(d[key]) + 4;
			})
			.text("US")
			.style("opacity", function(){ return (isUSHidden()) ? 0 : 1})

	g.selectAll("rect.bar")
		.data(data)
		.enter().append("rect")
			.attr("class", function(d){
				return "bar b-" + d.abbr
			})
			.attr("x", function (d, i) {
				return x(d.abbr);
			})
			.attr("y", function (d) {
				return y( Math.max(0, +d[key]) );
			})
			.style("fill", function(d){ return colorScale(d[key])})
			.style("stroke", function(d){
				if(widthUnder(768)){
					return colorScale(d[key])
				}else{
					return "none"
				}
			})
			.attr("width", x.bandwidth())
			.attr("height", function (d) {
				return Math.abs(y(+d[key]) - y(0));
			})
			.on("mouseover", function(d){
				params = getParams()
				states = JSON.parse(JSON.stringify(params.states))
				states.push(d.abbr)
				updateSelectedStates(states, d.abbr)
			})
			.on("mouseout", function(d){
				params = getParams()
				updateSelectedStates(params.states)		
			})
			.on("click", function(d){
				params = getParams()
				states = JSON.parse(JSON.stringify(params.states))
				if(states.indexOf(d.abbr) == -1){
					states.push(d.abbr)
					setParams({"states": states})
					updateSelectedStates(states)
				}else{
					states.splice(states.indexOf(d.abbr), 1)
					setParams({"states": states})
					updateSelectedStates(states)
				}
			});

	g.selectAll("rect.barTooltipBg")
		.data(data)
		.enter().append("rect")
			.attr("class", function(d){
				var active = (states.indexOf(d.abbr) == -1) ? "" : " active"
				var download = (containerType == "screen") ? "" : " download"
				return "barTooltipBg br-" + d.abbr + active + download;
			})
			.attr("x", function (d, i) {
				return x(d.abbr);
			})
			.attr("y", function (d) {
				return (+d[key] > 0) ? y(+d[key]) - 31 : y(0) + Math.abs(y(+d[key]) - y(0)) + 1
			})
			.attr("width", x.bandwidth())
			.attr("height", 30)



	g.selectAll("text.barTooltip")
		.data(data)
		.enter().append("text")
			.attr("class", function(d){
				var active = (states.indexOf(d.abbr) == -1) ? "" : " active"
				var download = (containerType == "screen") ? "" : " download"
				return "barTooltip bt-" + d.abbr + active + download;
			})
			.attr("text-anchor", "end")
			.attr("x", function (d, i) {
				return x(d.abbr) + .5*x.bandwidth() + 4;
			})
			.attr("y", function (d) {
				var chars = formatValue(indicator, unit, d[key]).replace(".","").replace(",","").length
				return (+d[key] > 0) ? y(+d[key]) - chars*6 : y(0) + Math.abs(y(+d[key]) - y(0)) + ((chars-1)*6)
			})
			.attr("transform",function(d){

				var bx = x(d.abbr) + .5*x.bandwidth() + 4,
					chars = formatValue(indicator, unit, d[key]).replace(".","").replace(",","").length,
					by = (+d[key] > 0) ? y(+d[key]) - chars*6 : y(0) + Math.abs(y(+d[key]) - y(0)) + ((chars-1)*6)

				return "rotate(-90," + bx + "," + by + ")"
			})
			.text(function(d){
				return formatValue(indicator, unit, d[key])
			})




	if(containerType == "screen"){
		buildMap(data, topojsonData, key, colorScale, indicator, y.ticks(barTickCount), false)
	}else{

		buildMap(data, topojsonData, key, colorScale, indicator, y.ticks(barTickCount), svg)
	}
}
function buildMapLegend(legend, colorScale, ticks, indicator, svgInput){
	legend.selectAll("*").remove()

	var colorRange = colorScale.range(),
		colorDomain = colorScale.domain(),
		keyWidth = 12,
		keyHeight = widthUnder(500) ? 16 : 20,
		width = getMapWidth(),
		height = .6 * width,
		noDataScootch = (indicator == "state_and_local_public_education_employment") ? -2*keyHeight : 0
		legendXScootch = (widthUnder(768)) ? (widthUnder(400) ? 0 : 40) : 50,
		translateX = (svgInput) ? 800 : width - keyWidth - legendXScootch,
		translateY = (svgInput) ? 500 : height - colorRange.length * keyHeight - 10 + noDataScootch

	colorDomain.unshift(ticks[0])
		
	legend.attr("transform", "translate(" + translateX + "," + translateY + ")")

	legend.selectAll("rect")
		.data(colorRange)
		.enter().append("rect")
		.attr("width", keyWidth)
		.attr("height", keyHeight)
		.style("fill", function(d){ return d})
		.attr("x",0)
		.attr("y", function(d,i){ return i * keyHeight })
	
	legend.selectAll("text.keyLabel")
		.data(colorDomain)
		.enter().append("text")
		.attr("class", "keyLabel")
		.attr("x",keyWidth + 5)
		.attr("y", function(d,i){ return i * keyHeight + 5 })
		.text(function(d){ return abbrevFormat(d) })

	if(indicator == "state_and_local_public_education_employment"){
		legend.append("rect")
			.attr("width", keyWidth)
			.attr("height", keyHeight)
			.style("fill", "#d2d2d2")
			.attr("x",0)
			.attr("y", (ticks.length-1) * keyHeight )
		legend.append("text")
			.attr("class", "keyLabel")
			.attr("x",keyWidth + 5)
			.attr("y", (ticks.length-1) * keyHeight + 15 )
			.text("No data")
	}
}
function buildMap(data, topojsonData, key, colorScale, indicator, ticks, svgInput){
	if(!svgInput){
	//TO BE UPDATED, abstract out to new function
		var width = getMapWidth(),
			height = .6 * width,
			svgWidth = widthUnder(400) ? width + 50 : width;
			mapContainerWidth = (widthUnder(768)) ? ( (widthUnder(400) ? (width + 50) + "px" : (width + 50) + "px") ) : (width + 40) + "px";
	//end update

		var svg = d3.select("#mapContainer")
			.style("width", mapContainerWidth )
			.insert("svg", "#chartButtonContainer")
				.attr("width", svgWidth)
				.attr("height", height)
				.append("g");

		var xScootch = (widthUnder(768)) ? 18 : 0
		var projection = d3.geoAlbersUsa()
			.scale(1.2 * width)
			.translate([width/2 - xScootch, height/2]);
	}else{
		var width = MAP_IMG_WIDTH,
			height = .6 * width + 30

		svg = svgInput.append("g")

		var projection = d3.geoAlbersUsa()
			.scale(1.2 * width)
			.translate([BAR_IMG_WIDTH/2, BAR_IMG_HEIGHT + 230]);
	}


	var path = d3.geoPath()
		.projection(projection);

	topojsonData.objects.states.geometries.forEach(function(u){
		u["properties"]["values"] = data.filter(function(o){ return o.abbr == u.properties.postal })[0]
	})

	var printClass = (svgInput) ? " imgBarHide" : ""
	svg.selectAll("path.stateShape")
		.data(topojson.feature(topojsonData, topojsonData.objects.states).features)
		.enter().append("path")
			.attr("class", function(d){ return "stateShape ss-" + d.properties.postal + printClass})
			.style("fill", function(d){
				if(indicator == "state_and_local_public_education_employment" && (d.properties.postal == "DC" || d.properties.postal == "HI" || d.properties.postal == "MO")){
					return "#d2d2d2"
				}else{
					return colorScale(d["properties"]["values"][key])
				}
			})

			.attr("d", path)
			.on("mouseover", function(d){
				if(getParams().indicator == "state_and_local_public_education_employment" && (d.properties.postal == "DC" || d.properties.postal == "HI" || d.properties.postal == "MO")){
					return false
				}
				params = getParams()
				states = JSON.parse(JSON.stringify(params.states))
				states.push(d.properties.postal)
				updateSelectedStates(states, d.properties.postal)
			})
			.on("mouseout", function(d){
				params = getParams()
				updateSelectedStates(params.states)		
			})
			.on("click", function(d){
				if(getParams().indicator == "state_and_local_public_education_employment" && (d.properties.postal == "DC" || d.properties.postal == "HI" || d.properties.postal == "MO")){
					return false
				}
				params = getParams()
				states = JSON.parse(JSON.stringify(params.states))
				if(states.indexOf(d.properties.postal) == -1){
					states.push(d.properties.postal)
					setParams({"states": states})
					updateSelectedStates(states)
				}else{
					states.splice(states.indexOf(d.properties.postal), 1)
					setParams({"states": states})
					updateSelectedStates(states)
				}
			});

	svg.append("path")
		.attr("class", "state-borders")
		.style("stroke", "white")
		.style("fill", "none")
		.attr("d", path(topojson.mesh(topojsonData, topojsonData.objects.states, function(a, b) { return a !== b; })));

	
	var legend = svg.append("g")
		.attr("id", "mapLegend")
		.attr("class", printClass)

	buildMapLegend(legend, colorScale, ticks, indicator, svgInput)


	if(svgInput){
		function mapTextExternalOneRow(abbr){
			return (abbr == "CT" || abbr == "RI" || abbr == "MA" || abbr == "MD" || abbr == "DC" || abbr == "NJ" || abbr == "DE")
		}
		function mapTextExternalTwoRows(abbr){
			return (abbr == "HI" || abbr == "NH" || abbr == "VT" || abbr == "FL")

		}
		function mapTextExternal(abbr){
			return (mapTextExternalTwoRows(abbr) || mapTextExternalOneRow(abbr))
		}
		function mapTextColor(d, abbr){
			if(mapTextExternal(abbr)) return "#000"
		  	var bgColor = colorScale(d["properties"]["values"][key])
		  	return (bgColor == blue1 || bgColor == blue2 || bgColor == blue3) ? "#000" : "#fff"
		}
		function drawMapElbow(x1, x2, y1, y2, s, abbr){
				s.append("line")
					.attr("x1", x1)
					.attr("x2", x2)
					.attr("y1", y1 + 30)
					.attr("y2", y1 + 30)
					.attr("class", "mapImgLine imgBarHide mi-" + abbr)

				s.append("line")
					.attr("x1", x2)
					.attr("x2", x2)
					.attr("y1", y1 + 30)
					.attr("y2", y2 + 30)
					.attr("class", "mapImgLine imgBarHide mi-" + abbr)

		}
		function drawMapLine(x1, x2, y1, s, abbr){
			s.append("line")
				.attr("x1", x1)
				.attr("x2", x2)
				.attr("y1", y1 + 30)
				.attr("y2", y1 + 30)
				.attr("class", "mapImgLine imgBarHide mi-" + abbr)
		}
		function mapTextX(d, abbr, row){
			var scootch = (mapTextExternalOneRow(abbr) && row == 2) ? 10 : 0,
				start = path.centroid(d)[0];

			switch(abbr){
				case 'CA':
					if(row == 1) scootch -= 2;
					break
				case 'LA':
					if(row == 1) scootch -= 6;
					break
				case 'MI':
					scootch += 10
					break
				case 'ME':
					if(row == 2) scootch += 3
					break
				case 'HI':
					scootch -= 10
					break
				case 'WI':
					scootch += 2
					break
				case 'NC':
					scootch += 2
					break
				case 'FL':
					scootch -= 13
					break
				case 'VT':
					scootch -= 20
					break
				case 'NH':
					scootch -= 15
					break
				case 'MA':
					scootch += 32
					break
				case 'RI':
					scootch += 26
					break
				case 'CT':
					scootch += 16
					break
				case 'NJ':
					scootch += 30
					break
				case 'MD':
					scootch += 30
					break
				case 'DC':
					scootch += 31
					break
				case 'DE':
					scootch += 30
					break
			}
			
			return start + scootch;
		}
		function mapTextY(d, abbr, row){
			var scootch = (row == 2 && !mapTextExternalOneRow(abbr)) ? 10 : 0,
				start = path.centroid(d)[1];

			switch(abbr){
				case 'MI':
					scootch += 16
					break
				case 'ID':
					scootch += 12
					break
				case 'ME':
					scootch -= 5
					break
				case 'AK':
					scootch -= 5
					break
				case 'TN':
					scootch -= 2
					break
				case 'NC':
					scootch -= 3
					break
				case 'VT':
					scootch -= 25
					break
				case 'NH':
					scootch -= 47
					break
				case 'RI':
					scootch += 4
					break
				case 'CT':
					scootch += 14
					break
				case 'NJ':
					scootch += 3
					break
				case 'MA':
					scootch -= 2
					break
				case 'MD':
					scootch += 20
					break
				case 'DC':
					scootch += 7
					break
				case 'DE':
					scootch -= 2
					break
			}

			return start + scootch;
		}

		// d3.selectAll(".pu-ButtonRow .pu-smallButton.active")

		var params = getParams()

		var title = svg.append("text")
			.attr("class", "imgTitle imgMapHide")
			.attr("y",20)
			.attr("x",10)
			.text(function(){
					var params = getParams(),
						indicator = params.indicator,
						lastDate = params.lastDate,
						firstDate = params.firstDate,
						firstYear = +(firstDate.split("-")[0]),
						firstMonth = +(firstDate.split("-")[1]),
						lastYear = +lastDate.split("-")[0],
						lastMonth = +lastDate.split("-")[1]

					if(isQuarterly(indicator)){
						return indicatorNames[indicator] + ",  Q" + ((lastMonth-1)/3 + 1) + " " + lastYear
					}else{
						return indicatorNames[indicator] + ", " + monthFull[lastMonth - 1] + " " + lastYear
					}
					
				})
		title.append("tspan")
			.attr("class", "imgSubtitle")
			.attr("dx", 10)
			.text("(" + indicatorUnits[params.indicator][params.unit] + ")")

		var bottomTitle = svg.append("text")
			.attr("class", "imgTitle imgBarHide imgBothHide imgHidden")
			.attr("y",344)
			.attr("x",239)
			.text(function(){
				var params = getParams(),
					indicator = params.indicator,
					lastDate = params.lastDate,
					firstDate = params.firstDate,
					firstYear = +(firstDate.split("-")[0]),
					firstMonth = +(firstDate.split("-")[1]),
					lastYear = +lastDate.split("-")[0],
					lastMonth = +lastDate.split("-")[1]

				if(isQuarterly(indicator)){
					return indicatorNames[indicator] + ",  Q" + ((lastMonth-1)/3 + 1) + " " + lastYear
				}else{
					return indicatorNames[indicator] + ", " + monthFull[lastMonth - 1] + " " + lastYear
				}
			
			})



		bottomTitle.append("tspan")
			.attr("class", "imgSubtitle")
			.attr("dx", 10)
			.text("(" + indicatorUnits[params.indicator][params.unit] + ")")

		var section = getSection(getParams().indicator),
			sourceText = sources[section].replace(/<[^>]*>?/gm, '') + " via the State Economic Monitor"

		var barLogo = svg.append("text")
			.attr("class", "imgLogo imgMapHide imgBothHide imgHidden")
			.text("Urban")
			.attr("x", 850)
			.attr("y", 354)
		barLogo.append("tspan")
			.attr("dx",5)
			.text("Institute")

		var barSource = svg.append("text")
			.attr("class", "imgSource imgMapHide imgBothHide imgHidden")
			.text("Source:")
			.attr("x", 10)
			.attr("y", 354)
		barSource.append("tspan")
			.attr("dx",5)
			.text(sourceText)


		var bothLogo = svg.append("text")
			.attr("class", "imgLogo imgBarHide imgMapHide")
			.text("Urban")
			.attr("x", 850)
			.attr("y", 721)
		bothLogo.append("tspan")
			.attr("dx",5)
			.text("Institute")

		var bothSource = svg.append("text")
			.attr("class", "imgSource imgBarHide imgMapHide")
			.text("Source:")
			.attr("x", 10)
			.attr("y", 721)
		bothSource.append("tspan")
			.attr("dx",5)
			.text(sourceText)

		var mapLogo = svg.append("text")
			.attr("class", "imgLogo imgBarHide imgBothHide imgHidden")
			.text("Urban")
			.attr("x", 711)
			.attr("y", 721)
		mapLogo.append("tspan")
			.attr("dx",5)
			.text("Institute")

		var mapSource = svg.append("text")
			.attr("class", "imgSource imgBarHide imgBothHide imgHidden")
			.text("Source:")
			.attr("x", 240)
			.attr("y", 721)
		mapSource.append("tspan")
			.attr("dx",5)
			.text(sourceText)



		svg.append("g")
			.selectAll("text.mapName")
			.data(topojson.feature(topojsonData, topojsonData.objects.states).features)
			.enter()
			.append("text")
				.attr("class", function(d){
					return "mapName mapLabel imgBarHide " + "ml-" + d.properties.postal
				})
				.text(function(d){
					return (mapTextExternalOneRow(d.properties.postal)) ? d.properties.postal + ":" : d.properties.postal
				})
				.attr("x", function(d){
					return mapTextX(d, d.properties.postal, 1)
				})
				.attr("y", function(d){
					return mapTextY(d, d.properties.postal, 1)    
				})
				.attr("text-anchor", function(d){
					if(d.properties.postal == "FL" || d.properties.postal == "NH" || d.properties.postal == "VT"){
						return "end"
					}else{
						return "middle"
					}
				})				.style('fill', function(d){
					return mapTextColor(d, d.properties.postal)
				});

		svg.append("g")
			.selectAll("text.mapVal")
			.data(topojson.feature(topojsonData, topojsonData.objects.states).features)
			.enter()
			.append("text")
				.attr("class", function(d){
					return "mapVal mapLabel imgBarHide " + "mv-" + d.properties.postal
				})
				.text(function(d){
					var mval = d["properties"]["values"][key]
					return formatValue(params.indicator, params.unit, mval)
					// return "77.77M"
				})
				.attr("x", function(d){
					return mapTextX(d, d.properties.postal, 2)
				})
				.attr("y", function(d){
					return mapTextY(d, d.properties.postal, 2)
				})
				.attr("text-anchor", function(d){
					if(mapTextExternalOneRow(d.properties.postal)){
						return "start"
					}
					else if(d.properties.postal == "FL" || d.properties.postal == "NH" || d.properties.postal == "VT"){
						return "end"
					}else{
						return "middle"
					}
				})
				.style('fill', function(d){
					return mapTextColor(d, d.properties.postal)
				});

		drawMapLine(745, 757, 419, svg, "MA")
		drawMapLine(743, 757, 432, svg, "RI")
		drawMapLine(723, 736, 457, svg, "NJ")
		drawMapLine(710, 731, 469, svg, "DE")
		drawMapElbow(737, 733, 445, 437, svg, "CT")
		drawMapElbow(691, 726, 474, 477, svg, "DC")
		drawMapElbow(718, 711, 493, 485, svg, "MD")
		drawMapElbow(720, 729, 355, 383, svg, "NH")
		drawMapElbow(704, 719, 375, 389, svg, "VT")

		// drawMapLine(745, 757, 419, svg)

		var allStates = d3.select("#stateNamesData").data()[0].filter(function(o){ return o.abbr != "US" }).map(function(o){ return o.abbr })
		// highlightStates(allStates)

		showImgLabels(params.states)

	}
}
function showImgLabels(states){
	var disp = (states == "all") ? "block" : "none"
	
	d3.selectAll("#hiddenBarChartContainer .barTooltipBg").style("display",disp)
	d3.selectAll("#hiddenBarChartContainer .barTooltip").style("display",disp)
	d3.selectAll("#hiddenBarChartContainer .mapLabel").style("display",disp)
	d3.selectAll("#hiddenBarChartContainer .mapImgLine").style("display",disp)
	
	if(states != "all" && states != "none"){
		states.forEach(function(abbr){
			if(abbr != "US"){
				d3.selectAll("#hiddenBarChartContainer .bt-" + abbr).style("display","block")
				d3.selectAll("#hiddenBarChartContainer .br-" + abbr).style("display","block")
				d3.selectAll("#hiddenBarChartContainer .mv-" + abbr).style("display","block")
				d3.selectAll("#hiddenBarChartContainer .ml-" + abbr).style("display","block")
				d3.selectAll("#hiddenBarChartContainer .mi-" + abbr).style("display","block")
			}
		})
	}
	if(getParams().indicator == "state_and_local_public_education_employment"){
		var hide = ["DC","HI","MO"]
		for(var i = 0; i < hide.length; i++){
			d3.selectAll("#hiddenBarChartContainer .bt-" + hide[i]).style("display","none")
			d3.selectAll("#hiddenBarChartContainer .br-" + hide[i]).style("display","none")
			d3.selectAll("#hiddenBarChartContainer .mv-" + hide[i]).style("display","none")
			d3.selectAll("#hiddenBarChartContainer .ml-" + hide[i]).style("display","none")
			d3.selectAll("#hiddenBarChartContainer .mi-" + hide[i]).style("display","none")
		}
	}
}
function getColorScale(y, data, key){
	var tickBreaks = y.ticks(barTickCount),
		colorBreaks = [],
		flipVals = data.map(function(o){ return o[key]})
		// vals = data.map(function(o){ return o[key]}).reverse()

	for(var i = tickBreaks.length - 1; i > 0; i--){
		if(tickBreaks[i] > flipVals[0] && tickBreaks[i-1] > flipVals[0]){
			tickBreaks.pop()
		}else{
			break;
		}
	}

	var step = (tickBreaks.length > 13) ? 2 : 1


	var vals = flipVals.reverse()

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
		case 3:
			colorRange = fourBlues;
			break;
		case 4:
			colorRange = fourBlues;
			break;
		case 5:
			colorRange = fiveBlues;
			break;
		case 6:
			colorRange = sixBlues;
			break;
		case 7:
			colorRange = sevenBlues;
			break;
		case 8:
			colorRange = eightBlues;
			break;
	}

	var colorScale = d3.scaleThreshold()
		.range(colorRange)
		.domain(colorBreaks)

	return colorScale
}
function buildLineChart(chartData, indicator, unit, states, startDate, endDate, containerType, callback){
//ADD FUNCTIONALITY
	//if active, show linecontainer by default and hide barcontainer

	var dataObj = getLineData(chartData, indicator, unit, states, startDate, endDate),
		data = dataObj.data,
		extent = dataObj.extent,
		key = getKey(indicator, unit),
		margin, width, height, svg, verticalScootch, horizontalScootch;

	if(containerType == "screen"){
		verticalScootch = 0;
		horizontalScootch = 0;
		margin = getLineMargins(),
		width = getLineW() - margin.left - margin.right,
		height = getLineH() - margin.top - margin.bottom;
		
		svg = d3.select("#lineChartContainer")
			.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
	}else{
		verticalScootch = 28;
		horizontalScootch = 10;
		margin = getLineMargins(),
		width = LINE_IMG_WIDTH - margin.left - margin.right,
		height = LINE_IMG_HEIGHT - margin.top - margin.bottom - 40;
		
		svg = d3.select("#hiddenLineChartContainer")
			.append("svg")
				.attr("id", "lineChartHide")
				.attr("width", width + margin.left + margin.right + horizontalScootch)
				.attr("height", height + margin.top + margin.bottom + verticalScootch + 10 + 40)
	}





	var g = svg.append("g")
		.attr("id", "linesContainer")
			.attr("width", width + margin.left + horizontalScootch + margin.right)
			.attr("height", height + margin.top + margin.bottom )
		.attr("transform","translate(" + margin.left + "," + (margin.top + verticalScootch) + ")");

	var defs = svg.append("defs"),
		lineClippingPath = defs.append("clipPath").attr("id", "lineClippingPath"),
		dotClippingPath = defs.append("clipPath").attr("id", "dotClippingPath");

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

	var x = getLineX(startDate, endDate, width)
	var y = getLineY(extent, height)

	g.append("g")
		.attr("class", "line axis x")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).ticks(getLineXTickCount(containerType, startDate, endDate, indicator)))
		.selectAll("text").text(function(d, i){
			var md = moment(d)
			if(isQuarterly(indicator)){
				return "Q" + (md.month()/3 + 1) + " " + md.year()
			}else{
				return (md.month()+1) + "/" + md.year()
			}
			
		});


	var axisSelection = g.append("g")
		.attr("class", "line axis y")
		.call(d3.axisLeft(y).tickSize(-width).ticks(lineTickCount).tickFormat(abbrevFormat))

	axisSelection.selectAll("text").attr("text-anchor", "start").attr("x", -1*getLineMargins().left + horizontalScootch)
	axisSelection.selectAll("line").attr("stroke", function(d,i){ return (d == 0) ? "#000" : "#dedddd" })

	g.selectAll(".state.line")
		.data(data, function(d) { return d.key; })
		.enter()
		.append("path")
			.attr("class",function(d){ return d.key + " state line" })
			.attr("clip-path", "url(#lineClippingPath)")
			.attr("d", function(d){
				return d3.line()
					.x(function(d) { return x(parseTime()(d.date)); })
					.y(function(d) { return y(+d[key]); })
					(d.values)
			})

	var labelYPositions = []
	var labelHeight = 14
	var stateLabel = g.selectAll(".stateLabel")
		.data(data, function(d) { return d.key; })
		.enter()
		.append("g")
		.attr("class", function(d){ return d.key + " stateLabel" })
		.sort(function(a, b){
			var aLast = a["values"].filter(function(o){ return o.date == endDate })[0]
			var bLast = b["values"].filter(function(o){ return o.date == endDate })[0]
			return y(aLast[key]) - y(bLast[key])
		})
		.attr("transform", function(d,i){
			var dLast = d["values"].filter(function(o){ return o.date == endDate })[0],
				yPosition = y(dLast[key])+4
			if(i == 0){
				labelYPositions.push(yPosition)
			}else{
				if(labelYPositions[i-1] + 14 >= yPosition){
					yPosition = labelYPositions[i-1] + labelHeight
				}
				labelYPositions.push(yPosition)

			
			}
			return "translate(" + (width + 1) + "," + yPosition + ")"
		})

	stateLabel.append("rect")
		.attr("x",-1)
		.attr("y",-12)
		.attr("width", 17)
		.attr("height", 16)

	stateLabel.append("text")
		.text(function(d){ return d.key })

	if(containerType == "screen"){
		g.append("circle")
			.attr("class", "linechartDot")
			.attr("clip-path", "url(#dotClippingPath)")
			.attr("r", 5)
			.attr("cx",0)
			.attr("cy",0)

		var voronoi = d3.voronoi()
			.x(function(d) { return x(parseTime()(d.date)); })
			.y(function(d) { return y(d[key]); })
			.extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

		var voronoiGroup = g.append("g")
			.attr("class", "voronoi");

		voronoiGroup.selectAll("path")
			.data(voronoi.polygons(d3.merge(data.map(function(d) { return d.values; }))))
			.enter().append("path")
				.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
				.on("mouseover", function(d){ mouseoverLineChart(d, indicator, unit, startDate, endDate, extent, width, height) })
				.on("mouseout", mouseoutLineChart)
				.on("click", clickLineChart);
	}

	if(containerType == "hide"){
		var title = svg.append("text")
			.attr("class", "imgTitle")
			.attr("y",23)
			.attr("x", 10)
			.text(indicatorNames[indicator])
		title.append("tspan")
			.attr("class", "imgSubtitle")
			.attr("dx", 10)
			.text("(" + indicatorUnits[indicator][unit] + ")")

		var lineLogo = svg.append("text")
			.attr("class", "imgLogo")
			.text("Urban")
			.attr("x", 860)
			.attr("y", 545)
		lineLogo.append("tspan")
			.attr("dx",5)
			.text("Institute")


		var section = getSection(getParams().indicator),
			sourceText = sources[section].replace(/<[^>]*>?/gm, '') + " via the State Economic Monitor"

		var lineSource = svg.append("text")
			.attr("class", "imgSource")
			.text("Source: ")
			.attr("x", 10)
			.attr("y", LINE_IMG_HEIGHT + 25)
		lineSource.append("tspan")
			.attr("dx",5)
			.text(sourceText)

	}
	callback()
}
function getLineX(startDate, endDate, width){
	var x = d3.scaleTime()
		.domain([parseTime()(startDate), parseTime()(endDate)])
		.range([ 0, width ]);

	return x
}
function getLineY(extent, height){
	var range = extent[1]-extent[0]
	var y = d3.scaleLinear()
		.domain([extent[0] - range*.1, extent[1] + range*.1])
		.range([ height, 0 ]);

	return y
}
function getLineMargins(){
	return margin = {top: 20, right: 30, bottom: 30, left: 30}
}
function getLineW(){
	if(widthUnder(1085)){
		return getBarW() + 20
	}
	else if(widthUnder(1200)){
		return getBarW()  - 20
	}else{
		return getBarW();
	}
}
function getLineH(){
	return 520;
}
function getLineXTickCount(containerType, startDate, endDate, indicator){
	// console.log(startDate,endDate,indicator)
	var monthsBetween = moment(endDate).diff(moment(startDate), 'months', true),
		quartersBetween = (monthsBetween/3) + 1

	if(containerType == "hide"){
		if(isQuarterly(indicator)){
			return (quartersBetween < 13) ? quartersBetween : 12
		}else{
			return (monthsBetween < 13) ? monthsBetween : 12
		}
	}else{
		if(widthUnder(1200)){
			if(isQuarterly(indicator)){
				return (quartersBetween < 9) ? quartersBetween : 8
			}else{
				return (monthsBetween < 9) ? monthsBetween : 8
			}
		}else{
			if(isQuarterly(indicator)){
				return (quartersBetween < 13) ? quartersBetween : 12
			}else{
				return (monthsBetween < 13) ? monthsBetween : 12
			}
		}
	}
}
function clickLineChart(d, containerType){
	var svg;
	if(containerType == "hide"){
		svg = d3.select("#hiddenLineChartContainer")
	}else{
		svg = d3.select("#lineChartContainer")
	}
	
	var line = svg.select(".state.line." + d.data.abbr),
		dot = svg.select(".linechartDot"),
		label = svg.select(".stateLabel." + d.data.abbr)

	clicked = line.classed("clicked")


	if(clicked == true){
		line.classed("clicked", false)
		label.classed("clicked", false)
		line.classed("active", false)
		label.classed("active", false)
	}else{
		line.node().parentNode.appendChild(line.node())
		label.node().parentNode.appendChild(label.node())

		line.classed("clicked", true)
		label.classed("clicked", true)
	}
	if(containerType != "hide"){
		dot.node().parentNode.appendChild(dot.node())	
	}
}
function mouseoverLineChart(d, indicator, unit, startDate, endDate, extent, width, height) {
	if(indicator == "state_and_local_public_education_employment" && (d.data.abbr == "DC" || d.data.abbr == "MO" || d.data.abbr == "HI")){
		return false;
	}
	var key = getKey(indicator, unit)

	if (getParams().states.length == 0) return false

	if (parseTime()(startDate).getTime() > parseTime()(d.data.date).getTime() || parseTime()(endDate).getTime() < parseTime()(d.data.date)){
		return false;
	}

	var chartData = getChartData(),
		usData = chartData.filter(function(o){ return (o.date == d.data.date && o.abbr == "US")})[0]

	d3.select(".multiYear.tt-top-row.mouseover").style("display","block")
	d3.select(".multiYear.tt-top-row.mouseout").style("display","none")
	d3.select(".multiYear.tt-us")
		.style("display", "block")
		.text(function(){
			var prefix = ((indicator == "state_gdp" || indicator == "weekly_earnings") && unit == "raw") ? "$" : "",
				suffix = (unit == "change" || indicator == "unemployment_rate") ? "%" : ""
			return "United States " + prefix + formatValue(indicator, unit, usData[key]) + suffix
			
		})

	var x = getLineX(startDate, endDate, width)
	var y = getLineY(extent, height)

	d3.selectAll(".state.line").classed("active", false)
	d3.selectAll(".stateLabel").classed("active", false)
	
	var line = d3.select(".state.line." + d.data.abbr),
		dot = d3.select(".linechartDot"),
		label = d3.select(".stateLabel." + d.data.abbr)

	line.node().parentNode.appendChild(line.node())
	dot.node().parentNode.appendChild(dot.node())
	label.node().parentNode.appendChild(label.node())

	line.classed("active", true)
	label.classed("active", true)
	
	dot
		.style("opacity",1)
		.attr("cx", x(parseTime()(d.data.date)))
		.attr("cy",y(d["data"][key]))

	d3.selectAll(".stateDisplayName").text(getStateName(d.data.abbr))
	d3.select(".multiYear.tt-states").text(getStateName(d.data.abbr))
	d3.selectAll(".multiYear.tt-value").text(function(){
		var prefix = ((indicator == "state_gdp" || indicator == "weekly_earnings") && unit == "raw") ? "$" : "",
			suffix = (unit == "change" || indicator == "unemployment_rate") ? "%" : ""
		return prefix + formatValue(indicator, unit, d["data"][key]) + suffix
	})
	d3.select(".multiYear.tt-date.point").text(function(){
		var md = moment(d.data.date)
		if(isQuarterly(indicator)){
			return "Q" + (md.month()/3 + 1) + " " + md.year()
		}else{
			return monthFull[md.month()] + " " + md.year()
		}
	})

}
function mouseoutLineChart(d) {
	d3.select(".multiYear.tt-top-row.mouseover").style("display","none")
	d3.select(".multiYear.tt-top-row.mouseout").style("display","block")
	d3.select(".multiYear.tt-us").style("display", "none")

	d3.select(".linechartDot").style("opacity",0)
	d3.selectAll(".state.line").classed("active", false)
	d3.selectAll(".stateLabel").classed("active", false)

	d3.selectAll(".clicked").nodes().forEach(function(l){ l.parentNode.appendChild(l) })
}
function getBarMargins(){
	var mr = (widthUnder(1200)) ? 10 : 30
	return margin = {top: 30, right: mr, bottom: 30, left: 20}
}
function getBarW(){
	if(widthUnder(768)){
		return window.innerWidth - 40;;	
	}
	else if(widthUnder(1085)){
		return window.innerWidth - 40;
	}
	else {
		return 1085;
	}
}
function getBarH(){
	return 260;
}
function getMapWidth(){
	if(widthUnder(400)){
		return window.innerWidth - 80
	}
	if(widthUnder(768)){
		return d3.min([621, window.innerWidth - 60])
	}
	else if(widthUnder(900)){
		return 570
	}else{
		return 621;
	}
}
function getBarData(chartData, indicator, unit, date){
	var indicatorData = chartData,
		key = getKey(indicator, unit),
		dataByDate = d3.nest()
			.key(function(d){ return d.date })
			.entries(indicatorData)

	var allGeographies = dataByDate.filter(function(d){ return d.key == date })[0].values,
		usData = allGeographies.filter(function(d){ return d.abbr == "US" }),
		stateData = allGeographies.filter(function(d){ return d.abbr != "US" }).sort(function(a, b){ return b[key] - a[key] })

	return {"US": usData, "states": stateData}
}
function getLineData(chartData, indicator, unit, states, startDate, endDate){
	var indicatorData = chartData,
		key = getKey(indicator, unit),
		dateFilteredData = indicatorData.filter(function(o){ return key in o }),
		extent = d3.extent(dateFilteredData, function(d){ if (states.indexOf(d.abbr) != -1) return d[key]}),
		dataByState = d3.nest()
			.key(function(d){ return d.abbr })
			.entries(dateFilteredData)


	return {"data": dataByState.filter(function(d){ return states.indexOf(d.key) != -1 })
	, "extent": extent }
}
function testTransition(){
	window.setTimeout(function(){
		if(isTransitioning()){
			return true
		}else{
			return false
		}
	}, 200)
}
function updateBarChart(indicator, unit, date){
	// d3.selectAll("rect.bar").transition()
	if(isTransitioning()){
		window.setTimeout(function(){
			if(testTransition()){
				testTransition()
			}else{
				updateBarChart(indicator, unit, date)
			}
		}, 200)
	}

	var chartData = getChartData()
	var allGeographies = getBarData(chartData, indicator, unit, date),

	data = allGeographies.states,
	usData = allGeographies.US

	var key = getKey(indicator, unit)


	var margin = getBarMargins(),
		w = getBarW(),
		h = getBarH(),
		width = w - margin.left - margin.right,
		height = h - margin.top - margin.bottom;

//TO BE UPDATED (abstract out to new func)
	var paddingInner = (widthUnder(768)) ? 0 : 0.1
	var align = (widthUnder(768)) ? 1 : 0.2
	var x = d3.scaleBand()
		.range([0, width])
		.paddingInner(paddingInner)
		.align(align)
		.paddingOuter(0.8);

	var y = d3.scaleLinear()
		.rangeRound([height, 0]);

	x.domain(data.map(
		function (d) {
			return d.abbr;
		})
	);

	var yMax = d3.max(data, function (d) { return d[key]; }),
		yMin = Math.min( 0, d3.min(data, function (d) { return d[key]; }) ),
		yRange = yMax - yMin,
		newYMin = (yMin == 0) ? 0 : yMin - (.2*yRange),
		newYMax = yMax + (.2 * yRange)
	y.domain([newYMin, newYMax]
	).nice();
//end update


	var colorScale = getColorScale(y, data, key)

	d3.select(".singleYear.tt-us")
		.text(function(){
			var prefix = ((indicator == "state_gdp" || indicator == "weekly_earnings") && unit == "raw") ? "$" : "",
				suffix = (unit == "change" || indicator == "unemployment_rate") ? "%" : ""
			return "United States " + prefix + formatValue(indicator, unit, usData[0][key]) + suffix
			
		})
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

	d3.selectAll(".usText")
		.data(usData)
		.transition()
		.duration(800)
			.attr("y", function (d) {
				return y(d[key]) + 4;
			})


	d3.selectAll(".barTooltip.active").transition().style("opacity",0)
	d3.selectAll(".barTooltipBg.active").transition().style("opacity",0)

	startTransition()
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
						.style("fill", function(d){ return colorScale(d[key])})
						.style("stroke", function(d){
							if(widthUnder(768)){
								return colorScale(d[key])
							}else{
								return "none"
							}
						})
						.on("end", function(d,j){
							if(i == 50){
								highlightStates(getParams().states)
								endTransition()
							}

						})
			})


	d3.select(".bar.x.axis")
		.transition()
		.duration(200)
			.call(d3.axisBottom(x))
			.selectAll(".tick")
			.delay(function(d, i){ return  i * 10 });
	var axisTransition = d3.select(".bar.y.axis")
		.transition()
		.duration(500)
			.call(d3.axisLeft(y).tickSize(-width).ticks(barTickCount).tickFormat(abbrevFormat))

		axisTransition.selectAll("text").attr("text-anchor", "start").attr("x", -1*getBarMargins().left)
		axisTransition.selectAll("line").attr("stroke", function(d,i){ return (d == 0) ? "#000" : "#dedddd" })


	updateMap(data, key, colorScale, y.ticks(barTickCount))

}
function updateMap(data, key, colorScale, ticks){
	data.forEach(function(d){
		d3.select(".ss-" + d.abbr)
			.classed("disabled", function(){
				return (getParams().indicator == "state_and_local_public_education_employment" && (d.abbr == "DC" || d.abbr == "HI" || d.abbr == "MO"))
			})
			.transition()
			.duration(800)
			.style("fill", function(){
				if(getParams().indicator == "state_and_local_public_education_employment" && (d.abbr == "DC" || d.abbr == "HI" || d.abbr == "MO")){
					return "#d2d2d2"
				}else{
					return colorScale(d[key])
				}
			})
	})

	var legend = d3.select("#mapLegend")
	buildMapLegend(legend, colorScale, ticks, getParams().indicator, false)
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

	var margin = getLineMargins(),
		width = getLineW() - margin.left - margin.right,
		height = getLineH() - margin.top - margin.bottom;

	var x = getLineX(startDate, endDate, width)
	var y = getLineY(extent, height)

	var oldStates = d3.selectAll(".state.line").data().map(function(o){ return o.key })
	var oldClicked = d3.selectAll(".state.line.clicked").data().map(function(o){ return o.key })

	var stateLabels = d3.select("#linesContainer")
		.selectAll(".stateLabel")
		.data(data, function(d) { return d.key; })
		
	stateLabels.exit()
		.transition()
		.style("opacity",0)
		.remove()

	var labelYPositions = []
	var stateLabel = stateLabels
		.enter()
		.insert("g", ".stateLabel")
		.merge(stateLabels)
		.attr("class", function(d){
			clickedClass = (oldClicked.indexOf(d.key) == -1) ? "" : " clicked"
			return d.key + " stateLabel" + clickedClass
		})
	stateLabel.sort(function(a, b){
		var aLast = a["values"].filter(function(o){ return o.date == endDate })[0]
		var bLast = b["values"].filter(function(o){ return o.date == endDate })[0]
		return y(aLast[key]) - y(bLast[key])
	})
	.transition()
		.attr("transform", function(d,i){

			var dLast = d["values"].filter(function(o){ return o.date == endDate })[0],
				yPosition = y(dLast[key])+4
			if(i == 0){
				labelYPositions.push(yPosition)
			}else{
				if(labelYPositions[i-1] + 14 >= yPosition){
					yPosition = labelYPositions[i-1] + 14
				}
				labelYPositions.push(yPosition)

			
			}
			return "translate(" + (width + 1) + "," + yPosition + ")"
		})

	stateLabel.selectAll("rect").remove()
	stateLabel.selectAll("text").remove()

	stateLabel.append("rect")
		.attr("x",-1)
		.attr("y",-12)
		.attr("width", 17)
		.attr("height", 16)

	stateLabel.append("text")
		.text(function(d){ return d.key })


	var lines = d3.select("#linesContainer")
		.selectAll(".state.line")
		.data(data, function(d) { return d.key; })

	lines.exit()
		.transition()
		.style("opacity",0)
		.remove()

	if(IS_IE()){
		lines.enter()
			.insert("path", ".state.line")
			.merge(lines)
				.attr("class",function(d){
					clickedClass = (oldClicked.indexOf(d.key) == -1) ? "" : " clicked"
					return d.key + " state line" + clickedClass
				})
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
					.attr('d', function (d) {
						var previous = d3.select(this).attr('d');

						var current = d3.line()
							.x(function(d) {
								return x(parseTime()(d.date));
							})
							.y(function(d) {
								return y(+d[key]);
							})(d.values)

						return current;
					});
	}else{
		lines.enter()
			.insert("path", ".state.line")
			.merge(lines)
				.attr("class",function(d){
					clickedClass = (oldClicked.indexOf(d.key) == -1) ? "" : " clicked"
					return d.key + " state line" + clickedClass
				})
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
					.attrTween('d', function (d) {
						var previous = d3.select(this).attr('d');

						var current = d3.line()
							.x(function(d) {
								return x(parseTime()(d.date));
							})
							.y(function(d) {
								return y(+d[key]);
							})(d.values)

						return d3.interpolatePath(previous, current);
					});
		}

	d3.select(".line.axis.x")
		.transition()
			.call(d3.axisBottom(x).ticks(getLineXTickCount("screen",startDate,endDate,indicator)))
			.selectAll("text").text(function(d, i){
				var md = moment(d)
				if(isQuarterly(indicator)){
					return "Q" + (md.month()/3 + 1) + " " + md.year()
				}else{
					return (md.month()+1) + "/" + md.year()
				}
				
			});

	if(data.length > 0){
		d3.select("#noStatesText")
			.style("display", "none")
			.transition()
				.style("opacity", 0)
				.on("end", function(){
					d3.select(this).style("display", "none")
				})

		var axisTransition = d3.select(".line.axis.y")
			.transition()
				.call(d3.axisLeft(y).tickSize(-width).ticks(lineTickCount).tickFormat(abbrevFormat))
		axisTransition.selectAll("text").attr("text-anchor", "start").attr("x", -1*getLineMargins().left)
		axisTransition.selectAll("line").attr("stroke", function(d,i){ return (d == 0) ? "#000" : "#dedddd" })
	}else{
		d3.select("#noStatesText")
			.style("display", "block")
			.transition()
				.style("opacity", 1)
	}
	



	var voronoi = d3.voronoi()
		.x(function(d) { return x(parseTime()(d.date)); })
		.y(function(d) { return y(d[key]); })
		.extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

	var voronoiGroup = d3.select(".voronoi");

	var vg = voronoiGroup.selectAll("path")
		.data(voronoi.polygons(d3.merge(data.map(function(d) { return d.values; }))))

	vg.exit().remove()

	d3.selectAll(".clicked").nodes().forEach(function(l){ l.parentNode.appendChild(l) })

	vg.enter().append("path")
		.merge(vg)
			.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
			.on("mouseover", function(d){ mouseoverLineChart(d, indicator, unit, startDate, endDate, extent, width, height) })
			.on("mouseout", mouseoutLineChart)
			.on("click", clickLineChart);
	
}
function updateIndicator(indicator, unit){
	var params = getParams(),
		states = params.states,
		indicator = (indicator) ? indicator : params.indicator,
		unit = (unit) ? unit : params.unit,
		states = params.states,
		startDate = params.startDate,
		endDate = params.endDate,
		section = getSection(indicator);
	
	d3.selectAll(".pu-section.hideable").classed("hide",true)
	d3.select(".pu-section." + section).classed("hide",false)

	d3.selectAll(".sectionName").classed("active", false)
	d3.select("#sn-" + section).classed("active", true)

	d3.selectAll(".tt-indicator").text(indicatorNames[indicator])
	d3.select("#pu-dlIndicator").text(indicatorNames[indicator])
	if(indicator == "state_and_local_public_education_employment"){
		d3.select(".singleYear.tt-indicator").classed("long",true)
	}else{
		d3.selectAll(".singleYear.tt-indicator").classed("long",false)
	}

	if(section == "employment"){
		d3.select(".employment.menuBlock").style("display", "block")
		d3.select(".other.menuBlock").style("display", "none")

		d3.select(".employment.menuBlock .menuActive").text(indicatorNames[indicator])

		d3.selectAll(".employmentOption").classed("active", false)
		d3.select("#eo-" + indicator).classed("active", true)
	}else{
		d3.select(".employment.menuBlock").style("display", "none")
		d3.select(".other.menuBlock").style("display", "block")

		d3.select(".other.menuBlock .menuActive").text(indicatorNames[indicator])
	}

	d3.select("#mobileStateIndicator").html(indicatorNames[indicator] + "  :: " )

	d3.select(".unitText.raw").text(indicatorRawLabel[indicator])
	d3.selectAll(".unitCheckBox.disabled").classed("disabled", false)
	d3.selectAll(".tooltipIcon").classed("hide", true)
	if(indicator == "unemployment_rate"){
		unit = "raw";
		d3.select(".unitCheckBox.change").classed("disabled", true)
		d3.select(".tooltipIcon.change").classed("hide", false)
	}
	else if(indicator == "house_price_index"){
		unit = "change";
		d3.select(".unitCheckBox.raw").classed("disabled", true)
		d3.select(".tooltipIcon.raw").classed("hide", false)
	}

	var key = getKey(indicator, unit),
		terminalDates = getTerminalDates(key),
		firstDate = terminalDates.firstDate,
		lastDate = terminalDates.lastDate,
		cleanDates = sanitizeDates(startDate, endDate, {"firstDate": firstDate, "lastDate": lastDate, "indicator": indicator} );

	d3.selectAll(".unitCheckBox").classed("active", false)
	d3.select(".unitCheckBox." + unit).classed("active", true)

	d3.select("#chartTitle").text(indicatorNames[indicator])
	d3.select("#chartUnits").html("(" + indicatorUnits[indicator][unit] + ")")
	if(indicator == "state_and_local_public_education_employment" && unit == "change"){
		d3.select("#chartUnits").classed("wrapUnit", true)
	}else{
		d3.select("#chartUnits").classed("wrapUnit", false)
	}

	if(isUSHidden() || ( unit == "raw" && indicator != "weekly_earnings" && indicator != "unemployment_rate")){
		if(states.indexOf("US") != -1){
			states.splice(states.indexOf("US"), 1)
		}
	}else{
		if(states.indexOf("US") == -1){
			states.push("US")
		}		
	}

	if(( unit == "raw" && indicator != "weekly_earnings" && indicator != "unemployment_rate")){
		d3.select("#hideUS").classed("disabled",true)
	}else{
		d3.select("#hideUS").classed("disabled",false)
	}


	d3.selectAll(".sourceLine").html(["<span>Source:</span>", sources[section]].join(""))

	setParams({"unit": unit, "states": states, "indicator": indicator, "startDate": cleanDates[0], "endDate": cleanDates[1], "firstDate": terminalDates.firstDate, "lastDate": terminalDates.lastDate })
	updateDateMenus({"startDate": cleanDates[0], "endDate": cleanDates[1]})
	buildLineDateMenu(cleanDates[0], cleanDates[1], "start")
	buildLineDateMenu(cleanDates[0], cleanDates[1], "end")
	buildBarDateMenus(cleanDates[1], terminalDates.lastDate)


	updateLineChart(indicator, unit, states, cleanDates[0], cleanDates[1])
	updateBarChart(indicator, unit, cleanDates[1])

	if(isQuarterly(indicator)){
		d3.select("#bcq-button").style("display", "block")
		d3.select("#bcm-button").style("display", "none")
		d3.select(".timeMenuLabel.month").style("display", "none")
		d3.select(".timeMenuLabel.quarter").style("display", "block")
	}else{
		d3.select("#bcm-button").style("display", "block")
		d3.select("#bcq-button").style("display", "none")
		d3.select(".timeMenuLabel.month").style("display", "block")
		d3.select(".timeMenuLabel.quarter").style("display", "none")
	}

	var hideNoData = (indicator == "state_and_local_public_education_employment")
	var hide = ["DC","HI","MO"]
	for(var i = 0; i < hide.length; i++){
		d3.selectAll("#stateName_" + hide[i]).classed("disabled", hideNoData)
		d3.selectAll(".bt-" + hide[i]).classed("disabled", hideNoData)
		d3.selectAll(".b-" + hide[i]).classed("disabled", hideNoData)
		d3.selectAll(".br-" + hide[i]).classed("disabled", hideNoData)
		d3.selectAll(".state.line." + hide[i]).classed("disabled", hideNoData)
		d3.selectAll(".stateLabel." + hide[i]).classed("disabled", hideNoData)
	}

}

function showChart(chartType){
	//have 2 divs for bar/line that slide in/out cleanly 
	var contentWidth = (widthUnder(1085)) ? window.innerWidth + 20 : d3.select("#chartAreaContainer").node().getBoundingClientRect().width
	if(widthUnder(1200)){
		d3.select("#singleYearContainer").style("width", getBarW() + "px")	
		d3.select("#multiYearContainer").style("width", getBarW() + "px")	
	}
	if(chartType == "line"){
		d3.select("#singleYearContainer")
			.classed("active", false)
			.transition()
			.style("margin-left", (-1*contentWidth) + "px")
		d3.select("#multiYearContainer").classed("active", true)

		d3.select(".multiYear.tooltip").transition().style("opacity",1)
		
		d3.select("#barControlContainer").style("display", "none")
		d3.select("#lineControlContainer").style("display", "block")

		d3.select(".menuActive.timeSingle").style("display", "none")
		d3.select(".menuActive.timeRange").style("display", "block")

		d3.select(".timeTypeContainer.bar img").attr("src", pathPrefix + "static/img/barIcon.png")
		d3.select(".timeTypeContainer.line img").attr("src", pathPrefix + "static/img/lineIconActive.png")

		d3.select("#pu-dlDateSingle").style("display", "none")
		d3.select("#pu-dlDateRange").style("display", "block")

	}else{
		d3.selectAll(".calendarParent").classed("visible", false)

		d3.select("#singleYearContainer")
			.classed("active", true)
			.transition()
			.style("margin-left", "0px")
		d3.select("#multiYearContainer").classed("active", false)

		d3.select(".multiYear.tooltip").transition().style("opacity",0)	
		
		d3.select(".menuActive.timeSingle").style("display", "block")
		d3.select(".menuActive.timeRange").style("display", "none")

		d3.select("#barControlContainer").style("display", "block")
		d3.select("#lineControlContainer").style("display", "none")

		d3.select(".timeTypeContainer.bar img").attr("src", pathPrefix + "static/img/barIconActive.png")
		d3.select(".timeTypeContainer.line img").attr("src", pathPrefix + "static/img/lineIcon.png")

		d3.select("#pu-dlDateSingle").style("display", "block")
		d3.select("#pu-dlDateRange").style("display", "none")
	}
	d3.selectAll(".timeTypeContainer").classed("active", false)
	d3.select(".timeTypeContainer." + chartType).classed("active", true)



}
function highlightStates(states, hoverState){

	if(widthUnder(768)){
		d3.select("#mobileStates").selectAll(".mobileState").remove()
		var mobileState = d3.select("#mobileStates")
			.selectAll(".mobileState")
			.data(states)
			.enter()
			.append("div")
			.attr("class", function(d){ return "mobileState mobileState_" + d })
		mobileState.append("div")
			.attr("class", "mobileStateName")
		mobileState.append("div")
			.attr("class", "mobileStateValue")
			// .text(function(d){ return d })
	}

	d3.selectAll(".stateShape").classed("clicked", false).classed("hovered", false)
	d3.selectAll(".bar").classed("clicked", false).classed("hovered", false)
	d3.selectAll(".barTooltip").classed("active", false).style("opacity", 0)
	d3.selectAll(".barTooltipBg").classed("active", false).style("opacity", 0)
	params = getParams();
	var allStates = d3.select("#stateNamesData").data()[0].filter(function(o){ return o.abbr != "US" }).map(function(o){ return o.abbr })

	for(var i = 0; i < allStates.length; i++){
		var state = allStates[i],
			newClass = (state == hoverState) ? "hovered" : "clicked"

		if(state == "US") continue

		var barState = d3.select(".b-" + state)

		if(states.indexOf(state) != -1){
			var mapState = d3.select(".ss-" + state)
			mapState.classed(newClass, true)
			mapState.node().parentNode.appendChild(mapState.node())

			d3.select(".bt-" + state).classed("active", true).style("opacity", 1)
			d3.select(".bt-" + state).classed("active", true).style("opacity", 1)
			d3.select(".br-" + state).classed("active", true).style("opacity", 1)
			d3.select(".br-" + state).classed("active", true).style("opacity", 1)


			
			barState.classed(newClass, true)
		}

		if(typeof(hoverState) != "undefined"){
			var mapHoverState = d3.select(".ss-" + hoverState)
			mapHoverState.node().parentNode.appendChild(mapHoverState.node())
		}

		var bval = barState.datum()[getKey(params.indicator, params.unit)],
			chars = formatValue(params.indicator, params.unit, bval).replace(".","").replace(",","").length,
			bx = +barState.attr("x") + .5*(+barState.attr("width")) + 3,
			by = (bval < 0) ?  +barState.attr("y") + +barState.attr("height") + ((chars-1)*5+2) : +barState.attr("y") - chars*5,
			brx = +barState.attr("x"),
			bry = (bval < 0) ?  +barState.attr("y") + +barState.attr("height") + 2  : +barState.attr("y") - 31;

		d3.select(".bt-" + state)
			.attr("x", bx)
			.attr("y", by)
			.attr("transform", "rotate(-90," + bx + "," + by + ")")
			.text(function(){
				return formatValue(params.indicator, params.unit, bval)
			})

		d3.select(".mobileState_" + state)
			.html(function(){
					var prefix = ((params.indicator == "state_gdp" || params.indicator == "weekly_earnings") && params.unit == "raw") ? "$" : "",
						suffix = (params.unit == "change" || params.indicator == "unemployment_rate") ? "%" : ""
					return getStateName(state) + " :: " + prefix + formatValue(params.indicator, params.unit, bval) + suffix

				// return getStateName(state) + " " + formatValue(params.indicator, params.unit, bval)
			})
		d3.select(".br-" + state)
			.attr("x", brx)
			.attr("y", bry)

		
		if( (((state == hoverState)) ||
			(states.length == 2 && state != "US" && states.indexOf("US") != -1) ||
			(states.length == 1 && states.indexOf("US") == -1)  ) && states.indexOf(state) != -1 ){
			
			if(state == hoverState){
				d3.selectAll(".stateDisplayName").text(getStateName(state))
				d3.select(".singleYear.tt-states").text(getStateName(state))
			}

			d3.select(".singleYear.tt-value")
				.style("opacity",1)
				.text(function(){
					var prefix = ((params.indicator == "state_gdp" || params.indicator == "weekly_earnings") && params.unit == "raw") ? "$" : "",
						suffix = (params.unit == "change" || params.indicator == "unemployment_rate") ? "%" : ""
					return prefix + formatValue(params.indicator, params.unit, bval) + suffix
					
				})
		}
	}




}
function popUp(selector){
	d3.select(".popupScreen")
		.style("display", "block")
		.transition()
		.style("opacity", 1)
	var pu = d3.select(".popupMenu." + selector)

	pu.style("display", "block")
	var h = pu.node().getBoundingClientRect().height,
		w = pu.node().getBoundingClientRect().width

	if(h > window.innerHeight - 20){
		d3.selectAll(".pu-bigButton").classed("shortScreen",true)
	}else{
		d3.selectAll(".pu-bigButton").classed("shortScreen",false)
	}

	pu.style("top", function(){
			if(h > window.innerHeight - 20 || widthUnder(768)){
				return "0px";
			}else{
				return "calc(50% - " + (h/2) + "px)"
			}
		})
		.style("height", function(){
			if(h > window.innerHeight - 20 || widthUnder(768)){
				var heightScootch = (selector == "saveImage") ? 0 : 60
				return (window.innerHeight - heightScootch) + "px";
			}else{
				return "auto"
			}
		})
		.classed("fullScreenPopup", function(){
			return h > window.innerHeight || widthUnder(768)
		})
		.style("border-left", function(){
			if(h > window.innerHeight || widthUnder(768)){
				return ((window.innerWidth - w)*.5) + "px solid #fff"
			}else{
				return "none"
			}
		})
		.style("border-right", function(){
			if(h > window.innerHeight || widthUnder(768)){
				return ((window.innerWidth - w)*.5) + "px solid #fff"
			}else{
				return "none"
			}
		})
		.transition()
		.style("opacity", 1)

	if(selector == "saveImage"){
		var chartData = getChartData(),
			topojsonData = getTopojsonData(),
			params = getParams();
		d3.select("#hiddenBarChartContainer").style("display", "block")
		d3.select("#hiddenBarChartContainer").selectAll("svg").remove()
		buildBarChart(chartData, topojsonData, params.indicator, params.unit, params.states, params.endDate, "hide")

		var activeButton = d3.select(".pu-ButtonRow .pu-smallButton.active")
		
		var opts = {"backgroundColor": "#ffffff", "encoderOptions": 1, "scale": 4 }

		d3.selectAll(".imgHidden").classed("imgHidden", false)

		if(activeButton.classed("imgBoth")){
			d3.selectAll(".imgBothHide").classed("imgHidden", true)
			d3.selectAll(".pu-chartName").text("map and bar chart")
		}
		else if(activeButton.classed("imgMap")){
			d3.selectAll(".imgMapHide").classed("imgHidden", true)
			opts.top = 317;
			opts.left = 226;
			opts.width = 635;
			opts.height = 416
			d3.selectAll(".pu-chartName").text("map")
		}
		else if(activeButton.classed("imgBar")){
			d3.selectAll(".imgBarHide").classed("imgHidden", true)
			opts.height = 368		
			d3.selectAll(".pu-chartName").text("bar chart")
		}

		d3.select(".pu-bigButton.imgDownload").datum(opts)

	}
}

function initControls(){

	d3.select("#headerTwitter")
		.on("mouseover", function(){
			d3.select(this).select("img").attr("src", "static/img/twitterHeaderHover.png")
		})
		.on("mouseout", function(){
			d3.select(this).select("img").attr("src", "static/img/twitterGrey.png")
		})

	d3.select("#headerEmail")
		.on("mouseover", function(){
			d3.select(this).select("img").attr("src", "static/img/emailHeaderHover.png")
		})
		.on("mouseout", function(){
			d3.select(this).select("img").attr("src", "static/img/emailGrey.png")
		})

	d3.select("#headerFacebook")
		.on("mouseover", function(){
			d3.select(this).select("img").attr("src", "static/img/facebookHeaderHover.png")
		})
		.on("mouseout", function(){
			d3.select(this).select("img").attr("src", "static/img/facebookGrey.png")
		})

//Initialize bar chart/line chart toggle buttons
	d3.selectAll(".timeTypeContainer")
		.on("click", function(){
			d3.event.stopPropagation();
			if(d3.select(this).classed("line")) showChart("line")
			else showChart("bar")
		})

//Initialize category, state, and time dropdown menu drawers
	d3.selectAll(".menuTop")
		.on("click", function(){
			d3.event.stopPropagation();
			if(d3.select(this).classed("open")){
				closeMenus("none")
			}else{
				var key = this.id.split("mt-")[1]
				closeMenus(key)

				var newImage = (widthUnder(768)) ? "static/img/none.png" : "static/img/dropdown-bg-active.png"

				d3.select(this).select(".menuArrow").attr("src", newImage)

				if(key == "state"){
					d3.select(".mobileMenuArrow").select(".menuArrow").attr("src", newImage)					
				}

				if(widthUnder(768)){
					d3.select("#menu-mobile-close").style("display","block")
					d3.select(this.parentNode)
						.classed("fullScreen",true)
					if(key == "time"){
						var pad = (window.innerWidth - 300)*.5
						d3.select(this.parentNode)
							.style("border-left", pad + "px solid #fff")
							.style("border-right", pad + "px solid #fff")
					}
				}else{
					d3.select(this.parentNode)
						.transition()
							.style("height", menuHeights[key] + "px")
							.style("border-left-color", "#d2d2d2")
							.style("border-right-color", "#d2d2d2")

					if(key == "employment"){
						d3.select(".menuSpacer.ms1")
							.transition()
						    	.style("border-left-color", "#d2d2d2")
	    						.style("border-bottom-color", "#d2d2d2")
					}
					else if(key == "state"){
						d3.select(".menuSpacer.ms2")
							.transition()
						    	.style("border-left-color", "#d2d2d2")
	    						.style("border-bottom-color", "#d2d2d2")
						d3.select(".menuSpacer.ms1")
							.transition()
						    	.style("border-right-color", "#d2d2d2")
					}
					else if(key == "time"){
						d3.select(".menuSpacer.ms2")
							.transition()
						    	.style("border-right-color", "#d2d2d2")
	    						.style("border-bottom-color", "#d2d2d2")
					}
				}

				d3.select(this).classed("open", true)
			}
		})
	d3.select(".mobileMenuArrow")
		.on("click", function(){
			d3.event.stopPropagation();
			var stateMenu = d3.select("#mt-state"),
				key = "state"

			if(stateMenu.classed("open")){
				closeMenus("none")
			}else{
				closeMenus(key)
				d3.select(stateMenu.node().parentNode)
					.transition()
						.style("height", menuHeights[key] + "px")
						.style("border-left-color", "#d2d2d2")
						.style("border-right-color", "#d2d2d2")

				d3.select(".menuSpacer.ms2")
					.transition()
				    	.style("border-left-color", "#d2d2d2")
						.style("border-bottom-color", "#d2d2d2")
				d3.select(".menuSpacer.ms1")
					.transition()
				    	.style("border-right-color", "#d2d2d2")
				stateMenu.classed("open", true)

			}

		})


//Initialize indicator tabs and menus
	d3.selectAll(".sectionName")
		.on("click", function(){
			if(d3.select(this).classed("active")){ return false }

			d3.selectAll(".sectionName").classed("active", false)
			d3.select(this).classed("active", true)

			var section = this.id.split("sn-")[1]
			if(section == "housing") updateIndicator("house_price_index", false)
			else if (section == "earnings") updateIndicator("weekly_earnings", false)
			else if(section == "gdp") updateIndicator("state_gdp", false)
			else{
				updateIndicator("unemployment_rate", false)
			}
		})

	d3.selectAll(".employmentOption")
		.on("click", function(){
			var indicator = this.id.split("eo-")[1]
			updateIndicator(indicator, false)
		})

//Initialize unit checkbox
	d3.selectAll(".unitCheckBox")
		.on("click", function(){
			if(d3.select(this).classed("disabled")){
				return false;
			}
			var unit = (d3.select(this).classed("raw")) ? "raw" : "change";
			updateIndicator(false, unit);
		})
	d3.selectAll(".tooltipIcon")
		.on("mouseover", function(){
			if(d3.select(this).classed("change")){
				d3.select(".tt-change").style("display","block")
				d3.select(".tt-raw").style("display","none")
			}else{
				d3.select(".tt-change").style("display","none")
				d3.select(".tt-raw").style("display","block")
			}
		})
		.on("mouseout", function(){
			d3.selectAll(".tt-unit").style("display","none")
		})

//Initialize date range inputs
	d3.selectAll(".lineMenuDisplay")
		.on("click", function(){
			d3.event.stopPropagation();
			var cal = (d3.select(this).classed("start")) ? d3.select(".calendarParent.startDate") : d3.select(".calendarParent.endDate")

			if(cal.classed("visible")){
				d3.selectAll(".calendarParent").classed("visible", false)
			}else{
				d3.selectAll(".calendarParent").classed("visible", false)
				cal.classed("visible", true)
			}
		})
	d3.selectAll(".calendarParent").on("click", function(){
		d3.event.stopPropagation()
	})
	d3.select(".chartButton.saveImage.bar").on("click", function(){
		d3.event.stopPropagation()
		popUp("saveImage")
	})
	d3.select(".chartButton.saveImage.line").on("click", function(){
		d3.event.stopPropagation()
		var chartData = getChartData(),	
			params = getParams();

		d3.select("#hiddenLineChartContainer").style("display", "block")
		buildLineChart(chartData, params.indicator, params.unit, params.states, params.startDate, params.endDate, "hide", function(){
				var clickedAbbrs = d3.selectAll(".stateLabel.clicked").data().map(function(d){ return d.key })
				for (var i = 0; i < clickedAbbrs.length; i++){
					clickLineChart({"data": {"abbr": clickedAbbrs[i] }}, "hide")	
				}
				
				var fileName = getFilename("line", params.indicator, params.unit, "png")
				saveSvgAsPng(document.getElementById("lineChartHide"), fileName, {backgroundColor: "#fff", "encoderOptions" : 1, "scale": 4 });
				d3.select("#lineChartHide").remove()	
		})
		

	})
	d3.selectAll(".chartButton.downloadData").on("click", function(){
		d3.event.stopPropagation()
		popUp("downloadData")
	})



//Initialize url share buttons{
	d3.selectAll(".chartButton.shareURL")
		.on("click", function(){
			d3.event.stopPropagation();
			if(d3.select(this).classed("active")){
				closeMenus("none")
			}else{
				closeMenus("shareChart")
				d3.select(this).classed("active", true)
				var tt = d3.select(this.parentNode).select(".shareTooltip")
				tt.classed("hidden", false)
				tt.select(".shareText").attr("value", buildShareURL())
			}
			
		})
	d3.selectAll(".shareText").on("click", function(){
		d3.event.stopPropagation();
	})
	d3.selectAll(".copyButton").on("click", function(){
		d3.event.stopPropagation();
		copyTextToClipboard(buildShareURL())
		d3.select(this.parentNode).select(".copiedText")
			.style("opacity",1)
			.transition()
			.delay(1500)
			.duration(1000)
			.style("opacity", 0)
	})

	d3.selectAll(".menuBlock").on("click", function(){
		d3.event.stopPropagation();
	})
//Save image pop up
	d3.select(".pu-bigButton.imgDownload")
		.datum({"backgroundColor": "#ffffff", "encoderOptions": 1, "scale": 4 })
	d3.selectAll(".pu-smallButton").on("click", function(){
		d3.event.stopPropagation();
		
		var d3This = d3.select(this)
		if(d3This.classed("active")) return false
		
		var opts = {"backgroundColor": "#ffffff", "encoderOptions": 1, "scale": 4 }

		d3.selectAll(".pu-smallButton").classed("active", false)
		d3This.classed("active", true)
		d3.selectAll(".imgHidden").classed("imgHidden", false)

		if(d3This.classed("imgBoth")){
			d3.selectAll(".imgBothHide").classed("imgHidden", true)
			d3.selectAll(".pu-chartName").text("map and bar chart")
		}
		else if(d3This.classed("imgMap")){
			d3.selectAll(".imgMapHide").classed("imgHidden", true)
			opts.top = 317;
			opts.left = 226;
			opts.width = 635;
			opts.height = 416
			d3.selectAll(".pu-chartName").text("map")
		}
		else if(d3This.classed("imgBar")){
			d3.selectAll(".imgBarHide").classed("imgHidden", true)
			opts.height = 368		
			d3.selectAll(".pu-chartName").text("bar chart")
		}

		d3.select(".pu-bigButton.imgDownload").datum(opts)
	})

	d3.select(".pu-bigButton.imgDownload").on("click", function(d){
		d3.event.stopPropagation();
		var params = getParams();
		var fileName = getFilename("bar", params.indicator, params.unit, "png")



		saveSvgAsPng(document.getElementById("barChartHide"), fileName, d);

	})
	d3.selectAll(".pu-checkRow").on("click", function(){
		d3.event.stopPropagation();
		var d3This = d3.select(this)

		d3.selectAll(".pu-checkBox").classed("active", false)
		d3This.select(".pu-checkBox").classed("active", true)
		

		if(d3This.classed("labelSelected")){
			showImgLabels(getParams().states)
		}
		else if(d3This.classed("labelAll")){
			showImgLabels("all")
		}
		else if(d3This.classed("labelNone")){
			showImgLabels("none")
		}
	})
	d3.select(".pu-close.saveImage").on("click", function(){
		d3.event.stopPropagation();
		closePopup("saveImage");
		d3.select("#hiddenBarChartContainer").selectAll("svg").remove()
	})
	d3.select("menu-mobile-close").on("click", function(){ closeMenus("none") })

//Download data pop up
	d3.selectAll(".pu-dlRow").on("click", function(){
		var cb = d3.select(this).select(".pu-checkBox"),
			button = d3.select(".pu-bigButton.dataDownload"),
			currentButton = d3.select(".pu-bigButton.dataDownloadCurrent")
			a = d3.select("#pu-downloadLink")

		if(cb.classed("active")){
			button.classed("disabled", true)
			currentButton.classed("disabled", true)
			a.classed("hidden", false)
			cb.classed("active", false)
			if(cb.classed("employment")){
				d3.selectAll(".employmentButton").classed("active", false)
			}
		}else{
			d3.selectAll(".pu-dlRow .pu-checkBox").classed("active", false)
			cb.classed("active", true)
			button.classed("disabled", false)

			if(cb.classed("current")){
				currentButton.classed("disabled",false)
				a.classed("hidden", true)
				d3.selectAll(".employmentButton").classed("active", false)

				var params = getParams(),
					chartType = (d3.select("#barControlContainer").style("display") == "block") ? "bar" : "line",
					filename = getFilename(chartType, params.indicator, params.unit, "csv")

				var data = getChartData()
					.filter(function(o){
						if(chartType == "bar"){
							return (params.states.indexOf(o.abbr) != -1 || o.abbr == "US") && o.date == getParams().endDate
						}else{
							return (params.states.indexOf(o.abbr) != -1 || o.abbr == "US") &&
							moment(o.date).isBetween(params.startDate, params.endDate, "day", '[]')
						}
					})
				var sectionFileName = (getSection(params.indicator) == "gdp") ? "state_gdp" : getSection(params.indicator)
				var args = makeCSV(data, params.indicator, params.unit, filename)
				var dictionaryFileName = "sem_" + sectionFileName + "_data_dictionary.txt"
				d3.text("static/data/dictionaries/" + dictionaryFileName).then(function(text) {
					if(getOS() == 'Windows'){
						args["dictionaryText"] = text.replace(/\n/g, '\r\n');	
					}else{
						args["dictionaryText"] = text
					}
					
				})

				args["dictionaryFileName"] = dictionaryFileName

				d3.select(".dataDownloadCurrent").datum(args)

				
			}else{
				currentButton.classed("disabled",true)
				a.classed("hidden", false)
				d3.selectAll(".employmentButton").classed("active", false)

				if(cb.classed("all")){
					a.attr("href","static/data/download/all_indicators-all_data.zip")
				}
				else if(cb.classed("housing")){
					a.attr("href", "static/data/download/housing-all_data.zip")
				}
				else if(cb.classed("gdp")){
					a.attr("href", "static/data/download/state_gdp-all_data.zip")
				}
				else if(cb.classed("earnings")){
					a.attr("href", "static/data/download/weekly_earnings-all_data.zip")	
				}
				else if(cb.classed("employment")){
					currentButton.classed("disabled",false)
					a.classed("hidden", true)

					d3.selectAll(".employmentButton").classed("active", true)
				}
			}



			

		}
	})

	d3.selectAll(".employmentButton").on("click", function(){
		var cb = d3.select(".pu-checkBox.employment"),
			button = d3.select(".pu-bigButton.dataDownload"),
			currentButton = d3.select(".pu-bigButton.dataDownloadCurrent")
			a = d3.select("#pu-downloadLink")
		
		d3.select(this).classed("active", !d3.select(this).classed("active"))
		d3.selectAll(".pu-checkBox").classed("active", false)

		if(d3.selectAll(".employmentButton.active").nodes().length == 0){
			button.classed("disabled", true)
			currentButton.classed("disabled", true)
			a.classed("hidden", false)
			cb.classed("active", false)
		}
		else if(d3.selectAll(".employmentButton.active").nodes().length == 7){
			button.classed("disabled", true)
			currentButton.classed("disabled", false)
			a.classed("hidden", true)
			cb.classed("active", true)
		}else{
			button.classed("disabled", true)
			currentButton.classed("disabled", false)
			a.classed("hidden", true)
			cb.classed("active", false)
		}
	})

	d3.select(".dataDownloadCurrent").on("click", function(args){
		var empButtons = d3.selectAll(".employmentButton.active")
		if(empButtons.nodes().length == 0){
			var zip = new JSZip();
			zip.file(args.filename, args.data, { binary: true, createFolders: true, binary: true });
			zip.file(args.dictionaryFileName, args.dictionaryText, { binary: true, createFolders: true, binary: true});

			  zip.generateAsync({
			  	type: "blob"
			  })
			  .then(function(blob) {
			  	saveAs(blob, args.filename.replace(".csv","") + ".zip");
			  });
 


			// downloadDataFile(args.data, args.filename , 'text/csv;encoding:utf-8');
			// downloadDataFile(args.dictionaryText, args.dictionaryFileName , 'text;encoding:utf-8');
		}
		else{
			empIds = empButtons.nodes().map(function(o){ return o.id.replace("eb-","") })
			downloadZipFile(empIds)
		}
	})

// 	$(".result-file .download.link").click(function(e){

// })

	d3.select(".pu-close.downloadData").on("click", function(){
		d3.event.stopPropagation();
		closePopup("downloadData");
	})

//close all menus on body click or esc key
	d3.select("body").on("click", function(){
		closeMenus("none")
	})

	window.addEventListener("keydown", function (event) {
	  if (event.defaultPrevented) {
	    return; // Should do nothing if the default action has been cancelled
	  }

	  var handled = false;
	  if (event.key == "Escape") {
	    // Handle the event with KeyboardEvent.key and set handled true.
	    closeMenus("none")
	    closePopup("all")
	    handled = true
	  }

	  if (handled) {
	    // Suppress "double action" if event handled
	    event.preventDefault();
	  }
	}, true);
}


function init(allData, topojsonData, stateNamesData){

	var qStates = getQueryString("states"),
		qIndicator = getQueryString("indicator"),
		qStartDate = getQueryString("start"),
		qEndDate = getQueryString("end"),
		qUnit = getQueryString("unit");

	var states, indicator, startDate, endDate, unit, activeChart, key, firstDate, lastDate, isDefault;

	if(qStates == "" && qIndicator == "" && qStartDate == "" && qEndDate == "" && qUnit == ""){
		var defaultCard = allData.cards[0]
		states = defaultCard.states
		indicator = defaultCard.indicator
		unit = defaultCard.unit
		endDate = defaultCard.endDate
		if(defaultCard.hasOwnProperty("startDate")){
			activeChart = "line"
			startDate = defaultCard.startDate
		}else{
			activeChart = "bar"
			startDate = defaultCard.endDate
		}

		key = getKey(indicator, unit)

		firstDate = allData["terminalDates"][key]["firstDate"]
		lastDate = allData["terminalDates"][key]["lastDate"]

		isDefault = true;

	}else{
		var states = (qStates == "") ? ["US"] : qStates.split("-"),
		indicator = (orderedIndicators.indexOf(qIndicator) == -1) ? defaultIndicator : qIndicator;

		if(states.indexOf("US") == -1) states.push("US")

		activeChart = (qStartDate == "") ? "bar" : "line";

		unit = (qUnit != "change" && qUnit != "raw") ? "change" : qUnit

		key = getKey(indicator, unit)

		firstDate = allData["terminalDates"][key]["firstDate"]
		lastDate = allData["terminalDates"][key]["lastDate"]

		endDate = (qEndDate == "") ? lastDate : getDateString(qEndDate.split("-")[0], qEndDate.split("-")[1])
		
		var endMoment = moment(endDate, defaultDateFormat, true)
		
		startDate = (qStartDate == "") ? endMoment.subtract(defaultLinechartMonthRange, "months").format(defaultDateFormat) : getDateString(qStartDate.split("-")[0], qStartDate.split("-")[1])

		isDefault = false;

	}


	var abbrs = stateNamesData.map(function(o){ return o.abbr}),
		states = states.filter(function(o){
			return abbrs.indexOf(o) != -1
		})

	cleanDates = sanitizeDates(startDate, endDate, {"indicator": indicator, "firstDate": firstDate, "lastDate": lastDate })

	startDate = cleanDates[0]
	endDate = cleanDates[1]

	d3.select("#chartData").data([allData.data])
	d3.select("#topojsonData").data([topojsonData])
	d3.select("#terminalDatesData").data([allData.terminalDates])
	d3.select("#stateNamesData").data([stateNamesData])

	d3.select("#lastUpdated").text(allData["lastUpdated"])

	showChart(activeChart)
	initControls()

	buildCards(allData.cards, isDefault)
	buildBarChart(allData.data, topojsonData, indicator, unit, states, endDate, "screen")
	buildLineChart(allData.data, indicator, unit, states, startDate, endDate, "screen", function(){})
	setParams({"indicator": indicator, "unit": unit, "states": states, "startDate": startDate, "endDate": endDate, "init": true, "firstDate": firstDate, "lastDate": lastDate})
	buildBarDateMenus(endDate, lastDate)
	buildLineDateMenu(startDate, endDate, "start")
	buildLineDateMenu(startDate, endDate, "end")
	buildStateMenu(stateNamesData, states)
	updateSelectedStates(states)
	highlightStates(states)

	updateIndicator(indicator, unit)

	if(IS_IE()){
		d3.select("#chartAreaContainer").style("overflow-y", "hidden")
		d3.selectAll(".card").style("height","230px")
	}
}

d3.json(pathPrefix + "static/data/figures/data.json").then(function(allData){
	d3.json(pathPrefix + "static/data/mapping/states.json").then(function(topojsonData){
		d3.csv(pathPrefix + "static/data/mapping/state_fips.csv").then(function(stateNamesData){
			init(allData, topojsonData, stateNamesData)
		})
	})
})
