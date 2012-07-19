---
layout: post
title: "OSX Lion and PHP"
category: LAMP
tags: [LAMP, OS X, PHP, MySQL]
---
{% include JB/setup %}

Prior to upgrading to OS X Lion when I was kinda meesing around with wordpress I was using [MAMP](http://www.mamp.info/en/index.html). However, now that I have to come back to PHP (Post Lion Upgrade) the latest version of MAMP was throwing weird errors when importing scripts and creating tables and was having issues connecting to my local MySQL database.

After much frustration I opted to move to a non-MAMP setup. It is much more involved to setup but was a great learning experience and a refresher for how all these pieces fit together. I scoured the internet and compiled all the different steps right here.

1. Change the Apache config. `/private/etc/apache2/httpd.conf` which is an alias for `/etc/apache2/httpd.conf`
2. Get [MySQL without MAMP](http://brettu.com/education-wordpress-development-environment-setup-without-mamp-on-osx-lion/)
3. Restart your computer
4. Turn on MySQL through the preference pane if you didn't already have it checked to turn on on startup by default.
5. Get [Sequel Pro](http://www.sequelpro.com/)
    - **Note** In order to log in to MySQL for the first time your username should be `root` and there is no password.
6. Install [PHPMyAdmin](http://www.djangoapp.com/blog/2011/07/24/installing-phpmyadmin-on-mac-os-x-lion/)
7. [XDebug on OSX](http://johnmclaughlin.info/blog/getting-php-xdebug-working-again-on-mac-os-x-10-7-lion/)
8. [Sublime Text 2 - XDebug](https://github.com/Kindari/SublimeXdebug)
    - **Note** You need to create a `.sublime-project` file and then put in the project URL for x-debug to look at. Like [here](https://github.com/Kindari/SublimeXdebug#session-based-debugging).