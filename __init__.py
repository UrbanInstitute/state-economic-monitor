# from flask import render_template, Flask, url_for

# app = Flask(__name__)

# @app.route('/hello')
# def hello(name=None):
#   url_for('static', filename='testTags.js')
#   return render_template('search.html')


import csv
from json import dump
from shutil import copy2
from subprocess import call
import re
import fileinput
import os
from flask import Flask, jsonify, render_template, request, session, redirect, current_app
from pdfkit import from_url, from_file
app = Flask(__name__)
from math import ceil
import logging


logging.basicConfig(level=logging.DEBUG)

# rootPath = "/var/www/html/semapp/"
# pyPath = "/usr/bin/python"

rootPath = "/Users/bchartof/Projects/state-economic-monitor/"
pyPath = "/usr/bin/python2.7"

@app.route("/upload", methods=["POST", "GET"])
def upload():
  if request.method == 'POST':
    file = request.files['file']
    sheet = request.args.get('sheet', '', type=str)
    print sheet
    file.save(rootPath + "static/data/source/" + sheet + ".xlsx")

  return ""

@app.route('/add', methods=["POST", "GET"])
def update_SEM():
  print request.json

  #write a pretty printed json for human readability
  with open(rootPath + 'static/data/cards/prettyCards.json', 'wt') as out:
      res = dump(request.json, out, sort_keys=True, indent=4, separators=(',', ': '))

  #write a one line json for consumption in JS
  with open(rootPath + 'static/data/cards/cards.json', 'wt') as out:
      res = dump(request.json, out, sort_keys=True, separators=(',', ':'))

  os.system(pyPath + " " + rootPath + "reshape.py")
  os.system(pyPath + " " + rootPath + "zipper.py")
  


  return jsonify({})

@app.route('/')
def index():
  return render_template('updater.html')
@app.route('/preview')
def preview():
  return render_template('preview.html')

if __name__ == '__main__':
  app.debug = True
  app.run(threaded=True)
