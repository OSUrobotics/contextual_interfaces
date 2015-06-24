#!/usr/bin/env python
import json
import sqlite3
conn = sqlite3.connect('/home/lazewatd/Dropbox/dev/wheelchair_ws/src/contextual_interfaces/data/ui-elements.db')
c = conn.cursor()

TEMP = 2099, 2104, 2105
VOL = 4893,

def insert(control):
    query = ''
    if control['name'] in ('Light', 'Door'): # switches
        query = '''INSERT INTO controls (controlId, widget) VALUES (?, ?)'''
        args = (control['id'], 'switch')

    elif int(control['id']) in TEMP + VOL:
        query = '''INSERT INTO controls (controlId, widget, options) VALUES (?, ?, ?)'''
        args = (control['id'],

                'infoDisplay',
                json.dumps({
                   'textPre': '',
                   'textPost': 'F' if control['id'] in TEMP else ''
                })
               )
    else:
        query = '''INSERT INTO controls (controlId, widget, options) VALUES (?, ?, ?)'''
        args = (control['id'],
                'button',
                json.dumps({
                   'type': 'momentary'
                })
               )

    try:
        if query:
            c.execute(query, args)
    except sqlite3.IntegrityError:
        # already inserted - ignore
        pass


with open('/home/lazewatd/Dropbox/dev/wheelchair_ws/src/peac_bridge/scripts/testjson/controls.json', 'r') as f:
    controls = json.load(f)

for deviceId, controls in controls.iteritems():
    for control in controls:
        insert(control)

conn.commit()
conn.close()