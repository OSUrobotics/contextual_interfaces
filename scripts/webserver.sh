#!/usr/bin/env bash
export INTERFACE_PKG_PATH=$(rospack find contextual_interfaces)
export WEB_ROOT=$INTERFACE_PKG_PATH/web
export PID_FILE=$INTERFACE_PKG_PATH/lighttpd.pid
export ERR_LOG=$INTERFACE_PKG_PATH/lighttpd-error.log
export WEB_PORT=9999
if [[ $1 != __* ]]
then
	export WEB_PORT=${1:-$WEB_PORT}
fi
lighttpd -D -f /etc/lighttpd/lighttpd.conf
