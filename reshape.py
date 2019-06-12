from csv import reader
from json import dump
from utils import *
from random import random
import datetime
fipsReader = reader(open("data/state_fips.csv", 'rU'))

unemploymentRawReader = reader(open("data/unemployment_test.csv", 'rU'))
unemploymentChangeReader = reader(open("data/unemployment_test_change.csv", 'rU'))


junk = fipsReader.next()
unemploymentRawHead = unemploymentRawReader.next()
unemploymentChangeHead = unemploymentChangeReader.next()


nameToFips = {}
unemploymentRawData = []
unemploymentChangeData = []


for row in fipsReader:
	nameToFips[row[2]] = { "abbr": row[1], "fips": row[0], "name": row[2] }


indicators = ["unemployment"]
tempDict = {}

toBeReplaced = ["b", "c", "d", "e", "f", "g", "h", "i"]

for row in unemploymentRawReader:
	key = str(indicators.index("unemployment")) + "r"
	name = row[0]
	abbr = nameToFips[name]["abbr"]
	fips = nameToFips[name]["fips"]
	for i in range(1, len(row)):
		date = formatDate(unemploymentRawHead[i])
		raw = row[i]
		tempKey = abbr + "_" + date

		if tempKey not in tempDict:
			tempDict[tempKey] = {}
		tempDict[tempKey][key] = float(raw)

		for i in toBeReplaced:
			toBeReplaced2 = i + "r"
			tempDict[tempKey][toBeReplaced2] = float(raw) + random() * 2



		# unemploymentRawData.append({ "state" : name, "abbr": abbr, "fips": fips, "date": date, "raw": raw })
		# unemploymentRawData.append({ "abbr": abbr, "date": date, "raw": raw })
for row in unemploymentChangeReader:
	key = str(indicators.index("unemployment")) + "c"
	name = row[0]
	abbr = nameToFips[name]["abbr"]
	fips = nameToFips[name]["fips"]
	for i in range(1, len(row)):
		date = formatDate(unemploymentChangeHead[i])
		change = row[i]
		tempKey = abbr + "_" + date

		if tempKey not in tempDict:
			tempDict[tempKey] = {}
		tempDict[tempKey][key] = float(change)

		for i in toBeReplaced:
			toBeReplaced2 = i + "c"
			tempDict[tempKey][toBeReplaced2] = float(raw) + random() * .1


# print tempDict

dataOut = {"data": []}
tempList = []

for tk in tempDict:
	date = tk.split("_")[1]
	abbr = tk.split("_")[0]
	obj = tempDict[tk]
	obj["date"] = date
	obj["abbr"] = abbr
	tempList.append(obj)

dataOut["data"] = sorted(tempList, key=lambda k: datetime.datetime.strptime(k['date'], "%Y-%m-%d"))

# unemploymentData = mergeData(unemploymentRawData, unemploymentChangeData)





# dataOut = {}
dataOut["cards"] = []
dataOut["dates"] = {"employment": {"year": 2015, "month": 2}}
# dataOut["data"] = { "unemployment": unemploymentData, "a": unemploymentData, "b": unemploymentData, "c": unemploymentData, "d": unemploymentData, "e": unemploymentData,"f": unemploymentData,"g": unemploymentData}




#write a pretty printed json for human readability
with open('data/pretty.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, indent=4, separators=(',', ': '))


#write a one line json for consumption in JS
with open('data/dump.json', 'wt') as out:
    res = dump(dataOut, out, sort_keys=True, separators=(',', ':'))


