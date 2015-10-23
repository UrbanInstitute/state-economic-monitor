# from flask import render_template, Flask, url_for

# app = Flask(__name__)

# @app.route('/hello')
# def hello(name=None):
#   url_for('static', filename='testTags.js')
#   return render_template('search.html')


import csv
import json
from shutil import copy2
from subprocess import call
import re
import fileinput
import os
from flask import Flask, jsonify, render_template, request, session, redirect, current_app
from pdfkit import from_url, from_file
app = Flask(__name__)

@app.route("/upload", methods=["POST", "GET"])
def upload():
  file = request.files['file']
  sheet = request.args.get('sheet', '', type=str)
  # print sheet
  file.save("data/source/" + "current_" + sheet + ".xlsx")
  copy2("data/source/" + "current_" + sheet + ".xlsx", "data/source/previous_releases/" + file.filename)
  return ""

@app.route('/add', methods=["POST", "GET"])
def update_SEM():
  # new_config = {}
  figures = [["wages",["AWW","AWWChg"]], ["employment",["UNEMP", "Figure1", "EMP", "Figure2"]], ["housing",["HPChgYr","Figure3"]], ["taxes",["TOTAL","INC","CORPINC","SALES"]]]
  with open('static/config.json') as config_file:
    old_config = json.load(config_file)
  new_config = request.json
  config_file.close()
  # return redirect("/upload")
  # amount = request.args.get('amount', '', type=str)

  def replaceText(old, new):
    for line in fileinput.input("wages.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("templates/wages_preview.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("pdf/templates/wages_pdf.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line

    for line in fileinput.input("employment.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("templates/employment_preview.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("pdf/templates/employment_pdf.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line

    for line in fileinput.input("housing.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("templates/housing_preview.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("pdf/templates/housing_pdf.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line

    for line in fileinput.input("taxes.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("templates/taxes_preview.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("pdf/templates/taxes_pdf.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line

  def replaceBreaks(figure, new):
    matched = False
    for line in fileinput.input("js/semConfig.js", inplace=1):
      if re.search('\"' + figure + '\".*\{', line):
        matched = True
      if re.search('\"breaks\"', line) and matched:
        line = re.sub(r'(.*)(\[.*\])(.*)',r'\1[' + ','.join(map(str,new)) + r']\3',line)
        matched = False
      print(line.rstrip())

    matched = False
    for line in fileinput.input("static/js/semConfig.js", inplace=1):
      if re.search('\"' + figure + '\".*\{', line):
        matched = True
      if re.search('\"breaks\"', line) and matched:
        line = re.sub(r'(.*)(\[.*\])(.*)',r'\1[' + ','.join(map(str,new)) + r']\3',line)
        matched = False
      print(line.rstrip())

  def replaceDate(old, new):
    for line in fileinput.input("index.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line
    for line in fileinput.input("templates/index_preview.html", inplace=1):
      line = line.replace(old.encode("utf8"), new.encode("utf8")).rstrip()
      print line    

    # matched = False
    # for line in fileinput.input("js/semConfig.js", inplace=1):
    #   # line = re.sub("(\"AWW\".*)\n.*\"id", "foo", line.rstrip(), flags=re.DOTALL)
    #   if re.search('\"' + figure + '\".*\{', line):
    #     matched = True
    #   if re.search('\"breaks\"', line) and matched:
    #     line = re.sub(r'(.*)(\[.*\])(.*)',r'\1[' + ','.join(map(str,new)) + r']\3',line)
    #     matched = False
  replaceDate(old_config["dateUpdated"], new_config["dateUpdated"])
  for fig in figures:
    sheet = fig[0]
    for figure in fig[1]:
      replaceText(old_config[sheet][figure]["text"], new_config[sheet][figure]["text"])
      # print old_config[sheet][figure]["text"]
      # print ""
      # print new_config[sheet][figure]["text"]
      # print ""
      if "breaks" in new_config[sheet][figure]:
        replaceBreaks(figure, new_config[sheet][figure]["breaks"])

  f=open("static/config.json",'w')
  f.write(json.dumps(new_config, indent=4, sort_keys=True).encode("utf8"))
  f.close();
  
  os.system("python reshape_data.py " + new_config["employment"]["date"] + " " + new_config["taxes"]["date"] + " " + new_config["wages"]["date"] + " " + new_config["housing"]["date"])

  os.system("depict http://localhost:8080/employment.html -s '#figure_unemployment' -d 500 pdf/images/figure_unemployment.png")
  os.system("depict http://localhost:8080/employment.html -s '#figure_level_vs_change_unemployment' -d 500 pdf/images/figure_level_vs_change_unemployment.png")
  os.system("depict http://localhost:8080/employment.html -s '#figure_nonfarm-employment' -d 500 pdf/images/figure_nonfarm-employment.png")
  os.system("depict http://localhost:8080/employment.html -s '#total_change_emp_vs_public_change_emp' -d 500 pdf/images/total_change_emp_vs_public_change_emp.png")

  os.system("depict http://localhost:8080/wages.html -s '#figure_wages' -d 500 pdf/images/figure_wages.png")
  os.system("depict http://localhost:8080/wages.html -s '#figure_wages-change' -d 500 pdf/images/figure_wages-change.png")

  os.system("depict http://localhost:8080/housing.html -s '#figure_house-prices' -d 500 pdf/images/figure_house-prices.png")
  os.system("depict http://localhost:8080/housing.html -s '#housing_change_vs_2007_housing_change' -d 500 pdf/images/housing_change_vs_2007_housing_change")

  os.system("depict http://localhost:8080/taxes.html -s '#figure_total-taxes' -d 500 pdf/images/figure_total-taxes.png")
  os.system("depict http://localhost:8080/taxes.html -s '#figure_sales-taxes' -d 500 pdf/images/figure_sales-taxes.png")
  os.system("depict http://localhost:8080/taxes.html -s '#figure_income-taxes' -d 500 pdf/images/figure_income-taxes.png")
  os.system("depict http://localhost:8080/taxes.html -s '#figure_corporate-taxes' -d 500 pdf/images/figure_corporate-taxes.png")

  # os.system("http-server")
  from_file('pdf/templates/employment_pdf.html', 'aaaemployment.pdf', css = "./css/sem.css")
  from_file('pdf/templates/wages_pdf.html', 'aaawages.pdf', css = "./css/sem.css")
  from_file('pdf/templates/housing_pdf.html', 'aaahousing.pdf', css = "./css/sem.css")
  from_file('pdf/templates/taxes_pdf.html', 'aaataxes.pdf', css = "./css/sem.css")

  tmp = "<!-- NEW EMPLOYMENT HERE -->"
  tmp2 = tmp + "\n" + "foo"
  for line in fileinput.input("archive.html", inplace=1):
    line = line.replace(tmp.encode("utf8"), tmp2.encode("utf8")).rstrip()
    print line


  return jsonify({})

@app.route('/')
def index():
  return render_template('update.html')

@app.route('/preview')
def preview():
  # os.system()
  # call(['./test.sh'])
  return render_template('index_preview.html')







# @app.route('/employment_pdf.html')
# def employment_pdf():
#   return render_template('employment_pdf.html')
# @app.route('/wages_pdf.html')
# def wages_pdf():
#   return render_template('wages_pdf.html')
# @app.route('/taxes_pdf.html')
# def taxes_pdf():
#   return render_template('taxes_pdf.html')
# @app.route('/housing_pdf.html')
# def housing_pdf():
#   return render_template('housing_pdf.html')  
@app.route('/employment.html')
def employment():
  return render_template('employment_preview.html')
@app.route('/wages.html')
def wages():
  return render_template('wages_preview.html')
@app.route('/taxes.html')
def taxes():
  return render_template('taxes_preview.html')
@app.route('/housing.html')
def housing():
  return render_template('housing_preview.html')  
@app.route('/archive.html')
def archive():
  return render_template('archive_preview.html')  
@app.route('/index.html')
def index_preview():
  return render_template('index_preview.html')


if __name__ == '__main__':
  app.debug = True
  app.run()