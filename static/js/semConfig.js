/*******************************
Many of the fields in this configuration will not change, but they can be configured using the following standars:

* "id" refers the the html id of the div that contains the graphic

* "type" must equal "one-variable" (map/bar chart) or "two-variable" (scatterplot)

* "date-format" must equal "month" or "quarter" (e.g November, 2014 vs fourth quarth of 2014)

* Within the "subtitle" text,
	* "{{usa-value}}" refers to the US value for the variable in the data,
	* "{{usa-changed}}" is text for dealing with positive, negative, or  zero values
		* usa-value > 0, text -> "increased by usa-value"
		* usa-value < 0, text -> "decreased by usa-value (absolute value)"
		* usa-value = 0, text -> "did not change"
	* "{{date-updated}}" refers to the date the data was updated (using whichever format is specified), and
	* "{{date-previous-year}}" refers to the date one year prior (e.g. November, 2014 -> November, 2013)

* "unit-type" must equal "percent", "dollar", or "none"

* "date-updated" must either equal a date of the form "MM/YYYY" or "{{excel}}" which pulls in the date from the "MapData" tab

* "breaks" is a list of the break points for legends on one-variable figures. It should be a list of numbers (with no quotes), with special end points "{{min}}" and "{{max}}" referring to the minimum and maxium values rounded down and up respectively
********************************/
var semConfig = {
	"ScatterPlots":{
		"Figure1":{
					"id": "figure_level_vs_change_unemployment",
					"tab": "employment",
					"title": "Unemployment Rate: Level vs. One-Year Change",
					"subtitle": "The national unemployment rate {{y-usa-changed}} to a value of {{x-usa-value}} between {{y-date-previous}} and {{y-date-updated}}.",
					"source": "Both datasets from the <a href = 'http://www.bls.gov/news.release/laus.t03.htm'>Bureau of Labor Statistics.</a>",
					"x":{
						"id":"UNEMP",
						"label": "Unemployment rate",
						"short-label": "RATE",
						"date-format": "month",
						"unit": "percent, seasonally adjusted",
						"unit-type": "percent",
						"date-updated": "{{EMP_MONTH}}",
					},
					"y":{
						"id":"UNEMPChg",
						"label": "One-year change in rate",
						"short-label": "CHANGE",
						"date-format": "month",
						"unit": "percent change year over year",
						"unit-type": "percentage points",
						"date-updated": "11/2014",
					},
				},
		"Figure2":{
					"id": "total_change_emp_vs_public_change_emp",
					"tab": "employment",
					"title": "Total Employment vs. Public Employment",
					"subtitle": "Total public-sector employment {{y-usa-changed}} from {{y-date-previous}} to {{y-date-updated}}, staying well below the {{x-usa-value}} increase in total employment.",
					"source": "Both datasets from the <a href = 'http://www.bls.gov/news.release/laus.t05.htm'>Bureau of Labor Statistics.</a>",
					"x":{
						"id":"EMP",
						"label": "Total employment",
						"short-label": "TOTAL",
						"date-format": "month",
						"unit": "percent change year over year",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
					"y":{
						"id":"GOVT",
						"label": "Public-sector employment",
						"short-label": "PUBLIC",
						"date-format": "month",
						"unit": "percent change year over year",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
				},
		"Figure3":{
					"id": "housing_change_vs_2007_housing_change",
					"tab": "housing",
					"title": "One-Year Change vs. Change Since Peak in Housing Prices",
					"subtitle": "National house prices in the first quarter of 2015 were still 6.2 percent below the peak in house prices during the first quarter of 2007.",
					"source": "<a href = 'http://www.fhfa.gov/DataTools/Downloads/Pages/House-Price-Index-Datasets.aspx#qpo'>Federal Housing Finance Administration, State House Price Indexes.</a>",
					"x":{
						"id":"HPChgYr",
						"label": "Percent change year over year",
						"short-label": "&Delta; ANNUAL",
						"date-format": "month",
						"unit": "Percent",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
					"y":{
						"id":"HPChgPeak",
						"label": "Change since Q1 2007",
						"short-label": "&Delta; PEAK",
						"date-format": "month",
						"unit": "percent change year over year",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
				}
	},
	"Maps":{
		"UNEMP":	{
					"id": "figure_unemployment",
					"tab": "employment",
					"title": "Unemployment Rate",
					"date-format": "month",
					"subtitle": "The national unemployment rate was {{usa-value}} as of {{date-updated}}.",
					"short-label": "RATE",
					"unit": "percent, seasonally adjusted",
					"unit-type": "percent",
					"date-updated": "{{excel}}",
					"breaks": [2,3,4,5,6,7],
					"source": "<a href = 'http://www.bls.gov/news.release/laus.t03.htm'>Bureau of Labor Statistics.</a>"
				},
		"EMP":	{
					"id": "figure_nonfarm-employment",
					"tab": "employment",
					"title": "Total Employment",
					"short-label": "CHANGE",
					"date-format": "month",
					"subtitle": "Total (public and private) nonfarm payroll employment {{usa-changed}} from {{date-previous}} to {{date-updated}}.",
					"unit": "percent change year over year",
					"unit-type": "percent",
					"date-updated": "{{excel}}",
					"breaks": [-5,0,1,2,3,4],
					"source": "<a href = 'http://www.bls.gov/news.release/laus.t05.htm'>Bureau of Labor Statistics.</a>"
				},
		"AWW":	{
					"id": "figure_wages",
					"tab": "wages",
					"title": "Average Weekly Earnings, Private Employment",
					"short-label": "EARNINGS",
					"date-format": "month",
					"subtitle": "National real weekly earnings (i.e., earnings adjusted for inflation) for all US private employees averaged {{usa-value}} in {{date-updated}}.",
					"unit": "dollars",
					"unit-type": "dollar",
					"date-updated": "{{excel}}",
					"breaks": [650,725,800,875,950,1300],
					"source": "<a href = 'http://www.bls.gov/sae/home.htm'>Bureau of Labor Statistics.</a>"
				},
		"AWWChg":	{
					"id": "figure_wages-change",
					"tab": "wages",
					"title": "Changes in Real Average Weekly Earnings, Private Employment",
					"short-label": "CHANGE",
					"date-format": "month",
					"subtitle": "National real (inflation adjusted) average weekly earnings  {{usa-changed}} from {{date-previous}} to {{date-updated}}.",
					"unit": "percent change year over year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": [-10,-1,0,1,3,10],
					"source": "<a href = 'http://www.bls.gov/sae/home.htm'>Bureau of Labor Statistics.</a>"
				},
		"HPChgYr":	{
					"id": "figure_house-prices",
					"tab": "housing",
					"title": "House Prices",
					"short-label": "CHANGE",
					"date-format": "quarter",
					"subtitle": "National house prices {{usa-changed}} from {{date-previous}} to {{date-updated}}.",
					"unit": "percent change year over year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": [0,2,4,6,10,14],
					"source": "<a href = 'http://www.fhfa.gov/DataTools/Downloads/Pages/House-Price-Index-Datasets.aspx#qpo'>Federal Housing Finance Agency.</a>"
				},
		"TOTAL":	{
					"id": "figure_total-taxes",
					"tab": "taxes",
					"title": "Total Tax Revenue",
					"short-label": "CHANGE",
					"date-format": "quarter",
					"subtitle": "Real total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared with one year earlier.",
					"unit": "inflation-adjusted, percent change year over year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": [-70,-10,0,5,10,20],
					"source": "<a href = 'http://www.census.gov/govs/qtax/'>US Census Bureau.</a><br>Note: Four quarters ending in {{date-updated}} are compared with four quarters ending in the {{date-previous}}."
				},
		"INC":	{
					"id": "figure_income-taxes",
					"tab": "taxes",
					"title": "Personal Income Tax Revenue",
					"short-label": "CHANGE",
					"date-format": "quarter",
					"subtitle": "Real total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared with one year earlier.",
					"unit": "inflation-adjusted, percent change year over year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": [-15,0,4,7,10,20],
					"source": "<a href = 'http://www.census.gov/govs/qtax/'>US Census Bureau.</a><br>Note: Four quarters ending in {{date-updated}} are compared with four quarters ending in the {{date-previous}}."
				},
		"CORPINC":	{
					"id": "figure_corporate-taxes",
					"tab": "taxes",
					"title": "Corporate Income Tax Revenue",
					"short-label": "CHANGE",
					"date-format": "quarter",
					"subtitle": "Real total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared with one year earlier.",
					"unit": "inflation-adjusted, percent change year over year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": [-100,-10,0,10,20,51],
					"source": "<a href = 'http://www.census.gov/govs/qtax/'>US Census Bureau.</a><br>Note: Four quarters ending in {{date-updated}} are compared with four quarters ending in the {{date-previous}}."
				},
		"SALES":	{
					"id": "figure_sales-taxes",
					"tab": "taxes",
					"title": "Sales Tax Revenue",
					"short-label": "CHANGE",
					"date-format": "quarter",
					"subtitle": "Real total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared with one year earlier.",
					"unit": "inflation-adjusted, percent change year over year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": [-5,0,3,5,10,20],
					"source": "<a href = 'http://www.census.gov/govs/qtax/'>US Census Bureau.</a><br>Note: Four quarters ending in {{date-updated}} are compared with four quarters ending in the {{date-previous}}."
				}

	}
}
