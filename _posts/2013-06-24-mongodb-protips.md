---
layout: post
title: "MongoDB Protips"
category: MongoDB
tags: [MongoDB, Protips]
---
{% include JB/setup %}

## Backing Up and Restoring MongoDB Data ##
#### Backing Up ####
If you need to backup data from MongoDB you can use the command `mongodump -d [database name] -c [collection name]`. You don't need to specify a collection name and if you don't it will dump the whole database. There are other options that can be useful and you can find them documented in the [MongoDB Docs](http://www.mongodb.org/display/DOCS/Import+Export+Tools).

#### Restoring ####
If you need to restore into MongoDB from a backup you can use the command `mongorestore -d [database name] -c [collection name]/path/to/file/or/folder`. You don't need to specify a collection name and if you don't it will restore all the file(s) into the database with the same collection name as the file name. Again, there are other options that can be useful and you can find them documented in the [MongoDB Docs](http://www.mongodb.org/display/DOCS/Import+Export+Tools).

#### Using DB Fixtures ####
We have some basic fixtures created.  The actual compressed folder is located at [/lib/util/fixtures.tgz](https://github.com/CORTxT/MMC_Linux/blob/dev/lib/util/fixtures.tgz). There is a script that you can use to quickly restore all of your fixtures.  To perform this restore simply type `./lib/util/dbRestore.sh -z` from the application root.

If you want to automatically drop your existing *mmcfixtures* database and restore with a fresh copy you can use the **-d* option like so `/lib/util/dbRestore.sh -d -z` from the application root.