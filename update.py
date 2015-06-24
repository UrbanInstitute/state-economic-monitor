# from flask import render_template, Flask, url_for

# app = Flask(__name__)

# @app.route('/hello')
# def hello(name=None):
#   url_for('static', filename='testTags.js')
#   return render_template('search.html')


import csv
import json
import os
from flask import Flask, jsonify, render_template, request, session, redirect, current_app
app = Flask(__name__)

@app.route("/upload", methods=["POST", "GET"])
def upload():
  file = request.files['file']
  sheet = request.args.get('sheet', '', type=str)
  file.save(file.filename)
  # uploaded_files = request.files.getlist("file[]")
  # request.files.save()
  # print uploaded_files
  return ""

@app.route('/add')
def build_ingredient():
  # new_config = {}
  with open('config.json') as config_file:    
    old_config = json.load(config_file)
  amount = request.args.get('amount', '', type=str)
  f1 = open('employment.html', 'r')
  f2 = open('employment.html.tmp', 'w')
  for line in f1:
    f2.write(line.replace(old_config["test"].encode("utf8"), amount.encode("utf8")))
  f1.close()
  f2.close()
  # unit = request.args.get('unit', '', type=str)
  # ingredient = request.args.get('ingredient', '', type=str)
  #   # cw = csv.writer(open("new.csv","wb"))
  #   # cw.writerow([amount,unit])
  #   def parseAmount(amount):
    # if(amount.find("/") == -1):
    #   return float(amount)
    # else:
    #   nom = float(amount.split("/")[0])
    #   denom = float(amount.split("/")[1])
    #   return nom/denom
  return jsonify(result="foo")
  # return jsonify(amount=parseAmount(amount), unit=unit, ingredient=ingredient, result=amount + " " + unit + " " + ingredient)

@app.route('/')
def index():
  return render_template('update.html')

if __name__ == '__main__':
  app.debug = True
  app.run()