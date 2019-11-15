#!/usr/bin/env bash

IFS=$'\n' read -d '' -r -a PAGES < alexa-fast.csv

repetitions=3

for i in "${!PAGES[@]}"
do
  test="${PAGES[$i]}"

  for network in LTE DSL 3G LOSSYFAST LOSSYSLOW
  do

      for iteration in $(seq $repetitions)
      do
          ./test.sh https://$test http1 $network $test $iteration
          ./test.sh https://$test http2 $network $test $iteration
      done

  done

done
