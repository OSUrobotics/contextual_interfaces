function organizeByDevice(controls) {
	var devices = {};
	controls.forEach(function(control) {
		if(!(control.device.deviceId in devices))
			devices[control.device.deviceId] = []; 
		devices[control.device.deviceId].push(control)
	})
	return devices
}

function mergeByType(devices, types) {
	// create pseudodevices for each type (Door, Light, etc)
	groups = {}
	types.forEach(function(type) {
		groups[type] = []
	})
	for(var device in devices) {
		to_remove = []
		for(control_index=0; control_index<devices[device].length; control_index++) {
			control = devices[device][control_index]
			index = types.indexOf(control.name)
			if(index >= 0) {
				type = types[index]
				groups[type].push(control)
				to_remove.push(control_index)
			}
		}
		// remove controls that we've added to a pseudodevice
		to_remove.forEach(function(tr) {
			devices[device].splice(tr, 1)
		})

		// remove any devices which have been made empty
		if(devices[device].length == 0) {
			delete devices[device]
		}
	}
	return groups
}

function mergeMutex(devices, mutex) {
	var groups = []
	mutex.forEach(function(group) { // for each mutex
		var deviceGroup = {}
		group.forEach(function(dev) { // for each device in the mutex
			deviceGroup[dev] = devices[dev]
			delete devices[dev]
		})
		groups.push(deviceGroup)
	})
	return groups
}

function pollPeac(deviceIds, client) {
	deviceIds.forEach(function(deviceId) {
		updateDeviceClient.callService({deviceId: Number(deviceId)}, function(resp) {
			resp.controls.forEach(function(control) {
				// if(Number(deviceId)==1667) {
					controlObj = $('.control[controlId='+control.controlId+']')
					controlObj.trigger('peacUpdate', control.numVal)
				// }
			})
		})
	})
}

// getControlsClient.callService({
// 	zone: 'steves',
// 	which:0
// 	}, function(resp) {
// 		console.log(organizeByDevice(resp.controls))
// 	}
// )