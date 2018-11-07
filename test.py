from pyhive import presto

cursor = presto.connect(host='ussltccsl2097.solutions.glbsnet.com',
                        port=10000,
                        username='miauser:Miauser.1').cursor()
cursor.execute('SELECT * FROM CALL_DTL LIMIT 1')
print(cursor)
'''
from impala.dbapi import connect

conn = connect(host="jdbc:hive2://ussltccsl2097.solutions.glbsnet.com", port=10000
               ,user="miauser",password="Miauser.1",database="default",auth_mechanism="NOSASL")
cursor = conn.cursor()
cursor.execute('SELECT * FROM CALL_DTL LIMIT 1')
print(cursor.description)
'''