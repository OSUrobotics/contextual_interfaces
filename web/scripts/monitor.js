var heartbeatInit = false;
var lastHeartbeat;
var heartbeatInterval;

function updateHeartbeat(msg) {
    heartbeatInit = true
    lastHeartbeat = (new Date()).getTime()
}

function checkHeartbeat() {
    now = (new Date()).getTime()
    if(heartbeatInit && ((now - lastHeartbeat) > 18000)) {
        doReload = confirm('The page lost one of its connections and needs to reload.\
            \nClick OK to reload now, or cancel to ignore (please reload yourself when you\'re ready)')
        if(doReload) {
            location.reload()
        } else {
            clearInterval(heartbeatInterval)
        }
    }
}

function heartbeatListen(ros) {
    var heartbeatListener = new ROSLIB.Topic({
        ros: ros,
        name: '/heartbeat',
        messageType: 'std_msgs/Time'
    });
    heartbeatListener.subscribe(updateHeartbeat)

    heartbeatInterval = setInterval(checkHeartbeat, 5000)
}