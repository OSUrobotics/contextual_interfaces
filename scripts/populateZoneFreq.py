#!/usr/bin/env python
import yaml
import sqlite3
conn = sqlite3.connect('/home/lazewatd/Dropbox/dev/wheelchair_ws/src/contextual_interfaces/data/ui-elements.db')
c = conn.cursor()

IDLESS = {
    'Heat' : 2104,
    'Cool' : 2105
}


def get_zone_id(zone):
    c.execute("SELECT COUNT(zone_id) from zones where name = ?", (zone,))
    nrows = c.fetchone()[0]
    if nrows > 0:
        c.execute("SELECT zone_id from zones WHERE name = ?", (zone,))
        return c.fetchone()[0]
    else:
        c.execute("INSERT INTO zones (name) VALUES (?)", (zone,))
        return c.lastrowid

def get_zone_control_count(zone, control):
    c.execute("SELECT COUNT(zone_id) from control_usage where zone_id = ? and controlId = ?", (zone,control))
    count = c.fetchone()[0]
    if count == 0:
        return 0
    else:
        c.execute("SELECT count from control_usage where zone_id = ? and controlId = ?", (zone,control))
        return c.fetchone()[0]


def increment_count(zone, control):
    count = get_zone_control_count(zone, control)
    if count == 0:
        c.execute("INSERT INTO control_usage (zone_id, controlId, count) VALUES(?, ?, 1)", (zone, control))
    else:
        c.execute("UPDATE control_usage SET count = ? WHERE zone_id = ? and controlId = ?", (count + 1, zone, control))


def insert(zone, control):
    controlId = control['control']['controlId']
    if controlId:
        zone_id = get_zone_id(zone)
        increment_count(zone, controlId)
    elif control['caption'] in IDLESS.keys():
        controlId = IDLESS[control['caption']]
        increment_count(zone, controlId)


with open('/home/lazewatd/Dropbox/research/ssalsr-maps/ssalsr_zones_collected_controls.yaml', 'r') as f:
    zc = yaml.load(f)

for zone, controls in zc.iteritems():
    for control in controls:
        insert(zone, control)

conn.commit()
conn.close()