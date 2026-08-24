import csv
from json import dump
from shutil import copy2
import subprocess
import re
import fileinput
import os
from flask import Flask, jsonify, render_template, request, session, redirect, current_app
from werkzeug.utils import secure_filename
app = Flask(__name__)
from math import ceil
import logging


logging.basicConfig(level=logging.DEBUG)

rootPath = "/var/www/html/semapp/"
pyPath = "/usr/bin/python"

# rootPath = "/Users/silke/Repos/state-economic-monitor/"
# pyPath = "python3"

ALLOWED_INDICATORS = {
    "federal_public_employment", "house_price_index", "private_employment",
    "public_employment", "state_and_local_public_employment", "state_gdp",
    "total_employment", "unemployment_rate", "weekly_earnings",
    "state_and_local_public_education_employment",
    "leisure_and_hospitality_employment", "manufacturing_employment",
    "retail_trade_employment", "accommodation_and_food_services_state_gdp",
    "retail_trade_state_gdp", "government_state_gdp", "manufacturing_state_gdp"
}

@app.route("/upload", methods=["POST", "GET"])
def upload():
  if request.method == 'POST':
    file = request.files['file']
    sheet = request.args.get('sheet', '', type=str)
    print(sheet)
    if sheet not in ALLOWED_INDICATORS:
      return "Invalid indicator", 400
    safe_sheet = secure_filename(sheet)
    file.save(rootPath + "static/data/source/" + safe_sheet + ".xlsx")

  return ""

@app.route('/add', methods=["POST", "GET"])
def update_SEM():
  print(request.json)

  #write a pretty printed json for human readability
  with open(rootPath + 'static/data/cards/prettyCards.json', 'wt') as out:
      res = dump(request.json, out, sort_keys=True, indent=4, separators=(',', ': '))

  #write a one line json for consumption in JS
  with open(rootPath + 'static/data/cards/cards.json', 'wt') as out:
      res = dump(request.json, out, sort_keys=True, separators=(',', ':'))

  subprocess.run([pyPath, rootPath + "reshape.py"], check=True)
  subprocess.run([pyPath, rootPath + "zipper.py"], check=True)


  return jsonify({})

@app.route('/')
def index():
  return render_template('updater.html')
@app.route('/preview')
def preview():
  return render_template('preview.html')

if __name__ == '__main__':
  app.debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
  app.run(threaded=True)
