#!/usr/bin/env bash
cd $(rospack find contextual_interfaces)/web
PORT=9999
if [[ $1 != __* ]]
then
	PORT=${1:-$PORT}
fi

python -m SimpleHTTPServer $PORT