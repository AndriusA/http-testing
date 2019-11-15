#!/usr/bin/env bash

url=$1
http=$2
NETWORK=$3
ID=$4
iteration=$5

sudo -v

pfctl_path="./conf/pfctl.rules"
chrome_flags=""

if [[ $http == "http1" ]]; then
    chrome_flags="--disable-http2"
elif [[ $http == "http3" ]]; then
	chrome_flags="--quic-version=h3-23 --enable-quic"
fi

args=(
	$url
  	--preset perf
	--output json
	--output-path lighthouse-http/$ID-$http-$NETWORK-$iteration.perf.json --save-assets
	--emulated-form-factor desktop
	--throttling-method provided
	--quiet
)

throttle_stop () {
	sudo dnctl -q flush
	sudo dnctl -q pipe flush
	sudo pfctl -f /etc/pf.conf > /dev/null 2>&1
	sudo pfctl -q -E > /dev/null 2>&1
	sudo pfctl -q -d
}

throttle_start () {
	uplink=$1
	downlink=$2
	delay=$3
	loss=$4

	sudo dnctl -q flush
	sudo dnctl -q pipe flush
	sudo dnctl -q pipe 1 config delay 0ms noerror
	sudo dnctl -q pipe 2 config delay 0ms noerror
	sudo pfctl -f ${pfctl_path} > /dev/null 2>&1
	sudo dnctl -q pipe 1 config bw $uplink delay $delay plr $loss noerror
	sudo dnctl -q pipe 2 config bw $downlink delay $delay plr $loss noerror
	sudo pfctl -E > /dev/null 2>&1
}

# packetspre=$(sudo netstat -s -p tcp | grep "packets sent" | awk 'NR==1{print $1}')
# retranspre=$(sudo netstat -s -p tcp | grep "retransmitted" | awk 'NR==1{print $1}')

echo "Throttling network connection..."

case $NETWORK in
	3G )
		throttle_start 780Kbit/s 330Kbit/s 100ms 0
		;;
	DSL )
		throttle_start 2Mbit/s 256Kbit/s 5ms 0
		;;
	LTE )
		throttle_start 50Mbit/s 10Mbit/s 50ms 0
		;;
	EDGE )
		throttle_start 240Kbit/s 200Kbit/s 400ms 0
		;;
	LOSSYFAST )
		throttle_start 50Mbit/s 10Mbit/s 50ms 0.1
		;;
	LOSSYSLOW )
		throttle_start 1Mbit/s 1Mbit/s 50ms 0.1
		;;
	VERYLOSSY )
		throttle_start 50Mbit/s 10Mbit/s 50ms 0.2
		;;
esac

echo "Measuring..."
lighthouse "${args[@]}" --chrome-flags="$chrome_flags"

echo "Restoring network connection..."
throttle_stop

# packetspost=$(sudo netstat -s -p tcp -f inet | grep "packets sent" | awk 'NR==1{print $1}')
# retranspost=$(sudo netstat -s -p tcp -f inet | grep "retransmitted" | awk 'NR==1{print $1}')

# echo "retransmit rate ($retranspost - $retranspre)/($packetspost - $packetspre)"
# bc <<< "scale=4; ($retranspost - $retranspre)/($packetspost - $packetspre)"
