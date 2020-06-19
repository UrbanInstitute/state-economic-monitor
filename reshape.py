from json import dump, load
from random import random
import time
import xlrd
import csv
import datetime
from tempfile import NamedTemporaryFile
import shutil


DATE_FORMAT = "%Y-%m-%d"
rootPath = "/var/www/html/semapp/"
# rootPath = "/Users/bchartof/Projects/state-economic-monitor/"

def cleanExcelRow(row, dateMode, isDate, colCount):
	if isDate:
		for i, r in enumerate(row):
			if i >= colCount:
				# row.remove(r)
				del row[i:len(row)]
				break
			if r == "Geography":
				continue
			else:
				if str(r).find("Q") != -1:
					year = r.split(" ")[0]
					month = "%02d" % (((int(r.split(" ")[1].replace("Q","")) - 1) * 3) + 1,)
					row[i] = year + "-" + month + "-01"
				else:
					year, month, day, hour, minute, second = xlrd.xldate_as_tuple(r, dateMode)
					pyDate = datetime.datetime(year, month, day, hour, minute, second)
					row[i] = pyDate.strftime(DATE_FORMAT)
					# return row
		return row
	else:
		for i, r in enumerate(row):
			if i >= colCount:
				del row[i:len(row)]
				break
		if row[0] == "US Average":
			row[0] = "United States"
			return row
		if row[0] == "":
			return row
		else:
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
		
		colCount = len(filter( lambda x : x.ctype != 0 and x != "", raw.row(5)))

		for rownum in range(3, raw.nrows):
			row = raw.row(rownum)
			if(row[0].ctype == 0):
				break
			else:
				isDate = (rownum == 3)
				rawWriter.writerow( cleanExcelRow(raw.row_values(rownum), dateMode, isDate, colCount) )
		
		rawFile.close()

	if(indicator != "unemployment_rate"):
		if(indicator == "house_price_index"):
			sheetIndex = 0
		else:
			sheetIndex = 1
		change = wb.sheet_by_index(sheetIndex)
		changeFile = open(rootPath + 'static/data/csv/%s_yoy_percent_change.csv'%indicator, 'wb')
		changeWriter = csv.writer(changeFile, quoting=csv.QUOTE_ALL)
		
		colCount = len(filter( lambda x : x.ctype != 0 and x != "", change.row(5)))

		for rownum in range(3, change.nrows):
			row = change.row(rownum)
			if(row[0] == ""):
				break
			else:
				isDate = (rownum == 3)
				changeWriter.writerow( cleanExcelRow(change.row_values(rownum), dateMode, isDate, colCount) )

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
		dates = rawReader.next()
		terminalDates[key] = {"firstDate" : dates[1], "lastDate" : dates[len(dates) - 1]}

		rowCount = sum(1 for row in rawCountReader) - 2
		for rowIndex, row in enumerate(rawReader):
			name = row[0]
			if(name == ""):
				print indicator

			for i in range(1, len(row)):
				date = dates[i]
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
		changeCountReader = csv.reader(open(rootPath + "static/data/csv/%s_yoy_percent_change.csv"%indicator, 'rU'))
		dates = changeReader.next()
		terminalDates[key] = {"firstDate" : dates[1], "lastDate" : dates[len(dates) - 1]}

		rowCount = sum(1 for row in changeCountReader) - 2

		for rowIndex, row in enumerate(changeReader):
			name = row[0]

			for i in range(1, len(row)):
				date = dates[i]
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


quarterly = ["house_price_index_yoy_percent_change.csv","state_gdp_raw_in_millions.csv","state_gdp_yoy_percent_change.csv"]

for filename in quarterly:
	tempfile = NamedTemporaryFile(delete=False)

	with open(rootPath + 'static/data/csv/' + filename, 'rb') as csvFile, tempfile:
	    reader = csv.reader(csvFile, delimiter=',', quotechar='"')
	    writer = csv.writer(tempfile, delimiter=',', quotechar='"')
	    dates = reader.next()
	    newDates = []
	    for i, r in enumerate(dates):
	    	if r == "Geography":
	    		newDates.append(r)
	    		continue
	        tempDate = r.split("-")
	        tempYear = tempDate[0]
	        tempMonth = int(tempDate[1])
	        tempQ = ((tempMonth-1)/3) + 1
	        newDates.append(tempYear + " Q" + str(tempQ))

	    writer.writerow(newDates)

	    for row in reader:
	        writer.writerow(row)

	shutil.move(tempfile.name, rootPath + 'static/data/csv/' + filename)



#write a pretty printed json for human readability
with open(rootPath + 'static/data/figures/pretty.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, indent=4, separators=(',', ': '))


#write a one line json for consumption in JS
with open(rootPath + 'static/data/figures/data.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, separators=(',', ':'))

