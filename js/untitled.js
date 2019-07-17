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
function setParams(params){
	if(typeof(params.init) != "undefined"){
		d3.select("#paramData").data([ params ])
	}else{
		var d = d3.select("#paramData").data()[0]
		const keys = Object.keys(params)
		for (const key of keys) {
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
	indicators = ["federal_public_employment", "house_price_index", "private_employment", "public_employment", "state_and_local_public_employment", "state_gdp", "total_employment", "unemployment_rate", "weekly_earnings","state_and_local_public_education_employment"]

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
function sanitizeDates(startDate, endDate, opts){
	var params = getParams()
	var startMoment = moment(startDate),
		endMoment = moment(endDate),
		firstMoment = (opts.hasOwnProperty("firstDate")) ? moment(opts.firstDate) : moment(params.firstDate),
		lastMoment = (opts.hasOwnProperty("lastDate")) ? moment(opts.lastDate) : moment(params.lastDate);
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
			for(var i = lastMonth; i <= 12; i++){
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
		change: function(event, d){
			var params = getParams(),
				endMonth = +params.endDate.split("-")[1],
				endString = getDateString(endMonth, +d.item.value),
				cleanDates = sanitizeDates(params.startDate, endString, {});

			disableBarMenuMonths(d.item.value, params.lastDate)
			updateBarChart(params.indicator, params.unit, cleanDates[1])
			setParams({"endDate": cleanDates[1], "startDate": cleanDates[0] })
			updateDateMenus({"startDate": cleanDates[0], "endDate": cleanDates[1]})
		}
	})

	$(".dateMenu.barChart.year" ).selectmenu("refresh")

	$(".dateMenu.barChart.month" ).selectmenu({
		change: function(event, d){
			var params = getParams(),
				endYear = +params.endDate.split("-")[0],
				endString = getDateString(+d.item.value, endYear),
				cleanDates = sanitizeDates(params.startDate, endString, {});

			updateBarChart(params.indicator, params.unit, cleanDates[1])
			setParams({"endDate": cleanDates[1], "startDate": cleanDates[0] })
			updateDateMenus({"startDate": cleanDates[0], "endDate": cleanDates[1]})
		}
	})

	$(".dateMenu.barChart.quarter" ).selectmenu({
		change: function(event, d){
			var params = getParams(),
				endYear = +params.endDate.split("-")[0],
				endString = getDateString(+d.item.value, endYear),
				cleanDates = sanitizeDates(params.startDate, endString, {});

			updateBarChart(params.indicator, params.unit, cleanDates[1])
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
		lastYear = +lastDate.split("-")[0],
		lastMonth = +lastDate.split("-")[1],
		startYear = +startDate.split("-")[0],
		endYear = +endDate.split("-")[0],
		startMonth = +startDate.split("-")[1],
		endMonth = +endDate.split("-")[1],
		yearRange = moment(lastDate).diff(firstDate, "years"),
		data = Array(yearRange + 1).fill(monthAbbrs),
		menuSelector = (menu == "start") ? ".calendarContainer.startDate" : ".calendarContainer.endDate";

		d3.select(menuSelector).selectAll("*").remove()



		var leftArrow = d3.select(menuSelector)
			.append("div")
			.attr("class", "left calendarArrow")
		leftArrow.append("img")
			.attr("src", "img/calendarArrow.png")
		leftArrow.on("click", function(){
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


		yearContainer.append("div")
			.attr("class", function(d, i){
				var active = (startYear <= (i + firstYear) && endYear >= (i + firstYear)) ? " active" : ""
				return "calYearLabel" + active
			})
			.text(function(d,i){ return i + firstYear })

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
						else if(month >= startMonth) calClass += " disabled"
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

					}

				})

		var rightArrow = d3.select(menuSelector)
			.append("div")
			.attr("class", "right calendarArrow")
		rightArrow.append("img")
			.attr("src", "img/calendarArrow.png")
		rightArrow.on("click", function(){
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
}
function updateSelectedStates(states, hoverState){
	var nonUS = states.filter(function(o){ return o != "US" })
	var params = getParams();
	d3.selectAll(".stateName").classed("active", false)
	for(var i = 0; i < nonUS.length; i++){
		s = nonUS[i]
		d3.select("#stateName_" + s).classed("active", true)
	}
	if(nonUS.length > 1){
		d3.selectAll(".stateDisplayName").text(multipleStatesText)
	}
	else if(nonUS.length == 0){
		d3.selectAll(".stateDisplayName").text(noStatesText)
	}
	else{
		d3.selectAll(".stateDisplayName").text(getStateName(nonUS[0]))
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
		lastMonth = +lastDate[1];


	if(opts.hasOwnProperty("startDate")){
		var startDate = opts.startDate,
			endDate = opts.endDate,
			startYear = +startDate.split("-")[0],
			endYear = +endDate.split("-")[0],
			startMonth = +startDate.split("-")[1],
			endMonth = +endDate.split("-")[1];

		d3.select(".menuActive.timeRange").html(monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear)

		d3.select(".lineMenuDate.start").text(startMonth + "/" + startYear)

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
					else if(month >= startMonth) calClass += " disabled"
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

		d3.select(".menuActive.timeRange").html(monthFull[startMonth - 1] + " " + startYear + "&ndash;" + monthFull[endMonth - 1] + " " + endYear)
		d3.select(".menuActive.timeSingle").html(monthFull[endMonth - 1] + " " + endYear)

		d3.select(".lineMenuDate.end").text(endMonth + "/" + endYear)	

		disableBarMenuMonths(endYear, lastDate)

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
					else if(month >= startMonth) calClass += " disabled"
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

function buildShareURL(params){
	// states, indicator, unit, startDate, endDate
	return ""

}
function buildTwitterURL(url, text){
	return ""
}
function buildFacebookURL(url, text){
	return ""

}
function buildCards(cardData){
	var card = d3.select("#cardContentContainer")
		.selectAll(".card")
		.data(cardData)
		.enter().append("div")
		.attr("class", "card")
		.style("background-color", function(d,i){
			var bgColors = ["#1696d2", "#46ABDB"]
			return bgColors[i%2]
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
		.on("click", function(d){
			$("html, body").animate({ scrollTop: $('#sectionNames').offset().top - 20 }, 1000);

			var copy = JSON.parse(JSON.stringify(d))
			var params = ["indicator", "startDate", "endDate", "unit", "states"]
			if(copy.hasOwnProperty("startDate")) showChart("line")
			else showChart("bar")

			setParams(copy)
			updateSelectedStates(copy.states)
			updateIndicator(d.indicator)
		})

	bottomRow.append("div")
		.attr("class", "cardFacebookButton")
		.append("a")
			.attr("href", function(d){
				return buildFacebookURL( buildShareURL(d), d.text )
			})
			.attr("target", "_blank")
			.attr("title", "Facebook")
			.append("span")
				.attr("class", "cardFacebookImg")

	bottomRow.append("div")
		.attr("class", "cardTwitterButton")
		.append("a")
			.attr("href", function(d){
				return buildTwitterURL( buildShareURL(d), d.text )
			})
			.attr("target", "_blank")
			.attr("title", "Tweet")
			.append("span")
				.attr("class", "cardTwitterImg")

	var wellWidth = d3.select("#cardContentContainer").node().getBoundingClientRect().width,
		cardCount = cardData.length,
		cardWidth = 342;
	
	if(cardCount * cardWidth > wellWidth) d3.select(".cardArrow.right").style("display", "block")

	d3.select(".cardArrow.left")

	d3.select(".cardArrow.right")
		.on("click", function(){
			var progress = Math.abs(Math.round(+(d3.select(".card").style("left").replace("px",""))/cardWidth))
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

	if(containerType == "screen"){
		var margin = getBarMargins(),
			w = getBarW(),
			h = getBarH(),
			width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
		var svg = d3.select("#barChartContainer").append("svg").attr("id", "barChartScreen").attr("width", w).attr("height", h)
	}else{
		var margin = getBarMargins(),
			w = BAR_IMG_WIDTH,
			h = BAR_IMG_HEIGHT,
			width = w - margin.left - margin.right,
			height = h - margin.top - margin.bottom;
		var svg = d3.select("#hiddenBarChartContainer").append("svg").attr("id", "barChartHide").attr("width", w).attr("height", h + MAP_IMG_WIDTH *.6)
	}

	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleBand()
		.rangeRound([0, width])
		.padding(0.1)
		.domain(data.map(function (d) {
			return d.abbr;
		}));

	var y = d3.scaleLinear()
		.rangeRound([height, 0])
		.domain(
			[
				Math.min(
					0,
					d3.min(data,function (d) {
						return d[key];
					})
				),
				d3.max(data, function (d) {
					return d[key];
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
	g.selectAll(".usText")
		.data(usData)
		.enter().append("text")
			.attr("class", "usText")
			.attr("x", width-x.bandwidth() + 2)
			.attr("text-anchor", "start")
			.attr("y", function (d) {
				return y(d[key]) + 4;
			})
			.text("US")

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


	g.selectAll("text.barTooltip")
		.data(data)
		.enter().append("text")
			.attr("class", function(d){
				var active = (states.indexOf(d.abbr) == -1) ? "" : " active"
				var download = (containerType == "screen") ? "" : " download"
				return "barTooltip bt-" + d.abbr + active + download;
			})
			.attr("x", function (d, i) {
				return x(d.abbr) + .5*x.bandwidth() + 4;
			})
			.attr("y", function (d) {
				return (+d[key] > 0) ? y(+d[key]) - 15 : y(0) + Math.abs(y(+d[key]) - y(0)) + 20
			})
			.attr("transform",function(d){
				var bx = x(d.abbr) + .5*x.bandwidth() + 4,
					by = (+d[key] > 0) ? y(+d[key]) - 15 : y(0) + Math.abs(y(+d[key]) - y(0)) + 20;
				return "rotate(-90," + bx + "," + by + ")"
			})
			.text(function(d){
				return d3.format(indicatorFormatStrings[indicator][unit])(d[key])
			})

	// var barState = d3.select(".b-" + state)
	// barState.classed(newClass, true)

	// var bval = barState.datum()[getKey(params.indicator, params.unit)],
	// 	bx = +barState.attr("x") + .5*(+barState.attr("width")) + 3,
	// 	by = (bval < 0) ?  +barState.attr("y") + +barState.attr("height") + 20  : +barState.attr("y") - 15;

	// d3.select(barState.node().parentNode).append("text")
	// 	.attr("class","barTooltip bt-" + state)
	// 	.attr("x", bx)
	// 	.attr("y", by)
	// 	.attr("transform", "rotate(-90," + bx + "," + by + ")")
	// 	.text(function(){
	// 		return d3.format(indicatorFormatStrings[indicator][unit])(bval)
	// 	})



	if(containerType == "screen"){
		buildMap(data, topojsonData, key, colorScale, y.ticks(barTickCount), false)
	}else{

		buildMap(data, topojsonData, key, colorScale, y.ticks(barTickCount), svg)
	}
}
function buildMapLegend(legend, colorScale, ticks, svgInput){
	legend.selectAll("*").remove()

	var colorRange = colorScale.range(),
		colorDomain = colorScale.domain(),
		keyWidth = 12,
		keyHeight = 20,
		width = getMapWidth(),
		height = .6 * width,
		translateX = (svgInput) ? 800 : width - keyWidth - 40,
		translateY = (svgInput) ? 500 : height - colorRange.length * keyHeight - 10

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
}
function buildMap(data, topojsonData, key, colorScale, ticks, svgInput){
	if(!svgInput){
	//TO BE UPDATED, abstract out to new function
		var width = getMapWidth(),
			height = .6 * width
	//end update

		var svg = d3.select("#mapContainer")
			.style("width", width + "px")
			.insert("svg", "#chartButtonContainer")
				.attr("width", width)
				.attr("height", height)
				.append("g");

		var projection = d3.geoAlbersUsa()
			.scale(1.2 * width)
			.translate([width/2, height/2]);
	}else{
		var width = MAP_IMG_WIDTH,
			height = .6 * width

		svg = svgInput.append("g")

		var projection = d3.geoAlbersUsa()
			.scale(1.2 * width)
			.translate([BAR_IMG_WIDTH/2, BAR_IMG_HEIGHT + 200]);
	}


	var path = d3.geoPath()
		.projection(projection);

	topojsonData.objects.states.geometries.forEach(function(u){
		u["properties"]["values"] = data.filter(function(o){ return o.abbr == u.properties.postal })[0]
	})

	svg.selectAll("path.stateShape")
		.data(topojson.feature(topojsonData, topojsonData.objects.states).features)
		.enter().append("path")
			.attr("class", function(d){ return "stateShape ss-" + d.properties.postal })
			.style("fill", function(d){
				return colorScale(d["properties"]["values"][key])
			})
			.attr("d", path)
			.on("mouseover", function(d){
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

	buildMapLegend(legend, colorScale, ticks, svgInput)


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
		function drawMapElbow(x1, x2, y1, y2, s){
			// if(direction == "right"){
				s.append("line")
					.attr("x1", x1)
					.attr("x2", x2)
					.attr("y1", y1)
					.attr("y2", y1)
					.attr("class", "mapImgLine")

				s.append("line")
					.attr("x1", x2)
					.attr("x2", x2)
					.attr("y1", y1)
					.attr("y2", y2)
					.attr("class", "mapImgLine")
			// }else{
			// 	s.append("line")
			// 		.attr("x1", x1)
			// 		.attr("x2", x1)
			// 		.attr("y1", y1)
			// 		.attr("y2", y2)
			// 		.attr("class", "mapImgLine")

			// 	s.append("line")
			// 		.attr("x1", x1)
			// 		.attr("x2", x2)
			// 		.attr("y1", y2)
			// 		.attr("y2", y2)
			// 		.attr("class", "mapImgLine")
			// }

		}
		function drawMapLine(x1, x2, y1, s){
			s.append("line")
				.attr("x1", x1)
				.attr("x2", x2)
				.attr("y1", y1)
				.attr("y2", y1)
				.attr("class", "mapImgLine")
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


		var params = getParams()

		svg.append("g")
			.selectAll("text.mapName")
			.data(topojson.feature(topojsonData, topojsonData.objects.states).features)
			.enter()
			.append("text")
				.attr("class", "mapName mapLabel")
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
				.attr("class", "mapVal mapLabel")
				.text(function(d){
					var mval = d["properties"]["values"][key]
					return d3.format(indicatorFormatStrings[params.indicator][params.unit])(mval)
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

		drawMapLine(745, 757, 419, svg)
		drawMapLine(743, 757, 432, svg)
		drawMapLine(723, 736, 457, svg)
		drawMapLine(710, 731, 469, svg)
		drawMapElbow(737, 733, 445, 437, svg)
		drawMapElbow(691, 726, 474, 477, svg)
		drawMapElbow(718, 711, 493, 485, svg)

		// drawMapLine(745, 757, 419, svg)

		var allStates = d3.select("#stateNamesData").data()[0].filter(function(o){ return o.abbr != "US" }).map(function(o){ return o.abbr })
		highlightStates(allStates)

	}
}
function getColorScale(y, data, key){
	var tickBreaks = y.ticks(barTickCount),
		colorBreaks = [],
		vals = data.map(function(o){ return o[key]}).reverse(),
		step = (tickBreaks.length > 10) ? 2 : 1

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
function buildLineChart(chartData, indicator, unit, states, startDate, endDate){
//ADD FUNCTIONALITY
	//if active, show linecontainer by default and hide barcontainer

	var dataObj = getLineData(chartData, indicator, unit, states, startDate, endDate),
		data = dataObj.data,
		extent = dataObj.extent,
		key = getKey(indicator, unit)

	var margin = getLineMargins(),
		width = getLineW() - margin.left - margin.right,
		height = getLineH() - margin.top - margin.bottom;


	var svg = d3.select("#lineChartContainer")
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)

	var g = svg.append("g")
		.attr("id", "linesContainer")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.attr("transform","translate(" + margin.left + "," + margin.top + ")");

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
		.call(d3.axisBottom(x).ticks(9));

	var axisSelection = g.append("g")
		.attr("class", "line axis y")
		.call(d3.axisLeft(y).tickSize(-width).ticks(lineTickCount).tickFormat(abbrevFormat))

	axisSelection.selectAll("text").attr("text-anchor", "start").attr("x", -1*getLineMargins().left)
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
			.on("mouseover", function(d){ mouseoverLineChart(d, key, startDate, endDate, extent, width, height) })
			.on("mouseout", mouseoutLineChart);
}
function getLineX(startDate, endDate, width){
	var x = d3.scaleTime()
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
function getLineMargins(){
	return margin = {top: 0, right: 30, bottom: 30, left: 30}
}
function getLineW(){
	return 1100;
}
function getLineH(){
	return 520;
}
function mouseoverLineChart(d, key, startDate, endDate, extent, width, height) {
	if (parseTime()(startDate).getTime() > parseTime()(d.data.date).getTime() || parseTime()(endDate).getTime() < parseTime()(d.data.date)){
		return false;
	}

	var x = getLineX(startDate, endDate, width)
	var y = getLineY(extent, height)

	d3.select(".linechartDot")
		.style("opacity",1)
		.attr("cx", x(parseTime()(d.data.date)))
		.attr("cy",y(d["data"][key]))
}
function mouseoutLineChart(d) {
	d3.select(".linechartDot").style("opacity",0)
}
function getBarMargins(){
	return margin = {top: 10, right: 30, bottom: 30, left: 20}
}
function getBarW(){
	return 1100;
}
function getBarH(){
	return 260;
}
function getMapWidth(){
	return 621;
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
function updateBarChart(indicator, unit, date){
	// d3.selectAll("rect.bar").transition()

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

	d3.selectAll(".usText")
		.data(usData)
		.transition()
		.duration(800)
			.attr("y", function (d) {
				return y(d[key]) + 4;
			})


	d3.selectAll(".barTooltip.active").transition().style("opacity",0)




		// d3.select(barState.node().parentNode).append("text")
		// 	.attr("class","barTooltip")
		// 	.attr("x", bx)
		// 	.attr("y", by)
		// 	.attr("transform", "rotate(-90," + bx + "," + by + ")")
		// 	.text(function(){
		// 		return d3.format(indicatorFormatStrings[params.indicator][params.unit])(barState.datum()[getKey(params.indicator, params.unit)])
		// 	})

	d3.selectAll("rect.bar")
		.transition()
		.duration(200)
		.delay(function(d, i){ return i*10})
			.attr("x", function (d) {
				return x(d.abbr);
			})
			.on("interrupt", function(d, i){
				// d3.selectAll("rect.bar").transition()
				// d3.select(this)
				// 				.attr("x", function (d) {
				// 		return x(d.abbr);
				// 	})
					
				// 	.datum(data.filter(function(o){ return o.abbr == d.abbr })[0])
	
				// 	.attr("y", function (d) {
				// 		return y( Math.max(0, +d[key]) );
				// 	})
				// 	.attr("height", function (d) {
				// 		return Math.abs(y(d[key]) - y(0));
				// 	})
				// 	.style("fill", function(d){ return colorScale(d[key])});
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
						.on("end", function(d,i){
							highlightStates(getParams().states)

							// d3.selectAll(".barTooltip.active").transition().style("opacity",1)
						})
						.on("interrupt", function(d, i){
							// d3.selectAll("rect.bar").transition()
							// d3.select(this)
							// 	// .datum(data.filter(function(o){ return o.abbr == d.abbr })[0])
							// 	.attr("x", function (d) {
							// 		return x(d.abbr);
							// 	})
								
							// 	.attr("y", function (d) {
							// 		return y( Math.max(0, +d[key]) );
							// 	})
							// 	.attr("height", function (d) {
							// 		return Math.abs(y(d[key]) - y(0));
							// 	})
							// 	.style("fill", function(d){ return colorScale(d[key])});
						})
			})

							// d3.selectAll("text.barTooltip")
							// 		.attr("x", function (d, i) {
							// 			return x(d.abbr) + .5*x.bandwidth() + 4;
							// 		})
							// 	.data(data)
							// 	.transition()

							// 		.attr("y", function (d) {
							// 			return (+d[key] > 0) ? y(+d[key]) - 15 : y(0) + Math.abs(y(+d[key]) - y(0)) + 20
							// 		})
							// 		.attr("transform",function(d){
							// 			var bx = x(d.abbr) + .5*x.bandwidth() + 4,
							// 				by = (+d[key] > 0) ? y(+d[key]) - 15 : y(0) + Math.abs(y(+d[key]) - y(0)) + 20;
							// 			return "rotate(-90," + bx + "," + by + ")"
							// 		})
							// 		.text(function(d){
							// 			return d3.format(indicatorFormatStrings[indicator][unit])(d[key])
							// 		})

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
	// var us = getTopojsonData()

	// us.objects.states.geometries.forEach(function(u){
	// 	u["properties"]["values"] = data.filter(function(o){ return o.abbr == u.properties.postal })[0]
	// })

	// d3.selectAll("path.stateShape")
	// 	.data(topojson.feature(us, us.objects.states).features)
	// 	.transition()
	// 		.duration(800)
	// 		.style("fill", function(d){
	// 			return colorScale(d["properties"]["values"][key])
	// 		})
	data.forEach(function(d){
		d3.select(".ss-" + d.abbr)
			.transition()
			.duration(800)
			.style("fill", colorScale(d[key]))
	})

	var legend = d3.select("#mapLegend")
	buildMapLegend(legend, colorScale, ticks, false)
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
.attrTween('d', function (d) {
var previous = d3.select(this).attr('d');

var current = d3.line()
.x(function(d) {
return x(parseTime()(d.date));
})
.y(function(d) {
return y(+d[key]); })
(d.values)
// })

return d3.interpolatePath(previous, current);
});

	d3.select(".line.axis.x")
		.transition()
			.call(d3.axisBottom(x).ticks(9))
			.selectAll("text").text(function(d, i){
				if(isQuarterly(indicator)){
					return "q"
				}else{
					return moment(d).year
				}
				console.log(moment(d))
			});

	var axisTransition = d3.select(".line.axis.y")
		.transition()
			.call(d3.axisLeft(y).tickSize(-width).ticks(lineTickCount).tickFormat(abbrevFormat))
	
	axisTransition.selectAll("text").attr("text-anchor", "start").attr("x", -1*getLineMargins().left)
	axisTransition.selectAll("line").attr("stroke", function(d,i){ return (d == 0) ? "#000" : "#dedddd" })



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
function updateIndicator(indicator, unit){
	var params = getParams(),
		states = params.states,
		indicator = (indicator) ? indicator : params.indicator,
		unit = (unit) ? unit : params.unit,
		states = params.states,
		startDate = params.startDate,
		endDate = params.endDate,
		section = getSection(indicator);
	
	d3.selectAll(".sectionName").classed("active", false)
	d3.select("#sn-" + section).classed("active", true)
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

	d3.select(".unitText.raw").text(indicatorRawLabel[indicator])
	d3.selectAll(".unitCheckBox.disabled").classed("disabled", false)
	if(indicator == "unemployment_rate"){
		unit = "raw";
		d3.select(".unitCheckBox.change").classed("disabled", true)
	}
	else if(indicator == "house_price_index"){
		unit = "change";
		d3.select(".unitCheckBox.raw").classed("disabled", true)
	}

	var key = getKey(indicator, unit),
		terminalDates = getTerminalDates(key),
		firstDate = terminalDates.firstDate,
		lastDate = terminalDates.lastDate,
		cleanDates = sanitizeDates(startDate, endDate, {"firstDate": firstDate, "lastDate": lastDate} );

	d3.selectAll(".unitCheckBox").classed("active", false)
	d3.select(".unitCheckBox." + unit).classed("active", true)

	d3.select("#chartTitle").text(indicatorNames[indicator])
	d3.select("#chartUnits").html("(" + indicatorUnits[indicator][unit] + ")")

	if(unit == "raw" && indicator != "weekly_earnings" && indicator != "unemployment_rate"){
		states.splice(states.indexOf("US"), 1)
	}else{
		if(states.indexOf("US") == -1){
			states.push("US")
		}		
	}

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

}

function showChart(chartType){
	//have 2 divs for bar/line that slide in/out cleanly 
	var contentWidth = d3.select("#chartAreaContainer").node().getBoundingClientRect().width
	if(chartType == "line"){
		d3.select("#singleYearContainer")
			.transition()
			.style("margin-left", (-1*contentWidth) + "px")
		
		d3.select("#barControlContainer").style("display", "none")
		d3.select("#lineControlContainer").style("display", "block")

		d3.select(".menuActive.timeSingle").style("display", "none")
		d3.select(".menuActive.timeRange").style("display", "block")

		d3.select(".timeTypeContainer.bar img").attr("src", "img/barIcon.png")
		d3.select(".timeTypeContainer.line img").attr("src", "img/lineIconActive.png")

	}else{
		d3.select("#singleYearContainer")
			.transition()
			.style("margin-left", "0px")
		
		d3.select(".menuActive.timeSingle").style("display", "block")
		d3.select(".menuActive.timeRange").style("display", "none")

		d3.select("#barControlContainer").style("display", "block")
		d3.select("#lineControlContainer").style("display", "none")

		d3.select(".timeTypeContainer.bar img").attr("src", "img/barIconActive.png")
		d3.select(".timeTypeContainer.line img").attr("src", "img/lineIcon.png")
	}
	d3.selectAll(".timeTypeContainer").classed("active", false)
	d3.select(".timeTypeContainer." + chartType).classed("active", true)



}
function highlightStates(states, hoverState){
	setParams(states)

	d3.selectAll(".stateShape").classed("clicked", false).classed("hovered", false)
	d3.selectAll(".bar").classed("clicked", false).classed("hovered", false)
	d3.selectAll(".barTooltip").classed("active", false).style("opacity", 0)
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


			
			barState.classed(newClass, true)
		}

		if(typeof(hoverState) != "undefined"){
			var mapHoverState = d3.select(".ss-" + hoverState)
			mapHoverState.node().parentNode.appendChild(mapHoverState.node())
		}

		var bval = barState.datum()[getKey(params.indicator, params.unit)],
			bx = +barState.attr("x") + .5*(+barState.attr("width")) + 3,
			by = (bval < 0) ?  +barState.attr("y") + +barState.attr("height") + 20  : +barState.attr("y") - 15;

		d3.select(".bt-" + state)
			.attr("x", bx)
			.attr("y", by)
			.attr("transform", "rotate(-90," + bx + "," + by + ")")
			.text(function(){
				return d3.format(indicatorFormatStrings[params.indicator][params.unit])(bval)
			})
	}




}
function popUp(selector){
	var chartData = getChartData(),
		topojsonData = getTopojsonData(),
		params = getParams();
	d3.select("#hiddenBarChartContainer").style("display", "block")
	buildBarChart(chartData, topojsonData, params.indicator, params.unit, params.states, params.endDate, "hide")
}

function initControls(){
//Initialize bar chart/line chart toggle buttons
	d3.selectAll(".timeTypeContainer")
		.on("click", function(){
			if(d3.select(this).classed("line")) showChart("line")
			else showChart("bar")
		})

//Initialize category, state, and time dropdown menu drawers
	d3.selectAll(".menuTop")
		.on("click", function(){
			if(d3.select(this).classed("open")){
				d3.select(this.parentNode)
					.transition()
						.style("height", menuHeights["closed"] + "px")
						.style("border-left-color", "#fff")
						.style("border-right-color", "#fff")
				
				d3.select(this).classed("open", false)
			}else{
				var key = this.id.split("mt-")[1]
				d3.select(this.parentNode)
					.transition()
						.style("height", menuHeights[key] + "px")
						.style("border-left-color", "#d2d2d2")
						.style("border-right-color", "#d2d2d2")

				d3.select(this).classed("open", true)
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
			var unit = (d3.select(this).classed("raw")) ? "raw" : "change";
			updateIndicator(false, unit);
		})

//Initialize date range inputs
	d3.selectAll(".lineMenuDisplay")
		.on("click", function(){
			var cal = (d3.select(this).classed("start")) ? d3.select(".calendarParent.startDate") : d3.select(".calendarParent.endDate")
			if(cal.classed("visible")) cal.classed("visible", false)
			else cal.classed("visible", true)
		})
	d3.select(".chartButton.saveImage").on("click", function(){ popUp("saveImage")})

}

function init(allData, topojsonData, stateNamesData){

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

	// var defaultEndYear = allData["dates"][getSection(indicator)]["year"],
		// defaultEndMonth = allData["dates"][getSection(indicator)]["month"]


	var activeChart = (qStartDate == "") ? "bar" : "line";
	var unit = (qUnit == "") ? "change" : "raw"

	var key = getKey(indicator, unit)

	var firstDate = allData["terminalDates"][key]["firstDate"]
	var lastDate = allData["terminalDates"][key]["lastDate"]

	var endDate = (qEndDate == "") ? lastDate : getDateString(qEndDate.split("-")[0], qEndDate.split("-")[1])
	var endMoment = moment(endDate, defaultDateFormat, true)
	var startDate = (qStartDate == "") ? endMoment.subtract(defaultLinechartMonthRange, "months").format(defaultDateFormat) : getDateString(qStartDate.split("-")[0], qStartDate.split("-")[1])



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
		d3.select("#terminalDatesData").data([allData.terminalDates])
		d3.select("#stateNamesData").data([stateNamesData])

		d3.select("#lastUpdated").text(allData["lastUpdated"])

		showChart(activeChart)
		initControls()

		buildCards(allData.cards)
		buildBarChart(allData.data, topojsonData, indicator, unit, states, endDate, "screen")
		buildLineChart(allData.data, indicator, unit, states, startDate, endDate)
		setParams({"indicator": indicator, "unit": unit, "states": states, "startDate": startDate, "endDate": endDate, "init": true, "firstDate": firstDate, "lastDate": lastDate})
		buildBarDateMenus(endDate, lastDate)
		buildLineDateMenu(startDate, endDate, "start")
		buildLineDateMenu(startDate, endDate, "end")
		buildStateMenu(stateNamesData, states)
		updateSelectedStates(states)
		highlightStates(states)

		updateIndicator(indicator, unit)
}

d3.json("data/figures/data.json").then(function(allData){
	d3.json("data/mapping/states.json").then(function(topojsonData){
		d3.csv("data/mapping/state_fips.csv").then(function(stateNamesData){
			init(allData, topojsonData, stateNamesData)
		})
	})
})
