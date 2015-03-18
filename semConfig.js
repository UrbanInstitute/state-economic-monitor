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
					"title": "Unemployment Rate: Level vs. One-Year-Change",
					"subtitle": "The national unemployment rate {{y-usa-changed}} to a value of {{x-usa-value}} between {{y-date-previous}} and {{y-date-updated}}.",
					"source": "Both datasets from the Bureau of Labor Statistics",
					"x":{
						"id":"UNEMP",
						"label": "Unemployment Rate",
						"date-format": "month",
						"unit": "Rate (%), Seasonally Adjusted",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
					"y":{
						"id":"UNEMPChg",
						"label": "One Year Change in Unemployment Rate",
						"date-format": "month",
						"unit": "Percent Change Year-Over-Year",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
				},
		"Figure2":{
					"id": "total_change_emp_vs_public_change_emp",
					"title": "Year-Over-Year Change in Total Employment vs. Year-Over-Year Change in Public Sector Employment",
					"subtitle": "Public-sector employment growth continues to lag total employment growth. Total public-sector employment {{y-usa-changed}} from {{y-date-previous}} to {{y-date-updated}}, well below the {{x-usa-value}} increase in total employment.",
					"source": "Both datasets from the Bureau of Labor Statistics",
					"x":{
						"id":"EMP",
						"label": "Total Employment",
						"date-format": "month",
						"unit": "Percent Change Year-Over-Year",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
					"y":{
						"id":"GOVT",
						"label": "Public Sector Employment",
						"date-format": "month",
						"unit": "Percent Change Year-Over-Year",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
				},
		"Figure3":{
					"id": "housing_change_vs_2007_housing_change",
					"title": "One-Year-Change vs. Change Since Peak in Housing Prices",
					"subtitle": "National house prices in the third quarter of 2014 were still 6.2 percent below the peak in house prices during the first quarter of 2007.",
					"source": "Federal Housing Finance Administration, State House Price Indexes",
					"x":{
						"id":"HPChgYr",
						"label": "Percent Change Year-Over-Year",
						"date-format": "month",
						"unit": "Percent",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
					"y":{
						"id":"HPChgPeak",
						"label": "Change in Housing Prices Since Q1 2007",
						"date-format": "month",
						"unit": "Percent Change Year-Over-Year",
						"unit-type": "percent",
						"date-updated": "11/2014",
					},
				}
	},
	"Maps":{
		"RUC":	{
					"id": "figure_unemployment",
					"title": "Unemployment Rate",
					"date-format": "month",
					"subtitle": "The national unemployment rate was {{usa-value}} as of {{date-updated}}",
					"unit": "Rate (%), Seasonally Adjusted",
					"unit-type": "percent",
					"date-updated": "{{excel}}",
					"breaks": ["{{min}}",4,5,6,7,"{{max}}"],
					"source": "Bureau of Labor Statistics"
				},		
		"EMP":	{
					"id": "figure_nonfarm-employment",
					"title": "Nonfarm Payroll Employment",
					"date-format": "month",
					"subtitle": "Total (public and private) nonfarm payroll employment {{usa-changed}} from {{date-previous}} to {{date-updated}}",
					"unit": "Percent Change Year-Over-Year",
					"unit-type": "percent",
					"date-updated": "{{excel}}",
					"breaks": ["{{min}}",1,2,3,4,"{{max}}"],
					"source": "Bureau of Labor Statistics"
				},
		"AWW":	{
					"id": "figure_wages",
					"title": "Average Weekly Earnings, Private Employment",
					"date-format": "month",
					"subtitle": "National real weekly earnings (i.e., earnings adjusted for inflation) for all US private employees averaged {{usa-value}} in {{date-updated}}",
					"unit": "Weekly Earnings ($)",
					"unit-type": "dollar",
					"date-updated": "{{excel}}",
					"breaks": ["{{min}}",700,800,900,999,"{{max}}"],
					"source": "Bureau of Labor Statistics"
				},
		"AWWChg":	{
					"id": "figure_wages-change",
					"title": "Changes in Real Average Weekly Earnings, Private Employment",
					"date-format": "month",
					"subtitle": "National real (inflation adjusted) average weekly earnings  {{usa-changed}} from {{date-previous}} to {{date-updated}}",
					"unit": "Percent Change Year-Over-Year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": ["{{min}}",-2,-1,0,1,"{{max}}"],
					"source": "Bureau of Labor Statistics"
				},
		"HPChgYr":	{
					"id": "figure_house-prices",
					"title": "House Prices",
					"date-format": "quarter",
					"subtitle": "National house prices {{usa-changed}} from {{date-previous}} to {{date-updated}}",
					"unit": "Percent Change Year-Over-Year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": ["{{min}}",2,4,6,8,"{{max}}"],
					"source": "Federal Housing Finance Agency"
				},
		"TOTAL":	{
					"id": "figure_total-taxes",
					"title": "Total Tax Revenue",
					"date-format": "quarter",
					"subtitle": "Total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared to one year earlier",
					"unit": "Percent Change Year-Over-Year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": ["{{min}}",-2,0,3,6,"{{max}}"],
					"source": "Census: Note: Four quarters ending in the {{date-updated}} are compared with four quarters ending in the {{date-previous}}"
				},
		"INC":	{
					"id": "figure_income-taxes",
					"title": "Personal Income Tax Revenue",
					"date-format": "quarter",
					"subtitle": "Total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared to one year earlier",
					"unit": "Percent Change Year-Over-Year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": ["{{min}}",-2,0,3,6,"{{max}}"],
					"source": "Census: Note: Four quarters ending in the {{date-updated}} are compared with four quarters ending in the {{date-previous}}"
				},
		"CORPINC":	{
					"id": "figure_corporate-taxes",
					"title": "Corporate Income Tax Revenue",
					"date-format": "quarter",
					"subtitle": "Total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared to one year earlier",
					"unit": "Percent Change Year-Over-Year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": ["{{min}}",-2,0,3,6,"{{max}}"],
					"source": "Census: Note: Four quarters ending in the {{date-updated}} are compared with four quarters ending in the {{date-previous}}"
				},
		"SALES":	{
					"id": "figure_sales-taxes",
					"title": "Sales Tax Revenue",
					"date-format": "quarter",
					"subtitle": "Total state tax revenue {{usa-changed}} in the year ending in {{date-updated}} compared to one year earlier",
					"unit": "Percent Change Year-Over-Year",
					"unit-type": "percent",
					"date-updated": "11/2014",
					"breaks": ["{{min}}",-2,0,3,6,"{{max}}"],
					"source": "Census: Note: Four quarters ending in the {{date-updated}} are compared with four quarters ending in the {{date-previous}}"
				}
		
	}
}