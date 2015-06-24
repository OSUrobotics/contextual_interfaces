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


if __name__ == '__main__':
    conn.row_factory = dict_factory
    c = conn.cursor()
    c.execute('SELECT * from controls')
    control_dict = {}
    # for opts, controlId, widget, display_name in c.fetchall():
    for d in c.fetchall():
        options = {}
        if d['options']:
            options.update(json.loads(d['options']))
        else: d['options'] = {}
        if d['display_name']:
            options['display_name'] = d['display_name']
        del d['display_name']
        d['options'] = options
        control_dict[d['controlId']] = d
    print json.dumps(control_dict, indent=2)