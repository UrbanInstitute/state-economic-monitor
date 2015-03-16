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
	"Figures":{
		"RUC":	{
					"id": "figure_unemployment",
					"type": "one-variable",
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
					"type": "one-variable",
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
					"type": "one-variable",
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
					"type": "one-variable",
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
					"type": "one-variable",
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
					"type": "one-variable",
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
					"type": "one-variable",
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
					"type": "one-variable",
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
					"type": "one-variable",
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