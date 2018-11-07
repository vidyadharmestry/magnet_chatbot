#!/usr/bin/env python

from __future__ import print_function
from future.standard_library import install_aliases
import cx_Oracle
install_aliases()
import json
import os
import sys
import pandas as pd
sys.path.append('cognitiveSQL')
from flask import Flask,session
from flask import request
from flask import make_response
from flask import url_for, redirect
from flask_socketio import SocketIO, send, emit
import subprocess
#import cognitiveSQL.Database as Database
#import cognitiveSQL.LangConfig as LangConfig
#import cognitiveSQL.Parser as Parser
#import cognitiveSQL.Thesaurus as Thesaurus
#import cognitiveSQL.StopwordFilter as StopwordFilter
#from cognitiveSQL.HashMap import hashMap_columns
from urllib.parse import urlparse, urlencode
from urllib.request import urlopen, Request
from urllib.error import HTTPError
import datetime
import math
import psycopg2
import apiai
import requests
# Flask app should start in global layout
app = Flask(__name__, static_url_path='')



socketio = SocketIO(app)
app.secret_key = 'my unobvious secret key'



parser = ""
baseUrl = "https://api.dialogflow.com/v1/query?v=20170712"
accessToken = "66ad5ee869a34d3593181c0f9ff0922c"

# @app.route('/')
# def index():
#     return redirect(url_for('static_url', filename='index.html'))

def select_inquiry_response(prod_name, columnName,indication):
    try:
        url = urlparse(
            "postgres://caedtehsggslri:4679ba0abec57484a1d7ed261b74e80b08391993433c77c838c58415087a9c34@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d5tmi1ihm5f6hv")
        print(url.path[1:])
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        cur = conn.cursor()
        sql = "select " + columnName + " from public.inquiry_response where product_name = '%s' and indication = '%s' limit %s" %(prod_name,indication,1)
        print(sql)
        cur.execute(sql)
        row = cur.fetchone()
        #print(row[1])
        #print("The number of parts: ", cur.rowcount)
        cur.close()
        return row
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

def select_temp_data():
    try:
        url = urlparse(
            "postgres://caedtehsggslri:4679ba0abec57484a1d7ed261b74e80b08391993433c77c838c58415087a9c34@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d5tmi1ihm5f6hv")
        print(url.path[1:])
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        cur = conn.cursor()
        sql = "select header,header_value from public.mia_temp_param"
        print(sql)
        cur.execute(sql)
        row = cur.fetchall()
        #print(row[1])
        #print("The number of parts: ", cur.rowcount)
        cur.close()
        return row
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

def truncate_temp_table():
    try:
        url = urlparse(
            "postgres://caedtehsggslri:4679ba0abec57484a1d7ed261b74e80b08391993433c77c838c58415087a9c34@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d5tmi1ihm5f6hv")
        print(url.path[1:])
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        cur = conn.cursor()
        sql = "DELETE FROM public.mia_temp_param"
        print(sql)
        cur.execute(sql)
        #print(row[1])
        print("The number of parts: ", cur.rowcount)
        conn.commit()
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

def insert_into_temp(header,header_value):
    sql = "INSERT INTO public.mia_temp_param (header,header_value) VALUES(%s, %s)";

    try:
        # read database configuration
        # params = config()
        # connect to the PostgreSQL database
        url = urlparse(
            "postgres://caedtehsggslri:4679ba0abec57484a1d7ed261b74e80b08391993433c77c838c58415087a9c34@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d5tmi1ihm5f6hv")
        # print(url.path[1:])
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        # create a new cursor
        cur = conn.cursor()
        # execute the INSERT statement
        cur.execute(sql, (header, header_value))
        # commit the changes to the database
        conn.commit()
        # close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

def insert_into_temp(list):
    sql = "INSERT INTO public.mia_temp_param (header,header_value) VALUES(%s, %s)";

    try:
        # read database configuration
        # params = config()
        # connect to the PostgreSQL database
        url = urlparse(
            "postgres://caedtehsggslri:4679ba0abec57484a1d7ed261b74e80b08391993433c77c838c58415087a9c34@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d5tmi1ihm5f6hv")
        # print(url.path[1:])
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        # create a new cursor
        cur = conn.cursor()
        for x in list:
            # execute the INSERT statement
            cur.execute(sql, (x[0],x[1]))
            # commit the changes to the database
            conn.commit()
        # close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

 #Cur.execute("truncate mytable;")

def insert_inquiry_details(division,country,master_prod,inquiry,customer_type,customer_channel,facilitated_unfacilitated,case_create_dt,case_clsd_dt,resp_id,response,user_mail_id,query_category):

    sql = "INSERT INTO public.inquiry_data (Division,Country,Master_Prod ,Inquiry,Customer_Type,Customer_channel,Facilitated_Unfacilitated,Case_Create_Date,Case_Closed_Date,Resp_Id,Response,user_mail_id,query_category) VALUES(%s, %s, %s, %s, %s, %s,%s,%s, %s, %s, %s, %s, %s)";

    try:
        # read database configuration
        #params = config()
        # connect to the PostgreSQL database
        url = urlparse(
            "postgres://caedtehsggslri:4679ba0abec57484a1d7ed261b74e80b08391993433c77c838c58415087a9c34@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d5tmi1ihm5f6hv")
        #print(url.path[1:])
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        # create a new cursor
        cur = conn.cursor()
        # execute the INSERT statement
        cur.execute(sql,(division,country,master_prod,inquiry,customer_type,customer_channel,facilitated_unfacilitated,case_create_dt,case_clsd_dt,resp_id,response,user_mail_id,query_category))
        # commit the changes to the database
        conn.commit()
        # close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

@app.route('/speech')
def speech():
    return redirect(url_for('static', filename='speech.html'))

@app.route('/visualization')
def visualization():
    return redirect(url_for('static', filename='visualization.html'))

# @app.route('/inventory')
# def inventory():d
#     return redirect(url_for('static_url', filename='index.html'))

@app.route('/emailAffair', methods=['POST'])
def emailAffair():
    req = request.get_json(silent=True, force=True)
    print("Request")
    action = ""
    speech = ""
    productName = ""
    print(json.dumps(req, indent=4))
    if (req.get("inquiryQuestion") is not None or req.get("inquiryQuestion") != ""):
        print(req.get("age"))
        if req.get("age") == "":
            age = "0"
        else:
            age = req.get("age")

        if (req.get("location") == ""):
            location = "India"
        else:
            location = req.get("location")

        if (req.get("profession") == ""):
            profession = "Doc"
        else:
            profession = req.get("profession")

        values = json.dumps({
                "lang": "en",
                "query": req.get("inquiryQuestion")+" "+age+" "+profession+" "+location,
                "sessionId": "12345",
                "timezone": "America/New_York"
            })
        headers ={
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+accessToken
                }
        res = json.loads(requests.post(url=baseUrl, data=values,headers=headers).text)
        print(res.get("result").get("fulfillment").get("speech"))
        action = res.get("result").get("action")
        speech = res.get("result").get("fulfillment").get("speech")
        productName = res.get("result").get("parameters").get("ProductName")

    res = json.dumps({
            "category": action,
            "response": speech,
            "ProductName": productName
        }, indent=4)
    print(res)
    r = make_response(res)
    r.headers['Content-Type'] = 'application/json'
    return r

@app.route('/bookMeeting', methods=['POST'])
def medicalAffair():
    req = request.get_json(silent=True, force=True)

    print("Request:")
    print(json.dumps(req, indent=4))

    res = processRequest(req)

    res = json.dumps(res, indent=4)
    print(res)
    r = make_response(res)
    r.headers['Content-Type'] = 'application/json'
    return r


def processRequest(req):
    if (req.get("queryResult").get("parameters").get("userid") != "") and (
        req.get("queryResult").get("parameters").get("date") != "") and (
        req.get("queryResult").get("parameters").get("geo-city") != "") and (
        req.get("queryResult").get("parameters").get("number") != "") and (
        req.get("queryResult").get("parameters").get("time-period") != ""):
            if (req.get("queryResult").get("parameters").get("time-period").get("startTime") != "") and (
                req.get("queryResult").get("parameters").get("time-period").get("endTime") != "") :
                    return {
                        "speech": "Thank you for your time. We are processing your request, you will hear from us shortly",
                        "displayText": "Thank you for your time. Have a good day",
                        "source": "agent"
                        }

if __name__ == '__main__':
    #database = Database.Database()
    #database.load("cognitiveSQL/database/HCM.sql")
    #database.print_me()

    #config = LangConfig.LangConfig()
    #config.load("cognitiveSQL/lang/english.csv")

    #parser = Parser.Parser(database, config)
    from os import sys, path
    sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
    port = int(os.getenv('PORT', 5001))

    print("Starting app on port %d" % port)

    #app.run(debug=True, port=port, host='0.0.0.0')
    socketio.run(app, debug=True, port=port, host='0.0.0.0')