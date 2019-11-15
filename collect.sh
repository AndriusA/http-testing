#!/usr/bin/env bash

for test in "${tests[@]}"
do

    for network in LTE DSL 3G LOSSYFAST LOSSYSLOW
    do

        for http in http1 http2
        do

            for iteration in $(seq $repetitions)
            do

                lighthouseperf="lighthouse-http/$test-$http-$network-$iteration.perf.json"
                devtoolslog="lighthouse-http/$test-$http-$network-$iteration.perf-0.devtoolslog.json"

                if [[ -f "$lighthouseperf" ]] && [[ -f "$devtoolslog" ]]; then


                    (jq -c "select(has(\"requestedUrl\")) | {
                        http: \"$http\",
                        network: \"$network\",
                        test: \"$test\",
                        url: .requestedUrl,
                        timestamp: .fetchTime,
                        speedIndex: .audits .metrics .details .items[0] .speedIndex,
                        firstPaint: .audits .metrics .details .items[0] .observedFirstPaint,
                        loadEvent: .audits .metrics .details .items[0] .observedLoad,
                        fullyLoaded: ((.audits .\"network-requests\" .details .items | map(.startTime) | max) - (.audits .\"network-requests\" .details .items | map(.startTime) | min)) | round,
                        size: .audits .\"network-requests\" .details .items | map(.transferSize) | add,
                    }" $lighthouseperf &&

                    jq -c '{
                        connections: map(select(.method == "Network.responseReceived")) | 
                            map(.params.response.connectionId)|
                            unique | length
                        }' $devtoolslog
                    ) | jq -n -c '[inputs] | add'

                fi

            done

        done
    done

done | json2csv --ndjson -o httpcomparison.csv
