import csv
import xlrd
from collections import OrderedDict
import json
import cPickle as pickle

figureData = OrderedDict()
figureVars = {"Figure1":"RUC","Figure2":("UNEMP","UNEMPChg"),"Figure3":"EMP","Figure4":("EMP","GOVT"),"Figure5":"AWW","Figure6":"AWWChg","Figure7":"HPI","Figure8":("HPChgYr","HPChgPeak"),"Figure9":"TOTAL","Figure10":"INC","Figure11":"CORPINC","Figure12":"SALES"}
varFullNames = {}

stateFIPS = {}

def buildStateFIPS():
	cr = csv.reader(open("shapefile/state-fips.csv"))
	header = cr.next()
	for row in cr:
		stateFIPS[row[1]]={"fips":row[0],"name":row[2]}



def parseXlSM():
	sourceBook = xlrd.open_workbook('data/source/SEM_Data_Online.xlsm')
	for sheet in sourceBook.sheets():
		if sheet.name == "MapData" or sheet.name == "Table 1" or sheet.name == "Table 2" or sheet.name == "Table 3":
		    with open('data/source/sheets/{}.csv'.format(sheet.name), 'wb') as f:
		        writer = csv.writer(f)
		        for row in range(sheet.nrows):
		            out = []
		            for cell in sheet.row(row):
		            	# Check if type matches "XL_CELL_ERROR", or ctype == 5, see xlrd docs http://www.lexicon.net/sjmachin/xlrd.html
		            	if cell.ctype == 5:
		            	#Get the text representation of the error code from the xlrd dict that stores them
		            		value = xlrd.error_text_from_code[cell.value]
		            	else:
		            		value = cell.value
		                if isinstance(value, float) or isinstance(value,int):
		                	out.append(value)
		                else:
		                	out.append(value.encode('utf8'))
		            writer.writerow(out)

def parseCell(val):
	if val[0] == "#":
		return val
	else:
		return float(val)

def newCode(code, fullName):
	figureData[code] = OrderedDict()
	figureData[code]["fullName"] = fullName
	figureData[code]["data"] = []

def geographyDict(abbrev):
	obj = OrderedDict()
	obj["code"] = abbrev
	obj["fips"] = stateFIPS[abbrev]["fips"]
	obj["name"] = stateFIPS[abbrev]["name"]

	return obj


def parseMapData():
	cr = csv.reader(open("data/source/sheets/MapData.csv","rU"))
	header = cr.next()
	for row in cr:
		month = int(parseCell(row[0]))
		year = int(parseCell(row[1]))
		value = parseCell(row[3])
		geography = row[4]
		code = row[5]
		if code not in figureData:
			figureData[code] = OrderedDict()
			figureData[code]["fullName"] = "placeholder"
			figureData[code]["yearUpdated"] = year
			figureData[code]["monthUpdated"] = month
			figureData[code]["data"] = []
			# figureData[code]["value"] = value

		# else:
		obj = OrderedDict()
		obj["geography"] = geographyDict(geography)
		obj["value"] = value

		figureData[code]["data"].append(obj)

def parseTable1():
	cr = csv.reader(open("data/source/sheets/Table 1.csv","rU"))
	title = cr.next()
	header = cr.next()
	newCode("UNEMP","Unemployment rate (%)")
	newCode("UNEMPChg","Year-over-year change in unemployment rate (percentage points)")
	for row in cr:
		if row[7] == "":
			#after last state there are some empty rows with notes, we don't want these
			break
		unemp = OrderedDict()
		unempChg = OrderedDict()
		unemp["geography"] = geographyDict(row[7])
		unempChg["geography"] = geographyDict(row[7])
		unemp["value"] = parseCell(row[1])
		unempChg["value"] = parseCell(row[2])

		figureData["UNEMP"]["data"].append(unemp)
		figureData["UNEMPChg"]["data"].append(unempChg)

def parseTable2():
	cr = csv.reader(open("data/source/sheets/Table 2.csv","rU"))
	title = cr.next()
	header = cr.next()
	newCode("INC","Personal income tax")
	newCode("CORPINC","Corporate income tax")
	newCode("SALES","Sales tax")
	for row in cr:
		if row[5] == "":
			#after last state there are some empty rows with notes, we don't want these
			break
		inc = OrderedDict()
		corpInc = OrderedDict()
		sales = OrderedDict()

		inc["geography"] = geographyDict(row[5])
		corpInc["geography"] = geographyDict(row[5])
		sales["geography"] = geographyDict(row[5])

		inc["value"] = parseCell(row[1])
		corpInc["value"] = parseCell(row[2])
		sales["value"] = parseCell(row[3])

		figureData["INC"]["data"].append(inc)
		figureData["CORPINC"]["data"].append(corpInc)
		figureData["SALES"]["data"].append(sales)

def parseTable3():
	cr = csv.reader(open("data/source/sheets/Table 3.csv","rU"))
	title = cr.next()
	header = cr.next()
	newCode("HPChgYr","One-Year Change in Housing Prices (%)")
	newCode("HPChgPeak","Change in Housing Prices Since Q1 2007 (Peak)")
	for row in cr:
		if row[4] == "":
			#after last state there are some empty rows with notes, we don't want these
			break
		hpChgYr = OrderedDict()
		hpChgPeak = OrderedDict()
		hpChgYr["geography"] = geographyDict(row[4])
		hpChgPeak["geography"] = geographyDict(row[4])
		hpChgYr["value"] = parseCell(row[2])
		hpChgPeak["value"] = parseCell(row[3])

		figureData["HPChgYr"]["data"].append(hpChgYr)
		figureData["HPChgPeak"]["data"].append(hpChgPeak)

	with open("figureData.js", "w") as fp:
		fp.write("var figureData = ")
		fp.write(json.dumps(figureData, sort_keys=False))

	with open("RUC.json","w") as ruc:
		ruc.write(json.dumps(figureData["RUC"]["data"], sort_keys=False))

def createCSV():
	print "foo"

def createJS():
	print "foo"

def parseData():
	parseXlSM()
	parseMapData()
	parseTable1()
	parseTable2()
	parseTable3()

buildStateFIPS()
parseData()