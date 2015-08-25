import csv
import xlrd
import xlwt
from collections import OrderedDict
import json
import time
import sys
from math import ceil

try:
    EMP_DATE = sys.argv[1]
    TAX_DATE = sys.argv[2]
    print "Dates must be formatted as MM/YYYY"
    print "Employment data date is " + EMP_DATE
    print "Tax data date is " + TAX_DATE
except IndexError:
    print "You must specify the date for the current data set"
    sys.exit()
figureData = OrderedDict()
figureVars = {"Figure1":["UNEMP"],"Figure2":["UNEMP","UNEMPChg"],"Figure3":["EMP"],"Figure4":["EMP","GOVT"],"Figure5":["AWW"],"Figure6":["AWWChg"],"Figure7":["HPI"],"Figure8":["HPChgYr","HPChgPeak"],"Figure9":["TOTAL"],"Figure10":["INC"],"Figure11":["CORPINC"],"Figure12":["SALES"]}
fullNames = {"AWW":"Average Weekly Earnings, Private Employment","AWWChg":"Changes in Real Average Weekly Earnings, Private Employment","GOVT":"Public Sector Employment","TOTAL":"Total Employment","HPI":"Housing Price Index","PHCI":"Coincident indices, 3-month change","SLIND":"State Leading Index","EMP":"Nonfarm Payroll Employment Change","UNEMP":"Unemployment Rate","UNEMPChg":"One Year Change in Unemployment Rate","INC":"Personal Income Tax Revenue","CORPINC":"Corporate Income Tax Revenue","SALES":"Sales Tax Revenue","HPChgYr":"Housing Price Percent Change Year-Over-Year","HPChgPeak":"Change in Housing Prices Since Q1 2007"}

stateFIPS = {}

def buildStateFIPS():
    cr = csv.reader(open("shapefile/state-fips.csv","rU"))
    header = cr.next()
    for row in cr:
        stateFIPS[row[1]]={"fips":row[0],"name":row[2],"region":row[3]}



def parseXlSX(fileName):
    sourceBook = xlrd.open_workbook('data/source/' + fileName + ".xlsx")
    sheet = sourceBook.sheets()[0]
    with open('data/source/sheets/{}.csv'.format(fileName), 'wb') as f:
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
    elif val == "NA":
    	return "#NA"
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
    obj["region"] = stateFIPS[abbrev]["region"]


    return obj


def parseEmployment():
    cr = csv.reader(open("data/source/sheets/current_employment.csv","rU"))
    title = cr.next()
    header = cr.next()
    newCode("EMP","Total Employment")
    newCode("UNEMP","Unemployment Rate")
    newCode("UNEMPChg","One Year Change in Unemployment Rate")
    newCode("GOVT","Public Sector Employment")

    for row in cr:
        if row[0] == "":
            #after last state there are some empty rows with notes, we don't want these
            break
        emp = OrderedDict()
        unemp = OrderedDict()
        unempChg = OrderedDict()
        govt = OrderedDict()

        emp["geography"] = geographyDict(row[1])
        unemp["geography"] = geographyDict(row[1])
        unempChg["geography"] = geographyDict(row[1])
        govt["geography"] = geographyDict(row[1])

        unemp["value"] = parseCell(row[2])
        unempChg["value"] = parseCell(row[3])
        emp["value"] = parseCell(row[4])
        govt["value"] = parseCell(row[5])


        figureData["EMP"]["data"].append(emp)
        figureData["UNEMP"]["data"].append(unemp)
        figureData["UNEMPChg"]["data"].append(unempChg)
        figureData["GOVT"]["data"].append(govt)

def parseHousing():
    cr = csv.reader(open("data/source/sheets/current_housing.csv","rU"))
    title = cr.next()
    header = cr.next()
    newCode("HPChgYr","One-Year Change in Housing Prices (%)")
    newCode("HPChgPeak","Change in Housing Prices Since Q1 2007 (Peak)")
    for row in cr:
        if row[0] == "":
            #after last state there are some empty rows with notes, we don't want these
            break
        hpChgYr = OrderedDict()
        hpChgPeak = OrderedDict()

        hpChgYr["geography"] = geographyDict(row[1])
        hpChgPeak["geography"] = geographyDict(row[1])

        hpChgYr["value"] = parseCell(row[2])
        hpChgPeak["value"] = parseCell(row[3])

        figureData["HPChgYr"]["data"].append(hpChgYr)
        figureData["HPChgPeak"]["data"].append(hpChgPeak)

def parseTax():
    cr = csv.reader(open("data/source/sheets/current_tax.csv","rU"))
    title = cr.next()
    header = cr.next()
    newCode("INC","Personal income tax")
    newCode("CORPINC","Corporate income tax")
    newCode("SALES","Sales tax")
    newCode("TOTAL","Total taxes")

    for row in cr:
        if row[0] == "":
            #after last state there are some empty rows with notes, we don't want these
            break
        inc = OrderedDict()
        corpInc = OrderedDict()
        sales = OrderedDict()
        total = OrderedDict()

        inc["geography"] = geographyDict(row[1])
        corpInc["geography"] = geographyDict(row[1])
        sales["geography"] = geographyDict(row[1])
        total["geography"] = geographyDict(row[1])

        sales["value"] = parseCell(row[2])
        inc["value"] = parseCell(row[3])
        corpInc["value"] = parseCell(row[4])
        total["value"] = parseCell(row[5])


        figureData["INC"]["data"].append(inc)
        figureData["CORPINC"]["data"].append(corpInc)
        figureData["SALES"]["data"].append(sales)
        figureData["TOTAL"]["data"].append(total)


def parseWage():
    cr = csv.reader(open("data/source/sheets/current_wage.csv","rU"))
    title = cr.next()
    header = cr.next()
    newCode("AWW","Average weekly earnings")
    newCode("AWWChg","Change in real average weekly earnings")
    for row in cr:
        if row[0] == "":
            #after last state there are some empty rows with notes, we don't want these
            break
        aww = OrderedDict()
        awwChg = OrderedDict()

        aww["geography"] = geographyDict(row[1])
        awwChg["geography"] = geographyDict(row[1])

        aww["value"] = parseCell(row[2])
        awwChg["value"] = parseCell(row[3])

        figureData["AWW"]["data"].append(aww)
        figureData["AWWChg"]["data"].append(awwChg)

    with open("js/figureData.js", "w") as fp:
        fp.write("var figureData = ")
        fp.write(json.dumps(figureData, sort_keys=False))
        fp.write("\nvar EMP_DATE=\""+EMP_DATE + "\"")
        fp.write("\nvar TAX_DATE=\""+TAX_DATE + "\"")
        fp.write("\nvar DOWNLOAD_FILE_NAME=\""+downloadFileName() + "\"")
        fp.write("\nvar DOWNLOAD_TAB_NAME="+json.dumps(downloadTabNames()))

def createXLS():
    tabs = downloadTabNames()
    book = xlwt.Workbook()

    employment = book.add_sheet(tabs["employment"])
    employment.write(0,0,"state_name")
    employment.write(0,1,"state_postal_code")
    employment.write(0,2,"state_FIPS")
    employment.write(0,3,"census_region")

    employment.write(0,4,"unemployment_rate_(%)")
    employment.write(0,5,"unemployment_rate_(percent_change_year_over_year)")
    employment.write(0,6,"total_nonfarm_payroll_employment_(percent_change_year_over_year)")
    employment.write(0,7,"public_sector_employment_(percent_change_year_over_year)")

    unempData = figureData['UNEMP']['data']
    unempChgData = figureData['UNEMPChg']['data']
    empChgData = figureData['EMP']['data']
    govtData = figureData['GOVT']['data']

    for i in range (0, len(unempData)):
        row = i+1
        obj = unempData[i]
        employment.write(row, 0, obj["geography"]["name"])
        employment.write(row, 1, obj["geography"]["code"])
        if obj["geography"]["fips"] != "-99":
            employment.write(row, 2, obj["geography"]["fips"])
        else:
            employment.write(row, 2, 'NA')
        employment.write(row, 3, obj["geography"]["region"])
        employment.write(row, 4, obj["value"])
        for secondObj in unempChgData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 employment.write(row, 5, secondObj["value"])
                 break
        for secondObj in empChgData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 employment.write(row, 6, secondObj["value"])
                 break
        for secondObj in govtData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 employment.write(row, 7, secondObj["value"])
                 break



    wages = book.add_sheet(tabs["wages"])
    wages.write(0,0,"state_name")
    wages.write(0,1,"state_postal_code")
    wages.write(0,2,"state_FIPS")
    wages.write(0,3,"census_region")

    wages.write(0,4,"average_weekly_earnings-all_private_employees_($)")
    wages.write(0,5,"average_weekly_earnings-all_private_employees_(percent_change_year_over_year)")

    awwData = figureData['AWW']['data']
    awwChgData = figureData['AWWChg']['data']

    for i in range (0, len(awwData)):
        row = i+1
        obj = awwData[i]
        wages.write(row, 0, obj["geography"]["name"])
        wages.write(row, 1, obj["geography"]["code"])
        if obj["geography"]["fips"] != "-99":
            wages.write(row, 2, obj["geography"]["fips"])
        else:
            wages.write(row, 2, 'NA')
        wages.write(row, 3, obj["geography"]["region"])
        wages.write(row, 4, obj["value"])
        for secondObj in awwChgData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 wages.write(row, 5, secondObj["value"])
                 break



    housing = book.add_sheet(tabs["housing"])
    housing.write(0,0,"state_name")
    housing.write(0,1,"state_postal_code")
    housing.write(0,2,"state_FIPS")
    housing.write(0,3,"census_region")

    housing.write(0,4,"housing_price_one_year_change_(percent_change_year_over_year)")
    housing.write(0,5,"housing_price_change_since_q1_2007_(percent_change)")

    hpChgYrData = figureData['HPChgYr']['data']
    hpChgPeakData = figureData['HPChgPeak']['data']

    for i in range (0, len(hpChgYrData)):
        row = i+1
        obj = hpChgYrData[i]
        housing.write(row, 0, obj["geography"]["name"])
        housing.write(row, 1, obj["geography"]["code"])
        if obj["geography"]["fips"] != "-99":
            housing.write(row, 2, obj["geography"]["fips"])
        else:
            housing.write(row, 2, 'NA')
        housing.write(row, 3, obj["geography"]["region"])
        housing.write(row, 4, obj["value"])
        for secondObj in hpChgPeakData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 housing.write(row, 5, secondObj["value"])
                 break



    taxes = book.add_sheet(tabs["taxes"])
    taxes.write(0,0,"state_name")
    taxes.write(0,1,"state_postal_code")
    taxes.write(0,2,"state_FIPS")
    taxes.write(0,3,"census_region")

    taxes.write(0,4,"total_tax_revenue_(percent_change_year_over_year)")
    taxes.write(0,5,"personal_income_tax_revenue_(percent_change_year_over_year)")
    taxes.write(0,6,"corporate_income_tax_revenue_(percent_change_year_over_year)")
    taxes.write(0,7,"sales_tax_revenue_(percent_change_year_over_year)")

    totalData = figureData['TOTAL']['data']
    incPeakData = figureData['INC']['data']
    corpincData = figureData['CORPINC']['data']
    salesData = figureData['SALES']['data']

    for i in range (0, len(totalData)):
        row = i+1
        obj = totalData[i]
        taxes.write(row, 0, obj["geography"]["name"])
        taxes.write(row, 1, obj["geography"]["code"])
        if obj["geography"]["fips"] != "-99":
            taxes.write(row, 2, obj["geography"]["fips"])
        else:
            taxes.write(row, 2, 'NA')
        taxes.write(row, 3, obj["geography"]["region"])
        taxes.write(row, 4, obj["value"])
        for secondObj in incPeakData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 taxes.write(row, 5, secondObj["value"])
                 break
        for secondObj in corpincData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 taxes.write(row, 6, secondObj["value"])
                 break
        for secondObj in salesData:
             if secondObj["geography"]["fips"] == obj["geography"]["fips"]:
                 taxes.write(row, 7, secondObj["value"])
                 break

    book.save('data/download/' + downloadFileName())

def downloadFileName():
    return 'SEM_data_employment-'+EMP_DATE.replace("/","-")+"_tax-"+ quarter(TAX_DATE) + ".xls"
def downloadTabNames():
    return {"employment":"employment_" + EMP_DATE.replace("/","-"), "wages":"wages_" + EMP_DATE.replace("/","-"),"housing":"housing_" + quarter(TAX_DATE),"taxes":"taxes_" + quarter(TAX_DATE)}
def quarter(d):
    month = d.split("/")[0]
    year = d.split("/")[1]
    q = ceil(float(month)/3.0)
    return 'Q' + str(int(q)) + "-" + year

def parseData():
    parseXlSX("current_employment")
    parseXlSX("current_wage")
    parseXlSX("current_tax")
    parseXlSX("current_housing")
    parseTax()
    parseHousing()
    parseEmployment()
    parseWage()

    createXLS()

buildStateFIPS()
parseData()