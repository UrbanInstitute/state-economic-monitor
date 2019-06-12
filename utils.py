def formatDate(excelDateString):
	year = excelDateString.split("-")[0]
	month = excelDateString.split("-")[1]

	return year + "-" + month + "-" + "01"

def mergeData(rawData, changeData):
	for raw in rawData:
		date = raw["date"]
		abbr = raw["abbr"]

		for change in changeData:
			if change["date"] == date and change["abbr"] == abbr:
				raw["change"] = change["change"]

	return rawData