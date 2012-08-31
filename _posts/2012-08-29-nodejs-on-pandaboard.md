---
layout: post
title: "NodeJS on Pandaboard"
category:
tags: ['NodeJS', 'Pandaboard', 'ARM']
---
{% include JB/setup %}

# NodeJS on Pandaboard ES Running Ubuntu 12.04LTS

## Follow these steps to success

1. `sudo apt-get update`
2. `sudo apt-get install git-core curl build-essential openssl libssl-dev python libcurl4-openssl-dev`
3. [Download NodeJS 0.8.x](http://nodejs.org)
4. `tar -xvf node-v0.8.x.tar.gz`
5. `cd node-0.8.x`
6. `vi deps/v8/build/common.gypi`

    * Edit the variables object right at the top and add:

          'armv7%':'1',
          'arm_neon%':'1',

7. `vi deps/v8/SConstruct`

    * Make sure the code on line 82 & 83 matches this:

          'all': {
             'CCFLAGS':      ['$DIALECTFLAGS', '$WARNINGFLAGS', '-march=armv7'],
             'CXXFLAGS':     ['-fno-rtti', '-fno-exceptions', '-march=armv7'],
           },

8. `./configure --dest-cpu=arm`
10. `make`
11. `make install`

## Benchmark

I ran the included NodeJS benchmarks using `make bench`.

### Hardware

The specs for the Pandaboard ES are:

* Dual-core ARM Cortex A9 Processor with speed up to 1.2 Ghz per core.
* 1 Gig of low-power DDR2 RAM
* 32 Gig Class 10+ SD card
* Onboard 10/100 Ethernet

### Results
CPU pretty much ran at 100% but memory stayed around ~3.7%. Overall the results were pretty decent.

#### ab-hello-world-buffer-1024
    This is ApacheBench, Version 2.3 <$Revision: 655654 $>
    Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
    Licensed to The Apache Software Foundation, http://www.apache.org/

    Benchmarking 127.0.0.1 (be patient)


    Server Software:
    Server Hostname:        127.0.0.1
    Server Port:            8000

    Document Path:          /buffer/1024
    Document Length:        1024 bytes

    Concurrency Level:      100
    Time taken for tests:   10.002 seconds
    Complete requests:      8964
    Failed requests:        0
    Write errors:           0
    Total transferred:      10281708 bytes
    HTML transferred:       9179136 bytes
    Requests per second:    896.21 [#/sec] (mean)
    Time per request:       111.581 [ms] (mean)
    Time per request:       1.116 [ms] (mean, across all concurrent requests)
    Transfer rate:          1003.86 [Kbytes/sec] received

    Connection Times (ms)
                  min  mean[+/-sd] median   max
    Connect:        0    1   3.7      0      39
    Processing:    11  110  61.1    107     297
    Waiting:        9  110  61.1    106     297
    Total:         12  111  61.2    107     298

    Percentage of the requests served within a certain time (ms)
      50%    107
      66%    139
      75%    156
      80%    166
      90%    192
      95%    218
      98%    242
      99%    257
     100%    298 (longest request)

#### ab-hello-world-buffer-102400
    This is ApacheBench, Version 2.3 <$Revision: 655654 $>
    Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
    Licensed to The Apache Software Foundation, http://www.apache.org/

    Benchmarking 127.0.0.1 (be patient)


    Server Software:
    Server Hostname:        127.0.0.1
    Server Port:            8000

    Document Path:          /buffer/102400
    Document Length:        102400 bytes

    Concurrency Level:      100
    Time taken for tests:   10.000 seconds
    Complete requests:      5767
    Failed requests:        0
    Write errors:           0
    Total transferred:      591261675 bytes
    HTML transferred:       590540800 bytes
    Requests per second:    576.69 [#/sec] (mean)
    Time per request:       173.402 [ms] (mean)
    Time per request:       1.734 [ms] (mean, across all concurrent requests)
    Transfer rate:          57739.69 [Kbytes/sec] received

    Connection Times (ms)
                  min  mean[+/-sd] median   max
    Connect:        0    1   8.7      0     102
    Processing:     8  169  93.2    166     406
    Waiting:        4  167  92.9    163     405
    Total:          8  171  93.4    167     407

    Percentage of the requests served within a certain time (ms)
      50%    167
      66%    219
      75%    247
      80%    263
      90%    295
      95%    318
      98%    350
      99%    367
     100%    407 (longest request)

#### ab-hello-world-string-1024
    This is ApacheBench, Version 2.3 <$Revision: 655654 $>
    Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
    Licensed to The Apache Software Foundation, http://www.apache.org/

    Benchmarking 127.0.0.1 (be patient)


    Server Software:
    Server Hostname:        127.0.0.1
    Server Port:            8000

    Document Path:          /bytes/1024
    Document Length:        1024 bytes

    Concurrency Level:      100
    Time taken for tests:   10.000 seconds
    Complete requests:      9028
    Failed requests:        0
    Write errors:           0
    Total transferred:      10355116 bytes
    HTML transferred:       9244672 bytes
    Requests per second:    902.77 [#/sec] (mean)
    Time per request:       110.770 [ms] (mean)
    Time per request:       1.108 [ms] (mean, across all concurrent requests)
    Transfer rate:          1011.21 [Kbytes/sec] received

    Connection Times (ms)
                  min  mean[+/-sd] median   max
    Connect:        0    1   4.2      0      53
    Processing:     1  109  58.8    107     314
    Waiting:        1  108  58.7    106     313
    Total:          4  109  59.2    107     314

    Percentage of the requests served within a certain time (ms)
      50%    107
      66%    138
      75%    155
      80%    165
      90%    188
      95%    207
      98%    230
      99%    249
     100%    314 (longest request)

#### ab-hello-world-buffer-102400
    This is ApacheBench, Version 2.3 <$Revision: 655654 $>
    Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
    Licensed to The Apache Software Foundation, http://www.apache.org/

    Benchmarking 127.0.0.1 (be patient)


    Server Software:
    Server Hostname:        127.0.0.1
    Server Port:            8000

    Document Path:          /bytes/102400
    Document Length:        102400 bytes

    Concurrency Level:      100
    Time taken for tests:   10.002 seconds
    Complete requests:      771
    Failed requests:        0
    Write errors:           0
    Total transferred:      79046775 bytes
    HTML transferred:       78950400 bytes
    Requests per second:    77.09 [#/sec] (mean)
    Time per request:       1297.237 [ms] (mean)
    Time per request:       12.972 [ms] (mean, across all concurrent requests)
    Transfer rate:          7718.10 [Kbytes/sec] received

    Connection Times (ms)
                  min  mean[+/-sd] median   max
    Connect:        0    5  13.2      0      48
    Processing:    23 1172 706.4   1113    2577
    Waiting:       22 1171 706.2   1113    2576
    Total:         23 1177 703.8   1126    2578

    Percentage of the requests served within a certain time (ms)
      50%   1122
      66%   1489
      75%   1740
      80%   1892
      90%   2210
      95%   2381
      98%   2482
      99%   2531
     100%   2578 (longest request)

### References
With a little bit of trial and error and these resources I got it work. **This does not guarantee it will work for you and I take no responsibility if you mess up your panda board**. Also same process goes for getting to run on [ArchLinux Arm for Pandaboard](http://archlinuxarm.org/platforms/armv7/pandaboard).

* [Tom Gallacher's post](http://blog.tomg.co/post/21322413373/how-to-install-node-js-on-your-raspberry-pi)
* [Cross Compile NodeJS for ARM](http://www.wigwag.com/devblog/cross-compile-node-js-for-arm/)
* [ARM7 Thread on NodeJS Google Group](https://groups.google.com/forum/?fromgroups=#!topic/nodejs/ScReARaD59E)
* [ARCH Linux Repo V8 Package](https://github.com/archlinuxarm/PKGBUILDs/blob/master/community/v8/PKGBUILD)
* [Google Cross Compile V8 for ARM](http://code.google.com/p/v8/wiki/CrossCompilingForARM)
* [NodeJS 0.8 on SBC Fox Board](http://www.yoovant.com/how-install-node-js-0-8-arm-based-sbc-fox-board-g20/)