from json import dump, load
from random import random
import time
import xlrd
import csv
import datetime


DATE_FORMAT = "%Y-%m-%d"
rootPath = "/var/www/html/semapp/"

def cleanExcelRow(row, dateMode):
	if str(row[0]).find("Q") != -1:
		year = row[0].split(" ")[0]
		month = "%02d" % (((int(row[0].split(" ")[1].replace("Q","")) - 1) * 3) + 1,)
		row[0] = year + "-" + month + "-01"
		return row
	if row[1] == "US Average":
		row[1] = "United States"
		return row
	if row[0] == "":
		return row

	year, month, day, hour, minute, second = xlrd.xldate_as_tuple(row[0], dateMode)
	pyDate = datetime.datetime(year, month, day, hour, minute, second)
	row[0] = pyDate.strftime(DATE_FORMAT)
	return row


def buildCSVs(indicator):
	wb = xlrd.open_workbook(rootPath + 'static/data/source/%s.xlsx'%indicator)
	dateMode = wb.datemode

	if(indicator != "house_price_index"):
		raw = wb.sheet_by_index(0)
		
		fileName = indicator
		if(indicator == "federal_public_employment" or indicator == "private_employment" or indicator == "public_employment" or indicator == "state_and_local_public_employment" or indicator == "total_employment" or indicator == "state_and_local_public_education_employment"):
			fileName += "_raw_in_thousands"
		elif(indicator == "state_gdp"):
			fileName += "_raw_in_millions"
		else:
			fileName += "_raw"

		rawFile = open(rootPath + 'static/data/csv/%s.csv'%fileName, 'wb')
		rawWriter = csv.writer(rawFile, quoting=csv.QUOTE_ALL)
		
		for rownum in range(4, raw.nrows):
			if(row[0] == "" and row[1] != "United States" and row[1] != "US Average"):
				break
			else:
				rawWriter.writerow( cleanExcelRow(raw.row_values(rownum), dateMode) )
		
		rawFile.close()

	if(indicator != "unemployment_rate"):
		change = wb.sheet_by_index(1)
		changeFile = open(rootPath + '%s_yoy_percent_change.csv'%indicator, 'wb')
		changeWriter = csv.writer(changeFile, quoting=csv.QUOTE_ALL)
		

		for rownum in range(4, change.nrows):
			if(row[0] == "" and row[1] != "United States"):
				break
			else:
				changeWriter.writerow( cleanExcelRow(change.row_values(rownum), dateMode) )

		changeFile.close()





fipsReader = csv.reader(open(rootPath + "static/data/mapping/state_fips.csv", 'rU'))
nameToFips = {}
for row in fipsReader:
	nameToFips[row[2]] = { "abbr": row[1], "fips": row[0], "name": row[2] }


indicators = ["federal_public_employment", "house_price_index", "private_employment", "public_employment", "state_and_local_public_employment", "state_gdp", "total_employment", "unemployment_rate", "weekly_earnings","state_and_local_public_education_employment"]

tempDict = {}
terminalDates = {}


for indicator in indicators:
	buildCSVs(indicator)

for index, indicator in enumerate(indicators):
	if(indicator != "house_price_index"):
		key = str(index) + "r"
		fileName = indicator
		if(indicator == "federal_public_employment" or indicator == "private_employment" or indicator == "public_employment" or indicator == "state_and_local_public_employment" or indicator == "total_employment" or indicator == "state_and_local_public_education_employment"):
			fileName += "_raw_in_thousands"
		elif(indicator == "state_gdp"):
			fileName += "_raw_in_millions"
		else:
			fileName += "_raw"

		rawReader = csv.reader(open(rootPath + "static/data/csv/%s.csv"%fileName, 'rU'))
		rawCountReader = csv.reader(open(rootPath + "static/data/csv/%s.csv"%fileName, 'rU'))
		states = rawReader.next()

		rowCount = sum(1 for row in rawCountReader) - 2
		for rowIndex, row in enumerate(rawReader):
			date = row[0]
			if(rowIndex == 0):
				terminalDates[key] = {}
				terminalDates[key]["firstDate"] = date
			if(rowIndex == rowCount):	
				terminalDates[key]["lastDate"] = date

			for i in range(1, len(row)):
				name = states[i]
				abbr = nameToFips[name]["abbr"]
				value = row[i]
				tempKey = abbr + "_" + date

				if tempKey not in tempDict:
					tempDict[tempKey] = {}

				cleanVal = "" if (value == "") else float(value)
				if(indicator == "federal_public_employment" or indicator == "private_employment" or indicator == "public_employment" or indicator == "state_and_local_public_employment" or indicator == "total_employment" or indicator == "state_and_local_public_education_employment"):
					cleanVal *= 1000
				elif(indicator == "state_gdp"):
					cleanVal *= 1000000
				tempDict[tempKey][key] = cleanVal

for index, indicator in enumerate(indicators):
	if(indicator != "unemployment_rate"):
		key = str(index) + "c"
		changeReader = csv.reader(open(rootPath + "static/data/csv/%s_yoy_percent_change.csv"%indicator, 'rU'))
		changeCountReader = csv.reader(open(rootPath + "static/data/csv%s_yoy_percent_change.csv"%indicator, 'rU'))
		states = changeReader.next()

		rowCount = sum(1 for row in changeCountReader) - 2

		for rowIndex, row in enumerate(changeReader):
			date = row[0]
			if(rowIndex == 0):
				terminalDates[key] = {}
				terminalDates[key]["firstDate"] = date
			if(rowIndex == rowCount):	
				terminalDates[key]["lastDate"] = date

			for i in range(1, len(row)):
				name = states[i]
				abbr = nameToFips[name]["abbr"]
				value = row[i]
				tempKey = abbr + "_" + date
				if tempKey not in tempDict:
					tempDict[tempKey] = {}
				
				cleanVal = "" if (value == "") else float(value)
				tempDict[tempKey][key] = cleanVal


dataOut = {"data": []}
tempList = []

for tk in tempDict:
	date = tk.split("_")[1]
	abbr = tk.split("_")[0]
	obj = tempDict[tk]
	obj["date"] = date
	obj["abbr"] = abbr
	tempList.append(obj)

dataOut["data"] = sorted(tempList, key=lambda k: datetime.datetime.strptime(k['date'], DATE_FORMAT))

with open(rootPath + 'static/data/cards/cards.json') as inFile:
    cardData = load(inFile)
    dataOut["cards"] = cardData

dataOut["terminalDates"] = terminalDates

now = datetime.datetime.now()

dataOut["lastUpdated"] = now.strftime("%B %d, %Y")


#write a pretty printed json for human readability
with open(rootPath + 'static/data/figures/pretty.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, indent=4, separators=(',', ': '))


#write a one line json for consumption in JS
with open(rootPath + 'static/data/figures/data.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, separators=(',', ':'))

