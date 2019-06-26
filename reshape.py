from json import dump
from utils import *
from random import random
import time
import xlrd
import csv
import datetime


DATE_FORMAT = "%Y-%m-%d"

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
	wb = xlrd.open_workbook('data/source/%s.xlsx'%indicator)
	dateMode = wb.datemode

	if(indicator != "house_price_index"):
		raw = wb.sheet_by_index(0)
		rawFile = open('data/csv/%s_raw.csv'%indicator, 'wb')
		rawWriter = csv.writer(rawFile, quoting=csv.QUOTE_ALL)
		
		for rownum in range(4, raw.nrows):
			if(row[0] == "" and row[1] != "United States" and row[1] != "US Average"):
				break
			else:
				rawWriter.writerow( cleanExcelRow(raw.row_values(rownum), dateMode) )
		
		rawFile.close()

	if(indicator != "unemployment_rate"):
		yoy = wb.sheet_by_index(1)
		yoyFile = open('data/csv/%s_yoy.csv'%indicator, 'wb')
		yoyWriter = csv.writer(yoyFile, quoting=csv.QUOTE_ALL)
		

		for rownum in range(4, yoy.nrows):
			if(row[0] == "" and row[1] != "United States"):
				break
			else:
				yoyWriter.writerow( cleanExcelRow(yoy.row_values(rownum), dateMode) )

		yoyFile.close()





fipsReader = csv.reader(open("data/mapping/state_fips.csv", 'rU'))
nameToFips = {}
for row in fipsReader:
	nameToFips[row[2]] = { "abbr": row[1], "fips": row[0], "name": row[2] }


indicators = ["federal_public_employment", "house_price_index", "private_employment", "public_employment", "state_and_local_public_employment", "state_gdp", "total_employment", "unemployment_rate", "weekly_earnings"]

# indicators = ["federal_public_employment"]


tempDict = {}
terminalDates = {}


for indicator in indicators:
	buildCSVs(indicator)

for index, indicator in enumerate(indicators):
	if(indicator != "house_price_index"):
		key = str(index) + "r"
		rawReader = csv.reader(open("data/csv/%s_raw.csv"%indicator, 'rU'))
		rawCountReader = csv.reader(open("data/csv/%s_raw.csv"%indicator, 'rU'))
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
				tempDict[tempKey][key] = cleanVal

for index, indicator in enumerate(indicators):
	if(indicator != "unemployment_rate"):
		key = str(index) + "c"
		yoyReader = csv.reader(open("data/csv/%s_yoy.csv"%indicator, 'rU'))
		yoyCountReader = csv.reader(open("data/csv/%s_yoy.csv"%indicator, 'rU'))
		states = yoyReader.next()

		rowCount = sum(1 for row in yoyCountReader) - 2

		for rowIndex, row in enumerate(yoyReader):
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



dataOut["cards"] = [{"states": ["US", "PA", "AK"], "indicator": "private_employment", "unit": "change", "endDate": "2018-04-01", "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."}, {"states": ["US", "PA", "CA"], "indicator": "state_gdp", "unit": "raw", "endDate": "2018-04-01", "startDate": "2006-01-01", "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}]
dataOut["terminalDates"] = terminalDates




#write a pretty printed json for human readability
with open('data/figures/pretty.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, indent=4, separators=(',', ': '))


#write a one line json for consumption in JS
with open('data/figures/data.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, separators=(',', ':'))

