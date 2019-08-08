from zipfile import ZipFile
from shutil import copyfile

rootPath = "/var/www/html/semapp/"

def createZip(fileNames, zipName):
	zipObj = ZipFile(rootPath + 'static/data/download/%s.zip'%zipName, 'w')
	 
	for fileName in fileNames:
		zipObj.write(rootPath + 'static/data/csv/%s.csv'%fileName, rootPath + '%s.csv'%fileName)

	zipObj.close()

createZip(["weekly_earnings_raw","weekly_earnings_yoy_percent_change"],"weekly_earnings-all_data")
createZip(["state_gdp_raw_in_millions","state_gdp_yoy_percent_change"],"state_gdp-all_data")
createZip(["weekly_earnings_raw","weekly_earnings_yoy_percent_change"],"weekly_earnings-all_data")
createZip(["federal_public_employment_raw_in_thousands","federal_public_employment_yoy_percent_change","private_employment_raw_in_thousands","private_employment_yoy_percent_change","public_employment_raw_in_thousands","public_employment_yoy_percent_change","state_and_local_public_education_employment_raw_in_thousands","state_and_local_public_education_employment_yoy_percent_change","state_and_local_public_employment_raw_in_thousands","state_and_local_public_employment_yoy_percent_change","total_employment_raw_in_thousands","total_employment_yoy_percent_change","unemployment_rate_raw"],"employment_all_indicators-all_data")
createZip(["weekly_earnings_raw","weekly_earnings_yoy_percent_change","state_gdp_raw_in_millions","state_gdp_yoy_percent_change","house_price_index_yoy_percent_change","federal_public_employment_raw_in_thousands","federal_public_employment_yoy_percent_change","private_employment_raw_in_thousands","private_employment_yoy_percent_change","public_employment_raw_in_thousands","public_employment_yoy_percent_change","state_and_local_public_education_employment_raw_in_thousands","state_and_local_public_education_employment_yoy_percent_change","state_and_local_public_employment_raw_in_thousands","state_and_local_public_employment_yoy_percent_change","total_employment_raw_in_thousands","total_employment_yoy_percent_change","unemployment_rate_raw"],"all_indicators-all_data")

copyfile(rootPath + "static/data/csv/" + "house_price_index_yoy_percent_change.csv", rootPath + "static/data/download/house_price_index_yoy_percent_change.csv")
