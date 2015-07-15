#!/usr/bin/env python
import json
import sqlite3
from pprint import pprint

conn = sqlite3.connect('/home/lazewatd/Dropbox/dev/wheelchair_ws/src/contextual_interfaces/data/ui-elements.db')

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_usage(controlId):
    c = conn.cursor()
    c.execute("SELECT count, zone_id FROM control_usage WHERE controlId = ?", (controlId,))
    usage = {}
    for row in c.fetchall():
        usage[row['zone_id']] = row['count']
    return usage

if __name__ == '__main__':
    conn.row_factory = dict_factory
    c = conn.cursor()
    c.execute('SELECT * from controls')
    control_dict = {}
    # for opts, controlId, widget, display_name in c.fetchall():
    for d in c.fetchall():
        options = {'ignore': d['ignore']}
        if d['options']:
            options.update(json.loads(d['options']))
        else: d['options'] = {}
        if d['display_name']:
            options['display_name'] = d['display_name']
        del d['display_name']
        d['options'] = options
        d['usage'] = get_usage(d['controlId'])
        control_dict[d['controlId']] = d

    c.execute('SELECT * from devices')
    device_dict = {}
    for d in c.fetchall():
        deviceId = d['deviceId']
        del d['deviceId']
        device_dict[deviceId] = d
        # print d
    print json.dumps({'controls': control_dict, 'devices': device_dict}, indent=2)