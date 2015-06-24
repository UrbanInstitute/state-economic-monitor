# from flask import render_template, Flask, url_for

# app = Flask(__name__)

# @app.route('/hello')
# def hello(name=None):
#   url_for('static', filename='testTags.js')
#   return render_template('search.html')


import csv
import json
from shutil import copy2
import os
from flask import Flask, jsonify, render_template, request, session, redirect, current_app
app = Flask(__name__)

@app.route("/upload", methods=["POST", "GET"])
def upload():
  file = request.files['file']
  sheet = request.args.get('sheet', '', type=str)
  file.save("data/source/" + "current_" + sheet + ".xlsx")
  copy2("data/source/" + "current_" + sheet + ".xlsx", "data/source/previous_releases/" + file.filename)
  return ""

@app.route('/add', methods=["POST", "GET"])
def update_SEM():
  # new_config = {}
  with open('config.json') as config_file:
    old_config = json.load(config_file)
  print request.json["foo"] 
  # amount = request.args.get('amount', '', type=str)
  # f1 = open('employment.html', 'r')
  # f2 = open('employment.html.tmp', 'w')
  # for line in f1:
  #   f2.write(line.replace(old_config["test"].encode("utf8"), amount.encode("utf8")))
  # f1.close()
  # f2.close()
  return ""

@app.route('/')
def index():
  return render_template('update.html')

if __name__ == '__main__':
  app.debug = True
  app.run()