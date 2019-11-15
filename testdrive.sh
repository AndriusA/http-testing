#!/usr/bin/env bash

tests=( 
"synthetic-large"
"synthetic-small"
"synthetic-medium"
"image-extra-large-1"
"image-large-1"
"image-medium-1"
"image-small-1"
"image-extra-small-1"
"image-extra-large-6"
"image-large-6"
"image-medium-6"
"image-small-6"
"image-extra-small-6"
"image-extra-large-48"
"image-large-48"
"image-medium-48"
"image-small-48"
"image-extra-small-48"
"image-extra-large-96"
"image-large-96"
"image-medium-96"
"image-small-96"
"image-extra-small-96"
"image-extra-large-192"
"image-large-192"
"image-medium-192"
"image-small-192"
"image-extra-small-192"
"fonts-1"
"fonts-2"
"fonts-4"
"fonts-6"
"fonts-8"
"fonts-10"
"fonts-12"
"fonts-14"
"fonts-16"
"jslibs-1"
"jslibs-2"
"jslibs-4"
"jslibs-8"
"jslibs-12"
"jslibs-14"
"jslibs-20"
"jslibs-25"
"scripts-1"
"scripts-10"
"scripts-20"
"scripts-40"
"scripts-60"
"scripts-80"
"jslibs-1-deferred"
"jslibs-2-deferred"
"jslibs-4-deferred"
"jslibs-8-deferred"
"jslibs-12-deferred"
"jslibs-14-deferred"
"jslibs-20-deferred"
"jslibs-25-deferred"
)

repetitions=3

for test in "${tests[@]}"
do

  for network in LTE DSL 3G LOSSYFAST LOSSYSLOW
  do

      for iteration in $(seq $repetitions)
      do
          ./test.sh https://h2test.smart-e.org/$test http1 $network $test $iteration
          ./test.sh https://h2test.smart-e.org/$test http2 $network $test $iteration
      done

  done

done
