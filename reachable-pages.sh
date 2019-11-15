#!/usr/bin/env bash

IFS=$'\n' read -d '' -r -a PAGES < alexa-500.csv

for i in "${!PAGES[@]}"
do
	domain="${PAGES[$i]}"
	ping=$(ping -c 3 $domain | grep time | awk 'BEGIN {FS="[=]|[ ]"} { sum=sum+$10 } END { avg=sum/NR; printf "%f", avg }')
	slow=$(echo "${ping} >= 200" | bc -l)
	fast=$(echo "${ping} <= 200" | bc -l)
	pingable=$(echo "${ping} > 0" | bc -l)
	if (( $fast )); then
		echo "$domain ok at $ping"
		# echo $domain >> temp.csv
	else
		echo "$domain is slow at $ping ms"
	fi
done