
## Some key stats from HTTParchive.org

Numbers based on HTTPArchive data on 01/10/2019

Mobile: 
- Median transfer size: 1752.0KB (p10: 313.38, p90: 6273.07)
- Total requests: 69 (p10: 22, p90: 167)
- TCP connections: 16 (p10: 6, p90: 43)
- Image bytes: 890.93KB (p10: 59.05KB, p90: 4783.61KB)
- Image requests: 27 (7 - 78)
- css bytes: 58.33KB (p10: 7.61KB, p90: 237.99KB)
- css reqs: 6.0 (p10: 2.0, p90: 21.0)
- font bytes: 97.28KB (p10: 21.04KB, p90: 282.8KB)
- font reqs: 4.0 (p10: 1.0, p90: 9.0)
- js bytes: 378.56KB (p10: 84.39KB, p90: 1099.13KB)
- js reqs: 19.0 (p10: 5.0, p90: 52.0)



Desktop: 
- Median transfer size: 1950.42KB (p10: 401.07, p90: 6999.75)
- Total requests: 74 (p10: 24, p90: 179)
- TCP connections: 14 (p10: 6, p90: 37)
- Image bytes: 982.28KB (p10: 78.57KB, p90: 5260.53KB)
- Image requests: 30 (7 - 90)
- css bytes: 63.24KB (p10: 10.71KB, p90: 243.55KB)
- css reqs: 7.0 (p10: 2.0, p90: 21.0)
- font bytes: 121.74KB (p10: 30.81KB, p90: 336.79KB)
- font reqs: 4.0 (p10: 1.0, p90: 10.0)
- js bytes: 412.59KB (p10: 96.2KB, p90: 1180.64KB)
- js reqs: 20.0 (p10: 5.0, p90: 54.0)


Popular JS libraries and frameworks from [the Web Alamanac](https://almanac.httparchive.org/en/2019/javascript#open-source-libraries-and-frameworks).

Popular fonts from [Google Fonts](https://fonts.google.com).

Popular scripts from HTTPArchive, extracted directly from the full dataset (counts full URLs, so would generally count libraries included from reused third-party sources as popular only):

```SQL
SELECT url, count(distinct(pageid)) as popularity
FROM `httparchive.summary_requests.2019_10_01_mobile`
WHERE `type`='script'
GROUP BY url
ORDER BY popularity DESC
```

