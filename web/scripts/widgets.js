// from http://stackoverflow.com/a/15001634
jQuery.fn.hasOverflown = function () {
   var res;
   var cont = $('<div>'+this.text()+'</div>').css("display", "table")
   .css("z-index", "-1").css("position", "absolute")
   .css("font-family", this.css("font-family"))
   .css("font-size", this.css("font-size"))
   .css("font-weight", this.css("font-weight")).appendTo('body');
   res = (cont.width()>this.width());
   cont.remove();
   return res;
}

var MovementStartTrigger = function(callback, timeout_time) {
    last_move_time = 0
    if(typeof(timeout)==='undefined')
        timeout_time = 5000
    else
        timeout_time = timeout_time
    callback = callback


    $('body').mousemove(function(evt) {
        now = (new Date()).getTime()
        if(now - last_move_time > timeout_time) {
            callback()
        }
        last_move_time = now
    })
    
}
/*
 * Causes the next movement to trigger the 
 * callback regardles of timeout
 */
MovementStartTrigger.prototype.reset = function() {
    last_move_time = 0
}

function debugControlSent(req) {
    stamp = Date.now()
    $('textarea').val($('textarea').val()+'REQ ' +stamp+' '+req.controlId+' -> '+req.numVal+' \n')
    $('textarea').scrollTop($('textarea')[0].scrollHeight)
    return stamp
}

function debugControlResp(resp, stamp) {
    now = Date.now()
    $('textarea').val($('textarea').val()+'RESP ' +now+' '+req.controlId+' -> '+req.numVal+' '+(now-stamp)+'\n')
    $('textarea').scrollTop($('textarea')[0].scrollHeight)

}

$.widget("peac.device", {
    options: {
        container: 'fieldset',
        label: 'legend'
    },
    _create: function() {
        var device = this.options.device;
        // var controls = this.options.controls
        var controls = this._sort_controls(this.options.controls)
        var displayName = device.name
        if(deviceData.hasOwnProperty(device.deviceId) && deviceData[device.deviceId]['displayName'])
            displayName = deviceData[device.deviceId]['displayName']
        var label = $('<'+this.options.label+'>'+displayName+'</'+this.options.label+'>')
        var fs = $('<'+this.options.container+'>').attr('name', device.name)
            .append(label)
        this.options.fs = fs
        this.options.label = label

        this.element
            .append(fs)
            .attr('zone', controls[0].zone)
            .attr('deviceId', device.deviceId)
            .addClass('device')

        var widgets = []
        controls.forEach(function(control) {
            if(!controlData[control.controlId].ignore) {
                widget = controlData[control.controlId]['widget']
                opts = {control: control}
                $.extend(opts, controlData[control.controlId]['options'])
                controlWid = $('<div>')[widget](opts)
                controlWid.appendTo(fs)
                widgets.push(controlWid)
            }
        })
        this.widgets = widgets
        this.fs = fs

        if(
               deviceData.hasOwnProperty(device.deviceId)
            && deviceData[device.deviceId]['indicatorDevice']
            ) {
            indicatorControlId = deviceData[device.deviceId]['indicatorDevice']
            indicatorControl = controlData[indicatorControlId]
            opts = indicatorControl.options
            opts.control = {
                controlId: indicatorControl.controlId,
                device: this.options.device,
                numVal: 0,
                zone: indicatorControl.zone
            }
            opts.textPre = ': '
            indicatorWidget = $('<span>').infoDisplay(opts)
            label.append(indicatorWidget)
        }
    },
    _destroy: function() {
        this.widgets.forEach(function(widget) {
            widget.remove()
        })
        this.fs.remove()
        this.element.removeClass('device')
        this.element.removeAttr('deviceId')
        this.element.removeAttr('zone')
        this._super('destroy')
    },
    _sort_controls: function(controls) {
        var hour = (new Date()).getHours()
        return controls.sort(function(a, b) {
            // a_usage = controlData[a.controlId].usage[zone.name] || 0
            // b_usage = controlData[b.controlId].usage[zone.name] || 0
            // grab time usage here
            // console.log(hour + ", " + a.controlId)
            a_usage = (actuationHours[a.controlId] || {})[hour] || 0
            b_usage = (actuationHours[b.controlId] || {})[hour] || 0
            return b_usage - a_usage
        })
    }
})

$.widget("peac.device_mutex", $.peac.device, {
    _create: function() {
        var devices = this.options.devices;
        if(Object.keys(devices).length == 0) return
        var acc = $('<ul>')
            .addClass('accordion')
        Object.keys(devices).forEach(function(deviceId) {
            $('<li>').accordion_section({
                device: devices[deviceId][0].device,
                controls: devices[deviceId]
            }).appendTo(acc)
        })
        this.element
            .append(acc)
            .attr('zone', devices[Object.keys(devices)[0]][0].zone)
            .addClass('device')
            .addClass('accordion-container')
        total_width = this.element.width()

        tabs = acc.children('li')
        single_tab_width = tabs.width()
        // tab_width = single_tab_width * (tabs.length)
        tab_width = single_tab_width * (tabs.length-1) + 17
        width = total_width - tab_width

        activeItem = acc.children('li:first')
        activeItem.width(width)
        acc.children('li').click(function() {
            $(activeItem).animate({width: single_tab_width}, {duration:300, queue:false});
            $(this).animate({width: width + "px"}, {duration:300, queue:false});
            activeItem = this;
        })
    }
})

$.widget("peac.accordion_section", $.peac.device, {
    options: {
        container: 'div',
        label: 'div'
    },
    _create: function() {
        // this._super('_create')
        var device = this.options.device;
        var controls = this._sort_controls(this.options.controls)

        var label = $('<'+this.options.label+'>'+device.name+'<'+this.options.label+'>')
            .addClass('label')

        var buttons = $('<div>')
            .addClass('buttons')

        var tab = $('<div>')
            .addClass('tab')
            .append(buttons)
            .append(label)

        var fs = $('<'+this.options.container+'>')
            .attr('name', device.name)


        this.element
            .append(tab)
            .attr('zone', controls[0].zone)
            .attr('deviceId', device.deviceId)
            .addClass('device')
            .append(fs)

        for(var i=0; i<controls.length; i++) {
            control = controls[i]
            widget = controlData[control.controlId]['widget']
            opts = {control: control}
            $.extend(opts, controlData[control.controlId]['options'])
            controlWid = $('<div>')[widget](opts)
            if(i<3)
                controlWid.appendTo(buttons)
            else
                controlWid.appendTo(fs)
        }
    }
})

$.widget("peac.elevator", $.peac.device, {
    options: {

    },
    _create: function() {
        this._super('_create')
        this.fs.append('<div/>')
        this.floors = this.options.floors
        this.floors.forEach($.proxy(function(floor) {
            control = controlData[floor]
            control.device = {deviceId: -1}
            opts = {control: control}
            $.extend(opts, controlData[control.controlId]['options'])
            controlWid = $('<div>')[widget](opts)
            controlWid.appendTo(this.fs)
        }, this))
    }
})

$.widget("peac.control", {
    options: {
        numValTransformer: function(numVal) {
            return Number(!Number(numVal))
        },
        alsoUpdate: []
    },
    _create: function() {
        this.ignoreEvents = false
        this.ignoreUpdates = false

        this.element
            .addClass("control")
            .attr('id', 'control-'+this.options.control.controlId)
            .attr('controlId', this.options.control.controlId)
            .on('peacUpdate', $.proxy(this._setNumVal, this))
            .hover($.proxy(this._hover, this))
    },
    addAlsoUpdate: function(obj) {
        this.options.alsoUpdate.push(obj)
    },
    _click_callback: function(evt) {
        var wid = this
        if(false===this.ignoreEvents) {
            var newNumVal = wid.options.numValTransformer(wid.options.control.numVal)

            req = new ROSLIB.ServiceRequest({
                controlId: wid.options.control.controlId,
                numVal: newNumVal
            });
            // var callTime = debugControlSent(req)
            updateControlClient.callService(req, function(resp){
                // debugControlResp(resp, callTime)
                wid.options.control.numVal = resp.control.numVal
                wid.options.alsoUpdate.forEach(function(obj) {
                    $(obj).trigger('peacUpdate', resp.control.numVal)
                })
            });
            actuatedClient.callService(new ROSLIB.ServiceRequest({
                actuation: {
                    control: {
                        controlId: wid.options.control.controlId,
                        numVal: newNumVal,
                        name: wid.options.control.name
                    },
                    device: wid.options.control.device,
                    caption: wid.options.control.name,
                    interface: which_interface
                }
            }), function(resp){

            })
            mst.reset()
        }
        this.ignoreEvents = false
    },
    _setNumVal: function(numVal) {
        // console.log('Not implemented')
    },
    _hover: function() {
        // console.log('deviceId: ' + this.options.control.device.deviceId, 'controlId: ' + this.options.control.controlId, this.options.control.numVal)
        hour = new Date().getHours()
        console.log((actuationHours[this.options.control.controlId] || {})[hour] || 0)
    }

})

$.widget("peac.button", $.peac.control, {
    options: {
        type: "momentary",
        square: true,
    },
    _create: function() {
        this._super('_create')
        var name = this.options.control.name
        if(this.options.hasOwnProperty('display_name')) {
            name = this.options.display_name
        }
        var button = $('<button></button>').html(name)
        if(this.options.type == "toggle") {
            button.jqxToggleButton()
        } else if (this.options.type == "momentary") {
            button.jqxButton()
        }
        this.element
            .append(button)

        if(this.options.square) {
            button.addClass('square')
        }
        this.button = button
        button.click($.proxy(this._click_callback, this))

    },
    _setNumVal: function(event, numVal) {
        event.stopPropagation()
        if(!this.ignoreUpdates) {
            if(this.options.control.numVal != numVal) {
                this.options.control.numVal = numVal
                if(this.options.type=="toggle") {
                    this.ignoreEvents = true
                    if(numVal==0)
                        this.button.jqxToggleButton('unCheck')
                    else
                        this.button.jqxToggleButton('check')                    
                }
            }
        }
    }
})

$.widget("peac.switch", $.peac.control, {
    options: {
        labels: {
            onLabel: 'On',
            offLabel: 'Off'
        }
    },
    _create: function() {
        this._super('_create')
        this.element
            .addClass("control")
            .attr('id', 'control-'+this.options.control.controlId)
            .attr('controlId', this.options.control.controlId)

        var onoff_opts = this.options.onoff;
        var control = this.options.control;
        var button = $('<div>')
            .jqxSwitchButton({
                orientation: 'vertical',
                theme: 'classic',
                width: '100',
                height: '100',
                checked: control.numVal > 0,
                onLabel: this.options.labels.onLabel,
                offLabel: this.options.labels.offLabel,
            })
            .on('change', $.proxy(this._click_callback, this))

        this.element
            .append('<h2>'+this.options.control.device.name+'</h2>')
            .addClass('horizontal-button')
            // .addClass("control")
            .append(button)
            // .on('peacUpdate', $.proxy(this._setNumVal, this))
            // .attr('controlId', this.options.control.controlId)

        this.button = button
    },
    _setNumVal: function(event, numVal) {
        event.stopPropagation()
        if(!this.ignoreUpdates) {
            if(this.options.control.numVal != numVal) {
                this.ignoreEvents = true
                this.options.control.numVal = numVal
                if(numVal==0)
                    $(this.button).jqxSwitchButton('uncheck')
                else if(numVal > 0)
                    $(this.button).jqxSwitchButton('check')
            }
        }
    }
})

$.widget("peac.infoDisplay", $.peac.control, {
    options: {
        textPre: '',
        textPost: ''
    },
    _create: function() {
        this._super('_create')
        this.element
            .text(this._makeText(this.options.control.numVal))
            .addClass('infoDisplay')
    },
    _makeText: function(text) {
        if(this.options.hasOwnProperty('values')) {
            text = this.options.values[text]
        }
        return this.options.textPre + text + this.options.textPost
    },
    _setNumVal: function(event, numVal) {
        event.stopPropagation()
        if(this.options.control.numVal != numVal) {
            this.options.control.numVal = numVal
            this.element.text(this._makeText(numVal))
        }
    }

})

$.widget("peac.numericRocker", $.peac.control, {
    options: {
        textPre: '',
        textPost: '',
        orientation: 'horizontal',
        buttonPrefix: '',
        hideName: false
    },
    _create: function() {
        this._super('_create')

        var name = this.options.control.name
        if(this.options.hasOwnProperty('display_name')) {
            name = this.options.display_name
        }

        var label = $('<div>')
            .addClass('label')
            .text(name)

        var valueDisplay = $('<div>').infoDisplay(this.options)

        if(this.options.buttonPrefix)
            this.options.buttonPrefix += ' '

        var incrButton = $('<div>').button({
            control: this.options.control,
            display_name: this.options.buttonPrefix + '<span class="symbol">&#9650;</span>',
            numValTransformer: function(numVal) {
                return Number(numVal) + 1
            },
            alsoUpdate: [valueDisplay]
        })

        var decrButton = $('<div>').button({
            control: this.options.control,
            display_name: this.options.buttonPrefix + '<span class="symbol">&#9660;</span>',
            numValTransformer: function(numVal) {
                return Number(numVal) - 1
            },
            alsoUpdate: [valueDisplay]
        })

        incrButton.button('addAlsoUpdate', decrButton)
        decrButton.button('addAlsoUpdate', incrButton)


        if(!this.options.hideName)
            this.element.append(label)
        this.element
            .append(incrButton)
            .append(valueDisplay)
            .append(decrButton)
            .addClass('rocker')
    }
})

$.widget("peac.buttonGroup", $.peac.control, {
    _create: function() {
        this._super('_create')
        var name = this.options.control.name
        if(this.options.hasOwnProperty('display_name')) {
            name = this.options.display_name
        }

        var label = $('<div>')
            .addClass('label')
            .text(name)
        this.label = label

        this.element
            .addClass('buttongroup')
            .append(label)

        this.values = {}
        this.buttonGroup = $('<div>')
        this.options.values.forEach($.proxy(function(value) {
            var button = $('<button>')
                .text(value.caption)
                this.values[value.caption] = value.value
            this.buttonGroup.append(button)
        }, this))

        this.buttonGroup
            .jqxButtonGroup({mode: 'radio'})
            .on('buttonclick', $.proxy(this._buttonclickCallback, this))

        this.element
            .append(this.buttonGroup)
            .find('.jqx-button')
            .addClass('control')
            // .width('1em')
            .height('1em')
        this.buttonGroup.jqxButtonGroup('setSelection', Number(this.options.control.numVal)-1)
        this._showIndicator()
    },
    _buttonclickCallback: function(event) {
        if(!this.ignoreEvents) {
            var newNumVal = Number(this.values[event.args.button.text()])
            req = new ROSLIB.ServiceRequest({
                controlId: this.options.control.controlId,
                numVal: newNumVal
            });
            
            updateControlClient.callService(req, $.proxy(function(resp){
                this.options.control.numVal = resp.control.numVal
            }, this));
            actuatedClient.callService(new ROSLIB.ServiceRequest({
                actuation: {
                    control: {
                        controlId: this.options.control.controlId,
                        numVal: newNumVal,
                        name: this.options.control.name
                    },
                    device: this.options.control.device,
                    caption: this.options.control.name,
                    interface: which_interface
                }
            }), function(resp){
                
            })
            mst.reset()
            this.ignoreEvents = false
        }
    },
    _setNumVal: function(event, numVal) {
        event.stopPropagation()
        if(this.options.control.numVal != numVal) {
            this.options.control.numVal = numVal
            this.buttonGroup.jqxButtonGroup('setSelection', Number(numVal)-1)
        }

    },
    _showIndicator: function() {
        if(this.options.indicator !== undefined) {
            indicatorControl = controlData[this.options.indicator]
            opts = indicatorControl.options
            opts.control = {
                controlId: indicatorControl.controlId,
                device: this.options.device,
                numVal: 0,
                zone: indicatorControl.zone
            }
            opts.textPre = ' ('
            opts.textPost = ')'
            indicatorWidget = $('<span>').infoDisplay(opts)
            this.label.append(indicatorWidget)
        }
    }
})
