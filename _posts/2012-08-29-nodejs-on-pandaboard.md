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

### References
With a little bit of trial and error and these resources I got it work. **This does not guarantee it will work for you and I take no responsibility if you mess up your panda board**.

* [Tom Gallacher's post](http://blog.tomg.co/post/21322413373/how-to-install-node-js-on-your-raspberry-pi)
* [Cross Compile NodeJS for ARM](http://www.wigwag.com/devblog/cross-compile-node-js-for-arm/)
* [ARM7 Thread on NodeJS Google Group](https://groups.google.com/forum/?fromgroups=#!topic/nodejs/ScReARaD59E)
* [ARCH Linux Repo V8 Package](https://github.com/archlinuxarm/PKGBUILDs/blob/master/community/v8/PKGBUILD)
* [Google Cross Compile V8 for ARM](http://code.google.com/p/v8/wiki/CrossCompilingForARM)